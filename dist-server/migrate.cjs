"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/migrate.ts
var migrate_exports = {};
__export(migrate_exports, {
  runMigration: () => runMigration
});
module.exports = __toCommonJS(migrate_exports);
var import_path2 = __toESM(require("path"), 1);
var import_migrator = require("drizzle-orm/node-postgres/migrator");
var import_migrator2 = require("drizzle-orm/pglite/migrator");

// src/db/index.ts
var import_fs = __toESM(require("fs"), 1);
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pglite = require("drizzle-orm/pglite");
var import_pg = require("pg");
var import_pglite2 = require("@electric-sql/pglite");

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminAuditLogs: () => adminAuditLogs,
  adminAuditLogsRelations: () => adminAuditLogsRelations,
  badges: () => badges,
  badgesRelations: () => badgesRelations,
  blocks: () => blocks,
  bookmarks: () => bookmarks,
  commentMentions: () => commentMentions,
  commentMentionsRelations: () => commentMentionsRelations,
  comments: () => comments,
  commentsRelations: () => commentsRelations,
  communities: () => communities,
  communitiesRelations: () => communitiesRelations,
  communityMembers: () => communityMembers,
  communityMembersRelations: () => communityMembersRelations,
  conversationMembers: () => conversationMembers,
  conversationMembersRelations: () => conversationMembersRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  follows: () => follows,
  followsRelations: () => followsRelations,
  hashtags: () => hashtags,
  hashtagsRelations: () => hashtagsRelations,
  likes: () => likes,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  moderationLogs: () => moderationLogs,
  notifications: () => notifications,
  otpVerifications: () => otpVerifications,
  pollOptions: () => pollOptions,
  pollOptionsRelations: () => pollOptionsRelations,
  pollVotes: () => pollVotes,
  pollVotesRelations: () => pollVotesRelations,
  postCollaborators: () => postCollaborators,
  postCollaboratorsRelations: () => postCollaboratorsRelations,
  postHashtags: () => postHashtags,
  postHashtagsRelations: () => postHashtagsRelations,
  postMedia: () => postMedia,
  postMentions: () => postMentions,
  postMentionsRelations: () => postMentionsRelations,
  postViews: () => postViews,
  postViewsRelations: () => postViewsRelations,
  posts: () => posts,
  postsRelations: () => postsRelations,
  profiles: () => profiles,
  projectCollaborators: () => projectCollaborators,
  projectCollaboratorsRelations: () => projectCollaboratorsRelations,
  projectComments: () => projectComments,
  projectCommentsRelations: () => projectCommentsRelations,
  projectLikes: () => projectLikes,
  projectLikesRelations: () => projectLikesRelations,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  reactions: () => reactions,
  recoveryCodes: () => recoveryCodes,
  refreshTokens: () => refreshTokens,
  reports: () => reports,
  reposts: () => reposts,
  repostsRelations: () => repostsRelations,
  securityAuditLogs: () => securityAuditLogs,
  stories: () => stories,
  storyViews: () => storyViews,
  systemSettings: () => systemSettings,
  userBadges: () => userBadges,
  userBadgesRelations: () => userBadgesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  verificationRequests: () => verificationRequests,
  verificationRequestsRelations: () => verificationRequestsRelations,
  weeklyLeaderboards: () => weeklyLeaderboards,
  weeklyLeaderboardsRelations: () => weeklyLeaderboardsRelations
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  username: (0, import_pg_core.varchar)("username", { length: 50 }).notNull().unique(),
  email: (0, import_pg_core.varchar)("email", { length: 255 }).notNull().unique(),
  passwordHash: (0, import_pg_core.text)("password_hash").notNull(),
  role: (0, import_pg_core.varchar)("role", { length: 20 }).default("USER").notNull(),
  // USER, MODERATOR, ADMIN
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  isVerified: (0, import_pg_core.boolean)("is_verified").default(false).notNull(),
  emailVerified: (0, import_pg_core.boolean)("email_verified").default(false).notNull(),
  isOfficialAccount: (0, import_pg_core.boolean)("is_official_account").default(false).notNull(),
  officialNotifyEnabled: (0, import_pg_core.boolean)("official_notify_enabled").default(true).notNull(),
  officialPriority: (0, import_pg_core.varchar)("official_priority", { length: 20 }).default("normal").notNull(),
  twoFactorEnabled: (0, import_pg_core.boolean)("two_factor_enabled").default(false).notNull(),
  twoFactorSecret: (0, import_pg_core.text)("two_factor_secret"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var profiles = (0, import_pg_core.pgTable)("profiles", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  displayName: (0, import_pg_core.varchar)("display_name", { length: 100 }),
  bio: (0, import_pg_core.text)("bio"),
  avatarUrl: (0, import_pg_core.text)("avatar_url"),
  coverUrl: (0, import_pg_core.text)("cover_url"),
  location: (0, import_pg_core.varchar)("location", { length: 100 }),
  website: (0, import_pg_core.varchar)("website", { length: 255 }),
  isPrivate: (0, import_pg_core.boolean)("is_private").default(false).notNull(),
  allowSearchEngineIndexing: (0, import_pg_core.boolean)("allow_search_engine_indexing").default(true).notNull(),
  messagePreference: (0, import_pg_core.varchar)("message_preference", { length: 20 }).default("ANYONE").notNull(),
  mentionPreference: (0, import_pg_core.varchar)("mention_preference", { length: 20 }).default("ANYONE").notNull(),
  defaultPostVisibility: (0, import_pg_core.varchar)("default_post_visibility", { length: 20 }).default("PUBLIC").notNull(),
  onboardingCompleted: (0, import_pg_core.boolean)("onboarding_completed").default(false).notNull(),
  interests: (0, import_pg_core.jsonb)("interests").default([]),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var recoveryCodes = (0, import_pg_core.pgTable)("recovery_codes", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  codeHash: (0, import_pg_core.text)("code_hash").notNull(),
  used: (0, import_pg_core.boolean)("used").default(false).notNull(),
  usedAt: (0, import_pg_core.timestamp)("used_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("recovery_codes_user_id_idx").on(t.userId)
}));
var projects = (0, import_pg_core.pgTable)("projects", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: (0, import_pg_core.varchar)("title", { length: 100 }).notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  detailedDescription: (0, import_pg_core.text)("detailed_description"),
  category: (0, import_pg_core.varchar)("category", { length: 50 }).notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull(),
  projectUrl: (0, import_pg_core.varchar)("project_url", { length: 255 }),
  githubUrl: (0, import_pg_core.varchar)("github_url", { length: 255 }),
  imageUrl: (0, import_pg_core.text)("image_url"),
  tags: (0, import_pg_core.jsonb)("tags").$type().default([]).notNull(),
  sortOrder: (0, import_pg_core.integer)("sort_order").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("projects_user_id_idx").on(t.userId)
}));
var projectLikes = (0, import_pg_core.pgTable)("project_likes", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  projectId: (0, import_pg_core.integer)("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("project_likes_user_project_unq").on(t.userId, t.projectId),
  projectIdIdx: (0, import_pg_core.index)("project_likes_project_id_idx").on(t.projectId),
  userIdIdx: (0, import_pg_core.index)("project_likes_user_id_idx").on(t.userId)
}));
var projectComments = (0, import_pg_core.pgTable)("project_comments", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  projectId: (0, import_pg_core.integer)("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: (0, import_pg_core.text)("content").notNull(),
  moderationStatus: (0, import_pg_core.varchar)("moderation_status", { length: 20 }).default("APPROVED").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  projectIdIdx: (0, import_pg_core.index)("project_comments_project_id_idx").on(t.projectId),
  userIdIdx: (0, import_pg_core.index)("project_comments_user_id_idx").on(t.userId)
}));
var posts = (0, import_pg_core.pgTable)("posts", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  communityId: (0, import_pg_core.integer)("community_id").references(() => communities.id, { onDelete: "cascade" }),
  content: (0, import_pg_core.text)("content"),
  visibility: (0, import_pg_core.varchar)("visibility", { length: 20 }).default("PUBLIC").notNull(),
  postType: (0, import_pg_core.varchar)("post_type", { length: 20 }).default("NORMAL").notNull(),
  // NORMAL, POLL, SENSITIVE
  moderationStatus: (0, import_pg_core.varchar)("moderation_status", { length: 20 }).default("APPROVED").notNull(),
  contentWarning: (0, import_pg_core.text)("content_warning"),
  baseScore: (0, import_pg_core.real)("base_score").default(0).notNull(),
  viewCount: (0, import_pg_core.integer)("view_count").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("posts_user_id_idx").on(t.userId),
  createdAtIdx: (0, import_pg_core.index)("posts_created_at_idx").on(t.createdAt),
  userCreatedAtIdx: (0, import_pg_core.index)("posts_user_id_created_at_idx").on(t.userId, t.createdAt)
}));
var pollOptions = (0, import_pg_core.pgTable)("poll_options", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  text: (0, import_pg_core.varchar)("text", { length: 255 }).notNull(),
  order: (0, import_pg_core.integer)("order").default(0).notNull()
});
var pollVotes = (0, import_pg_core.pgTable)("poll_votes", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  optionId: (0, import_pg_core.integer)("option_id").notNull().references(() => pollOptions.id, { onDelete: "cascade" }),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  uniqueVote: (0, import_pg_core.unique)("poll_votes_post_user_unique").on(t.postId, t.userId),
  optionIdx: (0, import_pg_core.index)("poll_votes_option_idx").on(t.optionId)
}));
var postMedia = (0, import_pg_core.pgTable)("post_media", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  mediaUrl: (0, import_pg_core.text)("media_url").notNull(),
  mediaType: (0, import_pg_core.varchar)("media_type", { length: 20 }).notNull(),
  // image, video
  width: (0, import_pg_core.integer)("width"),
  height: (0, import_pg_core.integer)("height"),
  duration: (0, import_pg_core.integer)("duration"),
  sortOrder: (0, import_pg_core.integer)("sort_order").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var comments = (0, import_pg_core.pgTable)("comments", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: (0, import_pg_core.integer)("parent_id").references(() => comments.id, { onDelete: "cascade" }),
  // Self-reference for replies
  content: (0, import_pg_core.text)("content").notNull(),
  moderationStatus: (0, import_pg_core.varchar)("moderation_status", { length: 20 }).default("APPROVED").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  postIdIdx: (0, import_pg_core.index)("comments_post_id_idx").on(t.postId),
  userIdIdx: (0, import_pg_core.index)("comments_user_id_idx").on(t.userId)
}));
var likes = (0, import_pg_core.pgTable)("likes", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("likes_user_post_unq").on(t.userId, t.postId),
  postIdIdx: (0, import_pg_core.index)("likes_post_id_idx").on(t.postId),
  userIdIdx: (0, import_pg_core.index)("likes_user_id_idx").on(t.userId)
}));
var reactions = (0, import_pg_core.pgTable)("reactions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: (0, import_pg_core.varchar)("type", { length: 20 }).notNull(),
  // like, love, haha, wow, sad, angry
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("reactions_user_post_unq").on(t.userId, t.postId)
}));
var bookmarks = (0, import_pg_core.pgTable)("bookmarks", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("bookmarks_user_post_unq").on(t.userId, t.postId)
}));
var postViews = (0, import_pg_core.pgTable)("post_views", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  viewedAt: (0, import_pg_core.timestamp)("viewed_at").defaultNow().notNull()
}, (t) => ({
  userPostIdx: (0, import_pg_core.index)("post_views_user_post_idx").on(t.userId, t.postId),
  postViewedAtIdx: (0, import_pg_core.index)("post_views_post_viewed_at_idx").on(t.postId, t.viewedAt)
}));
var reposts = (0, import_pg_core.pgTable)("reposts", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("reposts_user_post_unq").on(t.userId, t.postId),
  postCreatedAtIdx: (0, import_pg_core.index)("reposts_post_created_at_idx").on(t.postId, t.createdAt)
}));
var follows = (0, import_pg_core.pgTable)("follows", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  followerId: (0, import_pg_core.integer)("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: (0, import_pg_core.integer)("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  notificationPreference: (0, import_pg_core.varchar)("notification_preference", { length: 20 }).default("standard").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("follows_follower_following_unq").on(t.followerId, t.followingId),
  followerIdx: (0, import_pg_core.index)("follows_follower_idx").on(t.followerId),
  followingIdx: (0, import_pg_core.index)("follows_following_idx").on(t.followingId)
}));
var blocks = (0, import_pg_core.pgTable)("blocks", {
  blockerId: (0, import_pg_core.integer)("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: (0, import_pg_core.integer)("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.blockerId, t.blockedId] })
}));
var postMentions = (0, import_pg_core.pgTable)("post_mentions", {
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  mentionedUserId: (0, import_pg_core.integer)("mentioned_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorUserId: (0, import_pg_core.integer)("actor_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.postId, t.mentionedUserId] }),
  mentionedUserIdIdx: (0, import_pg_core.index)("post_mentions_user_idx").on(t.mentionedUserId)
}));
var commentMentions = (0, import_pg_core.pgTable)("comment_mentions", {
  commentId: (0, import_pg_core.integer)("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  mentionedUserId: (0, import_pg_core.integer)("mentioned_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorUserId: (0, import_pg_core.integer)("actor_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.commentId, t.mentionedUserId] }),
  mentionedUserIdIdx: (0, import_pg_core.index)("comment_mentions_user_idx").on(t.mentionedUserId)
}));
var hashtags = (0, import_pg_core.pgTable)("hashtags", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
  normalizedName: (0, import_pg_core.varchar)("normalized_name", { length: 100 }).notNull().unique(),
  usageCount: (0, import_pg_core.integer)("usage_count").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var postHashtags = (0, import_pg_core.pgTable)("post_hashtags", {
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  hashtagId: (0, import_pg_core.integer)("hashtag_id").notNull().references(() => hashtags.id, { onDelete: "cascade" })
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.postId, t.hashtagId] })
}));
var notifications = (0, import_pg_core.pgTable)("notifications", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  recipientId: (0, import_pg_core.integer)("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorId: (0, import_pg_core.integer)("actor_id").references(() => users.id, { onDelete: "cascade" }),
  type: (0, import_pg_core.varchar)("type", { length: 50 }).notNull(),
  // follow, like, comment, message, etc.
  postId: (0, import_pg_core.integer)("post_id").references(() => posts.id, { onDelete: "cascade" }),
  projectId: (0, import_pg_core.integer)("project_id").references(() => projects.id, { onDelete: "cascade" }),
  commentId: (0, import_pg_core.integer)("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  isRead: (0, import_pg_core.boolean)("is_read").default(false).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  recipientIdx: (0, import_pg_core.index)("notifications_recipient_idx").on(t.recipientId),
  isReadIdx: (0, import_pg_core.index)("notifications_is_read_idx").on(t.isRead),
  recipientUnreadDateIdx: (0, import_pg_core.index)("notifications_recipient_unread_date_idx").on(t.recipientId, t.isRead, t.createdAt),
  recipientCreatedAtIdx: (0, import_pg_core.index)("notifications_recipient_created_at_idx").on(t.recipientId, t.createdAt)
}));
var stories = (0, import_pg_core.pgTable)("stories", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mediaUrl: (0, import_pg_core.text)("media_url").notNull(),
  mediaType: (0, import_pg_core.varchar)("media_type", { length: 20 }).notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var storyViews = (0, import_pg_core.pgTable)("story_views", {
  storyId: (0, import_pg_core.integer)("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  viewedAt: (0, import_pg_core.timestamp)("viewed_at").defaultNow().notNull()
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.storyId, t.userId] })
}));
var conversations = (0, import_pg_core.pgTable)("conversations", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var conversationMembers = (0, import_pg_core.pgTable)("conversation_members", {
  conversationId: (0, import_pg_core.integer)("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: (0, import_pg_core.timestamp)("joined_at").defaultNow().notNull()
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.conversationId, t.userId] })
}));
var messages = (0, import_pg_core.pgTable)("messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  conversationId: (0, import_pg_core.integer)("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: (0, import_pg_core.integer)("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: (0, import_pg_core.text)("content"),
  mediaUrl: (0, import_pg_core.text)("media_url"),
  isRead: (0, import_pg_core.boolean)("is_read").default(false).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  conversationIdx: (0, import_pg_core.index)("messages_conversation_idx").on(t.conversationId),
  createdAtIdx: (0, import_pg_core.index)("messages_created_at_idx").on(t.createdAt),
  conversationCreatedAtIdx: (0, import_pg_core.index)("messages_conversation_created_at_idx").on(t.conversationId, t.createdAt)
}));
var communities = (0, import_pg_core.pgTable)("communities", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  ownerId: (0, import_pg_core.integer)("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
  slug: (0, import_pg_core.varchar)("slug", { length: 100 }).notNull().unique(),
  description: (0, import_pg_core.text)("description"),
  avatarUrl: (0, import_pg_core.text)("avatar_url"),
  coverUrl: (0, import_pg_core.text)("cover_url"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var communityMembers = (0, import_pg_core.pgTable)("community_members", {
  communityId: (0, import_pg_core.integer)("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: (0, import_pg_core.varchar)("role", { length: 20 }).default("MEMBER").notNull(),
  // OWNER, MODERATOR, MEMBER
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.communityId, t.userId] }),
  communityIdx: (0, import_pg_core.index)("community_members_community_idx").on(t.communityId),
  userIdIdx: (0, import_pg_core.index)("community_members_user_idx").on(t.userId)
}));
var reports = (0, import_pg_core.pgTable)("reports", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  reporterId: (0, import_pg_core.integer)("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: (0, import_pg_core.varchar)("target_type", { length: 50 }).notNull(),
  // user, post, comment, community
  targetId: (0, import_pg_core.integer)("target_id").notNull(),
  reason: (0, import_pg_core.text)("reason").notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("PENDING").notNull(),
  // PENDING, RESOLVED, DISMISSED
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  resolvedAt: (0, import_pg_core.timestamp)("resolved_at")
});
var refreshTokens = (0, import_pg_core.pgTable)("refresh_tokens", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: (0, import_pg_core.text)("token_hash").notNull().unique(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
  revokedAt: (0, import_pg_core.timestamp)("revoked_at"),
  deviceInfo: (0, import_pg_core.text)("device_info"),
  browser: (0, import_pg_core.varchar)("browser", { length: 100 }),
  os: (0, import_pg_core.varchar)("os", { length: 100 }),
  ipAddress: (0, import_pg_core.varchar)("ip_address", { length: 45 }),
  lastActiveAt: (0, import_pg_core.timestamp)("last_active_at").defaultNow().notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("refresh_tokens_user_id_idx").on(t.userId)
}));
var otpVerifications = (0, import_pg_core.pgTable)("otp_verifications", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  email: (0, import_pg_core.varchar)("email", { length: 255 }).notNull(),
  otpHash: (0, import_pg_core.text)("otp_hash").notNull(),
  type: (0, import_pg_core.varchar)("type", { length: 50 }).default("REGISTER").notNull(),
  attempts: (0, import_pg_core.integer)("attempts").default(0).notNull(),
  maxAttempts: (0, import_pg_core.integer)("max_attempts").default(5).notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
  lastSentAt: (0, import_pg_core.timestamp)("last_sent_at").defaultNow().notNull(),
  verifiedAt: (0, import_pg_core.timestamp)("verified_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  emailIdx: (0, import_pg_core.index)("otp_verifications_email_idx").on(t.email),
  typeIdx: (0, import_pg_core.index)("otp_verifications_type_idx").on(t.type),
  emailTypeUnique: (0, import_pg_core.unique)("otp_verifications_email_type_unique").on(t.email, t.type)
}));
var verificationRequests = (0, import_pg_core.pgTable)("verification_requests", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("pending").notNull(),
  // pending, under_review, approved, rejected
  reason: (0, import_pg_core.text)("reason").notNull(),
  adminNote: (0, import_pg_core.text)("admin_note"),
  rejectionReason: (0, import_pg_core.text)("rejection_reason"),
  reviewedBy: (0, import_pg_core.integer)("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: (0, import_pg_core.timestamp)("reviewed_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("verification_requests_user_id_idx").on(t.userId),
  statusIdx: (0, import_pg_core.index)("verification_requests_status_idx").on(t.status)
}));
var systemSettings = (0, import_pg_core.pgTable)("system_settings", {
  key: (0, import_pg_core.varchar)("key", { length: 100 }).primaryKey(),
  value: (0, import_pg_core.text)("value").notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  updatedBy: (0, import_pg_core.integer)("updated_by").references(() => users.id)
});
var securityAuditLogs = (0, import_pg_core.pgTable)("security_audit_logs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: (0, import_pg_core.varchar)("action", { length: 100 }).notNull(),
  ipAddress: (0, import_pg_core.varchar)("ip_address", { length: 45 }),
  metadata: (0, import_pg_core.jsonb)("metadata"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("security_audit_logs_user_id_idx").on(t.userId),
  actionIdx: (0, import_pg_core.index)("security_audit_logs_action_idx").on(t.action)
}));
var adminAuditLogs = (0, import_pg_core.pgTable)("admin_audit_logs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  adminUserId: (0, import_pg_core.integer)("admin_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: (0, import_pg_core.varchar)("action", { length: 100 }).notNull(),
  targetType: (0, import_pg_core.varchar)("target_type", { length: 50 }).notNull(),
  // e.g., 'user', 'verification_request'
  targetId: (0, import_pg_core.varchar)("target_id", { length: 50 }).notNull(),
  metadata: (0, import_pg_core.jsonb)("metadata"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  adminUserIdIdx: (0, import_pg_core.index)("admin_audit_logs_admin_user_id_idx").on(t.adminUserId),
  actionIdx: (0, import_pg_core.index)("admin_audit_logs_action_idx").on(t.action)
}));
var projectCollaborators = (0, import_pg_core.pgTable)("project_collaborators", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  projectId: (0, import_pg_core.integer)("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("pending").notNull(),
  // pending, accepted, rejected, cancelled
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  projectIdx: (0, import_pg_core.index)("project_collaborators_project_id_idx").on(t.projectId),
  userIdx: (0, import_pg_core.index)("project_collaborators_user_id_idx").on(t.userId),
  uniqueUserProject: (0, import_pg_core.unique)("project_collaborators_unique_user_project").on(t.projectId, t.userId)
}));
var postCollaborators = (0, import_pg_core.pgTable)("post_collaborators", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("pending").notNull(),
  // pending, accepted, rejected, cancelled
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  postIdx: (0, import_pg_core.index)("post_collaborators_post_id_idx").on(t.postId),
  userIdx: (0, import_pg_core.index)("post_collaborators_user_id_idx").on(t.userId),
  uniqueUserPost: (0, import_pg_core.unique)("post_collaborators_unique_user_post").on(t.postId, t.userId)
}));
var usersRelations = (0, import_drizzle_orm.relations)(users, ({ one, many }) => ({
  weeklyLeaderboards: many(weeklyLeaderboards),
  userBadges: many(userBadges),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId]
  }),
  projects: many(projects),
  projectLikes: many(projectLikes),
  projectComments: many(projectComments),
  posts: many(posts),
  likes: many(likes),
  mentions: many(commentMentions),
  comments: many(comments),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  bookmarks: many(bookmarks),
  reactions: many(reactions),
  notificationsReceived: many(notifications, { relationName: "recipient" }),
  notificationsSent: many(notifications, { relationName: "actor" }),
  stories: many(stories),
  conversationMemberships: many(conversationMembers),
  messages: many(messages),
  communitiesOwned: many(communities),
  communityMemberships: many(communityMembers),
  reports: many(reports),
  refreshTokens: many(refreshTokens),
  blocksInitiated: many(blocks, { relationName: "blocker" }),
  blocksReceived: many(blocks, { relationName: "blocked" }),
  postViews: many(postViews),
  reposts: many(reposts),
  verificationRequests: many(verificationRequests),
  verificationReviews: many(verificationRequests, { relationName: "reviewer" }),
  adminAuditLogs: many(adminAuditLogs),
  projectCollaborators: many(projectCollaborators),
  postCollaborators: many(postCollaborators)
}));
var postsRelations = (0, import_drizzle_orm.relations)(posts, ({ one, many }) => ({
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id]
  }),
  author: one(users, {
    fields: [posts.userId],
    references: [users.id]
  }),
  media: many(postMedia),
  likes: many(likes),
  comments: many(comments),
  bookmarks: many(bookmarks),
  reactions: many(reactions),
  hashtags: many(postHashtags),
  mentions: many(postMentions),
  views: many(postViews),
  reposts: many(reposts),
  collaborators: many(postCollaborators),
  pollOptions: many(pollOptions)
}));
var pollOptionsRelations = (0, import_drizzle_orm.relations)(pollOptions, ({ one, many }) => ({
  post: one(posts, {
    fields: [pollOptions.postId],
    references: [posts.id]
  }),
  votes: many(pollVotes)
}));
var pollVotesRelations = (0, import_drizzle_orm.relations)(pollVotes, ({ one }) => ({
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id]
  }),
  post: one(posts, {
    fields: [pollVotes.postId],
    references: [posts.id]
  }),
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id]
  })
}));
var commentsRelations = (0, import_drizzle_orm.relations)(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id]
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies"
  }),
  replies: many(comments, { relationName: "replies" })
}));
var hashtagsRelations = (0, import_drizzle_orm.relations)(hashtags, ({ many }) => ({
  posts: many(postHashtags)
}));
var postHashtagsRelations = (0, import_drizzle_orm.relations)(postHashtags, ({ one }) => ({
  post: one(posts, {
    fields: [postHashtags.postId],
    references: [posts.id]
  }),
  hashtag: one(hashtags, {
    fields: [postHashtags.hashtagId],
    references: [hashtags.id]
  })
}));
var conversationsRelations = (0, import_drizzle_orm.relations)(conversations, ({ many }) => ({
  members: many(conversationMembers),
  messages: many(messages)
}));
var conversationMembersRelations = (0, import_drizzle_orm.relations)(conversationMembers, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationMembers.conversationId],
    references: [conversations.id]
  }),
  user: one(users, {
    fields: [conversationMembers.userId],
    references: [users.id]
  })
}));
var messagesRelations = (0, import_drizzle_orm.relations)(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
}));
var followsRelations = (0, import_drizzle_orm.relations)(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower"
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following"
  })
}));
var postViewsRelations = (0, import_drizzle_orm.relations)(postViews, ({ one }) => ({
  user: one(users, {
    fields: [postViews.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [postViews.postId],
    references: [posts.id]
  })
}));
var repostsRelations = (0, import_drizzle_orm.relations)(reposts, ({ one }) => ({
  user: one(users, {
    fields: [reposts.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [reposts.postId],
    references: [posts.id]
  })
}));
var projectsRelations = (0, import_drizzle_orm.relations)(projects, ({ one, many }) => ({
  likes: many(projectLikes),
  comments: many(projectComments),
  user: one(users, {
    fields: [projects.userId],
    references: [users.id]
  })
}));
var projectLikesRelations = (0, import_drizzle_orm.relations)(projectLikes, ({ one }) => ({
  user: one(users, {
    fields: [projectLikes.userId],
    references: [users.id]
  }),
  project: one(projects, {
    fields: [projectLikes.projectId],
    references: [projects.id]
  })
}));
var projectCommentsRelations = (0, import_drizzle_orm.relations)(projectComments, ({ one }) => ({
  author: one(users, {
    fields: [projectComments.userId],
    references: [users.id]
  }),
  project: one(projects, {
    fields: [projectComments.projectId],
    references: [projects.id]
  })
}));
var verificationRequestsRelations = (0, import_drizzle_orm.relations)(verificationRequests, ({ one }) => ({
  user: one(users, {
    fields: [verificationRequests.userId],
    references: [users.id]
  }),
  reviewer: one(users, {
    fields: [verificationRequests.reviewedBy],
    references: [users.id],
    relationName: "reviewer"
  })
}));
var adminAuditLogsRelations = (0, import_drizzle_orm.relations)(adminAuditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLogs.adminUserId],
    references: [users.id]
  })
}));
var communitiesRelations = (0, import_drizzle_orm.relations)(communities, ({ one, many }) => ({
  posts: many(posts),
  owner: one(users, {
    fields: [communities.ownerId],
    references: [users.id]
  }),
  members: many(communityMembers)
}));
var communityMembersRelations = (0, import_drizzle_orm.relations)(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id]
  }),
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id]
  })
}));
var projectCollaboratorsRelations = (0, import_drizzle_orm.relations)(projectCollaborators, ({ one }) => ({
  project: one(projects, {
    fields: [projectCollaborators.projectId],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [projectCollaborators.userId],
    references: [users.id]
  })
}));
var postCollaboratorsRelations = (0, import_drizzle_orm.relations)(postCollaborators, ({ one }) => ({
  post: one(posts, {
    fields: [postCollaborators.postId],
    references: [posts.id]
  }),
  user: one(users, {
    fields: [postCollaborators.userId],
    references: [users.id]
  })
}));
var postMentionsRelations = (0, import_drizzle_orm.relations)(postMentions, ({ one }) => ({
  post: one(posts, {
    fields: [postMentions.postId],
    references: [posts.id]
  }),
  mentionedUser: one(users, {
    fields: [postMentions.mentionedUserId],
    references: [users.id]
  }),
  actorUser: one(users, {
    fields: [postMentions.actorUserId],
    references: [users.id]
  })
}));
var commentMentionsRelations = (0, import_drizzle_orm.relations)(commentMentions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentMentions.commentId],
    references: [comments.id]
  }),
  mentionedUser: one(users, {
    fields: [commentMentions.mentionedUserId],
    references: [users.id]
  }),
  actorUser: one(users, {
    fields: [commentMentions.actorUserId],
    references: [users.id]
  })
}));
var moderationLogs = (0, import_pg_core.pgTable)("moderation_logs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  entityType: (0, import_pg_core.varchar)("entity_type", { length: 20 }).notNull(),
  // 'POST', 'COMMENT'
  entityId: (0, import_pg_core.integer)("entity_id").notNull(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("PENDING").notNull(),
  // 'PENDING', 'REVIEWED', 'APPEALED', 'RESOLVED'
  actionTaken: (0, import_pg_core.varchar)("action_taken", { length: 20 }),
  // 'APPROVED', 'REJECTED'
  riskLevel: (0, import_pg_core.varchar)("risk_level", { length: 20 }).notNull(),
  // 'SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'
  category: (0, import_pg_core.varchar)("category", { length: 50 }),
  reason: (0, import_pg_core.text)("reason"),
  adminId: (0, import_pg_core.integer)("admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  entityIdx: (0, import_pg_core.index)("mod_logs_entity_idx").on(t.entityType, t.entityId),
  userIdIdx: (0, import_pg_core.index)("mod_logs_user_id_idx").on(t.userId),
  statusIdx: (0, import_pg_core.index)("mod_logs_status_idx").on(t.status)
}));
var weeklyLeaderboards = (0, import_pg_core.pgTable)("weekly_leaderboards", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStart: (0, import_pg_core.timestamp)("week_start").notNull(),
  weekEnd: (0, import_pg_core.timestamp)("week_end").notNull(),
  rank: (0, import_pg_core.integer)("rank").notNull(),
  score: (0, import_pg_core.real)("score").default(0).notNull(),
  productionScore: (0, import_pg_core.real)("production_score").default(0).notNull(),
  communityScore: (0, import_pg_core.real)("community_score").default(0).notNull(),
  qualityScore: (0, import_pg_core.real)("quality_score").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq_user_week: (0, import_pg_core.unique)("weekly_leaderboards_user_week_unq").on(t.userId, t.weekStart),
  weekStartIdx: (0, import_pg_core.index)("weekly_leaderboards_week_start_idx").on(t.weekStart),
  rankIdx: (0, import_pg_core.index)("weekly_leaderboards_rank_idx").on(t.rank),
  userIdIdx: (0, import_pg_core.index)("weekly_leaderboards_user_id_idx").on(t.userId)
}));
var badges = (0, import_pg_core.pgTable)("badges", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  key: (0, import_pg_core.varchar)("key", { length: 50 }).notNull().unique(),
  // e.g., 'WEEKLY_TOP_1'
  name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  iconUrl: (0, import_pg_core.varchar)("icon_url", { length: 255 }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var userBadges = (0, import_pg_core.pgTable)("user_badges", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: (0, import_pg_core.integer)("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  metadata: (0, import_pg_core.jsonb)("metadata").$type().default({}),
  // e.g., { weekStart: '2023-10-01' }
  awardedAt: (0, import_pg_core.timestamp)("awarded_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("user_badges_user_id_idx").on(t.userId),
  badgeIdIdx: (0, import_pg_core.index)("user_badges_badge_id_idx").on(t.badgeId)
}));
var weeklyLeaderboardsRelations = (0, import_drizzle_orm.relations)(weeklyLeaderboards, ({ one }) => ({
  user: one(users, {
    fields: [weeklyLeaderboards.userId],
    references: [users.id]
  })
}));
var userBadgesRelations = (0, import_drizzle_orm.relations)(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id]
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id]
  })
}));
var badgesRelations = (0, import_drizzle_orm.relations)(badges, ({ many }) => ({
  users: many(userBadges)
}));

