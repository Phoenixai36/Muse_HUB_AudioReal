import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { 
  insertUserSchema, 
  insertMusicShareSchema, 
  insertCommentSchema, 
  insertLikeSchema, 
  insertFollowerSchema 
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

interface Client {
  id: string;
  userId?: number;
  socket: WebSocket;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for authentication
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedUser = insertUserSchema
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        })
        .parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedUser.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Remove confirmPassword before storing
      const { confirmPassword, ...userToCreate } = validatedUser;
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(userToCreate.password, 10);
      const newUser = await storage.createUser({
        ...userToCreate,
        password: hashedPassword
      });
      
      // Don't return the password
      const { password, ...userWithoutPassword } = newUser;
      
      // Initialize default music services for the user
      await Promise.all([
        storage.createMusicService({ userId: newUser.id, service: "spotify", isConnected: false }),
        storage.createMusicService({ userId: newUser.id, service: "apple_music", isConnected: false }),
        storage.createMusicService({ userId: newUser.id, service: "youtube_music", isConnected: false })
      ]);
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string(),
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // API routes for music services
  app.get("/api/music-services/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const services = await storage.getMusicServices(userId);
      return res.json(services);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get music services" });
    }
  });
  
  app.put("/api/music-services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const { isConnected } = z.object({
        isConnected: z.boolean(),
      }).parse(req.body);
      
      const updatedService = await storage.updateMusicService(id, isConnected);
      if (!updatedService) {
        return res.status(404).json({ message: "Music service not found" });
      }
      
      return res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update music service" });
    }
  });
  
  // API routes for followers
  app.get("/api/followers/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const followers = await storage.getFollowers(userId);
      return res.json(followers);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get followers" });
    }
  });
  
  app.get("/api/following/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const following = await storage.getFollowing(userId);
      return res.json(following);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get following" });
    }
  });
  
  app.post("/api/follow", async (req, res) => {
    try {
      const validatedFollower = insertFollowerSchema.parse(req.body);
      
      // Check if already following
      const isAlreadyFollowing = await storage.isFollowing(
        validatedFollower.followerId,
        validatedFollower.followingId
      );
      
      if (isAlreadyFollowing) {
        return res.status(400).json({ message: "Already following this user" });
      }
      
      const follower = await storage.followUser(validatedFollower);
      
      // Create notification
      const followerUser = await storage.getUser(validatedFollower.followerId);
      if (followerUser) {
        await storage.createNotification({
          userId: validatedFollower.followingId,
          type: "follow",
          content: `${followerUser.displayName} started following you`,
          sourceId: follower.id,
          sourceUserId: validatedFollower.followerId
        });
        
        // Broadcast notification to WebSocket clients
        broadcastToUser(validatedFollower.followingId, {
          type: "NOTIFICATION",
          payload: {
            type: "follow",
            content: `${followerUser.displayName} started following you`,
            sourceUserId: validatedFollower.followerId
          }
        });
      }
      
      return res.status(201).json(follower);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to follow user" });
    }
  });
  
  app.delete("/api/follow/:followerId/:followingId", async (req, res) => {
    try {
      const followerId = parseInt(req.params.followerId);
      const followingId = parseInt(req.params.followingId);
      
      if (isNaN(followerId) || isNaN(followingId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }
      
      const result = await storage.unfollowUser(followerId, followingId);
      if (!result) {
        return res.status(404).json({ message: "Follow relationship not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to unfollow user" });
    }
  });
  
  // API routes for music shares
  app.get("/api/music-shares", async (req, res) => {
    try {
      const shares = await storage.getMusicShares();
      return res.json(shares);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get music shares" });
    }
  });
  
  app.get("/api/music-shares/feed/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const shares = await storage.getFeedMusicShares(userId);
      return res.json(shares);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get feed" });
    }
  });
  
  app.get("/api/music-shares/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const shares = await storage.getUserMusicShares(userId);
      return res.json(shares);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user's music shares" });
    }
  });
  
  app.get("/api/music-shares/prompt/:promptId", async (req, res) => {
    try {
      const promptId = parseInt(req.params.promptId);
      if (isNaN(promptId)) {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }
      
      const shares = await storage.getPromptMusicShares(promptId);
      return res.json(shares);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get prompt music shares" });
    }
  });
  
  app.post("/api/music-shares", async (req, res) => {
    try {
      const validatedShare = insertMusicShareSchema.parse(req.body);
      
      const musicShare = await storage.createMusicShare(validatedShare);
      
      // Notify followers
      const followers = await storage.getFollowers(validatedShare.userId);
      const user = await storage.getUser(validatedShare.userId);
      
      if (user) {
        for (const follower of followers) {
          await storage.createNotification({
            userId: follower.id,
            type: "music_share",
            content: `${user.displayName} shared a new track`,
            sourceId: musicShare.id,
            sourceUserId: user.id
          });
          
          // Broadcast to WebSocket clients
          broadcastToUser(follower.id, {
            type: "NOTIFICATION",
            payload: {
              type: "music_share",
              content: `${user.displayName} shared a new track`,
              sourceId: musicShare.id,
              sourceUserId: user.id
            }
          });
        }
      }
      
      return res.status(201).json(musicShare);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create music share" });
    }
  });
  
  // API routes for comments
  app.get("/api/comments/:musicShareId", async (req, res) => {
    try {
      const musicShareId = parseInt(req.params.musicShareId);
      if (isNaN(musicShareId)) {
        return res.status(400).json({ message: "Invalid music share ID" });
      }
      
      const comments = await storage.getComments(musicShareId);
      return res.json(comments);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get comments" });
    }
  });
  
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedComment = insertCommentSchema.parse(req.body);
      
      const comment = await storage.createComment(validatedComment);
      
      // Create notification for the music share owner
      const musicShare = await storage.getMusicShare(validatedComment.musicShareId);
      const commenter = await storage.getUser(validatedComment.userId);
      
      if (musicShare && commenter && musicShare.userId !== validatedComment.userId) {
        await storage.createNotification({
          userId: musicShare.userId,
          type: "comment",
          content: `${commenter.displayName} commented on your music share`,
          sourceId: comment.id,
          sourceUserId: commenter.id
        });
        
        // Broadcast to WebSocket clients
        broadcastToUser(musicShare.userId, {
          type: "NOTIFICATION",
          payload: {
            type: "comment",
            content: `${commenter.displayName} commented on your music share`,
            sourceId: comment.id,
            sourceUserId: commenter.id
          }
        });
      }
      
      return res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create comment" });
    }
  });
  
  // API routes for likes
  app.get("/api/likes/:musicShareId", async (req, res) => {
    try {
      const musicShareId = parseInt(req.params.musicShareId);
      if (isNaN(musicShareId)) {
        return res.status(400).json({ message: "Invalid music share ID" });
      }
      
      const likes = await storage.getLikes(musicShareId);
      return res.json(likes);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get likes" });
    }
  });
  
  app.post("/api/likes", async (req, res) => {
    try {
      const validatedLike = insertLikeSchema.parse(req.body);
      
      // Check if already liked
      const existingLike = await storage.getLike(
        validatedLike.musicShareId,
        validatedLike.userId
      );
      
      if (existingLike) {
        return res.status(400).json({ message: "Already liked this music share" });
      }
      
      const like = await storage.createLike(validatedLike);
      
      // Create notification for the music share owner
      const musicShare = await storage.getMusicShare(validatedLike.musicShareId);
      const liker = await storage.getUser(validatedLike.userId);
      
      if (musicShare && liker && musicShare.userId !== validatedLike.userId) {
        await storage.createNotification({
          userId: musicShare.userId,
          type: "like",
          content: `${liker.displayName} liked your music share`,
          sourceId: like.id,
          sourceUserId: liker.id
        });
        
        // Broadcast to WebSocket clients
        broadcastToUser(musicShare.userId, {
          type: "NOTIFICATION",
          payload: {
            type: "like",
            content: `${liker.displayName} liked your music share`,
            sourceId: like.id,
            sourceUserId: liker.id
          }
        });
      }
      
      return res.status(201).json(like);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create like" });
    }
  });
  
  app.delete("/api/likes/:musicShareId/:userId", async (req, res) => {
    try {
      const musicShareId = parseInt(req.params.musicShareId);
      const userId = parseInt(req.params.userId);
      
      if (isNaN(musicShareId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }
      
      const result = await storage.deleteLike(musicShareId, userId);
      if (!result) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to remove like" });
    }
  });
  
  // API routes for daily prompts
  app.get("/api/daily-prompts", async (req, res) => {
    try {
      const prompts = await storage.getDailyPrompts();
      return res.json(prompts);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get daily prompts" });
    }
  });
  
  app.get("/api/daily-prompts/active", async (req, res) => {
    try {
      const prompt = await storage.getActiveDailyPrompt();
      if (!prompt) {
        return res.status(404).json({ message: "No active daily prompt" });
      }
      
      return res.json(prompt);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get active daily prompt" });
    }
  });
  
  // API routes for notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const notifications = await storage.getNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get notifications" });
    }
  });
  
  app.get("/api/notifications/unread/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const notifications = await storage.getUnreadNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get unread notifications" });
    }
  });
  
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.json(notification);
    } catch (error) {
      return res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.put("/api/notifications/read-all/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      await storage.markAllNotificationsAsRead(userId);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  
  // API routes for users
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const clients: Map<string, Client> = new Map();
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (socket) => {
    const clientId = randomUUID();
    clients.set(clientId, { id: clientId, socket });
    
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'AUTH' && data.userId) {
          const userId = parseInt(data.userId);
          if (!isNaN(userId)) {
            const client = clients.get(clientId);
            if (client) {
              clients.set(clientId, { ...client, userId });
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    socket.on('close', () => {
      clients.delete(clientId);
    });
  });
  
  // Function to broadcast messages to specific users
  function broadcastToUser(userId: number, data: any) {
    for (const client of clients.values()) {
      if (client.userId === userId && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(data));
      }
    }
  }
  
  // Function to broadcast messages to all connected clients
  function broadcastToAll(data: any) {
    for (const client of clients.values()) {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(data));
      }
    }
  }

  return httpServer;
}
