import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, primaryKey, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const ThemeEnum = z.enum(["light", "dark", "system", "cyberpunk", "neon", "minimal"]);
export const MusicServiceEnum = z.enum([
  "spotify",
  "apple_music",
  "youtube_music",
  "deezer",
  "tidal",
  "soundcloud",
  "bandcamp",
  "other",
]);
export const NotificationTypeEnum = z.enum([
  "like",
  "comment",
  "follow",
  "prompt",
  "mention",
  "recommendation",
  "collaborative_playlist",
  "listening_party",
]);
export const PrivacyLevelEnum = z.enum([
  "public",
  "followers",
  "private",
  "temporary"
]);
export const VisualizerTypeEnum = z.enum([
  "waveform",
  "circular",
  "bars",
  "particles",
  "glitch",
  "neon",
  "cyberpunk",
  "custom"
]);

// Enhanced User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").unique(),
  avatar: text("avatar"),
  banner: text("banner"),
  bio: text("bio"),
  theme: text("theme").default("dark"), // user preference for app theme
  defaultPrivacy: text("default_privacy").default("public"),
  defaultVisualizer: text("default_visualizer").default("waveform"),
  notificationPreferences: jsonb("notification_preferences").default({
    likes: true, 
    comments: true, 
    follows: true, 
    recommendations: true
  }),
  lastActive: timestamp("last_active").defaultNow(),
  badges: jsonb("badges").default([]), // array of achievement badges
  profileStats: jsonb("profile_stats").default({}), // listening stats, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  musicServices: many(musicServices),
  musicShares: many(musicShares),
  followers: many(followers, { relationName: "following" }),
  following: many(followers, { relationName: "followers" }),
  playlists: many(playlists),
  playlistMembers: many(playlistMembers),
  listeningHistory: many(listeningHistory),
  comments: many(comments),
  likes: many(likes),
  notifications: many(notifications),
  userMoods: many(userMoods),
}));

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    displayName: true,
    email: true,
    avatar: true,
    banner: true,
    bio: true,
    theme: true,
    defaultPrivacy: true,
  })
  .extend({
    confirmPassword: z.string(),
  });

// User's music service connections with enhanced token management
export const musicServices = pgTable("music_services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  service: text("service").notNull(), // spotify, apple_music, youtube_music, etc.
  isConnected: boolean("is_connected").default(false),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  apiKey: text("api_key"),
  syncEnabled: boolean("sync_enabled").default(true),
  lastSynced: timestamp("last_synced"),
  serviceUserId: text("service_user_id"), // User ID on the service
});

export const musicServicesRelations = relations(musicServices, ({ one }) => ({
  user: one(users, {
    fields: [musicServices.userId],
    references: [users.id],
  }),
}));

export const insertMusicServiceSchema = createInsertSchema(musicServices).pick({
  userId: true,
  service: true,
  isConnected: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiry: true,
  apiKey: true,
  syncEnabled: true,
});

// Enhanced Followers relationship with notification preferences
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  notifyOnShare: boolean("notify_on_share").default(true),
  notifyOnListen: boolean("notify_on_listen").default(false),
  closeFriend: boolean("close_friend").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [followers.followingId],
    references: [users.id],
    relationName: "followers",
  }),
}));

export const insertFollowerSchema = createInsertSchema(followers).pick({
  followerId: true,
  followingId: true,
  notifyOnShare: true,
  notifyOnListen: true,
  closeFriend: true,
});