// src/db/index.ts
var import_path = __toESM(require("path"), 1);
var createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is missing");
    }
    return null;
  }
  if (!global._postgresPool) {
    global._postgresPool = new import_pg.Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 15e3
    });
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var createPglite = () => {
  if (!global._pgliteClient) {
    console.warn("=========================================================");
    console.warn("\u26A0\uFE0F  UYARI: DATABASE_URL ortam de\u011Fi\u015Fkeni bulunamad\u0131!");
    console.warn("Lokal PGlite (WASM) fallback veritaban\u0131 ba\u015Flat\u0131l\u0131yor...");
    console.warn("T\xFCm verileriniz ./database klas\xF6r\xFCne kaydedilecektir.");
    console.warn("=========================================================");
    const dbPath = import_path.default.join(process.cwd(), "database");
    const pidPath = import_path.default.join(dbPath, "postmaster.pid");
    const optsPath = import_path.default.join(dbPath, "postmaster.opts");
    if (import_fs.default.existsSync(pidPath)) {
      try {
        import_fs.default.unlinkSync(pidPath);
      } catch (_) {
      }
    }
    if (import_fs.default.existsSync(optsPath)) {
      try {
        import_fs.default.unlinkSync(optsPath);
      } catch (_) {
      }
    }
    try {
      global._pgliteClient = new import_pglite2.PGlite(dbPath);
    } catch (err) {
      console.error("PGlite initialization failed. Backing up existing database directory...", err);
      try {
        const backupPath = import_path.default.join(process.cwd(), `database_backup_${Date.now()}`);
        if (import_fs.default.existsSync(dbPath)) {
          import_fs.default.renameSync(dbPath, backupPath);
          console.warn(`Old database backed up to: ${backupPath}`);
        }
        global._pgliteClient = new import_pglite2.PGlite(dbPath);
      } catch (retryErr) {
        console.error("Failed to initialize PGlite:", retryErr);
        throw retryErr;
      }
    }
  }
  return global._pgliteClient;
};
var getDb = () => {
  if (global._dbInstance) return global._dbInstance;
  const pool = createPool();
  if (pool) {
    global._dbInstance = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is missing");
    }
    const client = createPglite();
    global._dbInstance = (0, import_pglite.drizzle)(client, { schema: schema_exports });
  }
  return global._dbInstance;
};
var db = new Proxy({}, {
  get(target, prop) {
    const instance = getDb();
    const value = instance[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  }
});

// server/migrate.ts
async function runMigration(isStandalone = false) {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }
  let exitCode = 0;
  console.log("\u{1F680} Starting database migration...");
  try {
    const pool = createPool();
    if (pool) {
      await (0, import_migrator.migrate)(db, { migrationsFolder: import_path2.default.join(process.cwd(), "migrations") });
    } else {
      await (0, import_migrator2.migrate)(db, { migrationsFolder: import_path2.default.join(process.cwd(), "migrations") });
    }
    console.log("\u2705 Database migrations completed successfully.");
  } catch (error) {
    const errorCode = error?.code || error?.cause?.code;
    const errorMsg = String(error?.message || error?.cause?.message || "");
    if (errorCode === "42P07" || errorCode === "42710" || errorCode === "42701" || errorMsg.includes("already exists")) {
      console.warn("\u26A0\uFE0F Veritaban\u0131 tablolar\u0131 veya \u015Fema nesneleri zaten mevcut (" + (errorCode || "already exists") + ").");
      console.log("\u2139\uFE0F Mevcut veritaban\u0131 \u015Femas\u0131 korunarak devam ediliyor.");
      exitCode = 0;
    } else {
      console.error("\u274C Database migration failed:", error);
      exitCode = 1;
    }
  } finally {
    if (isStandalone) {
      try {
        if (global._postgresPool) {
          await global._postgresPool.end();
        }
        if (global._pgliteClient) {
          await global._pgliteClient.close();
        }
      } catch (e) {
      }
      process.exit(exitCode);
    }
  }
}
if (process.argv[1] && process.argv[1].includes("migrate")) {
  runMigration(true);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  runMigration
});
//# sourceMappingURL=migrate.cjs.map
