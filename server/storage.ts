import {
  users,
  musicServices,
  followers,
  musicShares,
  comments,
  likes,
  dailyPrompts,
  notifications,
  type User,
  type InsertUser,
  type MusicService,
  type InsertMusicService,
  type Follower,
  type InsertFollower,
  type MusicShare,
  type InsertMusicShare,
  type Comment,
  type InsertComment,
  type Like,
  type InsertLike,
  type DailyPrompt,
  type InsertDailyPrompt,
  type Notification,
  type InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Music services operations
  getMusicServices(userId: number): Promise<MusicService[]>;
  createMusicService(service: InsertMusicService): Promise<MusicService>;
  updateMusicService(id: number, isConnected: boolean): Promise<MusicService | undefined>;
  
  // Followers operations
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  followUser(follower: InsertFollower): Promise<Follower>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  // Music share operations
  getMusicShare(id: number): Promise<MusicShare | undefined>;
  getMusicShares(): Promise<MusicShare[]>;
  getUserMusicShares(userId: number): Promise<MusicShare[]>;
  getFeedMusicShares(userId: number): Promise<MusicShare[]>;
  getPromptMusicShares(promptId: number): Promise<MusicShare[]>;
  createMusicShare(share: InsertMusicShare): Promise<MusicShare>;
  
  // Comment operations
  getComments(musicShareId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Like operations
  getLikes(musicShareId: number): Promise<Like[]>;
  getLike(musicShareId: number, userId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(musicShareId: number, userId: number): Promise<boolean>;
  
  // Daily prompt operations
  getDailyPrompts(): Promise<DailyPrompt[]>;
  getActiveDailyPrompt(): Promise<DailyPrompt | undefined>;
  createDailyPrompt(prompt: InsertDailyPrompt): Promise<DailyPrompt>;
  endDailyPrompt(id: number): Promise<DailyPrompt | undefined>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private musicServices: Map<number, MusicService>;
  private followers: Map<number, Follower>;
  private musicShares: Map<number, MusicShare>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private dailyPrompts: Map<number, DailyPrompt>;
  private notifications: Map<number, Notification>;
  
  currentUserId: number;
  currentMusicServiceId: number;
  currentFollowerId: number;
  currentMusicShareId: number;
  currentCommentId: number;
  currentLikeId: number;
  currentDailyPromptId: number;
  currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.musicServices = new Map();
    this.followers = new Map();
    this.musicShares = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.dailyPrompts = new Map();
    this.notifications = new Map();
    
    this.currentUserId = 1;
    this.currentMusicServiceId = 1;
    this.currentFollowerId = 1;
    this.currentMusicShareId = 1;
    this.currentCommentId = 1;
    this.currentLikeId = 1;
    this.currentDailyPromptId = 1;
    this.currentNotificationId = 1;
    
    // Seed initial data - create demo prompt
    const now = new Date();
    const end = new Date(now);
    end.setHours(end.getHours() + 2);
    
    this.dailyPrompts.set(this.currentDailyPromptId, {
      id: this.currentDailyPromptId++,
      title: "Today's Music Moment",
      description: "Share what you're listening to right now!",
      startTime: now,
      endTime: end,
      isActive: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Music services operations
  async getMusicServices(userId: number): Promise<MusicService[]> {
    return Array.from(this.musicServices.values()).filter(
      (service) => service.userId === userId
    );
  }
  
  async createMusicService(insertService: InsertMusicService): Promise<MusicService> {
    const id = this.currentMusicServiceId++;
    const service: MusicService = { ...insertService, id };
    this.musicServices.set(id, service);
    return service;
  }
  
  async updateMusicService(id: number, isConnected: boolean): Promise<MusicService | undefined> {
    const service = this.musicServices.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, isConnected };
    this.musicServices.set(id, updatedService);
    return updatedService;
  }
  
  // Followers operations
  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.followers.values())
      .filter((follower) => follower.followingId === userId)
      .map((follower) => follower.followerId);
    
    return Array.from(this.users.values()).filter(
      (user) => followerIds.includes(user.id)
    );
  }
  
  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.followers.values())
      .filter((follower) => follower.followerId === userId)
      .map((follower) => follower.followingId);
    
    return Array.from(this.users.values()).filter(
      (user) => followingIds.includes(user.id)
    );
  }
  
  async followUser(insertFollower: InsertFollower): Promise<Follower> {
    const id = this.currentFollowerId++;
    const now = new Date();
    const follower: Follower = { ...insertFollower, id, createdAt: now };
    this.followers.set(id, follower);
    return follower;
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    for (const [id, follower] of this.followers.entries()) {
      if (follower.followerId === followerId && follower.followingId === followingId) {
        this.followers.delete(id);
        return true;
      }
    }
    return false;
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return Array.from(this.followers.values()).some(
      (follower) => 
        follower.followerId === followerId && 
        follower.followingId === followingId
    );
  }
  
  // Music share operations
  async getMusicShare(id: number): Promise<MusicShare | undefined> {
    return this.musicShares.get(id);
  }
  
  async getMusicShares(): Promise<MusicShare[]> {
    return Array.from(this.musicShares.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  
  async getUserMusicShares(userId: number): Promise<MusicShare[]> {
    return Array.from(this.musicShares.values())
      .filter((share) => share.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getFeedMusicShares(userId: number): Promise<MusicShare[]> {
    // Get user's following
    const following = await this.getFollowing(userId);
    const followingIds = following.map((user) => user.id);
    
    // Get shares from following and user's own shares
    return Array.from(this.musicShares.values())
      .filter((share) => followingIds.includes(share.userId) || share.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getPromptMusicShares(promptId: number): Promise<MusicShare[]> {
    return Array.from(this.musicShares.values())
      .filter((share) => share.promptId === promptId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createMusicShare(insertShare: InsertMusicShare): Promise<MusicShare> {
    const id = this.currentMusicShareId++;
    const now = new Date();
    const share: MusicShare = { ...insertShare, id, createdAt: now };
    this.musicShares.set(id, share);
    return share;
  }
  
  // Comment operations
  async getComments(musicShareId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.musicShareId === musicShareId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    return comment;
  }
  
  // Like operations
  async getLikes(musicShareId: number): Promise<Like[]> {
    return Array.from(this.likes.values())
      .filter((like) => like.musicShareId === musicShareId);
  }
  
  async getLike(musicShareId: number, userId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      (like) => like.musicShareId === musicShareId && like.userId === userId
    );
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.currentLikeId++;
    const now = new Date();
    const like: Like = { ...insertLike, id, createdAt: now };
    this.likes.set(id, like);
    return like;
  }
  
  async deleteLike(musicShareId: number, userId: number): Promise<boolean> {
    for (const [id, like] of this.likes.entries()) {
      if (like.musicShareId === musicShareId && like.userId === userId) {
        this.likes.delete(id);
        return true;
      }
    }
    return false;
  }
  
  // Daily prompt operations
  async getDailyPrompts(): Promise<DailyPrompt[]> {
    return Array.from(this.dailyPrompts.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
  
  async getActiveDailyPrompt(): Promise<DailyPrompt | undefined> {
    const now = new Date();
    return Array.from(this.dailyPrompts.values()).find(
      (prompt) => 
        prompt.isActive &&
        prompt.startTime <= now &&
        prompt.endTime >= now
    );
  }
  
  async createDailyPrompt(insertPrompt: InsertDailyPrompt): Promise<DailyPrompt> {
    const id = this.currentDailyPromptId++;
    const prompt: DailyPrompt = { ...insertPrompt, id };
    this.dailyPrompts.set(id, prompt);
    return prompt;
  }
  
  async endDailyPrompt(id: number): Promise<DailyPrompt | undefined> {
    const prompt = this.dailyPrompts.get(id);
    if (!prompt) return undefined;
    
    const updatedPrompt = { ...prompt, isActive: false };
    this.dailyPrompts.set(id, updatedPrompt);
    return updatedPrompt;
  }
  
  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId && !notification.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const now = new Date();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: now,
      isRead: false
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    let updated = false;
    
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true });
        updated = true;
      }
    }
    
    return updated;
  }
}

export const storage = new MemStorage();