// Enhanced Music shares with more media options and privacy controls
export const musicShares = pgTable("music_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  albumCover: text("album_cover"),
  trackUrl: text("track_url"),
  service: text("service").notNull(),
  serviceTrackId: text("service_track_id"), // ID of the track on the service
  content: text("content"), // Caption/description
  mood: text("mood"), // User-defined mood tag
  location: jsonb("location").default({}), // Geolocation data (optional)
  privacyLevel: text("privacy_level").default("public"),
  visualizerType: text("visualizer_type").default("waveform"),
  visualizerSettings: jsonb("visualizer_settings").default({}),
  customColors: jsonb("custom_colors").default({}),
  audioSnippet: text("audio_snippet"), // URL to short audio preview
  expiresAt: timestamp("expires_at"), // For temporary shares
  promptId: integer("prompt_id").references(() => dailyPrompts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const musicSharesRelations = relations(musicShares, ({ one, many }) => ({
  user: one(users, {
    fields: [musicShares.userId],
    references: [users.id],
  }),
  prompt: one(dailyPrompts, {
    fields: [musicShares.promptId],
    references: [dailyPrompts.id],
  }),
  comments: many(comments),
  likes: many(likes),
  playlist: many(playlistTracks),
}));

export const insertMusicShareSchema = createInsertSchema(musicShares).pick({
  userId: true,
  title: true,
  artist: true,
  album: true,
  albumCover: true,
  trackUrl: true,
  service: true,
  serviceTrackId: true,
  content: true,
  mood: true,
  location: true,
  privacyLevel: true,
  visualizerType: true,
  visualizerSettings: true,
  customColors: true,
  audioSnippet: true,
  expiresAt: true,
  promptId: true,
});

// Enhanced Comments with reactions and rich media
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  musicShareId: integer("music_share_id").notNull().references(() => musicShares.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"), // For attaching images or other media
  parentId: integer("parent_id").references(() => comments.id), // For comment threads
  reactionCount: jsonb("reaction_count").default({}), // Count of emoji reactions
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  musicShare: one(musicShares, {
    fields: [comments.musicShareId],
    references: [musicShares.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const insertCommentSchema = createInsertSchema(comments).pick({
  musicShareId: true,
  userId: true,
  content: true,
  attachmentUrl: true,
  parentId: true,
});

// Enhanced Likes with reaction types
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  musicShareId: integer("music_share_id").notNull().references(() => musicShares.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reactionType: text("reaction_type").default("like"), // like, love, fire, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  musicShare: one(musicShares, {
    fields: [likes.musicShareId],
    references: [musicShares.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const insertLikeSchema = createInsertSchema(likes).pick({
  musicShareId: true,
  userId: true,
  reactionType: true,
});

// Enhanced Daily prompts with themes and community stats
export const dailyPrompts = pgTable("daily_prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  theme: text("theme"), // Visual theme for this prompt
  moodTags: jsonb("mood_tags").default([]), // Suggested moods for this prompt
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").default(true),
  participantCount: integer("participant_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyPromptsRelations = relations(dailyPrompts, ({ many }) => ({
  musicShares: many(musicShares),
}));

export const insertDailyPromptSchema = createInsertSchema(dailyPrompts).pick({
  title: true,
  description: true,
  theme: true,
  moodTags: true,
  startTime: true,
  endTime: true,
  isActive: true,
});

// Enhanced Notifications with action URLs and read status tracking
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // like, comment, follow, prompt, etc.
  content: text("content").notNull(),
  sourceId: integer("source_id"), // ID of related entity (like, comment, etc.)
  sourceUserId: integer("source_user_id").references(() => users.id),
  actionUrl: text("action_url"), // Deep link to relevant content
  imageUrl: text("image_url"), // Optional image for rich notifications
  priority: text("priority").default("normal"), // normal, high, urgent
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  deliveryStatus: text("delivery_status").default("pending"), // pending, sent, delivered, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  sourceUser: one(users, {
    fields: [notifications.sourceUserId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  content: true,
  sourceId: true,
  sourceUserId: true,
  actionUrl: true,
  imageUrl: true,
  priority: true,
});

// Collaborative Playlists
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  isCollaborative: boolean("is_collaborative").default(false),
  privacyLevel: text("privacy_level").default("public"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  owner: one(users, {
    fields: [playlists.ownerId],
    references: [users.id],
  }),
  members: many(playlistMembers),
  tracks: many(playlistTracks),
}));

export const insertPlaylistSchema = createInsertSchema(playlists).pick({
  name: true,
  description: true,
  coverImage: true,
  ownerId: true,
  isCollaborative: true,
  privacyLevel: true,
});

// Playlist Members (for collaborative playlists)
export const playlistMembers = pgTable("playlist_members", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
  userId: integer("user_id").notNull().references(() => users.id),
  canEdit: boolean("can_edit").default(true),
  canInvite: boolean("can_invite").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const playlistMembersRelations = relations(playlistMembers, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistMembers.playlistId],
    references: [playlists.id],
  }),
  user: one(users, {
    fields: [playlistMembers.userId],
    references: [users.id],
  }),
}));

export const insertPlaylistMemberSchema = createInsertSchema(playlistMembers).pick({
  playlistId: true,
  userId: true,
  canEdit: true,
  canInvite: true,
});

// Playlist Tracks
export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
  musicShareId: integer("music_share_id").references(() => musicShares.id),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  albumCover: text("album_cover"),
  trackUrl: text("track_url"),
  service: text("service").notNull(),
  serviceTrackId: text("service_track_id"),
  addedBy: integer("added_by").notNull().references(() => users.id),
  position: integer("position").notNull(), // For track ordering
  addedAt: timestamp("added_at").defaultNow(),
});

export const playlistTracksRelations = relations(playlistTracks, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistTracks.playlistId],
    references: [playlists.id],
  }),
  musicShare: one(musicShares, {
    fields: [playlistTracks.musicShareId],
    references: [musicShares.id],
  }),
  user: one(users, {
    fields: [playlistTracks.addedBy],
    references: [users.id],
  }),
}));

