import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import { 
  users, followers, musicServices, musicShares, 
  comments, likes, dailyPrompts, notifications,
  playlists, playlistMembers, playlistTracks,
  listeningSessions, sessionParticipants, sessionChat,
  listeningHistory, musicRecommendations, userMoods,
  userPreferences, customVisualizers
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUserProfile(id: number, data: Partial<schema.User>): Promise<schema.User | undefined>;
  getUserStats(id: number): Promise<any>;
  
  // Music services operations
  getMusicServices(userId: number): Promise<schema.MusicService[]>;
  createMusicService(service: schema.InsertMusicService): Promise<schema.MusicService>;
  updateMusicService(id: number, data: Partial<schema.MusicService>): Promise<schema.MusicService | undefined>;
  
  // Followers operations
  getFollowers(userId: number): Promise<schema.User[]>;
  getFollowing(userId: number): Promise<schema.User[]>;
  getFollowerRelationship(followerId: number, followingId: number): Promise<schema.Follower | undefined>;
  followUser(follower: schema.InsertFollower): Promise<schema.Follower>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  updateFollowerSettings(id: number, settings: Partial<schema.Follower>): Promise<schema.Follower | undefined>;
  
  // Music share operations
  getMusicShare(id: number): Promise<schema.MusicShare | undefined>;
  getMusicShares(options?: { limit?: number, offset?: number }): Promise<schema.MusicShare[]>;
  getTrendingMusicShares(limit?: number): Promise<schema.MusicShare[]>;
  getUserMusicShares(userId: number, options?: { limit?: number, offset?: number }): Promise<schema.MusicShare[]>;
  getFeedMusicShares(userId: number, options?: { limit?: number, offset?: number }): Promise<schema.MusicShare[]>;
  getPromptMusicShares(promptId: number, options?: { limit?: number, offset?: number }): Promise<schema.MusicShare[]>;
  getMusicSharesByMood(mood: string, options?: { limit?: number, offset?: number }): Promise<schema.MusicShare[]>;
  createMusicShare(share: schema.InsertMusicShare): Promise<schema.MusicShare>;
  updateMusicShare(id: number, data: Partial<schema.MusicShare>): Promise<schema.MusicShare | undefined>;
  deleteMusicShare(id: number): Promise<boolean>;
  
  // Comment operations
  getComments(musicShareId: number): Promise<schema.Comment[]>;
  getCommentReplies(commentId: number): Promise<schema.Comment[]>;
  createComment(comment: schema.InsertComment): Promise<schema.Comment>;
  updateComment(id: number, content: string): Promise<schema.Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Like operations
  getLikes(musicShareId: number): Promise<schema.Like[]>;
  getLike(musicShareId: number, userId: number): Promise<schema.Like | undefined>;
  createLike(like: schema.InsertLike): Promise<schema.Like>;
  deleteLike(musicShareId: number, userId: number): Promise<boolean>;
  
  // Daily prompt operations
  getDailyPrompts(): Promise<schema.DailyPrompt[]>;
  getActiveDailyPrompt(): Promise<schema.DailyPrompt | undefined>;
  createDailyPrompt(prompt: schema.InsertDailyPrompt): Promise<schema.DailyPrompt>;
  updateDailyPrompt(id: number, data: Partial<schema.DailyPrompt>): Promise<schema.DailyPrompt | undefined>;
  endDailyPrompt(id: number): Promise<schema.DailyPrompt | undefined>;
  
  // Notification operations
  getNotifications(userId: number, options?: { limit?: number, offset?: number }): Promise<schema.Notification[]>;
  getUnreadNotifications(userId: number): Promise<schema.Notification[]>;
  createNotification(notification: schema.InsertNotification): Promise<schema.Notification>;
  markNotificationAsRead(id: number): Promise<schema.Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Playlist operations
  getPlaylists(userId: number): Promise<schema.Playlist[]>;
  getPlaylist(id: number): Promise<schema.Playlist | undefined>;
  createPlaylist(playlist: schema.InsertPlaylist): Promise<schema.Playlist>;
  updatePlaylist(id: number, data: Partial<schema.Playlist>): Promise<schema.Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;
  
  // Playlist member operations
  getPlaylistMembers(playlistId: number): Promise<schema.PlaylistMember[]>;
  addPlaylistMember(member: schema.InsertPlaylistMember): Promise<schema.PlaylistMember>;
  updatePlaylistMember(id: number, permissions: { canEdit?: boolean, canInvite?: boolean }): Promise<schema.PlaylistMember | undefined>;
  removePlaylistMember(playlistId: number, userId: number): Promise<boolean>;
  
  // Playlist track operations
  getPlaylistTracks(playlistId: number): Promise<schema.PlaylistTrack[]>;
  addTrackToPlaylist(track: schema.InsertPlaylistTrack): Promise<schema.PlaylistTrack>;
  updateTrackPosition(id: number, position: number): Promise<schema.PlaylistTrack | undefined>;
  removeTrackFromPlaylist(id: number): Promise<boolean>;
  
  // Listening session operations
  getActiveSessions(limit?: number): Promise<schema.ListeningSession[]>;
  getUserSessions(userId: number): Promise<schema.ListeningSession[]>;
  getSession(id: number): Promise<schema.ListeningSession | undefined>;
  createListeningSession(session: schema.InsertListeningSession): Promise<schema.ListeningSession>;
  updateListeningSession(id: number, data: Partial<schema.ListeningSession>): Promise<schema.ListeningSession | undefined>;
  endListeningSession(id: number): Promise<boolean>;
  
  // Session participant operations
  getSessionParticipants(sessionId: number): Promise<schema.SessionParticipant[]>;
  joinSession(participant: schema.InsertSessionParticipant): Promise<schema.SessionParticipant>;
  leaveSession(sessionId: number, userId: number): Promise<boolean>;
  updateParticipantHeartbeat(sessionId: number, userId: number): Promise<boolean>;
  
  // Session chat operations
  getSessionChat(sessionId: number, limit?: number): Promise<schema.SessionChat[]>;
  sendChatMessage(message: schema.InsertSessionChat): Promise<schema.SessionChat>;
  
  // Listening history operations
  getUserListeningHistory(userId: number, limit?: number): Promise<schema.ListeningHistory[]>;
  recordListeningActivity(activity: schema.InsertListeningHistory): Promise<schema.ListeningHistory>;
  
  // Recommendations operations
  getUserRecommendations(userId: number, limit?: number): Promise<schema.MusicRecommendation[]>;
  createRecommendation(recommendation: schema.InsertMusicRecommendation): Promise<schema.MusicRecommendation>;
  markRecommendationViewed(id: number): Promise<boolean>;
  markRecommendationSaved(id: number, isSaved: boolean): Promise<boolean>;
  
  // User mood operations
  getCurrentUserMood(userId: number): Promise<schema.UserMood | undefined>;
  setUserMood(mood: schema.InsertUserMood): Promise<schema.UserMood>;
  
  // User preferences operations
  getUserPreferences(userId: number): Promise<schema.UserPreference | undefined>;
  updateUserPreferences(userId: number, data: Partial<schema.UserPreference>): Promise<schema.UserPreference>;
  
  // Visualizer operations
  getUserVisualizers(userId: number): Promise<schema.CustomVisualizer[]>;
  getVisualizer(id: number): Promise<schema.CustomVisualizer | undefined>;
  createVisualizer(visualizer: schema.InsertCustomVisualizer): Promise<schema.CustomVisualizer>;
  updateVisualizer(id: number, data: Partial<schema.CustomVisualizer>): Promise<schema.CustomVisualizer | undefined>;
  deleteVisualizer(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(users).values(user).returning();
    
    // Crear preferencias de usuario predeterminadas
    await db.insert(userPreferences).values({
      userId: newUser.id,
      language: "es",
      theme: "dark"
    });
    
    return newUser;
  }
  
  async updateUserProfile(id: number, data: Partial<schema.User>): Promise<schema.User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, lastActive: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
  
  async getUserStats(id: number): Promise<any> {
    // Estadísticas básicas
    const sharesCount = await db
      .select({ count: count() })
      .from(musicShares)
      .where(eq(musicShares.userId, id));
      
    const followersCount = await db
      .select({ count: count() })
      .from(followers)
      .where(eq(followers.followingId, id));
      
    const followingCount = await db
      .select({ count: count() })
      .from(followers)
      .where(eq(followers.followerId, id));
      
    const likesReceived = await db
      .select({ count: count() })
      .from(likes)
      .innerJoin(musicShares, eq(likes.musicShareId, musicShares.id))
      .where(eq(musicShares.userId, id));
    
    return {
      sharesCount: sharesCount[0].count,
      followersCount: followersCount[0].count,
      followingCount: followingCount[0].count,
      likesReceived: likesReceived[0].count
    };
  }
  
  // Music services operations
  async getMusicServices(userId: number): Promise<schema.MusicService[]> {
    return db.select().from(musicServices).where(eq(musicServices.userId, userId));
  }
  
  async createMusicService(service: schema.InsertMusicService): Promise<schema.MusicService> {
    const [newService] = await db.insert(musicServices).values(service).returning();
    return newService;
  }
  
  async updateMusicService(id: number, data: Partial<schema.MusicService>): Promise<schema.MusicService | undefined> {
    const [updated] = await db
      .update(musicServices)
      .set(data)
      .where(eq(musicServices.id, id))
      .returning();
    return updated;
  }
  
  // Followers operations
  async getFollowers(userId: number): Promise<schema.User[]> {
    return db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        bio: users.bio,
        createdAt: users.createdAt,
        banner: users.banner
      })
      .from(followers)
      .innerJoin(users, eq(followers.followerId, users.id))
      .where(eq(followers.followingId, userId));
  }
  
  async getFollowing(userId: number): Promise<schema.User[]> {
    return db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        bio: users.bio,
        createdAt: users.createdAt,
        banner: users.banner
      })
      .from(followers)
      .innerJoin(users, eq(followers.followingId, users.id))
      .where(eq(followers.followerId, userId));
  }
  
  async getFollowerRelationship(followerId: number, followingId: number): Promise<schema.Follower | undefined> {
    const [relationship] = await db
      .select()
      .from(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );
    return relationship;
  }
  
  async followUser(follower: schema.InsertFollower): Promise<schema.Follower> {
    const [newFollower] = await db.insert(followers).values(follower).returning();
    return newFollower;
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .delete(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );
    return result.rowCount > 0;
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );
    return result.count > 0;
  }
  
  async updateFollowerSettings(id: number, settings: Partial<schema.Follower>): Promise<schema.Follower | undefined> {
    const [updated] = await db
      .update(followers)
      .set(settings)
      .where(eq(followers.id, id))
      .returning();
    return updated;
  }
  
  // Music share operations
  async getMusicShare(id: number): Promise<schema.MusicShare | undefined> {
    const [share] = await db.select().from(musicShares).where(eq(musicShares.id, id));
    return share;
  }
  
  async getMusicShares(options: { limit?: number, offset?: number } = {}): Promise<schema.MusicShare[]> {
    const { limit = 50, offset = 0 } = options;
    return db
      .select()
      .from(musicShares)
      .orderBy(desc(musicShares.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getTrendingMusicShares(limit: number = 10): Promise<schema.MusicShare[]> {
    // Implementación básica: obtener las publicaciones con más likes
    const likesPerShare = db
      .select({
        musicShareId: likes.musicShareId,
        likeCount: count(likes.id),
      })
      .from(likes)
      .groupBy(likes.musicShareId)
      .as("likesCount");
      
    return db
      .select({
        id: musicShares.id,
        userId: musicShares.userId,
        title: musicShares.title,
        artist: musicShares.artist,
        album: musicShares.album,
        albumCover: musicShares.albumCover,
        trackUrl: musicShares.trackUrl,
        service: musicShares.service,
        serviceTrackId: musicShares.serviceTrackId,
        content: musicShares.content,
        mood: musicShares.mood,
        location: musicShares.location,
        privacyLevel: musicShares.privacyLevel,
        visualizerType: musicShares.visualizerType,
        visualizerSettings: musicShares.visualizerSettings,
        customColors: musicShares.customColors,
        audioSnippet: musicShares.audioSnippet,
        expiresAt: musicShares.expiresAt,
        promptId: musicShares.promptId,
        createdAt: musicShares.createdAt,
        likeCount: likesPerShare.likeCount,
      })
      .from(musicShares)
      .leftJoin(likesPerShare, eq(musicShares.id, likesPerShare.musicShareId))
      .orderBy(desc(likesPerShare.likeCount), desc(musicShares.createdAt))
      .limit(limit);
  }
  
  async getUserMusicShares(userId: number, options: { limit?: number, offset?: number } = {}): Promise<schema.MusicShare[]> {
    const { limit = 50, offset = 0 } = options;
    return db
      .select()
      .from(musicShares)
      .where(eq(musicShares.userId, userId))
      .orderBy(desc(musicShares.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getFeedMusicShares(userId: number, options: { limit?: number, offset?: number } = {}): Promise<schema.MusicShare[]> {
    const { limit = 50, offset = 0 } = options;
    
    // Obtener IDs de usuarios que el usuario actual sigue
    const followingUsers = await db
      .select({ followingId: followers.followingId })
      .from(followers)
      .where(eq(followers.followerId, userId));
      
    const followingIds = followingUsers.map(user => user.followingId);
    
    // Incluir las publicaciones del propio usuario
    followingIds.push(userId);
    
    return db
      .select()
      .from(musicShares)
      .where(sql`${musicShares.userId} IN (${followingIds.join(',')})`)
      .orderBy(desc(musicShares.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getPromptMusicShares(promptId: number, options: { limit?: number, offset?: number } = {}): Promise<schema.MusicShare[]> {
    const { limit = 50, offset = 0 } = options;
    return db
      .select()
      .from(musicShares)
      .where(eq(musicShares.promptId, promptId))
      .orderBy(desc(musicShares.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getMusicSharesByMood(mood: string, options: { limit?: number, offset?: number } = {}): Promise<schema.MusicShare[]> {
    const { limit = 50, offset = 0 } = options;
    return db
      .select()
      .from(musicShares)
      .where(eq(musicShares.mood, mood))
      .orderBy(desc(musicShares.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async createMusicShare(share: schema.InsertMusicShare): Promise<schema.MusicShare> {
    const [newShare] = await db.insert(musicShares).values(share).returning();
    
    // Incrementar contador de participantes en el prompt si existe
    if (share.promptId) {
      await db
        .update(dailyPrompts)
        .set({ 
          participantCount: sql`${dailyPrompts.participantCount} + 1` 
        })
        .where(eq(dailyPrompts.id, share.promptId));
    }
    
    return newShare;
  }
  
  async updateMusicShare(id: number, data: Partial<schema.MusicShare>): Promise<schema.MusicShare | undefined> {
    const [updated] = await db
      .update(musicShares)
      .set(data)
      .where(eq(musicShares.id, id))
      .returning();
    return updated;
  }
  
  async deleteMusicShare(id: number): Promise<boolean> {
    // Primero eliminar referencias en otras tablas
    await db.delete(comments).where(eq(comments.musicShareId, id));
    await db.delete(likes).where(eq(likes.musicShareId, id));
    
    const result = await db.delete(musicShares).where(eq(musicShares.id, id));
    return result.rowCount > 0;
  }
  
  // Comment operations
  async getComments(musicShareId: number): Promise<schema.Comment[]> {
    return db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.musicShareId, musicShareId),
          sql`${comments.parentId} IS NULL`
        )
      )
      .orderBy(asc(comments.createdAt));
  }
  
  async getCommentReplies(commentId: number): Promise<schema.Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.parentId, commentId))
      .orderBy(asc(comments.createdAt));
  }
  
  async createComment(comment: schema.InsertComment): Promise<schema.Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Si es un comentario en una publicación (no una respuesta), crear notificación para el autor
    if (!comment.parentId) {
      const [musicShare] = await db
        .select({ userId: musicShares.userId })
        .from(musicShares)
        .where(eq(musicShares.id, comment.musicShareId));
        
      if (musicShare && musicShare.userId !== comment.userId) {
        await db.insert(notifications).values({
          userId: musicShare.userId,
          type: "comment",
          content: "Ha comentado en tu publicación",
          sourceId: newComment.id,
          sourceUserId: comment.userId,
          actionUrl: `/share/${comment.musicShareId}`
        });
      }
    } 
    // Si es una respuesta, notificar al autor del comentario original
    else {
      const [parentComment] = await db
        .select({ userId: comments.userId })
        .from(comments)
        .where(eq(comments.id, comment.parentId));
        
      if (parentComment && parentComment.userId !== comment.userId) {
        await db.insert(notifications).values({
          userId: parentComment.userId,
          type: "comment",
          content: "Ha respondido a tu comentario",
          sourceId: newComment.id,
          sourceUserId: comment.userId,
          actionUrl: `/share/${comment.musicShareId}`
        });
      }
    }
    
    return newComment;
  }
  
  async updateComment(id: number, content: string): Promise<schema.Comment | undefined> {
    const [updated] = await db
      .update(comments)
      .set({ content })
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    // Primero eliminar respuestas a este comentario
    await db.delete(comments).where(eq(comments.parentId, id));
    
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.rowCount > 0;
  }
  
  // Like operations
  async getLikes(musicShareId: number): Promise<schema.Like[]> {
    return db.select().from(likes).where(eq(likes.musicShareId, musicShareId));
  }
  
  async getLike(musicShareId: number, userId: number): Promise<schema.Like | undefined> {
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.musicShareId, musicShareId),
          eq(likes.userId, userId)
        )
      );
    return like;
  }
  
  async createLike(like: schema.InsertLike): Promise<schema.Like> {
    const [newLike] = await db.insert(likes).values(like).returning();
    
    // Crear notificación para el autor de la publicación
    const [musicShare] = await db
      .select({ userId: musicShares.userId })
      .from(musicShares)
      .where(eq(musicShares.id, like.musicShareId));
      
    if (musicShare && musicShare.userId !== like.userId) {
      await db.insert(notifications).values({
        userId: musicShare.userId,
        type: "like",
        content: `Le ha dado ${like.reactionType || 'like'} a tu publicación`,
        sourceId: newLike.id,
        sourceUserId: like.userId,
        actionUrl: `/share/${like.musicShareId}`
      });
    }
    
    return newLike;
  }
  
  async deleteLike(musicShareId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(
        and(
          eq(likes.musicShareId, musicShareId),
          eq(likes.userId, userId)
        )
      );
    return result.rowCount > 0;
  }
  
  // Daily prompt operations
  async getDailyPrompts(): Promise<schema.DailyPrompt[]> {
    return db
      .select()
      .from(dailyPrompts)
      .orderBy(desc(dailyPrompts.startTime));
  }
  
  async getActiveDailyPrompt(): Promise<schema.DailyPrompt | undefined> {
    const now = new Date();
    const [prompt] = await db
      .select()
      .from(dailyPrompts)
      .where(
        and(
          eq(dailyPrompts.isActive, true),
          sql`${dailyPrompts.startTime} <= ${now}`,
          sql`${dailyPrompts.endTime} >= ${now}`
        )
      );
    return prompt;
  }
  
  async createDailyPrompt(prompt: schema.InsertDailyPrompt): Promise<schema.DailyPrompt> {
    // Desactivar otros prompts activos si este es activo
    if (prompt.isActive) {
      await db
        .update(dailyPrompts)
        .set({ isActive: false })
        .where(eq(dailyPrompts.isActive, true));
    }
    
    const [newPrompt] = await db.insert(dailyPrompts).values(prompt).returning();
    return newPrompt;
  }
  
  async updateDailyPrompt(id: number, data: Partial<schema.DailyPrompt>): Promise<schema.DailyPrompt | undefined> {
    // Si se está activando este prompt, desactivar otros
    if (data.isActive) {
      await db
        .update(dailyPrompts)
        .set({ isActive: false })
        .where(
          and(
            eq(dailyPrompts.isActive, true),
            sql`${dailyPrompts.id} != ${id}`
          )
        );
    }
    
    const [updated] = await db
      .update(dailyPrompts)
      .set(data)
      .where(eq(dailyPrompts.id, id))
      .returning();
    return updated;
  }
  
  async endDailyPrompt(id: number): Promise<schema.DailyPrompt | undefined> {
    const [updated] = await db
      .update(dailyPrompts)
      .set({ 
        isActive: false,
        endTime: new Date()
      })
      .where(eq(dailyPrompts.id, id))
      .returning();
    return updated;
  }
  
  // Notification operations
  async getNotifications(userId: number, options: { limit?: number, offset?: number } = {}): Promise<schema.Notification[]> {
    const { limit = 50, offset = 0 } = options;
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getUnreadNotifications(userId: number): Promise<schema.Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }
  
  async createNotification(notification: schema.InsertNotification): Promise<schema.Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        isRead: false,
        deliveryStatus: "pending"
      })
      .returning();
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<schema.Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    return result.rowCount > 0;
  }
  
  // Playlist operations
  async getPlaylists(userId: number): Promise<schema.Playlist[]> {
    // Obtener playlists propias y colaborativas donde el usuario es miembro
    const ownedPlaylists = db
      .select()
      .from(playlists)
      .where(eq(playlists.ownerId, userId));
      
    const memberships = await db
      .select({ playlistId: playlistMembers.playlistId })
      .from(playlistMembers)
      .where(eq(playlistMembers.userId, userId));
      
    if (memberships.length === 0) {
      return ownedPlaylists;
    }
    
    const memberPlaylistIds = memberships.map(m => m.playlistId);
    
    const memberPlaylists = db
      .select()
      .from(playlists)
      .where(
        and(
          sql`${playlists.id} IN (${memberPlaylistIds.join(',')})`,
          eq(playlists.isCollaborative, true)
        )
      );
      
    return [...(await ownedPlaylists), ...(await memberPlaylists)];
  }
  
  async getPlaylist(id: number): Promise<schema.Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }
  
  async createPlaylist(playlist: schema.InsertPlaylist): Promise<schema.Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }
  
  async updatePlaylist(id: number, data: Partial<schema.Playlist>): Promise<schema.Playlist | undefined> {
    const [updated] = await db
      .update(playlists)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(playlists.id, id))
      .returning();
    return updated;
  }
  
  async deletePlaylist(id: number): Promise<boolean> {
    // Eliminar tracks y miembros primero
    await db.delete(playlistTracks).where(eq(playlistTracks.playlistId, id));
    await db.delete(playlistMembers).where(eq(playlistMembers.playlistId, id));
    
    const result = await db.delete(playlists).where(eq(playlists.id, id));
    return result.rowCount > 0;
  }
  
  // Playlist member operations
  async getPlaylistMembers(playlistId: number): Promise<schema.PlaylistMember[]> {
    return db
      .select()
      .from(playlistMembers)
      .where(eq(playlistMembers.playlistId, playlistId));
  }
  
  async addPlaylistMember(member: schema.InsertPlaylistMember): Promise<schema.PlaylistMember> {
    const [newMember] = await db.insert(playlistMembers).values(member).returning();
    
    // Notificar al usuario que ha sido agregado a una playlist
    const [playlist] = await db
      .select({
        name: playlists.name,
        ownerId: playlists.ownerId
      })
      .from(playlists)
      .where(eq(playlists.id, member.playlistId));
      
    if (playlist) {
      await db.insert(notifications).values({
        userId: member.userId,
        type: "collaborative_playlist",
        content: `Has sido agregado a la playlist colaborativa "${playlist.name}"`,
        sourceId: member.playlistId,
        sourceUserId: playlist.ownerId,
        actionUrl: `/playlists/${member.playlistId}`
      });
    }
    
    return newMember;
  }
  
  async updatePlaylistMember(id: number, permissions: { canEdit?: boolean, canInvite?: boolean }): Promise<schema.PlaylistMember | undefined> {
    const [updated] = await db
      .update(playlistMembers)
      .set(permissions)
      .where(eq(playlistMembers.id, id))
      .returning();
    return updated;
  }
  
  async removePlaylistMember(playlistId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(playlistMembers)
      .where(
        and(
          eq(playlistMembers.playlistId, playlistId),
          eq(playlistMembers.userId, userId)
        )
      );
    return result.rowCount > 0;
  }
  
  // Playlist track operations
  async getPlaylistTracks(playlistId: number): Promise<schema.PlaylistTrack[]> {
    return db
      .select()
      .from(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId))
      .orderBy(asc(playlistTracks.position));
  }
  
  async addTrackToPlaylist(track: schema.InsertPlaylistTrack): Promise<schema.PlaylistTrack> {
    const [newTrack] = await db.insert(playlistTracks).values(track).returning();
    
    // Actualizar timestamp de la playlist
    await db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, track.playlistId));
      
    return newTrack;
  }
  
  async updateTrackPosition(id: number, position: number): Promise<schema.PlaylistTrack | undefined> {
    const [updated] = await db
      .update(playlistTracks)
      .set({ position })
      .where(eq(playlistTracks.id, id))
      .returning();
    return updated;
  }
  
  async removeTrackFromPlaylist(id: number): Promise<boolean> {
    const [track] = await db
      .select({ playlistId: playlistTracks.playlistId })
      .from(playlistTracks)
      .where(eq(playlistTracks.id, id));
      
    const result = await db.delete(playlistTracks).where(eq(playlistTracks.id, id));
    
    if (track && result.rowCount > 0) {
      // Actualizar timestamp de la playlist
      await db
        .update(playlists)
        .set({ updatedAt: new Date() })
        .where(eq(playlists.id, track.playlistId));
    }
    
    return result.rowCount > 0;
  }
  
  // Listening session operations
  async getActiveSessions(limit: number = 10): Promise<schema.ListeningSession[]> {
    return db
      .select()
      .from(listeningSessions)
      .where(eq(listeningSessions.isActive, true))
      .orderBy(desc(listeningSessions.startedAt))
      .limit(limit);
  }
  
  async getUserSessions(userId: number): Promise<schema.ListeningSession[]> {
    const hostedSessions = db
      .select()
      .from(listeningSessions)
      .where(eq(listeningSessions.hostId, userId));
      
    const participatedSessions = db
      .select({ sessionId: sessionParticipants.sessionId })
      .from(sessionParticipants)
      .where(eq(sessionParticipants.userId, userId));
      
    if (participatedSessions.length === 0) {
      return hostedSessions;
    }
    
    const participatedIds = participatedSessions.map(p => p.sessionId);
    
    const joinedSessions = db
      .select()
      .from(listeningSessions)
      .where(sql`${listeningSessions.id} IN (${participatedIds.join(',')})`);
      
    return [...(await hostedSessions), ...(await joinedSessions)];
  }
  
  async getSession(id: number): Promise<schema.ListeningSession | undefined> {
    const [session] = await db.select().from(listeningSessions).where(eq(listeningSessions.id, id));
    return session;
  }
  
  async createListeningSession(session: schema.InsertListeningSession): Promise<schema.ListeningSession> {
    const [newSession] = await db.insert(listeningSessions).values(session).returning();
    
    // Automáticamente agregar al creador como participante
    await db.insert(sessionParticipants).values({
      sessionId: newSession.id,
      userId: session.hostId,
      isActive: true
    });
    
    return newSession;
  }
  
  async updateListeningSession(id: number, data: Partial<schema.ListeningSession>): Promise<schema.ListeningSession | undefined> {
    const [updated] = await db
      .update(listeningSessions)
      .set(data)
      .where(eq(listeningSessions.id, id))
      .returning();
    return updated;
  }
  
  async endListeningSession(id: number): Promise<boolean> {
    const result = await db
      .update(listeningSessions)
      .set({
        isActive: false,
        endedAt: new Date()
      })
      .where(eq(listeningSessions.id, id));
      
    // Marcar todos los participantes como inactivos
    await db
      .update(sessionParticipants)
      .set({
        isActive: false,
        leftAt: new Date()
      })
      .where(eq(sessionParticipants.sessionId, id));
      
    return result.rowCount > 0;
  }
  
  // Session participant operations
  async getSessionParticipants(sessionId: number): Promise<schema.SessionParticipant[]> {
    return db
      .select()
      .from(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.isActive, true)
        )
      );
  }
  
  async joinSession(participant: schema.InsertSessionParticipant): Promise<schema.SessionParticipant> {
    const [newParticipant] = await db.insert(sessionParticipants).values(participant).returning();
    
    // Notificar al anfitrión de la sesión
    const [session] = await db
      .select({
        name: listeningSessions.name,
        hostId: listeningSessions.hostId
      })
      .from(listeningSessions)
      .where(eq(listeningSessions.id, participant.sessionId));
      
    if (session && session.hostId !== participant.userId) {
      await db.insert(notifications).values({
        userId: session.hostId,
        type: "listening_party",
        content: `Un usuario se ha unido a tu sesión de escucha "${session.name}"`,
        sourceId: participant.sessionId,
        sourceUserId: participant.userId,
        actionUrl: `/sessions/${participant.sessionId}`
      });
    }
    
    // Agregar mensaje de sistema al chat de la sesión
    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, participant.userId));
      
    if (user) {
      await db.insert(sessionChat).values({
        sessionId: participant.sessionId,
        userId: participant.userId,
        message: `${user.username} se ha unido a la sesión`,
        messageType: "system"
      });
    }
    
    return newParticipant;
  }
  
  async leaveSession(sessionId: number, userId: number): Promise<boolean> {
    const result = await db
      .update(sessionParticipants)
      .set({
        isActive: false,
        leftAt: new Date()
      })
      .where(
        and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        )
      );
      
    // Agregar mensaje de sistema al chat de la sesión
    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId));
      
    if (user) {
      await db.insert(sessionChat).values({
        sessionId: sessionId,
        userId: userId,
        message: `${user.username} ha abandonado la sesión`,
        messageType: "system"
      });
    }
      
    return result.rowCount > 0;
  }
  
  async updateParticipantHeartbeat(sessionId: number, userId: number): Promise<boolean> {
    const result = await db
      .update(sessionParticipants)
      .set({ lastHeartbeat: new Date() })
      .where(
        and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        )
      );
    return result.rowCount > 0;
  }
  
  // Session chat operations
  async getSessionChat(sessionId: number, limit: number = 100): Promise<schema.SessionChat[]> {
    return db
      .select()
      .from(sessionChat)
      .where(eq(sessionChat.sessionId, sessionId))
      .orderBy(asc(sessionChat.createdAt))
      .limit(limit);
  }
  
  async sendChatMessage(message: schema.InsertSessionChat): Promise<schema.SessionChat> {
    const [newMessage] = await db.insert(sessionChat).values(message).returning();
    return newMessage;
  }
  
  // Listening history operations
  async getUserListeningHistory(userId: number, limit: number = 50): Promise<schema.ListeningHistory[]> {
    return db
      .select()
      .from(listeningHistory)
      .where(eq(listeningHistory.userId, userId))
      .orderBy(desc(listeningHistory.listenedAt))
      .limit(limit);
  }
  
  async recordListeningActivity(activity: schema.InsertListeningHistory): Promise<schema.ListeningHistory> {
    const [newActivity] = await db.insert(listeningHistory).values(activity).returning();
    return newActivity;
  }
  
  // Recommendations operations
  async getUserRecommendations(userId: number, limit: number = 20): Promise<schema.MusicRecommendation[]> {
    return db
      .select()
      .from(musicRecommendations)
      .where(eq(musicRecommendations.userId, userId))
      .orderBy(desc(musicRecommendations.confidence), desc(musicRecommendations.createdAt))
      .limit(limit);
  }
  
  async createRecommendation(recommendation: schema.InsertMusicRecommendation): Promise<schema.MusicRecommendation> {
    const [newRecommendation] = await db.insert(musicRecommendations).values(recommendation).returning();
    
    // Crear notificación para el usuario
    await db.insert(notifications).values({
      userId: recommendation.userId,
      type: "recommendation",
      content: `Nueva recomendación de música: "${recommendation.trackTitle}" por ${recommendation.trackArtist}`,
      sourceId: newRecommendation.id,
      actionUrl: `/recommendations`
    });
    
    return newRecommendation;
  }
  
  async markRecommendationViewed(id: number): Promise<boolean> {
    const result = await db
      .update(musicRecommendations)
      .set({ isViewed: true })
      .where(eq(musicRecommendations.id, id));
    return result.rowCount > 0;
  }
  
  async markRecommendationSaved(id: number, isSaved: boolean): Promise<boolean> {
    const result = await db
      .update(musicRecommendations)
      .set({ isSaved })
      .where(eq(musicRecommendations.id, id));
    return result.rowCount > 0;
  }
  
  // User mood operations
  async getCurrentUserMood(userId: number): Promise<schema.UserMood | undefined> {
    const now = new Date();
    const [mood] = await db
      .select()
      .from(userMoods)
      .where(
        and(
          eq(userMoods.userId, userId),
          sql`${userMoods.expiresAt} >= ${now} OR ${userMoods.expiresAt} IS NULL`
        )
      )
      .orderBy(desc(userMoods.createdAt))
      .limit(1);
    return mood;
  }
  
  async setUserMood(mood: schema.InsertUserMood): Promise<schema.UserMood> {
    const [newMood] = await db.insert(userMoods).values(mood).returning();
    return newMood;
  }
  
  // User preferences operations
  async getUserPreferences(userId: number): Promise<schema.UserPreference | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }
  
  async updateUserPreferences(userId: number, data: Partial<schema.UserPreference>): Promise<schema.UserPreference> {
    // Verificar si las preferencias ya existen
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({
          ...data,
          lastUpdatedAt: new Date()
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [newPrefs] = await db
        .insert(userPreferences)
        .values({
          userId,
          ...data
        })
        .returning();
      return newPrefs;
    }
  }
  
  // Visualizer operations
  async getUserVisualizers(userId: number): Promise<schema.CustomVisualizer[]> {
    // Obtener visualizadores personales y públicos
    const userVisualizers = db
      .select()
      .from(customVisualizers)
      .where(eq(customVisualizers.userId, userId));
      
    const publicVisualizers = db
      .select()
      .from(customVisualizers)
      .where(
        and(
          sql`${customVisualizers.userId} != ${userId}`,
          eq(customVisualizers.isPublic, true)
        )
      );
      
    return [...(await userVisualizers), ...(await publicVisualizers)];
  }
  
  async getVisualizer(id: number): Promise<schema.CustomVisualizer | undefined> {
    const [visualizer] = await db
      .select()
      .from(customVisualizers)
      .where(eq(customVisualizers.id, id));
    return visualizer;
  }
  
  async createVisualizer(visualizer: schema.InsertCustomVisualizer): Promise<schema.CustomVisualizer> {
    const [newVisualizer] = await db
      .insert(customVisualizers)
      .values(visualizer)
      .returning();
    return newVisualizer;
  }
  
  async updateVisualizer(id: number, data: Partial<schema.CustomVisualizer>): Promise<schema.CustomVisualizer | undefined> {
    const [updated] = await db
      .update(customVisualizers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(customVisualizers.id, id))
      .returning();
    return updated;
  }
  
  async deleteVisualizer(id: number): Promise<boolean> {
    const result = await db
      .delete(customVisualizers)
      .where(eq(customVisualizers.id, id));
    return result.rowCount > 0;
  }
  
  // Método para inicializar la base de datos con datos de ejemplo
  async initializeDailyPrompt(): Promise<void> {
    // Verificar si ya hay prompts
    const existingPrompts = await db.select().from(dailyPrompts);
    
    if (existingPrompts.length === 0) {
      // Crear un prompt diario de ejemplo
      const now = new Date();
      const end = new Date(now);
      end.setHours(now.getHours() + 2);
      
      await this.createDailyPrompt({
        title: "El momento musical del día",
        description: "¡Comparte lo que te está inspirando en este momento!",
        theme: "cyberpunk",
        moodTags: ["energético", "relajado", "nostálgico", "feliz"],
        startTime: now,
        endTime: end,
        isActive: true,
      });
    }
  }
}

// Instanciar el almacenamiento de base de datos
export const storage = new DatabaseStorage();

// Crear función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    await storage.initializeDailyPrompt();
    console.log("Base de datos inicializada correctamente con datos de ejemplo");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}