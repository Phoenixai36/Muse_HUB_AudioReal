import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    displayName: true,
    avatar: true,
    bio: true,
  })
  .extend({
    confirmPassword: z.string(),
  });

// MusicServices enum for service types
export const MusicServiceEnum = z.enum([
  "spotify",
  "apple_music",
  "youtube_music",
  "other",
]);

// User's music service connections
export const musicServices = pgTable("music_services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  service: text("service").notNull(), // spotify, apple_music, youtube_music, etc.
  isConnected: boolean("is_connected").default(false),
});

export const insertMusicServiceSchema = createInsertSchema(musicServices).pick({
  userId: true,
  service: true,
  isConnected: true,
});

// Followers relationship
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFollowerSchema = createInsertSchema(followers).pick({
  followerId: true,
  followingId: true,
});

// Music shares (posts)
export const musicShares = pgTable("music_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  albumCover: text("album_cover"),
  trackUrl: text("track_url"),
  service: text("service").notNull(), // spotify, apple_music, youtube_music, etc.
  content: text("content"), // Caption/description
  createdAt: timestamp("created_at").defaultNow(),
  promptId: integer("prompt_id").references(() => dailyPrompts.id),
});

export const insertMusicShareSchema = createInsertSchema(musicShares).pick({
  userId: true,
  title: true,
  artist: true,
  album: true,
  albumCover: true,
  trackUrl: true,
  service: true,
  content: true,
  promptId: true,
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  musicShareId: integer("music_share_id").notNull().references(() => musicShares.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  musicShareId: true,
  userId: true,
  content: true,
});

// Likes
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  musicShareId: integer("music_share_id").notNull().references(() => musicShares.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  musicShareId: true,
  userId: true,
});

// Daily prompts for music sharing
export const dailyPrompts = pgTable("daily_prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").default(true),
});

export const insertDailyPromptSchema = createInsertSchema(dailyPrompts).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  isActive: true,
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // like, comment, follow, prompt, etc.
  content: text("content").notNull(),
  sourceId: integer("source_id"), // ID of related entity (like, comment, etc.)
  sourceUserId: integer("source_user_id").references(() => users.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  content: true,
  sourceId: true,
  sourceUserId: true,
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
