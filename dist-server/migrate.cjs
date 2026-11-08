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
var import_drizzle_orm2 = require("drizzle-orm");

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
  ageVerificationLogs: () => ageVerificationLogs,
  ageVerificationLogsRelations: () => ageVerificationLogsRelations,
  announcementViews: () => announcementViews,
  announcementViewsRelations: () => announcementViewsRelations,
  announcements: () => announcements,
  announcementsRelations: () => announcementsRelations,
  appeals: () => appeals,
  appealsRelations: () => appealsRelations,
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
  communityAuditLogs: () => communityAuditLogs,
  communityJoinRequests: () => communityJoinRequests,
  communityMembers: () => communityMembers,
  communityMembersRelations: () => communityMembersRelations,
  conversationMembers: () => conversationMembers,
  conversationMembersRelations: () => conversationMembersRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  feedbacks: () => feedbacks,
  feedbacksRelations: () => feedbacksRelations,
  follows: () => follows,
  followsRelations: () => followsRelations,
  hashtags: () => hashtags,
  hashtagsRelations: () => hashtagsRelations,
  leagueMatchAnswers: () => leagueMatchAnswers,
  leagueMatchQuestions: () => leagueMatchQuestions,
  leagueMatches: () => leagueMatches,
  leagueParticipants: () => leagueParticipants,
  leagueQuestionOptions: () => leagueQuestionOptions,
  leagueQuestions: () => leagueQuestions,
  leagueSeasons: () => leagueSeasons,
  likes: () => likes,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  moderationLogs: () => moderationLogs,
  notificationPreferences: () => notificationPreferences,
  notificationPreferencesRelations: () => notificationPreferencesRelations,
  notifications: () => notifications,
  otpVerifications: () => otpVerifications,
  parentalControls: () => parentalControls,
  parentalControlsRelations: () => parentalControlsRelations,
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
  quizAnswers: () => quizAnswers,
  quizInvites: () => quizInvites,
  quizQuestionSetItems: () => quizQuestionSetItems,
  quizQuestionSets: () => quizQuestionSets,
  quizResults: () => quizResults,
  quizRoomPlayers: () => quizRoomPlayers,
  quizRoomQuestions: () => quizRoomQuestions,
  quizRooms: () => quizRooms,
  reactions: () => reactions,
  recoveryCodes: () => recoveryCodes,
  refreshTokens: () => refreshTokens,
  reports: () => reports,
  reposts: () => reposts,
  repostsRelations: () => repostsRelations,
  securityAuditLogs: () => securityAuditLogs,
  stories: () => stories,
  storyViews: () => storyViews,
  supportTicketMessages: () => supportTicketMessages,
  supportTicketMessagesRelations: () => supportTicketMessagesRelations,
  supportTickets: () => supportTickets,
  supportTicketsRelations: () => supportTicketsRelations,
  systemSettings: () => systemSettings,
  teknofestCategories: () => teknofestCategories,
  teknofestCategoriesRelations: () => teknofestCategoriesRelations,
  teknofestEvents: () => teknofestEvents,
  teknofestEventsRelations: () => teknofestEventsRelations,
  teknofestMedia: () => teknofestMedia,
  teknofestMediaRelations: () => teknofestMediaRelations,
  teknofestMemories: () => teknofestMemories,
  teknofestMemoriesRelations: () => teknofestMemoriesRelations,
  teknofestTimelineItems: () => teknofestTimelineItems,
  teknofestTimelineItemsRelations: () => teknofestTimelineItemsRelations,
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
  // Child Safety & Age Verification (10 Ekim 2026 Yönetmeliği)
  isMinor: (0, import_pg_core.boolean)("is_minor").default(false).notNull(),
  ageVerificationStatus: (0, import_pg_core.varchar)("age_verification_status", { length: 30 }).default("UNVERIFIED").notNull(),
  // UNVERIFIED, VERIFIED_CHILD, VERIFIED_ADULT, REJECTED_UNDERAGE
  ageVerificationToken: (0, import_pg_core.text)("age_verification_token"),
  ageVerifiedAt: (0, import_pg_core.timestamp)("age_verified_at"),
  ageVerificationMethod: (0, import_pg_core.varchar)("age_verification_method", { length: 50 }),
  // NV_KPS, E_DEVLET, DECLARATION
  bannedAt: (0, import_pg_core.timestamp)("banned_at"),
  banReason: (0, import_pg_core.text)("ban_reason"),
  banExpiresAt: (0, import_pg_core.timestamp)("ban_expires_at"),
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
  birthDate: (0, import_pg_core.timestamp)("birth_date"),
  // Minor safety features
  isScreenshotProtected: (0, import_pg_core.boolean)("is_screenshot_protected").default(false).notNull(),
  dailyScreenTimeLimitMinutes: (0, import_pg_core.integer)("daily_screen_time_limit_minutes").default(120),
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
  // NORMAL, POLL, SENSITIVE, QUOTE
  quotedPostId: (0, import_pg_core.integer)("quoted_post_id").references(() => posts.id, { onDelete: "set null" }),
  // Self-reference for quotes
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
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("accepted").notNull(),
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
  projectCommentId: (0, import_pg_core.integer)("project_comment_id").references(() => projectComments.id, { onDelete: "cascade" }),
  communityId: (0, import_pg_core.integer)("community_id").references(() => communities.id, { onDelete: "cascade" }),
  isRead: (0, import_pg_core.boolean)("is_read").default(false).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  recipientIdx: (0, import_pg_core.index)("notifications_recipient_idx").on(t.recipientId),
  isReadIdx: (0, import_pg_core.index)("notifications_is_read_idx").on(t.isRead),
  recipientUnreadDateIdx: (0, import_pg_core.index)("notifications_recipient_unread_date_idx").on(t.recipientId, t.isRead, t.createdAt),
  recipientCreatedAtIdx: (0, import_pg_core.index)("notifications_recipient_created_at_idx").on(t.recipientId, t.createdAt),
  communityIdx: (0, import_pg_core.index)("notifications_community_idx").on(t.communityId)
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
  category: (0, import_pg_core.varchar)("category", { length: 50 }).default("Genel").notNull(),
  isPrivate: (0, import_pg_core.boolean)("is_private").default(false).notNull(),
  rules: (0, import_pg_core.text)("rules"),
  deletedAt: (0, import_pg_core.timestamp)("deleted_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  deletedAtIdx: (0, import_pg_core.index)("communities_deleted_at_idx").on(t.deletedAt),
  ownerIdIdx: (0, import_pg_core.index)("communities_owner_id_idx").on(t.ownerId),
  categoryIdx: (0, import_pg_core.index)("communities_category_idx").on(t.category)
}));
var communityMembers = (0, import_pg_core.pgTable)("community_members", {
  communityId: (0, import_pg_core.integer)("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: (0, import_pg_core.varchar)("role", { length: 20 }).default("MEMBER").notNull(),
  // OWNER, MODERATOR (or ADMIN), MEMBER
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  pk: (0, import_pg_core.primaryKey)({ columns: [t.communityId, t.userId] }),
  communityIdx: (0, import_pg_core.index)("community_members_community_idx").on(t.communityId),
  userIdIdx: (0, import_pg_core.index)("community_members_user_idx").on(t.userId),
  roleIdx: (0, import_pg_core.index)("community_members_role_idx").on(t.role)
}));
var communityJoinRequests = (0, import_pg_core.pgTable)("community_join_requests", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  communityId: (0, import_pg_core.integer)("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("PENDING").notNull(),
  // PENDING, ACCEPTED, REJECTED
  note: (0, import_pg_core.text)("note"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("community_join_requests_user_community_unq").on(t.communityId, t.userId),
  communityIdx: (0, import_pg_core.index)("community_join_requests_community_idx").on(t.communityId),
  userIdIdx: (0, import_pg_core.index)("community_join_requests_user_idx").on(t.userId),
  statusIdx: (0, import_pg_core.index)("community_join_requests_status_idx").on(t.status)
}));
var communityAuditLogs = (0, import_pg_core.pgTable)("community_audit_logs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  communityId: (0, import_pg_core.integer)("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  actorId: (0, import_pg_core.integer)("actor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetUserId: (0, import_pg_core.integer)("target_user_id").references(() => users.id, { onDelete: "set null" }),
  action: (0, import_pg_core.varchar)("action", { length: 50 }).notNull(),
  // ADMIN_ADDED, ADMIN_REMOVED, MEMBER_REMOVED, OWNERSHIP_TRANSFERRED, SETTINGS_UPDATED, COMMUNITY_DELETED, REQUEST_ACCEPTED, REQUEST_REJECTED
  details: (0, import_pg_core.text)("details"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  communityIdx: (0, import_pg_core.index)("community_audit_logs_community_idx").on(t.communityId),
  actorIdx: (0, import_pg_core.index)("community_audit_logs_actor_idx").on(t.actorId),
  createdAtIdx: (0, import_pg_core.index)("community_audit_logs_created_at_idx").on(t.createdAt)
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
var notificationPreferences = (0, import_pg_core.pgTable)("notification_preferences", {
  userId: (0, import_pg_core.integer)("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  pushEnabled: (0, import_pg_core.boolean)("push_enabled").default(true).notNull(),
  emailEnabled: (0, import_pg_core.boolean)("email_enabled").default(true).notNull(),
  likes: (0, import_pg_core.boolean)("likes").default(true).notNull(),
  comments: (0, import_pg_core.boolean)("comments").default(true).notNull(),
  mentions: (0, import_pg_core.boolean)("mentions").default(true).notNull(),
  follows: (0, import_pg_core.boolean)("follows").default(true).notNull(),
  messages: (0, import_pg_core.boolean)("messages").default(true).notNull(),
  newsletters: (0, import_pg_core.boolean)("newsletters").default(false).notNull()
});
var notificationPreferencesRelations = (0, import_drizzle_orm.relations)(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id]
  })
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
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId]
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
  postCollaborators: many(postCollaborators),
  announcementsCreated: many(announcements),
  announcementViews: many(announcementViews),
  appeals: many(appeals, { relationName: "appealingUser" }),
  appealsReviewed: many(appeals, { relationName: "appealReviewer" })
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
  quotedPost: one(posts, {
    fields: [posts.quotedPostId],
    references: [posts.id]
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
var supportTickets = (0, import_pg_core.pgTable)("support_tickets", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: (0, import_pg_core.varchar)("category", { length: 50 }).notNull(),
  subject: (0, import_pg_core.varchar)("subject", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("OPEN").notNull(),
  // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var supportTicketMessages = (0, import_pg_core.pgTable)("support_ticket_messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  ticketId: (0, import_pg_core.integer)("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: (0, import_pg_core.text)("message").notNull(),
  isAdmin: (0, import_pg_core.boolean)("is_admin").default(false).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var feedbacks = (0, import_pg_core.pgTable)("feedbacks", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: (0, import_pg_core.varchar)("type", { length: 50 }).notNull(),
  // FEATURE_REQUEST, BUG_REPORT, UI_UX, PERFORMANCE, GENERAL
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("NEW").notNull(),
  // NEW, REVIEWED, IN_PROGRESS, RESOLVED, REJECTED
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var supportTicketsRelations = (0, import_drizzle_orm.relations)(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id]
  }),
  messages: many(supportTicketMessages)
}));
var supportTicketMessagesRelations = (0, import_drizzle_orm.relations)(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketMessages.ticketId],
    references: [supportTickets.id]
  }),
  user: one(users, {
    fields: [supportTicketMessages.userId],
    references: [users.id]
  })
}));
var feedbacksRelations = (0, import_drizzle_orm.relations)(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id]
  })
}));
var announcements = (0, import_pg_core.pgTable)("announcements", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  imageUrl: (0, import_pg_core.text)("image_url"),
  buttonText: (0, import_pg_core.varchar)("button_text", { length: 100 }),
  buttonUrl: (0, import_pg_core.text)("button_url"),
  status: (0, import_pg_core.varchar)("status", { length: 30 }).default("draft").notNull(),
  // 'draft' | 'scheduled' | 'published' | 'archived'
  targetType: (0, import_pg_core.varchar)("target_type", { length: 30 }).default("all").notNull(),
  // 'all' | 'authenticated' | 'specific_role'
  targetRole: (0, import_pg_core.varchar)("target_role", { length: 50 }),
  // 'USER' | 'ADMIN' | 'MODERATOR'
  priority: (0, import_pg_core.integer)("priority").default(0).notNull(),
  // higher integer = higher priority
  startsAt: (0, import_pg_core.timestamp)("starts_at"),
  endsAt: (0, import_pg_core.timestamp)("ends_at"),
  createdBy: (0, import_pg_core.integer)("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  statusIdx: (0, import_pg_core.index)("announcements_status_idx").on(t.status),
  startsEndsIdx: (0, import_pg_core.index)("announcements_starts_ends_idx").on(t.startsAt, t.endsAt),
  createdAtIdx: (0, import_pg_core.index)("announcements_created_at_idx").on(t.createdAt)
}));
var announcementViews = (0, import_pg_core.pgTable)("announcement_views", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  announcementId: (0, import_pg_core.integer)("announcement_id").notNull().references(() => announcements.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  seenAt: (0, import_pg_core.timestamp)("seen_at").defaultNow().notNull(),
  dismissedAt: (0, import_pg_core.timestamp)("dismissed_at"),
  clickedCta: (0, import_pg_core.boolean)("clicked_cta").default(false).notNull()
}, (t) => ({
  unqUserAnnouncement: (0, import_pg_core.unique)("announcement_views_user_announcement_unq").on(t.announcementId, t.userId),
  announcementIdx: (0, import_pg_core.index)("announcement_views_announcement_idx").on(t.announcementId),
  userIdx: (0, import_pg_core.index)("announcement_views_user_idx").on(t.userId)
}));
var announcementsRelations = (0, import_drizzle_orm.relations)(announcements, ({ one, many }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id]
  }),
  views: many(announcementViews)
}));
var announcementViewsRelations = (0, import_drizzle_orm.relations)(announcementViews, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementViews.announcementId],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [announcementViews.userId],
    references: [users.id]
  })
}));
var appeals = (0, import_pg_core.pgTable)("appeals", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appealType: (0, import_pg_core.varchar)("appeal_type", { length: 50 }).default("ACCOUNT_SUSPENSION").notNull(),
  // 'ACCOUNT_SUSPENSION', 'AGE_VERIFICATION_DISPUTE', 'CHILD_SAFETY_RESTRICTION'
  banReason: (0, import_pg_core.text)("ban_reason"),
  reason: (0, import_pg_core.text)("reason").notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("PENDING").notNull(),
  // 'PENDING', 'APPROVED', 'REJECTED'
  adminResponse: (0, import_pg_core.text)("admin_response"),
  reviewedBy: (0, import_pg_core.integer)("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  humanReviewNotes: (0, import_pg_core.text)("human_review_notes"),
  reviewedAt: (0, import_pg_core.timestamp)("reviewed_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("appeals_user_id_idx").on(t.userId),
  statusIdx: (0, import_pg_core.index)("appeals_status_idx").on(t.status),
  createdAtIdx: (0, import_pg_core.index)("appeals_created_at_idx").on(t.createdAt)
}));
var parentalControls = (0, import_pg_core.pgTable)("parental_controls", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  childUserId: (0, import_pg_core.integer)("child_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentEmail: (0, import_pg_core.varchar)("parent_email", { length: 255 }).notNull(),
  pairingCode: (0, import_pg_core.varchar)("pairing_code", { length: 32 }).notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("PENDING").notNull(),
  // PENDING, ACTIVE, REVOKED
  dailyScreenTimeMinutes: (0, import_pg_core.integer)("daily_screen_time_minutes").default(120).notNull(),
  messagingRestricted: (0, import_pg_core.boolean)("messaging_restricted").default(true).notNull(),
  nightModeEnforced: (0, import_pg_core.boolean)("night_mode_enforced").default(true).notNull(),
  attempts: (0, import_pg_core.integer)("attempts").default(0).notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at"),
  lastNotifiedAt: (0, import_pg_core.timestamp)("last_notified_at"),
  pairedAt: (0, import_pg_core.timestamp)("paired_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  childIdx: (0, import_pg_core.index)("parental_controls_child_idx").on(t.childUserId),
  unqChild: (0, import_pg_core.unique)("parental_controls_child_unq").on(t.childUserId)
}));
var ageVerificationLogs = (0, import_pg_core.pgTable)("age_verification_logs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: (0, import_pg_core.varchar)("action", { length: 50 }).notNull(),
  // VERIFICATION_ATTEMPT, VERIFIED_CHILD, VERIFIED_ADULT, REJECTED_UNDERAGE, REVERTED
  calculatedAge: (0, import_pg_core.integer)("calculated_age"),
  verificationMethod: (0, import_pg_core.varchar)("verification_method", { length: 50 }).notNull(),
  tokenHash: (0, import_pg_core.text)("token_hash"),
  ipHash: (0, import_pg_core.varchar)("ip_hash", { length: 128 }),
  notes: (0, import_pg_core.text)("notes"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  userIdIdx: (0, import_pg_core.index)("age_verification_logs_user_idx").on(t.userId)
}));
var parentalControlsRelations = (0, import_drizzle_orm.relations)(parentalControls, ({ one }) => ({
  child: one(users, {
    fields: [parentalControls.childUserId],
    references: [users.id]
  })
}));
var ageVerificationLogsRelations = (0, import_drizzle_orm.relations)(ageVerificationLogs, ({ one }) => ({
  user: one(users, {
    fields: [ageVerificationLogs.userId],
    references: [users.id]
  })
}));
var appealsRelations = (0, import_drizzle_orm.relations)(appeals, ({ one }) => ({
  user: one(users, {
    fields: [appeals.userId],
    references: [users.id],
    relationName: "appealingUser"
  }),
  reviewer: one(users, {
    fields: [appeals.reviewedBy],
    references: [users.id],
    relationName: "appealReviewer"
  })
}));
var leagueSeasons = (0, import_pg_core.pgTable)("league_seasons", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  year: (0, import_pg_core.integer)("year").notNull().unique(),
  // e.g., 2027
  title: (0, import_pg_core.varchar)("title", { length: 150 }).notNull(),
  theme: (0, import_pg_core.varchar)("theme", { length: 150 }),
  description: (0, import_pg_core.text)("description"),
  registrationStartDate: (0, import_pg_core.timestamp)("registration_start_date").notNull(),
  registrationEndDate: (0, import_pg_core.timestamp)("registration_end_date").notNull(),
  startDate: (0, import_pg_core.timestamp)("start_date").notNull(),
  endDate: (0, import_pg_core.timestamp)("end_date").notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 30 }).default("UPCOMING").notNull(),
  // 'UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'
  settings: (0, import_pg_core.jsonb)("settings").$type().default({
    ageGroups: ["13-15", "16-17", "18+"],
    pointsCorrect: 100,
    pointsHardBonus: 50,
    maxSpeedBonus: 25,
    questionTimeLimit: 20,
    questionsPerMatch: 8,
    simulationMode: false
  }).notNull(),
  championUserId: (0, import_pg_core.integer)("champion_user_id").references(() => users.id, { onDelete: "set null" }),
  totalParticipants: (0, import_pg_core.integer)("total_participants").default(0).notNull(),
  totalMatches: (0, import_pg_core.integer)("total_matches").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  yearIdx: (0, import_pg_core.index)("league_seasons_year_idx").on(t.year),
  statusIdx: (0, import_pg_core.index)("league_seasons_status_idx").on(t.status)
}));
var leagueParticipants = (0, import_pg_core.pgTable)("league_participants", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  seasonId: (0, import_pg_core.integer)("season_id").notNull().references(() => leagueSeasons.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ageGroup: (0, import_pg_core.varchar)("age_group", { length: 20 }).notNull(),
  // '13-15', '16-17', '18+'
  totalPoints: (0, import_pg_core.integer)("total_points").default(0).notNull(),
  matchesPlayed: (0, import_pg_core.integer)("matches_played").default(0).notNull(),
  matchesWon: (0, import_pg_core.integer)("matches_won").default(0).notNull(),
  correctAnswersCount: (0, import_pg_core.integer)("correct_answers_count").default(0).notNull(),
  totalAnswersCount: (0, import_pg_core.integer)("total_answers_count").default(0).notNull(),
  currentRound: (0, import_pg_core.varchar)("current_round", { length: 30 }).default("QUALIFIERS").notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 30 }).default("ACTIVE").notNull(),
  // 'ACTIVE', 'ELIMINATED', 'FINALIST', 'CHAMPION'
  isFlagged: (0, import_pg_core.boolean)("is_flagged").default(false).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("league_participants_season_user_unq").on(t.seasonId, t.userId),
  seasonIdx: (0, import_pg_core.index)("league_participants_season_idx").on(t.seasonId),
  userIdx: (0, import_pg_core.index)("league_participants_user_idx").on(t.userId),
  pointsIdx: (0, import_pg_core.index)("league_participants_points_idx").on(t.seasonId, t.totalPoints),
  ageGroupIdx: (0, import_pg_core.index)("league_participants_age_group_idx").on(t.seasonId, t.ageGroup)
}));
var leagueQuestions = (0, import_pg_core.pgTable)("league_questions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  question: (0, import_pg_core.text)("question").notNull(),
  category: (0, import_pg_core.varchar)("category", { length: 50 }).notNull(),
  // 'Tarih ve Kültür', 'Bilim', 'Teknoloji', 'Genel Kültür', 'Mantık', 'Spor'
  difficulty: (0, import_pg_core.varchar)("difficulty", { length: 20 }).default("MEDIUM").notNull(),
  // 'EASY', 'MEDIUM', 'HARD', 'EXPERT'
  ageGroup: (0, import_pg_core.varchar)("age_group", { length: 20 }).default("ALL").notNull(),
  // 'ALL', '13-15', '16-17', '18+'
  language: (0, import_pg_core.varchar)("language", { length: 10 }).default("tr").notNull(),
  explanation: (0, import_pg_core.text)("explanation"),
  sourceType: (0, import_pg_core.varchar)("source_type", { length: 30 }).default("MANUAL").notNull(),
  // 'MANUAL', 'AI', 'OFFICIAL'
  sourceReference: (0, import_pg_core.text)("source_reference"),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("ACTIVE").notNull(),
  // 'DRAFT', 'ACTIVE', 'INACTIVE'
  usageCount: (0, import_pg_core.integer)("usage_count").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  categoryIdx: (0, import_pg_core.index)("league_questions_category_idx").on(t.category),
  difficultyIdx: (0, import_pg_core.index)("league_questions_difficulty_idx").on(t.difficulty),
  statusIdx: (0, import_pg_core.index)("league_questions_status_idx").on(t.status),
  ageGroupIdx: (0, import_pg_core.index)("league_questions_age_group_idx").on(t.ageGroup)
}));
var leagueQuestionOptions = (0, import_pg_core.pgTable)("league_question_options", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  questionId: (0, import_pg_core.integer)("question_id").notNull().references(() => leagueQuestions.id, { onDelete: "cascade" }),
  optionKey: (0, import_pg_core.varchar)("option_key", { length: 5 }).notNull(),
  // 'A', 'B', 'C', 'D'
  optionText: (0, import_pg_core.text)("option_text").notNull(),
  isCorrect: (0, import_pg_core.boolean)("is_correct").default(false).notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("league_question_options_q_key_unq").on(t.questionId, t.optionKey),
  questionIdx: (0, import_pg_core.index)("league_question_options_q_idx").on(t.questionId)
}));
var leagueMatches = (0, import_pg_core.pgTable)("league_matches", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  seasonId: (0, import_pg_core.integer)("season_id").notNull().references(() => leagueSeasons.id, { onDelete: "cascade" }),
  stage: (0, import_pg_core.varchar)("stage", { length: 30 }).default("QUALIFIERS").notNull(),
  // 'QUALIFIERS', 'TOP_32', 'TOP_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'
  ageGroup: (0, import_pg_core.varchar)("age_group", { length: 20 }).default("13-15").notNull(),
  player1Id: (0, import_pg_core.integer)("player1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  player2Id: (0, import_pg_core.integer)("player2_id").references(() => users.id, { onDelete: "set null" }),
  isVsBot: (0, import_pg_core.boolean)("is_vs_bot").default(false).notNull(),
  botName: (0, import_pg_core.varchar)("bot_name", { length: 50 }),
  winnerId: (0, import_pg_core.integer)("winner_id").references(() => users.id, { onDelete: "set null" }),
  player1Score: (0, import_pg_core.integer)("player1_score").default(0).notNull(),
  player2Score: (0, import_pg_core.integer)("player2_score").default(0).notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("PENDING").notNull(),
  // 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  currentQuestionIndex: (0, import_pg_core.integer)("current_question_index").default(0).notNull(),
  questionStartedAt: (0, import_pg_core.timestamp)("question_started_at"),
  startedAt: (0, import_pg_core.timestamp)("started_at"),
  completedAt: (0, import_pg_core.timestamp)("completed_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  seasonIdx: (0, import_pg_core.index)("league_matches_season_idx").on(t.seasonId),
  player1Idx: (0, import_pg_core.index)("league_matches_player1_idx").on(t.player1Id),
  player2Idx: (0, import_pg_core.index)("league_matches_player2_idx").on(t.player2Id),
  statusIdx: (0, import_pg_core.index)("league_matches_status_idx").on(t.status),
  stageIdx: (0, import_pg_core.index)("league_matches_stage_idx").on(t.stage)
}));
var leagueMatchQuestions = (0, import_pg_core.pgTable)("league_match_questions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  matchId: (0, import_pg_core.integer)("match_id").notNull().references(() => leagueMatches.id, { onDelete: "cascade" }),
  questionId: (0, import_pg_core.integer)("question_id").notNull().references(() => leagueQuestions.id, { onDelete: "cascade" }),
  order: (0, import_pg_core.integer)("order").notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("league_match_questions_match_q_unq").on(t.matchId, t.questionId),
  matchIdx: (0, import_pg_core.index)("league_match_questions_match_idx").on(t.matchId)
}));
var leagueMatchAnswers = (0, import_pg_core.pgTable)("league_match_answers", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  matchId: (0, import_pg_core.integer)("match_id").notNull().references(() => leagueMatches.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: (0, import_pg_core.integer)("question_id").notNull().references(() => leagueQuestions.id, { onDelete: "cascade" }),
  selectedOption: (0, import_pg_core.varchar)("selected_option", { length: 5 }),
  isCorrect: (0, import_pg_core.boolean)("is_correct").default(false).notNull(),
  pointsEarned: (0, import_pg_core.integer)("points_earned").default(0).notNull(),
  timeTakenMs: (0, import_pg_core.integer)("time_taken_ms").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("league_match_answers_match_user_q_unq").on(t.matchId, t.userId, t.questionId),
  matchIdx: (0, import_pg_core.index)("league_match_answers_match_idx").on(t.matchId),
  userIdx: (0, import_pg_core.index)("league_match_answers_user_idx").on(t.userId)
}));
var quizQuestionSets = (0, import_pg_core.pgTable)("quiz_question_sets", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: (0, import_pg_core.varchar)("title", { length: 120 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  category: (0, import_pg_core.varchar)("category", { length: 50 }).default("Genel K\xFClt\xFCr").notNull(),
  difficulty: (0, import_pg_core.varchar)("difficulty", { length: 20 }).default("Orta").notNull(),
  isPublic: (0, import_pg_core.boolean)("is_public").default(false).notNull(),
  questionCount: (0, import_pg_core.integer)("question_count").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  userIdx: (0, import_pg_core.index)("quiz_question_sets_user_idx").on(t.userId),
  isPublicIdx: (0, import_pg_core.index)("quiz_question_sets_public_idx").on(t.isPublic)
}));
var quizQuestionSetItems = (0, import_pg_core.pgTable)("quiz_question_set_items", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  setId: (0, import_pg_core.integer)("set_id").notNull().references(() => quizQuestionSets.id, { onDelete: "cascade" }),
  question: (0, import_pg_core.text)("question").notNull(),
  explanation: (0, import_pg_core.text)("explanation"),
  order: (0, import_pg_core.integer)("order").default(1).notNull(),
  options: (0, import_pg_core.jsonb)("options").$type().notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  setIdx: (0, import_pg_core.index)("quiz_question_set_items_set_idx").on(t.setId)
}));
var quizRooms = (0, import_pg_core.pgTable)("quiz_rooms", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  code: (0, import_pg_core.varchar)("code", { length: 10 }).notNull().unique(),
  // e.g. "482731"
  title: (0, import_pg_core.varchar)("title", { length: 150 }).notNull(),
  hostId: (0, import_pg_core.integer)("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: (0, import_pg_core.varchar)("category", { length: 50 }).default("Kar\u0131\u015F\u0131k").notNull(),
  difficulty: (0, import_pg_core.varchar)("difficulty", { length: 20 }).default("Kar\u0131\u015F\u0131k").notNull(),
  questionCount: (0, import_pg_core.integer)("question_count").default(10).notNull(),
  timePerQuestion: (0, import_pg_core.integer)("time_per_question").default(20).notNull(),
  // seconds
  roomType: (0, import_pg_core.varchar)("room_type", { length: 20 }).default("PUBLIC").notNull(),
  // 'PUBLIC', 'CODE_ONLY', 'PRIVATE'
  sourceType: (0, import_pg_core.varchar)("source_type", { length: 30 }).default("SYSTEM").notNull(),
  // 'SYSTEM', 'QUESTION_SET', 'MIXED'
  questionSetId: (0, import_pg_core.integer)("question_set_id").references(() => quizQuestionSets.id, { onDelete: "set null" }),
  maxPlayers: (0, import_pg_core.integer)("max_players").default(30).notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 25 }).default("LOBBY").notNull(),
  // 'LOBBY', 'PLAYING', 'QUESTION_ACTIVE', 'QUESTION_RESULT', 'FINISHED', 'CANCELLED'
  currentQuestionIndex: (0, import_pg_core.integer)("current_question_index").default(0).notNull(),
  questionStartedAt: (0, import_pg_core.timestamp)("question_started_at"),
  startedAt: (0, import_pg_core.timestamp)("started_at"),
  finishedAt: (0, import_pg_core.timestamp)("finished_at"),
  settings: (0, import_pg_core.jsonb)("settings").$type().default({
    allowAnswerChange: false,
    speedBonus: true,
    soundEnabled: true
  }).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  codeIdx: (0, import_pg_core.index)("quiz_rooms_code_idx").on(t.code),
  hostIdx: (0, import_pg_core.index)("quiz_rooms_host_idx").on(t.hostId),
  statusIdx: (0, import_pg_core.index)("quiz_rooms_status_idx").on(t.status)
}));
var quizRoomPlayers = (0, import_pg_core.pgTable)("quiz_room_players", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  roomId: (0, import_pg_core.integer)("room_id").notNull().references(() => quizRooms.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: (0, import_pg_core.integer)("score").default(0).notNull(),
  correctAnswersCount: (0, import_pg_core.integer)("correct_answers_count").default(0).notNull(),
  wrongAnswersCount: (0, import_pg_core.integer)("wrong_answers_count").default(0).notNull(),
  unansweredCount: (0, import_pg_core.integer)("unanswered_count").default(0).notNull(),
  streak: (0, import_pg_core.integer)("streak").default(0).notNull(),
  maxStreak: (0, import_pg_core.integer)("max_streak").default(0).notNull(),
  rank: (0, import_pg_core.integer)("rank").default(1),
  isHost: (0, import_pg_core.boolean)("is_host").default(false).notNull(),
  isConnected: (0, import_pg_core.boolean)("is_connected").default(true).notNull(),
  lastActiveAt: (0, import_pg_core.timestamp)("last_active_at").defaultNow().notNull(),
  joinedAt: (0, import_pg_core.timestamp)("joined_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("quiz_room_players_room_user_unq").on(t.roomId, t.userId),
  roomIdx: (0, import_pg_core.index)("quiz_room_players_room_idx").on(t.roomId),
  userIdx: (0, import_pg_core.index)("quiz_room_players_user_idx").on(t.userId),
  scoreIdx: (0, import_pg_core.index)("quiz_room_players_score_idx").on(t.roomId, t.score)
}));
var quizRoomQuestions = (0, import_pg_core.pgTable)("quiz_room_questions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  roomId: (0, import_pg_core.integer)("room_id").notNull().references(() => quizRooms.id, { onDelete: "cascade" }),
  questionId: (0, import_pg_core.integer)("question_id").references(() => leagueQuestions.id, { onDelete: "set null" }),
  questionText: (0, import_pg_core.text)("question_text").notNull(),
  category: (0, import_pg_core.varchar)("category", { length: 50 }).notNull(),
  difficulty: (0, import_pg_core.varchar)("difficulty", { length: 20 }).notNull(),
  explanation: (0, import_pg_core.text)("explanation"),
  options: (0, import_pg_core.jsonb)("options").$type().notNull(),
  order: (0, import_pg_core.integer)("order").notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("quiz_room_questions_room_order_unq").on(t.roomId, t.order),
  roomIdx: (0, import_pg_core.index)("quiz_room_questions_room_idx").on(t.roomId)
}));
var quizAnswers = (0, import_pg_core.pgTable)("quiz_answers", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  roomId: (0, import_pg_core.integer)("room_id").notNull().references(() => quizRooms.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomQuestionId: (0, import_pg_core.integer)("room_question_id").notNull().references(() => quizRoomQuestions.id, { onDelete: "cascade" }),
  selectedOption: (0, import_pg_core.varchar)("selected_option", { length: 5 }),
  isCorrect: (0, import_pg_core.boolean)("is_correct").default(false).notNull(),
  pointsEarned: (0, import_pg_core.integer)("points_earned").default(0).notNull(),
  timeTakenMs: (0, import_pg_core.integer)("time_taken_ms").default(0).notNull(),
  answeredAt: (0, import_pg_core.timestamp)("answered_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("quiz_answers_room_user_q_unq").on(t.roomId, t.userId, t.roomQuestionId),
  roomIdx: (0, import_pg_core.index)("quiz_answers_room_idx").on(t.roomId),
  userIdx: (0, import_pg_core.index)("quiz_answers_user_idx").on(t.userId)
}));
var quizResults = (0, import_pg_core.pgTable)("quiz_results", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  roomId: (0, import_pg_core.integer)("room_id").references(() => quizRooms.id, { onDelete: "set null" }),
  roomTitle: (0, import_pg_core.varchar)("room_title", { length: 150 }).notNull(),
  category: (0, import_pg_core.varchar)("category", { length: 50 }).notNull(),
  userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rank: (0, import_pg_core.integer)("rank").notNull(),
  totalPlayers: (0, import_pg_core.integer)("total_players").notNull(),
  score: (0, import_pg_core.integer)("score").notNull(),
  correctCount: (0, import_pg_core.integer)("correct_count").notNull(),
  wrongCount: (0, import_pg_core.integer)("wrong_count").notNull(),
  unansweredCount: (0, import_pg_core.integer)("unanswered_count").notNull(),
  totalQuestions: (0, import_pg_core.integer)("total_questions").notNull(),
  playedAt: (0, import_pg_core.timestamp)("played_at").defaultNow().notNull()
}, (t) => ({
  userPlayedIdx: (0, import_pg_core.index)("quiz_results_user_played_idx").on(t.userId, t.playedAt),
  userScoreIdx: (0, import_pg_core.index)("quiz_results_user_score_idx").on(t.userId, t.score)
}));
var quizInvites = (0, import_pg_core.pgTable)("quiz_invites", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  roomId: (0, import_pg_core.integer)("room_id").notNull().references(() => quizRooms.id, { onDelete: "cascade" }),
  senderId: (0, import_pg_core.integer)("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: (0, import_pg_core.integer)("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: (0, import_pg_core.varchar)("status", { length: 20 }).default("PENDING").notNull(),
  // 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)("quiz_invites_room_receiver_unq").on(t.roomId, t.receiverId),
  receiverIdx: (0, import_pg_core.index)("quiz_invites_receiver_idx").on(t.receiverId)
}));
var teknofestEvents = (0, import_pg_core.pgTable)("teknofest_events", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  slug: (0, import_pg_core.varchar)("slug", { length: 50 }).notNull().unique(),
  // e.g. "2026", "2025", "2027"
  title: (0, import_pg_core.varchar)("title", { length: 150 }).notNull(),
  // e.g. "TEKNOFEST 2026"
  theme: (0, import_pg_core.varchar)("theme", { length: 255 }),
  // e.g. "Geleceğin Teknolojileri ve Havacılık"
  description: (0, import_pg_core.text)("description").notNull(),
  location: (0, import_pg_core.varchar)("location", { length: 150 }).notNull(),
  // e.g. "İstanbul — Atatürk Havalimanı"
  startDate: (0, import_pg_core.timestamp)("start_date").notNull(),
  endDate: (0, import_pg_core.timestamp)("end_date").notNull(),
  coverImageUrl: (0, import_pg_core.text)("cover_image_url"),
  status: (0, import_pg_core.varchar)("status", { length: 30 }).default("COMPLETED").notNull(),
  // 'UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'
  isFeatured: (0, import_pg_core.boolean)("is_featured").default(true).notNull(),
  stats: (0, import_pg_core.jsonb)("stats").default({
    visitorCount: "1.2M+",
    projectCount: "1,500+",
    competitionsCount: "44",
    teamCount: "25,000+"
  }),
  sortOrder: (0, import_pg_core.integer)("sort_order").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  slugIdx: (0, import_pg_core.index)("teknofest_events_slug_idx").on(t.slug),
  statusIdx: (0, import_pg_core.index)("teknofest_events_status_idx").on(t.status)
}));
var teknofestCategories = (0, import_pg_core.pgTable)("teknofest_categories", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  eventId: (0, import_pg_core.integer)("event_id").notNull().references(() => teknofestEvents.id, { onDelete: "cascade" }),
  name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
  slug: (0, import_pg_core.varchar)("slug", { length: 100 }).notNull(),
  icon: (0, import_pg_core.varchar)("icon", { length: 50 }).default("Camera").notNull(),
  sortOrder: (0, import_pg_core.integer)("sort_order").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  eventCategoryUnq: (0, import_pg_core.unique)("teknofest_categories_event_slug_unq").on(t.eventId, t.slug),
  eventIdIdx: (0, import_pg_core.index)("teknofest_categories_event_id_idx").on(t.eventId)
}));
var teknofestTimelineItems = (0, import_pg_core.pgTable)("teknofest_timeline_items", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  eventId: (0, import_pg_core.integer)("event_id").notNull().references(() => teknofestEvents.id, { onDelete: "cascade" }),
  dateLabel: (0, import_pg_core.varchar)("date_label", { length: 50 }).notNull(),
  // e.g. "30 Eylül", "01 Ekim"
  title: (0, import_pg_core.varchar)("title", { length: 200 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  icon: (0, import_pg_core.varchar)("icon", { length: 50 }).default("Sparkles").notNull(),
  sortOrder: (0, import_pg_core.integer)("sort_order").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  eventIdIdx: (0, import_pg_core.index)("teknofest_timeline_event_id_idx").on(t.eventId)
}));
var teknofestMedia = (0, import_pg_core.pgTable)("teknofest_media", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  eventId: (0, import_pg_core.integer)("event_id").notNull().references(() => teknofestEvents.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id, { onDelete: "set null" }),
  categoryId: (0, import_pg_core.integer)("category_id").references(() => teknofestCategories.id, { onDelete: "set null" }),
  postId: (0, import_pg_core.integer)("post_id").references(() => posts.id, { onDelete: "set null" }),
  projectId: (0, import_pg_core.integer)("project_id").references(() => projects.id, { onDelete: "set null" }),
  mediaType: (0, import_pg_core.varchar)("media_type", { length: 20 }).default("IMAGE").notNull(),
  // 'IMAGE', 'VIDEO'
  mediaUrl: (0, import_pg_core.text)("media_url").notNull(),
  thumbnailUrl: (0, import_pg_core.text)("thumbnail_url"),
  title: (0, import_pg_core.varchar)("title", { length: 200 }),
  caption: (0, import_pg_core.text)("caption"),
  altText: (0, import_pg_core.varchar)("alt_text", { length: 255 }),
  credit: (0, import_pg_core.varchar)("credit", { length: 200 }).default("\u{1F4F7} Gen\xE7 Sosyal Toplulu\u011Fu").notNull(),
  aspectRatio: (0, import_pg_core.varchar)("aspect_ratio", { length: 20 }).default("4:3"),
  // '1:1', '4:3', '16:9', '3:4', '9:16'
  duration: (0, import_pg_core.integer)("duration"),
  // In seconds if video
  viewsCount: (0, import_pg_core.integer)("views_count").default(0).notNull(),
  likesCount: (0, import_pg_core.integer)("likes_count").default(0).notNull(),
  isFeatured: (0, import_pg_core.boolean)("is_featured").default(false).notNull(),
  moderationStatus: (0, import_pg_core.varchar)("moderation_status", { length: 20 }).default("APPROVED").notNull(),
  // 'PENDING', 'APPROVED', 'REJECTED'
  rejectionReason: (0, import_pg_core.text)("rejection_reason"),
  reviewedBy: (0, import_pg_core.integer)("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: (0, import_pg_core.timestamp)("reviewed_at"),
  sortOrder: (0, import_pg_core.integer)("sort_order").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  eventIdIdx: (0, import_pg_core.index)("teknofest_media_event_id_idx").on(t.eventId),
  userIdIdx: (0, import_pg_core.index)("teknofest_media_user_id_idx").on(t.userId),
  categoryIdx: (0, import_pg_core.index)("teknofest_media_category_id_idx").on(t.categoryId),
  modStatusIdx: (0, import_pg_core.index)("teknofest_media_mod_status_idx").on(t.moderationStatus),
  isFeaturedIdx: (0, import_pg_core.index)("teknofest_media_is_featured_idx").on(t.isFeatured)
}));
var teknofestMemories = (0, import_pg_core.pgTable)("teknofest_memories", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  eventId: (0, import_pg_core.integer)("event_id").notNull().references(() => teknofestEvents.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id, { onDelete: "set null" }),
  postId: (0, import_pg_core.integer)("post_id").references(() => posts.id, { onDelete: "set null" }),
  content: (0, import_pg_core.text)("content").notNull(),
  authorName: (0, import_pg_core.varchar)("author_name", { length: 100 }),
  authorTitle: (0, import_pg_core.varchar)("author_title", { length: 150 }),
  // e.g. "İHA Takım Kaptanı", "Yarışmacı"
  isFeatured: (0, import_pg_core.boolean)("is_featured").default(false).notNull(),
  moderationStatus: (0, import_pg_core.varchar)("moderation_status", { length: 20 }).default("APPROVED").notNull(),
  // 'PENDING', 'APPROVED', 'REJECTED'
  rejectionReason: (0, import_pg_core.text)("rejection_reason"),
  reviewedBy: (0, import_pg_core.integer)("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: (0, import_pg_core.timestamp)("reviewed_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (t) => ({
  eventIdIdx: (0, import_pg_core.index)("teknofest_memories_event_id_idx").on(t.eventId),
  userIdIdx: (0, import_pg_core.index)("teknofest_memories_user_id_idx").on(t.userId),
  modStatusIdx: (0, import_pg_core.index)("teknofest_memories_mod_status_idx").on(t.moderationStatus)
}));
var teknofestEventsRelations = (0, import_drizzle_orm.relations)(teknofestEvents, ({ many }) => ({
  categories: many(teknofestCategories),
  timelineItems: many(teknofestTimelineItems),
  media: many(teknofestMedia),
  memories: many(teknofestMemories)
}));
var teknofestCategoriesRelations = (0, import_drizzle_orm.relations)(teknofestCategories, ({ one, many }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestCategories.eventId],
    references: [teknofestEvents.id]
  }),
  media: many(teknofestMedia)
}));
var teknofestTimelineItemsRelations = (0, import_drizzle_orm.relations)(teknofestTimelineItems, ({ one }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestTimelineItems.eventId],
    references: [teknofestEvents.id]
  })
}));
var teknofestMediaRelations = (0, import_drizzle_orm.relations)(teknofestMedia, ({ one }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestMedia.eventId],
    references: [teknofestEvents.id]
  }),
  user: one(users, {
    fields: [teknofestMedia.userId],
    references: [users.id]
  }),
  category: one(teknofestCategories, {
    fields: [teknofestMedia.categoryId],
    references: [teknofestCategories.id]
  }),
  post: one(posts, {
    fields: [teknofestMedia.postId],
    references: [posts.id]
  }),
  project: one(projects, {
    fields: [teknofestMedia.projectId],
    references: [projects.id]
  })
}));
var teknofestMemoriesRelations = (0, import_drizzle_orm.relations)(teknofestMemories, ({ one }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestMemories.eventId],
    references: [teknofestEvents.id]
  }),
  user: one(users, {
    fields: [teknofestMemories.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [teknofestMemories.postId],
    references: [posts.id]
  })
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
    const sslEnv = process.env.DATABASE_SSL?.toLowerCase();
    let useSsl = false;
    if (sslEnv === "false" || sslEnv === "0" || sslEnv === "off" || sslEnv === "no") {
      useSsl = false;
    } else if (sslEnv === "true" || sslEnv === "1" || sslEnv === "on" || sslEnv === "yes") {
      useSsl = true;
    } else {
      const hasSslDisable = connectionString.includes("sslmode=disable") || process.env.PGSSLMODE === "disable";
      const hasExplicitSslEnable = connectionString.includes("sslmode=require") || connectionString.includes("sslmode=verify-ca") || connectionString.includes("sslmode=verify-full") || connectionString.includes("ssl=true");
      const isLocalOrDockerHost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1") || connectionString.includes("gencsosyal-postgres") || connectionString.includes("@postgres:") || connectionString.includes("@db:");
      if (hasSslDisable || isLocalOrDockerHost) {
        useSsl = false;
      } else if (hasExplicitSslEnable) {
        useSsl = true;
      } else {
        useSsl = false;
      }
    }
    global._postgresPool = new import_pg.Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 15e3,
      ssl: useSsl ? { rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === "true" } : false
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
  const execSafe = async (rawSql) => {
    const statements = rawSql.split(/;\s*(?:\r?\n|$)/).map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        if (global._pgliteClient) {
          await global._pgliteClient.exec(stmt.endsWith(";") ? stmt : `${stmt};`);
        } else {
          await db.execute(import_drizzle_orm2.sql.raw(stmt));
        }
      } catch (err) {
        console.warn(
          `\u26A0\uFE0F Schema sync warning (${stmt.slice(0, 80).replace(/\s+/g, " ")}...):`,
          err?.message || err
        );
      }
    }
  };
  try {
    const pool = createPool();
    try {
      if (pool) {
        await (0, import_migrator.migrate)(db, { migrationsFolder: import_path2.default.join(process.cwd(), "migrations") });
      } else {
        await (0, import_migrator2.migrate)(db, { migrationsFolder: import_path2.default.join(process.cwd(), "migrations") });
      }
    } catch (migErr) {
      const errCode = String(migErr?.cause?.code || migErr?.code || "");
      const errMsg = String(migErr?.cause?.message || migErr?.message || "");
      if (errCode === "42P07" || errMsg.includes("already exists")) {
        console.warn("\u26A0\uFE0F Tablolar zaten mevcut, idempotent \u015Fema senkronizasyonu ile devam ediliyor...");
      } else {
        console.warn("\u26A0\uFE0F Standart migrasyon uyar\u0131s\u0131, idempotent \u015Fema senkronizasyonu \xE7al\u0131\u015Ft\u0131r\u0131l\u0131yor:", errMsg);
      }
    }
    await execSafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_official_account" boolean DEFAULT false NOT NULL;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "official_notify_enabled" boolean DEFAULT true NOT NULL;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "official_priority" varchar(20) DEFAULT 'normal' NOT NULL;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false NOT NULL;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_secret" text;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_minor" boolean DEFAULT false NOT NULL;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "age_verification_status" varchar(30) DEFAULT 'UNVERIFIED' NOT NULL;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "age_verification_token" text;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "age_verified_at" timestamp;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "age_verification_method" varchar(50);
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "banned_at" timestamp;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ban_reason" text;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ban_expires_at" timestamp;
      UPDATE "users" SET "role" = UPPER("role") WHERE "role" IN ('admin', 'user', 'moderator');

      ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false NOT NULL;
      ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "interests" jsonb DEFAULT '[]'::jsonb;
      ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "birth_date" timestamp;
      ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "is_screenshot_protected" boolean DEFAULT false NOT NULL;
      ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "daily_screen_time_limit_minutes" integer DEFAULT 120;

      ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "notification_preference" varchar(20) DEFAULT 'standard' NOT NULL;

      ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "community_id" integer;
      ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "post_type" varchar(20) DEFAULT 'NORMAL' NOT NULL;
      ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "quoted_post_id" integer;
      ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL;
      ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "content_warning" text;
      ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "base_score" real DEFAULT 0 NOT NULL;
      ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "view_count" integer DEFAULT 0 NOT NULL;

      ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL;
      ALTER TABLE "project_comments" ADD COLUMN IF NOT EXISTS "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL;

      ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "project_id" integer;
      ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "project_comment_id" integer;
      ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "community_id" integer;

      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "image_url" text,
        "button_text" varchar(100),
        "button_url" text,
        "status" varchar(30) DEFAULT 'draft' NOT NULL,
        "target_type" varchar(30) DEFAULT 'all' NOT NULL,
        "target_role" varchar(50),
        "priority" integer DEFAULT 0 NOT NULL,
        "starts_at" timestamp,
        "ends_at" timestamp,
        "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "button_text" varchar(100);
      ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "button_url" text;
      ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "status" varchar(30) DEFAULT 'draft' NOT NULL;
      ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "target_type" varchar(30) DEFAULT 'all' NOT NULL;
      ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "target_role" varchar(50);
      ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "ends_at" timestamp;

      CREATE TABLE IF NOT EXISTS "announcement_views" (
        "id" serial PRIMARY KEY NOT NULL,
        "announcement_id" integer NOT NULL REFERENCES "announcements"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "seen_at" timestamp DEFAULT now() NOT NULL,
        "dismissed_at" timestamp,
        "clicked_cta" boolean DEFAULT false NOT NULL,
        CONSTRAINT "announcement_views_user_announcement_unq" UNIQUE("announcement_id", "user_id")
      );

      ALTER TABLE "announcement_views" ADD COLUMN IF NOT EXISTS "dismissed_at" timestamp;
      ALTER TABLE "announcement_views" ADD COLUMN IF NOT EXISTS "clicked_cta" boolean DEFAULT false NOT NULL;

      CREATE TABLE IF NOT EXISTS "appeals" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "appeal_type" varchar(50) DEFAULT 'ACCOUNT_SUSPENSION' NOT NULL,
        "ban_reason" text,
        "reason" text NOT NULL,
        "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
        "admin_response" text,
        "reviewed_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "human_review_notes" text,
        "reviewed_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      ALTER TABLE "appeals" ADD COLUMN IF NOT EXISTS "appeal_type" varchar(50) DEFAULT 'ACCOUNT_SUSPENSION' NOT NULL;
      ALTER TABLE "appeals" ADD COLUMN IF NOT EXISTS "ban_reason" text;
      ALTER TABLE "appeals" ADD COLUMN IF NOT EXISTS "admin_response" text;
      ALTER TABLE "appeals" ADD COLUMN IF NOT EXISTS "human_review_notes" text;

      ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "category" varchar(50) DEFAULT 'Genel' NOT NULL;
      ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "is_private" boolean DEFAULT false NOT NULL;
      ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "rules" text;
      ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

      CREATE TABLE IF NOT EXISTS "community_join_requests" (
        "id" serial PRIMARY KEY NOT NULL,
        "community_id" integer NOT NULL REFERENCES "communities"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
        "note" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "community_join_requests_user_community_unq" ON "community_join_requests" ("community_id", "user_id");

      CREATE TABLE IF NOT EXISTS "community_audit_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "community_id" integer NOT NULL REFERENCES "communities"("id") ON DELETE CASCADE,
        "actor_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "target_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "action" varchar(50) NOT NULL,
        "details" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "community_audit_logs_community_idx" ON "community_audit_logs" ("community_id");

      CREATE TABLE IF NOT EXISTS "league_seasons" (
        "id" serial PRIMARY KEY NOT NULL,
        "year" integer NOT NULL UNIQUE,
        "title" varchar(150) NOT NULL,
        "theme" varchar(150),
        "description" text,
        "registration_start_date" timestamp NOT NULL,
        "registration_end_date" timestamp NOT NULL,
        "start_date" timestamp NOT NULL,
        "end_date" timestamp NOT NULL,
        "status" varchar(30) DEFAULT 'UPCOMING' NOT NULL,
        "settings" jsonb DEFAULT '{"ageGroups":["13-15","16-17","18+"],"pointsCorrect":100,"pointsHardBonus":50,"maxSpeedBonus":25,"questionTimeLimit":20,"questionsPerMatch":8,"simulationMode":false}'::jsonb NOT NULL,
        "champion_user_id" integer,
        "total_participants" integer DEFAULT 0 NOT NULL,
        "total_matches" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "league_participants" (
        "id" serial PRIMARY KEY NOT NULL,
        "season_id" integer NOT NULL REFERENCES "league_seasons"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "age_group" varchar(20) NOT NULL,
        "total_points" integer DEFAULT 0 NOT NULL,
        "matches_played" integer DEFAULT 0 NOT NULL,
        "matches_won" integer DEFAULT 0 NOT NULL,
        "correct_answers_count" integer DEFAULT 0 NOT NULL,
        "total_answers_count" integer DEFAULT 0 NOT NULL,
        "current_round" varchar(30) DEFAULT 'QUALIFIERS' NOT NULL,
        "status" varchar(30) DEFAULT 'ACTIVE' NOT NULL,
        "is_flagged" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "league_participants_season_user_unq" ON "league_participants" ("season_id", "user_id");

      CREATE TABLE IF NOT EXISTS "league_questions" (
        "id" serial PRIMARY KEY NOT NULL,
        "question" text NOT NULL,
        "category" varchar(50) NOT NULL,
        "difficulty" varchar(20) DEFAULT 'MEDIUM' NOT NULL,
        "age_group" varchar(20) DEFAULT 'ALL' NOT NULL,
        "language" varchar(10) DEFAULT 'tr' NOT NULL,
        "explanation" text,
        "source_type" varchar(30) DEFAULT 'MANUAL' NOT NULL,
        "source_reference" text,
        "status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
        "usage_count" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "league_question_options" (
        "id" serial PRIMARY KEY NOT NULL,
        "question_id" integer NOT NULL REFERENCES "league_questions"("id") ON DELETE CASCADE,
        "option_key" varchar(5) NOT NULL,
        "option_text" text NOT NULL,
        "is_correct" boolean DEFAULT false NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "league_question_options_q_key_unq" ON "league_question_options" ("question_id", "option_key");

      CREATE TABLE IF NOT EXISTS "league_matches" (
        "id" serial PRIMARY KEY NOT NULL,
        "season_id" integer NOT NULL REFERENCES "league_seasons"("id") ON DELETE CASCADE,
        "stage" varchar(30) DEFAULT 'QUALIFIERS' NOT NULL,
        "age_group" varchar(20) DEFAULT '13-15' NOT NULL,
        "player1_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "player2_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "is_vs_bot" boolean DEFAULT false NOT NULL,
        "bot_name" varchar(50),
        "winner_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "player1_score" integer DEFAULT 0 NOT NULL,
        "player2_score" integer DEFAULT 0 NOT NULL,
        "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
        "current_question_index" integer DEFAULT 0 NOT NULL,
        "question_started_at" timestamp,
        "started_at" timestamp,
        "completed_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "league_match_questions" (
        "id" serial PRIMARY KEY NOT NULL,
        "match_id" integer NOT NULL REFERENCES "league_matches"("id") ON DELETE CASCADE,
        "question_id" integer NOT NULL REFERENCES "league_questions"("id") ON DELETE CASCADE,
        "order" integer NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "league_match_questions_match_q_unq" ON "league_match_questions" ("match_id", "question_id");

      CREATE TABLE IF NOT EXISTS "league_match_answers" (
        "id" serial PRIMARY KEY NOT NULL,
        "match_id" integer NOT NULL REFERENCES "league_matches"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "question_id" integer NOT NULL REFERENCES "league_questions"("id") ON DELETE CASCADE,
        "selected_option" varchar(5),
        "is_correct" boolean DEFAULT false NOT NULL,
        "points_earned" integer DEFAULT 0 NOT NULL,
        "time_taken_ms" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "league_match_answers_match_user_q_unq" ON "league_match_answers" ("match_id", "user_id", "question_id");

      CREATE TABLE IF NOT EXISTS "quiz_question_sets" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" varchar(120) NOT NULL,
        "description" text,
        "category" varchar(50) DEFAULT 'Genel K\xFClt\xFCr' NOT NULL,
        "difficulty" varchar(20) DEFAULT 'Orta' NOT NULL,
        "is_public" boolean DEFAULT false NOT NULL,
        "question_count" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "quiz_question_sets_user_idx" ON "quiz_question_sets" ("user_id");
      CREATE INDEX IF NOT EXISTS "quiz_question_sets_public_idx" ON "quiz_question_sets" ("is_public");

      CREATE TABLE IF NOT EXISTS "quiz_question_set_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "set_id" integer NOT NULL REFERENCES "quiz_question_sets"("id") ON DELETE CASCADE,
        "question" text NOT NULL,
        "explanation" text,
        "order" integer DEFAULT 1 NOT NULL,
        "options" jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "quiz_question_set_items_set_idx" ON "quiz_question_set_items" ("set_id");

      CREATE TABLE IF NOT EXISTS "quiz_rooms" (
        "id" serial PRIMARY KEY NOT NULL,
        "code" varchar(10) NOT NULL UNIQUE,
        "title" varchar(150) NOT NULL,
        "host_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "category" varchar(50) DEFAULT 'Kar\u0131\u015F\u0131k' NOT NULL,
        "difficulty" varchar(20) DEFAULT 'Kar\u0131\u015F\u0131k' NOT NULL,
        "question_count" integer DEFAULT 10 NOT NULL,
        "time_per_question" integer DEFAULT 20 NOT NULL,
        "room_type" varchar(20) DEFAULT 'PUBLIC' NOT NULL,
        "source_type" varchar(30) DEFAULT 'SYSTEM' NOT NULL,
        "question_set_id" integer REFERENCES "quiz_question_sets"("id") ON DELETE SET NULL,
        "max_players" integer DEFAULT 30 NOT NULL,
        "status" varchar(25) DEFAULT 'LOBBY' NOT NULL,
        "current_question_index" integer DEFAULT 0 NOT NULL,
        "question_started_at" timestamp,
        "started_at" timestamp,
        "finished_at" timestamp,
        "settings" jsonb DEFAULT '{"allowAnswerChange":false,"speedBonus":true,"soundEnabled":true}'::jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "quiz_rooms_code_idx" ON "quiz_rooms" ("code");
      CREATE INDEX IF NOT EXISTS "quiz_rooms_host_idx" ON "quiz_rooms" ("host_id");
      CREATE INDEX IF NOT EXISTS "quiz_rooms_status_idx" ON "quiz_rooms" ("status");

      CREATE TABLE IF NOT EXISTS "quiz_room_players" (
        "id" serial PRIMARY KEY NOT NULL,
        "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "score" integer DEFAULT 0 NOT NULL,
        "correct_answers_count" integer DEFAULT 0 NOT NULL,
        "wrong_answers_count" integer DEFAULT 0 NOT NULL,
        "unanswered_count" integer DEFAULT 0 NOT NULL,
        "streak" integer DEFAULT 0 NOT NULL,
        "max_streak" integer DEFAULT 0 NOT NULL,
        "rank" integer DEFAULT 1,
        "is_host" boolean DEFAULT false NOT NULL,
        "is_connected" boolean DEFAULT true NOT NULL,
        "last_active_at" timestamp DEFAULT now() NOT NULL,
        "joined_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "quiz_room_players_room_user_unq" ON "quiz_room_players" ("room_id", "user_id");
      CREATE INDEX IF NOT EXISTS "quiz_room_players_room_idx" ON "quiz_room_players" ("room_id");
      CREATE INDEX IF NOT EXISTS "quiz_room_players_user_idx" ON "quiz_room_players" ("user_id");
      CREATE INDEX IF NOT EXISTS "quiz_room_players_score_idx" ON "quiz_room_players" ("room_id", "score");

      CREATE TABLE IF NOT EXISTS "quiz_room_questions" (
        "id" serial PRIMARY KEY NOT NULL,
        "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
        "question_id" integer REFERENCES "league_questions"("id") ON DELETE SET NULL,
        "question_text" text NOT NULL,
        "category" varchar(50) NOT NULL,
        "difficulty" varchar(20) NOT NULL,
        "explanation" text,
        "options" jsonb NOT NULL,
        "order" integer NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "quiz_room_questions_room_order_unq" ON "quiz_room_questions" ("room_id", "order");
      CREATE INDEX IF NOT EXISTS "quiz_room_questions_room_idx" ON "quiz_room_questions" ("room_id");

      CREATE TABLE IF NOT EXISTS "quiz_answers" (
        "id" serial PRIMARY KEY NOT NULL,
        "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "room_question_id" integer NOT NULL REFERENCES "quiz_room_questions"("id") ON DELETE CASCADE,
        "selected_option" varchar(5),
        "is_correct" boolean DEFAULT false NOT NULL,
        "points_earned" integer DEFAULT 0 NOT NULL,
        "time_taken_ms" integer DEFAULT 0 NOT NULL,
        "answered_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "quiz_answers_room_user_q_unq" ON "quiz_answers" ("room_id", "user_id", "room_question_id");
      CREATE INDEX IF NOT EXISTS "quiz_answers_room_idx" ON "quiz_answers" ("room_id");
      CREATE INDEX IF NOT EXISTS "quiz_answers_user_idx" ON "quiz_answers" ("user_id");

      CREATE TABLE IF NOT EXISTS "quiz_results" (
        "id" serial PRIMARY KEY NOT NULL,
        "room_id" integer REFERENCES "quiz_rooms"("id") ON DELETE SET NULL,
        "room_title" varchar(150) NOT NULL,
        "category" varchar(50) NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "rank" integer NOT NULL,
        "total_players" integer NOT NULL,
        "score" integer NOT NULL,
        "correct_count" integer NOT NULL,
        "wrong_count" integer NOT NULL,
        "unanswered_count" integer NOT NULL,
        "total_questions" integer NOT NULL,
        "played_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "quiz_results_user_played_idx" ON "quiz_results" ("user_id", "played_at");
      CREATE INDEX IF NOT EXISTS "quiz_results_user_score_idx" ON "quiz_results" ("user_id", "score");

      CREATE TABLE IF NOT EXISTS "quiz_invites" (
        "id" serial PRIMARY KEY NOT NULL,
        "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
        "sender_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "receiver_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "quiz_invites_room_receiver_unq" ON "quiz_invites" ("room_id", "receiver_id");
      CREATE INDEX IF NOT EXISTS "quiz_invites_receiver_idx" ON "quiz_invites" ("receiver_id");

      CREATE TABLE IF NOT EXISTS "teknofest_events" (
        "id" serial PRIMARY KEY NOT NULL,
        "slug" varchar(50) NOT NULL UNIQUE,
        "title" varchar(150) NOT NULL,
        "theme" varchar(255),
        "description" text NOT NULL,
        "location" varchar(150) NOT NULL,
        "start_date" timestamp NOT NULL,
        "end_date" timestamp NOT NULL,
        "cover_image_url" text,
        "status" varchar(30) DEFAULT 'COMPLETED' NOT NULL,
        "is_featured" boolean DEFAULT true NOT NULL,
        "stats" jsonb DEFAULT '{"visitorCount":"1.2M+","projectCount":"1,500+","competitionsCount":"44","teamCount":"25,000+"}'::jsonb,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "teknofest_events_slug_idx" ON "teknofest_events" ("slug");
      CREATE INDEX IF NOT EXISTS "teknofest_events_status_idx" ON "teknofest_events" ("status");

      CREATE TABLE IF NOT EXISTS "teknofest_categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
        "name" varchar(100) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "icon" varchar(50) DEFAULT 'Camera' NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "teknofest_categories_event_slug_unq" ON "teknofest_categories" ("event_id", "slug");
      CREATE INDEX IF NOT EXISTS "teknofest_categories_event_id_idx" ON "teknofest_categories" ("event_id");

      CREATE TABLE IF NOT EXISTS "teknofest_timeline_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
        "date_label" varchar(50) NOT NULL,
        "title" varchar(200) NOT NULL,
        "description" text,
        "icon" varchar(50) DEFAULT 'Sparkles' NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "teknofest_timeline_event_id_idx" ON "teknofest_timeline_items" ("event_id");

      CREATE TABLE IF NOT EXISTS "teknofest_media" (
        "id" serial PRIMARY KEY NOT NULL,
        "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
        "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "category_id" integer REFERENCES "teknofest_categories"("id") ON DELETE SET NULL,
        "post_id" integer REFERENCES "posts"("id") ON DELETE SET NULL,
        "project_id" integer REFERENCES "projects"("id") ON DELETE SET NULL,
        "media_type" varchar(20) DEFAULT 'IMAGE' NOT NULL,
        "media_url" text NOT NULL,
        "thumbnail_url" text,
        "title" varchar(200),
        "caption" text,
        "alt_text" varchar(255),
        "credit" varchar(200) DEFAULT '\u{1F4F7} Gen\xE7 Sosyal Toplulu\u011Fu' NOT NULL,
        "aspect_ratio" varchar(20) DEFAULT '4:3',
        "duration" integer,
        "views_count" integer DEFAULT 0 NOT NULL,
        "likes_count" integer DEFAULT 0 NOT NULL,
        "is_featured" boolean DEFAULT false NOT NULL,
        "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL,
        "rejection_reason" text,
        "reviewed_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "reviewed_at" timestamp,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "teknofest_media_event_id_idx" ON "teknofest_media" ("event_id");
      CREATE INDEX IF NOT EXISTS "teknofest_media_user_id_idx" ON "teknofest_media" ("user_id");
      CREATE INDEX IF NOT EXISTS "teknofest_media_category_id_idx" ON "teknofest_media" ("category_id");
      CREATE INDEX IF NOT EXISTS "teknofest_media_mod_status_idx" ON "teknofest_media" ("moderation_status");
      CREATE INDEX IF NOT EXISTS "teknofest_media_is_featured_idx" ON "teknofest_media" ("is_featured");

      CREATE TABLE IF NOT EXISTS "teknofest_memories" (
        "id" serial PRIMARY KEY NOT NULL,
        "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
        "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "post_id" integer REFERENCES "posts"("id") ON DELETE SET NULL,
        "content" text NOT NULL,
        "author_name" varchar(100),
        "author_title" varchar(150),
        "is_featured" boolean DEFAULT false NOT NULL,
        "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL,
        "rejection_reason" text,
        "reviewed_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "reviewed_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "teknofest_memories_event_id_idx" ON "teknofest_memories" ("event_id");
      CREATE INDEX IF NOT EXISTS "teknofest_memories_user_id_idx" ON "teknofest_memories" ("user_id");
      CREATE INDEX IF NOT EXISTS "teknofest_memories_mod_status_idx" ON "teknofest_memories" ("moderation_status");

      CREATE TABLE IF NOT EXISTS "parental_controls" (
        "id" serial PRIMARY KEY NOT NULL,
        "child_user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "parent_email" varchar(255) NOT NULL,
        "pairing_code" varchar(32) NOT NULL,
        "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
        "daily_screen_time_minutes" integer DEFAULT 120 NOT NULL,
        "messaging_restricted" boolean DEFAULT true NOT NULL,
        "night_mode_enforced" boolean DEFAULT true NOT NULL,
        "attempts" integer DEFAULT 0 NOT NULL,
        "expires_at" timestamp,
        "last_notified_at" timestamp,
        "paired_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "parental_controls_child_unq" ON "parental_controls" ("child_user_id");
      ALTER TABLE "parental_controls" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
      ALTER TABLE "parental_controls" ADD COLUMN IF NOT EXISTS "attempts" integer DEFAULT 0 NOT NULL;
      ALTER TABLE "parental_controls" ALTER COLUMN "pairing_code" TYPE varchar(32);

      CREATE TABLE IF NOT EXISTS "age_verification_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "action" varchar(50) NOT NULL,
        "calculated_age" integer,
        "verification_method" varchar(50) NOT NULL,
        "token_hash" text,
        "ip_hash" varchar(128),
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "age_verification_logs_user_idx" ON "age_verification_logs" ("user_id");
    `);
    try {
      await execSafe(`
        UPDATE "teknofest_events"
        SET "location" = '\u015Eanl\u0131urfa \u2014 GAP Havaliman\u0131'
        WHERE "slug" = '2026' AND ("location" LIKE '%\u0130stanbul%' OR "location" LIKE '%Atat\xFCrk%');
      `);
      const existingEvents = await db.execute(import_drizzle_orm2.sql`SELECT id FROM "teknofest_events" WHERE "slug" = '2026' LIMIT 1;`);
      if (!existingEvents || existingEvents.rows?.length === 0 || Array.isArray(existingEvents) && existingEvents.length === 0) {
        const evInsert = await db.execute(import_drizzle_orm2.sql`
          INSERT INTO "teknofest_events" (
            "slug", "title", "theme", "description", "location", 
            "start_date", "end_date", "cover_image_url", "status", "is_featured", "stats"
          ) VALUES (
            '2026',
            'TEKNOFEST 2026',
            'Milli Teknoloji Hamlesi & Geleceğin Gençleri',
            'Bir festival sona erdi, anıların hikâyesi devam ediyor. TEKNOFEST''te geride kalan fotoğrafları, yarışma projelerini ve gençlerin unutulmaz anılarını keşfet.',
            'Şanlıurfa — GAP Havalimanı',
            '2026-09-30 09:00:00',
            '2026-10-04 19:00:00',
            null,
            'COMPLETED',
            true,
            '{"visitorCount":"1.5M+","projectCount":"2,100+","competitionsCount":"46","teamCount":"32,000+"}'::jsonb
          ) RETURNING "id";
        `);
        const eventId = evInsert.rows?.[0]?.id || Array.isArray(evInsert) && evInsert[0]?.id || 1;
        if (eventId) {
          await db.execute(import_drizzle_orm2.sql`
            INSERT INTO "teknofest_categories" ("event_id", "name", "slug", "icon", "sort_order") VALUES
            (${eventId}, '📸 Etkinlik', 'etkinlik', 'Camera', 1),
            (${eventId}, '🚀 Projeler', 'projeler', 'Rocket', 2),
            (${eventId}, '🤖 Teknoloji', 'teknoloji', 'Cpu', 3),
            (${eventId}, '🧑‍🤝‍🧑 Gençler', 'gencler', 'Users', 4),
            (${eventId}, '🏆 Yarışmalar', 'yarismalar', 'Trophy', 5),
            (${eventId}, '🎤 Sahne & Uçuş', 'sahne', 'Plane', 6),
            (${eventId}, '🌆 Festival Alanı', 'alan', 'MapPin', 7),
            (${eventId}, '💡 İlham', 'ilham', 'Sparkles', 8)
            ON CONFLICT DO NOTHING;
          `);
          await db.execute(import_drizzle_orm2.sql`
            INSERT INTO "teknofest_timeline_items" ("event_id", "date_label", "title", "description", "icon", "sort_order") VALUES
            (${eventId}, '30 Eylül', 'Büyük Açılış Günü', 'Protokol açılışı, SoloTürk ve Türk Yıldızları nefes kesen açılış uçuşları ve stantların ilk ziyaretçilerle buluşması.', 'Plane', 1),
            (${eventId}, '01 Ekim', 'Proje ve Girişim Alanları', 'Genç geliştiricilerin ve girişimcilerin çadırlarında jüri sunumları, AR/VR ve robotik teknoloji sergileri.', 'Rocket', 2),
            (${eventId}, '02 Ekim', 'Teknoloji ve İHA Sergileri', 'Otonom sistemler, insansız hava araçları ve yapay zeka yarışmalarının eleme turları ve halka açık atölyeler.', 'Cpu', 3),
            (${eventId}, '03 Ekim', 'Büyük Yarışma Finalleri', 'Roket, Model Uydu, Tarım Teknolojileri ve Hackathon yarışmalarının final etabı ve ödül heyecanı.', 'Trophy', 4),
            (${eventId}, '04 Ekim', 'Görkemli Kapanış & Ödül Töreni', 'Dereceye giren takımların ödüllerini alması, kapanış hava gösterileri ve festival anılarının taçlanması.', 'Sparkles', 5)
            ON CONFLICT DO NOTHING;
          `);
          await db.execute(import_drizzle_orm2.sql`
            INSERT INTO "teknofest_memories" ("event_id", "content", "author_name", "author_title", "is_featured", "moderation_status") VALUES
            (${eventId}, 'Aylarca geceli gündüzlü çalıştığımız otonom İHA projemizi jüri önünde uçurduğumuz andaki gururu asla unutamam. TEKNOFEST sadece bir yarışma değil, Türkiye''nin dört bir yanından gençlerle kurulan devasa bir kardeşlik ağı.', 'Alperen K.', 'İHA Takım Kaptanı', true, 'APPROVED'),
            (${eventId}, 'Festival çadırında küçük bir kardeşimizin robotik kolumuza bakarken gözlerinde gördüğüm o ışık, bize sabahlara kadar kod yazmanın değerini bir kez daha hissettirdi.', 'Zeynep B.', 'Yapay Zeka Yarışmacısı', true, 'APPROVED'),
            (${eventId}, 'İlk kez TEKNOFEST''e katıldık ve projemizle finalist olduk. Genç Sosyal''deki ekibimizle burada tanışmıştık, seneye şampiyonluk için geliyoruz!', 'Mert & Can', 'Girişimci Gençler', true, 'APPROVED')
            ON CONFLICT DO NOTHING;
          `);
        }
      }
    } catch (teknoSeedErr) {
      console.warn("\u26A0\uFE0F TEKNOFEST seed note:", teknoSeedErr);
    }
    console.log("\u2705 Database migrations completed successfully.");
  } catch (error) {
    console.error("\u274C Database migration failed:", error);
    exitCode = 1;
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