export const insertPlaylistTrackSchema = createInsertSchema(playlistTracks).pick({
  playlistId: true,
  musicShareId: true,
  title: true,
  artist: true,
  album: true,
  albumCover: true,
  trackUrl: true,
  service: true,
  serviceTrackId: true,
  addedBy: true,
  position: true,
});

// Listening Sessions (for simultaneous listening)
export const listeningSessions = pgTable("listening_sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hostId: integer("host_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  currentTrackUrl: text("current_track_url"),
  currentTrackTitle: text("current_track_title"),
  currentTrackArtist: text("current_track_artist"),
  currentTrackAlbum: text("current_track_album"),
  currentTrackCover: text("current_track_cover"),
  currentPosition: integer("current_position").default(0), // In milliseconds
  isPlaying: boolean("is_playing").default(false),
  playlistId: integer("playlist_id").references(() => playlists.id),
  privacyLevel: text("privacy_level").default("public"),
  maxParticipants: integer("max_participants").default(10),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const listeningSessionsRelations = relations(listeningSessions, ({ one, many }) => ({
  host: one(users, {
    fields: [listeningSessions.hostId],
    references: [users.id],
  }),
  playlist: one(playlists, {
    fields: [listeningSessions.playlistId],
    references: [playlists.id],
  }),
  participants: many(sessionParticipants),
  chat: many(sessionChat),
}));

export const insertListeningSessionSchema = createInsertSchema(listeningSessions).pick({
  name: true,
  hostId: true,
  isActive: true,
  currentTrackUrl: true,
  currentTrackTitle: true,
  currentTrackArtist: true,
  currentTrackAlbum: true,
  currentTrackCover: true,
  playlistId: true,
  privacyLevel: true,
  maxParticipants: true,
});

// Session Participants
export const sessionParticipants = pgTable("session_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => listeningSessions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow(),
});

export const sessionParticipantsRelations = relations(sessionParticipants, ({ one }) => ({
  session: one(listeningSessions, {
    fields: [sessionParticipants.sessionId],
    references: [listeningSessions.id],
  }),
  user: one(users, {
    fields: [sessionParticipants.userId],
    references: [users.id],
  }),
}));

export const insertSessionParticipantSchema = createInsertSchema(sessionParticipants).pick({
  sessionId: true,
  userId: true,
  isActive: true,
});

// Session Chat
export const sessionChat = pgTable("session_chat", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => listeningSessions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // text, emoji, system
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionChatRelations = relations(sessionChat, ({ one }) => ({
  session: one(listeningSessions, {
    fields: [sessionChat.sessionId],
    references: [listeningSessions.id],
  }),
  user: one(users, {
    fields: [sessionChat.userId],
    references: [users.id],
  }),
}));

export const insertSessionChatSchema = createInsertSchema(sessionChat).pick({
  sessionId: true,
  userId: true,
  message: true,
  messageType: true,
});

// Listening History & Recommendations
export const listeningHistory = pgTable("listening_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  trackTitle: text("track_title").notNull(),
  trackArtist: text("track_artist").notNull(),
  trackAlbum: text("track_album"),
  trackUrl: text("track_url"),
  serviceTrackId: text("service_track_id"),
  service: text("service").notNull(),
  listenedAt: timestamp("listened_at").defaultNow(),
  listenDuration: integer("listen_duration"), // In seconds
  isShared: boolean("is_shared").default(false),
  musicShareId: integer("music_share_id").references(() => musicShares.id),
});

export const listeningHistoryRelations = relations(listeningHistory, ({ one }) => ({
  user: one(users, {
    fields: [listeningHistory.userId],
    references: [users.id],
  }),
  musicShare: one(musicShares, {
    fields: [listeningHistory.musicShareId],
    references: [musicShares.id],
  }),
}));

export const insertListeningHistorySchema = createInsertSchema(listeningHistory).pick({
  userId: true,
  trackTitle: true,
  trackArtist: true,
  trackAlbum: true,
  trackUrl: true,
  serviceTrackId: true,
  service: true,
  listenDuration: true,
  isShared: true,
  musicShareId: true,
});

// Music Recommendations 
export const musicRecommendations = pgTable("music_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  trackTitle: text("track_title").notNull(),
  trackArtist: text("track_artist").notNull(),
  trackAlbum: text("track_album"),
  albumCover: text("album_cover"),
  trackUrl: text("track_url"),
  service: text("service").notNull(),
  serviceTrackId: text("service_track_id"),
  confidence: real("confidence"), // Recommendation score
  reason: text("reason"), // Why this was recommended
  sourceType: text("source_type"), // algorithm, friend, similar-to-X
  sourceId: integer("source_id"), // Related user or track ID
  isViewed: boolean("is_viewed").default(false),
  isSaved: boolean("is_saved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const musicRecommendationsRelations = relations(musicRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [musicRecommendations.userId],
    references: [users.id],
  }),
}));

export const insertMusicRecommendationSchema = createInsertSchema(musicRecommendations).pick({
  userId: true,
  trackTitle: true,
  trackArtist: true,
  trackAlbum: true,
  albumCover: true,
  trackUrl: true,
  service: true,
  serviceTrackId: true,
  confidence: true,
  reason: true,
  sourceType: true,
  sourceId: true,
});

// User Moods (for mood-based recommendations)
export const userMoods = pgTable("user_moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mood: text("mood").notNull(), // happy, energetic, mellow, etc.
  moodEmoji: text("mood_emoji"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // When this mood expires
});

export const userMoodsRelations = relations(userMoods, ({ one }) => ({
  user: one(users, {
    fields: [userMoods.userId],
    references: [users.id],
  }),
}));

export const insertUserMoodSchema = createInsertSchema(userMoods).pick({
  userId: true,
  mood: true,
  moodEmoji: true,
  expiresAt: true,
});

// User Preferences for App Settings and Customization
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  language: text("language").default("es"),
  theme: text("theme").default("dark"),
  accentColor: text("accent_color").default("#8A2BE2"), // Default purple
  fontSizeScale: real("font_size_scale").default(1.0),
  isReducedMotion: boolean("is_reduced_motion").default(false),
  isHighContrast: boolean("is_high_contrast").default(false),
  audioQualityPreference: text("audio_quality_preference").default("high"),
  dataUsagePreference: text("data_usage_preference").default("auto"),
  autoplayEnabled: boolean("autoplay_enabled").default(true),
  visualizerEnabled: boolean("visualizer_enabled").default(true),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  language: true,
  theme: true,
  accentColor: true,
  fontSizeScale: true,
  isReducedMotion: true,
  isHighContrast: true,
  audioQualityPreference: true,
  dataUsagePreference: true,
  autoplayEnabled: true,
  visualizerEnabled: true,
});

// Custom Visualizers
export const customVisualizers = pgTable("custom_visualizers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // base type: waveform, bar, particle, etc.
  settings: jsonb("settings").default({}), // Complex settings JSON
  colors: jsonb("colors").default([]), // Array of color values
  isPublic: boolean("is_public").default(false),
  usageCount: integer("usage_count").default(0),
  previewUrl: text("preview_url"), // GIF or static image preview
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customVisualizersRelations = relations(customVisualizers, ({ one }) => ({
  user: one(users, {
    fields: [customVisualizers.userId],
    references: [users.id],
  }),
}));

export const insertCustomVisualizerSchema = createInsertSchema(customVisualizers).pick({
  userId: true,
  name: true,
  type: true,
  settings: true,
  colors: true,
  isPublic: true,
  previewUrl: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MusicService = typeof musicServices.$inferSelect;
export type InsertMusicService = z.infer<typeof insertMusicServiceSchema>;

export type Follower = typeof followers.$inferSelect;
export type InsertFollower = z.infer<typeof insertFollowerSchema>;

export type MusicShare = typeof musicShares.$inferSelect;
export type InsertMusicShare = z.infer<typeof insertMusicShareSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type DailyPrompt = typeof dailyPrompts.$inferSelect;
export type InsertDailyPrompt = z.infer<typeof insertDailyPromptSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistMember = typeof playlistMembers.$inferSelect;
export type InsertPlaylistMember = z.infer<typeof insertPlaylistMemberSchema>;

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = z.infer<typeof insertPlaylistTrackSchema>;

export type ListeningSession = typeof listeningSessions.$inferSelect;
export type InsertListeningSession = z.infer<typeof insertListeningSessionSchema>;

export type SessionParticipant = typeof sessionParticipants.$inferSelect;
export type InsertSessionParticipant = z.infer<typeof insertSessionParticipantSchema>;

export type SessionChat = typeof sessionChat.$inferSelect;
export type InsertSessionChat = z.infer<typeof insertSessionChatSchema>;

export type ListeningHistory = typeof listeningHistory.$inferSelect;
export type InsertListeningHistory = z.infer<typeof insertListeningHistorySchema>;

export type MusicRecommendation = typeof musicRecommendations.$inferSelect;
export type InsertMusicRecommendation = z.infer<typeof insertMusicRecommendationSchema>;

export type UserMood = typeof userMoods.$inferSelect;
export type InsertUserMood = z.infer<typeof insertUserMoodSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;

export type CustomVisualizer = typeof customVisualizers.$inferSelect;
export type InsertCustomVisualizer = z.infer<typeof insertCustomVisualizerSchema>;
