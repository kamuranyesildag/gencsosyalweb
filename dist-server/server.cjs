"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc29) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc29 = __getOwnPropDesc(from, key)) || desc29.enumerable });
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

// server/utils/uploadConfig.ts
var import_path, import_fs, getUploadDir, ensureUploadDir;
var init_uploadConfig = __esm({
  "server/utils/uploadConfig.ts"() {
    "use strict";
    import_path = __toESM(require("path"), 1);
    import_fs = __toESM(require("fs"), 1);
    getUploadDir = () => {
      return process.env.UPLOAD_DIR || import_path.default.join(process.cwd(), "uploads");
    };
    ensureUploadDir = () => {
      const dir = getUploadDir();
      if (!import_fs.default.existsSync(dir)) {
        import_fs.default.mkdirSync(dir, { recursive: true });
      }
      return dir;
    };
  }
});

// server/utils/jwt.ts
var jwt_exports = {};
__export(jwt_exports, {
  generateAccessToken: () => generateAccessToken,
  generateEmailToken: () => generateEmailToken,
  generateRefreshToken: () => generateRefreshToken,
  generateSuspensionToken: () => generateSuspensionToken,
  generateTwoFactorToken: () => generateTwoFactorToken,
  getEmailTokenSecret: () => getEmailTokenSecret,
  getTwoFactorTokenSecret: () => getTwoFactorTokenSecret,
  hashRefreshToken: () => hashRefreshToken,
  verifyAccessToken: () => verifyAccessToken,
  verifyEmailToken: () => verifyEmailToken,
  verifyRefreshToken: () => verifyRefreshToken,
  verifySuspensionToken: () => verifySuspensionToken,
  verifyTwoFactorToken: () => verifyTwoFactorToken
});
var import_crypto, import_jsonwebtoken, getAccessTokenSecret, getRefreshTokenSecret, hashRefreshToken, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, getEmailTokenSecret, generateEmailToken, verifyEmailToken, getTwoFactorTokenSecret, generateTwoFactorToken, verifyTwoFactorToken, generateSuspensionToken, verifySuspensionToken;
var init_jwt = __esm({
  "server/utils/jwt.ts"() {
    "use strict";
    import_crypto = __toESM(require("crypto"), 1);
    import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
    getAccessTokenSecret = () => {
      return process.env.JWT_SECRET || "gencsosyal_secure_access_jwt_secret_2026";
    };
    getRefreshTokenSecret = () => {
      return process.env.JWT_REFRESH_SECRET || "gencsosyal_secure_refresh_jwt_secret_2026";
    };
    hashRefreshToken = (token) => {
      return import_crypto.default.createHash("sha256").update(token).digest("hex");
    };
    generateAccessToken = (userId, role) => {
      const configuredExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN;
      const expiresIn = !configuredExpiry || configuredExpiry === "15m" ? "24h" : configuredExpiry;
      return import_jsonwebtoken.default.sign(
        { userId, role, type: "access", jti: import_crypto.default.randomUUID() },
        getAccessTokenSecret(),
        { expiresIn }
      );
    };
    generateRefreshToken = (userId, role) => {
      return import_jsonwebtoken.default.sign(
        { userId, role, type: "refresh", jti: import_crypto.default.randomUUID() },
        getRefreshTokenSecret(),
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d" }
      );
    };
    verifyAccessToken = (token) => {
      const decoded = import_jsonwebtoken.default.verify(token, getAccessTokenSecret(), { algorithms: ["HS256"] });
      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }
      return decoded;
    };
    verifyRefreshToken = (token) => {
      const decoded = import_jsonwebtoken.default.verify(token, getRefreshTokenSecret(), { algorithms: ["HS256"] });
      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }
      return decoded;
    };
    getEmailTokenSecret = () => {
      const secret = process.env.JWT_EMAIL_SECRET;
      if (!secret) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("FATAL: JWT_EMAIL_SECRET is missing in production!");
        }
        return getAccessTokenSecret() + "_email";
      }
      return secret;
    };
    generateEmailToken = (userId, purpose) => {
      return import_jsonwebtoken.default.sign(
        { userId, purpose, type: "email" },
        getEmailTokenSecret(),
        { expiresIn: "1h" }
      );
    };
    verifyEmailToken = (token) => {
      const decoded = import_jsonwebtoken.default.verify(token, getEmailTokenSecret(), { algorithms: ["HS256"] });
      if (decoded.type !== "email") {
        throw new Error("Invalid token type");
      }
      return decoded;
    };
    getTwoFactorTokenSecret = () => {
      const secret = process.env.JWT_2FA_SECRET;
      if (!secret) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("FATAL: JWT_2FA_SECRET is missing in production!");
        }
        return getAccessTokenSecret() + "_2fa";
      }
      return secret;
    };
    generateTwoFactorToken = (userId, role) => {
      return import_jsonwebtoken.default.sign(
        { userId, role, type: "2fa" },
        getTwoFactorTokenSecret(),
        { expiresIn: "5m" }
      );
    };
    verifyTwoFactorToken = (token) => {
      const decoded = import_jsonwebtoken.default.verify(token, getTwoFactorTokenSecret(), { algorithms: ["HS256"] });
      if (decoded.type !== "2fa") {
        throw new Error("Invalid token type");
      }
      return decoded;
    };
    generateSuspensionToken = (userId, username) => {
      return import_jsonwebtoken.default.sign(
        { userId, username, type: "suspension" },
        getAccessTokenSecret(),
        { expiresIn: "7d" }
      );
    };
    verifySuspensionToken = (token) => {
      const decoded = import_jsonwebtoken.default.verify(token, getAccessTokenSecret(), { algorithms: ["HS256"] });
      if (decoded.type !== "suspension" && decoded.type !== "access") {
        throw new Error("Invalid token type");
      }
      return decoded;
    };
  }
});

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
var import_drizzle_orm, import_pg_core, users, profiles, recoveryCodes, projects, projectLikes, projectComments, posts, pollOptions, pollVotes, postMedia, comments, likes, reactions, bookmarks, postViews, reposts, follows, blocks, postMentions, commentMentions, hashtags, postHashtags, notifications, stories, storyViews, conversations, conversationMembers, messages, communities, communityMembers, communityJoinRequests, communityAuditLogs, reports, refreshTokens, otpVerifications, verificationRequests, systemSettings, securityAuditLogs, notificationPreferences, notificationPreferencesRelations, adminAuditLogs, projectCollaborators, postCollaborators, usersRelations, postsRelations, pollOptionsRelations, pollVotesRelations, commentsRelations, hashtagsRelations, postHashtagsRelations, conversationsRelations, conversationMembersRelations, messagesRelations, followsRelations, postViewsRelations, repostsRelations, projectsRelations, projectLikesRelations, projectCommentsRelations, verificationRequestsRelations, adminAuditLogsRelations, communitiesRelations, communityMembersRelations, projectCollaboratorsRelations, postCollaboratorsRelations, postMentionsRelations, commentMentionsRelations, moderationLogs, weeklyLeaderboards, badges, userBadges, weeklyLeaderboardsRelations, userBadgesRelations, badgesRelations, supportTickets, supportTicketMessages, feedbacks, supportTicketsRelations, supportTicketMessagesRelations, feedbacksRelations, announcements, announcementViews, announcementsRelations, announcementViewsRelations, appeals, parentalControls, ageVerificationLogs, parentalControlsRelations, ageVerificationLogsRelations, appealsRelations, leagueSeasons, leagueParticipants, leagueQuestions, leagueQuestionOptions, leagueMatches, leagueMatchQuestions, leagueMatchAnswers, quizQuestionSets, quizQuestionSetItems, quizRooms, quizRoomPlayers, quizRoomQuestions, quizAnswers, quizResults, quizInvites, teknofestEvents, teknofestCategories, teknofestTimelineItems, teknofestMedia, teknofestMemories, teknofestEventsRelations, teknofestCategoriesRelations, teknofestTimelineItemsRelations, teknofestMediaRelations, teknofestMemoriesRelations;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_pg_core = require("drizzle-orm/pg-core");
    users = (0, import_pg_core.pgTable)("users", {
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
    profiles = (0, import_pg_core.pgTable)("profiles", {
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
    recoveryCodes = (0, import_pg_core.pgTable)("recovery_codes", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      codeHash: (0, import_pg_core.text)("code_hash").notNull(),
      used: (0, import_pg_core.boolean)("used").default(false).notNull(),
      usedAt: (0, import_pg_core.timestamp)("used_at"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      userIdIdx: (0, import_pg_core.index)("recovery_codes_user_id_idx").on(t.userId)
    }));
    projects = (0, import_pg_core.pgTable)("projects", {
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
    projectLikes = (0, import_pg_core.pgTable)("project_likes", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      projectId: (0, import_pg_core.integer)("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      unq: (0, import_pg_core.unique)("project_likes_user_project_unq").on(t.userId, t.projectId),
      projectIdIdx: (0, import_pg_core.index)("project_likes_project_id_idx").on(t.projectId),
      userIdIdx: (0, import_pg_core.index)("project_likes_user_id_idx").on(t.userId)
    }));
    projectComments = (0, import_pg_core.pgTable)("project_comments", {
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
    posts = (0, import_pg_core.pgTable)("posts", {
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
    pollOptions = (0, import_pg_core.pgTable)("poll_options", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      text: (0, import_pg_core.varchar)("text", { length: 255 }).notNull(),
      order: (0, import_pg_core.integer)("order").default(0).notNull()
    });
    pollVotes = (0, import_pg_core.pgTable)("poll_votes", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      optionId: (0, import_pg_core.integer)("option_id").notNull().references(() => pollOptions.id, { onDelete: "cascade" }),
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      uniqueVote: (0, import_pg_core.unique)("poll_votes_post_user_unique").on(t.postId, t.userId),
      optionIdx: (0, import_pg_core.index)("poll_votes_option_idx").on(t.optionId)
    }));
    postMedia = (0, import_pg_core.pgTable)("post_media", {
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
    comments = (0, import_pg_core.pgTable)("comments", {
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
    likes = (0, import_pg_core.pgTable)("likes", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      unq: (0, import_pg_core.unique)("likes_user_post_unq").on(t.userId, t.postId),
      postIdIdx: (0, import_pg_core.index)("likes_post_id_idx").on(t.postId),
      userIdIdx: (0, import_pg_core.index)("likes_user_id_idx").on(t.userId)
    }));
    reactions = (0, import_pg_core.pgTable)("reactions", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: (0, import_pg_core.varchar)("type", { length: 20 }).notNull(),
      // like, love, haha, wow, sad, angry
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      unq: (0, import_pg_core.unique)("reactions_user_post_unq").on(t.userId, t.postId)
    }));
    bookmarks = (0, import_pg_core.pgTable)("bookmarks", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      unq: (0, import_pg_core.unique)("bookmarks_user_post_unq").on(t.userId, t.postId)
    }));
    postViews = (0, import_pg_core.pgTable)("post_views", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      viewedAt: (0, import_pg_core.timestamp)("viewed_at").defaultNow().notNull()
    }, (t) => ({
      userPostIdx: (0, import_pg_core.index)("post_views_user_post_idx").on(t.userId, t.postId),
      postViewedAtIdx: (0, import_pg_core.index)("post_views_post_viewed_at_idx").on(t.postId, t.viewedAt)
    }));
    reposts = (0, import_pg_core.pgTable)("reposts", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      unq: (0, import_pg_core.unique)("reposts_user_post_unq").on(t.userId, t.postId),
      postCreatedAtIdx: (0, import_pg_core.index)("reposts_post_created_at_idx").on(t.postId, t.createdAt)
    }));
    follows = (0, import_pg_core.pgTable)("follows", {
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
    blocks = (0, import_pg_core.pgTable)("blocks", {
      blockerId: (0, import_pg_core.integer)("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      blockedId: (0, import_pg_core.integer)("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      pk: (0, import_pg_core.primaryKey)({ columns: [t.blockerId, t.blockedId] })
    }));
    postMentions = (0, import_pg_core.pgTable)("post_mentions", {
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      mentionedUserId: (0, import_pg_core.integer)("mentioned_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      actorUserId: (0, import_pg_core.integer)("actor_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      pk: (0, import_pg_core.primaryKey)({ columns: [t.postId, t.mentionedUserId] }),
      mentionedUserIdIdx: (0, import_pg_core.index)("post_mentions_user_idx").on(t.mentionedUserId)
    }));
    commentMentions = (0, import_pg_core.pgTable)("comment_mentions", {
      commentId: (0, import_pg_core.integer)("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
      mentionedUserId: (0, import_pg_core.integer)("mentioned_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      actorUserId: (0, import_pg_core.integer)("actor_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      pk: (0, import_pg_core.primaryKey)({ columns: [t.commentId, t.mentionedUserId] }),
      mentionedUserIdIdx: (0, import_pg_core.index)("comment_mentions_user_idx").on(t.mentionedUserId)
    }));
    hashtags = (0, import_pg_core.pgTable)("hashtags", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
      normalizedName: (0, import_pg_core.varchar)("normalized_name", { length: 100 }).notNull().unique(),
      usageCount: (0, import_pg_core.integer)("usage_count").default(0).notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    postHashtags = (0, import_pg_core.pgTable)("post_hashtags", {
      postId: (0, import_pg_core.integer)("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      hashtagId: (0, import_pg_core.integer)("hashtag_id").notNull().references(() => hashtags.id, { onDelete: "cascade" })
    }, (t) => ({
      pk: (0, import_pg_core.primaryKey)({ columns: [t.postId, t.hashtagId] })
    }));
    notifications = (0, import_pg_core.pgTable)("notifications", {
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
    stories = (0, import_pg_core.pgTable)("stories", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      mediaUrl: (0, import_pg_core.text)("media_url").notNull(),
      mediaType: (0, import_pg_core.varchar)("media_type", { length: 20 }).notNull(),
      expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    storyViews = (0, import_pg_core.pgTable)("story_views", {
      storyId: (0, import_pg_core.integer)("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      viewedAt: (0, import_pg_core.timestamp)("viewed_at").defaultNow().notNull()
    }, (t) => ({
      pk: (0, import_pg_core.primaryKey)({ columns: [t.storyId, t.userId] })
    }));
    conversations = (0, import_pg_core.pgTable)("conversations", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
    });
    conversationMembers = (0, import_pg_core.pgTable)("conversation_members", {
      conversationId: (0, import_pg_core.integer)("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      joinedAt: (0, import_pg_core.timestamp)("joined_at").defaultNow().notNull()
    }, (t) => ({
      pk: (0, import_pg_core.primaryKey)({ columns: [t.conversationId, t.userId] })
    }));
    messages = (0, import_pg_core.pgTable)("messages", {
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
    communities = (0, import_pg_core.pgTable)("communities", {
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
    communityMembers = (0, import_pg_core.pgTable)("community_members", {
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
    communityJoinRequests = (0, import_pg_core.pgTable)("community_join_requests", {
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
    communityAuditLogs = (0, import_pg_core.pgTable)("community_audit_logs", {
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
    reports = (0, import_pg_core.pgTable)("reports", {
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
    refreshTokens = (0, import_pg_core.pgTable)("refresh_tokens", {
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
    otpVerifications = (0, import_pg_core.pgTable)("otp_verifications", {
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
    verificationRequests = (0, import_pg_core.pgTable)("verification_requests", {
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
    systemSettings = (0, import_pg_core.pgTable)("system_settings", {
      key: (0, import_pg_core.varchar)("key", { length: 100 }).primaryKey(),
      value: (0, import_pg_core.text)("value").notNull(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
      updatedBy: (0, import_pg_core.integer)("updated_by").references(() => users.id)
    });
    securityAuditLogs = (0, import_pg_core.pgTable)("security_audit_logs", {
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
    notificationPreferences = (0, import_pg_core.pgTable)("notification_preferences", {
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
    notificationPreferencesRelations = (0, import_drizzle_orm.relations)(notificationPreferences, ({ one }) => ({
      user: one(users, {
        fields: [notificationPreferences.userId],
        references: [users.id]
      })
    }));
    adminAuditLogs = (0, import_pg_core.pgTable)("admin_audit_logs", {
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
    projectCollaborators = (0, import_pg_core.pgTable)("project_collaborators", {
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
    postCollaborators = (0, import_pg_core.pgTable)("post_collaborators", {
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
    usersRelations = (0, import_drizzle_orm.relations)(users, ({ one, many }) => ({
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
    postsRelations = (0, import_drizzle_orm.relations)(posts, ({ one, many }) => ({
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
    pollOptionsRelations = (0, import_drizzle_orm.relations)(pollOptions, ({ one, many }) => ({
      post: one(posts, {
        fields: [pollOptions.postId],
        references: [posts.id]
      }),
      votes: many(pollVotes)
    }));
    pollVotesRelations = (0, import_drizzle_orm.relations)(pollVotes, ({ one }) => ({
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
    commentsRelations = (0, import_drizzle_orm.relations)(comments, ({ one, many }) => ({
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
    hashtagsRelations = (0, import_drizzle_orm.relations)(hashtags, ({ many }) => ({
      posts: many(postHashtags)
    }));
    postHashtagsRelations = (0, import_drizzle_orm.relations)(postHashtags, ({ one }) => ({
      post: one(posts, {
        fields: [postHashtags.postId],
        references: [posts.id]
      }),
      hashtag: one(hashtags, {
        fields: [postHashtags.hashtagId],
        references: [hashtags.id]
      })
    }));
    conversationsRelations = (0, import_drizzle_orm.relations)(conversations, ({ many }) => ({
      members: many(conversationMembers),
      messages: many(messages)
    }));
    conversationMembersRelations = (0, import_drizzle_orm.relations)(conversationMembers, ({ one }) => ({
      conversation: one(conversations, {
        fields: [conversationMembers.conversationId],
        references: [conversations.id]
      }),
      user: one(users, {
        fields: [conversationMembers.userId],
        references: [users.id]
      })
    }));
    messagesRelations = (0, import_drizzle_orm.relations)(messages, ({ one }) => ({
      conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id]
      }),
      sender: one(users, {
        fields: [messages.senderId],
        references: [users.id]
      })
    }));
    followsRelations = (0, import_drizzle_orm.relations)(follows, ({ one }) => ({
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
    postViewsRelations = (0, import_drizzle_orm.relations)(postViews, ({ one }) => ({
      user: one(users, {
        fields: [postViews.userId],
        references: [users.id]
      }),
      post: one(posts, {
        fields: [postViews.postId],
        references: [posts.id]
      })
    }));
    repostsRelations = (0, import_drizzle_orm.relations)(reposts, ({ one }) => ({
      user: one(users, {
        fields: [reposts.userId],
        references: [users.id]
      }),
      post: one(posts, {
        fields: [reposts.postId],
        references: [posts.id]
      })
    }));
    projectsRelations = (0, import_drizzle_orm.relations)(projects, ({ one, many }) => ({
      likes: many(projectLikes),
      comments: many(projectComments),
      user: one(users, {
        fields: [projects.userId],
        references: [users.id]
      })
    }));
    projectLikesRelations = (0, import_drizzle_orm.relations)(projectLikes, ({ one }) => ({
      user: one(users, {
        fields: [projectLikes.userId],
        references: [users.id]
      }),
      project: one(projects, {
        fields: [projectLikes.projectId],
        references: [projects.id]
      })
    }));
    projectCommentsRelations = (0, import_drizzle_orm.relations)(projectComments, ({ one }) => ({
      author: one(users, {
        fields: [projectComments.userId],
        references: [users.id]
      }),
      project: one(projects, {
        fields: [projectComments.projectId],
        references: [projects.id]
      })
    }));
    verificationRequestsRelations = (0, import_drizzle_orm.relations)(verificationRequests, ({ one }) => ({
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
    adminAuditLogsRelations = (0, import_drizzle_orm.relations)(adminAuditLogs, ({ one }) => ({
      admin: one(users, {
        fields: [adminAuditLogs.adminUserId],
        references: [users.id]
      })
    }));
    communitiesRelations = (0, import_drizzle_orm.relations)(communities, ({ one, many }) => ({
      posts: many(posts),
      owner: one(users, {
        fields: [communities.ownerId],
        references: [users.id]
      }),
      members: many(communityMembers)
    }));
    communityMembersRelations = (0, import_drizzle_orm.relations)(communityMembers, ({ one }) => ({
      community: one(communities, {
        fields: [communityMembers.communityId],
        references: [communities.id]
      }),
      user: one(users, {
        fields: [communityMembers.userId],
        references: [users.id]
      })
    }));
    projectCollaboratorsRelations = (0, import_drizzle_orm.relations)(projectCollaborators, ({ one }) => ({
      project: one(projects, {
        fields: [projectCollaborators.projectId],
        references: [projects.id]
      }),
      user: one(users, {
        fields: [projectCollaborators.userId],
        references: [users.id]
      })
    }));
    postCollaboratorsRelations = (0, import_drizzle_orm.relations)(postCollaborators, ({ one }) => ({
      post: one(posts, {
        fields: [postCollaborators.postId],
        references: [posts.id]
      }),
      user: one(users, {
        fields: [postCollaborators.userId],
        references: [users.id]
      })
    }));
    postMentionsRelations = (0, import_drizzle_orm.relations)(postMentions, ({ one }) => ({
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
    commentMentionsRelations = (0, import_drizzle_orm.relations)(commentMentions, ({ one }) => ({
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
    moderationLogs = (0, import_pg_core.pgTable)("moderation_logs", {
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
    weeklyLeaderboards = (0, import_pg_core.pgTable)("weekly_leaderboards", {
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
    badges = (0, import_pg_core.pgTable)("badges", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      key: (0, import_pg_core.varchar)("key", { length: 50 }).notNull().unique(),
      // e.g., 'WEEKLY_TOP_1'
      name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
      description: (0, import_pg_core.text)("description").notNull(),
      iconUrl: (0, import_pg_core.varchar)("icon_url", { length: 255 }),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    userBadges = (0, import_pg_core.pgTable)("user_badges", {
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
    weeklyLeaderboardsRelations = (0, import_drizzle_orm.relations)(weeklyLeaderboards, ({ one }) => ({
      user: one(users, {
        fields: [weeklyLeaderboards.userId],
        references: [users.id]
      })
    }));
    userBadgesRelations = (0, import_drizzle_orm.relations)(userBadges, ({ one }) => ({
      user: one(users, {
        fields: [userBadges.userId],
        references: [users.id]
      }),
      badge: one(badges, {
        fields: [userBadges.badgeId],
        references: [badges.id]
      })
    }));
    badgesRelations = (0, import_drizzle_orm.relations)(badges, ({ many }) => ({
      users: many(userBadges)
    }));
    supportTickets = (0, import_pg_core.pgTable)("support_tickets", {
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
    supportTicketMessages = (0, import_pg_core.pgTable)("support_ticket_messages", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      ticketId: (0, import_pg_core.integer)("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.integer)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      message: (0, import_pg_core.text)("message").notNull(),
      isAdmin: (0, import_pg_core.boolean)("is_admin").default(false).notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    feedbacks = (0, import_pg_core.pgTable)("feedbacks", {
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
    supportTicketsRelations = (0, import_drizzle_orm.relations)(supportTickets, ({ one, many }) => ({
      user: one(users, {
        fields: [supportTickets.userId],
        references: [users.id]
      }),
      messages: many(supportTicketMessages)
    }));
    supportTicketMessagesRelations = (0, import_drizzle_orm.relations)(supportTicketMessages, ({ one }) => ({
      ticket: one(supportTickets, {
        fields: [supportTicketMessages.ticketId],
        references: [supportTickets.id]
      }),
      user: one(users, {
        fields: [supportTicketMessages.userId],
        references: [users.id]
      })
    }));
    feedbacksRelations = (0, import_drizzle_orm.relations)(feedbacks, ({ one }) => ({
      user: one(users, {
        fields: [feedbacks.userId],
        references: [users.id]
      })
    }));
    announcements = (0, import_pg_core.pgTable)("announcements", {
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
    announcementViews = (0, import_pg_core.pgTable)("announcement_views", {
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
    announcementsRelations = (0, import_drizzle_orm.relations)(announcements, ({ one, many }) => ({
      creator: one(users, {
        fields: [announcements.createdBy],
        references: [users.id]
      }),
      views: many(announcementViews)
    }));
    announcementViewsRelations = (0, import_drizzle_orm.relations)(announcementViews, ({ one }) => ({
      announcement: one(announcements, {
        fields: [announcementViews.announcementId],
        references: [announcements.id]
      }),
      user: one(users, {
        fields: [announcementViews.userId],
        references: [users.id]
      })
    }));
    appeals = (0, import_pg_core.pgTable)("appeals", {
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
    parentalControls = (0, import_pg_core.pgTable)("parental_controls", {
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
    ageVerificationLogs = (0, import_pg_core.pgTable)("age_verification_logs", {
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
    parentalControlsRelations = (0, import_drizzle_orm.relations)(parentalControls, ({ one }) => ({
      child: one(users, {
        fields: [parentalControls.childUserId],
        references: [users.id]
      })
    }));
    ageVerificationLogsRelations = (0, import_drizzle_orm.relations)(ageVerificationLogs, ({ one }) => ({
      user: one(users, {
        fields: [ageVerificationLogs.userId],
        references: [users.id]
      })
    }));
    appealsRelations = (0, import_drizzle_orm.relations)(appeals, ({ one }) => ({
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
    leagueSeasons = (0, import_pg_core.pgTable)("league_seasons", {
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
    leagueParticipants = (0, import_pg_core.pgTable)("league_participants", {
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
    leagueQuestions = (0, import_pg_core.pgTable)("league_questions", {
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
    leagueQuestionOptions = (0, import_pg_core.pgTable)("league_question_options", {
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
    leagueMatches = (0, import_pg_core.pgTable)("league_matches", {
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
    leagueMatchQuestions = (0, import_pg_core.pgTable)("league_match_questions", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      matchId: (0, import_pg_core.integer)("match_id").notNull().references(() => leagueMatches.id, { onDelete: "cascade" }),
      questionId: (0, import_pg_core.integer)("question_id").notNull().references(() => leagueQuestions.id, { onDelete: "cascade" }),
      order: (0, import_pg_core.integer)("order").notNull()
    }, (t) => ({
      unq: (0, import_pg_core.unique)("league_match_questions_match_q_unq").on(t.matchId, t.questionId),
      matchIdx: (0, import_pg_core.index)("league_match_questions_match_idx").on(t.matchId)
    }));
    leagueMatchAnswers = (0, import_pg_core.pgTable)("league_match_answers", {
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
    quizQuestionSets = (0, import_pg_core.pgTable)("quiz_question_sets", {
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
    quizQuestionSetItems = (0, import_pg_core.pgTable)("quiz_question_set_items", {
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
    quizRooms = (0, import_pg_core.pgTable)("quiz_rooms", {
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
    quizRoomPlayers = (0, import_pg_core.pgTable)("quiz_room_players", {
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
    quizRoomQuestions = (0, import_pg_core.pgTable)("quiz_room_questions", {
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
    quizAnswers = (0, import_pg_core.pgTable)("quiz_answers", {
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
    quizResults = (0, import_pg_core.pgTable)("quiz_results", {
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
    quizInvites = (0, import_pg_core.pgTable)("quiz_invites", {
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
    teknofestEvents = (0, import_pg_core.pgTable)("teknofest_events", {
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
    teknofestCategories = (0, import_pg_core.pgTable)("teknofest_categories", {
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
    teknofestTimelineItems = (0, import_pg_core.pgTable)("teknofest_timeline_items", {
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
    teknofestMedia = (0, import_pg_core.pgTable)("teknofest_media", {
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
    teknofestMemories = (0, import_pg_core.pgTable)("teknofest_memories", {
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
    teknofestEventsRelations = (0, import_drizzle_orm.relations)(teknofestEvents, ({ many }) => ({
      categories: many(teknofestCategories),
      timelineItems: many(teknofestTimelineItems),
      media: many(teknofestMedia),
      memories: many(teknofestMemories)
    }));
    teknofestCategoriesRelations = (0, import_drizzle_orm.relations)(teknofestCategories, ({ one, many }) => ({
      event: one(teknofestEvents, {
        fields: [teknofestCategories.eventId],
        references: [teknofestEvents.id]
      }),
      media: many(teknofestMedia)
    }));
    teknofestTimelineItemsRelations = (0, import_drizzle_orm.relations)(teknofestTimelineItems, ({ one }) => ({
      event: one(teknofestEvents, {
        fields: [teknofestTimelineItems.eventId],
        references: [teknofestEvents.id]
      })
    }));
    teknofestMediaRelations = (0, import_drizzle_orm.relations)(teknofestMedia, ({ one }) => ({
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
    teknofestMemoriesRelations = (0, import_drizzle_orm.relations)(teknofestMemories, ({ one }) => ({
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
  }
});

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  createPglite: () => createPglite,
  createPool: () => createPool,
  db: () => db,
  ensureDatabaseReady: () => ensureDatabaseReady,
  getDb: () => getDb
});
var import_fs2, import_node_postgres, import_pglite, import_pg, import_pglite2, import_path2, createPool, createPglite, ensureDatabaseReady, getDb, db;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    import_fs2 = __toESM(require("fs"), 1);
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_pglite = require("drizzle-orm/pglite");
    import_pg = require("pg");
    import_pglite2 = require("@electric-sql/pglite");
    init_schema();
    import_path2 = __toESM(require("path"), 1);
    createPool = () => {
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
    createPglite = () => {
      if (!global._pgliteClient) {
        console.warn("=========================================================");
        console.warn("\u26A0\uFE0F  UYARI: DATABASE_URL ortam de\u011Fi\u015Fkeni bulunamad\u0131!");
        console.warn("Lokal PGlite (WASM) fallback veritaban\u0131 ba\u015Flat\u0131l\u0131yor...");
        console.warn("T\xFCm verileriniz ./database klas\xF6r\xFCne kaydedilecektir.");
        console.warn("=========================================================");
        const dbPath = import_path2.default.join(process.cwd(), "database");
        const pidPath = import_path2.default.join(dbPath, "postmaster.pid");
        const optsPath = import_path2.default.join(dbPath, "postmaster.opts");
        if (import_fs2.default.existsSync(pidPath)) {
          try {
            import_fs2.default.unlinkSync(pidPath);
          } catch (_) {
          }
        }
        if (import_fs2.default.existsSync(optsPath)) {
          try {
            import_fs2.default.unlinkSync(optsPath);
          } catch (_) {
          }
        }
        try {
          global._pgliteClient = new import_pglite2.PGlite(dbPath);
        } catch (err) {
          console.error("PGlite initialization failed. Backing up existing database directory...", err);
          try {
            const backupPath = import_path2.default.join(process.cwd(), `database_backup_${Date.now()}`);
            if (import_fs2.default.existsSync(dbPath)) {
              import_fs2.default.renameSync(dbPath, backupPath);
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
    ensureDatabaseReady = async () => {
      const pool = createPool();
      if (pool) {
        const client2 = await pool.connect();
        client2.release();
        return;
      }
      const dbPath = import_path2.default.join(process.cwd(), "database");
      const client = createPglite();
      try {
        await client.waitReady;
        await client.query("SELECT 1;");
      } catch (err) {
        console.error("PGlite healthcheck failed on startup. Directory might be corrupted:", err);
        try {
          if (global._pgliteClient) {
            try {
              await global._pgliteClient.close();
            } catch (_) {
            }
            global._pgliteClient = void 0;
            global._dbInstance = void 0;
          }
          const backupPath = import_path2.default.join(process.cwd(), `database_backup_${Date.now()}`);
          if (import_fs2.default.existsSync(dbPath)) {
            import_fs2.default.renameSync(dbPath, backupPath);
            console.warn(`Corrupted database backed up to: ${backupPath}`);
          }
          global._pgliteClient = new import_pglite2.PGlite(dbPath);
          await global._pgliteClient.waitReady;
          await global._pgliteClient.query("SELECT 1;");
          console.log("Clean PGlite database initialized successfully.");
        } catch (recoverErr) {
          console.error("Failed to recover clean PGlite database:", recoverErr);
          throw recoverErr;
        }
      }
    };
    getDb = () => {
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
    db = new Proxy({}, {
      get(target, prop) {
        const instance = getDb();
        const value = instance[prop];
        if (typeof value === "function") {
          return value.bind(instance);
        }
        return value;
      }
    });
  }
});

// server/middleware/auth.ts
async function tryFallbackRefreshAuth(req, res) {
  const fallbackRefresh = req.cookies?.refreshToken || (typeof req.headers["x-refresh-token"] === "string" ? req.headers["x-refresh-token"] : null);
  if (!fallbackRefresh || fallbackRefresh === "null" || fallbackRefresh === "undefined") {
    return null;
  }
  try {
    const refDecoded = verifyRefreshToken(fallbackRefresh);
    if (!refDecoded || !refDecoded.userId) return null;
    const tokenSha = hashRefreshToken(fallbackRefresh);
    const records = await db.select().from(refreshTokens).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(refreshTokens.userId, refDecoded.userId), (0, import_drizzle_orm2.eq)(refreshTokens.tokenHash, tokenSha))).limit(1);
    const record = records[0];
    if (!record) return null;
    if (/* @__PURE__ */ new Date() > new Date(record.expiresAt)) {
      return null;
    }
    if (record.revokedAt) {
      const revokedAgoMs = Date.now() - new Date(record.revokedAt).getTime();
      if (revokedAgoMs > 10 * 60 * 1e3) {
        return null;
      }
    }
    const freshAccessToken = generateAccessToken(refDecoded.userId, refDecoded.role || "USER");
    res.setHeader("x-refreshed-access-token", freshAccessToken);
    return {
      userId: refDecoded.userId,
      role: refDecoded.role || "USER",
      username: refDecoded.username
    };
  } catch {
    return null;
  }
}
var import_drizzle_orm2, cleanBearerToken, extractAccessToken, requireAuth, getUserId, requireRole, optionalAuth, optionalAuthContext, AuthContextError, requireAuthContext;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
    init_jwt();
    init_db();
    init_schema();
    import_drizzle_orm2 = require("drizzle-orm");
    cleanBearerToken = (authHeader) => {
      if (!authHeader) return null;
      if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
      const raw = authHeader.slice(7).trim();
      if (!raw || raw === "null" || raw === "undefined") return null;
      return raw;
    };
    extractAccessToken = (req) => {
      const bearer = cleanBearerToken(req.headers.authorization);
      if (bearer) return bearer;
      const cookieToken = req.cookies?.accessToken;
      if (typeof cookieToken === "string" && cookieToken.trim() && cookieToken !== "null" && cookieToken !== "undefined") {
        return cookieToken.trim();
      }
      return null;
    };
    requireAuth = async (req, res, next) => {
      const token = extractAccessToken(req);
      let decoded = null;
      if (token) {
        try {
          const verified = verifyAccessToken(token);
          if (verified && verified.userId) {
            decoded = verified;
          }
        } catch {
        }
      }
      if (!decoded) {
        decoded = await tryFallbackRefreshAuth(req, res);
      }
      if (!decoded || !decoded.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: token ? "Oturum s\xFCreniz sona erdi. L\xFCtfen tekrar giri\u015F yap\u0131n." : "Yetkilendirme token'\u0131 bulunamad\u0131."
          }
        });
        return;
      }
      try {
        const userRecord = await db.select({
          id: users.id,
          role: users.role,
          isActive: users.isActive,
          banReason: users.banReason,
          bannedAt: users.bannedAt,
          banExpiresAt: users.banExpiresAt
        }).from(users).where((0, import_drizzle_orm2.eq)(users.id, decoded.userId)).limit(1);
        if (userRecord.length === 0) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Kullan\u0131c\u0131 bulunamad\u0131." }
          });
          return;
        }
        const u = userRecord[0];
        if (!u.isActive) {
          if (u.banExpiresAt && new Date(u.banExpiresAt) <= /* @__PURE__ */ new Date()) {
            await db.update(users).set({
              isActive: true,
              banReason: null,
              bannedAt: null,
              banExpiresAt: null,
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm2.eq)(users.id, u.id));
          } else {
            const suspensionToken = generateSuspensionToken(u.id, decoded.username || "");
            res.status(403).json({
              success: false,
              error: {
                code: "ACCOUNT_SUSPENDED",
                message: "Hesab\u0131n\u0131z ask\u0131ya al\u0131nm\u0131\u015Ft\u0131r.",
                suspension: {
                  userId: u.id,
                  isPermanent: !u.banExpiresAt,
                  banReason: u.banReason || "Topluluk kurallar\u0131n\u0131n ihlali",
                  bannedAt: u.bannedAt,
                  banExpiresAt: u.banExpiresAt,
                  suspensionToken
                }
              }
            });
            return;
          }
        }
        req.user = {
          userId: u.id,
          role: u.role || decoded.role,
          username: decoded.username
        };
        next();
      } catch (error) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Oturum do\u011Frulanamad\u0131. L\xFCtfen tekrar giri\u015F yap\u0131n." }
        });
      }
    };
    getUserId = (req) => {
      if (!req.user || !req.user.userId) {
        throw new Error("UNAUTHORIZED_ACCESS");
      }
      return req.user.userId;
    };
    requireRole = (role) => {
      return (req, res, next) => {
        if (!req.user) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "L\xFCtfen giri\u015F yap\u0131n." }
          });
          return;
        }
        if (req.user.role.toUpperCase() !== role.toUpperCase() && req.user.role.toUpperCase() !== "ADMIN") {
          res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Bu i\u015Flem i\xE7in yetkiniz yok." }
          });
          return;
        }
        next();
      };
    };
    optionalAuth = async (req, res, next) => {
      const token = extractAccessToken(req);
      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          if (decoded && decoded.userId) {
            req.user = decoded;
            next();
            return;
          }
        } catch {
        }
      }
      const fallbackUser = await tryFallbackRefreshAuth(req, res);
      if (fallbackUser) {
        req.user = fallbackUser;
      }
      next();
    };
    optionalAuthContext = (req) => {
      return req.user?.userId || null;
    };
    AuthContextError = class extends Error {
      constructor(message) {
        super(message);
        this.status = 401;
        this.name = "AuthContextError";
      }
    };
    requireAuthContext = (req) => {
      if (!req.user || !req.user.userId) {
        throw new AuthContextError("UNAUTHORIZED_CONTEXT");
      }
      return req.user.userId;
    };
  }
});

// server/utils/blocks.ts
async function getBlockedIds(userId) {
  if (!userId) return [];
  const records = await db.select().from(blocks).where((0, import_drizzle_orm3.or)((0, import_drizzle_orm3.eq)(blocks.blockerId, userId), (0, import_drizzle_orm3.eq)(blocks.blockedId, userId)));
  const ids = /* @__PURE__ */ new Set();
  records.forEach((r) => {
    if (r.blockerId !== userId) ids.add(r.blockerId);
    if (r.blockedId !== userId) ids.add(r.blockedId);
  });
  return Array.from(ids);
}
var import_drizzle_orm3;
var init_blocks = __esm({
  "server/utils/blocks.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm3 = require("drizzle-orm");
  }
});

// server/services/suggestions.ts
async function getFollowSuggestions(currentUserId, options = {}) {
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
  const offset = Math.max(options.offset ?? 0, 0);
  const followingRows = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm4.eq)(follows.followerId, currentUserId));
  const followingIds = followingRows.map((r) => r.followingId);
  const blockedIds = await getBlockedIds(currentUserId);
  const excludedIdsSet = /* @__PURE__ */ new Set([
    currentUserId,
    ...followingIds,
    ...blockedIds,
    ...options.excludeIds || []
  ]);
  const excludedArray = Array.from(excludedIdsSet);
  const myProfile = await db.select({
    interests: profiles.interests,
    location: profiles.location
  }).from(profiles).where((0, import_drizzle_orm4.eq)(profiles.userId, currentUserId)).limit(1);
  const myInterests = Array.isArray(myProfile[0]?.interests) ? myProfile[0].interests : [];
  const myCommunities = await db.select({
    communityId: communityMembers.communityId,
    communityName: communities.name
  }).from(communityMembers).innerJoin(communities, (0, import_drizzle_orm4.eq)(communityMembers.communityId, communities.id)).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(communityMembers.userId, currentUserId), (0, import_drizzle_orm4.isNull)(communities.deletedAt)));
  const myCommunityIds = myCommunities.map((c) => c.communityId);
  const myCommunityNameMap = /* @__PURE__ */ new Map();
  myCommunities.forEach((c) => myCommunityNameMap.set(c.communityId, c.communityName));
  const mutualFollowersMap = /* @__PURE__ */ new Map();
  if (followingIds.length > 0) {
    const mutualConditions = [(0, import_drizzle_orm4.inArray)(follows.followerId, followingIds)];
    if (excludedArray.length > 0) {
      mutualConditions.push((0, import_drizzle_orm4.notInArray)(follows.followingId, excludedArray));
    }
    const mutualRows = await db.select({
      candidateId: follows.followingId,
      mutualCount: import_drizzle_orm4.sql`count(distinct ${follows.followerId})`.as("mutual_count")
    }).from(follows).where((0, import_drizzle_orm4.and)(...mutualConditions)).groupBy(follows.followingId);
    mutualRows.forEach((r) => {
      mutualFollowersMap.set(r.candidateId, Number(r.mutualCount) || 0);
    });
  }
  const sharedCommunityMap = /* @__PURE__ */ new Map();
  if (myCommunityIds.length > 0) {
    const commConditions = [(0, import_drizzle_orm4.inArray)(communityMembers.communityId, myCommunityIds)];
    if (excludedArray.length > 0) {
      commConditions.push((0, import_drizzle_orm4.notInArray)(communityMembers.userId, excludedArray));
    }
    const commRows = await db.select({
      candidateId: communityMembers.userId,
      communityId: communityMembers.communityId,
      communityName: communities.name
    }).from(communityMembers).innerJoin(communities, (0, import_drizzle_orm4.eq)(communityMembers.communityId, communities.id)).where((0, import_drizzle_orm4.and)(...commConditions));
    commRows.forEach((r) => {
      const current = sharedCommunityMap.get(r.candidateId) || { count: 0, firstCommunityName: r.communityName };
      current.count += 1;
      if (!current.firstCommunityName) current.firstCommunityName = r.communityName;
      sharedCommunityMap.set(r.candidateId, current);
    });
  }
  const userConditions = [
    (0, import_drizzle_orm4.eq)(users.isActive, true),
    (0, import_drizzle_orm4.or)((0, import_drizzle_orm4.eq)(profiles.isPrivate, false), import_drizzle_orm4.sql`${profiles.isPrivate} IS NULL`)
  ];
  if (excludedArray.length > 0) {
    userConditions.push((0, import_drizzle_orm4.notInArray)(users.id, excludedArray));
  }
  const candidateUsers = await db.select({
    id: users.id,
    username: users.username,
    isVerified: users.isVerified,
    createdAt: users.createdAt,
    displayName: profiles.displayName,
    bio: profiles.bio,
    avatarUrl: profiles.avatarUrl,
    interests: profiles.interests,
    location: profiles.location
  }).from(users).leftJoin(profiles, (0, import_drizzle_orm4.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm4.and)(...userConditions)).limit(100);
  if (candidateUsers.length === 0) {
    return {
      users: [],
      pagination: {
        limit,
        offset,
        total: 0,
        hasMore: false
      }
    };
  }
  const candidateIds = candidateUsers.map((c) => c.id);
  const postActivityMap = /* @__PURE__ */ new Map();
  if (candidateIds.length > 0) {
    const activityRows = await db.select({
      userId: posts.userId,
      postCount: import_drizzle_orm4.sql`count(*)`.as("post_count")
    }).from(posts).where((0, import_drizzle_orm4.and)(
      (0, import_drizzle_orm4.inArray)(posts.userId, candidateIds),
      (0, import_drizzle_orm4.eq)(posts.moderationStatus, "APPROVED")
    )).groupBy(posts.userId);
    activityRows.forEach((a) => postActivityMap.set(a.userId, Number(a.postCount) || 0));
  }
  const COMMON_FOLLOWERS_WEIGHT = 40;
  const COMMON_COMMUNITIES_WEIGHT = 25;
  const COMMON_INTERESTS_WEIGHT = 20;
  const PROFILE_SIMILARITY_WEIGHT = 10;
  const RECENT_ACTIVITY_WEIGHT = 5;
  const scoredCandidates = candidateUsers.map((candidate) => {
    const mutualCount = mutualFollowersMap.get(candidate.id) || 0;
    const commSignal = sharedCommunityMap.get(candidate.id);
    const commCount = commSignal?.count || 0;
    const candidateInterests = Array.isArray(candidate.interests) ? candidate.interests : [];
    const commonInterests = myInterests.filter(
      (interest) => candidateInterests.some((ci) => ci.toLowerCase().trim() === interest.toLowerCase().trim())
    );
    let profileScore = 0;
    if (candidate.displayName && candidate.displayName !== candidate.username) profileScore += 3;
    if (candidate.avatarUrl) profileScore += 4;
    if (candidate.bio && candidate.bio.trim().length > 10) profileScore += 3;
    if (candidate.isVerified) profileScore += 5;
    const postCount = postActivityMap.get(candidate.id) || 0;
    const activityScore = Math.min(postCount * 2, 10);
    const totalScore = mutualCount * COMMON_FOLLOWERS_WEIGHT + commCount * COMMON_COMMUNITIES_WEIGHT + commonInterests.length * COMMON_INTERESTS_WEIGHT + (profileScore > 0 ? PROFILE_SIMILARITY_WEIGHT : 0) + (activityScore > 0 ? RECENT_ACTIVITY_WEIGHT : 0);
    let reason = "\xD6nerilen kullan\u0131c\u0131";
    if (mutualCount > 0) {
      reason = mutualCount === 1 ? "1 ortak takip" : `${mutualCount} ortak takip`;
    } else if (commCount > 0 && commSignal?.firstCommunityName) {
      reason = `${commSignal.firstCommunityName} toplulu\u011Fundan`;
    } else if (commonInterests.length > 0) {
      reason = `${commonInterests[0]} ile ilgileniyor`;
    } else if (candidate.isVerified) {
      reason = "Onayl\u0131 i\xE7erik \xFCreticisi";
    } else if (postCount > 0) {
      reason = "Aktif i\xE7erik \xFCreticisi";
    } else {
      reason = "Toplulukta yeni ve aktif";
    }
    return {
      id: candidate.id,
      username: candidate.username,
      displayName: candidate.displayName || candidate.username,
      avatarUrl: candidate.avatarUrl || null,
      avatar: candidate.avatarUrl || null,
      bio: candidate.bio || null,
      isVerified: Boolean(candidate.isVerified),
      mutualFollowers: mutualCount,
      reason,
      commonCommunities: commCount,
      commonInterests,
      _score: totalScore
    };
  });
  scoredCandidates.sort((a, b) => b._score - a._score || b.id - a.id);
  const paginated = scoredCandidates.slice(offset, offset + limit).map(({ _score, ...user }) => user);
  return {
    users: paginated,
    pagination: {
      limit,
      offset,
      total: scoredCandidates.length,
      hasMore: offset + limit < scoredCandidates.length
    }
  };
}
var import_drizzle_orm4;
var init_suggestions = __esm({
  "server/services/suggestions.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm4 = require("drizzle-orm");
    init_blocks();
  }
});

// server/migrate.ts
var migrate_exports = {};
__export(migrate_exports, {
  runMigration: () => runMigration
});
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
          await db.execute(import_drizzle_orm7.sql.raw(stmt));
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
        await (0, import_migrator.migrate)(db, { migrationsFolder: import_path3.default.join(process.cwd(), "migrations") });
      } else {
        await (0, import_migrator2.migrate)(db, { migrationsFolder: import_path3.default.join(process.cwd(), "migrations") });
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
      const existingEvents = await db.execute(import_drizzle_orm7.sql`SELECT id FROM "teknofest_events" WHERE "slug" = '2026' LIMIT 1;`);
      if (!existingEvents || existingEvents.rows?.length === 0 || Array.isArray(existingEvents) && existingEvents.length === 0) {
        const evInsert = await db.execute(import_drizzle_orm7.sql`
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
          await db.execute(import_drizzle_orm7.sql`
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
          await db.execute(import_drizzle_orm7.sql`
            INSERT INTO "teknofest_timeline_items" ("event_id", "date_label", "title", "description", "icon", "sort_order") VALUES
            (${eventId}, '30 Eylül', 'Büyük Açılış Günü', 'Protokol açılışı, SoloTürk ve Türk Yıldızları nefes kesen açılış uçuşları ve stantların ilk ziyaretçilerle buluşması.', 'Plane', 1),
            (${eventId}, '01 Ekim', 'Proje ve Girişim Alanları', 'Genç geliştiricilerin ve girişimcilerin çadırlarında jüri sunumları, AR/VR ve robotik teknoloji sergileri.', 'Rocket', 2),
            (${eventId}, '02 Ekim', 'Teknoloji ve İHA Sergileri', 'Otonom sistemler, insansız hava araçları ve yapay zeka yarışmalarının eleme turları ve halka açık atölyeler.', 'Cpu', 3),
            (${eventId}, '03 Ekim', 'Büyük Yarışma Finalleri', 'Roket, Model Uydu, Tarım Teknolojileri ve Hackathon yarışmalarının final etabı ve ödül heyecanı.', 'Trophy', 4),
            (${eventId}, '04 Ekim', 'Görkemli Kapanış & Ödül Töreni', 'Dereceye giren takımların ödüllerini alması, kapanış hava gösterileri ve festival anılarının taçlanması.', 'Sparkles', 5)
            ON CONFLICT DO NOTHING;
          `);
          await db.execute(import_drizzle_orm7.sql`
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
var import_path3, import_migrator, import_migrator2, import_drizzle_orm7;
var init_migrate = __esm({
  "server/migrate.ts"() {
    "use strict";
    import_path3 = __toESM(require("path"), 1);
    import_migrator = require("drizzle-orm/node-postgres/migrator");
    import_migrator2 = require("drizzle-orm/pglite/migrator");
    import_drizzle_orm7 = require("drizzle-orm");
    init_db();
    if (process.argv[1] && process.argv[1].includes("migrate")) {
      runMigration(true);
    }
  }
});

// server/seed.ts
var seed_exports = {};
__export(seed_exports, {
  seedAnnouncementsIfNeeded: () => seedAnnouncementsIfNeeded,
  seedBadgesIfNeeded: () => seedBadgesIfNeeded,
  seedInitialDataIfNeeded: () => seedInitialDataIfNeeded,
  seedStarterContentIfNeeded: () => seedStarterContentIfNeeded
});
async function seedAnnouncementsIfNeeded() {
  try {
    const existing = await db.select({ id: announcements.id }).from(announcements).limit(1);
    if (existing.length > 0) return;
    console.log("\u{1F4E2} Seeding initial welcome announcement...");
    await db.insert(announcements).values({
      title: "Gen\xE7 Sosyal'e Ho\u015F Geldin! \u{1F389}",
      content: "Yenilenen Gen\xE7 Sosyal platformunda projelerini sergileyebilir, etkinliklere kat\u0131labilir ve topluluklarla anl\u0131k ba\u011Flant\u0131 kurabilirsin.",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      buttonText: "Ke\u015Ffetmeye Ba\u015Fla",
      buttonUrl: "/explore",
      status: "published",
      targetType: "all",
      priority: 10,
      startsAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  } catch (err) {
    console.error("Error seeding initial announcement:", err);
  }
}
async function seedBadgesIfNeeded() {
  try {
    const existingBadges = await db.select({ id: badges.id }).from(badges).limit(1);
    if (existingBadges.length > 0) return;
    console.log("\u{1F3C5} Seeding initial platform badges...");
    await db.insert(badges).values([
      {
        key: "EARLY_ADOPTER",
        name: "\u0130lk Kat\u0131lanlar",
        description: "Gen\xE7 Sosyal'in \xF6nc\xFC topluluk \xFCyelerinden biri.",
        iconUrl: "Medal"
      },
      {
        key: "CREATIVE_MIND",
        name: "\xDCretken Zihin",
        description: "Proje ve i\xE7erikleriyle toplulu\u011Fu besleyen \xFCretici.",
        iconUrl: "Sparkles"
      },
      {
        key: "COMMUNITY_HERO",
        name: "Topluluk Kahraman\u0131",
        description: "Yorum ve etkile\u015Fimleriyle tart\u0131\u015Fmalar\u0131 canland\u0131ran \xFCye.",
        iconUrl: "Users"
      },
      {
        key: "VERIFIED_CREATOR",
        name: "Onayl\u0131 Profil",
        description: "Kimli\u011Fi do\u011Frulanm\u0131\u015F resmi veya tan\u0131nm\u0131\u015F profil.",
        iconUrl: "CheckCircle2"
      }
    ]);
  } catch (err) {
    console.error("Error seeding badges:", err);
  }
}
async function seedStarterContentIfNeeded() {
  try {
    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
    if (existingUsers.length === 0) return;
    const authorId = existingUsers[0].id;
    const existingComm = await db.select({ id: communities.id }).from(communities).limit(1);
    if (existingComm.length === 0) {
      console.log("\u{1F310} Seeding starter public communities...");
      const seeded = await db.insert(communities).values([
        {
          ownerId: authorId,
          name: "Yaz\u0131l\u0131m & Teknoloji",
          slug: "yazilim-ve-teknoloji",
          description: "Gen\xE7 yaz\u0131l\u0131mc\u0131lar\u0131n kod payla\u015Ft\u0131\u011F\u0131, a\xE7\u0131k kaynak projeler geli\u015Ftirdi\u011Fi ve teknoloji tart\u0131\u015Ft\u0131\u011F\u0131 topluluk.",
          category: "Yaz\u0131l\u0131m",
          isPrivate: false,
          avatarUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80",
          coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
        },
        {
          ownerId: authorId,
          name: "Tasar\u0131m & UI/UX",
          slug: "tasarim-ve-ui-ux",
          description: "Aray\xFCz tasar\u0131m\u0131, kullan\u0131c\u0131 deneyimi, tipografi ve dijital sanatla ilgilenen gen\xE7 tasar\u0131mc\u0131lar.",
          category: "Tasar\u0131m",
          isPrivate: false,
          avatarUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=150&auto=format&fit=crop&q=80",
          coverUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80"
        }
      ]).returning();
      for (const sc of seeded) {
        await db.insert(communityMembers).values({
          communityId: sc.id,
          userId: authorId,
          role: "OWNER"
        }).onConflictDoNothing();
      }
    }
    const existingProj = await db.select({ id: projects.id }).from(projects).limit(1);
    if (existingProj.length === 0) {
      console.log("\u{1F680} Seeding starter public projects...");
      await db.insert(projects).values([
        {
          userId: authorId,
          title: "A\xE7\u0131k Kaynak Geli\u015Ftirici Kiti",
          description: "Gen\xE7 yaz\u0131l\u0131mc\u0131lar\u0131n modern web projelerini h\u0131zl\u0131ca aya\u011Fa kald\u0131rmas\u0131n\u0131 sa\u011Flayan mod\xFCler \u015Fablon ve ara\xE7 seti.",
          detailedDescription: "Bu proje; TypeScript, modern aray\xFCz bile\u015Fenleri ve API entegrasyonlar\u0131n\u0131 i\xE7eren kapsaml\u0131 bir a\xE7\u0131k kaynak geli\u015Ftirici ba\u015Flang\u0131\xE7 kitidir.",
          category: "Yaz\u0131l\u0131m",
          status: "published",
          projectUrl: "https://gencsosyal.com/projects",
          githubUrl: "https://github.com/gencsosyal",
          imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
          tags: ["a\xE7\u0131kkaynak", "yaz\u0131l\u0131m", "typescript", "geli\u015Ftirici"]
        }
      ]);
    }
    const existingTags = await db.select({ id: hashtags.id }).from(hashtags).limit(1);
    if (existingTags.length === 0) {
      console.log("\u{1F3F7}\uFE0F Seeding starter public hashtags...");
      await db.insert(hashtags).values([
        { name: "yaz\u0131l\u0131m", usageCount: 5 },
        { name: "teknoloji", usageCount: 4 },
        { name: "a\xE7\u0131kkaynak", usageCount: 3 },
        { name: "\xFCretim", usageCount: 3 },
        { name: "tasar\u0131m", usageCount: 2 }
      ]);
    }
  } catch (err) {
    console.error("Error seeding starter content:", err);
  }
}
async function seedInitialDataIfNeeded() {
  try {
    await seedBadgesIfNeeded();
    await seedAnnouncementsIfNeeded();
    await seedStarterContentIfNeeded();
    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
    if (existingUsers.length > 0) {
      return;
    }
    console.log("\u{1F331} Database is empty. Seeding initial admin and official account...");
    const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD && process.env.INITIAL_ADMIN_PASSWORD.trim().length >= 8 ? process.env.INITIAL_ADMIN_PASSWORD.trim() : import_crypto2.default.randomBytes(16).toString("base64url");
    if (!process.env.INITIAL_ADMIN_PASSWORD && process.env.NODE_ENV !== "production") {
      console.log(`\u{1F510} [SEED] Initial admin password generated for local development (set INITIAL_ADMIN_PASSWORD in .env to customize).`);
    }
    const passwordHash = await import_argon2.default.hash(initialAdminPassword);
    const [adminUser] = await db.insert(users).values({
      email: "admin@gencsosyal.com",
      username: "admin",
      passwordHash,
      role: "ADMIN",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      isOfficialAccount: true,
      officialPriority: "high"
    }).returning();
    await db.insert(profiles).values({
      userId: adminUser.id,
      displayName: "Gen\xE7 Sosyal Y\xF6netim",
      bio: "Gen\xE7 Sosyal Resmi Y\xF6netim Hesab\u0131",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isPrivate: false,
      onboardingCompleted: true
    });
    const [officialUser] = await db.insert(users).values({
      email: "iletisim@gencsosyal.com",
      username: "gencsosyal",
      passwordHash,
      role: "USER",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      isOfficialAccount: true,
      officialPriority: "high"
    }).returning();
    await db.insert(profiles).values({
      userId: officialUser.id,
      displayName: "Gen\xE7 Sosyal",
      bio: "Gen\xE7lerin fikirlerini, projelerini ve enerjilerini payla\u015Ft\u0131\u011F\u0131 yeni nesil sosyal platform. \u{1F680}",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      isPrivate: false,
      onboardingCompleted: true
    });
    await db.insert(posts).values({
      userId: officialUser.id,
      content: "Gen\xE7 Sosyal'e ho\u015F geldiniz! \u{1F389}\nBurada yeni projeler ke\u015Ffedebilir, topluluklarla etkile\u015Fime ge\xE7ebilir ve fikirlerinizi \xF6zg\xFCrce payla\u015Fabilirsiniz. Hep birlikte b\xFCy\xFCyoruz!",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 10
    });
    await db.insert(systemSettings).values({
      key: "auto_follow_users",
      value: JSON.stringify([officialUser.id]),
      updatedBy: adminUser.id,
      updatedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: systemSettings.key,
      set: {
        value: JSON.stringify([officialUser.id]),
        updatedBy: adminUser.id,
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
    console.log("\u2705 Initial seeding completed successfully.");
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}
var import_argon2, import_crypto2;
var init_seed = __esm({
  "server/seed.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_argon2 = __toESM(require("argon2"), 1);
    import_crypto2 = __toESM(require("crypto"), 1);
  }
});

// server/services/leagueAutomation.ts
var leagueAutomation_exports = {};
__export(leagueAutomation_exports, {
  calculateAge: () => calculateAge,
  checkAndRunSeasonTransitions: () => checkAndRunSeasonTransitions,
  determineAgeGroup: () => determineAgeGroup,
  ensureCurrentSeason: () => ensureCurrentSeason,
  ensureLeagueBadges: () => ensureLeagueBadges,
  finalizeSeason: () => finalizeSeason,
  getIstanbulDate: () => getIstanbulDate,
  seedStarterQuestionsIfNeeded: () => seedStarterQuestionsIfNeeded
});
function getIstanbulDate() {
  const now = /* @__PURE__ */ new Date();
  return now;
}
function calculateAge(birthDate) {
  if (!birthDate) return 16;
  const bDate = new Date(birthDate);
  const now = /* @__PURE__ */ new Date();
  let age = now.getFullYear() - bDate.getFullYear();
  const m = now.getMonth() - bDate.getMonth();
  if (m < 0 || m === 0 && now.getDate() < bDate.getDate()) {
    age--;
  }
  return Math.max(10, Math.min(99, age));
}
function determineAgeGroup(age) {
  if (age <= 15) return "13-15";
  if (age <= 17) return "16-17";
  return "18+";
}
async function ensureCurrentSeason() {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [existing] = await db.select().from(leagueSeasons).where((0, import_drizzle_orm8.eq)(leagueSeasons.year, currentYear)).limit(1);
  if (existing) {
    if (existing.status === "COMPLETED" && !existing.settings?.simulationMode) {
      const updatedSettings = {
        ...existing.settings,
        simulationMode: true
      };
      await db.update(leagueSeasons).set({ status: "IN_PROGRESS", settings: updatedSettings, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm8.eq)(leagueSeasons.id, existing.id));
      existing.status = "IN_PROGRESS";
      existing.settings = updatedSettings;
    }
    return existing;
  }
  console.log(`\u{1F3C6} Otomatik Yeni Sezon Olu\u015Fturuluyor: Gen\xE7lik Ligi ${currentYear}...`);
  const regStart = /* @__PURE__ */ new Date(`${currentYear}-05-01T00:00:00+03:00`);
  const regEnd = /* @__PURE__ */ new Date(`${currentYear}-05-18T23:59:59+03:00`);
  const startDate = /* @__PURE__ */ new Date(`${currentYear}-05-19T00:00:00+03:00`);
  const endDate = /* @__PURE__ */ new Date(`${currentYear}-05-19T23:59:59+03:00`);
  const now = /* @__PURE__ */ new Date();
  let initialStatus = "UPCOMING";
  if (now >= startDate && now <= endDate) {
    initialStatus = "IN_PROGRESS";
  } else if (now >= regStart && now <= regEnd) {
    initialStatus = "REGISTRATION_OPEN";
  } else if (now > endDate) {
    initialStatus = "COMPLETED";
  }
  const [newSeason] = await db.insert(leagueSeasons).values({
    year: currentYear,
    title: `${currentYear} 19 May\u0131s Gen\xE7lik Ligi`,
    theme: "19 May\u0131s Atat\xFCrk'\xFC Anma, Gen\xE7lik ve Spor Bayram\u0131 Bilgi ve Yetenek Ligi",
    description: "T\xFCrkiye'nin d\xF6rt bir yan\u0131ndan gen\xE7lerin tarih, bilim, teknoloji, spor ve genel k\xFClt\xFCr alanlar\u0131nda yar\u0131\u015Ft\u0131\u011F\u0131 prestijli milli bilgi ligi.",
    registrationStartDate: regStart,
    registrationEndDate: regEnd,
    startDate,
    endDate,
    status: initialStatus,
    settings: {
      ageGroups: ["13-15", "16-17", "18+"],
      pointsCorrect: 100,
      pointsHardBonus: 50,
      maxSpeedBonus: 25,
      questionTimeLimit: 20,
      questionsPerMatch: 8,
      simulationMode: false
    }
  }).returning();
  await ensureLeagueBadges();
  return newSeason;
}
async function ensureLeagueBadges() {
  const starterBadges = [
    {
      key: "LEAGUE_CHAMPION",
      name: "\u{1F3C6} 19 May\u0131s Gen\xE7lik Ligi \u015Eampiyonu",
      description: "19 May\u0131s Gen\xE7lik Ligi finalini kazanarak sezon \u015Fampiyonu olan gen\xE7 yetenek."
    },
    {
      key: "LEAGUE_FINALIST",
      name: "\u{1F947} Gen\xE7lik Ligi Finalisti",
      description: "19 May\u0131s Gen\xE7lik Ligi final a\u015Famas\u0131na kadar y\xFCkselme ba\u015Far\u0131s\u0131 g\xF6steren yar\u0131\u015Fmac\u0131."
    },
    {
      key: "LEAGUE_SPEED_DEMON",
      name: "\u26A1 H\u0131zl\u0131 Cevap\xE7\u0131",
      description: "Sorular\u0131 5 saniyenin alt\u0131nda do\u011Fru yan\u0131tlayarak maksimum h\u0131z bonusu kazanan deha."
    },
    {
      key: "LEAGUE_KNOWLEDGE_MASTER",
      name: "\u{1F9E0} Bilgi Ustas\u0131",
      description: "Gen\xE7lik Ligi'nde tek bir ma\xE7ta t\xFCm sorular\u0131 firesiz do\u011Fru yan\u0131tlayan yar\u0131\u015Fmac\u0131."
    }
  ];
  for (const b of starterBadges) {
    const [exists2] = await db.select().from(badges).where((0, import_drizzle_orm8.eq)(badges.key, b.key)).limit(1);
    if (!exists2) {
      await db.insert(badges).values(b).onConflictDoNothing();
    }
  }
}
async function checkAndRunSeasonTransitions() {
  try {
    const seasons = await db.select().from(leagueSeasons);
    const now = /* @__PURE__ */ new Date();
    for (const season of seasons) {
      const isSim = season.settings?.simulationMode;
      if (isSim) continue;
      let targetStatus = season.status;
      if (now < season.registrationStartDate) {
        targetStatus = "UPCOMING";
      } else if (now >= season.registrationStartDate && now <= season.registrationEndDate) {
        targetStatus = "REGISTRATION_OPEN";
      } else if (now >= season.startDate && now <= season.endDate) {
        targetStatus = "IN_PROGRESS";
      } else if (now > season.endDate) {
        targetStatus = "COMPLETED";
      }
      if (targetStatus !== season.status) {
        console.log(`\u{1F504} Sezon #${season.year} durumu g\xFCncelleniyor: ${season.status} -> ${targetStatus}`);
        if (targetStatus === "COMPLETED" && season.status !== "COMPLETED") {
          await finalizeSeason(season.id);
        }
        await db.update(leagueSeasons).set({ status: targetStatus, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm8.eq)(leagueSeasons.id, season.id));
      }
    }
  } catch (err) {
    console.error("Error running season transitions:", err);
  }
}
async function finalizeSeason(seasonId) {
  try {
    const topParticipants = await db.select().from(leagueParticipants).where((0, import_drizzle_orm8.eq)(leagueParticipants.seasonId, seasonId)).orderBy((0, import_drizzle_orm8.desc)(leagueParticipants.totalPoints), (0, import_drizzle_orm8.desc)(leagueParticipants.matchesWon)).limit(5);
    if (topParticipants.length === 0) return;
    const champion = topParticipants[0];
    await db.update(leagueSeasons).set({ championUserId: champion.userId, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm8.eq)(leagueSeasons.id, seasonId));
    const [championBadge] = await db.select().from(badges).where((0, import_drizzle_orm8.eq)(badges.key, "LEAGUE_CHAMPION")).limit(1);
    if (championBadge) {
      await db.insert(userBadges).values({
        userId: champion.userId,
        badgeId: championBadge.id,
        metadata: { seasonId, rank: 1, awardedAt: (/* @__PURE__ */ new Date()).toISOString() }
      }).onConflictDoNothing();
    }
    const [finalistBadge] = await db.select().from(badges).where((0, import_drizzle_orm8.eq)(badges.key, "LEAGUE_FINALIST")).limit(1);
    if (finalistBadge) {
      for (let i = 1; i < topParticipants.length && i <= 3; i++) {
        await db.insert(userBadges).values({
          userId: topParticipants[i].userId,
          badgeId: finalistBadge.id,
          metadata: { seasonId, rank: i + 1, awardedAt: (/* @__PURE__ */ new Date()).toISOString() }
        }).onConflictDoNothing();
      }
    }
    console.log(`\u{1F3C6} Sezon #${seasonId} \u015Eampiyonu belirlendi: User #${champion.userId}`);
  } catch (err) {
    console.error("Error finalizing season:", err);
  }
}
async function seedStarterQuestionsIfNeeded() {
  try {
    const existing = await db.select({ id: leagueQuestions.id }).from(leagueQuestions).limit(1);
    if (existing.length > 0) return;
    console.log("\u{1F4DA} Gen\xE7lik Ligi ba\u015Flang\u0131\xE7 soru havuzu olu\u015Fturuluyor...");
    const starterQuestions = [
      // 1. Tarih ve Kültür
      {
        question: "Gazi Mustafa Kemal Atat\xFCrk, Milli M\xFCcadele'yi ba\u015Flatmak \xFCzere Samsun'a hangi vapur ile gitmi\u015Ftir?",
        category: "Tarih ve K\xFClt\xFCr",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Mustafa Kemal Pa\u015Fa ve kurmay heyeti 19 May\u0131s 1919'da Band\u0131rma Vapuru ile Samsun Liman\u0131'na varm\u0131\u015Ft\u0131r.",
        sourceType: "OFFICIAL",
        sourceReference: "Genelkurmay Askeri Tarih Ar\u015Fivi",
        options: [
          { key: "A", text: "G\xFClcemal Vapuru", isCorrect: false },
          { key: "B", text: "Band\u0131rma Vapuru", isCorrect: true },
          { key: "C", text: "Alemdar Gemisi", isCorrect: false },
          { key: "D", text: "Nusret May\u0131n Gemisi", isCorrect: false }
        ]
      },
      {
        question: "Mustafa Kemal Atat\xFCrk, 'B\xFCt\xFCn \xFCmidim gen\xE7liktedir' s\xF6z\xFCn\xFC hangi eseri veya konu\u015Fmas\u0131nda \xF6zellikle vurgulam\u0131\u015Ft\u0131r?",
        category: "Tarih ve K\xFClt\xFCr",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "Atat\xFCrk, Cumhuriyet'in ilelebet muhafazas\u0131 ve m\xFCdafaas\u0131 g\xF6revini T\xFCrk gen\xE7li\u011Fine emanet etmi\u015Ftir.",
        sourceType: "OFFICIAL",
        sourceReference: "Atat\xFCrk'\xFCn S\xF6ylev ve Deme\xE7leri",
        options: [
          { key: "A", text: "Nutuk", isCorrect: true },
          { key: "B", text: "Medeni Bilgiler", isCorrect: false },
          { key: "C", text: "Geometri K\u0131lavuzu", isCorrect: false },
          { key: "D", text: "Anafartalar Muharebat\u0131 Raporu", isCorrect: false }
        ]
      },
      {
        question: "19 May\u0131s g\xFCn\xFC hangi kanunla resmi olarak 'Gen\xE7lik ve Spor Bayram\u0131' ad\u0131n\u0131 alm\u0131\u015Ft\u0131r?",
        category: "Tarih ve K\xFClt\xFCr",
        difficulty: "HARD",
        ageGroup: "16-17",
        explanation: "1938 y\u0131l\u0131nda Gen\xE7lik ve Spor Bayram\u0131 olarak kanunla\u015Fm\u0131\u015F, 1981 y\u0131l\u0131nda Atat\xFCrk'\xFC Anma, Gen\xE7lik ve Spor Bayram\u0131 olarak kabul edilmi\u015Ftir.",
        sourceType: "OFFICIAL",
        sourceReference: "Resmi Gazete / Kanun No 3466",
        options: [
          { key: "A", text: "1923", isCorrect: false },
          { key: "B", text: "1938", isCorrect: true },
          { key: "C", text: "1950", isCorrect: false },
          { key: "D", text: "1980", isCorrect: false }
        ]
      },
      // 2. Bilim
      {
        question: "Nobel Kimya \xD6d\xFCl\xFC'n\xFC DNA onar\u0131m\u0131 mekanizmalar\u0131 alan\u0131ndaki \xE7\u0131\u011F\u0131r a\xE7an \xE7al\u0131\u015Fmalar\u0131yla kazanan T\xFCrk bilim insan\u0131 kimdir?",
        category: "Bilim",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Prof. Dr. Aziz Sancar, 2015 Nobel Kimya \xD6d\xFCl\xFC'n\xFC kazanarak T\xFCrkiye'yi gururland\u0131rm\u0131\u015Ft\u0131r.",
        sourceType: "OFFICIAL",
        sourceReference: "Nobel Vakf\u0131 Ar\u015Fivi",
        options: [
          { key: "A", text: "Prof. Dr. Cahit Arf", isCorrect: false },
          { key: "B", text: "Prof. Dr. Oktay Sinano\u011Flu", isCorrect: false },
          { key: "C", text: "Prof. Dr. Aziz Sancar", isCorrect: true },
          { key: "D", text: "Prof. Dr. Gazi Ya\u015Fargil", isCorrect: false }
        ]
      },
      {
        question: "G\xFCne\u015F Sistemi'nde G\xFCne\u015F'e en yak\u0131n gezegen hangisidir?",
        category: "Bilim",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Merk\xFCr, G\xFCne\u015F'e en yak\u0131n ve G\xFCne\u015F Sistemi'ndeki en k\xFC\xE7\xFCk gezegendir.",
        sourceType: "OFFICIAL",
        sourceReference: "T\xDCB\u0130TAK Bilim ve Teknik",
        options: [
          { key: "A", text: "Ven\xFCs", isCorrect: false },
          { key: "B", text: "Merk\xFCr", isCorrect: true },
          { key: "C", text: "Mars", isCorrect: false },
          { key: "D", text: "D\xFCnya", isCorrect: false }
        ]
      },
      {
        question: "I\u015F\u0131\u011F\u0131n bo\u015Fluktaki yakla\u015F\u0131k yay\u0131lma h\u0131z\u0131 saniyede ka\xE7 kilometredir?",
        category: "Bilim",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "I\u015F\u0131k h\u0131z\u0131 saniyede yakla\u015F\u0131k 300.000 km (tam olarak 299.792 km/s) h\u0131zla hareket eder.",
        sourceType: "OFFICIAL",
        sourceReference: "Fizik Temelleri",
        options: [
          { key: "A", text: "150.000 km/s", isCorrect: false },
          { key: "B", text: "300.000 km/s", isCorrect: true },
          { key: "C", text: "500.000 km/s", isCorrect: false },
          { key: "D", text: "1.000.000 km/s", isCorrect: false }
        ]
      },
      // 3. Teknoloji
      {
        question: "T\xFCrkiye'nin yerli ve milli ilk haberle\u015Fme uydusu hangisidir?",
        category: "Teknoloji",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "T\xDCRKSAT 6A, T\xFCrkiye'nin yerli m\xFChendislik imkanlar\u0131yla \xFCretilen ilk yerli haberle\u015Fme uydusudur.",
        sourceType: "OFFICIAL",
        sourceReference: "T\xDCB\u0130TAK UZAY & T\xDCRKSAT",
        options: [
          { key: "A", text: "T\xDCRKSAT 4A", isCorrect: false },
          { key: "B", text: "G\xD6KT\xDCRK-1", isCorrect: false },
          { key: "C", text: "T\xDCRKSAT 6A", isCorrect: true },
          { key: "D", text: "B\u0130LSAT", isCorrect: false }
        ]
      },
      {
        question: "A\xE7\u0131k kaynak kodlu i\u015Fletim sistemi \xE7ekirde\u011Fi Linux'un maskotu olan sevimli hayvan hangisidir?",
        category: "Teknoloji",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Linux'un resmi maskotu 'Tux' ad\u0131nda bir penguendir.",
        sourceType: "OFFICIAL",
        sourceReference: "Linux Vakf\u0131",
        options: [
          { key: "A", text: "Penguen (Tux)", isCorrect: true },
          { key: "B", text: "Yunus", isCorrect: false },
          { key: "C", text: "Tilki", isCorrect: false },
          { key: "D", text: "Kartal", isCorrect: false }
        ]
      },
      {
        question: "Bilgisayar bilimlerinde 'Bit' terimi hangi iki \u0130ngilizce kelimenin birle\u015Fiminden t\xFCretilmi\u015Ftir?",
        category: "Teknoloji",
        difficulty: "MEDIUM",
        ageGroup: "16-17",
        explanation: "'Binary' (ikili) ve 'Digit' (basamak) kelimelerinin ilk ve son harflerinin birle\u015Fmesiyle 'Bit' kelimesi t\xFCretilmi\u015Ftir.",
        sourceType: "OFFICIAL",
        sourceReference: "IEEE Bilgisayar Terimleri",
        options: [
          { key: "A", text: "Binary Digit", isCorrect: true },
          { key: "B", text: "Byte Integer", isCorrect: false },
          { key: "C", text: "Basic Item", isCorrect: false },
          { key: "D", text: "Binary Technology", isCorrect: false }
        ]
      },
      // 4. Genel Kültür
      {
        question: "UNESCO D\xFCnya Miras\u0131 Listesi'nde yer alan ve 'tarihin s\u0131f\u0131r noktas\u0131' olarak nitelendirilen \u015Eanl\u0131urfa'daki antik tap\u0131nak kompleksi hangisidir?",
        category: "Genel K\xFClt\xFCr",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "G\xF6beklitepe, yakla\u015F\u0131k 12.000 y\u0131ll\u0131k ge\xE7mi\u015Fiyle bilinen en eski an\u0131tsal tap\u0131nak kompleksidir.",
        sourceType: "OFFICIAL",
        sourceReference: "K\xFClt\xFCr ve Turizm Bakanl\u0131\u011F\u0131",
        options: [
          { key: "A", text: "\xC7atalh\xF6y\xFCk", isCorrect: false },
          { key: "B", text: "G\xF6beklitepe", isCorrect: true },
          { key: "C", text: "Efes", isCorrect: false },
          { key: "D", text: "Nemrut Da\u011F\u0131", isCorrect: false }
        ]
      },
      // 5. Mantık
      {
        question: "Bir \xF6r\xFCnt\xFCde say\u0131lar 3, 7, 15, 31 \u015Feklinde ilerlemektedir. Bu kurala g\xF6re bir sonraki say\u0131 ka\xE7 olmal\u0131d\u0131r?",
        category: "Mant\u0131k",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "Her terim 2 ile \xE7arp\u0131l\u0131p 1 eklenerek bulunmaktad\u0131r: 3x2+1=7, 7x2+1=15, 15x2+1=31, 31x2+1=63.",
        sourceType: "OFFICIAL",
        sourceReference: "Matematiksel Mant\u0131k",
        options: [
          { key: "A", text: "45", isCorrect: false },
          { key: "B", text: "55", isCorrect: false },
          { key: "C", text: "63", isCorrect: true },
          { key: "D", text: "65", isCorrect: false }
        ]
      },
      // 6. Spor
      {
        question: "Olimpiyatlarda T\xFCrkiye'ye ok\xE7uluk bran\u015F\u0131nda tarihteki ilk alt\u0131n madalyay\u0131 kazand\u0131ran milli sporcumuz kimdir?",
        category: "Spor",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Mete Gazoz, 2020 Tokyo Olimpiyatlar\u0131'nda erkekler bireysel ok\xE7ulukta alt\u0131n madalya kazanm\u0131\u015Ft\u0131r.",
        sourceType: "OFFICIAL",
        sourceReference: "T\xFCrkiye Milli Olimpiyat Komitesi",
        options: [
          { key: "A", text: "Taha Akg\xFCl", isCorrect: false },
          { key: "B", text: "Mete Gazoz", isCorrect: true },
          { key: "C", text: "Servet Tazeg\xFCl", isCorrect: false },
          { key: "D", text: "R\u0131za Kayaalp", isCorrect: false }
        ]
      }
    ];
    for (const q of starterQuestions) {
      const [insertedQ] = await db.insert(leagueQuestions).values({
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        ageGroup: q.ageGroup,
        language: "tr",
        explanation: q.explanation,
        sourceType: q.sourceType,
        sourceReference: q.sourceReference,
        status: "ACTIVE"
      }).returning();
      for (const opt of q.options) {
        await db.insert(leagueQuestionOptions).values({
          questionId: insertedQ.id,
          optionKey: opt.key,
          optionText: opt.text,
          isCorrect: opt.isCorrect
        });
      }
    }
    console.log(`\u2705 ${starterQuestions.length} adet ba\u015Flang\u0131\xE7 sorusu ba\u015Far\u0131yla y\xFCklendi.`);
  } catch (err) {
    console.error("Error seeding starter questions:", err);
  }
}
var import_drizzle_orm8;
var init_leagueAutomation = __esm({
  "server/services/leagueAutomation.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm8 = require("drizzle-orm");
  }
});

// server/routes/health.ts
var health_exports = {};
__export(health_exports, {
  healthRouter: () => healthRouter
});
var import_express3, import_drizzle_orm9, healthRouter;
var init_health = __esm({
  "server/routes/health.ts"() {
    "use strict";
    import_express3 = require("express");
    init_db();
    import_drizzle_orm9 = require("drizzle-orm");
    healthRouter = (0, import_express3.Router)();
    healthRouter.get("/", async (req, res) => {
      let dbStatus = "ok";
      let error;
      let statusCode = 200;
      try {
        await db.execute(import_drizzle_orm9.sql`SELECT 1`);
        dbStatus = "ok";
      } catch (e) {
        dbStatus = "error";
        statusCode = 503;
        error = e;
        console.error("Health check DB error:", e);
      }
      res.status(statusCode).json({
        success: statusCode === 200,
        data: {
          api: "ok",
          database: dbStatus,
          error: error ? String(error) : void 0,
          environment: process.env.NODE_ENV || "development",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    });
  }
});

// server/routes/robots.ts
var robots_exports = {};
__export(robots_exports, {
  robotsRouter: () => robotsRouter
});
var import_express4, robotsRouter;
var init_robots = __esm({
  "server/routes/robots.ts"() {
    "use strict";
    import_express4 = require("express");
    robotsRouter = (0, import_express4.Router)();
    robotsRouter.get("/robots.txt", (req, res) => {
      const domain = "https://gencsosyal.com";
      const content = `# Robots.txt for Gen\xE7 Sosyal (https://gencsosyal.com)
User-agent: *
Disallow: /api/
Disallow: /admin
Disallow: /admin/
Disallow: /settings
Disallow: /settings/
Disallow: /messages
Disallow: /messages/
Disallow: /notifications
Disallow: /notifications/
Disallow: /bookmarks
Disallow: /bookmarks/
Disallow: /onboarding
Disallow: /onboarding/
Disallow: /create
Disallow: /create/
Disallow: /login
Disallow: /login/
Disallow: /register
Disallow: /register/
Disallow: /forgot-password
Disallow: /forgot-password/
Disallow: /reset-password
Disallow: /reset-password/
Disallow: /verify-email
Disallow: /verify-email/
Disallow: /account-suspended
Disallow: /account-suspended/
Disallow: /support/
Allow: /

Sitemap: ${domain}/sitemap.xml
Host: gencsosyal.com
`;
      res.header("Content-Type", "text/plain; charset=utf-8");
      res.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.send(content);
    });
  }
});

// server/routes/sitemap.ts
var sitemap_exports = {};
__export(sitemap_exports, {
  sitemapRouter: () => sitemapRouter
});
function escapeXml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
var import_express5, import_drizzle_orm10, sitemapRouter;
var init_sitemap = __esm({
  "server/routes/sitemap.ts"() {
    "use strict";
    import_express5 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm10 = require("drizzle-orm");
    sitemapRouter = (0, import_express5.Router)();
    sitemapRouter.get("/sitemap.xml", async (req, res) => {
      try {
        const domain = "https://gencsosyal.com";
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const publicProfiles = await db.select({
          username: users.username,
          updatedAt: users.updatedAt
        }).from(profiles).innerJoin(users, (0, import_drizzle_orm10.eq)(profiles.userId, users.id)).where(
          (0, import_drizzle_orm10.and)(
            (0, import_drizzle_orm10.eq)(users.isActive, true),
            (0, import_drizzle_orm10.eq)(profiles.allowSearchEngineIndexing, true),
            (0, import_drizzle_orm10.eq)(profiles.isPrivate, false)
          )
        ).limit(5e3);
        const publicPosts = await db.select({
          id: posts.id,
          updatedAt: posts.updatedAt
        }).from(posts).innerJoin(users, (0, import_drizzle_orm10.eq)(posts.userId, users.id)).innerJoin(profiles, (0, import_drizzle_orm10.eq)(users.id, profiles.userId)).where(
          (0, import_drizzle_orm10.and)(
            (0, import_drizzle_orm10.eq)(posts.visibility, "PUBLIC"),
            (0, import_drizzle_orm10.eq)(posts.moderationStatus, "APPROVED"),
            (0, import_drizzle_orm10.isNull)(posts.communityId),
            (0, import_drizzle_orm10.eq)(users.isActive, true),
            (0, import_drizzle_orm10.eq)(profiles.allowSearchEngineIndexing, true),
            (0, import_drizzle_orm10.eq)(profiles.isPrivate, false)
          )
        ).orderBy((0, import_drizzle_orm10.desc)(posts.createdAt)).limit(5e3);
        const publicCommunities = await db.select({
          slug: communities.slug,
          updatedAt: communities.updatedAt
        }).from(communities).where((0, import_drizzle_orm10.and)((0, import_drizzle_orm10.isNull)(communities.deletedAt), (0, import_drizzle_orm10.eq)(communities.isPrivate, false))).limit(1e3);
        const publicProjects = await db.select({
          id: projects.id,
          updatedAt: projects.updatedAt
        }).from(projects).innerJoin(users, (0, import_drizzle_orm10.eq)(projects.userId, users.id)).innerJoin(profiles, (0, import_drizzle_orm10.eq)(users.id, profiles.userId)).where(
          (0, import_drizzle_orm10.and)(
            (0, import_drizzle_orm10.eq)(users.isActive, true),
            (0, import_drizzle_orm10.eq)(profiles.allowSearchEngineIndexing, true),
            (0, import_drizzle_orm10.eq)(profiles.isPrivate, false)
          )
        ).orderBy((0, import_drizzle_orm10.desc)(projects.createdAt)).limit(1e3);
        const publicHashtags = await db.select({
          name: hashtags.name,
          createdAt: hashtags.createdAt
        }).from(hashtags).where((0, import_drizzle_orm10.gt)(hashtags.usageCount, 0)).orderBy((0, import_drizzle_orm10.desc)(hashtags.usageCount)).limit(1e3);
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
        const statics = [
          { path: "", priority: "1.0", changefreq: "daily" },
          { path: "/explore", priority: "0.9", changefreq: "hourly" },
          { path: "/teknofest", priority: "0.9", changefreq: "daily" },
          { path: "/quiz", priority: "0.9", changefreq: "daily" },
          { path: "/youth-league", priority: "0.9", changefreq: "daily" },
          { path: "/youth-league/leaderboard", priority: "0.8", changefreq: "daily" },
          { path: "/projects", priority: "0.9", changefreq: "daily" },
          { path: "/communities", priority: "0.8", changefreq: "daily" },
          { path: "/faq", priority: "0.7", changefreq: "weekly" },
          { path: "/about", priority: "0.7", changefreq: "monthly" },
          { path: "/sitemap", priority: "0.5", changefreq: "weekly" },
          { path: "/privacy", priority: "0.3", changefreq: "monthly" },
          { path: "/terms", priority: "0.3", changefreq: "monthly" }
        ];
        statics.forEach((s) => {
          xml += `  <url>
    <loc>${escapeXml(`${domain}${s.path || "/"}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${s.changefreq}</changefreq>
    <priority>${s.priority}</priority>
  </url>
`;
        });
        publicProfiles.forEach((p) => {
          const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today;
          const url = `${domain}/profile/${encodeURIComponent(p.username)}`;
          xml += `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });
        publicPosts.forEach((p) => {
          const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today;
          const url = `${domain}/post/${p.id}`;
          xml += `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        });
        publicCommunities.forEach((c) => {
          const lastmod = c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : today;
          const url = `${domain}/communities/${encodeURIComponent(c.slug)}`;
          xml += `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });
        publicProjects.forEach((p) => {
          const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today;
          const url = `${domain}/projects/${p.id}`;
          xml += `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });
        publicHashtags.forEach((h) => {
          const lastmod = h.createdAt ? new Date(h.createdAt).toISOString().split("T")[0] : today;
          const url = `${domain}/hashtags/${encodeURIComponent(h.name)}`;
          xml += `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;
        });
        xml += `</urlset>`;
        res.header("Content-Type", "application/xml; charset=utf-8");
        res.header("Cache-Control", "public, max-age=3600, s-maxage=3600");
        res.send(xml);
      } catch (error) {
        console.error("Sitemap generation error:", error);
        res.status(500).end();
      }
    });
  }
});

// server/middleware/rateLimiter.ts
var import_express_rate_limit, standardLimiter, strictLimiter, authRateLimiter, loginRateLimiter, registerRateLimiter, otpSendRateLimiter, otpVerifyRateLimiter;
var init_rateLimiter = __esm({
  "server/middleware/rateLimiter.ts"() {
    "use strict";
    import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
    standardLimiter = (0, import_express_rate_limit.default)({
      windowMs: 1 * 60 * 1e3,
      // 1 minute
      max: 60,
      // Limit each IP to 60 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      validate: { xForwardedForHeader: false },
      message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "\xC7ok fazla istek g\xF6nderdiniz. L\xFCtfen daha sonra tekrar deneyin." } }
    });
    strictLimiter = (0, import_express_rate_limit.default)({
      windowMs: 1 * 60 * 1e3,
      // 1 minute
      max: 15,
      // Uploads and post creations should be limited to 15 per minute
      standardHeaders: true,
      legacyHeaders: false,
      validate: { xForwardedForHeader: false },
      message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "\u0130\u015Flem s\u0131n\u0131r\u0131na ula\u015Ft\u0131n\u0131z. Biraz bekleyip tekrar deneyin." } }
    });
    authRateLimiter = (0, import_express_rate_limit.default)({
      windowMs: 15 * 60 * 1e3,
      max: 10,
      validate: { xForwardedForHeader: false },
      message: {
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "\xC7ok fazla istek g\xF6nderdiniz. L\xFCtfen daha sonra tekrar deneyin."
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    loginRateLimiter = (0, import_express_rate_limit.default)({
      windowMs: 15 * 60 * 1e3,
      max: 5,
      validate: { xForwardedForHeader: false },
      message: {
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "\xC7ok fazla giri\u015F denemesi yapt\u0131n\u0131z. L\xFCtfen 15 dakika sonra tekrar deneyin."
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    registerRateLimiter = (0, import_express_rate_limit.default)({
      windowMs: 60 * 60 * 1e3,
      // 1 hour
      max: 10,
      // 10 registrations per hour per IP
      validate: { xForwardedForHeader: false },
      message: {
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Ayn\u0131 IP adresinden \xE7ok fazla hesap a\xE7ma denemesi yap\u0131ld\u0131. L\xFCtfen daha sonra tekrar deneyin."
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    otpSendRateLimiter = (0, import_express_rate_limit.default)({
      windowMs: 15 * 60 * 1e3,
      // 15 minutes
      max: 6,
      // max 6 OTP requests per 15 minutes per IP
      validate: { xForwardedForHeader: false },
      message: {
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "\xC7ok fazla do\u011Frulama kodu talep ettiniz. L\xFCtfen 15 dakika sonra tekrar deneyin."
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    otpVerifyRateLimiter = (0, import_express_rate_limit.default)({
      windowMs: 15 * 60 * 1e3,
      // 15 minutes
      max: 15,
      // max 15 attempts
      validate: { xForwardedForHeader: false },
      message: {
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "\xC7ok fazla kod do\u011Frulama denemesi yapt\u0131n\u0131z. L\xFCtfen daha sonra tekrar deneyin."
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }
});

// server/utils/notifications.ts
var notifications_exports = {};
__export(notifications_exports, {
  notify: () => notify
});
async function notify(actorId, recipientId, type, postId, commentId, projectId, tx) {
  if (actorId === recipientId) return;
  try {
    const execDb = tx || db;
    const prefs = await execDb.select().from(notificationPreferences).where((0, import_drizzle_orm11.eq)(notificationPreferences.userId, recipientId)).limit(1);
    const pref = prefs.length > 0 ? prefs[0] : {
      pushEnabled: true,
      emailEnabled: true,
      likes: true,
      comments: true,
      mentions: true,
      follows: true,
      messages: true,
      newsletters: false
    };
    if (type.includes("like") || type.includes("reaction")) {
      if (!pref.likes) return;
    } else if (type.includes("comment") || type.includes("reply")) {
      if (!pref.comments) return;
    } else if (type.includes("mention")) {
      if (!pref.mentions) return;
    } else if (type.includes("follow")) {
      if (!pref.follows) return;
    } else if (type.includes("message")) {
      if (!pref.messages) return;
    }
    await execDb.insert(notifications).values({ actorId, recipientId, type, postId, commentId, projectId });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}
var import_drizzle_orm11;
var init_notifications = __esm({
  "server/utils/notifications.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm11 = require("drizzle-orm");
  }
});

// server/validators/project.ts
var import_zod, projectSchema;
var init_project = __esm({
  "server/validators/project.ts"() {
    "use strict";
    import_zod = require("zod");
    projectSchema = import_zod.z.object({
      title: import_zod.z.string().min(1, "Proje ba\u015Fl\u0131\u011F\u0131 gereklidir.").max(100, "Ba\u015Fl\u0131k en fazla 100 karakter olabilir."),
      description: import_zod.z.string().min(1, "Proje a\xE7\u0131klamas\u0131 gereklidir.").max(2e3, "A\xE7\u0131klama \xE7ok uzun."),
      detailedDescription: import_zod.z.string().max(1e4, "Detayl\u0131 a\xE7\u0131klama \xE7ok uzun.").optional().or(import_zod.z.literal("")),
      category: import_zod.z.string().min(1, "Kategori gereklidir.").max(50, "Kategori \xE7ok uzun."),
      status: import_zod.z.string().min(1, "Durum gereklidir.").max(50, "Durum \xE7ok uzun."),
      projectUrl: import_zod.z.string().url("Ge\xE7erli bir URL giriniz.").max(255).optional().or(import_zod.z.literal("")),
      githubUrl: import_zod.z.string().url("Ge\xE7erli bir URL giriniz.").max(255).optional().or(import_zod.z.literal("")),
      imageUrl: import_zod.z.string().url("Ge\xE7erli bir URL giriniz.").max(1e3).optional().or(import_zod.z.literal("")),
      tags: import_zod.z.array(import_zod.z.string().min(1, "Etiket bo\u015F olamaz.").max(30, "Etiket \xE7ok uzun.")).max(10, "En fazla 10 etiket ekleyebilirsiniz.").optional()
    });
  }
});

// server/services/moderation/index.ts
function cleanZalgoAndEvasion(text2) {
  let cleaned = text2.replace(/[\u0300-\u036f\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, "");
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "");
  return cleaned;
}
function normalizeTurkish(text2) {
  return text2.replace(/\u0130/g, "i").replace(/I/g, "i").replace(/\u0131/g, "i").toLowerCase().replace(/\u011f/g, "g").replace(/\u00fc/g, "u").replace(/\u015f/g, "s").replace(/\u0131/g, "i").replace(/\u00f6/g, "o").replace(/\u00e7/g, "c");
}
async function moderateContent(text2) {
  if (!text2 || text2.trim() === "") return { riskLevel: "SAFE", category: "SAFE", score: 0 };
  let cleanedText = cleanZalgoAndEvasion(text2);
  let normalizedText = normalizeTurkish(cleanedText).replace(/[1!]/g, "i").replace(/@/g, "a").replace(/0/g, "o").replace(/3/g, "e").replace(/(.)\1{2,}/g, "$1$1").replace(/[.,_*/\-\\+!?()\[\]{}|<>="':;]/g, " ").replace(/\s+/g, " ").trim();
  const noSpaceText = normalizedText.replace(/\s+/g, "");
  let maxScore = 0;
  let topCategory = "SAFE";
  for (const [category, words] of Object.entries(KEYWORDS)) {
    if (category === "SAFE") continue;
    let matchCount = 0;
    for (const word of words) {
      const regex = new RegExp(`(?:^|\\s)${word}(?:\\s|$)`, "i");
      if (regex.test(normalizedText)) {
        matchCount += 1;
      } else if (word.length >= 5 && noSpaceText.includes(word)) {
        matchCount += 0.8;
      }
    }
    if (matchCount > 0) {
      let score = matchCount * 0.5;
      if (score > 1) score = 1;
      if (score > maxScore) {
        maxScore = score;
        topCategory = category;
      }
    }
  }
  const urls = text2.match(/https?:\/\/[^\s]+/g) || [];
  if (urls.length > 2 && text2.length < 200) {
    if (maxScore < 0.8) {
      maxScore = 0.8;
      topCategory = "SPAM";
    }
  }
  const wordsList = normalizedText.split(" ");
  const uniqueWords = new Set(wordsList);
  if (wordsList.length > 10 && uniqueWords.size < wordsList.length * 0.3) {
    if (maxScore < 0.6) {
      maxScore = 0.6;
      topCategory = "SPAM";
    }
  }
  let riskLevel = "SAFE";
  if (maxScore >= 0.8) riskLevel = "HIGH_RISK";
  else if (maxScore >= 0.5) riskLevel = "MEDIUM_RISK";
  else if (maxScore > 0) riskLevel = "LOW_RISK";
  return {
    riskLevel,
    category: topCategory,
    score: maxScore,
    reason: riskLevel !== "SAFE" ? `Heuristic anahtar kelime motoru taraf\u0131ndan '${topCategory}' kategorisinde de\u011Ferlendirildi. Not: Bu sistem basit metin e\u015Fle\u015Fmesi kullan\u0131r, yanl\u0131\u015F pozitifler (false-positive) \xFCretebilir ve kesin bir ihlal tespiti (enforcement) de\u011Fildir, inceleme (review) ama\xE7l\u0131d\u0131r.` : void 0
  };
}
var KEYWORDS;
var init_moderation = __esm({
  "server/services/moderation/index.ts"() {
    "use strict";
    KEYWORDS = {
      HATE_SPEECH: ["nefret", "irkci", "pislik", "geber", "asagilik", "kopek", "serefsiz", "pic", "o.c", "orospu"],
      HARASSMENT: ["gerizekali", "aptal", "salak", "mal", "beyinsiz", "cirkin", "koyun", "cahil"],
      EXPLICIT_CONTENT: ["porno", "ciplak", "seks", "nsfw", "xxx", "escort", "sik", "amk", "amcik", "meme", "yarak", "sokuk"],
      VIOLENCE: ["oldur", "kan", "bicakla", "silah", "vur", "keserim", "bombalar", "gebert", "kanini"],
      SPAM: ["tikla", "kazan", "ucretsiz hediye", "bedava para", "linke git", "bitcoin kazan", "kripto yatirim", "cekilis", "kolay para", "sende kazan"],
      SCAM: ["kredi kartsiz", "sifreni gonder", "hesap calma", "hack", "bedava iphone", "tc kimlik"],
      SELF_HARM: ["intihar", "kendimi asacagim", "yasamak istemiyorum", "kendime zarar", "jilet", "olmek istiyorum"],
      SAFE: []
    };
  }
});

// server/routes/projects.ts
var projects_exports = {};
__export(projects_exports, {
  projectsRouter: () => projectsRouter
});
var import_express6, import_drizzle_orm12, import_drizzle_orm13, projectsRouter;
var init_projects = __esm({
  "server/routes/projects.ts"() {
    "use strict";
    import_express6 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm12 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_notifications();
    init_project();
    init_moderation();
    init_blocks();
    import_drizzle_orm13 = require("drizzle-orm");
    projectsRouter = (0, import_express6.Router)();
    projectsRouter.get("/", optionalAuth, async (req, res) => {
      try {
        const { q, category, status, sort, page = "1", limit = "20" } = req.query;
        let currentUserId = optionalAuthContext(req);
        const blockedIds = await getBlockedIds(currentUserId);
        const ignoreIds = blockedIds.length > 0 ? blockedIds : [-1];
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;
        let conditions = [];
        if (category) {
          conditions.push((0, import_drizzle_orm12.eq)(projects.category, category));
        }
        if (status) {
          conditions.push((0, import_drizzle_orm12.eq)(projects.status, status));
        }
        if (q) {
          const search = `%${q}%`;
          conditions.push(
            (0, import_drizzle_orm12.or)(
              (0, import_drizzle_orm12.ilike)(projects.title, search),
              (0, import_drizzle_orm12.ilike)(projects.description, search),
              import_drizzle_orm12.sql`${projects.tags}::text ILIKE ${search}`
            )
          );
        }
        conditions.push((0, import_drizzle_orm13.notInArray)(projects.userId, ignoreIds));
        const whereClause = conditions.length > 0 ? (0, import_drizzle_orm12.and)(...conditions) : void 0;
        const orderClause = sort === "oldest" ? (0, import_drizzle_orm12.asc)(projects.createdAt) : (0, import_drizzle_orm12.desc)(projects.createdAt);
        const totalCountResult = await db.select({ count: import_drizzle_orm12.sql`cast(count(*) as integer)` }).from(projects).where(whereClause);
        const total = totalCountResult[0]?.count || 0;
        const allProjects = await db.select({
          id: projects.id,
          userId: projects.userId,
          title: projects.title,
          description: projects.description,
          category: projects.category,
          status: projects.status,
          projectUrl: projects.projectUrl,
          githubUrl: projects.githubUrl,
          imageUrl: projects.imageUrl,
          tags: projects.tags,
          createdAt: projects.createdAt,
          username: users.username
        }).from(projects).leftJoin(users, (0, import_drizzle_orm12.eq)(projects.userId, users.id)).where(whereClause).orderBy(orderClause).limit(limitNum).offset(offset);
        const hasMore = offset + allProjects.length < total;
        res.json({
          success: true,
          data: {
            projects: allProjects,
            total,
            page: pageNum,
            hasMore
          }
        });
      } catch (error) {
        console.error("Error fetching all projects:", error);
        res.status(500).json({ error: { message: "Projeler y\xFCklenirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.get("/user/:userId", optionalAuth, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID'si." } });
          return;
        }
        const currentUserId = optionalAuthContext(req);
        const targetProfile = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where((0, import_drizzle_orm12.eq)(profiles.userId, userId)).limit(1);
        const isPrivate = targetProfile.length > 0 ? targetProfile[0].isPrivate : false;
        if (isPrivate && currentUserId !== userId) {
          let isFollowing = false;
          if (currentUserId) {
            const f = await db.select().from(follows).where((0, import_drizzle_orm12.and)(
              (0, import_drizzle_orm12.eq)(follows.followerId, currentUserId),
              (0, import_drizzle_orm12.eq)(follows.followingId, userId),
              (0, import_drizzle_orm12.eq)(follows.status, "accepted")
            )).limit(1);
            isFollowing = f.length > 0;
          }
          if (!isFollowing) {
            res.json({ success: true, data: { projects: [] } });
            return;
          }
        }
        const userProjects = await db.select({
          id: projects.id,
          userId: projects.userId,
          title: projects.title,
          description: projects.description,
          category: projects.category,
          status: projects.status,
          projectUrl: projects.projectUrl,
          githubUrl: projects.githubUrl,
          imageUrl: projects.imageUrl,
          tags: projects.tags,
          createdAt: projects.createdAt,
          username: users.username
        }).from(projects).leftJoin(users, (0, import_drizzle_orm12.eq)(projects.userId, users.id)).where((0, import_drizzle_orm12.eq)(projects.userId, userId)).orderBy((0, import_drizzle_orm12.desc)(projects.createdAt));
        res.json({ success: true, data: { projects: userProjects } });
      } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: { message: "Projeler y\xFCklenirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.get("/:id", async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const project = await db.select({
          id: projects.id,
          userId: projects.userId,
          title: projects.title,
          description: projects.description,
          detailedDescription: projects.detailedDescription,
          category: projects.category,
          status: projects.status,
          projectUrl: projects.projectUrl,
          githubUrl: projects.githubUrl,
          imageUrl: projects.imageUrl,
          tags: projects.tags,
          sortOrder: projects.sortOrder,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          username: users.username
        }).from(projects).leftJoin(users, (0, import_drizzle_orm12.eq)(projects.userId, users.id)).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        if (project.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        res.json({ success: true, data: { project: project[0] } });
      } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: { message: "Proje y\xFCklenirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.post("/", requireAuth, async (req, res) => {
      try {
        const parsed = projectSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: { message: parsed.error.issues[0].message } });
          return;
        }
        const data = parsed.data;
        const isValidUrl = (url) => {
          if (!url) return true;
          try {
            const parsedUrl = new URL(url);
            return ["http:", "https:"].includes(parsedUrl.protocol);
          } catch {
            return false;
          }
        };
        if (!isValidUrl(data.projectUrl) || !isValidUrl(data.githubUrl) || !isValidUrl(data.imageUrl)) {
          res.status(400).json({ error: { message: "Yaln\u0131zca http:// ve https:// ba\u011Flant\u0131lar\u0131na izin verilmektedir." } });
          return;
        }
        const cleanedTags = Array.from(new Set(
          (data.tags || []).map((t) => t.trim()).filter((t) => t.length > 0 && t.length <= 30)
        )).slice(0, 10);
        const currentUserId = requireAuthContext(req);
        const contentToModerate = `${data.title} ${data.description} ${data.detailedDescription || ""}`;
        const modResult = await moderateContent(contentToModerate);
        let isRejected = false;
        let isPending = false;
        let finalStatus = data.status;
        if (modResult.riskLevel === "HIGH_RISK") {
          isRejected = true;
          finalStatus = "REJECTED";
        } else if (modResult.riskLevel === "MEDIUM_RISK") {
          isPending = true;
          finalStatus = "PENDING";
        }
        const newProject = await db.insert(projects).values({
          userId: currentUserId,
          title: data.title,
          description: data.description,
          detailedDescription: data.detailedDescription || null,
          category: data.category,
          status: finalStatus,
          projectUrl: data.projectUrl || null,
          githubUrl: data.githubUrl || null,
          imageUrl: data.imageUrl || null,
          tags: cleanedTags
        }).returning();
        if (isRejected || isPending) {
          await db.insert(moderationLogs).values({
            entityType: "PROJECT",
            entityId: newProject[0].id,
            userId: currentUserId,
            status: isRejected ? "RESOLVED" : "PENDING_REVIEW",
            actionTaken: isRejected ? "REJECTED" : "PENDING",
            riskLevel: modResult.riskLevel,
            category: modResult.category,
            reason: modResult.reason || null
          });
          if (isRejected) {
            res.status(403).json({ error: { message: "Projeniz topluluk kurallar\u0131na ayk\u0131r\u0131 i\xE7erik bar\u0131nd\u0131rd\u0131\u011F\u0131 i\xE7in otomatik olarak engellendi. \u0130tiraz\u0131n\u0131z varsa l\xFCtfen ileti\u015Fime ge\xE7in." } });
            return;
          }
        }
        res.status(201).json({ success: true, data: { project: newProject[0] } });
      } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: { message: "Proje olu\u015Fturulurken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.patch("/:id", requireAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const parsed = projectSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: { message: parsed.error.issues[0].message } });
          return;
        }
        const data = parsed.data;
        const existing = await db.select().from(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        if (existing.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (existing[0].userId !== requireAuthContext(req)) {
          res.status(403).json({ error: { message: "Bu projeyi d\xFCzenleme yetkiniz yok." } });
          return;
        }
        const isValidUrl = (url) => {
          if (!url) return true;
          try {
            const parsedUrl = new URL(url);
            return ["http:", "https:"].includes(parsedUrl.protocol);
          } catch {
            return false;
          }
        };
        if (!isValidUrl(data.projectUrl) || !isValidUrl(data.githubUrl) || !isValidUrl(data.imageUrl)) {
          res.status(400).json({ error: { message: "Yaln\u0131zca http:// ve https:// ba\u011Flant\u0131lar\u0131na izin verilmektedir." } });
          return;
        }
        const cleanedTags = Array.from(new Set(
          (data.tags || []).map((t) => t.trim()).filter((t) => t.length > 0 && t.length <= 30)
        )).slice(0, 10);
        const currentUserId = requireAuthContext(req);
        const contentToModerate = `${data.title} ${data.description} ${data.detailedDescription || ""}`;
        const modResult = await moderateContent(contentToModerate);
        if (modResult.riskLevel === "HIGH_RISK") {
          await db.insert(moderationLogs).values({
            entityType: "PROJECT",
            entityId: projectId,
            userId: currentUserId,
            status: "RESOLVED",
            actionTaken: "REJECTED",
            riskLevel: modResult.riskLevel,
            category: modResult.category,
            reason: modResult.reason || null
          });
          res.status(403).json({ error: { message: "Projeniz topluluk kurallar\u0131na ayk\u0131r\u0131 i\xE7erik bar\u0131nd\u0131rd\u0131\u011F\u0131 i\xE7in g\xFCncellenemedi." } });
          return;
        }
        let nextStatus = data.status;
        if (modResult.riskLevel === "MEDIUM_RISK") {
          nextStatus = "PENDING";
        }
        const updated = await db.update(projects).set({
          title: data.title,
          description: data.description,
          detailedDescription: data.detailedDescription || null,
          category: data.category,
          status: nextStatus,
          projectUrl: data.projectUrl || null,
          githubUrl: data.githubUrl || null,
          imageUrl: data.imageUrl || null,
          tags: cleanedTags,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).returning();
        if (modResult.riskLevel === "MEDIUM_RISK") {
          await db.insert(moderationLogs).values({
            entityType: "PROJECT",
            entityId: projectId,
            userId: currentUserId,
            status: "PENDING",
            actionTaken: null,
            riskLevel: modResult.riskLevel,
            category: modResult.category,
            reason: modResult.reason || null
          });
        }
        res.json({ success: true, data: { project: updated[0], pending: modResult.riskLevel === "MEDIUM_RISK" } });
      } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: { message: "Proje g\xFCncellenirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.delete("/:id", requireAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const existing = await db.select().from(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        if (existing.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (existing[0].userId !== requireAuthContext(req)) {
          res.status(403).json({ error: { message: "Bu projeyi silme yetkiniz yok." } });
          return;
        }
        await db.delete(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId));
        res.json({ success: true, data: { message: "Proje silindi." } });
      } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: { message: "Proje silinirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.get("/:id/like", optionalAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const likesCountResult = await db.select({ count: import_drizzle_orm12.sql`cast(count(*) as integer)` }).from(projectLikes).where((0, import_drizzle_orm12.eq)(projectLikes.projectId, projectId));
        const totalLikes = likesCountResult[0].count || 0;
        const currentUserId = optionalAuthContext(req);
        let viewerHasLiked = false;
        if (currentUserId) {
          const existingLike = await db.select({ id: projectLikes.id }).from(projectLikes).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectLikes.projectId, projectId), (0, import_drizzle_orm12.eq)(projectLikes.userId, currentUserId))).limit(1);
          viewerHasLiked = existingLike.length > 0;
        }
        res.json({ success: true, data: { totalLikes, viewerHasLiked } });
      } catch (error) {
        console.error("Error fetching project likes:", error);
        res.status(500).json({ error: { message: "Be\u011Feniler y\xFCklenirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.post("/:id/like", requireAuth, standardLimiter, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const userId = requireAuthContext(req);
        const project = await db.select().from(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        if (project.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (project[0].userId === userId) {
          res.status(400).json({ error: { message: "Kendi projenizi be\u011Fenemezsiniz." } });
          return;
        }
        const existing = await db.select().from(projectLikes).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectLikes.projectId, projectId), (0, import_drizzle_orm12.eq)(projectLikes.userId, userId))).limit(1);
        if (existing.length === 0) {
          try {
            await db.insert(projectLikes).values({ projectId, userId });
          } catch (err) {
            if (err.code !== "23505") throw err;
          }
          if (project[0].userId !== userId) {
            await db.insert(notifications).values({
              recipientId: project[0].userId,
              actorId: userId,
              type: "project_like",
              projectId
            });
          }
        }
        res.json({ success: true, data: { message: "Proje be\u011Fenildi." } });
      } catch (error) {
        console.error("Error liking project:", error);
        res.status(500).json({ error: { message: "\u0130\u015Flem s\u0131ras\u0131nda bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.delete("/:id/like", requireAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const userId = requireAuthContext(req);
        await db.delete(projectLikes).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectLikes.projectId, projectId), (0, import_drizzle_orm12.eq)(projectLikes.userId, userId)));
        res.json({ success: true, data: { message: "Be\u011Feni kald\u0131r\u0131ld\u0131." } });
      } catch (error) {
        console.error("Error unliking project:", error);
        res.status(500).json({ error: { message: "\u0130\u015Flem s\u0131ras\u0131nda bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.get("/:id/comments", async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const commentsList = await db.select({
          id: projectComments.id,
          content: projectComments.content,
          createdAt: projectComments.createdAt,
          userId: users.id,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          fullName: profiles.displayName
        }).from(projectComments).innerJoin(users, (0, import_drizzle_orm12.eq)(projectComments.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectComments.projectId, projectId), (0, import_drizzle_orm12.eq)(projectComments.moderationStatus, "APPROVED"))).orderBy((0, import_drizzle_orm12.asc)(projectComments.createdAt));
        res.json({ success: true, data: { comments: commentsList } });
      } catch (error) {
        console.error("Error fetching project comments:", error);
        res.status(500).json({ error: { message: "Yorumlar y\xFCklenirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.post("/:id/comments", requireAuth, strictLimiter, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz proje ID'si." } });
          return;
        }
        const { content } = req.body;
        if (!content || typeof content !== "string" || content.trim().length === 0) {
          res.status(400).json({ error: { message: "Yorum i\xE7eri\u011Fi bo\u015F olamaz." } });
          return;
        }
        if (content.trim().length > 2e3) {
          res.status(400).json({ error: { message: "Yorum en fazla 2000 karakter olabilir." } });
          return;
        }
        const userId = requireAuthContext(req);
        const project = await db.select().from(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        if (project.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        const modResult = await moderateContent(content.trim());
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        const newComment = await db.insert(projectComments).values({
          projectId,
          userId,
          content: content.trim(),
          moderationStatus: modStatus
        }).returning();
        if (modStatus !== "APPROVED") {
          await db.insert(moderationLogs).values({
            entityType: "PROJECT_COMMENT",
            entityId: newComment[0].id,
            userId,
            status: modStatus === "PENDING" ? "PENDING" : "RESOLVED",
            actionTaken: modStatus === "REJECTED" ? "REJECTED" : null,
            riskLevel: modResult.riskLevel,
            category: modResult.category,
            reason: modResult.reason || null
          });
        }
        if (modStatus === "REJECTED") {
          res.status(403).json({ error: { message: "Yorumunuz topluluk kurallar\u0131na ayk\u0131r\u0131 oldu\u011Fu i\xE7in yay\u0131nlanamad\u0131." } });
          return;
        }
        if (modStatus === "APPROVED" && project[0].userId !== userId) {
          await db.insert(notifications).values({
            recipientId: project[0].userId,
            actorId: userId,
            type: "project_comment",
            projectId,
            projectCommentId: newComment[0].id
          });
        }
        const user = await db.select({
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          fullName: profiles.displayName
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.eq)(users.id, userId)).limit(1);
        const commentData = {
          id: newComment[0].id,
          content: newComment[0].content,
          createdAt: newComment[0].createdAt,
          userId,
          username: user[0].username,
          avatarUrl: user[0].avatarUrl,
          fullName: user[0].fullName
        };
        res.status(201).json({ success: true, data: { comment: commentData, pending: modStatus === "PENDING" } });
      } catch (error) {
        console.error("Error adding project comment:", error);
        res.status(500).json({ error: { message: "Yorum eklenirken bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.delete("/:id/comments/:commentId", requireAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        const commentId = parseInt(req.params.commentId, 10);
        if (isNaN(projectId) || isNaN(commentId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz ID." } });
          return;
        }
        const userId = requireAuthContext(req);
        const comment = await db.select().from(projectComments).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectComments.id, commentId), (0, import_drizzle_orm12.eq)(projectComments.projectId, projectId))).limit(1);
        if (comment.length === 0) {
          res.status(404).json({ error: { message: "Yorum bulunamad\u0131." } });
          return;
        }
        if (comment[0].userId !== userId) {
          res.status(403).json({ error: { message: "Bu yorumu silme yetkiniz yok." } });
          return;
        }
        await db.delete(projectComments).where((0, import_drizzle_orm12.eq)(projectComments.id, commentId));
        res.json({ success: true, data: { message: "Yorum silindi." } });
      } catch (error) {
        console.error("Error deleting project comment:", error);
        res.status(500).json({ error: { message: "\u0130\u015Flem s\u0131ras\u0131nda bir hata olu\u015Ftu." } });
      }
    });
    projectsRouter.post("/:id/collaborators", requireAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        const { targetUserId } = req.body;
        if (isNaN(projectId) || typeof targetUserId !== "number") {
          res.status(400).json({ error: { message: "Ge\xE7ersiz veriler." } });
          return;
        }
        const currentUserId = requireAuthContext(req);
        if (targetUserId === currentUserId) {
          res.status(400).json({ error: { message: "Kendinizi ortak \xFCretici olarak ekleyemezsiniz." } });
          return;
        }
        const proj = await db.select({ userId: projects.userId }).from(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        if (proj.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (proj[0].userId !== currentUserId) {
          res.status(403).json({ error: { message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        const target = await db.select().from(users).where((0, import_drizzle_orm12.eq)(users.id, targetUserId)).limit(1);
        if (target.length === 0) {
          res.status(404).json({ error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const existing = await db.select().from(projectCollaborators).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectCollaborators.projectId, projectId), (0, import_drizzle_orm12.eq)(projectCollaborators.userId, targetUserId))).limit(1);
        if (existing.length > 0) {
          if (existing[0].status === "pending") {
            res.status(400).json({ error: { message: "Bu kullan\u0131c\u0131ya zaten davet g\xF6nderilmi\u015F." } });
            return;
          } else if (existing[0].status === "accepted") {
            res.status(400).json({ error: { message: "Bu kullan\u0131c\u0131 zaten ortak \xFCretici." } });
            return;
          } else {
            await db.update(projectCollaborators).set({ status: "pending", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm12.eq)(projectCollaborators.id, existing[0].id));
          }
        } else {
          await db.insert(projectCollaborators).values({
            projectId,
            userId: targetUserId,
            status: "pending"
          });
        }
        await notify(currentUserId, targetUserId, "project_collaborator_invite", void 0, void 0, projectId);
        res.json({ success: true, message: "Davet g\xF6nderildi." });
      } catch (error) {
        console.error("Invite collaborator error:", error);
        res.status(500).json({ error: { message: "Sunucu hatas\u0131." } });
      }
    });
    projectsRouter.delete("/:id/collaborators/:userId", requireAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        const targetUserId = parseInt(req.params.userId, 10);
        if (isNaN(projectId) || isNaN(targetUserId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz ID." } });
          return;
        }
        const currentUserId = requireAuthContext(req);
        const proj = await db.select({ userId: projects.userId }).from(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        if (proj.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (proj[0].userId !== currentUserId && currentUserId !== targetUserId) {
          res.status(403).json({ error: { message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        await db.delete(projectCollaborators).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectCollaborators.projectId, projectId), (0, import_drizzle_orm12.eq)(projectCollaborators.userId, targetUserId)));
        res.json({ success: true, message: "Ortak \xFCretici kald\u0131r\u0131ld\u0131." });
      } catch (error) {
        console.error("Remove collaborator error:", error);
        res.status(500).json({ error: { message: "Sunucu hatas\u0131." } });
      }
    });
    projectsRouter.get("/:id/collaborators", optionalAuth, async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz ID." } });
          return;
        }
        const currentUserId = optionalAuthContext(req);
        const [proj] = await db.select({ userId: projects.userId }).from(projects).where((0, import_drizzle_orm12.eq)(projects.id, projectId)).limit(1);
        const isProjectOwner = Boolean(currentUserId && proj && proj.userId === currentUserId);
        const statusFilter = isProjectOwner ? (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(projectCollaborators.status, "accepted"), (0, import_drizzle_orm12.eq)(projectCollaborators.status, "pending")) : currentUserId ? (0, import_drizzle_orm12.or)(
          (0, import_drizzle_orm12.eq)(projectCollaborators.status, "accepted"),
          (0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(projectCollaborators.status, "pending"), (0, import_drizzle_orm12.eq)(projectCollaborators.userId, currentUserId))
        ) : (0, import_drizzle_orm12.eq)(projectCollaborators.status, "accepted");
        const list = await db.select({
          userId: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          status: projectCollaborators.status
        }).from(projectCollaborators).innerJoin(users, (0, import_drizzle_orm12.eq)(projectCollaborators.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.and)(
          (0, import_drizzle_orm12.eq)(projectCollaborators.projectId, projectId),
          statusFilter
        ));
        res.json({ success: true, data: list });
      } catch (error) {
        console.error("Get project collaborators error:", error);
        res.status(500).json({ error: { message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/utils/childSafety.ts
function calculateAge2(birthDate) {
  if (!birthDate) return 0;
  const bDate = new Date(birthDate);
  if (isNaN(bDate.getTime())) return 0;
  const today = /* @__PURE__ */ new Date();
  let age = today.getFullYear() - bDate.getFullYear();
  const m = today.getMonth() - bDate.getMonth();
  if (m < 0 || m === 0 && today.getDate() < bDate.getDate()) {
    age--;
  }
  return Math.max(0, age);
}
function classifyAge(birthDate) {
  const age = calculateAge2(birthDate);
  if (age < 15) {
    return {
      age,
      category: "UNDER_15",
      isMinor: true,
      isPermitted: false,
      status: "REJECTED_UNDERAGE",
      legalExplanation: "10 Ekim 2026 tarihli Sosyal A\u011F Sa\u011Flay\u0131c\u0131 Y\xF6netmeli\u011Fi ve 5651 say\u0131l\u0131 Kanun Ek Madde 4 uyar\u0131nca, 15 ya\u015F\u0131n\u0131 doldurmam\u0131\u015F \xE7ocuklara sosyal a\u011F hizmeti sunulamaz."
    };
  }
  if (age < 18) {
    return {
      age,
      category: "MINOR_15_18",
      isMinor: true,
      isPermitted: true,
      status: "DECLARED_CHILD",
      legalExplanation: "15-18 ya\u015F aral\u0131\u011F\u0131ndaki \xE7ocuk kullan\u0131c\u0131lar i\xE7in ayr\u0131\u015Ft\u0131r\u0131lm\u0131\u015F y\xFCksek g\xFCvenlikli hizmet (varsay\u0131lan gizli hesap, yabanc\u0131lardan do\u011Frudan mesaj k\u0131s\u0131tlamas\u0131, takip\xE7i gizlili\u011Fi ve i\xE7erik korumas\u0131) uygulanmaktad\u0131r."
    };
  }
  return {
    age,
    category: "ADULT_18_PLUS",
    isMinor: false,
    isPermitted: true,
    status: "DECLARED_ADULT",
    legalExplanation: "18 ya\u015F\u0131n\u0131 doldurmu\u015F yeti\u015Fkin kullan\u0131c\u0131 beyan\u0131 kaydedilmi\u015Ftir. Resm\xEE ya\u015F do\u011Frulamas\u0131 kamu entegrasyonu a\u015Famas\u0131ndad\u0131r."
  };
}
function isDigitalWellbeingNightHours() {
  const now = /* @__PURE__ */ new Date();
  const utcHours = now.getUTCHours();
  const trHours = (utcHours + 3) % 24;
  return trHours >= 22 || trHours < 6;
}
function hashIpForAudit(rawIp) {
  if (!rawIp) return "UNKNOWN_IP";
  const salt = process.env.JWT_SECRET?.substring(0, 8) || "salt-gs";
  return import_crypto3.default.createHash("sha256").update(`${rawIp}:${salt}`).digest("hex");
}
var import_crypto3;
var init_childSafety = __esm({
  "server/utils/childSafety.ts"() {
    "use strict";
    import_crypto3 = __toESM(require("crypto"), 1);
  }
});

// server/validators/auth.ts
var import_zod2, registerSchema, loginSchema, forgotPasswordSchema, sendOtpSchema, verifyRegisterOtpSchema, resetPasswordSchema, resendOtpSchema, verifyTwoFactorSchema, enableTwoFactorSchema, disableTwoFactorSchema;
var init_auth2 = __esm({
  "server/validators/auth.ts"() {
    "use strict";
    import_zod2 = require("zod");
    registerSchema = import_zod2.z.object({
      username: import_zod2.z.string().min(3, "Kullan\u0131c\u0131 ad\u0131 en az 3 karakter olmal\u0131d\u0131r.").max(30, "Kullan\u0131c\u0131 ad\u0131 en fazla 30 karakter olabilir.").regex(/^[a-zA-Z0-9_]+$/, "Kullan\u0131c\u0131 ad\u0131nda T\xFCrk\xE7e karakter (\xE7,\u011F,\u0131,\xF6,\u015F,\xFC) ve bo\u015Fluk kullan\u0131lamaz.").toLowerCase(),
      email: import_zod2.z.string().email("Ge\xE7erli bir e-posta adresi giriniz.").toLowerCase(),
      password: import_zod2.z.string().min(8, "\u015Eifre en az 8 karakter olmal\u0131d\u0131r.").regex(/[a-z]/, "\u015Eifre en az bir k\xFC\xE7\xFCk harf i\xE7ermelidir.").regex(/[A-Z]/, "\u015Eifre en az bir b\xFCy\xFCk harf i\xE7ermelidir.").regex(/[0-9]/, "\u015Eifre en az bir rakam i\xE7ermelidir."),
      displayName: import_zod2.z.string().min(2, "G\xF6r\xFCnen ad en az 2 karakter olmal\u0131d\u0131r.").max(50, "G\xF6r\xFCnen ad en fazla 50 karakter olabilir."),
      birthDate: import_zod2.z.string().optional().nullable().or(import_zod2.z.literal(""))
    });
    loginSchema = import_zod2.z.object({
      identifier: import_zod2.z.string().min(1, "Kullan\u0131c\u0131 ad\u0131 veya e-posta gereklidir.").toLowerCase(),
      password: import_zod2.z.string().min(1, "\u015Eifre gereklidir.")
    });
    forgotPasswordSchema = import_zod2.z.object({
      email: import_zod2.z.string().email("Ge\xE7erli bir e-posta adresi giriniz.").toLowerCase()
    });
    sendOtpSchema = import_zod2.z.object({
      username: import_zod2.z.string().min(3, "Kullan\u0131c\u0131 ad\u0131 en az 3 karakter olmal\u0131d\u0131r.").max(30, "Kullan\u0131c\u0131 ad\u0131 en fazla 30 karakter olabilir.").regex(/^[a-zA-Z0-9_]+$/, "Kullan\u0131c\u0131 ad\u0131nda T\xFCrk\xE7e karakter (\xE7,\u011F,\u0131,\xF6,\u015F,\xFC) ve bo\u015Fluk kullan\u0131lamaz.").toLowerCase(),
      email: import_zod2.z.string().email("Ge\xE7erli bir e-posta adresi giriniz.").toLowerCase(),
      password: import_zod2.z.string().min(8, "\u015Eifre en az 8 karakter olmal\u0131d\u0131r.").regex(/[a-z]/, "\u015Eifre en az bir k\xFC\xE7\xFCk harf i\xE7ermelidir.").regex(/[A-Z]/, "\u015Eifre en az bir b\xFCy\xFCk harf i\xE7ermelidir.").regex(/[0-9]/, "\u015Eifre en az bir rakam i\xE7ermelidir."),
      displayName: import_zod2.z.string().min(2, "G\xF6r\xFCnen ad en az 2 karakter olmal\u0131d\u0131r.").max(50, "G\xF6r\xFCnen ad en fazla 50 karakter olabilir."),
      birthDate: import_zod2.z.string().optional().nullable().or(import_zod2.z.literal(""))
    });
    verifyRegisterOtpSchema = import_zod2.z.object({
      username: import_zod2.z.string().min(3, "Kullan\u0131c\u0131 ad\u0131 en az 3 karakter olmal\u0131d\u0131r.").max(30, "Kullan\u0131c\u0131 ad\u0131 en fazla 30 karakter olabilir.").regex(/^[a-zA-Z0-9_]+$/, "Kullan\u0131c\u0131 ad\u0131nda T\xFCrk\xE7e karakter (\xE7,\u011F,\u0131,\xF6,\u015F,\xFC) ve bo\u015Fluk kullan\u0131lamaz.").toLowerCase(),
      email: import_zod2.z.string().email("Ge\xE7erli bir e-posta adresi giriniz.").toLowerCase(),
      password: import_zod2.z.string().min(8, "\u015Eifre en az 8 karakter olmal\u0131d\u0131r.").regex(/[a-z]/, "\u015Eifre en az bir k\xFC\xE7\xFCk harf i\xE7ermelidir.").regex(/[A-Z]/, "\u015Eifre en az bir b\xFCy\xFCk harf i\xE7ermelidir.").regex(/[0-9]/, "\u015Eifre en az bir rakam i\xE7ermelidir."),
      displayName: import_zod2.z.string().min(2, "G\xF6r\xFCnen ad en az 2 karakter olmal\u0131d\u0131r.").max(50, "G\xF6r\xFCnen ad en fazla 50 karakter olabilir."),
      birthDate: import_zod2.z.string().optional().nullable().or(import_zod2.z.literal("")),
      otp: import_zod2.z.string().length(6, "Do\u011Frulama kodu 6 haneli olmal\u0131d\u0131r.").regex(/^[0-9]{6}$/, "Do\u011Frulama kodu sadece rakamlardan olu\u015Fmal\u0131d\u0131r.")
    });
    resetPasswordSchema = import_zod2.z.object({
      token: import_zod2.z.string().min(1, "Token gereklidir."),
      userId: import_zod2.z.number({ message: "Kullan\u0131c\u0131 ID gereklidir." }),
      newPassword: import_zod2.z.string().min(8, "\u015Eifre en az 8 karakter olmal\u0131d\u0131r.").regex(/[a-z]/, "\u015Eifre en az bir k\xFC\xE7\xFCk harf i\xE7ermelidir.").regex(/[A-Z]/, "\u015Eifre en az bir b\xFCy\xFCk harf i\xE7ermelidir.").regex(/[0-9]/, "\u015Eifre en az bir rakam i\xE7ermelidir.")
    });
    resendOtpSchema = import_zod2.z.object({
      email: import_zod2.z.string().email("Ge\xE7erli bir e-posta adresi giriniz.").toLowerCase(),
      displayName: import_zod2.z.string().optional()
    });
    verifyTwoFactorSchema = import_zod2.z.object({
      token: import_zod2.z.string().min(1, "2FA token gereklidir."),
      code: import_zod2.z.string().min(6, "Do\u011Frulama kodu gereklidir.").optional(),
      recoveryCode: import_zod2.z.string().optional()
    }).refine((data) => data.code || data.recoveryCode, {
      message: "Do\u011Frulama kodu veya kurtarma kodu gereklidir."
    });
    enableTwoFactorSchema = import_zod2.z.object({
      code: import_zod2.z.string().length(6, "Do\u011Frulama kodu 6 haneli olmal\u0131d\u0131r.").regex(/^[0-9]{6}$/, "Do\u011Frulama kodu sadece rakamlardan olu\u015Fmal\u0131d\u0131r.")
    });
    disableTwoFactorSchema = import_zod2.z.object({
      password: import_zod2.z.string().min(1, "\u015Eifre gereklidir."),
      code: import_zod2.z.string().length(6, "Do\u011Frulama kodu 6 haneli olmal\u0131d\u0131r.").regex(/^[0-9]{6}$/, "Do\u011Frulama kodu sadece rakamlardan olu\u015Fmal\u0131d\u0131r.")
    });
  }
});

// server/utils/encryption.ts
function getSecret() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: ENCRYPTION_KEY is required in production environment.");
    }
    console.warn("WARNING: ENCRYPTION_KEY ayarl\u0131 de\u011Fil, izole bir fallback anahtar kullan\u0131l\u0131yor - production i\xE7in \xF6nerilmez.");
    return "isolated_dev_fallback_secret_only_for_local_development";
  }
  return secret;
}
function deriveKey(salt) {
  return import_crypto4.default.scryptSync(getSecret(), salt, 32);
}
function encryptString(text2) {
  const salt = import_crypto4.default.randomBytes(SALT_LENGTH);
  const iv = import_crypto4.default.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);
  const cipher = import_crypto4.default.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text2, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}
function decryptString(encryptedText) {
  const parts = encryptedText.split(":");
  let key;
  let iv;
  let authTag;
  let encrypted;
  if (parts.length === 4) {
    const salt = Buffer.from(parts[0], "hex");
    iv = Buffer.from(parts[1], "hex");
    authTag = Buffer.from(parts[2], "hex");
    encrypted = parts[3];
    key = deriveKey(salt);
  } else if (parts.length === 3) {
    iv = Buffer.from(parts[0], "hex");
    authTag = Buffer.from(parts[1], "hex");
    encrypted = parts[2];
    key = deriveKey(process.env.ENCRYPTION_SALT || "salt");
  } else {
    throw new Error("Invalid encrypted text format");
  }
  if (authTag.length !== TAG_LENGTH) {
    throw new Error("Invalid authentication tag length");
  }
  const decipher = import_crypto4.default.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
var import_crypto4, ALGORITHM, IV_LENGTH, SALT_LENGTH, TAG_LENGTH;
var init_encryption = __esm({
  "server/utils/encryption.ts"() {
    "use strict";
    import_crypto4 = __toESM(require("crypto"), 1);
    ALGORITHM = "aes-256-gcm";
    IV_LENGTH = 16;
    SALT_LENGTH = 16;
    TAG_LENGTH = 16;
  }
});

// server/utils/mailer.ts
var import_nodemailer, getSmtpConfig, getTransporter, isProdEnv, maskSecretForLog, escapeHtml, baseTemplate, sendOtpVerificationEmail, sendVerificationEmail, sendPasswordResetEmail, sendSecurityAlertEmail, sendVerificationStatusEmail, sendSmtpTestEmail;
var init_mailer = __esm({
  "server/utils/mailer.ts"() {
    "use strict";
    import_nodemailer = __toESM(require("nodemailer"), 1);
    init_db();
    init_schema();
    init_encryption();
    getSmtpConfig = async () => {
      let settings = [];
      try {
        settings = await db.select().from(systemSettings);
      } catch (e) {
      }
      const config = {};
      for (const s of settings) {
        if (s.key && s.key.startsWith("smtp_")) {
          config[s.key] = s.value;
        }
      }
      let pass = config["smtp_pass"] || process.env.SMTP_PASS;
      if (config["smtp_pass"]) {
        try {
          pass = decryptString(config["smtp_pass"]);
        } catch (e) {
          console.warn("SMTP \u015Fifresi \xE7\xF6z\xFClemedi, fallback kullan\u0131lacak.");
        }
      }
      const host = config["smtp_host"] || process.env.SMTP_HOST;
      const user = config["smtp_user"] || process.env.SMTP_USER;
      const isConfigured = Boolean(host && user && pass);
      return {
        isConfigured,
        host: host || "smtp.ethereal.email",
        port: parseInt(config["smtp_port"] || process.env.SMTP_PORT || "587"),
        secure: (config["smtp_secure"] || process.env.SMTP_SECURE) === "true",
        user,
        pass,
        from: config["smtp_from"] || process.env.SMTP_FROM || '"Gen\xE7 Sosyal" <noreply@gencsosyal.com>'
      };
    };
    getTransporter = async () => {
      const config = await getSmtpConfig();
      return import_nodemailer.default.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_ALLOW_INSECURE_TLS !== "true"
        },
        connectionTimeout: 5e3,
        greetingTimeout: 5e3,
        socketTimeout: 5e3
      });
    };
    isProdEnv = () => process.env.NODE_ENV === "production";
    maskSecretForLog = (secret) => isProdEnv() ? "[REDACTED_IN_PRODUCTION]" : secret;
    escapeHtml = (unsafe) => {
      return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    baseTemplate = (title, preheader, content) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background-color: #000000; padding: 24px; text-align: center; }
    .header-logo { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: -0.5px; }
    .content { padding: 32px; }
    .title { font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #111827; }
    .text { margin-top: 0; margin-bottom: 24px; font-size: 16px; color: #4b5563; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #000000; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { font-size: 13px; color: #6b7280; margin: 0; }
    .info-box { background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .info-row { margin-bottom: 8px; font-size: 14px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-weight: 600; color: #374151; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #111827; color: #e5e7eb; }
      .container { background-color: #1f2937; border: 1px solid #374151; }
      .header { background-color: #000000; }
      .title { color: #f9fafb; }
      .text { color: #d1d5db; }
      .btn { background-color: #ffffff; color: #000000 !important; }
      .footer { background-color: #111827; border-top-color: #374151; }
      .footer-text { color: #9ca3af; }
      .info-box { background-color: #374151; }
      .info-label { color: #e5e7eb; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${escapeHtml(preheader)}</div>
  <div class="container">
    <div class="header">
      <h1 class="header-logo">Gen\xE7 Sosyal</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Gen\xE7 Sosyal. T\xFCm haklar\u0131 sakl\u0131d\u0131r.</p>
    </div>
  </div>
</body>
</html>
`;
    sendOtpVerificationEmail = async (to, displayName, otpCode) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        console.log(`
=======================================================
\u{1F4E7} [GEN\xC7 SOSYAL] E-POSTA DO\u011ERULAMA KODU
Al\u0131c\u0131: ${to} (${displayName || "Kullan\u0131c\u0131"})
\u{1F511} Do\u011Frulama Kodu: ${maskSecretForLog(otpCode)}
\u2139\uFE0F SMTP sunucusu hen\xFCz yap\u0131land\u0131r\u0131lmad\u0131\u011F\u0131 i\xE7in bildirim kaydedildi.
=======================================================
`);
        return { sent: false };
      }
      try {
        const transporter = await getTransporter();
        const html = baseTemplate(
          "E-posta Do\u011Frulama Kodunuz",
          `Gen\xE7 Sosyal kay\u0131t do\u011Frulama kodunuz: ${otpCode}`,
          `
        <h2 class="title">E-posta Do\u011Frulama Kodunuz</h2>
        <p class="text">Merhaba ${escapeHtml(displayName || "Kullan\u0131c\u0131")},</p>
        <p class="text">Gen\xE7 Sosyal hesab\u0131n\u0131z\u0131 olu\u015Fturmak ve e-posta adresinizi do\u011Frulamak i\xE7in a\u015Fa\u011F\u0131daki 6 haneli tek kullan\u0131ml\u0131k g\xFCvenlik kodunu kullan\u0131n:</p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; font-family: monospace, Consolas, sans-serif; border: 1px solid #334155; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);">
            ${escapeHtml(otpCode)}
          </div>
        </div>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Ge\xE7erlilik S\xFCresi:</span> 10 Dakika</div>
          <div class="info-row"><span class="info-label">G\xFCvenlik Uyar\u0131s\u0131:</span> Bu kodu hi\xE7 kimseyle payla\u015Fmay\u0131n. Gen\xE7 Sosyal ekibi sizden asla do\u011Frulama kodunuzu istemez.</div>
        </div>
        <p class="text" style="font-size: 13px; color: #64748b; margin-top: 20px;">Bu i\u015Flemi siz ba\u015Flatmad\u0131ysan\u0131z veya hesap a\xE7mad\u0131ysan\u0131z, bu e-postay\u0131 dikkate almayabilirsiniz.</p>
      `
        );
        const text2 = `Gen\xE7 Sosyal

E-posta Do\u011Frulama Kodunuz: ${otpCode}

Bu kod 10 dakika boyunca ge\xE7erlidir.
G\xFCvenli\u011Finiz i\xE7in bu kodu kimseyle payla\u015Fmay\u0131n.`;
        await transporter.sendMail({
          from: config.from,
          to,
          subject: "Gen\xE7 Sosyal - E-posta Do\u011Frulama Kodunuz",
          html,
          text: text2
        });
        console.log(`[SMTP] Do\u011Frulama kodu e-postas\u0131 ba\u015Far\u0131yla g\xF6nderildi: ${to}`);
        return { sent: true };
      } catch (err) {
        console.warn(`[SMTP] E-posta g\xF6nderilemedi (${err?.message}).`);
        if (!isProdEnv()) {
          console.log(`
=======================================================
\u{1F4E7} [FALLBACK OTP KODU] Al\u0131c\u0131: ${to}
\u{1F511} KOD: ${maskSecretForLog(otpCode)}
=======================================================
`);
        }
        return { sent: false };
      }
    };
    sendVerificationEmail = async (to, displayName, verifyLink) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        console.log(`
\u{1F4E7} [DO\u011ERULAMA BA\u011ELANTISI] Al\u0131c\u0131: ${to} -> ${maskSecretForLog(verifyLink)}
`);
        return;
      }
      try {
        const transporter = await getTransporter();
        const html = baseTemplate(
          "E-posta Adresinizi Do\u011Frulay\u0131n",
          "Gen\xE7 Sosyal'e ho\u015F geldiniz! L\xFCtfen hesab\u0131n\u0131z\u0131 do\u011Frulamak i\xE7in e-postan\u0131z\u0131 onaylay\u0131n.",
          `
        <h2 class="title">E-posta Adresinizi Do\u011Frulay\u0131n</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">Gen\xE7 Sosyal'e kat\u0131ld\u0131\u011F\u0131n\u0131z i\xE7in te\u015Fekk\xFCr ederiz. Hesab\u0131n\u0131z\u0131 aktifle\u015Ftirmek i\xE7in l\xFCtfen a\u015Fa\u011F\u0131daki butona t\u0131klayarak e-posta adresinizi do\u011Frulay\u0131n.</p>
        <div class="btn-container">
          <a href="${verifyLink}" class="btn">E-postam\u0131 Do\u011Frula</a>
        </div>
        <p class="text" style="font-size: 14px;">E\u011Fer bu hesab\u0131 siz olu\u015Fturmad\u0131ysan\u0131z, bu e-postay\u0131 dikkate almayabilirsiniz.</p>
      `
        );
        const text2 = `Gen\xE7 Sosyal

M\xFC\u015Fteri e-postan\u0131z\u0131 do\u011Frulamak i\xE7in a\u015Fa\u011F\u0131daki ba\u011Flant\u0131ya t\u0131klay\u0131n:
${verifyLink}

Bu iste\u011Fi siz ba\u015Flatmad\u0131ysan\u0131z bu e-postay\u0131 dikkate almayabilirsiniz.`;
        await transporter.sendMail({
          from: config.from,
          to,
          subject: "Gen\xE7 Sosyal - E-posta Do\u011Frulama",
          html,
          text: text2
        });
      } catch (err) {
        console.warn(`[SMTP] Do\u011Frulama linki e-postas\u0131 g\xF6nderilemedi (${err?.message}). Link: ${maskSecretForLog(verifyLink)}`);
      }
    };
    sendPasswordResetEmail = async (to, displayName, resetLink) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        console.log(`
\u{1F511} [\u015E\u0130FRE SIFIRLAMA BA\u011ELANTISI] Al\u0131c\u0131: ${to} -> ${maskSecretForLog(resetLink)}
`);
        return;
      }
      try {
        const transporter = await getTransporter();
        const html = baseTemplate(
          "\u015Eifrenizi S\u0131f\u0131rlay\u0131n",
          "\u015Eifrenizi s\u0131f\u0131rlamak i\xE7in gerekli ba\u011Flant\u0131 bu e-postada yer almaktad\u0131r.",
          `
        <h2 class="title">\u015Eifrenizi S\u0131f\u0131rlay\u0131n</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">Hesab\u0131n\u0131z i\xE7in \u015Fifre s\u0131f\u0131rlama talebinde bulundunuz. A\u015Fa\u011F\u0131daki butona t\u0131klayarak yeni \u015Fifrenizi belirleyebilirsiniz.</p>
        <div class="btn-container">
          <a href="${resetLink}" class="btn">\u015Eifremi S\u0131f\u0131rla</a>
        </div>
        <p class="text" style="font-size: 14px;">Bu ba\u011Flant\u0131 15 dakika boyunca ge\xE7erlidir. E\u011Fer bu talebi siz yapmad\u0131ysan\u0131z, hesab\u0131n\u0131z g\xFCvendedir ve bu e-postay\u0131 dikkate almayabilirsiniz.</p>
      `
        );
        const text2 = `Gen\xE7 Sosyal

\u015Eifrenizi s\u0131f\u0131rlamak i\xE7in a\u015Fa\u011F\u0131daki ba\u011Flant\u0131ya t\u0131klay\u0131n:
${resetLink}

Bu ba\u011Flant\u0131 15 dakika ge\xE7erlidir. Bu iste\u011Fi siz ba\u015Flatmad\u0131ysan\u0131z bu e-postay\u0131 dikkate almayabilirsiniz.`;
        await transporter.sendMail({
          from: config.from,
          to,
          subject: "Gen\xE7 Sosyal - \u015Eifre S\u0131f\u0131rlama Talebi",
          html,
          text: text2
        });
      } catch (err) {
        console.warn(`[SMTP] \u015Eifre s\u0131f\u0131rlama e-postas\u0131 g\xF6nderilemedi (${err?.message}). Link: ${maskSecretForLog(resetLink)}`);
      }
    };
    sendSecurityAlertEmail = async (to, displayName, action, date, device, os, browser, ipAddress) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        console.log(`
\u26A0\uFE0F [G\xDCVENL\u0130K B\u0130LD\u0130R\u0130M\u0130] Al\u0131c\u0131: ${to} -> \u0130\u015Flem: ${action}, Tarih: ${date}
`);
        return;
      }
      try {
        const transporter = await getTransporter();
        let detailsHtml = "";
        if (device || os || browser || ipAddress) {
          detailsHtml = `
        <div class="info-box">
          ${device || os || browser ? `<div class="info-row"><span class="info-label">Cihaz/Taray\u0131c\u0131:</span> ${escapeHtml(browser || "")} ${escapeHtml(os ? "\xB7 " + os : "")} ${escapeHtml(device ? "(" + device + ")" : "")}</div>` : ""}
          ${ipAddress ? `<div class="info-row"><span class="info-label">IP Adresi:</span> ${escapeHtml(ipAddress)}</div>` : ""}
          <div class="info-row"><span class="info-label">Zaman:</span> ${escapeHtml(date)}</div>
        </div>
      `;
        } else {
          detailsHtml = `
        <div class="info-box">
          <div class="info-row"><span class="info-label">\u0130\u015Flem:</span> ${escapeHtml(action)}</div>
          <div class="info-row"><span class="info-label">Tarih:</span> ${escapeHtml(date)}</div>
        </div>
      `;
        }
        const html = baseTemplate(
          "G\xFCvenlik Uyar\u0131s\u0131: Yeni Giri\u015F Alg\u0131land\u0131",
          "Hesab\u0131n\u0131za yeni bir giri\u015F veya \u015F\xFCpheli i\u015Flem tespit edildi.",
          `
        <h2 class="title">Yeni Bir Giri\u015F Alg\u0131land\u0131</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">Hesab\u0131n\u0131zla ilgili yeni bir g\xFCvenlik olay\u0131 tespit ettik. A\u015Fa\u011F\u0131daki detaylar\u0131 kontrol edin:</p>
        ${detailsHtml}
        <p class="text" style="font-size: 14px;">E\u011Fer bu i\u015Flemi siz yapt\u0131ysan\u0131z, bu e-postay\u0131 g\xF6rmezden gelebilirsiniz. Ancak siz yapmad\u0131ysan\u0131z, l\xFCtfen derhal \u015Fifrenizi de\u011Fi\u015Ftirin ve di\u011Fer t\xFCm oturumlar\u0131 kapat\u0131n.</p>
      `
        );
        const text2 = `Gen\xE7 Sosyal - G\xFCvenlik Bildirimi

Yeni i\u015Flem alg\u0131land\u0131:
${action}
Tarih: ${date}

E\u011Fer bu i\u015Flemi siz yapmad\u0131ysan\u0131z l\xFCtfen \u015Fifrenizi de\u011Fi\u015Ftirin.`;
        await transporter.sendMail({
          from: config.from,
          to,
          subject: "Gen\xE7 Sosyal - G\xFCvenlik Uyar\u0131s\u0131",
          html,
          text: text2
        });
      } catch (err) {
        console.warn(`[SMTP] G\xFCvenlik uyar\u0131s\u0131 e-postas\u0131 g\xF6nderilemedi (${err?.message})`);
      }
    };
    sendVerificationStatusEmail = async (to, displayName, status) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        console.log(`
\u{1F3F7}\uFE0F [DO\u011ERULAMA DURUMU] Al\u0131c\u0131: ${to} -> ${status}
`);
        return;
      }
      try {
        const transporter = await getTransporter();
        const title = status === "approved" ? "Do\u011Frulama Ba\u015Fvurunuz Onayland\u0131" : "Do\u011Frulama Ba\u015Fvurunuz Reddedildi";
        const bodyText = status === "approved" ? "Tebrikler! Mavi Tik (Onayl\u0131 Hesap) ba\u015Fvurunuz incelendi ve onayland\u0131. Art\u0131k profilinizde onay rozeti g\xF6r\xFCnecektir." : "\xDCzg\xFCn\xFCz, Mavi Tik (Onayl\u0131 Hesap) ba\u015Fvurunuz kriterlerimizi kar\u015F\u0131lamad\u0131\u011F\u0131 i\xE7in \u015Fu anda onaylanamad\u0131. \u0130lerleyen zamanlarda tekrar ba\u015Fvuru yapabilirsiniz.";
        const html = baseTemplate(
          title,
          status === "approved" ? "Tebrikler, hesab\u0131n\u0131z onayland\u0131." : "Ba\u015Fvuru sonucunuz belli oldu.",
          `
        <h2 class="title">${title}</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">${bodyText}</p>
        <p class="text" style="font-size: 14px; margin-top: 30px;">Gen\xE7 Sosyal toplulu\u011Funun bir par\xE7as\u0131 oldu\u011Funuz i\xE7in te\u015Fekk\xFCr ederiz.</p>
      `
        );
        const text2 = `Gen\xE7 Sosyal

${title}

Merhaba ${displayName},
${bodyText}`;
        await transporter.sendMail({
          from: config.from,
          to,
          subject: `Gen\xE7 Sosyal - ${title}`,
          html,
          text: text2
        });
      } catch (err) {
        console.warn(`[SMTP] Do\u011Frulama durum bildirimi g\xF6nderilemedi (${err?.message})`);
      }
    };
    sendSmtpTestEmail = async (to) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        throw new Error("SMTP ayarlar\u0131 hen\xFCz yap\u0131land\u0131r\u0131lmam\u0131\u015F. L\xFCtfen Sunucu (Host), Kullan\u0131c\u0131 ve Parola alanlar\u0131n\u0131 doldurun.");
      }
      const transporter = await getTransporter();
      const html = baseTemplate(
        "Gen\xE7 Sosyal SMTP Testi",
        "SMTP yap\u0131land\u0131rmas\u0131 ba\u015Far\u0131yla test edildi.",
        `
      <h2 class="title">Gen\xE7 Sosyal SMTP Testi</h2>
      <p class="text">Merhaba,</p>
      <p class="text">E\u011Fer bu e-postay\u0131 g\xF6r\xFCyorsan\u0131z, Admin Panel \xFCzerinden yap\u0131lan SMTP e-posta g\xF6nderim yap\u0131land\u0131rmas\u0131 ba\u015Far\u0131yla \xE7al\u0131\u015F\u0131yor demektir.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Sunucu:</span> ${escapeHtml(config.host || "")}</div>
        <div class="info-row"><span class="info-label">Port:</span> ${config.port}</div>
        <div class="info-row"><span class="info-label">G\xFCvenlik (SSL/TLS):</span> ${config.secure ? "Evet" : "Hay\u0131r"}</div>
      </div>
      <p class="text" style="font-size: 14px;">Bu otomatik bir test mesaj\u0131d\u0131r.</p>
    `
      );
      const text2 = `Gen\xE7 Sosyal SMTP Testi

E-posta sunucu yap\u0131land\u0131rmas\u0131 ba\u015Far\u0131yla tamamland\u0131.`;
      await transporter.sendMail({
        from: config.from,
        to,
        subject: "Gen\xE7 Sosyal - SMTP Test E-postas\u0131",
        html,
        text: text2
      });
    };
  }
});

// server/routes/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authRouter: () => authRouter
});
async function handleSendOtp(email, displayName, username, password, birthDate) {
  if (birthDate) {
    classifyAge(birthDate);
  }
  const existingUsername = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm14.eq)(users.username, username)).limit(1);
  if (existingUsername.length > 0) {
    return {
      status: 409,
      body: {
        success: false,
        error: { code: "USERNAME_TAKEN", message: "Bu kullan\u0131c\u0131 ad\u0131 zaten kullan\u0131mda." }
      }
    };
  }
  const existingEmail = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm14.eq)(users.email, email)).limit(1);
  if (existingEmail.length > 0) {
    return {
      status: 409,
      body: {
        success: false,
        error: { code: "EMAIL_TAKEN", message: "Bu e-posta adresi zaten bir hesaba kay\u0131tl\u0131." }
      }
    };
  }
  const existingOtpRecords = await db.select().from(otpVerifications).where(
    (0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(otpVerifications.email, email), (0, import_drizzle_orm14.eq)(otpVerifications.type, "REGISTER"))
  ).limit(1);
  if (existingOtpRecords.length > 0) {
    const existingOtp = existingOtpRecords[0];
    const diffMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
    if (diffMs < 60 * 1e3) {
      const remainingSeconds = Math.ceil((60 * 1e3 - diffMs) / 1e3);
      return {
        status: 429,
        body: {
          success: false,
          error: {
            code: "COOLDOWN_ACTIVE",
            message: `L\xFCtfen yeni bir kod talep etmeden \xF6nce ${remainingSeconds} saniye bekleyin.`,
            remainingSeconds
          }
        }
      };
    }
  }
  const otpCode = import_crypto5.default.randomInt(1e5, 1e6).toString();
  const otpHash = await import_argon22.default.hash(otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  if (existingOtpRecords.length > 0) {
    await db.update(otpVerifications).set({
      otpHash,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      lastSentAt: /* @__PURE__ */ new Date(),
      verifiedAt: null
    }).where((0, import_drizzle_orm14.eq)(otpVerifications.id, existingOtpRecords[0].id));
  } else {
    await db.insert(otpVerifications).values({
      email,
      otpHash,
      type: "REGISTER",
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      lastSentAt: /* @__PURE__ */ new Date()
    });
  }
  let mailResult = { sent: false };
  try {
    mailResult = await sendOtpVerificationEmail(email, displayName, otpCode);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    mailResult = { sent: false };
  }
  return {
    status: 200,
    body: {
      success: true,
      data: {
        message: mailResult.sent ? "Do\u011Frulama kodu e-posta adresinize g\xF6nderildi." : "Do\u011Frulama kodu e-posta adresinize g\xF6nderildi. L\xFCtfen gelen kutunuzu kontrol edin.",
        email,
        cooldownSeconds: 60,
        expiresInSeconds: 600
      }
    }
  };
}
async function handleVerifyOtpAndCreateUser(req, res, parsedData) {
  const { username, email, password, displayName, otp, birthDate } = parsedData;
  const ageClassification = birthDate ? classifyAge(birthDate) : { category: "ADULT", age: 20, legalExplanation: "" };
  const isMinor = ageClassification.category === "MINOR_15_18" || ageClassification.category === "UNDER_15";
  const ageVerificationStatus = "UNVERIFIED";
  const otpRecords = await db.select().from(otpVerifications).where(
    (0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(otpVerifications.email, email), (0, import_drizzle_orm14.eq)(otpVerifications.type, "REGISTER"))
  ).limit(1);
  if (otpRecords.length === 0) {
    res.status(400).json({
      success: false,
      error: {
        code: "OTP_NOT_FOUND",
        message: "Do\u011Frulama kodu bulunamad\u0131. L\xFCtfen \xF6nce kay\u0131t formunu doldurarak kod talep edin."
      }
    });
    return;
  }
  const otpRecord = otpRecords[0];
  if (/* @__PURE__ */ new Date() > new Date(otpRecord.expiresAt)) {
    res.status(400).json({
      success: false,
      error: {
        code: "OTP_EXPIRED",
        message: "Do\u011Frulama kodunun s\xFCresi dolmu\u015F (10 dakika). L\xFCtfen yeni bir kod isteyin."
      }
    });
    return;
  }
  const updateResult = await db.update(otpVerifications).set({ attempts: import_drizzle_orm14.sql`${otpVerifications.attempts} + 1` }).where((0, import_drizzle_orm14.eq)(otpVerifications.id, otpRecord.id)).returning({ newAttempts: otpVerifications.attempts });
  const currentAttempts = updateResult[0]?.newAttempts || otpRecord.attempts + 1;
  if (currentAttempts > otpRecord.maxAttempts) {
    res.status(400).json({
      success: false,
      error: {
        code: "MAX_ATTEMPTS_EXCEEDED",
        message: "\xC7ok fazla hatal\u0131 kod denemesi yap\u0131ld\u0131. G\xFCvenli\u011Finiz i\xE7in l\xFCtfen yeni bir kod talep edin."
      }
    });
    return;
  }
  const isValid = await import_argon22.default.verify(otpRecord.otpHash, otp);
  if (!isValid) {
    const remaining = Math.max(0, otpRecord.maxAttempts - currentAttempts);
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_OTP",
        message: remaining > 0 ? `Girdi\u011Finiz do\u011Frulama kodu hatal\u0131. Kalan deneme hakk\u0131n\u0131z: ${remaining}` : "\xC7ok fazla hatal\u0131 deneme yap\u0131ld\u0131. L\xFCtfen yeni bir do\u011Frulama kodu talep edin.",
        remainingAttempts: remaining
      }
    });
    return;
  }
  const passwordHash = await import_argon22.default.hash(password);
  let newUser;
  try {
    newUser = await db.transaction(async (tx) => {
      const existingUser = await tx.select().from(users).where(
        (0, import_drizzle_orm14.or)((0, import_drizzle_orm14.eq)(users.username, username), (0, import_drizzle_orm14.eq)(users.email, email))
      ).limit(1);
      if (existingUser.length > 0) {
        throw new Error("USER_ALREADY_EXISTS");
      }
      const [createdUser] = await tx.insert(users).values({
        username,
        email,
        passwordHash,
        isVerified: false,
        emailVerified: true,
        isActive: true,
        isMinor,
        ageVerificationStatus: "UNVERIFIED",
        ageVerifiedAt: null,
        ageVerificationMethod: "NONE",
        ageVerificationToken: null
      }).returning();
      await tx.insert(profiles).values({
        userId: createdUser.id,
        displayName,
        birthDate: birthDate ? new Date(birthDate) : null,
        isPrivate: isMinor,
        // 10 Ekim 2026 Yönetmeliği: Çocuk hesapları varsayılan olarak GİZLİ
        allowSearchEngineIndexing: !isMinor,
        // Çocuk hesapları için arama motoru dizini varsayılan KAPALI
        messagePreference: isMinor ? "FOLLOWERS" : "ANYONE",
        defaultPostVisibility: isMinor ? "FOLLOWERS" : "PUBLIC",
        isScreenshotProtected: isMinor,
        dailyScreenTimeLimitMinutes: isMinor ? 120 : null
      });
      const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
      await tx.insert(ageVerificationLogs).values({
        userId: createdUser.id,
        action: "REGISTERED_UNVERIFIED",
        calculatedAge: ageClassification.age,
        verificationMethod: "REGISTRATION_DECLARATION",
        tokenHash: null,
        ipHash: hashIpForAudit(clientIp),
        notes: `Kay\u0131t a\u015Famas\u0131nda ya\u015F beyan\u0131 al\u0131nd\u0131 (${ageClassification.age} ya\u015F). Resm\xEE ya\u015F do\u011Frulamas\u0131 hen\xFCz yap\u0131lmad\u0131 (UNVERIFIED).`
      });
      await tx.delete(otpVerifications).where((0, import_drizzle_orm14.eq)(otpVerifications.id, otpRecord.id));
      try {
        const setting = await tx.select().from(systemSettings).where((0, import_drizzle_orm14.eq)(systemSettings.key, "auto_follow_users")).limit(1);
        if (setting.length > 0 && setting[0].value) {
          const parsed = JSON.parse(setting[0].value);
          let userIds = Array.isArray(parsed) ? parsed.map((u) => typeof u === "number" ? u : u.id).filter((id) => typeof id === "number" && id !== createdUser.id) : [];
          if (userIds.length > 0) {
            const existingUsers = await tx.select({ id: users.id }).from(users).where((0, import_drizzle_orm14.inArray)(users.id, userIds));
            const validUserIds = existingUsers.map((u) => u.id);
            if (validUserIds.length > 0) {
              const followsToInsert = validUserIds.map((id) => ({
                followerId: createdUser.id,
                followingId: id,
                notificationPreference: "standard"
              }));
              await tx.insert(follows).values(followsToInsert).onConflictDoNothing();
            }
          }
        }
      } catch (e) {
        console.error("Auto-follow error on register:", e);
      }
      const accessToken2 = generateAccessToken(createdUser.id, createdUser.role);
      const refreshToken2 = generateRefreshToken(createdUser.id, createdUser.role);
      const tokenHash = hashRefreshToken(refreshToken2);
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
      const cleanIp = rawIp.split(",")[0].trim().slice(0, 45) || null;
      await tx.insert(refreshTokens).values({
        userId: createdUser.id,
        tokenHash,
        expiresAt,
        ipAddress: cleanIp,
        deviceInfo: (req.headers["user-agent"] || "").slice(0, 500) || null
      });
      return { createdUser, accessToken: accessToken2, refreshToken: refreshToken2 };
    });
  } catch (error) {
    if (error?.message === "USER_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "Kullan\u0131c\u0131 ad\u0131 veya e-posta zaten kullan\u0131mda." }
      });
      return;
    }
    throw error;
  }
  const { accessToken, refreshToken } = newUser;
  newUser = newUser.createdUser;
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions(req));
  res.status(201).json({
    success: true,
    data: {
      message: "Hesab\u0131n\u0131z ba\u015Far\u0131yla olu\u015Fturuldu ve do\u011Fruland\u0131.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName,
        role: newUser.role,
        isVerified: newUser.isVerified
      },
      accessToken,
      refreshToken
    }
  });
}
var import_express7, jwt2, import_argon22, import_crypto5, import_drizzle_orm14, import_otplib, authRouter, getRefreshTokenCookieOptions, getClearCookieOptions;
var init_auth3 = __esm({
  "server/routes/auth.ts"() {
    "use strict";
    import_express7 = require("express");
    jwt2 = __toESM(require("jsonwebtoken"), 1);
    import_argon22 = __toESM(require("argon2"), 1);
    import_crypto5 = __toESM(require("crypto"), 1);
    init_db();
    init_schema();
    import_drizzle_orm14 = require("drizzle-orm");
    init_childSafety();
    init_auth2();
    init_jwt();
    init_encryption();
    import_otplib = require("otplib");
    init_mailer();
    init_rateLimiter();
    init_auth();
    authRouter = (0, import_express7.Router)();
    getRefreshTokenCookieOptions = (req) => {
      const isHttps = Boolean(
        req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production" || process.env.APP_URL?.startsWith("https")
      );
      return {
        httpOnly: true,
        secure: isHttps,
        sameSite: isHttps ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        // 30 days
        path: "/"
      };
    };
    getClearCookieOptions = (req) => {
      const isHttps = Boolean(
        req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production" || process.env.APP_URL?.startsWith("https")
      );
      return {
        httpOnly: true,
        secure: isHttps,
        sameSite: isHttps ? "none" : "lax",
        path: "/"
      };
    };
    authRouter.get("/check-username", authRateLimiter, async (req, res) => {
      try {
        const rawUsername = String(req.query.username || "").trim();
        if (!rawUsername) {
          return res.status(400).json({
            success: false,
            error: { code: "REQUIRED", message: "Kullan\u0131c\u0131 ad\u0131 bo\u015F b\u0131rak\u0131lamaz." }
          });
        }
        if (rawUsername.length < 3 || rawUsername.length > 30) {
          return res.status(400).json({
            success: false,
            error: { code: "INVALID_LENGTH", message: "Kullan\u0131c\u0131 ad\u0131 3 ile 30 karakter aras\u0131nda olmal\u0131d\u0131r." }
          });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(rawUsername)) {
          return res.status(400).json({
            success: false,
            error: { code: "INVALID_FORMAT", message: "Kullan\u0131c\u0131 ad\u0131 yaln\u0131zca harf, rakam ve alt \xE7izgi i\xE7erebilir." }
          });
        }
        const reserved = ["admin", "root", "api", "auth", "settings", "explore", "messages", "notifications", "support", "help", "gencsosyal"];
        if (reserved.includes(rawUsername.toLowerCase())) {
          return res.json({
            success: true,
            data: {
              available: false,
              username: rawUsername,
              reason: "Bu kullan\u0131c\u0131 ad\u0131 sistem taraf\u0131ndan ayr\u0131lm\u0131\u015Ft\u0131r."
            }
          });
        }
        const existing = await db.select({ id: users.id }).from(users).where(import_drizzle_orm14.sql`LOWER(${users.username}) = LOWER(${rawUsername})`).limit(1);
        return res.json({
          success: true,
          data: {
            available: existing.length === 0,
            username: rawUsername
          }
        });
      } catch (err) {
        console.error("Check username error:", err);
        return res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Kullan\u0131c\u0131 ad\u0131 kontrol edilemedi." }
        });
      }
    });
    authRouter.post("/register/send-otp", otpSendRateLimiter, async (req, res) => {
      try {
        const parsed = sendOtpSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
          return;
        }
        const { email, displayName, username, password, birthDate } = parsed.data;
        const result = await handleSendOtp(email, displayName, username, password, birthDate);
        res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Do\u011Frulama kodu g\xF6nderilirken bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/register/resend-otp", otpSendRateLimiter, async (req, res) => {
      try {
        const parsed = resendOtpSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
          return;
        }
        const { email, displayName } = parsed.data;
        const existingUser = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm14.eq)(users.email, email)).limit(1);
        if (existingUser.length > 0) {
          res.status(409).json({
            success: false,
            error: { code: "EMAIL_TAKEN", message: "Bu e-posta adresi zaten kay\u0131tl\u0131." }
          });
          return;
        }
        const existingOtpRecords = await db.select().from(otpVerifications).where(
          (0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(otpVerifications.email, email), (0, import_drizzle_orm14.eq)(otpVerifications.type, "REGISTER"))
        ).limit(1);
        if (existingOtpRecords.length > 0) {
          const existingOtp = existingOtpRecords[0];
          const diffMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
          if (diffMs < 60 * 1e3) {
            const remainingSeconds = Math.ceil((60 * 1e3 - diffMs) / 1e3);
            res.status(429).json({
              success: false,
              error: {
                code: "COOLDOWN_ACTIVE",
                message: `L\xFCtfen yeni bir kod talep etmeden \xF6nce ${remainingSeconds} saniye bekleyin.`,
                remainingSeconds
              }
            });
            return;
          }
        }
        const otpCode = import_crypto5.default.randomInt(1e5, 1e6).toString();
        const otpHash = await import_argon22.default.hash(otpCode);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
        if (existingOtpRecords.length > 0) {
          if (existingOtpRecords[0].attempts >= existingOtpRecords[0].maxAttempts) {
            return res.status(400).json({ success: false, error: { code: "MAX_ATTEMPTS_EXCEEDED", message: "\xC7ok fazla hatal\u0131 kod denemesi yap\u0131ld\u0131. G\xFCvenli\u011Finiz i\xE7in yeni kay\u0131t i\u015Flemi ba\u015Flatmal\u0131s\u0131n\u0131z." } });
          }
          await db.update(otpVerifications).set({
            otpHash,
            expiresAt,
            lastSentAt: /* @__PURE__ */ new Date(),
            verifiedAt: null
          }).where((0, import_drizzle_orm14.eq)(otpVerifications.id, existingOtpRecords[0].id));
        } else {
          await db.insert(otpVerifications).values({
            email,
            otpHash,
            type: "REGISTER",
            attempts: 0,
            maxAttempts: 5,
            expiresAt,
            lastSentAt: /* @__PURE__ */ new Date()
          });
        }
        let mailResult = { sent: false };
        try {
          mailResult = await sendOtpVerificationEmail(email, displayName || "Kullan\u0131c\u0131", otpCode);
        } catch (err) {
          console.error("Failed to resend OTP email:", err);
          mailResult = { sent: false };
        }
        res.json({
          success: true,
          data: {
            message: mailResult.sent ? "Yeni do\u011Frulama kodu e-posta adresinize g\xF6nderildi." : "Yeni do\u011Frulama kodu e-posta adresinize g\xF6nderildi. L\xFCtfen gelen kutunuzu kontrol edin.",
            cooldownSeconds: 60,
            expiresInSeconds: 600
          }
        });
      } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Do\u011Frulama kodu yeniden g\xF6nderilemedi." }
        });
      }
    });
    authRouter.post("/register/verify-otp", otpVerifyRateLimiter, async (req, res) => {
      try {
        const parsed = verifyRegisterOtpSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
          return;
        }
        await handleVerifyOtpAndCreateUser(req, res, parsed.data);
      } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Do\u011Frulama i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/verify-register-otp", otpVerifyRateLimiter, async (req, res) => {
      try {
        const parsed = verifyRegisterOtpSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
          return;
        }
        await handleVerifyOtpAndCreateUser(req, res, parsed.data);
      } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Do\u011Frulama i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/register", registerRateLimiter, async (req, res) => {
      try {
        if (req.body.otp) {
          const parsed = verifyRegisterOtpSchema.safeParse(req.body);
          if (!parsed.success) {
            res.status(400).json({
              success: false,
              error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
            });
            return;
          }
          await handleVerifyOtpAndCreateUser(req, res, parsed.data);
        } else {
          const parsed = sendOtpSchema.safeParse(req.body);
          if (!parsed.success) {
            res.status(400).json({
              success: false,
              error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
            });
            return;
          }
          const { email, displayName, username, password } = parsed.data;
          const result = await handleSendOtp(email, displayName, username, password);
          res.status(result.status).json(result.body);
        }
      } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Kay\u0131t i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/login", loginRateLimiter, async (req, res) => {
      try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
          return;
        }
        const { identifier, password } = parsed.data;
        const userRecord = await db.select().from(users).where(
          (0, import_drizzle_orm14.or)((0, import_drizzle_orm14.eq)(users.username, identifier), (0, import_drizzle_orm14.eq)(users.email, identifier))
        ).limit(1);
        const user = userRecord.length > 0 ? userRecord[0] : null;
        const dummyHash = "$argon2id$v=19$m=65536,t=3,p=4$R3q+z0x4J4Q4gVvJ8n5Z9g$O5x1/l4zZ3z0x4J4Q4gVvJ8n5Z9gO5x1/l4zZ3z0x4I";
        const hashToVerify = user ? user.passwordHash : dummyHash;
        const isPasswordValid = await import_argon22.default.verify(hashToVerify, password).catch(() => false);
        if (!user || !isPasswordValid) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz e-posta/kullan\u0131c\u0131 ad\u0131 veya \u015Fifre." }
          });
          return;
        }
        if (!user.isActive) {
          if (user.banExpiresAt && new Date(user.banExpiresAt) <= /* @__PURE__ */ new Date()) {
            await db.update(users).set({
              isActive: true,
              banReason: null,
              bannedAt: null,
              banExpiresAt: null,
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm14.eq)(users.id, user.id));
            user.isActive = true;
            user.banReason = null;
            user.bannedAt = null;
            user.banExpiresAt = null;
          } else {
            const suspensionToken = generateSuspensionToken(user.id, user.username);
            res.status(403).json({
              success: false,
              error: {
                code: "ACCOUNT_SUSPENDED",
                message: "Hesab\u0131n\u0131z ask\u0131ya al\u0131nm\u0131\u015Ft\u0131r.",
                suspension: {
                  userId: user.id,
                  username: user.username,
                  email: user.email,
                  isPermanent: !user.banExpiresAt,
                  banReason: user.banReason || "Topluluk kurallar\u0131n\u0131n ihlali",
                  bannedAt: user.bannedAt,
                  banExpiresAt: user.banExpiresAt,
                  suspensionToken
                }
              }
            });
            return;
          }
        }
        if (user.twoFactorEnabled) {
          const { generateTwoFactorToken: generateTwoFactorToken3 } = await Promise.resolve().then(() => (init_jwt(), jwt_exports));
          const twoFactorToken = generateTwoFactorToken3(user.id, user.role);
          res.json({
            success: true,
            data: {
              requiresTwoFactor: true,
              twoFactorToken,
              message: "\u0130ki fakt\xF6rl\xFC do\u011Frulama gerekiyor."
            }
          });
          return;
        }
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);
        const tokenHash = hashRefreshToken(refreshToken);
        const ua = req.headers["user-agent"] || "";
        let browser = "Bilinmeyen Taray\u0131c\u0131";
        if (ua.includes("Firefox/")) browser = "Firefox";
        else if (ua.includes("Edg/")) browser = "Edge";
        else if (ua.includes("Chrome/") || ua.includes("CriOS/")) browser = "Chrome";
        else if (ua.includes("Safari/")) browser = "Safari";
        let os = "Bilinmeyen OS";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac OS X")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
        const ipAddress = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await db.insert(refreshTokens).values({
          userId: user.id,
          tokenHash,
          expiresAt,
          deviceInfo: ua.substring(0, 200),
          browser,
          os,
          ipAddress: ipAddress.substring(0, 45),
          lastActiveAt: /* @__PURE__ */ new Date()
        });
        res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions(req));
        sendSecurityAlertEmail(user.email, user.username, "Yeni Giri\u015F \u0130\u015Flemi", (/* @__PURE__ */ new Date()).toLocaleString("tr-TR"), ua.substring(0, 50), os, browser, ipAddress).catch(console.error);
        res.json({
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              isVerified: user.isVerified
            }
          }
        });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Giri\u015F i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/login/verify-2fa", loginRateLimiter, async (req, res) => {
      try {
        const parsed = verifyTwoFactorSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
          return;
        }
        const { token, code, recoveryCode } = parsed.data;
        let decoded;
        try {
          decoded = verifyTwoFactorToken(token);
        } catch (e) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F 2FA tokeni." }
          });
          return;
        }
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, decoded.userId)).limit(1);
        const user = userRecord.length > 0 ? userRecord[0] : null;
        if (!user || !user.isActive || !user.twoFactorEnabled || !user.twoFactorSecret) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz i\u015Flem." }
          });
          return;
        }
        const { securityAuditLogs: securityAuditLogs2, recoveryCodes: recoveryCodes2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        let verified = false;
        let usedRecoveryCodeId = null;
        if (recoveryCode) {
          const codes = await db.select().from(recoveryCodes2).where(
            (0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(recoveryCodes2.userId, user.id), (0, import_drizzle_orm14.eq)(recoveryCodes2.used, false))
          );
          for (const rc of codes) {
            const isValid = await import_argon22.default.verify(rc.codeHash, recoveryCode).catch(() => false);
            if (isValid) {
              verified = true;
              usedRecoveryCodeId = rc.id;
              break;
            }
          }
          if (!verified) {
            res.status(400).json({
              success: false,
              error: { code: "INVALID_CODE", message: "Kurtarma kodu ge\xE7ersiz veya daha \xF6nce kullan\u0131lm\u0131\u015F." }
            });
            return;
          }
        } else if (code) {
          try {
            const secret = decryptString(user.twoFactorSecret);
            verified = import_otplib.authenticator.verify({ token: code, secret });
          } catch (e) {
            verified = false;
          }
          if (!verified) {
            res.status(400).json({
              success: false,
              error: { code: "INVALID_CODE", message: "Do\u011Frulama kodu ge\xE7ersiz." }
            });
            return;
          }
        }
        let accessToken = "";
        let refreshToken = "";
        let tokenHash = "";
        const txResult = await db.transaction(async (tx) => {
          if (usedRecoveryCodeId) {
            const updateResult = await tx.update(recoveryCodes2).set({ used: true, usedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(recoveryCodes2.id, usedRecoveryCodeId), (0, import_drizzle_orm14.eq)(recoveryCodes2.used, false))).returning();
            if (updateResult.length === 0) {
              return { error: "invalid_code" };
            }
            await tx.insert(securityAuditLogs2).values({
              userId: user.id,
              action: "2fa_recovery_used",
              metadata: {
                details: "Kullan\u0131c\u0131 hesab\u0131na kurtarma kodu ile giri\u015F yapt\u0131."
              }
            });
          }
          accessToken = generateAccessToken(user.id, user.role);
          refreshToken = generateRefreshToken(user.id, user.role);
          tokenHash = hashRefreshToken(refreshToken);
          return { success: true };
        });
        if (txResult.error === "invalid_code") {
          res.status(400).json({
            success: false,
            error: { code: "INVALID_CODE", message: "Kurtarma kodu ge\xE7ersiz veya daha \xF6nce kullan\u0131lm\u0131\u015F." }
          });
          return;
        }
        const ua = req.headers["user-agent"] || "";
        let browser = "Bilinmeyen Taray\u0131c\u0131";
        if (ua.includes("Firefox/")) browser = "Firefox";
        else if (ua.includes("Edg/")) browser = "Edge";
        else if (ua.includes("Chrome/") || ua.includes("CriOS/")) browser = "Chrome";
        else if (ua.includes("Safari/")) browser = "Safari";
        let os = "Bilinmeyen OS";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac OS X")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
        const ipAddress = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await db.insert(refreshTokens).values({
          userId: user.id,
          tokenHash,
          expiresAt,
          deviceInfo: ua.substring(0, 200),
          browser,
          os,
          ipAddress: ipAddress.substring(0, 45),
          lastActiveAt: /* @__PURE__ */ new Date()
        });
        res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions(req));
        sendSecurityAlertEmail(user.email, user.username, "Yeni Giri\u015F \u0130\u015Flemi (2FA Onayl\u0131)", (/* @__PURE__ */ new Date()).toLocaleString("tr-TR"), ua.substring(0, 50), os, browser, ipAddress).catch(console.error);
        res.json({
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              isVerified: user.isVerified
            }
          }
        });
      } catch (error) {
        console.error("2FA verify error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Do\u011Frulama i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/2fa/setup", requireAuth, async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
        if (userRecord.length === 0 || !userRecord[0].isActive) {
          res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Ge\xE7ersiz i\u015Flem." } });
          return;
        }
        if (userRecord[0].twoFactorEnabled) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "\u0130ki fakt\xF6rl\xFC do\u011Frulama zaten aktif." } });
          return;
        }
        const secret = import_otplib.authenticator.generateSecret();
        const encryptedSecret = encryptString(secret);
        await db.update(users).set({ twoFactorSecret: encryptedSecret }).where((0, import_drizzle_orm14.eq)(users.id, userId));
        const otpauthUrl = import_otplib.authenticator.keyuri(userRecord[0].username, "Gen\xE7 Sosyal", secret);
        res.json({
          success: true,
          data: {
            secret,
            // This is only returned once during setup!
            otpauthUrl
          }
        });
      } catch (error) {
        console.error("2FA setup error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "2FA kurulumu ba\u015Flat\u0131lamad\u0131." }
        });
      }
    });
    authRouter.post("/2fa/enable", requireAuth, async (req, res) => {
      try {
        const parsed = enableTwoFactorSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
          return;
        }
        const userId = requireAuthContext(req);
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
        if (userRecord.length === 0 || !userRecord[0].twoFactorSecret || userRecord[0].twoFactorEnabled) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz i\u015Flem veya 2FA zaten aktif." } });
          return;
        }
        let secret;
        try {
          secret = decryptString(userRecord[0].twoFactorSecret);
        } catch (e) {
          res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "G\xFCvenlik ayarlar\u0131 okunamad\u0131." } });
          return;
        }
        const isValid = import_otplib.authenticator.verify({ token: parsed.data.code, secret });
        if (!isValid) {
          res.status(400).json({ success: false, error: { code: "INVALID_CODE", message: "Do\u011Frulama kodu hatal\u0131." } });
          return;
        }
        const { securityAuditLogs: securityAuditLogs2, recoveryCodes: recoveryCodes2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const newCodes = [];
        const plainCodes = [];
        for (let i = 0; i < 10; i++) {
          const code = import_crypto5.default.randomBytes(4).toString("hex").toUpperCase();
          plainCodes.push(code);
          const hash = await import_argon22.default.hash(code);
          newCodes.push({ userId, codeHash: hash });
        }
        await db.transaction(async (tx) => {
          await tx.update(users).set({ twoFactorEnabled: true }).where((0, import_drizzle_orm14.eq)(users.id, userId));
          await tx.delete(recoveryCodes2).where((0, import_drizzle_orm14.eq)(recoveryCodes2.userId, userId));
          await tx.insert(recoveryCodes2).values(newCodes);
          await tx.insert(securityAuditLogs2).values({
            userId,
            action: "2fa_enabled",
            metadata: {
              details: "\u0130ki fakt\xF6rl\xFC do\u011Frulama etkinle\u015Ftirildi.",
              ipAddress: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim().substring(0, 45)
            }
          }).catch(console.error);
        });
        res.json({
          success: true,
          data: {
            message: "\u0130ki fakt\xF6rl\xFC do\u011Frulama ba\u015Far\u0131yla etkinle\u015Ftirildi.",
            recoveryCodes: plainCodes
          }
        });
      } catch (error) {
        console.error("2FA enable error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "2FA etkinle\u015Ftirilirken bir hata olu\u015Ftu." } });
      }
    });
    authRouter.post("/2fa/disable", requireAuth, async (req, res) => {
      try {
        const parsed = disableTwoFactorSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
          return;
        }
        const userId = requireAuthContext(req);
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
        if (userRecord.length === 0 || !userRecord[0].twoFactorEnabled) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "2FA aktif de\u011Fil." } });
          return;
        }
        const isPasswordValid = await import_argon22.default.verify(userRecord[0].passwordHash, parsed.data.password).catch(() => false);
        if (!isPasswordValid) {
          res.status(400).json({ success: false, error: { code: "INVALID_PASSWORD", message: "\u015Eifre hatal\u0131." } });
          return;
        }
        let secret;
        try {
          secret = decryptString(userRecord[0].twoFactorSecret);
        } catch (e) {
          res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "G\xFCvenlik ayarlar\u0131 okunamad\u0131." } });
          return;
        }
        const isValid = import_otplib.authenticator.verify({ token: parsed.data.code, secret });
        if (!isValid) {
          res.status(400).json({ success: false, error: { code: "INVALID_CODE", message: "Do\u011Frulama kodu hatal\u0131." } });
          return;
        }
        const { securityAuditLogs: securityAuditLogs2, recoveryCodes: recoveryCodes2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db.transaction(async (tx) => {
          await tx.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where((0, import_drizzle_orm14.eq)(users.id, userId));
          await tx.delete(recoveryCodes2).where((0, import_drizzle_orm14.eq)(recoveryCodes2.userId, userId));
          await tx.insert(securityAuditLogs2).values({
            userId,
            action: "2fa_disabled",
            metadata: {
              details: "\u0130ki fakt\xF6rl\xFC do\u011Frulama devre d\u0131\u015F\u0131 b\u0131rak\u0131ld\u0131.",
              ipAddress: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim().substring(0, 45)
            }
          }).catch(console.error);
        });
        res.json({
          success: true,
          data: { message: "\u0130ki fakt\xF6rl\xFC do\u011Frulama devre d\u0131\u015F\u0131 b\u0131rak\u0131ld\u0131." }
        });
      } catch (error) {
        console.error("2FA disable error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "2FA devre d\u0131\u015F\u0131 b\u0131rak\u0131l\u0131rken bir hata olu\u015Ftu." } });
      }
    });
    authRouter.post("/refresh", async (req, res) => {
      try {
        const candidates = [
          req.body?.refreshToken,
          typeof req.headers["x-refresh-token"] === "string" ? req.headers["x-refresh-token"] : null,
          req.cookies?.refreshToken
        ].filter((t) => typeof t === "string" && t.trim().length > 10 && t !== "null" && t !== "undefined");
        if (candidates.length === 0) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Oturum s\xFCresi dolmu\u015F, l\xFCtfen tekrar giri\u015F yap\u0131n." }
          });
          return;
        }
        let refreshToken = candidates[0];
        let decoded = null;
        for (const candidate of candidates) {
          try {
            decoded = verifyRefreshToken(candidate);
            if (decoded && decoded.userId) {
              refreshToken = candidate;
              break;
            }
          } catch {
          }
        }
        if (!decoded || !decoded.userId) {
          res.clearCookie("refreshToken", getClearCookieOptions(req));
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz oturum." }
          });
          return;
        }
        const tokenSha = hashRefreshToken(refreshToken);
        const tokenRecords = await db.select().from(refreshTokens).where((0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(refreshTokens.userId, decoded.userId), (0, import_drizzle_orm14.eq)(refreshTokens.tokenHash, tokenSha))).limit(1);
        let matchedRecord = tokenRecords[0] || null;
        if (!matchedRecord) {
          const activeTokens = await db.select().from(refreshTokens).where((0, import_drizzle_orm14.eq)(refreshTokens.userId, decoded.userId)).orderBy((0, import_drizzle_orm14.desc)(refreshTokens.createdAt)).limit(15);
          for (const record of activeTokens) {
            if (record.tokenHash.startsWith("$argon2")) {
              const isValid = await import_argon22.default.verify(record.tokenHash, refreshToken).catch(() => false);
              if (isValid) {
                matchedRecord = record;
                break;
              }
            }
          }
        }
        if (!matchedRecord) {
          res.clearCookie("refreshToken", getClearCookieOptions(req));
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz oturum." }
          });
          return;
        }
        if (/* @__PURE__ */ new Date() > new Date(matchedRecord.expiresAt)) {
          res.clearCookie("refreshToken", getClearCookieOptions(req));
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Oturum s\xFCresi dolmu\u015F, l\xFCtfen tekrar giri\u015F yap\u0131n." }
          });
          return;
        }
        const ROTATION_GRACE_PERIOD_MS = 10 * 60 * 1e3;
        if (matchedRecord.revokedAt) {
          const revokedAgoMs = Date.now() - new Date(matchedRecord.revokedAt).getTime();
          if (revokedAgoMs <= ROTATION_GRACE_PERIOD_MS) {
            const user = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, decoded.userId)).limit(1);
            if (user.length > 0 && user[0].isActive) {
              const freshAccessToken = generateAccessToken(user[0].id, user[0].role);
              const freshRefreshToken = generateRefreshToken(user[0].id, user[0].role);
              const freshHash = hashRefreshToken(freshRefreshToken);
              const freshExpires = /* @__PURE__ */ new Date();
              freshExpires.setDate(freshExpires.getDate() + 30);
              await db.insert(refreshTokens).values({
                userId: user[0].id,
                tokenHash: freshHash,
                expiresAt: freshExpires,
                ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
                deviceInfo: req.headers["user-agent"] || null
              });
              res.cookie("refreshToken", freshRefreshToken, getRefreshTokenCookieOptions(req));
              return res.json({
                success: true,
                data: {
                  accessToken: freshAccessToken,
                  refreshToken: freshRefreshToken
                }
              });
            }
          }
          res.clearCookie("refreshToken", getClearCookieOptions(req));
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Oturum yenileme s\xFCresi dolmu\u015F. L\xFCtfen tekrar giri\u015F yap\u0131n." }
          });
          return;
        }
        const txResult = await db.transaction(async (tx) => {
          await tx.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.eq)(refreshTokens.id, matchedRecord.id));
          const user = await tx.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, decoded.userId)).limit(1);
          if (user.length === 0) {
            return { error: "not_found" };
          }
          if (!user[0].isActive) {
            if (user[0].banExpiresAt && new Date(user[0].banExpiresAt) <= /* @__PURE__ */ new Date()) {
              await tx.update(users).set({
                isActive: true,
                banReason: null,
                bannedAt: null,
                banExpiresAt: null,
                updatedAt: /* @__PURE__ */ new Date()
              }).where((0, import_drizzle_orm14.eq)(users.id, user[0].id));
            } else {
              return {
                error: "inactive",
                suspension: {
                  userId: user[0].id,
                  username: user[0].username,
                  email: user[0].email,
                  isPermanent: !user[0].banExpiresAt,
                  banReason: user[0].banReason || "Topluluk kurallar\u0131n\u0131n ihlali",
                  bannedAt: user[0].bannedAt,
                  banExpiresAt: user[0].banExpiresAt
                }
              };
            }
          }
          const newAccessToken2 = generateAccessToken(user[0].id, user[0].role);
          const newRefreshToken2 = generateRefreshToken(user[0].id, user[0].role);
          const newTokenHash = hashRefreshToken(newRefreshToken2);
          const expiresAt = /* @__PURE__ */ new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          await tx.insert(refreshTokens).values({
            userId: user[0].id,
            tokenHash: newTokenHash,
            expiresAt,
            ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
            deviceInfo: req.headers["user-agent"] || null
          });
          return { newAccessToken: newAccessToken2, newRefreshToken: newRefreshToken2 };
        });
        if (txResult.error === "inactive") {
          res.clearCookie("refreshToken", getClearCookieOptions(req));
          const suspensionToken = generateSuspensionToken(txResult.suspension.userId, txResult.suspension.username);
          res.status(403).json({
            success: false,
            error: {
              code: "ACCOUNT_SUSPENDED",
              message: "Hesab\u0131n\u0131z ask\u0131ya al\u0131nm\u0131\u015Ft\u0131r.",
              suspension: {
                ...txResult.suspension,
                suspensionToken
              }
            }
          });
          return;
        }
        if (txResult.error === "not_found") {
          res.clearCookie("refreshToken", getClearCookieOptions(req));
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Kullan\u0131c\u0131 bulunamad\u0131." }
          });
          return;
        }
        const { newAccessToken, newRefreshToken } = txResult;
        res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions(req));
        res.json({
          success: true,
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          }
        });
      } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Oturum yenilenirken bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/logout", async (req, res) => {
      try {
        const refreshToken = req.body?.refreshToken || req.headers["x-refresh-token"] || req.cookies?.refreshToken;
        if (refreshToken) {
          try {
            const decoded = verifyRefreshToken(refreshToken);
            const tokenSha = hashRefreshToken(refreshToken);
            await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(refreshTokens.userId, decoded.userId), (0, import_drizzle_orm14.eq)(refreshTokens.tokenHash, tokenSha)));
          } catch (e) {
          }
        }
        res.clearCookie("refreshToken", getClearCookieOptions(req));
        res.json({ success: true, data: {} });
      } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "\xC7\u0131k\u0131\u015F yap\u0131l\u0131rken bir hata olu\u015Ftu." }
        });
      }
    });
    authRouter.get("/me", requireAuth, async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const userRecord = await db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          bannedAt: users.bannedAt,
          banReason: users.banReason,
          banExpiresAt: users.banExpiresAt,
          isVerified: users.isVerified,
          isMinor: users.isMinor,
          ageVerificationStatus: users.ageVerificationStatus,
          ageVerificationToken: users.ageVerificationToken,
          ageVerifiedAt: users.ageVerifiedAt,
          ageVerificationMethod: users.ageVerificationMethod,
          createdAt: users.createdAt,
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          coverUrl: profiles.coverUrl,
          location: profiles.location,
          website: profiles.website,
          isPrivate: profiles.isPrivate,
          allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
          messagePreference: profiles.messagePreference,
          mentionPreference: profiles.mentionPreference,
          defaultPostVisibility: profiles.defaultPostVisibility,
          onboardingCompleted: profiles.onboardingCompleted,
          interests: profiles.interests,
          birthDate: profiles.birthDate,
          isScreenshotProtected: profiles.isScreenshotProtected,
          dailyScreenTimeLimitMinutes: profiles.dailyScreenTimeLimitMinutes
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm14.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({
            success: false,
            error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." }
          });
          return;
        }
        const u = userRecord[0];
        if (!u.isActive) {
          if (u.banExpiresAt && new Date(u.banExpiresAt) <= /* @__PURE__ */ new Date()) {
            await db.update(users).set({
              isActive: true,
              banReason: null,
              bannedAt: null,
              banExpiresAt: null,
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm14.eq)(users.id, u.id));
            u.isActive = true;
            u.banReason = null;
            u.bannedAt = null;
            u.banExpiresAt = null;
          } else {
            const suspensionToken = generateSuspensionToken(u.id, u.username);
            res.status(403).json({
              success: false,
              error: {
                code: "ACCOUNT_SUSPENDED",
                message: "Hesab\u0131n\u0131z ask\u0131ya al\u0131nm\u0131\u015Ft\u0131r.",
                suspension: {
                  userId: u.id,
                  username: u.username,
                  email: u.email,
                  isPermanent: !u.banExpiresAt,
                  banReason: u.banReason || "Topluluk kurallar\u0131n\u0131n ihlali",
                  bannedAt: u.bannedAt,
                  banExpiresAt: u.banExpiresAt,
                  suspensionToken
                }
              }
            });
            return;
          }
        }
        res.json({
          success: true,
          data: u
        });
      } catch (error) {
        console.error("Me error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Bilgiler al\u0131n\u0131rken hata olu\u015Ftu." }
        });
      }
    });
    authRouter.get("/suspension-status", async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        if (!token && typeof req.query.token === "string") {
          token = req.query.token;
        }
        if (!token && req.cookies?.refreshToken) {
          try {
            const refDecoded = verifyRefreshToken(req.cookies.refreshToken);
            if (refDecoded && refDecoded.userId) {
              token = generateSuspensionToken(refDecoded.userId, "");
            }
          } catch {
          }
        }
        if (!token) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Yetkilendirme anahtar\u0131 bulunamad\u0131." }
          });
          return;
        }
        let decoded;
        try {
          decoded = verifySuspensionToken(token);
        } catch {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F anahtar." }
          });
          return;
        }
        const userRec = await db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          isActive: users.isActive,
          banReason: users.banReason,
          bannedAt: users.bannedAt,
          banExpiresAt: users.banExpiresAt
        }).from(users).where((0, import_drizzle_orm14.eq)(users.id, decoded.userId)).limit(1);
        if (userRec.length === 0) {
          res.status(404).json({
            success: false,
            error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." }
          });
          return;
        }
        const u = userRec[0];
        if (!u.isActive && u.banExpiresAt && new Date(u.banExpiresAt) <= /* @__PURE__ */ new Date()) {
          await db.update(users).set({
            isActive: true,
            banReason: null,
            bannedAt: null,
            banExpiresAt: null,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm14.eq)(users.id, u.id));
          u.isActive = true;
          u.banReason = null;
          u.bannedAt = null;
          u.banExpiresAt = null;
        }
        const latestAppeal = await db.select().from(appeals).where((0, import_drizzle_orm14.eq)(appeals.userId, u.id)).orderBy((0, import_drizzle_orm14.desc)(appeals.createdAt)).limit(1);
        res.json({
          success: true,
          data: {
            userId: u.id,
            username: u.username,
            email: u.email,
            isActive: u.isActive,
            isPermanent: !u.banExpiresAt,
            banReason: u.banReason || "Topluluk kurallar\u0131n\u0131n ihlali",
            bannedAt: u.bannedAt,
            banExpiresAt: u.banExpiresAt,
            appeal: latestAppeal.length > 0 ? latestAppeal[0] : null
          }
        });
      } catch (err) {
        console.error("Suspension status error:", err);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Hesap durumu kontrol edilirken hata olu\u015Ftu." }
        });
      }
    });
    authRouter.post("/verify-email", authRateLimiter, async (req, res) => {
      try {
        const { token } = req.body;
        if (!token) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Token gereklidir." } });
        }
        const decoded = verifyEmailToken(token);
        if (decoded.purpose !== "verify_email") {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz token t\xFCr\xFC." } });
        }
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, decoded.userId)).limit(1);
        if (userRecord.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
        }
        if (userRecord[0].isVerified) {
          return res.json({ success: true, data: { message: "Hesap zaten do\u011Frulanm\u0131\u015F." } });
        }
        await db.update(users).set({ isVerified: true, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.eq)(users.id, decoded.userId));
        res.json({ success: true, data: { message: "Hesab\u0131n\u0131z ba\u015Far\u0131yla do\u011Fruland\u0131." } });
      } catch (error) {
        console.error("Verify email error:", error);
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F token." } });
      }
    });
    authRouter.post("/forgot-password", authRateLimiter, async (req, res) => {
      try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
        }
        const { email } = parsed.data;
        const userRecord = await db.select({ id: users.id, username: users.username, displayName: profiles.displayName, passwordHash: users.passwordHash }).from(users).leftJoin(profiles, (0, import_drizzle_orm14.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm14.eq)(users.email, email)).limit(1);
        if (userRecord.length > 0) {
          const user = userRecord[0];
          const secret = getEmailTokenSecret() + user.passwordHash;
          const resetToken = jwt2.sign({ userId: user.id, purpose: "reset_password" }, secret, { expiresIn: "15m" });
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          await sendPasswordResetEmail(email, user.displayName || user.username, `${frontendUrl}/reset-password?token=${resetToken}&id=${user.id}`);
        }
        res.json({ success: true, data: { message: "E\u011Fer e-posta adresi sistemimizde kay\u0131tl\u0131ysa, \u015Fifre s\u0131f\u0131rlama ba\u011Flant\u0131s\u0131 g\xF6nderildi." } });
      } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    authRouter.post("/reset-password", authRateLimiter, async (req, res) => {
      try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
        }
        const { token, newPassword, userId } = parsed.data;
        const userRecord = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
        if (userRecord.length === 0) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz kullan\u0131c\u0131." } });
        }
        const secret = getEmailTokenSecret() + userRecord[0].passwordHash;
        let decoded;
        try {
          decoded = jwt2.verify(token, secret);
          if (!decoded || decoded.purpose !== "reset_password" || decoded.userId !== userId) {
            throw new Error("Invalid token claims");
          }
        } catch (e) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz veya kullan\u0131lm\u0131\u015F token." } });
        }
        const passwordHash = await import_argon22.default.hash(newPassword);
        await db.update(users).set({ passwordHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.eq)(users.id, userId));
        await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.eq)(refreshTokens.userId, decoded.userId));
        res.json({ success: true, data: { message: "\u015Eifreniz ba\u015Far\u0131yla g\xFCncellendi." } });
      } catch (error) {
        console.error("Reset password error:", error);
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F token." } });
      }
    });
    authRouter.get("/sessions", requireAuth, async (req, res) => {
      try {
        const activeTokens = await db.select().from(refreshTokens).where(
          (0, import_drizzle_orm14.and)(
            (0, import_drizzle_orm14.eq)(refreshTokens.userId, requireAuthContext(req)),
            import_drizzle_orm14.sql`${refreshTokens.revokedAt} IS NULL`,
            import_drizzle_orm14.sql`${refreshTokens.expiresAt} > NOW()`
          )
        ).orderBy((0, import_drizzle_orm14.desc)(refreshTokens.lastActiveAt));
        let currentHash = "";
        const currentToken = req.cookies.refreshToken;
        if (currentToken) {
          for (const t of activeTokens) {
            try {
              const isMatch = await import_argon22.default.verify(t.tokenHash, currentToken);
              if (isMatch) {
                currentHash = t.tokenHash;
                await db.update(refreshTokens).set({ lastActiveAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.eq)(refreshTokens.id, t.id));
                t.lastActiveAt = /* @__PURE__ */ new Date();
                break;
              }
            } catch (e) {
            }
          }
        }
        const sessions = activeTokens.map((t) => ({
          id: t.id,
          deviceInfo: t.deviceInfo,
          browser: t.browser,
          os: t.os,
          ipAddress: t.ipAddress?.replace(/\d+\.\d+$/, "***.***"),
          // mask IP
          createdAt: t.createdAt,
          lastActiveAt: t.lastActiveAt,
          isCurrent: t.tokenHash === currentHash
        }));
        res.json({ success: true, data: sessions });
      } catch (error) {
        console.error("Get sessions error:", error);
        res.status(500).json({ success: false, error: { message: "Oturumlar al\u0131namad\u0131." } });
      }
    });
    authRouter.delete("/sessions/others", requireAuth, async (req, res) => {
      try {
        const currentToken = req.cookies.refreshToken;
        let currentId = null;
        if (currentToken) {
          const activeTokens = await db.select().from(refreshTokens).where(
            (0, import_drizzle_orm14.and)(
              (0, import_drizzle_orm14.eq)(refreshTokens.userId, requireAuthContext(req)),
              import_drizzle_orm14.sql`${refreshTokens.revokedAt} IS NULL`,
              import_drizzle_orm14.sql`${refreshTokens.expiresAt} > NOW()`
            )
          );
          for (const t of activeTokens) {
            try {
              if (await import_argon22.default.verify(t.tokenHash, currentToken)) {
                currentId = t.id;
                break;
              }
            } catch (e) {
            }
          }
        }
        if (currentId) {
          await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where(
            (0, import_drizzle_orm14.and)(
              (0, import_drizzle_orm14.eq)(refreshTokens.userId, requireAuthContext(req)),
              import_drizzle_orm14.sql`${refreshTokens.id} != ${currentId}`
            )
          );
        } else {
          await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm14.eq)(refreshTokens.userId, requireAuthContext(req)));
        }
        res.json({ success: true, message: "Di\u011Fer oturumlar ba\u015Far\u0131yla kapat\u0131ld\u0131." });
      } catch (error) {
        console.error("Revoke other sessions error:", error);
        res.status(500).json({ success: false, error: { message: "Oturumlar kapat\u0131lamad\u0131." } });
      }
    });
    authRouter.delete("/sessions/:id", requireAuth, async (req, res) => {
      try {
        const sessionId = parseInt(req.params.id);
        if (isNaN(sessionId)) return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID" } });
        const result = await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where(
          (0, import_drizzle_orm14.and)(
            (0, import_drizzle_orm14.eq)(refreshTokens.id, sessionId),
            (0, import_drizzle_orm14.eq)(refreshTokens.userId, requireAuthContext(req))
          )
        );
        if (result.rowCount === 0) {
          return res.status(404).json({ success: false, error: { message: "Oturum bulunamad\u0131 veya yetkiniz yok." } });
        }
        res.json({ success: true, message: "Oturum kapat\u0131ld\u0131." });
      } catch (error) {
        console.error("Revoke session error:", error);
        res.status(500).json({ success: false, error: { message: "Oturum kapat\u0131lamad\u0131." } });
      }
    });
  }
});

// server/validators/api.ts
var import_zod3, paginationSchema, suggestionQuerySchema, updateProfileSchema, createPostSchema, createCommentSchema, changePasswordSchema, changeEmailSchema, deleteAccountSchema;
var init_api = __esm({
  "server/validators/api.ts"() {
    "use strict";
    import_zod3 = require("zod");
    paginationSchema = import_zod3.z.object({
      page: import_zod3.z.coerce.number().min(1).default(1),
      limit: import_zod3.z.coerce.number().min(1).max(50).default(20),
      cursor: import_zod3.z.string().optional()
    });
    suggestionQuerySchema = import_zod3.z.object({
      limit: import_zod3.z.coerce.number().min(1, "Limit en az 1 olmal\u0131d\u0131r.").max(50, "Limit en fazla 50 olabilir.").default(10),
      offset: import_zod3.z.coerce.number().min(0, "Offset negatif olamaz.").default(0)
    });
    updateProfileSchema = import_zod3.z.object({
      displayName: import_zod3.z.string().min(2).max(100).optional(),
      bio: import_zod3.z.string().max(500).optional().or(import_zod3.z.literal("")),
      website: import_zod3.z.string().url().max(255).optional().or(import_zod3.z.literal("")),
      location: import_zod3.z.string().max(100).optional().or(import_zod3.z.literal("")),
      avatarUrl: import_zod3.z.string().optional().or(import_zod3.z.literal("")),
      coverUrl: import_zod3.z.string().optional().or(import_zod3.z.literal("")),
      isPrivate: import_zod3.z.boolean().optional(),
      allowSearchEngineIndexing: import_zod3.z.boolean().optional(),
      messagePreference: import_zod3.z.enum(["ANYONE", "FOLLOWERS", "NONE"]).optional(),
      mentionPreference: import_zod3.z.enum(["ANYONE", "FOLLOWERS", "NONE"]).optional(),
      defaultPostVisibility: import_zod3.z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]).optional(),
      interests: import_zod3.z.array(import_zod3.z.string()).optional()
    });
    createPostSchema = import_zod3.z.object({
      content: import_zod3.z.string().max(2e3).optional(),
      communityId: import_zod3.z.number().int().positive().optional(),
      collaboratorId: import_zod3.z.number().int().positive().optional(),
      visibility: import_zod3.z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]).default("PUBLIC"),
      postType: import_zod3.z.enum(["NORMAL", "POLL", "SENSITIVE"]).default("NORMAL"),
      quotedPostId: import_zod3.z.number().int().positive().optional(),
      contentWarning: import_zod3.z.string().max(100).optional(),
      pollOptions: import_zod3.z.array(import_zod3.z.string().min(1).max(100)).min(2).max(10).optional(),
      media: import_zod3.z.array(import_zod3.z.union([
        import_zod3.z.object({
          url: import_zod3.z.string(),
          type: import_zod3.z.enum(["image", "video"]),
          width: import_zod3.z.number().optional(),
          height: import_zod3.z.number().optional(),
          duration: import_zod3.z.number().optional(),
          thumbnailUrl: import_zod3.z.string().optional()
        }),
        import_zod3.z.string().transform((url) => ({
          url,
          type: url.includes(".mp4") || url.includes(".webm") || url.includes("_compressed") ? "video" : "image",
          width: void 0,
          height: void 0,
          duration: void 0,
          thumbnailUrl: void 0
        }))
      ])).optional()
    }).refine((data) => {
      if (data.postType === "POLL" && (!data.pollOptions || data.pollOptions.length < 2)) return false;
      if (data.postType === "SENSITIVE" && !data.contentWarning) return false;
      return data.content || data.media && data.media.length > 0 || data.postType === "POLL";
    }, {
      message: "G\xF6nderi metni veya medya i\xE7ermelidir."
    });
    createCommentSchema = import_zod3.z.object({
      content: import_zod3.z.string().min(1).max(1e3),
      parentId: import_zod3.z.number().optional()
    });
    changePasswordSchema = import_zod3.z.object({
      currentPassword: import_zod3.z.string().min(1, "Mevcut \u015Fifre zorunludur."),
      newPassword: import_zod3.z.string().min(8, "Yeni \u015Fifre en az 8 karakter olmal\u0131d\u0131r.").regex(/[a-z]/, "Yeni \u015Fifre en az bir k\xFC\xE7\xFCk harf i\xE7ermelidir.").regex(/[A-Z]/, "Yeni \u015Fifre en az bir b\xFCy\xFCk harf i\xE7ermelidir.").regex(/[0-9]/, "Yeni \u015Fifre en az bir rakam i\xE7ermelidir.")
    });
    changeEmailSchema = import_zod3.z.object({
      email: import_zod3.z.string().email("Ge\xE7erli bir e-posta adresi girin."),
      password: import_zod3.z.string().min(1, "\u015Eifre zorunludur.")
    });
    deleteAccountSchema = import_zod3.z.object({
      password: import_zod3.z.string().min(1, "\u015Eifre zorunludur.")
    });
  }
});

// server/routes/users.ts
var users_exports = {};
__export(users_exports, {
  usersRouter: () => usersRouter
});
var import_argon23, import_fs3, import_path4, import_express8, import_drizzle_orm15, import_otplib2, usersRouter;
var init_users = __esm({
  "server/routes/users.ts"() {
    "use strict";
    import_argon23 = __toESM(require("argon2"), 1);
    init_schema();
    init_api();
    init_mailer();
    init_jwt();
    import_fs3 = __toESM(require("fs"), 1);
    import_path4 = __toESM(require("path"), 1);
    import_express8 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm15 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_api();
    init_moderation();
    init_schema();
    import_otplib2 = require("otplib");
    init_encryption();
    init_suggestions();
    usersRouter = (0, import_express8.Router)();
    usersRouter.get("/suggestions", requireAuth, standardLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        if (req.query.userId && Number(req.query.userId) !== currentUserId) {
          return res.status(403).json({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Ba\u015Fka bir kullan\u0131c\u0131n\u0131n \xF6neri listesine eri\u015Femezsiniz."
            }
          });
        }
        const parseResult = suggestionQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: parseResult.error.issues[0]?.message || "Ge\xE7ersiz parametreler."
            }
          });
        }
        const { limit, offset } = parseResult.data;
        let excludeIds = [];
        if (req.query.exclude) {
          const raw = Array.isArray(req.query.exclude) ? req.query.exclude.join(",") : String(req.query.exclude);
          excludeIds = raw.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
        }
        const result = await getFollowSuggestions(currentUserId, {
          limit,
          offset,
          excludeIds
        });
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        console.error("Suggestions error:", error);
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "\xD6neriler getirilirken bir hata olu\u015Ftu."
          }
        });
      }
    });
    usersRouter.get("/:username", optionalAuth, async (req, res) => {
      try {
        const { username } = req.params;
        const currentUserId = optionalAuthContext(req);
        const userRecords = await db.select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
          isMinor: users.isMinor,
          ageVerificationStatus: users.ageVerificationStatus,
          createdAt: users.createdAt,
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          coverUrl: profiles.coverUrl,
          location: profiles.location,
          website: profiles.website,
          isPrivate: profiles.isPrivate,
          isScreenshotProtected: profiles.isScreenshotProtected,
          allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
          messagePreference: profiles.messagePreference,
          mentionPreference: profiles.mentionPreference,
          defaultPostVisibility: profiles.defaultPostVisibility
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm15.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm15.eq)(users.username, username)).limit(1);
        if (userRecords.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const targetUser = userRecords[0];
        if (currentUserId) {
          const blockRecord = await db.select().from(blocks).where(
            (0, import_drizzle_orm15.or)(
              (0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm15.eq)(blocks.blockedId, targetUser.id)),
              (0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(blocks.blockerId, targetUser.id), (0, import_drizzle_orm15.eq)(blocks.blockedId, currentUserId))
            )
          ).limit(1);
          if (blockRecord.length > 0) {
            res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
            return;
          }
        }
        const followerCountRes = await db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(follows).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followingId, targetUser.id), (0, import_drizzle_orm15.eq)(follows.status, "accepted")));
        const followingCountRes = await db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(follows).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followerId, targetUser.id), (0, import_drizzle_orm15.eq)(follows.status, "accepted")));
        const postCountRes = await db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(posts).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(posts.userId, targetUser.id), (0, import_drizzle_orm15.eq)(posts.moderationStatus, "APPROVED")));
        const projectCountRes = await db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(projects).where((0, import_drizzle_orm15.eq)(projects.userId, targetUser.id));
        let isFollowing = false;
        let followStatus = "none";
        let followsMe = false;
        let notificationPreference = null;
        if (currentUserId) {
          const isFollowingRes = await db.select().from(follows).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm15.eq)(follows.followingId, targetUser.id))).limit(1);
          if (isFollowingRes.length > 0) {
            followStatus = isFollowingRes[0].status;
            isFollowing = followStatus === "accepted";
            notificationPreference = isFollowingRes[0].notificationPreference;
          }
          const followsMeRes = await db.select().from(follows).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followerId, targetUser.id), (0, import_drizzle_orm15.eq)(follows.followingId, currentUserId))).limit(1);
          if (followsMeRes.length > 0 && followsMeRes[0].status === "accepted") {
            followsMe = true;
          }
        }
        const responseData = {
          ...targetUser,
          followersCount: Number(followerCountRes[0]?.count || 0),
          followingCount: Number(followingCountRes[0]?.count || 0),
          postsCount: Number(postCountRes[0]?.count || 0),
          projectsCount: Number(projectCountRes[0]?.count || 0),
          followStatus,
          isFollowing,
          followsMe,
          notificationPreference
        };
        if (targetUser.isMinor && currentUserId !== targetUser.id && !isFollowing) {
          responseData.location = null;
          responseData.website = null;
          responseData.isScreenshotProtected = true;
        }
        responseData.mutualFollowers = [];
        responseData.mutualFollowersCount = 0;
        if (currentUserId && currentUserId !== targetUser.id) {
          const myFollowing = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm15.eq)(follows.followerId, currentUserId));
          const myFollowingIds = myFollowing.map((f) => f.followingId);
          if (myFollowingIds.length > 0) {
            const mutuals = await db.select({
              id: users.id,
              username: users.username,
              avatarUrl: profiles.avatarUrl,
              displayName: profiles.displayName
            }).from(follows).innerJoin(users, (0, import_drizzle_orm15.eq)(users.id, follows.followerId)).leftJoin(profiles, (0, import_drizzle_orm15.eq)(profiles.userId, users.id)).where(
              (0, import_drizzle_orm15.and)(
                (0, import_drizzle_orm15.eq)(follows.followingId, targetUser.id),
                (0, import_drizzle_orm15.inArray)(follows.followerId, myFollowingIds)
              )
            ).limit(3);
            const mutualsCountRes = await db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(follows).where(
              (0, import_drizzle_orm15.and)(
                (0, import_drizzle_orm15.eq)(follows.followingId, targetUser.id),
                (0, import_drizzle_orm15.inArray)(follows.followerId, myFollowingIds)
              )
            );
            responseData.mutualFollowers = mutuals;
            responseData.mutualFollowersCount = Number(mutualsCountRes[0]?.count || 0);
          }
        }
        res.json({ success: true, data: responseData });
      } catch (error) {
        console.error("usersRouter.get(/:username) error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.patch("/me", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
          return;
        }
        const [currentUserRec] = await db.select({ isMinor: users.isMinor }).from(users).where((0, import_drizzle_orm15.eq)(users.id, currentUserId)).limit(1);
        if (currentUserRec?.isMinor) {
          if (parsed.data.isPrivate === false) {
            return res.status(403).json({
              success: false,
              error: { code: "CHILD_PROTECTION_RESTRICTION", message: "10 Ekim 2026 Y\xF6netmeli\u011Fi gere\u011Fince \xE7ocuk hesaplar\u0131n\u0131n gizlilik modu kapat\u0131lamaz." }
            });
          }
          if (parsed.data.allowSearchEngineIndexing === true) {
            return res.status(403).json({
              success: false,
              error: { code: "CHILD_PROTECTION_RESTRICTION", message: "10 Ekim 2026 Y\xF6netmeli\u011Fi gere\u011Fince \xE7ocuk hesaplar\u0131 arama motoru dizinlerine a\xE7\u0131lamaz." }
            });
          }
          if (parsed.data.messagePreference === "ANYONE") {
            return res.status(403).json({
              success: false,
              error: { code: "CHILD_PROTECTION_RESTRICTION", message: "\xC7ocuk hesaplar\u0131 yabanc\u0131lardan do\u011Frudan mesaj kabul edecek \u015Fekilde ayarlanamaz." }
            });
          }
          if (parsed.data.defaultPostVisibility === "PUBLIC") {
            return res.status(403).json({
              success: false,
              error: { code: "CHILD_PROTECTION_RESTRICTION", message: "\xC7ocuk hesaplar\u0131n\u0131n g\xF6nderi g\xF6r\xFCn\xFCrl\xFC\u011F\xFC herkese a\xE7\u0131k yap\u0131lamaz." }
            });
          }
        }
        if (parsed.data.bio) {
          const modResult = await moderateContent(parsed.data.bio);
          if (modResult.riskLevel === "HIGH_RISK" || modResult.riskLevel === "MEDIUM_RISK") {
            await db.insert(moderationLogs).values({
              entityType: "PROFILE",
              entityId: currentUserId,
              userId: currentUserId,
              status: "RESOLVED",
              actionTaken: "REJECTED",
              riskLevel: modResult.riskLevel,
              category: modResult.category,
              reason: modResult.reason || null
            });
            res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Biyografiniz topluluk kurallar\u0131na ayk\u0131r\u0131 oldu\u011Fu i\xE7in g\xFCncellenemedi." } });
            return;
          }
        }
        await db.update(profiles).set({ ...parsed.data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm15.eq)(profiles.userId, currentUserId));
        res.json({ success: true, data: { message: "Profil g\xFCncellendi." } });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.put("/me/password", requireAuth, authRateLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        }
        const { currentPassword, newPassword } = parsed.data;
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.id, currentUserId)).limit(1);
        if (userRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
        const isPasswordValid = await import_argon23.default.verify(userRecord[0].passwordHash, currentPassword);
        if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Mevcut \u015Fifre hatal\u0131." } });
        const newHash = await import_argon23.default.hash(newPassword);
        await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm15.eq)(users.id, currentUserId));
        await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm15.eq)(refreshTokens.userId, currentUserId));
        sendSecurityAlertEmail(userRecord[0].email, userRecord[0].username, "\u015Eifre De\u011Fi\u015Fikli\u011Fi", (/* @__PURE__ */ new Date()).toLocaleString("tr-TR")).catch(console.error);
        res.json({ success: true, data: { message: "\u015Eifre ba\u015Far\u0131yla g\xFCncellendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.put("/me/email", requireAuth, authRateLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = changeEmailSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        }
        const { email, password } = parsed.data;
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.id, currentUserId)).limit(1);
        const isPasswordValid = await import_argon23.default.verify(userRecord[0].passwordHash, password);
        if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "\u015Eifre hatal\u0131." } });
        const existingEmail = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.email, email)).limit(1);
        if (existingEmail.length > 0 && existingEmail[0].id !== currentUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu e-posta adresi zaten kullan\u0131l\u0131yor." } });
        }
        await db.update(users).set({ email, emailVerified: false, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm15.eq)(users.id, currentUserId));
        const emailToken = generateEmailToken(currentUserId, "verify_email");
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        sendVerificationEmail(email, userRecord[0].username, `${frontendUrl}/verify-email?token=${emailToken}`).catch(console.error);
        res.json({ success: true, data: { message: "E-posta ba\u015Far\u0131yla g\xFCncellendi. L\xFCtfen yeni adresinizi do\u011Frulay\u0131n." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.post("/me/delete", requireAuth, authRateLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = deleteAccountSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        }
        const { password } = parsed.data;
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.id, currentUserId)).limit(1);
        const isPasswordValid = await import_argon23.default.verify(userRecord[0].passwordHash, password);
        if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "\u015Eifre hatal\u0131." } });
        if (userRecord[0].twoFactorEnabled) {
          const code = req.body.code;
          if (!code) {
            return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "\u0130ki fakt\xF6rl\xFC do\u011Frulama kodu gerekli." } });
          }
          try {
            const secret = decryptString(userRecord[0].twoFactorSecret);
            const isValid = import_otplib2.authenticator.verify({ token: code, secret });
            if (!isValid) {
              return res.status(400).json({ success: false, error: { code: "INVALID_CODE", message: "Do\u011Frulama kodu hatal\u0131." } });
            }
          } catch (e) {
            return res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "G\xFCvenlik ayarlar\u0131 okunamad\u0131." } });
          }
        }
        const userProfile = await db.select({ avatarUrl: profiles.avatarUrl, coverUrl: profiles.coverUrl }).from(profiles).where((0, import_drizzle_orm15.eq)(profiles.userId, currentUserId)).limit(1);
        const userPosts = await db.select({ id: posts.id }).from(posts).where((0, import_drizzle_orm15.eq)(posts.userId, currentUserId));
        const postIds = userPosts.map((p) => p.id);
        let allMediaUrls = [];
        if (userProfile.length > 0) {
          if (userProfile[0].avatarUrl) allMediaUrls.push(userProfile[0].avatarUrl);
          if (userProfile[0].coverUrl) allMediaUrls.push(userProfile[0].coverUrl);
        }
        if (postIds.length > 0) {
          const pm = await db.select({ mediaUrl: postMedia.mediaUrl }).from(postMedia).where((0, import_drizzle_orm15.inArray)(postMedia.postId, postIds));
          allMediaUrls.push(...pm.map((m) => m.mediaUrl));
        }
        allMediaUrls.forEach((url) => {
          try {
            if (!url || !url.startsWith("/uploads/") || url.includes("..")) return;
            const filePath = import_path4.default.join(process.cwd(), url);
            if (import_fs3.default.existsSync(filePath)) import_fs3.default.unlinkSync(filePath);
          } catch (e) {
            console.error("File deletion failed:", e);
          }
        });
        await db.delete(users).where((0, import_drizzle_orm15.eq)(users.id, currentUserId));
        res.clearCookie("refreshToken");
        res.json({ success: true, data: { message: "Hesab\u0131n\u0131z ba\u015Far\u0131yla silindi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.post("/:id/block", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(targetUserId) || targetUserId === currentUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz kullan\u0131c\u0131." } });
        }
        await db.insert(blocks).values({
          blockerId: currentUserId,
          blockedId: targetUserId
        }).onConflictDoNothing();
        await db.delete(follows).where(
          (0, import_drizzle_orm15.or)(
            (0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm15.eq)(follows.followingId, targetUserId)),
            (0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followerId, targetUserId), (0, import_drizzle_orm15.eq)(follows.followingId, currentUserId))
          )
        );
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.delete("/:id/block", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(targetUserId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz kullan\u0131c\u0131." } });
        }
        await db.delete(blocks).where(
          (0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm15.eq)(blocks.blockedId, targetUserId))
        );
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.put("/:id/follow-preference", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const { preference } = req.body;
        if (isNaN(targetUserId) || !["none", "standard", "all"].includes(preference)) {
          return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz istek." } });
        }
        const result = await db.update(follows).set({ notificationPreference: preference }).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm15.eq)(follows.followingId, targetUserId)));
        if (result.rowCount === 0) {
          return res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 takip edilmiyor." } });
        }
        res.json({ success: true, message: "Bildirim tercihi g\xFCncellendi." });
      } catch (error) {
        console.error("Follow preference error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.get("/me/notification-preferences", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const prefs = await db.select().from(notificationPreferences).where((0, import_drizzle_orm15.eq)(notificationPreferences.userId, currentUserId)).limit(1);
        if (prefs.length === 0) {
          return res.json({
            success: true,
            data: {
              pushEnabled: true,
              emailEnabled: true,
              likes: true,
              comments: true,
              mentions: true,
              follows: true,
              messages: true,
              newsletters: false
            }
          });
        }
        res.json({ success: true, data: prefs[0] });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    usersRouter.put("/me/notification-preferences", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const { pushEnabled, emailEnabled, likes: likes3, comments: comments2, mentions, follows: follows2, messages: messages2, newsletters } = req.body;
        const [updated] = await db.insert(notificationPreferences).values({
          userId: currentUserId,
          pushEnabled: pushEnabled ?? true,
          emailEnabled: emailEnabled ?? true,
          likes: likes3 ?? true,
          comments: comments2 ?? true,
          mentions: mentions ?? true,
          follows: follows2 ?? true,
          messages: messages2 ?? true,
          newsletters: newsletters ?? false
        }).onConflictDoUpdate({
          target: notificationPreferences.userId,
          set: {
            pushEnabled: pushEnabled ?? true,
            emailEnabled: emailEnabled ?? true,
            likes: likes3 ?? true,
            comments: comments2 ?? true,
            mentions: mentions ?? true,
            follows: follows2 ?? true,
            messages: messages2 ?? true,
            newsletters: newsletters ?? false
          }
        }).returning();
        res.json({ success: true, data: updated });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/utils/hashtags.ts
function extractHashtags(text2) {
  if (!text2) return [];
  const regex = /#([\p{L}\p{N}\p{M}_]+)/gu;
  const matches = [...text2.matchAll(regex)];
  const tags = matches.map((m) => m[1]);
  const uniqueTags = [...new Set(tags)];
  return uniqueTags.slice(0, 20).filter((t) => t.length <= 50);
}
function normalizeHashtag(tag) {
  return tag.toLocaleLowerCase("tr-TR");
}
var init_hashtags = __esm({
  "server/utils/hashtags.ts"() {
    "use strict";
  }
});

// server/utils/mentions.ts
function extractMentions(text2) {
  if (!text2) return [];
  const regex = /(?<![a-zA-Z0-9_])@([a-zA-Z0-9_]{3,30})(?![a-zA-Z0-9_])/g;
  const matches = [...text2.matchAll(regex)];
  const mentions = matches.map((m) => m[1]);
  const uniqueMentions = [...new Set(mentions)];
  return uniqueMentions.slice(0, 10);
}
var init_mentions = __esm({
  "server/utils/mentions.ts"() {
    "use strict";
  }
});

// server/utils/visibility.ts
async function verifyPostAccess(postId, currentUserId) {
  const postRecord = await db.select({
    userId: posts.userId,
    visibility: posts.visibility
  }).from(posts).where((0, import_drizzle_orm16.eq)(posts.id, postId)).limit(1);
  if (postRecord.length === 0) return false;
  const post = postRecord[0];
  if (post.userId === currentUserId) return true;
  const blockedIds = currentUserId ? await getBlockedIds(currentUserId) : [];
  if (blockedIds.includes(post.userId)) return false;
  if (post.visibility === "PRIVATE") return false;
  const profileRecord = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where((0, import_drizzle_orm16.eq)(profiles.userId, post.userId)).limit(1);
  const isPrivateProfile = profileRecord.length > 0 ? profileRecord[0].isPrivate : false;
  if (post.visibility === "FOLLOWERS" || isPrivateProfile) {
    if (!currentUserId) return false;
    const follow = await db.select().from(follows).where(
      (0, import_drizzle_orm16.and)(
        (0, import_drizzle_orm16.eq)(follows.followerId, currentUserId),
        (0, import_drizzle_orm16.eq)(follows.followingId, post.userId),
        (0, import_drizzle_orm16.eq)(follows.status, "accepted")
      )
    ).limit(1);
    if (follow.length === 0) return false;
  }
  return true;
}
var import_drizzle_orm16;
var init_visibility = __esm({
  "server/utils/visibility.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm16 = require("drizzle-orm");
    init_blocks();
  }
});

// server/routes/posts.ts
var posts_exports = {};
__export(posts_exports, {
  postsRouter: () => postsRouter
});
var import_express9, import_drizzle_orm17, import_fs4, import_path5, postsRouter;
var init_posts = __esm({
  "server/routes/posts.ts"() {
    "use strict";
    import_express9 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm17 = require("drizzle-orm");
    init_hashtags();
    init_mentions();
    init_schema();
    init_auth();
    init_api();
    init_moderation();
    init_schema();
    init_notifications();
    init_blocks();
    init_visibility();
    init_rateLimiter();
    import_fs4 = __toESM(require("fs"), 1);
    import_path5 = __toESM(require("path"), 1);
    postsRouter = (0, import_express9.Router)();
    postsRouter.post("/:id/poll/vote", requireAuth, strictLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const { optionId } = req.body;
        if (!optionId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "optionId gereklidir." } });
        }
        const postRecord = await db.select({ postType: posts.postType }).from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0 || postRecord[0].postType !== "POLL") {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Anket bulunamad\u0131." } });
        }
        const optionRecord = await db.select().from(pollOptions).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(pollOptions.id, optionId), (0, import_drizzle_orm17.eq)(pollOptions.postId, postId))).limit(1);
        if (optionRecord.length === 0) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz se\xE7enek." } });
        }
        try {
          await db.insert(pollVotes).values({
            postId,
            optionId,
            userId: currentUserId
          });
          return res.json({ success: true, data: { message: "Oy kullan\u0131ld\u0131." } });
        } catch (dbError) {
          if (dbError.code === "23505") {
            return res.status(400).json({ success: false, error: { code: "ALREADY_VOTED", message: "Bu ankette zaten oy kulland\u0131n\u0131z." } });
          }
          throw dbError;
        }
      } catch (error) {
        console.error("Poll vote error:", error);
        res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.get("/:id", optionalAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = optionalAuthContext(req);
        const blockedIds = await getBlockedIds(currentUserId);
        const postRecord = await db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          quotedPostId: posts.quotedPostId,
          userId: posts.userId,
          // We need this to check owner
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
            allowSearchEngineIndexing: profiles.allowSearchEngineIndexing
          }
        }).from(posts).innerJoin(users, (0, import_drizzle_orm17.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm17.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm17.and)(
          (0, import_drizzle_orm17.eq)(posts.id, postId),
          (0, import_drizzle_orm17.or)(
            (0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"),
            currentUserId ? (0, import_drizzle_orm17.eq)(posts.userId, currentUserId) : import_drizzle_orm17.sql`false`
          )
        )).limit(1);
        if (postRecord.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        }
        const post = postRecord[0];
        if (!await verifyPostAccess(postId, currentUserId)) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        }
        let pollData = void 0;
        if (post.postType === "POLL") {
          const options = await db.select().from(pollOptions).where((0, import_drizzle_orm17.eq)(pollOptions.postId, postId)).orderBy(pollOptions.order);
          const votes = await db.select().from(pollVotes).where((0, import_drizzle_orm17.eq)(pollVotes.postId, postId));
          const totalVotes = votes.length;
          const enrichedOptions = options.map((opt) => {
            const optionVotes = votes.filter((v) => v.optionId === opt.id).length;
            const percentage = totalVotes > 0 ? optionVotes / totalVotes * 100 : 0;
            return {
              ...opt,
              voteCount: optionVotes,
              percentage: Math.round(percentage)
            };
          });
          const userVote = currentUserId && currentUserId > 0 ? votes.find((v) => v.userId === currentUserId)?.optionId : null;
          pollData = {
            options: enrichedOptions,
            totalVotes,
            userVotedOptionId: userVote
          };
        }
        const media = await db.select().from(postMedia).where((0, import_drizzle_orm17.eq)(postMedia.postId, postId));
        const repostRecords = await db.select().from(reposts).where((0, import_drizzle_orm17.eq)(reposts.postId, postId));
        const repostCount = repostRecords.length;
        const isReposted = repostRecords.some((r) => r.userId === currentUserId);
        (async () => {
          try {
            await db.update(posts).set({ viewCount: import_drizzle_orm17.sql`${posts.viewCount} + 1` }).where((0, import_drizzle_orm17.eq)(posts.id, postId));
            if (currentUserId) {
              await db.insert(postViews).values({
                postId,
                userId: currentUserId,
                viewedAt: /* @__PURE__ */ new Date()
              }).catch(() => {
              });
            }
          } catch (err) {
          }
        })();
        res.json({ success: true, data: { ...post, viewCount: (post.viewCount || 0) + 1, media, repostCount, isReposted, pollData } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.post("/", requireAuth, strictLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = createPostSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        }
        const { content, visibility, media, communityId } = parsed.data;
        if (communityId) {
          const communityRecord = await db.select().from(communities).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(communities.id, communityId), (0, import_drizzle_orm17.isNull)(communities.deletedAt))).limit(1);
          if (communityRecord.length === 0) {
            return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
          }
          const memberRecord = await db.select().from(communityMembers).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm17.eq)(communityMembers.userId, currentUserId))).limit(1);
          if (memberRecord.length === 0 && communityRecord[0].ownerId !== currentUserId) {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu toplulu\u011Fa g\xF6nderi payla\u015Fmak i\xE7in \xFCye olmal\u0131s\u0131n\u0131z." } });
          }
        }
        let finalVisibility = visibility;
        if (!finalVisibility) {
          const p = await db.select({ defaultPostVisibility: profiles.defaultPostVisibility }).from(profiles).where((0, import_drizzle_orm17.eq)(profiles.userId, currentUserId)).limit(1);
          finalVisibility = p.length > 0 ? p[0].defaultPostVisibility : "PUBLIC";
        }
        const [authorRec] = await db.select({ isMinor: users.isMinor }).from(users).where((0, import_drizzle_orm17.eq)(users.id, currentUserId)).limit(1);
        if (authorRec?.isMinor && finalVisibility === "PUBLIC") {
          finalVisibility = "FOLLOWERS";
        }
        const modResult = await moderateContent(content || "");
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        let returnedError = null;
        if (parsed.data.quotedPostId) {
          if (!await verifyPostAccess(parsed.data.quotedPostId, currentUserId)) {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\xE7eri\u011Fi al\u0131nt\u0131lamaya yetkiniz yok." } });
          }
        }
        const result = await db.transaction(async (tx) => {
          const [newPost] = await tx.insert(posts).values({
            userId: currentUserId,
            content: content || null,
            visibility: finalVisibility,
            postType: parsed.data.postType,
            contentWarning: parsed.data.contentWarning || null,
            quotedPostId: parsed.data.quotedPostId || null,
            moderationStatus: modStatus
          }).returning();
          if (modStatus !== "APPROVED") {
            await tx.insert(moderationLogs).values({
              entityType: "POST",
              entityId: newPost.id,
              userId: currentUserId,
              status: modStatus === "PENDING" ? "PENDING" : "RESOLVED",
              actionTaken: modStatus === "REJECTED" ? "REJECTED" : null,
              riskLevel: modResult.riskLevel,
              category: modResult.category,
              reason: modResult.reason || null
            });
          }
          if (modStatus === "REJECTED") {
            returnedError = { code: "POLICY_VIOLATION", message: "\u0130\xE7eri\u011Finiz topluluk kurallar\u0131na uygun olmad\u0131\u011F\u0131 i\xE7in yay\u0131nlanamad\u0131." };
            return null;
          }
          if (parsed.data.postType === "POLL" && parsed.data.pollOptions) {
            const optionsToInsert = parsed.data.pollOptions.map((text2, i) => ({
              postId: newPost.id,
              text: text2,
              order: i
            }));
            await tx.insert(pollOptions).values(optionsToInsert);
          }
          const extractedMentions = extractMentions(content);
          if (extractedMentions.length > 0) {
            const mentionedUsers = await tx.select({
              id: users.id,
              username: users.username,
              mentionPreference: profiles.mentionPreference
            }).from(users).leftJoin(profiles, (0, import_drizzle_orm17.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm17.inArray)(users.username, extractedMentions));
            for (const mUser of mentionedUsers) {
              if (mUser.id !== currentUserId) {
                let canMention = true;
                if (mUser.mentionPreference === "NONE") {
                  canMention = false;
                } else if (mUser.mentionPreference === "FOLLOWERS") {
                  const isFollowedByTarget = await tx.select().from(follows).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(follows.followerId, mUser.id), (0, import_drizzle_orm17.eq)(follows.followingId, currentUserId))).limit(1);
                  if (isFollowedByTarget.length === 0) {
                    canMention = false;
                  }
                }
                if (canMention) {
                  await tx.insert(postMentions).values({
                    postId: newPost.id,
                    mentionedUserId: mUser.id,
                    actorUserId: currentUserId
                  }).onConflictDoNothing();
                  if (modStatus === "APPROVED") {
                    await notify(currentUserId, mUser.id, "mention", newPost.id);
                  }
                }
              }
            }
          }
          const extractedTags = extractHashtags(content);
          if (extractedTags.length > 0) {
            for (const tag of extractedTags) {
              const normalized = normalizeHashtag(tag);
              const [insertedTag] = await tx.insert(hashtags).values({ name: tag, normalizedName: normalized, usageCount: 1 }).onConflictDoUpdate({
                target: hashtags.normalizedName,
                set: { usageCount: import_drizzle_orm17.sql`${hashtags.usageCount} + 1` }
              }).returning();
              await tx.insert(postHashtags).values({
                postId: newPost.id,
                hashtagId: insertedTag.id
              }).onConflictDoNothing();
            }
          }
          if (parsed.data.collaboratorId) {
            const targetUserId = parsed.data.collaboratorId;
            if (targetUserId !== currentUserId) {
              const blockedIds = await getBlockedIds(currentUserId);
              if (!blockedIds.includes(targetUserId)) {
                await tx.insert(postCollaborators).values({
                  postId: newPost.id,
                  userId: targetUserId,
                  status: "pending"
                });
                if (modStatus === "APPROVED") {
                  await notify(currentUserId, targetUserId, "post_collaborator_invite", newPost.id);
                }
              }
            }
          }
          if (media && media.length > 0) {
            await tx.insert(postMedia).values(
              media.map((m, i) => ({
                postId: newPost.id,
                mediaUrl: m.url,
                mediaType: m.type,
                width: typeof m.width === "number" ? m.width : null,
                height: typeof m.height === "number" ? m.height : null,
                duration: typeof m.duration === "number" ? m.duration : null,
                sortOrder: i
              }))
            );
          }
          let pPollOptions = void 0;
          if (parsed.data.postType === "POLL" && parsed.data.pollOptions) {
            const optionsWithVotes = parsed.data.pollOptions.map((opt, i) => ({
              id: -i,
              // temp id for optimistic UI
              text: opt,
              order: i,
              voteCount: 0
            }));
            pPollOptions = {
              options: optionsWithVotes,
              totalVotes: 0,
              userVotedOptionId: null
            };
          }
          const postWithRelations = {
            ...newPost,
            pollData: pPollOptions,
            user: {
              id: requireAuthContext(req),
              username: req.user.username
            },
            repostCount: 0,
            isReposted: false,
            likeCount: 0,
            isLiked: false,
            commentCount: 0,
            isSaved: false,
            media: media || []
          };
          return postWithRelations;
        });
        if (returnedError) {
          return res.status(403).json({ success: false, error: returnedError });
        }
        (async () => {
          try {
            const { users: users5, follows: follows2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
            const { notify: notify2 } = await Promise.resolve().then(() => (init_notifications(), notifications_exports));
            const author = await db.select({
              isOfficialAccount: users5.isOfficialAccount,
              officialNotifyEnabled: users5.officialNotifyEnabled
            }).from(users5).where((0, import_drizzle_orm17.eq)(users5.id, currentUserId)).limit(1);
            if (author.length > 0 && author[0].isOfficialAccount && author[0].officialNotifyEnabled) {
              const followers = await db.select({ followerId: follows2.followerId, preference: follows2.notificationPreference }).from(follows2).where((0, import_drizzle_orm17.eq)(follows2.followingId, currentUserId));
              const { notifications: notifications4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
              const notifsToInsert = followers.filter((f) => f.preference !== "none").map((f) => ({
                recipientId: f.followerId,
                actorId: currentUserId,
                type: "post",
                postId: result.id,
                isRead: false
              }));
              if (notifsToInsert.length > 0) {
                const chunkSize = 1e3;
                for (let i = 0; i < notifsToInsert.length; i += chunkSize) {
                  await db.insert(notifications4).values(notifsToInsert.slice(i, i + chunkSize)).onConflictDoNothing();
                }
              }
            }
          } catch (err) {
            console.error("Failed to generate official notifications:", err);
          }
        })();
        res.status(201).json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.patch("/:id", requireAuth, strictLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const { content: postContent } = req.body;
        if (typeof postContent !== "string") {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz i\xE7erik." } });
        }
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        if (postRecord[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz i\u015Flem." } });
        const modResult = await moderateContent(postContent);
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        await db.update(posts).set({ content: postContent, moderationStatus: modStatus, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
        if (modStatus !== "APPROVED") {
          await db.insert(moderationLogs).values({
            entityType: "POST",
            entityId: postId,
            userId: currentUserId,
            status: modStatus === "PENDING" ? "PENDING" : "RESOLVED",
            actionTaken: modStatus === "REJECTED" ? "REJECTED" : null,
            riskLevel: modResult.riskLevel,
            category: modResult.category,
            reason: modResult.reason || null
          });
        }
        if (modStatus === "REJECTED") {
          return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "\u0130\xE7eri\u011Finiz topluluk kurallar\u0131na uygun olmad\u0131\u011F\u0131 i\xE7in g\xFCncellenemedi." } });
        }
        res.json({ success: true, data: { message: "G\xF6nderi g\xFCncellendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.delete("/:id", requireAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        if (postRecord[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz i\u015Flem." } });
        const postTags = await db.select().from(postHashtags).where((0, import_drizzle_orm17.eq)(postHashtags.postId, postId));
        if (postTags.length > 0) {
          const tagIds = postTags.map((pt) => pt.hashtagId);
          await db.update(hashtags).set({ usageCount: import_drizzle_orm17.sql`${hashtags.usageCount} - 1` }).where((0, import_drizzle_orm17.inArray)(hashtags.id, tagIds));
        }
        const media = await db.select().from(postMedia).where((0, import_drizzle_orm17.eq)(postMedia.postId, postId));
        media.forEach((m) => {
          try {
            if (!m.mediaUrl || !m.mediaUrl.startsWith("/uploads/") || m.mediaUrl.includes("..")) {
              return;
            }
            const filePath = import_path5.default.join(process.cwd(), m.mediaUrl);
            if (import_fs4.default.existsSync(filePath)) import_fs4.default.unlinkSync(filePath);
          } catch (e) {
            console.error("File deletion failed:", e);
          }
        });
        await db.delete(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
        res.json({ success: true, data: { message: "G\xF6nderi silindi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.post("/:id/like", requireAuth, standardLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        let wasLiked = false;
        try {
          await db.transaction(async (tx) => {
            const existing = await tx.select().from(likes).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(likes.postId, postId), (0, import_drizzle_orm17.eq)(likes.userId, currentUserId))).limit(1);
            if (existing.length === 0) {
              await tx.insert(likes).values({ postId, userId: currentUserId });
              await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} + 1, 0)` }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
              wasLiked = true;
            }
          });
        } catch (e) {
          if (e.code !== "23505") throw e;
        }
        if (wasLiked) {
          await notify(currentUserId, postRecord[0].userId, "like", postId);
        }
        res.json({ success: true, data: { message: "Be\u011Fenildi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.delete("/:id/like", requireAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.eq)(posts.id, postId)).limit(1);
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(likes).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(likes.postId, postId), (0, import_drizzle_orm17.eq)(likes.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(likes).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(likes.postId, postId), (0, import_drizzle_orm17.eq)(likes.userId, currentUserId)));
            if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
              await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} - 1, 0)` }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
            }
          }
        });
        res.json({ success: true, data: { message: "Be\u011Feni kald\u0131r\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.post("/:id/comments", requireAuth, strictLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const parsed = createCommentSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        const modResult = await moderateContent(parsed.data.content);
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        let returnedError = null;
        const comment = await db.transaction(async (tx) => {
          const [newComment] = await tx.insert(comments).values({
            postId,
            userId: currentUserId,
            content: parsed.data.content,
            parentId: parsed.data.parentId,
            moderationStatus: modStatus
          }).returning();
          if (modStatus !== "APPROVED") {
            await tx.insert(moderationLogs).values({
              entityType: "COMMENT",
              entityId: newComment.id,
              userId: currentUserId,
              status: modStatus === "PENDING" ? "PENDING" : "RESOLVED",
              actionTaken: modStatus === "REJECTED" ? "REJECTED" : null,
              riskLevel: modResult.riskLevel,
              category: modResult.category,
              reason: modResult.reason || null
            });
          }
          if (modStatus === "REJECTED") {
            returnedError = { code: "POLICY_VIOLATION", message: "Bu i\xE7erik topluluk kurallar\u0131m\u0131zla uyumlu olmad\u0131\u011F\u0131 i\xE7in yay\u0131nlanamad\u0131." };
            return null;
          }
          const extractedMentions = extractMentions(parsed.data.content);
          if (extractedMentions.length > 0) {
            const mentionedUsers = await tx.select({
              id: users.id,
              username: users.username,
              mentionPreference: profiles.mentionPreference
            }).from(users).leftJoin(profiles, (0, import_drizzle_orm17.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm17.inArray)(users.username, extractedMentions));
            for (const mUser of mentionedUsers) {
              if (mUser.id !== currentUserId) {
                let canMention = true;
                if (mUser.mentionPreference === "NONE") {
                  canMention = false;
                } else if (mUser.mentionPreference === "FOLLOWERS") {
                  const isFollowedByTarget = await tx.select().from(follows).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(follows.followerId, mUser.id), (0, import_drizzle_orm17.eq)(follows.followingId, currentUserId))).limit(1);
                  if (isFollowedByTarget.length === 0) {
                    canMention = false;
                  }
                }
                if (canMention) {
                  await tx.insert(commentMentions).values({
                    commentId: newComment.id,
                    mentionedUserId: mUser.id,
                    actorUserId: currentUserId
                  }).onConflictDoNothing();
                  if (modStatus === "APPROVED") {
                    await notify(currentUserId, mUser.id, "mention", postId, newComment.id);
                  }
                }
              }
            }
          }
          if (postRecord[0].userId !== currentUserId) {
            await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} + 3, 0)` }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
          }
          const userProfile = await tx.select({ username: users.username, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl }).from(users).leftJoin(profiles, (0, import_drizzle_orm17.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm17.eq)(users.id, currentUserId)).limit(1);
          return { ...newComment, user: userProfile[0] };
        });
        if (returnedError) {
          return res.status(403).json({ success: false, error: returnedError });
        }
        if (modStatus === "APPROVED") {
          await notify(currentUserId, postRecord[0].userId, "comment", postId, comment.id);
          if (parsed.data.parentId) {
            const parentRecord = await db.select().from(comments).where((0, import_drizzle_orm17.eq)(comments.id, parsed.data.parentId)).limit(1);
            if (parentRecord.length > 0) {
              await notify(currentUserId, parentRecord[0].userId, "comment_reply", postId, comment.id);
            }
          }
        }
        res.status(201).json({ success: true, data: comment });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.patch("/comments/:id", requireAuth, strictLimiter, async (req, res) => {
      try {
        const commentId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const { content: commentContent } = req.body;
        if (typeof commentContent !== "string" || commentContent.trim().length === 0) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz yorum i\xE7eri\u011Fi." } });
        }
        const c = await db.select().from(comments).where((0, import_drizzle_orm17.eq)(comments.id, commentId)).limit(1);
        if (c.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Yorum bulunamad\u0131." } });
        if (c[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        const modResult = await moderateContent(commentContent);
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        await db.update(comments).set({ content: commentContent, moderationStatus: modStatus, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm17.eq)(comments.id, commentId));
        if (modStatus !== "APPROVED") {
          await db.insert(moderationLogs).values({
            entityType: "COMMENT",
            entityId: commentId,
            userId: currentUserId,
            status: modStatus === "PENDING" ? "PENDING" : "RESOLVED",
            actionTaken: modStatus === "REJECTED" ? "REJECTED" : null,
            riskLevel: modResult.riskLevel,
            category: modResult.category,
            reason: modResult.reason || null
          });
        }
        if (modStatus === "REJECTED") {
          return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "\u0130\xE7eri\u011Finiz topluluk kurallar\u0131na uygun olmad\u0131\u011F\u0131 i\xE7in g\xFCncellenemedi." } });
        }
        res.json({ success: true, data: { message: "Yorum g\xFCncellendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.delete("/comments/:id", requireAuth, async (req, res) => {
      try {
        const commentId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const c = await db.select().from(comments).where((0, import_drizzle_orm17.eq)(comments.id, commentId)).limit(1);
        if (c.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Yorum bulunamad\u0131." } });
        if (c[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.eq)(posts.id, c[0].postId)).limit(1);
        await db.transaction(async (tx) => {
          await tx.delete(comments).where((0, import_drizzle_orm17.eq)(comments.id, commentId));
          if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
            await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} - 3, 0)` }).where((0, import_drizzle_orm17.eq)(posts.id, c[0].postId));
          }
        });
        res.json({ success: true, data: { message: "Yorum silindi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.post("/:id/bookmark", requireAuth, standardLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        try {
          await db.transaction(async (tx) => {
            const existing = await tx.select().from(bookmarks).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(bookmarks.postId, postId), (0, import_drizzle_orm17.eq)(bookmarks.userId, currentUserId))).limit(1);
            if (existing.length === 0) {
              await tx.insert(bookmarks).values({ postId, userId: currentUserId });
              if (postRecord[0].userId !== currentUserId) {
                await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} + 4, 0)` }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
              }
            }
          });
        } catch (e) {
          if (e.code !== "23505") throw e;
        }
        res.json({ success: true, data: { message: "Kaydedildi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.delete("/:id/bookmark", requireAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.eq)(posts.id, postId)).limit(1);
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(bookmarks).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(bookmarks.postId, postId), (0, import_drizzle_orm17.eq)(bookmarks.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(bookmarks).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(bookmarks.postId, postId), (0, import_drizzle_orm17.eq)(bookmarks.userId, currentUserId)));
            if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
              await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} - 4, 0)` }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
            }
          }
        });
        res.json({ success: true, data: { message: "Kaydedilenlerden \xE7\u0131kar\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.post("/:id/repost", requireAuth, standardLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        let wasReposted = false;
        try {
          await db.transaction(async (tx) => {
            const existing = await tx.select().from(reposts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(reposts.postId, postId), (0, import_drizzle_orm17.eq)(reposts.userId, currentUserId))).limit(1);
            if (existing.length === 0) {
              await tx.insert(reposts).values({ postId, userId: currentUserId });
              await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} + 4, 0)` }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
              wasReposted = true;
            }
          });
        } catch (e) {
          if (e.code !== "23505") throw e;
        }
        if (wasReposted && postRecord[0].userId !== currentUserId) {
          await notify(currentUserId, postRecord[0].userId, "repost", postId);
        }
        res.json({ success: true, data: { message: "Yeniden payla\u015F\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.delete("/:id/repost", requireAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm17.eq)(posts.id, postId)).limit(1);
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(reposts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(reposts.postId, postId), (0, import_drizzle_orm17.eq)(reposts.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(reposts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(reposts.postId, postId), (0, import_drizzle_orm17.eq)(reposts.userId, currentUserId)));
            if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
              await tx.update(posts).set({ baseScore: import_drizzle_orm17.sql`GREATEST(${posts.baseScore} - 4, 0)` }).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId))));
            }
          }
        });
        res.json({ success: true, data: { message: "Yeniden payla\u015F\u0131m kald\u0131r\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.post("/:id/collaborators", requireAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id, 10);
        const { targetUserId } = req.body;
        if (isNaN(postId) || typeof targetUserId !== "number") {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz veriler." } });
          return;
        }
        const currentUserId = requireAuthContext(req);
        if (targetUserId === currentUserId) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi ortak \xFCretici olarak ekleyemezsiniz." } });
          return;
        }
        const blockedIds = await getBlockedIds(currentUserId);
        if (blockedIds.includes(targetUserId)) {
          res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        const post = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (post.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
          return;
        }
        if (post[0].userId !== currentUserId) {
          res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        const target = await db.select().from(users).where((0, import_drizzle_orm17.eq)(users.id, targetUserId)).limit(1);
        if (target.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const existing = await db.select().from(postCollaborators).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(postCollaborators.postId, postId), (0, import_drizzle_orm17.eq)(postCollaborators.userId, targetUserId))).limit(1);
        if (existing.length > 0) {
          if (existing[0].status === "pending") {
            res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu kullan\u0131c\u0131ya zaten davet g\xF6nderilmi\u015F." } });
            return;
          } else if (existing[0].status === "accepted") {
            res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu kullan\u0131c\u0131 zaten ortak \xFCretici." } });
            return;
          } else {
            await db.update(postCollaborators).set({ status: "pending", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm17.eq)(postCollaborators.id, existing[0].id));
          }
        } else {
          await db.insert(postCollaborators).values({
            postId,
            userId: targetUserId,
            status: "pending"
          });
        }
        await notify(currentUserId, targetUserId, "post_collaborator_invite", postId);
        res.json({ success: true, message: "Davet g\xF6nderildi." });
      } catch (error) {
        console.error("Invite collaborator error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.delete("/:id/collaborators/:userId", requireAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id, 10);
        const targetUserId = parseInt(req.params.userId, 10);
        if (isNaN(postId) || isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz ID." } });
          return;
        }
        const currentUserId = requireAuthContext(req);
        const post = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(posts.id, postId), (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm17.eq)(posts.userId, currentUserId)))).limit(1);
        if (post.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
          return;
        }
        if (post[0].userId !== currentUserId && currentUserId !== targetUserId) {
          res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        await db.delete(postCollaborators).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(postCollaborators.postId, postId), (0, import_drizzle_orm17.eq)(postCollaborators.userId, targetUserId)));
        res.json({ success: true, message: "Ortak \xFCretici kald\u0131r\u0131ld\u0131." });
      } catch (error) {
        console.error("Remove collaborator error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.get("/:id/collaborators", optionalAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id, 10);
        if (isNaN(postId)) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz ID." } });
          return;
        }
        const currentUserId = optionalAuthContext(req);
        const postRecord = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm17.eq)(posts.id, postId)).limit(1);
        const isOwner = postRecord.length > 0 && postRecord[0].userId === currentUserId;
        const list = await db.select({
          userId: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          status: postCollaborators.status
        }).from(postCollaborators).innerJoin(users, (0, import_drizzle_orm17.eq)(postCollaborators.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm17.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm17.and)(
          (0, import_drizzle_orm17.eq)(postCollaborators.postId, postId),
          isOwner ? (0, import_drizzle_orm17.or)((0, import_drizzle_orm17.eq)(postCollaborators.status, "accepted"), (0, import_drizzle_orm17.eq)(postCollaborators.status, "pending")) : (0, import_drizzle_orm17.eq)(postCollaborators.status, "accepted")
        ));
        res.json({ success: true, data: list });
      } catch (error) {
        console.error("Get post collaborators error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/utils/postStats.ts
async function populatePostStats(postsList, currentUserId) {
  if (!postsList || postsList.length === 0) return postsList;
  const postIds = postsList.map((p) => p.id);
  const authorIds = Array.from(new Set(postsList.map((p) => Number(p.user?.id || p.userId)).filter((id) => !isNaN(id) && id > 0)));
  const viewerId = currentUserId !== null && currentUserId !== void 0 && !isNaN(Number(currentUserId)) ? Number(currentUserId) : -1;
  let allMedia = [];
  let repostStats = [];
  let likeStats = [];
  let bookmarkStats = [];
  let commentStats = [];
  let allCollabs = [];
  let allPollOptions = [];
  let allPollVotes = [];
  let followStats = [];
  if (postIds.length > 0) {
    [allMedia, repostStats, likeStats, bookmarkStats, commentStats, allCollabs, allPollOptions, allPollVotes] = await Promise.all([
      db.select().from(postMedia).where((0, import_drizzle_orm18.inArray)(postMedia.postId, postIds)),
      db.select({
        postId: reposts.postId,
        count: import_drizzle_orm18.sql`cast(count(*) as integer)`,
        isReposted: import_drizzle_orm18.sql`MAX(CASE WHEN ${reposts.userId} = ${viewerId} THEN 1 ELSE 0 END)`
      }).from(reposts).where((0, import_drizzle_orm18.inArray)(reposts.postId, postIds)).groupBy(reposts.postId),
      db.select({
        postId: reactions.postId,
        count: import_drizzle_orm18.sql`cast(count(*) as integer)`,
        myReaction: import_drizzle_orm18.sql`MAX(CASE WHEN ${reactions.userId} = ${viewerId} THEN ${reactions.type} ELSE NULL END)`
      }).from(reactions).where((0, import_drizzle_orm18.inArray)(reactions.postId, postIds)).groupBy(reactions.postId),
      db.select({
        postId: bookmarks.postId,
        isSaved: import_drizzle_orm18.sql`MAX(CASE WHEN ${bookmarks.userId} = ${viewerId} THEN 1 ELSE 0 END)`
      }).from(bookmarks).where((0, import_drizzle_orm18.inArray)(bookmarks.postId, postIds)).groupBy(bookmarks.postId),
      db.select({
        postId: comments.postId,
        count: import_drizzle_orm18.sql`cast(count(*) as integer)`
      }).from(comments).where((0, import_drizzle_orm18.inArray)(comments.postId, postIds)).groupBy(comments.postId),
      db.select({
        postId: postCollaborators.postId,
        userId: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      }).from(postCollaborators).innerJoin(users, (0, import_drizzle_orm18.eq)(postCollaborators.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm18.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm18.and)((0, import_drizzle_orm18.inArray)(postCollaborators.postId, postIds), (0, import_drizzle_orm18.eq)(postCollaborators.status, "accepted"))),
      db.select().from(pollOptions).where((0, import_drizzle_orm18.inArray)(pollOptions.postId, postIds)),
      db.select({
        optionId: pollVotes.optionId,
        postId: pollVotes.postId,
        count: import_drizzle_orm18.sql`cast(count(*) as integer)`,
        isVoted: import_drizzle_orm18.sql`MAX(CASE WHEN ${pollVotes.userId} = ${viewerId} THEN 1 ELSE 0 END)`
      }).from(pollVotes).where((0, import_drizzle_orm18.inArray)(pollVotes.postId, postIds)).groupBy(pollVotes.optionId, pollVotes.postId)
    ]);
  }
  if (viewerId !== -1 && authorIds.length > 0) {
    followStats = await db.select({
      followerId: follows.followerId,
      followingId: follows.followingId,
      status: follows.status
    }).from(follows).where(
      (0, import_drizzle_orm18.or)(
        (0, import_drizzle_orm18.and)((0, import_drizzle_orm18.eq)(follows.followerId, viewerId), (0, import_drizzle_orm18.inArray)(follows.followingId, authorIds)),
        (0, import_drizzle_orm18.and)((0, import_drizzle_orm18.eq)(follows.followingId, viewerId), (0, import_drizzle_orm18.inArray)(follows.followerId, authorIds))
      )
    );
  }
  const quotedPostIds = Array.from(new Set(postsList.map((p) => p.quotedPostId).filter(Boolean)));
  let quotedPostsMap = /* @__PURE__ */ new Map();
  if (quotedPostIds.length > 0) {
    const quotedPostsData = await db.select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      }
    }).from(posts).innerJoin(users, (0, import_drizzle_orm18.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm18.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm18.inArray)(posts.id, quotedPostIds));
    const quotedMedia = await db.select().from(postMedia).where((0, import_drizzle_orm18.inArray)(postMedia.postId, quotedPostIds));
    const qMediaMap = /* @__PURE__ */ new Map();
    quotedMedia.forEach((m) => {
      if (!qMediaMap.has(m.postId)) qMediaMap.set(m.postId, []);
      qMediaMap.get(m.postId).push(m);
    });
    quotedPostsData.forEach((qp) => {
      quotedPostsMap.set(qp.id, {
        ...qp,
        media: (qMediaMap.get(qp.id) || []).sort((a, b) => a.sortOrder - b.sortOrder)
      });
    });
  }
  const isFollowingMap = /* @__PURE__ */ new Map();
  const followStatusMap = /* @__PURE__ */ new Map();
  const followsMeMap = /* @__PURE__ */ new Map();
  followStats.forEach((f) => {
    const fFollower = Number(f.followerId);
    const fFollowing = Number(f.followingId);
    if (fFollower === viewerId) {
      isFollowingMap.set(fFollowing, f.status === "accepted");
      followStatusMap.set(fFollowing, f.status);
    }
    if (fFollowing === viewerId && f.status === "accepted") {
      followsMeMap.set(fFollower, true);
    }
  });
  const repostsMap = new Map(repostStats.map((s) => [s.postId, { count: s.count, isReposted: s.isReposted === 1 }]));
  const reactionsMap = new Map(likeStats.map((s) => [s.postId, { count: s.count, myReaction: s.myReaction }]));
  const bookmarksMap = new Map(bookmarkStats.map((s) => [s.postId, { isSaved: s.isSaved === 1 }]));
  const commentsMap = new Map(commentStats.map((s) => [s.postId, { count: s.count }]));
  const mediaMap = /* @__PURE__ */ new Map();
  allMedia.forEach((m) => {
    if (!mediaMap.has(m.postId)) mediaMap.set(m.postId, []);
    mediaMap.get(m.postId).push(m);
  });
  const collabsMap = /* @__PURE__ */ new Map();
  allCollabs.forEach((c) => {
    if (!collabsMap.has(c.postId)) collabsMap.set(c.postId, []);
    collabsMap.get(c.postId).push(c);
  });
  const pollOptionsMap = /* @__PURE__ */ new Map();
  allPollOptions.forEach((o) => {
    if (!pollOptionsMap.has(o.postId)) pollOptionsMap.set(o.postId, []);
    pollOptionsMap.get(o.postId).push(o);
  });
  const pollVotesMap = /* @__PURE__ */ new Map();
  allPollVotes.forEach((v) => {
    if (!pollVotesMap.has(v.postId)) pollVotesMap.set(v.postId, []);
    pollVotesMap.get(v.postId).push(v);
  });
  return postsList.map((p) => {
    const pMedia = (mediaMap.get(p.id) || []).sort((a, b) => a.sortOrder - b.sortOrder);
    const pCollabs = (collabsMap.get(p.id) || []).filter((c) => c.userId !== p.userId && c.userId !== p.user?.id);
    const rStat = repostsMap.get(p.id) || { count: 0, isReposted: false };
    const rStat2 = reactionsMap.get(p.id) || { count: 0, myReaction: null };
    const bStat = bookmarksMap.get(p.id) || { isSaved: false };
    const cStat = commentsMap.get(p.id) || { count: 0 };
    let pPollOptions = void 0;
    if (p.postType === "POLL") {
      const options = (pollOptionsMap.get(p.id) || []).sort((a, b) => a.order - b.order);
      const votes = pollVotesMap.get(p.id) || [];
      let totalVotes = 0;
      let userVotedOptionId = null;
      const optionsWithVotes = options.map((o) => {
        const vStat = votes.find((v) => v.optionId === o.id) || { count: 0, isVoted: 0 };
        totalVotes += vStat.count;
        if (vStat.isVoted) userVotedOptionId = o.id;
        return { ...o, voteCount: vStat.count };
      });
      pPollOptions = {
        options: optionsWithVotes,
        totalVotes,
        userVotedOptionId
      };
    }
    const authorId = Number(p.user?.id || p.userId);
    const postUser = p.user ? {
      ...p.user,
      isFollowing: viewerId === -1 || authorId === viewerId ? false : !!isFollowingMap.get(authorId),
      followStatus: viewerId === -1 || authorId === viewerId ? "none" : followStatusMap.get(authorId) || "none",
      followsMe: viewerId === -1 || authorId === viewerId ? false : !!followsMeMap.get(authorId)
    } : p.user;
    return {
      ...p,
      user: postUser,
      quotedPost: p.quotedPostId ? quotedPostsMap.get(p.quotedPostId) : void 0,
      pollData: pPollOptions,
      media: pMedia,
      repostCount: rStat.count,
      isReposted: rStat.isReposted,
      likeCount: rStat2.count,
      isLiked: !!rStat2.myReaction,
      myReaction: rStat2.myReaction,
      commentCount: cStat.count,
      isSaved: bStat.isSaved,
      collaborators: pCollabs.map((c) => ({ userId: c.userId, username: c.username, displayName: c.displayName, avatarUrl: c.avatarUrl }))
    };
  });
}
var import_drizzle_orm18;
var init_postStats = __esm({
  "server/utils/postStats.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm18 = require("drizzle-orm");
  }
});

// server/routes/feed.ts
var feed_exports = {};
__export(feed_exports, {
  feedRouter: () => feedRouter
});
var import_express10, import_drizzle_orm19, import_zod4, import_express_rate_limit2, feedRouter, viewLimiter, viewSchema, ALGO_CONFIG, getFeedHandler;
var init_feed = __esm({
  "server/routes/feed.ts"() {
    "use strict";
    import_express10 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm19 = require("drizzle-orm");
    init_auth();
    init_postStats();
    init_api();
    init_blocks();
    init_visibility();
    import_zod4 = require("zod");
    import_express_rate_limit2 = __toESM(require("express-rate-limit"), 1);
    feedRouter = (0, import_express10.Router)();
    viewLimiter = (0, import_express_rate_limit2.default)({
      windowMs: 1 * 60 * 1e3,
      // 1 minute
      max: 60,
      // Max 60 views per minute
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "\xC7ok fazla istek g\xF6nderdiniz." } }
    });
    viewSchema = import_zod4.z.object({
      postId: import_zod4.z.number().int().positive()
    });
    feedRouter.post("/view", requireAuth, viewLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = viewSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz postId." } });
        }
        const { postId } = parsed.data;
        if (!await verifyPostAccess(postId, currentUserId)) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\xE7eri\u011Fe eri\u015Fiminiz yok." } });
        }
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1e3);
        const recentView = await db.select().from(postViews).where(
          (0, import_drizzle_orm19.and)(
            (0, import_drizzle_orm19.eq)(postViews.userId, currentUserId),
            (0, import_drizzle_orm19.eq)(postViews.postId, postId),
            import_drizzle_orm19.sql`${postViews.viewedAt} > ${fiveMinutesAgo.toISOString()}`
          )
        ).limit(1);
        if (recentView.length > 0) {
          return res.json({ success: true, message: "Cooldown active." });
        }
        await db.transaction(async (tx) => {
          await tx.insert(postViews).values({
            userId: currentUserId,
            postId
          });
          await tx.update(posts).set({ viewCount: import_drizzle_orm19.sql`${posts.viewCount} + 1` }).where((0, import_drizzle_orm19.eq)(posts.id, postId));
        });
        res.json({ success: true });
      } catch (error) {
        console.error("View track error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    ALGO_CONFIG = {
      GRAVITY: 1.5,
      BASE_SCORE_WEIGHT: 1,
      FOLLOWING_BONUS: 15,
      OWN_POST_BONUS: 5,
      USER_VIEW_PENALTY: 3,
      TIME_CONSTANT: 2
      // Saat cinsinden yaşa eklenecek sabit değer (bölme hatasını ve yeni gönderilerdeki anormalliği önler)
    };
    getFeedHandler = async (req, res) => {
      try {
        const currentUserId = req.user?.userId ?? null;
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: void 0 };
        const offset = (page - 1) * limit;
        const blockedIds = currentUserId ? await getBlockedIds(currentUserId) : [];
        const safeBlockedIds = blockedIds.length > 0 ? blockedIds : [-1];
        let followingIds = [];
        if (currentUserId) {
          const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm19.eq)(follows.status, "accepted")));
          followingIds = followingRecords.map((f) => f.followingId).filter((id) => !blockedIds.includes(id));
        }
        const safeFollowingIds = followingIds.length > 0 ? followingIds : [-1];
        const ageInHours = import_drizzle_orm19.sql`GREATEST(EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600, 0)`;
        let isFollowingBonus = import_drizzle_orm19.sql`0`;
        let isOwnPostBonus = import_drizzle_orm19.sql`0`;
        let userViewsCountSq = import_drizzle_orm19.sql`0`;
        if (currentUserId) {
          const followingIdsSql = import_drizzle_orm19.sql.join(safeFollowingIds.map((id) => import_drizzle_orm19.sql`${id}`), import_drizzle_orm19.sql`, `);
          isFollowingBonus = import_drizzle_orm19.sql`CASE WHEN ${posts.userId} IN (${followingIdsSql}) THEN ${ALGO_CONFIG.FOLLOWING_BONUS} ELSE 0 END`;
          isOwnPostBonus = import_drizzle_orm19.sql`CASE WHEN ${posts.userId} = ${currentUserId} THEN ${ALGO_CONFIG.OWN_POST_BONUS} ELSE 0 END`;
          userViewsCountSq = import_drizzle_orm19.sql`(SELECT COUNT(*) FROM ${postViews} pv WHERE pv.post_id = ${posts.id} AND pv.user_id = ${currentUserId})`;
        }
        const numerator = import_drizzle_orm19.sql`GREATEST((${posts.baseScore} * ${ALGO_CONFIG.BASE_SCORE_WEIGHT}) + ${isFollowingBonus} + ${isOwnPostBonus} - (${userViewsCountSq} * ${ALGO_CONFIG.USER_VIEW_PENALTY}), 0.1)`;
        const denominator = import_drizzle_orm19.sql`POWER(${ageInHours} + ${ALGO_CONFIG.TIME_CONSTANT}, ${ALGO_CONFIG.GRAVITY})`;
        const rankScore = import_drizzle_orm19.sql`${numerator} / ${denominator}`;
        let isViewerMinor = false;
        if (currentUserId) {
          const [u] = await db.select({ isMinor: users.isMinor }).from(users).where((0, import_drizzle_orm19.eq)(users.id, currentUserId)).limit(1);
          isViewerMinor = u?.isMinor || false;
        }
        const whereConditions = [
          (0, import_drizzle_orm19.isNull)(posts.communityId),
          (0, import_drizzle_orm19.eq)(posts.moderationStatus, "APPROVED"),
          import_drizzle_orm19.sql`${posts.createdAt} >= NOW() - INTERVAL '30 days'`
        ];
        if (isViewerMinor) {
          whereConditions.push((0, import_drizzle_orm19.isNull)(posts.contentWarning));
        }
        if (currentUserId) {
          whereConditions.push(
            (0, import_drizzle_orm19.or)(
              (0, import_drizzle_orm19.or)(
                (0, import_drizzle_orm19.eq)(posts.userId, currentUserId),
                (0, import_drizzle_orm19.exists)(db.select().from(postCollaborators).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(postCollaborators.postId, posts.id), (0, import_drizzle_orm19.eq)(postCollaborators.userId, currentUserId), (0, import_drizzle_orm19.eq)(postCollaborators.status, "accepted"))))
              ),
              // Kendi gönderileri ve ortak oldukları
              (0, import_drizzle_orm19.and)(
                // Takip ettiklerinin gönderileri
                (0, import_drizzle_orm19.or)(
                  (0, import_drizzle_orm19.inArray)(posts.userId, safeFollowingIds),
                  (0, import_drizzle_orm19.exists)(db.select().from(postCollaborators).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(postCollaborators.postId, posts.id), (0, import_drizzle_orm19.inArray)(postCollaborators.userId, safeFollowingIds), (0, import_drizzle_orm19.eq)(postCollaborators.status, "accepted"))))
                ),
                (0, import_drizzle_orm19.or)((0, import_drizzle_orm19.eq)(posts.visibility, "PUBLIC"), (0, import_drizzle_orm19.eq)(posts.visibility, "FOLLOWERS"))
              ),
              (0, import_drizzle_orm19.and)(
                // Herkese açık olan, ama engellenmemiş genel gönderiler (Discover/Keşfet)
                (0, import_drizzle_orm19.eq)(posts.visibility, "PUBLIC"),
                (0, import_drizzle_orm19.eq)(users.isMinor, false),
                // 10 Ekim 2026: Çocuk hesaplar keşfet akışına genel açık olarak itilmez
                (0, import_drizzle_orm19.or)((0, import_drizzle_orm19.eq)(profiles.isPrivate, false), import_drizzle_orm19.sql`${profiles.isPrivate} IS NULL`),
                (0, import_drizzle_orm19.not)((0, import_drizzle_orm19.inArray)(posts.userId, safeBlockedIds)),
                (0, import_drizzle_orm19.not)((0, import_drizzle_orm19.exists)(db.select().from(postCollaborators).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(postCollaborators.postId, posts.id), (0, import_drizzle_orm19.inArray)(postCollaborators.userId, safeBlockedIds), (0, import_drizzle_orm19.eq)(postCollaborators.status, "accepted")))))
              )
            )
          );
        } else {
          whereConditions.push(
            (0, import_drizzle_orm19.and)(
              (0, import_drizzle_orm19.eq)(posts.visibility, "PUBLIC"),
              (0, import_drizzle_orm19.eq)(users.isMinor, false),
              (0, import_drizzle_orm19.or)((0, import_drizzle_orm19.eq)(profiles.isPrivate, false), import_drizzle_orm19.sql`${profiles.isPrivate} IS NULL`)
            )
          );
        }
        const feedPosts = await db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          quotedPostId: posts.quotedPostId,
          userId: posts.userId,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
            isVerified: users.isVerified
          }
        }).from(posts).innerJoin(users, (0, import_drizzle_orm19.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm19.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm19.and)(...whereConditions.filter(Boolean))).orderBy((0, import_drizzle_orm19.desc)(rankScore)).limit(limit).offset(offset);
        const formattedPosts = await populatePostStats(feedPosts, currentUserId ?? -1);
        const hasMore = formattedPosts.length >= limit;
        res.json({
          success: true,
          data: {
            posts: formattedPosts,
            hasMore
          },
          posts: formattedPosts,
          hasMore
        });
      } catch (error) {
        console.error("Feed error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    };
    feedRouter.get("/", optionalAuth, getFeedHandler);
    feedRouter.get("/for-you", optionalAuth, getFeedHandler);
    feedRouter.get("/following", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const blockedIds = await getBlockedIds(currentUserId);
        const safeBlockedIds = blockedIds.length > 0 ? blockedIds : [-1];
        const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm19.eq)(follows.status, "accepted")));
        let followingIds = followingRecords.map((f) => f.followingId).filter((id) => !blockedIds.includes(id));
        const safeFollowingIds = followingIds.length > 0 ? followingIds : [-1];
        if (safeFollowingIds[0] === -1) {
          return res.json({
            success: true,
            data: { posts: [], hasMore: false },
            posts: [],
            hasMore: false,
            meta: { followingCount: 0 }
          });
        }
        const ageInHours = import_drizzle_orm19.sql`GREATEST(EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600, 0)`;
        const userViewsCountSq = import_drizzle_orm19.sql`(SELECT COUNT(*) FROM ${postViews} pv WHERE pv.post_id = ${posts.id} AND pv.user_id = ${currentUserId})`;
        const numerator = import_drizzle_orm19.sql`GREATEST((${posts.baseScore} * ${ALGO_CONFIG.BASE_SCORE_WEIGHT}) + ${ALGO_CONFIG.FOLLOWING_BONUS} - (${userViewsCountSq} * ${ALGO_CONFIG.USER_VIEW_PENALTY}), 0.1)`;
        const denominator = import_drizzle_orm19.sql`POWER(${ageInHours} + ${ALGO_CONFIG.TIME_CONSTANT}, ${ALGO_CONFIG.GRAVITY})`;
        const rankScore = import_drizzle_orm19.sql`${numerator} / ${denominator}`;
        const feedPosts = await db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          quotedPostId: posts.quotedPostId,
          userId: posts.userId,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
            isVerified: users.isVerified
          }
        }).from(posts).innerJoin(users, (0, import_drizzle_orm19.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm19.eq)(users.id, profiles.userId)).where(
          (0, import_drizzle_orm19.and)(
            (0, import_drizzle_orm19.isNull)(posts.communityId),
            (0, import_drizzle_orm19.eq)(posts.moderationStatus, "APPROVED"),
            (0, import_drizzle_orm19.or)(
              (0, import_drizzle_orm19.inArray)(posts.userId, safeFollowingIds),
              (0, import_drizzle_orm19.exists)(db.select().from(postCollaborators).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(postCollaborators.postId, posts.id), (0, import_drizzle_orm19.inArray)(postCollaborators.userId, safeFollowingIds), (0, import_drizzle_orm19.eq)(postCollaborators.status, "accepted"))))
            ),
            (0, import_drizzle_orm19.not)((0, import_drizzle_orm19.inArray)(posts.userId, safeBlockedIds)),
            (0, import_drizzle_orm19.not)((0, import_drizzle_orm19.exists)(db.select().from(postCollaborators).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(postCollaborators.postId, posts.id), (0, import_drizzle_orm19.inArray)(postCollaborators.userId, safeBlockedIds), (0, import_drizzle_orm19.eq)(postCollaborators.status, "accepted"))))),
            (0, import_drizzle_orm19.or)((0, import_drizzle_orm19.eq)(posts.visibility, "PUBLIC"), (0, import_drizzle_orm19.eq)(posts.visibility, "FOLLOWERS"))
          )
        ).orderBy((0, import_drizzle_orm19.desc)(rankScore)).limit(limit).offset(offset);
        const formattedPosts = await populatePostStats(feedPosts, currentUserId);
        const hasMore = formattedPosts.length >= limit;
        res.json({
          success: true,
          data: {
            posts: formattedPosts,
            hasMore
          },
          posts: formattedPosts,
          hasMore,
          meta: { followingCount: followingIds.length }
        });
      } catch (error) {
        console.error("Feed following error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/utils/cursor.ts
function encodeCursor(createdAt, id) {
  return Buffer.from(`${createdAt.toISOString()}_${id}`).toString("base64");
}
function decodeCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const [dateStr, idStr] = decoded.split("_");
    if (!dateStr || !idStr) return null;
    return { createdAt: new Date(dateStr), id: parseInt(idStr, 10) };
  } catch (e) {
    return null;
  }
}
var init_cursor = __esm({
  "server/utils/cursor.ts"() {
    "use strict";
  }
});

// server/routes/userPosts.ts
var userPosts_exports = {};
__export(userPosts_exports, {
  userPostsRouter: () => userPostsRouter
});
var import_drizzle_orm20, import_express11, import_drizzle_orm21, userPostsRouter;
var init_userPosts = __esm({
  "server/routes/userPosts.ts"() {
    "use strict";
    import_drizzle_orm20 = require("drizzle-orm");
    import_express11 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm21 = require("drizzle-orm");
    init_cursor();
    init_auth();
    init_postStats();
    init_api();
    init_blocks();
    userPostsRouter = (0, import_express11.Router)();
    userPostsRouter.get("/:id/posts", optionalAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz kullan\u0131c\u0131 ID'si." } });
        }
        const currentUserId = optionalAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: void 0 };
        const offset = (page - 1) * limit;
        let cursorCondition = void 0;
        if (cursor) {
          const decoded = decodeCursor(cursor);
          if (decoded) {
            cursorCondition = (0, import_drizzle_orm21.or)((0, import_drizzle_orm21.lt)(posts.createdAt, decoded.createdAt), (0, import_drizzle_orm21.and)((0, import_drizzle_orm21.eq)(posts.createdAt, decoded.createdAt), (0, import_drizzle_orm21.lt)(posts.id, decoded.id)));
          }
        }
        const moderationCondition = currentUserId ? (0, import_drizzle_orm21.or)((0, import_drizzle_orm21.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm21.eq)(posts.userId, currentUserId)) : (0, import_drizzle_orm21.eq)(posts.moderationStatus, "APPROVED");
        const p1 = db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          quotedPostId: posts.quotedPostId,
          userId: posts.userId,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          },
          __repostCreatedAt: import_drizzle_orm20.sql`NULL`,
          __repostUserId: import_drizzle_orm20.sql`NULL`
        }).from(posts).innerJoin(users, (0, import_drizzle_orm21.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm21.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm21.and)((0, import_drizzle_orm21.eq)(posts.userId, targetUserId), (0, import_drizzle_orm21.isNull)(posts.communityId), moderationCondition, cursorCondition ? cursorCondition : void 0)).orderBy((0, import_drizzle_orm21.desc)(posts.createdAt), (0, import_drizzle_orm21.desc)(posts.id)).limit(limit);
        let repostCursorCondition = void 0;
        if (cursor) {
          const decoded = decodeCursor(cursor);
          if (decoded) {
            repostCursorCondition = (0, import_drizzle_orm21.or)((0, import_drizzle_orm21.lt)(reposts.createdAt, decoded.createdAt), (0, import_drizzle_orm21.and)((0, import_drizzle_orm21.eq)(reposts.createdAt, decoded.createdAt), (0, import_drizzle_orm21.lt)(reposts.id, decoded.id)));
          }
        }
        const p2 = db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          quotedPostId: posts.quotedPostId,
          userId: posts.userId,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          },
          __repostCreatedAt: reposts.createdAt,
          __repostUserId: reposts.userId
        }).from(reposts).innerJoin(posts, (0, import_drizzle_orm21.eq)(reposts.postId, posts.id)).innerJoin(users, (0, import_drizzle_orm21.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm21.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm21.and)((0, import_drizzle_orm21.eq)(reposts.userId, targetUserId), (0, import_drizzle_orm21.isNull)(posts.communityId), moderationCondition, repostCursorCondition ? repostCursorCondition : void 0)).orderBy((0, import_drizzle_orm21.desc)(reposts.createdAt), (0, import_drizzle_orm21.desc)(reposts.id)).limit(limit);
        let collabCursorCondition = void 0;
        if (cursor) {
          const decoded = decodeCursor(cursor);
          if (decoded) {
            collabCursorCondition = (0, import_drizzle_orm21.or)((0, import_drizzle_orm21.lt)(posts.createdAt, decoded.createdAt), (0, import_drizzle_orm21.and)((0, import_drizzle_orm21.eq)(posts.createdAt, decoded.createdAt), (0, import_drizzle_orm21.lt)(posts.id, decoded.id)));
          }
        }
        const p3 = db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          quotedPostId: posts.quotedPostId,
          userId: posts.userId,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          },
          __repostCreatedAt: import_drizzle_orm20.sql`NULL`,
          __repostUserId: import_drizzle_orm20.sql`NULL`
        }).from(postCollaborators).innerJoin(posts, (0, import_drizzle_orm21.eq)(postCollaborators.postId, posts.id)).innerJoin(users, (0, import_drizzle_orm21.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm21.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm21.and)(
          (0, import_drizzle_orm21.eq)(postCollaborators.userId, targetUserId),
          (0, import_drizzle_orm21.eq)(postCollaborators.status, "accepted"),
          (0, import_drizzle_orm21.isNull)(posts.communityId),
          moderationCondition,
          collabCursorCondition ? collabCursorCondition : void 0
        )).orderBy((0, import_drizzle_orm21.desc)(posts.createdAt), (0, import_drizzle_orm21.desc)(posts.id)).limit(limit);
        const [authoredPosts, repostedPosts, collabPosts] = await Promise.all([p1, p2, p3]);
        const uniqueIds = /* @__PURE__ */ new Set();
        let allPosts = [];
        for (const p of [...authoredPosts, ...repostedPosts, ...collabPosts]) {
          const uniqueKey = p.__repostUserId ? `repost-${p.id}` : `post-${p.id}`;
          if (!uniqueIds.has(uniqueKey)) {
            uniqueIds.add(uniqueKey);
            allPosts.push(p);
          }
        }
        let userPosts = allPosts.sort((a, b) => {
          const timeA = (a.__repostCreatedAt || a.createdAt).getTime();
          const timeB = (b.__repostCreatedAt || b.createdAt).getTime();
          return timeB - timeA;
        }).slice(0, limit);
        const targetProfile = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where((0, import_drizzle_orm21.eq)(profiles.userId, targetUserId)).limit(1);
        const isPrivate = targetProfile.length > 0 ? targetProfile[0].isPrivate : false;
        let isFollowing = false;
        if (currentUserId) {
          const followRecord = await db.select().from(follows).where((0, import_drizzle_orm21.and)((0, import_drizzle_orm21.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm21.eq)(follows.followingId, targetUserId))).limit(1);
          isFollowing = followRecord.length > 0 && followRecord[0].status === "accepted";
        }
        const isSelf = currentUserId ? currentUserId === targetUserId : false;
        if (isPrivate && !isSelf && !isFollowing) {
          return res.json({ success: true, data: [] });
        }
        if (currentUserId) {
          const blockedIds = await getBlockedIds(currentUserId);
          if (blockedIds.includes(targetUserId)) {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullan\u0131c\u0131ya eri\u015Fiminiz yok." } });
          }
        }
        const targetUserInfo = await db.select({
          username: users.username,
          displayName: profiles.displayName
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm21.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm21.eq)(users.id, targetUserId)).limit(1);
        const visiblePosts = userPosts.filter((p) => {
          if (p.visibility === "PUBLIC") return true;
          if (isSelf) return true;
          if (p.visibility === "FOLLOWERS" && isFollowing) return true;
          return false;
        });
        const populatedPosts = await populatePostStats(visiblePosts, currentUserId ?? void 0);
        const formattedPosts = populatedPosts.map((p) => {
          if (p.__repostUserId === targetUserId && targetUserInfo.length > 0) {
            p.repostedBy = targetUserInfo[0];
          }
          return p;
        });
        let nextCursor = void 0;
        if (visiblePosts.length === limit) {
          const last = visiblePosts[visiblePosts.length - 1];
          nextCursor = encodeCursor(last.createdAt, last.id);
        }
        res.json({ success: true, data: formattedPosts, meta: { nextCursor } });
      } catch (error) {
        console.error("userPostsRouter error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/follows.ts
var follows_exports = {};
__export(follows_exports, {
  followsRouter: () => followsRouter
});
var import_express12, import_drizzle_orm22, followsRouter;
var init_follows = __esm({
  "server/routes/follows.ts"() {
    "use strict";
    import_express12 = require("express");
    init_db();
    init_schema();
    init_notifications();
    import_drizzle_orm22 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_api();
    followsRouter = (0, import_express12.Router)();
    followsRouter.get("/me/follow-requests", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const requests = await db.select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          createdAt: follows.createdAt
        }).from(follows).innerJoin(users, (0, import_drizzle_orm22.eq)(follows.followerId, users.id)).leftJoin(profiles, (0, import_drizzle_orm22.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(follows.followingId, currentUserId), (0, import_drizzle_orm22.eq)(follows.status, "pending"))).orderBy(follows.createdAt).limit(limit).offset(offset);
        res.json({ success: true, data: requests });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.post("/me/follow-requests/:id/accept", requireAuth, async (req, res) => {
      try {
        const followerId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(followerId)) return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID" } });
        await db.transaction(async (tx) => {
          const result = await tx.update(follows).set({ status: "accepted" }).where((0, import_drizzle_orm22.and)(
            (0, import_drizzle_orm22.eq)(follows.followerId, followerId),
            (0, import_drizzle_orm22.eq)(follows.followingId, currentUserId),
            (0, import_drizzle_orm22.eq)(follows.status, "pending")
          )).returning();
          if (result.length > 0) {
            await notify(currentUserId, followerId, "follow_accepted", void 0, void 0, void 0, tx);
            await tx.delete(notifications).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(notifications.actorId, followerId), (0, import_drizzle_orm22.eq)(notifications.recipientId, currentUserId), (0, import_drizzle_orm22.eq)(notifications.type, "follow_request")));
          }
        });
        res.json({ success: true, data: { message: "Takip iste\u011Fi kabul edildi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.post("/me/follow-requests/:id/reject", requireAuth, async (req, res) => {
      try {
        const followerId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(followerId)) return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID" } });
        await db.delete(follows).where((0, import_drizzle_orm22.and)(
          (0, import_drizzle_orm22.eq)(follows.followerId, followerId),
          (0, import_drizzle_orm22.eq)(follows.followingId, currentUserId),
          (0, import_drizzle_orm22.eq)(follows.status, "pending")
        ));
        await db.delete(notifications).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(notifications.actorId, followerId), (0, import_drizzle_orm22.eq)(notifications.recipientId, currentUserId), (0, import_drizzle_orm22.eq)(notifications.type, "follow_request")));
        res.json({ success: true, data: { message: "Takip iste\u011Fi reddedildi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.post("/:id/follow", requireAuth, standardLimiter, async (req, res) => {
      try {
        let targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(targetUserId)) {
          const [u] = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm22.eq)(users.username, req.params.id)).limit(1);
          if (u) {
            targetUserId = u.id;
          } else {
            return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          }
        }
        if (targetUserId === currentUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi takip edemezsiniz." } });
        }
        const blockRecord = await db.select().from(blocks).where(
          (0, import_drizzle_orm22.or)(
            (0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm22.eq)(blocks.blockedId, targetUserId)),
            (0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(blocks.blockerId, targetUserId), (0, import_drizzle_orm22.eq)(blocks.blockedId, currentUserId))
          )
        ).limit(1);
        if (blockRecord.length > 0) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flemi ger\xE7ekle\u015Ftiremezsiniz." } });
        }
        const targetProfile = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where((0, import_drizzle_orm22.eq)(profiles.userId, targetUserId)).limit(1);
        const isPrivate = targetProfile.length > 0 ? targetProfile[0].isPrivate : false;
        const initialStatus = isPrivate ? "pending" : "accepted";
        let returnStatus = initialStatus;
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(follows).where((0, import_drizzle_orm22.and)(
            (0, import_drizzle_orm22.eq)(follows.followerId, currentUserId),
            (0, import_drizzle_orm22.eq)(follows.followingId, targetUserId)
          )).limit(1);
          if (existing.length > 0) {
            returnStatus = existing[0].status;
            return;
          }
          const result = await tx.insert(follows).values({
            followerId: currentUserId,
            followingId: targetUserId,
            status: initialStatus
          }).onConflictDoNothing();
          if (result.rowCount && result.rowCount > 0) {
            const notifType = initialStatus === "pending" ? "follow_request" : "follow";
            await notify(currentUserId, targetUserId, notifType, void 0, void 0, void 0, tx);
          }
        });
        res.json({ success: true, data: { message: initialStatus === "pending" ? "Takip iste\u011Fi g\xF6nderildi." : "Takip ediliyor.", status: returnStatus } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.delete("/:id/follow", requireAuth, async (req, res) => {
      try {
        let targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(targetUserId)) {
          const [u] = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm22.eq)(users.username, req.params.id)).limit(1);
          if (u) {
            targetUserId = u.id;
          } else {
            return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          }
        }
        await db.delete(follows).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm22.eq)(follows.followingId, targetUserId)));
        res.json({ success: true, data: { message: "Takipten \xE7\u0131k\u0131ld\u0131/\u0130stek iptal edildi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.get("/:id/followers", optionalAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz ID." } });
        }
        const currentUserId = optionalAuthContext(req);
        const targetUserRec = await db.select({
          isMinor: users.isMinor,
          isPrivate: profiles.isPrivate
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm22.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm22.eq)(users.id, targetUserId)).limit(1);
        const isMinor = targetUserRec.length > 0 ? targetUserRec[0].isMinor : false;
        const isPrivate = targetUserRec.length > 0 ? targetUserRec[0].isPrivate : false;
        if ((isMinor || isPrivate) && currentUserId !== targetUserId) {
          let isFollowing = false;
          if (currentUserId) {
            const f = await db.select().from(follows).where((0, import_drizzle_orm22.and)(
              (0, import_drizzle_orm22.eq)(follows.followerId, currentUserId),
              (0, import_drizzle_orm22.eq)(follows.followingId, targetUserId),
              (0, import_drizzle_orm22.eq)(follows.status, "accepted")
            )).limit(1);
            isFollowing = f.length > 0;
          }
          if (!isFollowing) {
            return res.json({ success: true, data: [] });
          }
        }
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const followersList = await db.select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(follows).innerJoin(users, (0, import_drizzle_orm22.eq)(follows.followerId, users.id)).leftJoin(profiles, (0, import_drizzle_orm22.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(follows.followingId, targetUserId), (0, import_drizzle_orm22.eq)(follows.status, "accepted"))).limit(limit).offset(offset);
        res.json({ success: true, data: followersList });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.get("/:id/following", optionalAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz ID." } });
        }
        const currentUserId = optionalAuthContext(req);
        const targetUserRec = await db.select({
          isMinor: users.isMinor,
          isPrivate: profiles.isPrivate
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm22.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm22.eq)(users.id, targetUserId)).limit(1);
        const isMinor = targetUserRec.length > 0 ? targetUserRec[0].isMinor : false;
        const isPrivate = targetUserRec.length > 0 ? targetUserRec[0].isPrivate : false;
        if ((isMinor || isPrivate) && currentUserId !== targetUserId) {
          let isFollowing = false;
          if (currentUserId) {
            const f = await db.select().from(follows).where((0, import_drizzle_orm22.and)(
              (0, import_drizzle_orm22.eq)(follows.followerId, currentUserId),
              (0, import_drizzle_orm22.eq)(follows.followingId, targetUserId),
              (0, import_drizzle_orm22.eq)(follows.status, "accepted")
            )).limit(1);
            isFollowing = f.length > 0;
          }
          if (!isFollowing) {
            return res.json({ success: true, data: [] });
          }
        }
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const followingList = await db.select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(follows).innerJoin(users, (0, import_drizzle_orm22.eq)(follows.followingId, users.id)).leftJoin(profiles, (0, import_drizzle_orm22.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(follows.followerId, targetUserId), (0, import_drizzle_orm22.eq)(follows.status, "accepted"))).limit(limit).offset(offset);
        res.json({ success: true, data: followingList });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/bookmarks.ts
var bookmarks_exports = {};
__export(bookmarks_exports, {
  bookmarksRouter: () => bookmarksRouter
});
var import_express13, import_drizzle_orm23, bookmarksRouter;
var init_bookmarks = __esm({
  "server/routes/bookmarks.ts"() {
    "use strict";
    import_express13 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm23 = require("drizzle-orm");
    init_auth();
    init_postStats();
    init_api();
    bookmarksRouter = (0, import_express13.Router)();
    bookmarksRouter.get("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const savedPosts = await db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(bookmarks).innerJoin(posts, (0, import_drizzle_orm23.eq)(bookmarks.postId, posts.id)).innerJoin(users, (0, import_drizzle_orm23.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm23.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm23.eq)(bookmarks.userId, currentUserId)).orderBy((0, import_drizzle_orm23.desc)(bookmarks.createdAt)).limit(limit).offset(offset);
        const formattedPosts = await populatePostStats(savedPosts, currentUserId);
        res.json({ success: true, data: formattedPosts });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/search.ts
var search_exports = {};
__export(search_exports, {
  searchRouter: () => searchRouter
});
var import_express14, import_drizzle_orm24, searchRouter;
var init_search = __esm({
  "server/routes/search.ts"() {
    "use strict";
    import_express14 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm24 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_blocks();
    init_api();
    init_postStats();
    searchRouter = (0, import_express14.Router)();
    searchRouter.get("/", optionalAuth, standardLimiter, async (req, res) => {
      try {
        let q = req.query.q;
        const type = req.query.type || "users";
        if (!q || q.length < 2 || q.length > 50) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Arama terimi 2-50 karakter aras\u0131nda olmal\u0131d\u0131r." } });
        }
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const currentUserId = optionalAuthContext(req) || -1;
        const blockedIds = await getBlockedIds(currentUserId);
        const ignoreIds = blockedIds.length > 0 ? blockedIds : [-1];
        if (type === "users") {
          const searchResults = await db.select({
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }).from(users).leftJoin(profiles, (0, import_drizzle_orm24.eq)(users.id, profiles.userId)).where(
            (0, import_drizzle_orm24.and)(
              (0, import_drizzle_orm24.eq)(users.isActive, true),
              (0, import_drizzle_orm24.not)((0, import_drizzle_orm24.eq)(users.ageVerificationStatus, "REJECTED_UNDERAGE")),
              (0, import_drizzle_orm24.or)(
                (0, import_drizzle_orm24.ilike)(users.username, `%${q}%`),
                (0, import_drizzle_orm24.ilike)(profiles.displayName, `%${q}%`)
              ),
              (0, import_drizzle_orm24.notInArray)(users.id, ignoreIds),
              currentUserId === -1 ? (0, import_drizzle_orm24.and)((0, import_drizzle_orm24.eq)(profiles.allowSearchEngineIndexing, true), (0, import_drizzle_orm24.eq)(users.isMinor, false)) : import_drizzle_orm24.sql`TRUE`
            )
          ).limit(limit).offset(offset);
          return res.json({ success: true, data: searchResults });
        } else if (type === "posts") {
          const visibilityCondition = (0, import_drizzle_orm24.or)(
            (0, import_drizzle_orm24.eq)(posts.userId, currentUserId),
            (0, import_drizzle_orm24.and)(
              (0, import_drizzle_orm24.or)((0, import_drizzle_orm24.eq)(posts.visibility, "PUBLIC"), (0, import_drizzle_orm24.eq)(posts.visibility, "FOLLOWERS")),
              (0, import_drizzle_orm24.or)(
                (0, import_drizzle_orm24.and)(
                  (0, import_drizzle_orm24.or)((0, import_drizzle_orm24.eq)(profiles.isPrivate, false), import_drizzle_orm24.sql`${profiles.isPrivate} IS NULL`),
                  (0, import_drizzle_orm24.eq)(posts.visibility, "PUBLIC")
                ),
                currentUserId !== -1 ? (0, import_drizzle_orm24.inArray)(posts.userId, db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm24.and)((0, import_drizzle_orm24.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm24.eq)(follows.status, "accepted")))) : import_drizzle_orm24.sql`FALSE`
              )
            )
          );
          const searchResults = await db.select({
            id: posts.id,
            userId: posts.userId,
            content: posts.content,
            postType: posts.postType,
            contentWarning: posts.contentWarning,
            visibility: posts.visibility,
            createdAt: posts.createdAt,
            user: {
              id: users.id,
              username: users.username,
              displayName: profiles.displayName,
              avatarUrl: profiles.avatarUrl
            }
          }).from(posts).innerJoin(users, (0, import_drizzle_orm24.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm24.eq)(users.id, profiles.userId)).where(
            (0, import_drizzle_orm24.and)(
              (0, import_drizzle_orm24.ilike)(posts.content, `%${q}%`),
              (0, import_drizzle_orm24.notInArray)(posts.userId, ignoreIds),
              visibilityCondition
            )
          ).orderBy((0, import_drizzle_orm24.desc)(posts.createdAt)).limit(limit).offset(offset);
          const formattedPosts = await populatePostStats(searchResults, currentUserId);
          return res.json({ success: true, data: formattedPosts });
        } else if (type === "tags") {
          if (q.startsWith("#")) {
            q = q.substring(1);
          }
          const searchResults = await db.select({
            id: hashtags.id,
            name: hashtags.name,
            postCount: import_drizzle_orm24.sql`(SELECT count(*) FROM ${postHashtags} WHERE ${postHashtags.hashtagId} = ${hashtags.id})`
          }).from(hashtags).where((0, import_drizzle_orm24.ilike)(hashtags.name, `%${q}%`)).limit(limit).offset(offset);
          return res.json({ success: true, data: searchResults });
        } else if (type === "communities") {
          const searchResults = await db.select({
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
            description: communities.description,
            avatarUrl: communities.avatarUrl,
            category: communities.category,
            isPrivate: communities.isPrivate,
            memberCount: import_drizzle_orm24.sql`(SELECT count(*)::int FROM ${communityMembers} WHERE ${communityMembers.communityId} = ${communities.id})`
          }).from(communities).where(
            (0, import_drizzle_orm24.and)(
              (0, import_drizzle_orm24.isNull)(communities.deletedAt),
              (0, import_drizzle_orm24.or)(
                (0, import_drizzle_orm24.ilike)(communities.name, `%${q}%`),
                (0, import_drizzle_orm24.ilike)(communities.slug, `%${q}%`),
                (0, import_drizzle_orm24.ilike)(communities.description, `%${q}%`)
              )
            )
          ).limit(limit).offset(offset);
          return res.json({ success: true, data: searchResults });
        } else {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz arama tipi." } });
        }
      } catch (error) {
        console.error("Search endpoint error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error?.message || "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/notifications.ts
var notifications_exports2 = {};
__export(notifications_exports2, {
  notificationsRouter: () => notificationsRouter
});
var import_express15, import_drizzle_orm25, notificationsRouter;
var init_notifications2 = __esm({
  "server/routes/notifications.ts"() {
    "use strict";
    import_express15 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm25 = require("drizzle-orm");
    init_cursor();
    init_auth();
    init_api();
    notificationsRouter = (0, import_express15.Router)();
    notificationsRouter.get("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: void 0 };
        const offset = (page - 1) * limit;
        let cursorCondition = void 0;
        if (cursor) {
          const decoded = decodeCursor(cursor);
          if (decoded) {
            cursorCondition = (0, import_drizzle_orm25.or)((0, import_drizzle_orm25.lt)(notifications.createdAt, decoded.createdAt), (0, import_drizzle_orm25.and)((0, import_drizzle_orm25.eq)(notifications.createdAt, decoded.createdAt), (0, import_drizzle_orm25.lt)(notifications.id, decoded.id)));
          }
        }
        const list = await db.select({
          id: notifications.id,
          type: notifications.type,
          postId: notifications.postId,
          projectId: notifications.projectId,
          commentId: notifications.commentId,
          projectCommentId: notifications.projectCommentId,
          communityId: notifications.communityId,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
          actor: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          },
          community: {
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
            avatarUrl: communities.avatarUrl
          }
        }).from(notifications).innerJoin(users, (0, import_drizzle_orm25.eq)(notifications.actorId, users.id)).leftJoin(profiles, (0, import_drizzle_orm25.eq)(users.id, profiles.userId)).leftJoin(communities, (0, import_drizzle_orm25.eq)(notifications.communityId, communities.id)).where((0, import_drizzle_orm25.and)((0, import_drizzle_orm25.eq)(notifications.recipientId, currentUserId), cursorCondition ? cursorCondition : void 0)).orderBy((0, import_drizzle_orm25.desc)(notifications.createdAt), (0, import_drizzle_orm25.desc)(notifications.id)).limit(limit).offset(offset);
        let nextCursor = void 0;
        if (list.length === limit) {
          const last = list[list.length - 1];
          nextCursor = encodeCursor(last.createdAt, last.id);
        }
        res.json({ success: true, data: list, meta: { nextCursor } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    notificationsRouter.put("/read", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm25.eq)(notifications.recipientId, currentUserId));
        res.json({ success: true, data: { message: "T\xFCm\xFC okundu olarak i\u015Faretlendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    notificationsRouter.post("/:id/read", requireAuth, async (req, res) => {
      try {
        const notifId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm25.and)((0, import_drizzle_orm25.eq)(notifications.id, notifId), (0, import_drizzle_orm25.eq)(notifications.recipientId, currentUserId)));
        res.json({ success: true, data: { message: "Okundu olarak i\u015Faretlendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/blocks.ts
var blocks_exports = {};
__export(blocks_exports, {
  blocksRouter: () => blocksRouter
});
var import_express16, import_drizzle_orm26, blocksRouter;
var init_blocks2 = __esm({
  "server/routes/blocks.ts"() {
    "use strict";
    import_express16 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm26 = require("drizzle-orm");
    init_auth();
    blocksRouter = (0, import_express16.Router)();
    blocksRouter.post("/:id/block", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (targetUserId === currentUserId) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz i\u015Flem." } });
        await db.insert(blocks).values({ blockerId: currentUserId, blockedId: targetUserId }).onConflictDoNothing();
        res.json({ success: true, data: { message: "Engellendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    blocksRouter.delete("/:id/block", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        await db.delete(blocks).where((0, import_drizzle_orm26.and)((0, import_drizzle_orm26.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm26.eq)(blocks.blockedId, targetUserId)));
        res.json({ success: true, data: { message: "Engel kald\u0131r\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    blocksRouter.get("/me/blocked", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const list = await db.select({
          id: users.id,
          username: users.username,
          displayName: profiles.displayName
        }).from(blocks).innerJoin(users, (0, import_drizzle_orm26.eq)(blocks.blockedId, users.id)).leftJoin(profiles, (0, import_drizzle_orm26.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm26.eq)(blocks.blockerId, currentUserId));
        res.json({ success: true, data: list });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/utils/transcodeQueue.ts
var import_events, TranscodeQueue, videoTranscodeQueue;
var init_transcodeQueue = __esm({
  "server/utils/transcodeQueue.ts"() {
    "use strict";
    import_events = __toESM(require("events"), 1);
    TranscodeQueue = class extends import_events.default {
      constructor(maxConcurrency = 2) {
        super();
        this.runningCount = 0;
        this.queue = [];
        this.maxConcurrency = maxConcurrency;
      }
      enqueue(id, run, cancel) {
        return new Promise((resolve, reject) => {
          const task = {
            id,
            run: async () => {
              try {
                await run();
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            cancel
          };
          this.queue.push(task);
          this.processNext();
        });
      }
      cancel(id) {
        const index2 = this.queue.findIndex((t) => t.id === id);
        if (index2 !== -1) {
          const [removed] = this.queue.splice(index2, 1);
          removed.cancel();
          return;
        }
        this.emit(`cancel_${id}`);
      }
      async processNext() {
        if (this.runningCount >= this.maxConcurrency || this.queue.length === 0) {
          return;
        }
        const task = this.queue.shift();
        if (!task) return;
        this.runningCount++;
        console.log(`[video-queue] Starting task ${task.id}. Active: ${this.runningCount}, Queued: ${this.queue.length}`);
        const onCancel = () => {
          task.cancel();
        };
        this.once(`cancel_${task.id}`, onCancel);
        try {
          await task.run();
        } finally {
          this.removeListener(`cancel_${task.id}`, onCancel);
          this.runningCount--;
          console.log(`[video-queue] Finished task ${task.id}. Active: ${this.runningCount}, Queued: ${this.queue.length}`);
          this.processNext();
        }
      }
    };
    videoTranscodeQueue = new TranscodeQueue(2);
  }
});

// server/routes/media.ts
var media_exports = {};
__export(media_exports, {
  mediaRouter: () => mediaRouter
});
function getBinaryPath(name, envVar) {
  if (process.env[envVar] && import_fs5.default.existsSync(process.env[envVar])) {
    return process.env[envVar];
  }
  const knownPaths = [
    `/usr/bin/${name}`,
    `/usr/local/bin/${name}`,
    `/opt/homebrew/bin/${name}`,
    `/bin/${name}`
  ];
  for (const p of knownPaths) {
    if (import_fs5.default.existsSync(p)) return p;
  }
  try {
    const found = (0, import_child_process.execSync)(`which ${name}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
    if (found && import_fs5.default.existsSync(found)) return found;
  } catch {
  }
  return null;
}
var import_express17, import_multer, import_path6, import_crypto6, import_fs5, import_child_process, import_sharp, import_file_type, import_fluent_ffmpeg, ffmpegBinary, ffprobeBinary, MIME_CONFIG, storage, dangerousExts, upload, mediaRouter;
var init_media = __esm({
  "server/routes/media.ts"() {
    "use strict";
    import_express17 = require("express");
    import_multer = __toESM(require("multer"), 1);
    import_path6 = __toESM(require("path"), 1);
    import_crypto6 = __toESM(require("crypto"), 1);
    import_fs5 = __toESM(require("fs"), 1);
    import_child_process = require("child_process");
    import_sharp = __toESM(require("sharp"), 1);
    import_file_type = require("file-type");
    import_fluent_ffmpeg = __toESM(require("fluent-ffmpeg"), 1);
    init_auth();
    init_rateLimiter();
    init_uploadConfig();
    init_transcodeQueue();
    ffmpegBinary = getBinaryPath("ffmpeg", "FFMPEG_PATH");
    ffprobeBinary = getBinaryPath("ffprobe", "FFPROBE_PATH");
    if (ffmpegBinary) {
      import_fluent_ffmpeg.default.setFfmpegPath(ffmpegBinary);
      console.log(`[media] FFmpeg binary configured at: ${ffmpegBinary}`);
    } else {
      console.warn(`[media] WARNING: FFmpeg binary not found on system.`);
    }
    if (ffprobeBinary) {
      import_fluent_ffmpeg.default.setFfprobePath(ffprobeBinary);
      console.log(`[media] FFprobe binary configured at: ${ffprobeBinary}`);
    } else {
      console.warn(`[media] WARNING: FFprobe binary not found on system.`);
    }
    MIME_CONFIG = {
      "image/jpeg": { ext: ".jpg", isVideo: false },
      "image/png": { ext: ".png", isVideo: false },
      "image/gif": { ext: ".gif", isVideo: false },
      "image/webp": { ext: ".webp", isVideo: false },
      "video/mp4": { ext: ".mp4", isVideo: true },
      "video/quicktime": { ext: ".mov", isVideo: true },
      "video/webm": { ext: ".webm", isVideo: true },
      "video/x-matroska": { ext: ".mkv", isVideo: true },
      "video/3gpp": { ext: ".3gp", isVideo: true },
      "video/x-msvideo": { ext: ".avi", isVideo: true }
    };
    storage = import_multer.default.diskStorage({
      destination: (req, file, cb) => {
        cb(null, getUploadDir());
      },
      filename: (req, file, cb) => {
        const conf = MIME_CONFIG[file.mimetype];
        const ext = conf ? conf.ext : import_path6.default.extname(file.originalname).toLowerCase() || ".bin";
        const id = import_crypto6.default.randomBytes(16).toString("hex");
        cb(null, `temp_raw_${id}${ext}`);
      }
    });
    dangerousExts = [".exe", ".sh", ".bat", ".cmd", ".php", ".js", ".html", ".htm", ".jar", ".vbs", ".scr"];
    upload = (0, import_multer.default)({
      storage,
      limits: { fileSize: 100 * 1024 * 1024 },
      // 100MB max upload limit
      fileFilter: (req, file, cb) => {
        const allowedMimes = Object.keys(MIME_CONFIG);
        const ext = import_path6.default.extname(file.originalname).toLowerCase();
        if (dangerousExts.includes(ext)) {
          return cb(new Error("G\xFCvenlik nedeniyle bu dosya uzant\u0131s\u0131na izin verilmiyor."));
        }
        if (!allowedMimes.includes(file.mimetype) && !file.mimetype.startsWith("video/") && !file.mimetype.startsWith("image/")) {
          return cb(new Error("Desteklenmeyen dosya format\u0131. Desteklenenler: JPG, PNG, GIF, WebP, MP4, MOV, WebM."));
        }
        cb(null, true);
      }
    });
    mediaRouter = (0, import_express17.Router)();
    mediaRouter.post("/upload", requireAuth, strictLimiter, (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              error: { code: "FILE_TOO_LARGE", message: "Dosya boyutu \xE7ok b\xFCy\xFCk (Maksimum 100MB)." }
            });
          }
          return res.status(400).json({
            success: false,
            error: { code: "BAD_REQUEST", message: err.message || "Dosya y\xFCklenemedi." }
          });
        }
        next();
      });
    }, async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "L\xFCtfen bir dosya se\xE7in." } });
      }
      const tempFilePath = req.file.path;
      const originalFileName = req.file.filename;
      const baseId = originalFileName.replace(/^temp_raw_/, "").split(".")[0];
      const uploadDir = getUploadDir();
      let isAborted = false;
      let activeFfmpegProcess = null;
      const finalFilePath = import_path6.default.join(uploadDir, `${baseId}_compressed.mp4`);
      const thumbFilePath = import_path6.default.join(uploadDir, `${baseId}_thumb.webp`);
      req.on("close", () => {
        if (!res.writableEnded) {
          isAborted = true;
          console.log(`[video] Request closed by client for task ${baseId}`);
          if (activeFfmpegProcess) {
            try {
              activeFfmpegProcess.kill("SIGKILL");
            } catch (e) {
            }
          }
          videoTranscodeQueue.cancel(baseId);
          try {
            if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
            if (import_fs5.default.existsSync(finalFilePath)) import_fs5.default.unlinkSync(finalFilePath);
            if (import_fs5.default.existsSync(thumbFilePath)) import_fs5.default.unlinkSync(thumbFilePath);
          } catch (e) {
          }
        }
      });
      try {
        const detected = await (0, import_file_type.fileTypeFromFile)(tempFilePath);
        let mime = detected?.mime || req.file.mimetype;
        const isVideo = mime.startsWith("video/") || ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/3gpp", "video/x-msvideo", "application/mp4"].includes(mime);
        const isImage = mime.startsWith("image/");
        if (!isVideo && !isImage) {
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          return res.status(400).json({
            success: false,
            error: { code: "INVALID_FILE_TYPE", message: "Ge\xE7ersiz veya desteklenmeyen dosya i\xE7eri\u011Fi." }
          });
        }
        const fileSize = req.file.size;
        if (isImage && fileSize > 15 * 1024 * 1024) {
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          return res.status(400).json({
            success: false,
            error: { code: "IMAGE_TOO_LARGE", message: "G\xF6rseller maksimum 15MB olabilir." }
          });
        }
        if (isVideo && fileSize > 100 * 1024 * 1024) {
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          return res.status(400).json({
            success: false,
            error: { code: "VIDEO_TOO_LARGE", message: "Videolar maksimum 100MB olabilir." }
          });
        }
        if (isImage) {
          const imageFileName = `${baseId}.webp`;
          const imageFilePath = import_path6.default.join(uploadDir, imageFileName);
          const metadata2 = await (0, import_sharp.default)(tempFilePath).metadata();
          if (metadata2.width && metadata2.width > 8e3 || metadata2.height && metadata2.height > 8e3) {
            if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
            return res.status(400).json({
              success: false,
              error: { code: "BAD_DIMENSIONS", message: "G\xF6rsel boyutlar\u0131 \xE7ok b\xFCy\xFCk (Maksimum 8000x8000)." }
            });
          }
          await (0, import_sharp.default)(tempFilePath).rotate().webp({ quality: 82, effort: 4 }).toFile(imageFilePath);
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          const url = `/uploads/${imageFileName}`;
          return res.json({
            success: true,
            data: {
              url,
              type: "image",
              width: metadata2.width,
              height: metadata2.height
            }
          });
        }
        console.log(`[VIDEO] input: ${tempFilePath}`);
        console.log(`[VIDEO] mime: ${mime}`);
        console.log(`[VIDEO] size: ${(fileSize / 1024 / 1024).toFixed(2)} MB (${fileSize} bytes)`);
        console.log(`[VIDEO] ffmpeg path: ${ffmpegBinary || "NOT FOUND"}`);
        console.log(`[VIDEO] ffprobe path: ${ffprobeBinary || "NOT FOUND"}`);
        if (!ffmpegBinary || !ffprobeBinary) {
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          return res.status(503).json({
            success: false,
            error: {
              code: "FFMPEG_NOT_FOUND",
              message: "Video i\u015Fleme servisi (FFmpeg/FFprobe) sunucuda bulunamad\u0131."
            }
          });
        }
        let metadata;
        try {
          metadata = await new Promise((resolve, reject) => {
            import_fluent_ffmpeg.default.ffprobe(tempFilePath, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
        } catch (probeErr) {
          console.error(`[VIDEO] ffprobe failed for ${baseId}:`, probeErr?.message || probeErr);
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_FILE",
              message: "Dosya ge\xE7erli bir video format\u0131nda de\u011Fil veya bozuk (ffprobe analiz edemedi)."
            }
          });
        }
        const videoStream = metadata.streams?.find((s) => s.codec_type === "video");
        if (!videoStream) {
          console.error(`[VIDEO] No video stream found in ${baseId}`);
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          return res.status(400).json({
            success: false,
            error: { code: "NO_VIDEO_STREAM", message: "Y\xFCklenen dosyada ge\xE7erli bir video ak\u0131\u015F\u0131 bulunamad\u0131." }
          });
        }
        const audioStream = metadata.streams?.find((s) => s.codec_type === "audio");
        const rawDuration = metadata.format?.duration ?? videoStream.duration ?? 0;
        const duration = Math.round(Number(rawDuration) || 0);
        if (duration > 600) {
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          return res.status(400).json({
            success: false,
            error: { code: "VIDEO_TOO_LONG", message: "Video s\xFCresi en fazla 10 dakika (600 saniye) olabilir." }
          });
        }
        const hasAudio = Boolean(audioStream);
        const origWidth = videoStream.width || 1280;
        const origHeight = videoStream.height || 720;
        const videoCodec = videoStream.codec_name || "unknown";
        const audioCodec = audioStream?.codec_name || "none";
        console.log(`[VIDEO] ffprobe result: codec=${videoCodec}, res=${origWidth}x${origHeight}, duration=${duration}s, audioCodec=${audioCodec}, hasAudio=${hasAudio}`);
        if (isAborted) return;
        await videoTranscodeQueue.enqueue(
          baseId,
          () => {
            return new Promise((resolve, reject) => {
              if (isAborted) {
                return reject(new Error("Transcoding aborted by client."));
              }
              let ffmpegStderr = "";
              console.log(`[VIDEO] Starting FFmpeg transcoding for ${baseId}...`);
              const cmd = (0, import_fluent_ffmpeg.default)(tempFilePath).outputOptions([
                "-c:v libx264",
                "-preset veryfast",
                "-crf 26",
                "-pix_fmt yuv420p",
                // Safe scaling: fits within 1280x1280, keeps aspect ratio, ensures even width/height
                "-vf scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "-movflags +faststart"
              ]);
              if (hasAudio) {
                cmd.outputOptions(["-c:a aac", "-b:a 128k", "-ac 2"]);
              } else {
                cmd.outputOptions(["-an"]);
              }
              const timeoutTimer = setTimeout(() => {
                console.error(`[VIDEO] Transcode timeout (180s) reached for ${baseId}`);
                try {
                  cmd.kill("SIGKILL");
                } catch (e) {
                }
                reject(new Error("TIMEOUT"));
              }, 18e4);
              cmd.toFormat("mp4").on("start", (commandLine) => {
                console.log(`[VIDEO] compression command: ${commandLine}`);
              }).on("stderr", (stderrLine) => {
                ffmpegStderr += stderrLine + "\n";
                if (ffmpegStderr.length > 5e4) {
                  ffmpegStderr = ffmpegStderr.slice(-25e3);
                }
              }).on("end", async () => {
                clearTimeout(timeoutTimer);
                activeFfmpegProcess = null;
                console.log(`[VIDEO] Transcoding finished for ${baseId}`);
                try {
                  const seekTime = duration > 1 ? 1 : 0;
                  await new Promise((thumbResolve) => {
                    (0, import_fluent_ffmpeg.default)(finalFilePath).screenshots({
                      timestamps: [seekTime],
                      filename: `${baseId}_thumb.png`,
                      folder: uploadDir,
                      size: "640x?"
                    }).on("end", async () => {
                      const tempPng = import_path6.default.join(uploadDir, `${baseId}_thumb.png`);
                      if (import_fs5.default.existsSync(tempPng)) {
                        try {
                          await (0, import_sharp.default)(tempPng).webp({ quality: 75 }).toFile(thumbFilePath);
                          import_fs5.default.unlinkSync(tempPng);
                        } catch (e) {
                        }
                      }
                      thumbResolve();
                    }).on("error", () => {
                      thumbResolve();
                    });
                  });
                } catch (thumbErr) {
                  console.warn(`[VIDEO] Thumbnail generation warning for ${baseId}:`, thumbErr);
                }
                resolve();
              }).on("error", (err) => {
                clearTimeout(timeoutTimer);
                activeFfmpegProcess = null;
                console.error(`[VIDEO] FFmpeg error for ${baseId}:`, err.message);
                console.error(`[VIDEO] stderr:
${ffmpegStderr.slice(-1500)}`);
                reject(err);
              }).save(finalFilePath);
              activeFfmpegProcess = cmd;
            });
          },
          () => {
            if (activeFfmpegProcess) {
              try {
                activeFfmpegProcess.kill("SIGKILL");
              } catch (e) {
              }
            }
          }
        );
        if (isAborted) return;
        if (!import_fs5.default.existsSync(finalFilePath) || import_fs5.default.statSync(finalFilePath).size === 0) {
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          if (import_fs5.default.existsSync(finalFilePath)) import_fs5.default.unlinkSync(finalFilePath);
          return res.status(500).json({
            success: false,
            error: { code: "TRANSCODE_EMPTY", message: "Video i\u015Flenemedi veya \xE7\u0131kt\u0131 dosyas\u0131 bo\u015F." }
          });
        }
        try {
          const outProbe = await new Promise((resolve, reject) => {
            import_fluent_ffmpeg.default.ffprobe(finalFilePath, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          const outVideoStream = outProbe.streams?.find((s) => s.codec_type === "video");
          if (!outVideoStream) {
            throw new Error("Output contains no valid video stream");
          }
        } catch (valErr) {
          console.error(`[VIDEO] Output validation failed for ${baseId}:`, valErr?.message);
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          if (import_fs5.default.existsSync(finalFilePath)) import_fs5.default.unlinkSync(finalFilePath);
          return res.status(500).json({
            success: false,
            error: { code: "OUTPUT_INVALID", message: "S\u0131k\u0131\u015Ft\u0131r\u0131lan video \xE7\u0131kt\u0131s\u0131 do\u011Frulanamad\u0131." }
          });
        }
        if (import_fs5.default.existsSync(tempFilePath)) {
          import_fs5.default.unlinkSync(tempFilePath);
        }
        const compressedSize = import_fs5.default.statSync(finalFilePath).size;
        console.log(`[VIDEO] Transcoding successful for ${baseId}: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
        const finalVideoUrl = `/uploads/${baseId}_compressed.mp4`;
        const finalThumbUrl = import_fs5.default.existsSync(thumbFilePath) ? `/uploads/${baseId}_thumb.webp` : void 0;
        return res.json({
          success: true,
          data: {
            url: finalVideoUrl,
            thumbnailUrl: finalThumbUrl,
            type: "video",
            duration,
            width: origWidth,
            height: origHeight,
            size: compressedSize
          }
        });
      } catch (error) {
        console.error(`[VIDEO] Media upload/transcode failure for ${baseId}:`, error);
        try {
          if (import_fs5.default.existsSync(tempFilePath)) import_fs5.default.unlinkSync(tempFilePath);
          if (import_fs5.default.existsSync(finalFilePath)) import_fs5.default.unlinkSync(finalFilePath);
          if (import_fs5.default.existsSync(thumbFilePath)) import_fs5.default.unlinkSync(thumbFilePath);
        } catch (e) {
        }
        if (!res.headersSent) {
          const errMsg = error?.message || "";
          if (errMsg === "TIMEOUT") {
            return res.status(504).json({
              success: false,
              error: {
                code: "TIMEOUT",
                message: "Video i\u015Fleme s\xFCresi zaman a\u015F\u0131m\u0131na u\u011Frad\u0131 (180 saniye)."
              }
            });
          }
          return res.status(500).json({
            success: false,
            error: {
              code: "COMPRESSION_FAILED",
              message: "Video s\u0131k\u0131\u015Ft\u0131rma i\u015Flemi s\u0131ras\u0131nda hata olu\u015Ftu. L\xFCtfen videonun ge\xE7erli oldu\u011Fundan emin olup tekrar deneyin."
            }
          });
        }
      }
    });
  }
});

// server/routes/stories.ts
var stories_exports = {};
__export(stories_exports, {
  storiesRouter: () => storiesRouter
});
var import_express18, import_drizzle_orm27, import_zod5, storiesRouter, createStorySchema;
var init_stories = __esm({
  "server/routes/stories.ts"() {
    "use strict";
    import_express18 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm27 = require("drizzle-orm");
    init_auth();
    init_blocks();
    import_zod5 = require("zod");
    storiesRouter = (0, import_express18.Router)();
    createStorySchema = import_zod5.z.object({
      mediaUrl: import_zod5.z.string().min(1),
      mediaType: import_zod5.z.enum(["image", "video"])
    });
    storiesRouter.post("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = createStorySchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        }
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const [story] = await db.insert(stories).values({
          userId: currentUserId,
          mediaUrl: parsed.data.mediaUrl,
          mediaType: parsed.data.mediaType,
          expiresAt
        }).returning();
        res.status(201).json({ success: true, data: story });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    storiesRouter.get("/", async (req, res) => {
      try {
        const currentUserId = optionalAuthContext(req);
        let targetIds = [];
        if (currentUserId) {
          const blockedIds = await getBlockedIds(currentUserId);
          const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm27.eq)(follows.followerId, currentUserId));
          targetIds = followingRecords.map((f) => f.followingId);
          targetIds.push(currentUserId);
          targetIds = targetIds.filter((id) => !blockedIds.includes(id));
        }
        const queryCondition = targetIds.length > 0 ? (0, import_drizzle_orm27.and)((0, import_drizzle_orm27.inArray)(stories.userId, targetIds), (0, import_drizzle_orm27.gt)(stories.expiresAt, /* @__PURE__ */ new Date())) : (0, import_drizzle_orm27.gt)(stories.expiresAt, /* @__PURE__ */ new Date());
        const activeStories = await db.select({
          id: stories.id,
          mediaUrl: stories.mediaUrl,
          mediaType: stories.mediaType,
          createdAt: stories.createdAt,
          expiresAt: stories.expiresAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(stories).innerJoin(users, (0, import_drizzle_orm27.eq)(stories.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm27.eq)(users.id, profiles.userId)).where(queryCondition).orderBy((0, import_drizzle_orm27.desc)(stories.createdAt)).limit(30);
        res.json({ success: true, data: activeStories });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    storiesRouter.post("/:id/view", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const storyId = parseInt(req.params.id);
        await db.insert(storyViews).values({
          storyId,
          userId: currentUserId
        }).onConflictDoNothing();
        res.json({ success: true, data: { message: "G\xF6r\xFCnt\xFClendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    storiesRouter.get("/:id/views", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const storyId = parseInt(req.params.id);
        const [story] = await db.select().from(stories).where((0, import_drizzle_orm27.eq)(stories.id, storyId));
        if (!story || story.userId !== currentUserId) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkiniz yok." } });
        }
        const viewers = await db.select({
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          viewedAt: storyViews.viewedAt
        }).from(storyViews).innerJoin(users, (0, import_drizzle_orm27.eq)(storyViews.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm27.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm27.eq)(storyViews.storyId, storyId)).orderBy((0, import_drizzle_orm27.desc)(storyViews.viewedAt));
        res.json({ success: true, data: viewers });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    storiesRouter.delete("/:id", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const storyId = parseInt(req.params.id);
        const [story] = await db.select().from(stories).where((0, import_drizzle_orm27.eq)(stories.id, storyId));
        if (!story) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Hikaye bulunamad\u0131." } });
        }
        if (story.userId !== currentUserId) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkiniz yok." } });
        }
        await db.delete(stories).where((0, import_drizzle_orm27.eq)(stories.id, storyId));
        res.json({ success: true, data: { message: "Hikaye silindi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/announcements.ts
var announcements_exports = {};
__export(announcements_exports, {
  announcementsRouter: () => announcementsRouter
});
var import_express19, import_drizzle_orm28, announcementsRouter;
var init_announcements = __esm({
  "server/routes/announcements.ts"() {
    "use strict";
    import_express19 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm28 = require("drizzle-orm");
    init_auth();
    announcementsRouter = (0, import_express19.Router)();
    announcementsRouter.get("/active", optionalAuth, async (req, res) => {
      try {
        const now = /* @__PURE__ */ new Date();
        const currentUserId = req.user?.userId;
        const currentUserRole = req.user?.role?.toUpperCase();
        const activeTimeCondition = (0, import_drizzle_orm28.and)(
          (0, import_drizzle_orm28.eq)(announcements.status, "published"),
          (0, import_drizzle_orm28.or)((0, import_drizzle_orm28.isNull)(announcements.startsAt), (0, import_drizzle_orm28.lte)(announcements.startsAt, now)),
          (0, import_drizzle_orm28.or)((0, import_drizzle_orm28.isNull)(announcements.endsAt), (0, import_drizzle_orm28.gt)(announcements.endsAt, now))
        );
        let targetCondition;
        if (currentUserId) {
          targetCondition = (0, import_drizzle_orm28.or)(
            (0, import_drizzle_orm28.eq)(announcements.targetType, "all"),
            (0, import_drizzle_orm28.eq)(announcements.targetType, "authenticated"),
            (0, import_drizzle_orm28.and)(
              (0, import_drizzle_orm28.eq)(announcements.targetType, "specific_role"),
              currentUserRole ? (0, import_drizzle_orm28.eq)(import_drizzle_orm28.sql`UPPER(${announcements.targetRole})`, currentUserRole) : import_drizzle_orm28.sql`false`
            )
          );
        } else {
          targetCondition = (0, import_drizzle_orm28.eq)(announcements.targetType, "all");
        }
        let dismissedIds = [];
        if (currentUserId) {
          const dismissedViews = await db.select({ announcementId: announcementViews.announcementId }).from(announcementViews).where(
            (0, import_drizzle_orm28.and)(
              (0, import_drizzle_orm28.eq)(announcementViews.userId, currentUserId),
              import_drizzle_orm28.sql`${announcementViews.dismissedAt} IS NOT NULL`
            )
          );
          dismissedIds = dismissedViews.map((v) => v.announcementId);
        }
        const whereConditions = [activeTimeCondition, targetCondition];
        if (dismissedIds.length > 0) {
          whereConditions.push((0, import_drizzle_orm28.notInArray)(announcements.id, dismissedIds));
        }
        const items = await db.select({
          id: announcements.id,
          title: announcements.title,
          content: announcements.content,
          imageUrl: announcements.imageUrl,
          buttonText: announcements.buttonText,
          buttonUrl: announcements.buttonUrl,
          priority: announcements.priority,
          startsAt: announcements.startsAt,
          endsAt: announcements.endsAt,
          createdAt: announcements.createdAt
        }).from(announcements).where((0, import_drizzle_orm28.and)(...whereConditions)).orderBy((0, import_drizzle_orm28.desc)(announcements.priority), (0, import_drizzle_orm28.desc)(announcements.createdAt)).limit(5);
        res.json({
          success: true,
          data: items
        });
      } catch (error) {
        console.error("Fetch active announcements error:", error);
        res.status(500).json({
          success: false,
          error: { message: "Duyurular y\xFCklenirken hata olu\u015Ftu." }
        });
      }
    });
    announcementsRouter.post("/:id/seen", optionalAuth, async (req, res) => {
      try {
        const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const announcementId = parseInt(rawId, 10);
        if (isNaN(announcementId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz duyuru ID." } });
          return;
        }
        const currentUserId = req.user?.userId;
        const clickedCta = Boolean(req.body.clickedCta);
        if (currentUserId) {
          await db.insert(announcementViews).values({
            announcementId,
            userId: currentUserId,
            seenAt: /* @__PURE__ */ new Date(),
            dismissedAt: /* @__PURE__ */ new Date(),
            clickedCta
          }).onConflictDoUpdate({
            target: [announcementViews.announcementId, announcementViews.userId],
            set: {
              dismissedAt: /* @__PURE__ */ new Date(),
              ...clickedCta ? { clickedCta: true } : {}
            }
          });
        }
        res.json({ success: true, data: { message: "Duyuru g\xF6r\xFCld\xFC olarak i\u015Faretlendi." } });
      } catch (error) {
        console.error("Mark announcement seen error:", error);
        res.json({ success: false, error: { message: "G\xF6r\xFCld\xFC kaydedilemedi ancak UI g\xFCncellendi." } });
      }
    });
    announcementsRouter.post("/:id/click", optionalAuth, async (req, res) => {
      try {
        const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const announcementId = parseInt(rawId, 10);
        if (isNaN(announcementId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz duyuru ID." } });
          return;
        }
        const currentUserId = req.user?.userId;
        if (currentUserId) {
          await db.insert(announcementViews).values({
            announcementId,
            userId: currentUserId,
            seenAt: /* @__PURE__ */ new Date(),
            clickedCta: true
          }).onConflictDoUpdate({
            target: [announcementViews.announcementId, announcementViews.userId],
            set: {
              clickedCta: true
            }
          });
        }
        res.json({ success: true });
      } catch (error) {
        console.error("Track announcement click error:", error);
        res.json({ success: false });
      }
    });
  }
});

// server/routes/messages.ts
var messages_exports = {};
__export(messages_exports, {
  messagesRouter: () => messagesRouter
});
var import_express20, import_drizzle_orm29, import_zod6, messagesRouter, createMessageSchema;
var init_messages = __esm({
  "server/routes/messages.ts"() {
    "use strict";
    import_express20 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm29 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_blocks();
    init_api();
    import_zod6 = require("zod");
    messagesRouter = (0, import_express20.Router)();
    messagesRouter.get("/conversations", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const memberships = await db.select().from(conversationMembers).where((0, import_drizzle_orm29.eq)(conversationMembers.userId, currentUserId));
        const convIds = memberships.map((m) => m.conversationId);
        if (convIds.length === 0) {
          return res.json({ success: true, data: [] });
        }
        const convs = await db.select().from(conversations).where((0, import_drizzle_orm29.inArray)(conversations.id, convIds)).orderBy((0, import_drizzle_orm29.desc)(conversations.updatedAt)).limit(limit).offset(offset);
        if (convs.length === 0) {
          return res.json({ success: true, data: [] });
        }
        const fetchedConvIds = convs.map((c) => c.id);
        const allOtherMembers = await db.select({
          conversationId: conversationMembers.conversationId,
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(conversationMembers).innerJoin(users, (0, import_drizzle_orm29.eq)(conversationMembers.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm29.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm29.and)((0, import_drizzle_orm29.inArray)(conversationMembers.conversationId, fetchedConvIds), (0, import_drizzle_orm29.not)((0, import_drizzle_orm29.eq)(conversationMembers.userId, currentUserId))));
        const unreadCounts = await db.select({
          conversationId: messages.conversationId,
          count: import_drizzle_orm29.sql`cast(count(*) as integer)`
        }).from(messages).where((0, import_drizzle_orm29.and)(
          (0, import_drizzle_orm29.inArray)(messages.conversationId, fetchedConvIds),
          (0, import_drizzle_orm29.eq)(messages.isRead, false),
          (0, import_drizzle_orm29.not)((0, import_drizzle_orm29.eq)(messages.senderId, currentUserId))
        )).groupBy(messages.conversationId);
        const convIdsSql = import_drizzle_orm29.sql.join(fetchedConvIds.map((id) => import_drizzle_orm29.sql`${id}`), import_drizzle_orm29.sql`, `);
        const lastMessagesResult = await db.execute(import_drizzle_orm29.sql`
      SELECT DISTINCT ON (conversation_id)
        id, conversation_id as "conversationId", sender_id as "senderId", content, media_url as "mediaUrl", is_read as "isRead", created_at as "createdAt"
      FROM messages
      WHERE conversation_id IN (${convIdsSql})
      ORDER BY conversation_id, created_at DESC
    `);
        const lastMessagesMap = lastMessagesResult.rows.reduce((acc, msg) => {
          acc[msg.conversationId] = msg;
          return acc;
        }, {});
        const formattedConvs = convs.map((c, index2) => {
          const otherUser = allOtherMembers.find((m) => m.conversationId === c.id);
          const unreadCount = unreadCounts.find((u) => u.conversationId === c.id)?.count || 0;
          const lastMessage = lastMessagesMap[c.id] || null;
          return {
            ...c,
            otherUser: otherUser ? {
              id: otherUser.id,
              username: otherUser.username,
              displayName: otherUser.displayName,
              avatarUrl: otherUser.avatarUrl
            } : null,
            unreadCount,
            lastMessage
          };
        });
        res.json({ success: true, data: formattedConvs });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    messagesRouter.post("/conversations", requireAuth, standardLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const targetUserId = req.body.targetUserId;
        if (!targetUserId || targetUserId === currentUserId) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz." } });
        const blockedIds = await getBlockedIds(currentUserId);
        if (blockedIds.includes(targetUserId)) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Engelli kullan\u0131c\u0131." } });
        }
        const [currentUserRec] = await db.select({
          id: users.id,
          isMinor: users.isMinor,
          ageVerificationStatus: users.ageVerificationStatus
        }).from(users).where((0, import_drizzle_orm29.eq)(users.id, currentUserId)).limit(1);
        const [targetUserRec] = await db.select({
          id: users.id,
          isMinor: users.isMinor,
          ageVerificationStatus: users.ageVerificationStatus
        }).from(users).where((0, import_drizzle_orm29.eq)(users.id, targetUserId)).limit(1);
        if (!targetUserRec) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
        }
        if (targetUserRec.ageVerificationStatus === "REJECTED_UNDERAGE" || currentUserRec.ageVerificationStatus === "REJECTED_UNDERAGE") {
          return res.status(403).json({ success: false, error: { code: "CHILD_PROTECTION_RESTRICTION", message: "15 ya\u015F alt\u0131 hesaplar mesajla\u015Famaz." } });
        }
        if (targetUserRec.isMinor && !currentUserRec.isMinor) {
          const minorFollowsAdult = await db.select().from(follows).where(
            (0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(follows.followerId, targetUserId), (0, import_drizzle_orm29.eq)(follows.followingId, currentUserId), (0, import_drizzle_orm29.eq)(follows.status, "accepted"))
          ).limit(1);
          const adultFollowsMinor = await db.select().from(follows).where(
            (0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm29.eq)(follows.followingId, targetUserId), (0, import_drizzle_orm29.eq)(follows.status, "accepted"))
          ).limit(1);
          if (minorFollowsAdult.length === 0 || adultFollowsMinor.length === 0) {
            return res.status(403).json({
              success: false,
              error: {
                code: "CHILD_PROTECTION_RESTRICTION",
                message: "10 Ekim 2026 Sosyal A\u011F \xC7ocuk G\xFCvenli\u011Fi Y\xF6netmeli\u011Fi uyar\u0131nca 15-18 ya\u015F aras\u0131 kullan\u0131c\u0131lara kar\u015F\u0131l\u0131kl\u0131 onayl\u0131 takiple\u015Fme olmadan yeti\u015Fkinler taraf\u0131ndan do\u011Frudan mesaj ba\u015Flat\u0131lamaz."
              }
            });
          }
        }
        const targetProfile = await db.select({ messagePreference: profiles.messagePreference }).from(profiles).where((0, import_drizzle_orm29.eq)(profiles.userId, targetUserId)).limit(1);
        if (targetProfile.length > 0) {
          const pref = targetProfile[0].messagePreference;
          if (pref === "NONE") {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu kullan\u0131c\u0131ya mesaj g\xF6nderilemiyor." } });
          } else if (pref === "FOLLOWERS") {
            const isFollowedByTarget = await db.select().from(follows).where((0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(follows.followerId, targetUserId), (0, import_drizzle_orm29.eq)(follows.followingId, currentUserId))).limit(1);
            if (isFollowedByTarget.length === 0) {
              return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullan\u0131c\u0131 sadece takip etti\u011Fi ki\u015Filerden mesaj kabul ediyor." } });
            }
          }
        }
        const userConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where((0, import_drizzle_orm29.eq)(conversationMembers.userId, currentUserId));
        const userConvIds = userConvs.map((c) => c.convId);
        if (userConvIds.length > 0) {
          const targetConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where((0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(conversationMembers.userId, targetUserId), (0, import_drizzle_orm29.inArray)(conversationMembers.conversationId, userConvIds))).limit(1);
          if (targetConvs.length > 0) {
            const [existing] = await db.select().from(conversations).where((0, import_drizzle_orm29.eq)(conversations.id, targetConvs[0].convId)).limit(1);
            return res.json({ success: true, data: existing });
          }
        }
        const [conv] = await db.insert(conversations).values({}).returning();
        await db.insert(conversationMembers).values([
          { conversationId: conv.id, userId: currentUserId },
          { conversationId: conv.id, userId: targetUserId }
        ]);
        res.status(201).json({ success: true, data: conv });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    messagesRouter.get("/conversations/:id/messages", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const conversationId = parseInt(req.params.id);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const membership = await db.select().from(conversationMembers).where((0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(conversationMembers.conversationId, conversationId), (0, import_drizzle_orm29.eq)(conversationMembers.userId, currentUserId))).limit(1);
        if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        const msgs = await db.select({
          id: messages.id,
          content: messages.content,
          mediaUrl: messages.mediaUrl,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
          sender: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(messages).innerJoin(users, (0, import_drizzle_orm29.eq)(messages.senderId, users.id)).leftJoin(profiles, (0, import_drizzle_orm29.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm29.eq)(messages.conversationId, conversationId)).orderBy((0, import_drizzle_orm29.desc)(messages.createdAt)).limit(limit).offset(offset);
        res.json({ success: true, data: msgs });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    createMessageSchema = import_zod6.z.object({
      content: import_zod6.z.string().optional(),
      mediaUrl: import_zod6.z.string().optional()
    });
    messagesRouter.post("/conversations/:id/messages", requireAuth, standardLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const conversationId = parseInt(req.params.id);
        const parsed = createMessageSchema.safeParse(req.body);
        if (!parsed.success || !parsed.data.content && !parsed.data.mediaUrl) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Mesaj i\xE7eri\u011Fi gerekli." } });
        }
        const membership = await db.select().from(conversationMembers).where((0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(conversationMembers.conversationId, conversationId), (0, import_drizzle_orm29.eq)(conversationMembers.userId, currentUserId))).limit(1);
        if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        const [senderUser] = await db.select({
          id: users.id,
          isActive: users.isActive,
          isMinor: users.isMinor,
          ageVerificationStatus: users.ageVerificationStatus
        }).from(users).where((0, import_drizzle_orm29.eq)(users.id, currentUserId)).limit(1);
        if (!senderUser || !senderUser.isActive || senderUser.ageVerificationStatus === "REJECTED_UNDERAGE") {
          return res.status(403).json({ success: false, error: { code: "CHILD_PROTECTION_RESTRICTION", message: "Hesab\u0131n\u0131z ask\u0131ya al\u0131nm\u0131\u015Ft\u0131r veya 15 ya\u015F alt\u0131 k\u0131s\u0131tlamas\u0131na tabidir." } });
        }
        const otherMembers = await db.select({
          id: users.id,
          isActive: users.isActive,
          isMinor: users.isMinor,
          ageVerificationStatus: users.ageVerificationStatus
        }).from(conversationMembers).innerJoin(users, (0, import_drizzle_orm29.eq)(conversationMembers.userId, users.id)).where((0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(conversationMembers.conversationId, conversationId), (0, import_drizzle_orm29.not)((0, import_drizzle_orm29.eq)(conversationMembers.userId, currentUserId))));
        for (const other of otherMembers) {
          if (!other.isActive || other.ageVerificationStatus === "REJECTED_UNDERAGE") {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullan\u0131c\u0131 hesab\u0131 aktif de\u011Fildir." } });
          }
          const isBlocked = await db.select().from(blocks).where((0, import_drizzle_orm29.or)(
            (0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm29.eq)(blocks.blockedId, other.id)),
            (0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(blocks.blockerId, other.id), (0, import_drizzle_orm29.eq)(blocks.blockedId, currentUserId))
          )).limit(1);
          if (isBlocked.length > 0) {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Engellenmi\u015F kullan\u0131c\u0131ya mesaj g\xF6nderilemez." } });
          }
          if (!senderUser.isMinor && other.isMinor) {
            const minorFollowsAdult = await db.select().from(follows).where(
              (0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(follows.followerId, other.id), (0, import_drizzle_orm29.eq)(follows.followingId, currentUserId), (0, import_drizzle_orm29.eq)(follows.status, "accepted"))
            ).limit(1);
            const adultFollowsMinor = await db.select().from(follows).where(
              (0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm29.eq)(follows.followingId, other.id), (0, import_drizzle_orm29.eq)(follows.status, "accepted"))
            ).limit(1);
            if (minorFollowsAdult.length === 0 || adultFollowsMinor.length === 0) {
              return res.status(403).json({
                success: false,
                error: {
                  code: "CHILD_PROTECTION_RESTRICTION",
                  message: "10 Ekim 2026 Y\xF6netmeli\u011Fi uyar\u0131nca 15-18 ya\u015F aras\u0131 \xE7ocuk kullan\u0131c\u0131yla kar\u015F\u0131l\u0131kl\u0131 onayl\u0131 takiple\u015Fme olmadan mesajla\u015F\u0131lamaz."
                }
              });
            }
          }
        }
        const [msg] = await db.insert(messages).values({
          conversationId,
          senderId: currentUserId,
          content: parsed.data.content || null,
          mediaUrl: parsed.data.mediaUrl || null
        }).returning();
        await db.update(conversations).set({ updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm29.eq)(conversations.id, conversationId));
        res.status(201).json({ success: true, data: msg });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    messagesRouter.patch("/conversations/:id/read", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const conversationId = parseInt(req.params.id);
        const membership = await db.select().from(conversationMembers).where((0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(conversationMembers.conversationId, conversationId), (0, import_drizzle_orm29.eq)(conversationMembers.userId, currentUserId))).limit(1);
        if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        await db.update(messages).set({ isRead: true }).where((0, import_drizzle_orm29.and)(
          (0, import_drizzle_orm29.eq)(messages.conversationId, conversationId),
          (0, import_drizzle_orm29.not)((0, import_drizzle_orm29.eq)(messages.senderId, currentUserId)),
          (0, import_drizzle_orm29.eq)(messages.isRead, false)
        ));
        res.json({ success: true, data: { message: "Okundu olarak i\u015Faretlendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/communities.ts
var communities_exports = {};
__export(communities_exports, {
  communitiesRouter: () => communitiesRouter
});
async function getCommunityRole(communityId, userId, ownerId) {
  if (userId === ownerId) {
    return { isOwner: true, isModerator: true, isMember: true, role: "OWNER" };
  }
  const memberRecord = await db.select().from(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, userId))).limit(1);
  if (memberRecord.length === 0) {
    return { isOwner: false, isModerator: false, isMember: false, role: null };
  }
  const role = memberRecord[0].role;
  const isMod = ["admin", "OWNER", "MODERATOR"].includes(role);
  return { isOwner: role === "OWNER", isModerator: isMod, isMember: true, role };
}
var import_express21, import_drizzle_orm30, communitiesRouter;
var init_communities = __esm({
  "server/routes/communities.ts"() {
    "use strict";
    import_express21 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm30 = require("drizzle-orm");
    init_auth();
    init_api();
    init_postStats();
    init_blocks();
    communitiesRouter = (0, import_express21.Router)();
    communitiesRouter.get("/", optionalAuth, async (req, res) => {
      try {
        const currentUserId = optionalAuthContext(req);
        const searchQuery = req.query.search || "";
        const category = req.query.category || "";
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 30 };
        const offset = (page - 1) * limit;
        const conditions = [(0, import_drizzle_orm30.isNull)(communities.deletedAt)];
        if (searchQuery.trim()) {
          const q = `%${searchQuery.trim().toLowerCase()}%`;
          conditions.push((0, import_drizzle_orm30.or)(
            (0, import_drizzle_orm30.ilike)(communities.name, q),
            (0, import_drizzle_orm30.ilike)(communities.slug, q),
            (0, import_drizzle_orm30.ilike)(communities.description, q)
          ));
        }
        if (category.trim() && category !== "T\xFCm\xFC") {
          conditions.push((0, import_drizzle_orm30.eq)(communities.category, category.trim()));
        }
        const list = await db.select({
          id: communities.id,
          name: communities.name,
          slug: communities.slug,
          description: communities.description,
          avatarUrl: communities.avatarUrl,
          coverUrl: communities.coverUrl,
          category: communities.category,
          isPrivate: communities.isPrivate,
          ownerId: communities.ownerId,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          memberCount: import_drizzle_orm30.sql`(SELECT count(*)::int FROM ${communityMembers} WHERE ${communityMembers.communityId} = ${communities.id})`,
          postCount: import_drizzle_orm30.sql`(SELECT count(*)::int FROM ${posts} WHERE ${posts.communityId} = ${communities.id} AND ${posts.moderationStatus} = 'APPROVED')`
        }).from(communities).where((0, import_drizzle_orm30.and)(...conditions)).orderBy((0, import_drizzle_orm30.desc)(communities.createdAt)).limit(limit).offset(offset);
        let enrichedList = list;
        if (currentUserId && currentUserId !== -1) {
          const userMemberships = await db.select({ communityId: communityMembers.communityId, role: communityMembers.role }).from(communityMembers).where((0, import_drizzle_orm30.eq)(communityMembers.userId, currentUserId));
          const memberMap = new Map(userMemberships.map((m) => [m.communityId, m.role]));
          enrichedList = list.map((c) => {
            const role = c.ownerId === currentUserId ? "OWNER" : memberMap.get(c.id) || null;
            return {
              ...c,
              isMember: !!role,
              role,
              isOwner: c.ownerId === currentUserId,
              isModerator: c.ownerId === currentUserId || (role ? ["admin", "OWNER", "MODERATOR"].includes(role) : false)
            };
          });
        }
        res.json({ success: true, data: enrichedList });
      } catch (error) {
        console.error("Error fetching communities:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.post("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const { name, description, slug, category, isPrivate, rules, avatarUrl, coverUrl } = req.body;
        if (!name || typeof name !== "string" || name.trim().length < 3) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Topluluk ad\u0131 en az 3 karakter olmal\u0131d\u0131r." } });
        }
        if (!slug || typeof slug !== "string") {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7erli bir slug gereklidir." } });
        }
        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
        if (cleanSlug.length < 3) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Slug en az 3 alfan\xFCmerik karakter olmal\u0131d\u0131r." } });
        }
        const existing = await db.select({ id: communities.id }).from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.slug, cleanSlug), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (existing.length > 0) {
          return res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Bu topluluk adresi (slug) zaten kullan\u0131mda." } });
        }
        const [community] = await db.insert(communities).values({
          name: name.trim(),
          description: description?.trim() || null,
          slug: cleanSlug,
          category: category?.trim() || "Genel",
          isPrivate: Boolean(isPrivate),
          rules: rules?.trim() || null,
          avatarUrl: avatarUrl?.trim() || null,
          coverUrl: coverUrl?.trim() || null,
          ownerId: currentUserId
        }).returning();
        await db.insert(communityMembers).values({
          communityId: community.id,
          userId: currentUserId,
          role: "OWNER"
        }).onConflictDoNothing();
        await db.insert(communityAuditLogs).values({
          communityId: community.id,
          actorId: currentUserId,
          action: "COMMUNITY_CREATED",
          details: `Topluluk olu\u015Fturuldu: ${community.name}`
        });
        res.status(201).json({ success: true, data: { ...community, isMember: true, isOwner: true, isModerator: true, role: "OWNER", memberCount: 1 } });
      } catch (error) {
        console.error("Error creating community:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Topluluk olu\u015Fturulurken hata meydana geldi." } });
      }
    });
    communitiesRouter.get("/:slug", optionalAuth, async (req, res) => {
      try {
        const slug = req.params.slug;
        const currentUserId = optionalAuthContext(req);
        const [community] = await db.select({
          id: communities.id,
          name: communities.name,
          slug: communities.slug,
          description: communities.description,
          avatarUrl: communities.avatarUrl,
          coverUrl: communities.coverUrl,
          category: communities.category,
          isPrivate: communities.isPrivate,
          rules: communities.rules,
          ownerId: communities.ownerId,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          owner: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(communities).innerJoin(users, (0, import_drizzle_orm30.eq)(communities.ownerId, users.id)).leftJoin(profiles, (0, import_drizzle_orm30.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.slug, slug), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131 veya silinmi\u015F." } });
        }
        if (currentUserId && currentUserId !== -1) {
          const blockedIds = await getBlockedIds(currentUserId);
          if (blockedIds.includes(community.ownerId)) {
            return res.status(403).json({ success: false, error: { code: "BLOCKED", message: "Bu toplulu\u011Fa eri\u015Fiminiz k\u0131s\u0131tlanm\u0131\u015Ft\u0131r." } });
          }
        }
        const [memberCountRes] = await db.select({ count: import_drizzle_orm30.sql`count(*)::int` }).from(communityMembers).where((0, import_drizzle_orm30.eq)(communityMembers.communityId, community.id));
        const [postCountRes] = await db.select({ count: import_drizzle_orm30.sql`count(*)::int` }).from(posts).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(posts.communityId, community.id), (0, import_drizzle_orm30.eq)(posts.moderationStatus, "APPROVED")));
        let isMember = false;
        let isOwner = false;
        let isModerator = false;
        let role = null;
        let hasPendingRequest = false;
        if (currentUserId && currentUserId !== -1) {
          const roleInfo = await getCommunityRole(community.id, currentUserId, community.ownerId);
          isMember = roleInfo.isMember;
          isOwner = roleInfo.isOwner;
          isModerator = roleInfo.isModerator;
          role = roleInfo.role;
          if (!isMember && community.isPrivate) {
            const [pendingReq] = await db.select({ id: communityJoinRequests.id }).from(communityJoinRequests).where((0, import_drizzle_orm30.and)(
              (0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, community.id),
              (0, import_drizzle_orm30.eq)(communityJoinRequests.userId, currentUserId),
              (0, import_drizzle_orm30.eq)(communityJoinRequests.status, "PENDING")
            )).limit(1);
            hasPendingRequest = !!pendingReq;
          }
        }
        res.json({
          success: true,
          data: {
            ...community,
            memberCount: memberCountRes?.count || 0,
            postCount: postCountRes?.count || 0,
            isMember,
            isOwner,
            isModerator,
            role,
            hasPendingRequest
          }
        });
      } catch (error) {
        console.error("Error fetching community by slug:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.put("/:id", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        if (community.ownerId !== currentUserId) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Topluluk ayarlar\u0131n\u0131 yaln\u0131zca topluluk kurucusu d\xFCzenleyebilir." } });
        }
        const { name, description, category, isPrivate, rules, avatarUrl, coverUrl } = req.body;
        const updateData = {
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (name !== void 0) {
          if (!name || name.trim().length < 3) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Topluluk ad\u0131 en az 3 karakter olmal\u0131d\u0131r." } });
          }
          updateData.name = name.trim();
        }
        if (description !== void 0) updateData.description = description?.trim() || null;
        if (category !== void 0) updateData.category = category?.trim() || "Genel";
        if (isPrivate !== void 0) updateData.isPrivate = Boolean(isPrivate);
        if (rules !== void 0) updateData.rules = rules?.trim() || null;
        if (avatarUrl !== void 0) updateData.avatarUrl = avatarUrl?.trim() || null;
        if (coverUrl !== void 0) updateData.coverUrl = coverUrl?.trim() || null;
        const [updated] = await db.update(communities).set(updateData).where((0, import_drizzle_orm30.eq)(communities.id, communityId)).returning();
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          action: "SETTINGS_UPDATED",
          details: "Topluluk ayarlar\u0131 g\xFCncellendi."
        });
        res.json({ success: true, data: updated });
      } catch (error) {
        console.error("Error updating community:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.delete("/:id", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        if (community.ownerId !== currentUserId) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Toplulu\u011Fu yaln\u0131zca topluluk kurucusu silebilir." } });
        }
        await db.update(communities).set({ deletedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(communities.id, communityId));
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          action: "COMMUNITY_DELETED",
          details: `Topluluk silindi (soft delete): ${community.name}`
        });
        res.json({ success: true, data: { message: "Topluluk ba\u015Far\u0131yla silindi." } });
      } catch (error) {
        console.error("Error deleting community:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.post("/:id/join", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        const blockedIds = await getBlockedIds(currentUserId);
        if (blockedIds.includes(community.ownerId)) {
          return res.status(403).json({ success: false, error: { code: "BLOCKED", message: "Bu toplulu\u011Fa kat\u0131lamazs\u0131n\u0131z." } });
        }
        const [existingMember] = await db.select().from(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, currentUserId))).limit(1);
        if (existingMember || community.ownerId === currentUserId) {
          return res.status(400).json({ success: false, error: { code: "ALREADY_MEMBER", message: "Zaten bu toplulu\u011Fun \xFCyesisiniz." } });
        }
        if (community.isPrivate) {
          const [existingRequest] = await db.select().from(communityJoinRequests).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, communityId), (0, import_drizzle_orm30.eq)(communityJoinRequests.userId, currentUserId))).limit(1);
          if (existingRequest) {
            if (existingRequest.status === "PENDING") {
              return res.status(400).json({ success: false, error: { code: "ALREADY_REQUESTED", message: "Zaten bekleyen bir kat\u0131l\u0131m iste\u011Finiz bulunmaktad\u0131r." } });
            } else if (existingRequest.status === "REJECTED") {
              await db.update(communityJoinRequests).set({ status: "PENDING", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(communityJoinRequests.id, existingRequest.id));
            }
          } else {
            await db.insert(communityJoinRequests).values({
              communityId,
              userId: currentUserId,
              status: "PENDING",
              note: req.body.note || null
            });
          }
          const mods = await db.select({ userId: communityMembers.userId }).from(communityMembers).where((0, import_drizzle_orm30.and)(
            (0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId),
            (0, import_drizzle_orm30.inArray)(communityMembers.role, ["OWNER", "MODERATOR", "admin"])
          ));
          const notifyUserIds = /* @__PURE__ */ new Set([community.ownerId, ...mods.map((m) => m.userId)]);
          notifyUserIds.delete(currentUserId);
          for (const targetId of notifyUserIds) {
            await db.insert(notifications).values({
              recipientId: targetId,
              actorId: currentUserId,
              type: "community_join_request",
              communityId
            });
          }
          return res.json({
            success: true,
            data: {
              status: "PENDING",
              message: "Kat\u0131l\u0131m iste\u011Finiz topluluk y\xF6neticilerine iletildi."
            }
          });
        }
        await db.insert(communityMembers).values({
          communityId,
          userId: currentUserId,
          role: "MEMBER"
        }).onConflictDoNothing();
        res.json({
          success: true,
          data: {
            status: "JOINED",
            message: "Toplulu\u011Fa kat\u0131ld\u0131n\u0131z."
          }
        });
      } catch (error) {
        console.error("Error joining community:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.delete("/:id/leave", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        if (community.ownerId === currentUserId) {
          return res.status(400).json({
            success: false,
            error: {
              code: "OWNER_CANNOT_LEAVE",
              message: "Topluluk kurucusu topluluktan ayr\u0131lamaz. L\xFCtfen \xF6nce topluluk sahipli\u011Fini ba\u015Fka bir \xFCyeye devredin veya toplulu\u011Fu silin."
            }
          });
        }
        const [membership] = await db.select().from(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, currentUserId))).limit(1);
        if (!membership) {
          return res.status(400).json({ success: false, error: { code: "NOT_MEMBER", message: "Bu toplulu\u011Fun \xFCyesi de\u011Filsiniz." } });
        }
        await db.delete(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, currentUserId)));
        await db.delete(communityJoinRequests).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, communityId), (0, import_drizzle_orm30.eq)(communityJoinRequests.userId, currentUserId)));
        res.json({ success: true, data: { message: "Topluluktan ba\u015Far\u0131yla ayr\u0131ld\u0131n\u0131z." } });
      } catch (error) {
        console.error("Error leaving community:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.post("/:id/transfer-ownership", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const { newOwnerId } = req.body;
        if (isNaN(communityId) || !newOwnerId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz parametre." } });
        }
        const targetUserId = parseInt(newOwnerId);
        if (isNaN(targetUserId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz hedef kullan\u0131c\u0131 ID." } });
        }
        if (currentUserId === targetUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Sahipli\u011Fi kendinize devredemezsiniz." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        if (community.ownerId !== currentUserId) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Sahipli\u011Fi devretme yetkisi yaln\u0131zca topluluk kurucusuna aittir." } });
        }
        const [targetMembership] = await db.select().from(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, targetUserId))).limit(1);
        if (!targetMembership) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Sahiplik yaln\u0131zca mevcut bir topluluk \xFCyesine devredilebilir." } });
        }
        await db.update(communities).set({ ownerId: targetUserId, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(communities.id, communityId));
        await db.update(communityMembers).set({ role: "MEMBER" }).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, currentUserId)));
        await db.update(communityMembers).set({ role: "OWNER" }).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, targetUserId)));
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          targetUserId,
          action: "OWNERSHIP_TRANSFERRED",
          details: `Topluluk sahipli\u011Fi devredildi: ${targetUserId}`
        });
        await db.insert(notifications).values({
          recipientId: targetUserId,
          actorId: currentUserId,
          type: "community_role_updated",
          communityId
        });
        res.json({ success: true, data: { message: "Topluluk sahipli\u011Fi ba\u015Far\u0131yla devredildi." } });
      } catch (error) {
        console.error("Error transferring ownership:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:id/members", optionalAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const searchQuery = req.query.search || "";
        const roleFilter = req.query.role || "";
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 50 };
        const offset = (page - 1) * limit;
        const conditions = [(0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId)];
        if (searchQuery.trim()) {
          const q = `%${searchQuery.trim().toLowerCase()}%`;
          conditions.push((0, import_drizzle_orm30.or)(
            (0, import_drizzle_orm30.ilike)(users.username, q),
            (0, import_drizzle_orm30.ilike)(profiles.displayName, q)
          ));
        }
        if (roleFilter && ["OWNER", "MODERATOR", "MEMBER"].includes(roleFilter)) {
          if (roleFilter === "MODERATOR") {
            conditions.push((0, import_drizzle_orm30.inArray)(communityMembers.role, ["MODERATOR", "admin"]));
          } else {
            conditions.push((0, import_drizzle_orm30.eq)(communityMembers.role, roleFilter));
          }
        }
        const members = await db.select({
          id: communityMembers.userId,
          role: communityMembers.role,
          joinedAt: communityMembers.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(communityMembers).innerJoin(users, (0, import_drizzle_orm30.eq)(communityMembers.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm30.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm30.and)(...conditions)).orderBy(
          // Order: OWNER first, then MODERATOR, then MEMBER
          import_drizzle_orm30.sql`CASE WHEN ${communityMembers.role} IN ('OWNER', 'admin') THEN 1 WHEN ${communityMembers.role} = 'MODERATOR' THEN 2 ELSE 3 END`,
          (0, import_drizzle_orm30.desc)(communityMembers.createdAt)
        ).limit(limit).offset(offset);
        res.json({ success: true, data: members });
      } catch (error) {
        console.error("Error fetching community members:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.delete("/:id/members/:targetUserId", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const targetUserId = parseInt(req.params.targetUserId);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId) || isNaN(targetUserId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz parametre." } });
        }
        if (currentUserId === targetUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi bu b\xF6l\xFCmden \xE7\u0131karamazs\u0131n\u0131z, l\xFCtfen topluluktan ayr\u0131lma se\xE7ene\u011Fini kullan\u0131n." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        if (community.ownerId === targetUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk kurucusu topluluktan \xE7\u0131kar\u0131lamaz." } });
        }
        const operatorRole = await getCommunityRole(communityId, currentUserId, community.ownerId);
        if (!operatorRole.isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flemi yapmak i\xE7in y\xF6netici veya kurucu yetkisine sahip olmal\u0131s\u0131n\u0131z." } });
        }
        const [targetMembership] = await db.select().from(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, targetUserId))).limit(1);
        if (!targetMembership) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bu toplulu\u011Fun \xFCyesi de\u011Fil." } });
        }
        const isTargetMod = ["admin", "OWNER", "MODERATOR"].includes(targetMembership.role);
        if (isTargetMod && !operatorRole.isOwner) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Y\xF6neticileri yaln\u0131zca topluluk kurucusu \xE7\u0131karabilir." } });
        }
        await db.delete(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, targetUserId)));
        await db.delete(communityJoinRequests).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, communityId), (0, import_drizzle_orm30.eq)(communityJoinRequests.userId, targetUserId)));
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          targetUserId,
          action: "MEMBER_REMOVED",
          details: "\xDCye topluluktan \xE7\u0131kar\u0131ld\u0131."
        });
        await db.insert(notifications).values({
          recipientId: targetUserId,
          actorId: currentUserId,
          type: "community_removed",
          communityId
        });
        res.json({ success: true, data: { message: "\xDCye ba\u015Far\u0131yla \xE7\u0131kar\u0131ld\u0131." } });
      } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.put("/:id/members/:targetUserId/role", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const targetUserId = parseInt(req.params.targetUserId);
        const currentUserId = requireAuthContext(req);
        const { role } = req.body;
        if (isNaN(communityId) || isNaN(targetUserId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz parametre." } });
        }
        if (!role || !["MODERATOR", "MEMBER"].includes(role)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Rol 'MODERATOR' veya 'MEMBER' olmal\u0131d\u0131r." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        if (community.ownerId !== currentUserId) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Y\xF6netici atama ve kald\u0131rma yetkisi yaln\u0131zca topluluk kurucusuna aittir." } });
        }
        if (targetUserId === community.ownerId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk kurucusunun rol\xFC bu alandan de\u011Fi\u015Ftirilemez." } });
        }
        const [targetMembership] = await db.select().from(communityMembers).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, targetUserId))).limit(1);
        if (!targetMembership) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bu toplulu\u011Fun \xFCyesi de\u011Fil." } });
        }
        await db.update(communityMembers).set({ role }).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm30.eq)(communityMembers.userId, targetUserId)));
        const action = role === "MODERATOR" ? "ADMIN_ADDED" : "ADMIN_REMOVED";
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          targetUserId,
          action,
          details: role === "MODERATOR" ? "Y\xF6netici olarak atand\u0131." : "Y\xF6neticilik yetkisi kald\u0131r\u0131ld\u0131."
        });
        await db.insert(notifications).values({
          recipientId: targetUserId,
          actorId: currentUserId,
          type: "community_role_updated",
          communityId
        });
        res.json({
          success: true,
          data: {
            message: role === "MODERATOR" ? "Kullan\u0131c\u0131 y\xF6netici olarak atand\u0131." : "Kullan\u0131c\u0131n\u0131n y\xF6neticilik yetkisi kald\u0131r\u0131ld\u0131.",
            role
          }
        });
      } catch (error) {
        console.error("Error updating member role:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:id/requests", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
        if (!roleInfo.isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kat\u0131l\u0131m isteklerini yaln\u0131zca y\xF6neticiler g\xF6r\xFCnt\xFCleyebilir." } });
        }
        const requests = await db.select({
          id: communityJoinRequests.id,
          status: communityJoinRequests.status,
          note: communityJoinRequests.note,
          createdAt: communityJoinRequests.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(communityJoinRequests).innerJoin(users, (0, import_drizzle_orm30.eq)(communityJoinRequests.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm30.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm30.and)(
          (0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, communityId),
          (0, import_drizzle_orm30.eq)(communityJoinRequests.status, "PENDING")
        )).orderBy((0, import_drizzle_orm30.desc)(communityJoinRequests.createdAt));
        res.json({ success: true, data: requests });
      } catch (error) {
        console.error("Error fetching join requests:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.post("/:id/requests/:requestId/accept", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const requestId = parseInt(req.params.requestId);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId) || isNaN(requestId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz parametre." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
        if (!roleInfo.isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flemi yapmak i\xE7in yetkiniz yok." } });
        }
        const [request] = await db.select().from(communityJoinRequests).where((0, import_drizzle_orm30.and)(
          (0, import_drizzle_orm30.eq)(communityJoinRequests.id, requestId),
          (0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, communityId),
          (0, import_drizzle_orm30.eq)(communityJoinRequests.status, "PENDING")
        )).limit(1);
        if (!request) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Bekleyen kat\u0131l\u0131m iste\u011Fi bulunamad\u0131." } });
        }
        await db.insert(communityMembers).values({
          communityId,
          userId: request.userId,
          role: "MEMBER"
        }).onConflictDoNothing();
        await db.update(communityJoinRequests).set({ status: "ACCEPTED", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(communityJoinRequests.id, requestId));
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          targetUserId: request.userId,
          action: "REQUEST_ACCEPTED",
          details: "Kat\u0131l\u0131m iste\u011Fi onayland\u0131."
        });
        await db.insert(notifications).values({
          recipientId: request.userId,
          actorId: currentUserId,
          type: "community_request_accepted",
          communityId
        });
        res.json({ success: true, data: { message: "Kat\u0131l\u0131m iste\u011Fi onayland\u0131." } });
      } catch (error) {
        console.error("Error accepting join request:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.post("/:id/requests/:requestId/reject", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const requestId = parseInt(req.params.requestId);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId) || isNaN(requestId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz parametre." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
        if (!roleInfo.isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flemi yapmak i\xE7in yetkiniz yok." } });
        }
        const [request] = await db.select().from(communityJoinRequests).where((0, import_drizzle_orm30.and)(
          (0, import_drizzle_orm30.eq)(communityJoinRequests.id, requestId),
          (0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, communityId),
          (0, import_drizzle_orm30.eq)(communityJoinRequests.status, "PENDING")
        )).limit(1);
        if (!request) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Bekleyen kat\u0131l\u0131m iste\u011Fi bulunamad\u0131." } });
        }
        await db.update(communityJoinRequests).set({ status: "REJECTED", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(communityJoinRequests.id, requestId));
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          targetUserId: request.userId,
          action: "REQUEST_REJECTED",
          details: "Kat\u0131l\u0131m iste\u011Fi reddedildi."
        });
        await db.insert(notifications).values({
          recipientId: request.userId,
          actorId: currentUserId,
          type: "community_request_rejected",
          communityId
        });
        res.json({ success: true, data: { message: "Kat\u0131l\u0131m iste\u011Fi reddedildi." } });
      } catch (error) {
        console.error("Error rejecting join request:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:id/stats", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
        if (!roleInfo.isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Topluluk istatistiklerini yaln\u0131zca y\xF6neticiler g\xF6rebilir." } });
        }
        const [memberCountRes] = await db.select({ count: import_drizzle_orm30.sql`count(*)::int` }).from(communityMembers).where((0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId));
        const [pendingRequestsRes] = await db.select({ count: import_drizzle_orm30.sql`count(*)::int` }).from(communityJoinRequests).where((0, import_drizzle_orm30.and)(
          (0, import_drizzle_orm30.eq)(communityJoinRequests.communityId, communityId),
          (0, import_drizzle_orm30.eq)(communityJoinRequests.status, "PENDING")
        ));
        const [totalPostsRes] = await db.select({ count: import_drizzle_orm30.sql`count(*)::int` }).from(posts).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(posts.communityId, communityId), (0, import_drizzle_orm30.eq)(posts.moderationStatus, "APPROVED")));
        const [moderatorsRes] = await db.select({ count: import_drizzle_orm30.sql`count(*)::int` }).from(communityMembers).where((0, import_drizzle_orm30.and)(
          (0, import_drizzle_orm30.eq)(communityMembers.communityId, communityId),
          (0, import_drizzle_orm30.inArray)(communityMembers.role, ["OWNER", "MODERATOR", "admin"])
        ));
        res.json({
          success: true,
          data: {
            totalMembers: memberCountRes?.count || 0,
            pendingRequests: pendingRequestsRes?.count || 0,
            totalPosts: totalPostsRes?.count || 0,
            moderatorCount: moderatorsRes?.count || 1
          }
        });
      } catch (error) {
        console.error("Error fetching community stats:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:id/audit-logs", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
        if (!roleInfo.isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Denetim kay\u0131tlar\u0131n\u0131 yaln\u0131zca y\xF6neticiler g\xF6rebilir." } });
        }
        const logs = await db.select({
          id: communityAuditLogs.id,
          action: communityAuditLogs.action,
          details: communityAuditLogs.details,
          createdAt: communityAuditLogs.createdAt,
          actor: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(communityAuditLogs).innerJoin(users, (0, import_drizzle_orm30.eq)(communityAuditLogs.actorId, users.id)).leftJoin(profiles, (0, import_drizzle_orm30.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm30.eq)(communityAuditLogs.communityId, communityId)).orderBy((0, import_drizzle_orm30.desc)(communityAuditLogs.createdAt)).limit(100);
        res.json({ success: true, data: logs });
      } catch (error) {
        console.error("Error fetching community audit logs:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:id/posts", optionalAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = optionalAuthContext(req);
        if (isNaN(communityId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz topluluk ID." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        if (community.isPrivate) {
          if (!currentUserId || currentUserId === -1) {
            return res.status(403).json({ success: false, error: { code: "PRIVATE_COMMUNITY", message: "Bu topluluk \xF6zeldir. G\xF6nderileri g\xF6r\xFCnt\xFClemek i\xE7in \xFCye olmal\u0131s\u0131n\u0131z." } });
          }
          const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
          if (!roleInfo.isMember) {
            return res.status(403).json({ success: false, error: { code: "PRIVATE_COMMUNITY", message: "Bu topluluk \xF6zeldir. G\xF6nderileri g\xF6r\xFCnt\xFClemek i\xE7in \xFCye olmal\u0131s\u0131n\u0131z." } });
          }
        }
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const communityPosts = await db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(posts).innerJoin(users, (0, import_drizzle_orm30.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm30.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(posts.communityId, communityId), (0, import_drizzle_orm30.eq)(posts.moderationStatus, "APPROVED"))).orderBy((0, import_drizzle_orm30.desc)(posts.createdAt)).limit(limit).offset(offset);
        const formattedPosts = await populatePostStats(communityPosts, currentUserId || -1);
        res.json({ success: true, data: formattedPosts });
      } catch (error) {
        console.error("Error fetching community posts:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.delete("/:id/posts/:postId", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const postId = parseInt(req.params.postId);
        const currentUserId = requireAuthContext(req);
        if (isNaN(communityId) || isNaN(postId)) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz parametre." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(communities.id, communityId), (0, import_drizzle_orm30.isNull)(communities.deletedAt))).limit(1);
        if (!community) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        }
        const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
        if (!roleInfo.isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Topluluk g\xF6nderilerini yaln\u0131zca y\xF6neticiler kald\u0131rabilir." } });
        }
        const [post] = await db.select().from(posts).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(posts.id, postId), (0, import_drizzle_orm30.eq)(posts.communityId, communityId))).limit(1);
        if (!post) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bu toplulukta bulunamad\u0131." } });
        }
        await db.update(posts).set({ moderationStatus: "REJECTED", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(posts.id, postId));
        await db.insert(communityAuditLogs).values({
          communityId,
          actorId: currentUserId,
          targetUserId: post.userId,
          action: "POST_REMOVED",
          details: `Topluluk i\xE7i g\xF6nderi kald\u0131r\u0131ld\u0131 (#${postId}).`
        });
        res.json({ success: true, data: { message: "G\xF6nderi topluluktan ba\u015Far\u0131yla kald\u0131r\u0131ld\u0131." } });
      } catch (error) {
        console.error("Error removing community post:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/reactions.ts
var reactions_exports = {};
__export(reactions_exports, {
  reactionsRouter: () => reactionsRouter
});
var import_express22, import_drizzle_orm31, import_zod7, reactionsRouter, reactionSchema;
var init_reactions = __esm({
  "server/routes/reactions.ts"() {
    "use strict";
    import_express22 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm31 = require("drizzle-orm");
    init_auth();
    init_notifications();
    init_rateLimiter();
    init_visibility();
    import_zod7 = require("zod");
    reactionsRouter = (0, import_express22.Router)();
    reactionSchema = import_zod7.z.object({
      type: import_zod7.z.enum(["like", "love", "haha", "wow", "sad", "angry"])
    });
    reactionsRouter.post("/:id/reaction", requireAuth, standardLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const parsed = reactionSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm31.eq)(posts.id, postId)).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        if (postRecord[0].userId === currentUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendi g\xF6nderinize tepki veremezsiniz." } });
        }
        if (postRecord[0].moderationStatus === "REJECTED" || postRecord[0].moderationStatus === "BLOCKED") {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderi k\u0131s\u0131tlanm\u0131\u015F." } });
        }
        let isNew = false;
        try {
          await db.transaction(async (tx) => {
            const existing = await tx.select().from(reactions).where((0, import_drizzle_orm31.and)((0, import_drizzle_orm31.eq)(reactions.postId, postId), (0, import_drizzle_orm31.eq)(reactions.userId, currentUserId))).limit(1);
            if (existing.length > 0) {
              await tx.update(reactions).set({ type: parsed.data.type }).where((0, import_drizzle_orm31.eq)(reactions.id, existing[0].id));
            } else {
              await tx.insert(reactions).values({ postId, userId: currentUserId, type: parsed.data.type });
              await tx.update(posts).set({ baseScore: import_drizzle_orm31.sql`GREATEST(${posts.baseScore} + 1, 0)` }).where((0, import_drizzle_orm31.eq)(posts.id, postId));
              isNew = true;
            }
          });
        } catch (e) {
          if (e.code !== "23505") throw e;
        }
        if (isNew) {
          await notify(currentUserId, postRecord[0].userId, "reaction", postId);
        }
        res.json({ success: true, data: { message: "Tepki verildi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    reactionsRouter.delete("/:id/reaction", requireAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm31.eq)(posts.id, postId)).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(reactions).where((0, import_drizzle_orm31.and)((0, import_drizzle_orm31.eq)(reactions.postId, postId), (0, import_drizzle_orm31.eq)(reactions.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(reactions).where((0, import_drizzle_orm31.and)((0, import_drizzle_orm31.eq)(reactions.postId, postId), (0, import_drizzle_orm31.eq)(reactions.userId, currentUserId)));
            await tx.update(posts).set({ baseScore: import_drizzle_orm31.sql`GREATEST(${posts.baseScore} - 1, 0)` }).where((0, import_drizzle_orm31.eq)(posts.id, postId));
          }
        });
        res.json({ success: true, data: { message: "Tepki kald\u0131r\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/comments.ts
var comments_exports = {};
__export(comments_exports, {
  commentsRouter: () => commentsRouter
});
var import_express23, import_drizzle_orm32, commentsRouter;
var init_comments = __esm({
  "server/routes/comments.ts"() {
    "use strict";
    import_express23 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm32 = require("drizzle-orm");
    init_cursor();
    init_auth();
    init_api();
    init_visibility();
    commentsRouter = (0, import_express23.Router)();
    commentsRouter.get("/:id/comments", optionalAuth, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (!await verifyPostAccess(postId, currentUserId)) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu g\xF6nderiye eri\u015Fiminiz yok." } });
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: void 0 };
        let cursorCondition = void 0;
        if (cursor) {
          const decoded = decodeCursor(cursor);
          if (decoded) {
            cursorCondition = (0, import_drizzle_orm32.or)((0, import_drizzle_orm32.lt)(comments.createdAt, decoded.createdAt), (0, import_drizzle_orm32.and)((0, import_drizzle_orm32.eq)(comments.createdAt, decoded.createdAt), (0, import_drizzle_orm32.lt)(comments.id, decoded.id)));
          }
        }
        const list = await db.select({
          id: comments.id,
          content: comments.content,
          parentId: comments.parentId,
          createdAt: comments.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(comments).innerJoin(users, (0, import_drizzle_orm32.eq)(comments.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm32.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm32.and)((0, import_drizzle_orm32.eq)(comments.postId, postId), (0, import_drizzle_orm32.eq)(comments.moderationStatus, "APPROVED"), cursorCondition ? cursorCondition : void 0)).orderBy((0, import_drizzle_orm32.desc)(comments.createdAt), (0, import_drizzle_orm32.desc)(comments.id)).limit(limit);
        let nextCursor = void 0;
        if (list.length === limit) {
          const last = list[list.length - 1];
          nextCursor = encodeCursor(last.createdAt, last.id);
        }
        res.json({ success: true, data: list, meta: { nextCursor } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/reports.ts
var reports_exports = {};
__export(reports_exports, {
  reportsRouter: () => reportsRouter
});
var import_express24, import_drizzle_orm33, import_zod8, reportsRouter, reportSchema;
var init_reports = __esm({
  "server/routes/reports.ts"() {
    "use strict";
    import_express24 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm33 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    import_zod8 = require("zod");
    reportsRouter = (0, import_express24.Router)();
    reportSchema = import_zod8.z.object({
      targetType: import_zod8.z.enum(["user", "post", "comment", "community"]),
      targetId: import_zod8.z.number(),
      reason: import_zod8.z.string().min(10).max(1e3)
    });
    reportsRouter.post("/", requireAuth, standardLimiter, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = reportSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Ge\xE7ersiz veri." } });
        }
        const { targetType, targetId, reason } = parsed.data;
        const existing = await db.select().from(reports).where(
          (0, import_drizzle_orm33.and)(
            (0, import_drizzle_orm33.eq)(reports.reporterId, currentUserId),
            (0, import_drizzle_orm33.eq)(reports.targetType, targetType),
            (0, import_drizzle_orm33.eq)(reports.targetId, targetId),
            (0, import_drizzle_orm33.eq)(reports.status, "PENDING")
          )
        ).limit(1);
        if (existing.length > 0) {
          return res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Bu i\xE7erik i\xE7in zaten a\xE7\u0131k bir raporunuz bulunuyor." } });
        }
        await db.insert(reports).values({
          reporterId: currentUserId,
          targetType,
          targetId,
          reason
        });
        res.status(201).json({ success: true, data: { message: "Rapor ba\u015Far\u0131yla g\xF6nderildi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/admin.ts
var admin_exports = {};
__export(admin_exports, {
  adminRouter: () => adminRouter
});
var import_express25, import_drizzle_orm34, import_argon24, adminRouter, getPagination, parseParamId;
var init_admin = __esm({
  "server/routes/admin.ts"() {
    "use strict";
    init_encryption();
    import_express25 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm34 = require("drizzle-orm");
    init_auth();
    init_mailer();
    import_argon24 = __toESM(require("argon2"), 1);
    adminRouter = (0, import_express25.Router)();
    getPagination = (req) => {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
      return { page, limit, offset: (page - 1) * limit };
    };
    adminRouter.use(requireAuth, requireRole("ADMIN"));
    adminRouter.get("/stats", async (req, res) => {
      try {
        const totalUsers = await db.select({ count: import_drizzle_orm34.sql`cast(count(*) as integer)` }).from(users);
        const bannedUsers = await db.select({ count: import_drizzle_orm34.sql`cast(count(*) as integer)` }).from(users).where((0, import_drizzle_orm34.eq)(users.isActive, false));
        const pendingVerifications = await db.select({ count: import_drizzle_orm34.sql`cast(count(*) as integer)` }).from(verificationRequests).where((0, import_drizzle_orm34.eq)(verificationRequests.status, "pending"));
        const pendingReports = await db.select({ count: import_drizzle_orm34.sql`cast(count(*) as integer)` }).from(reports).where((0, import_drizzle_orm34.eq)(reports.status, "PENDING"));
        res.json({
          success: true,
          data: {
            totalUsers: totalUsers[0]?.count || 0,
            bannedUsers: bannedUsers[0]?.count || 0,
            pendingVerifications: pendingVerifications[0]?.count || 0,
            openReports: pendingReports[0]?.count || 0
          }
        });
      } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.get("/users", async (req, res) => {
      try {
        const q = req.query.q;
        const statusFilter = req.query.status;
        const { limit, offset } = getPagination(req);
        let query = db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          isVerified: users.isVerified,
          isOfficialAccount: users.isOfficialAccount,
          emailVerified: users.emailVerified,
          twoFactorEnabled: users.twoFactorEnabled,
          createdAt: users.createdAt,
          bannedAt: users.bannedAt,
          banReason: users.banReason,
          banExpiresAt: users.banExpiresAt,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm34.eq)(users.id, profiles.userId));
        const conditions = [];
        if (q && q.trim().length > 0) {
          const qTerm = `%${q.trim()}%`;
          conditions.push(
            (0, import_drizzle_orm34.or)(
              (0, import_drizzle_orm34.ilike)(users.username, qTerm),
              (0, import_drizzle_orm34.ilike)(profiles.displayName, qTerm),
              (0, import_drizzle_orm34.ilike)(users.email, qTerm)
            )
          );
        }
        if (statusFilter === "ACTIVE") {
          conditions.push((0, import_drizzle_orm34.eq)(users.isActive, true));
        } else if (statusFilter === "BANNED") {
          conditions.push((0, import_drizzle_orm34.eq)(users.isActive, false));
        }
        if (conditions.length > 0) {
          query = query.where((0, import_drizzle_orm34.and)(...conditions));
        }
        const list = await query.limit(limit).offset(offset).orderBy((0, import_drizzle_orm34.desc)(users.createdAt));
        res.json({ success: true, data: list });
      } catch (error) {
        console.error("Admin users error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.get("/verifications", async (req, res) => {
      try {
        const status = req.query.status;
        const { limit, offset } = getPagination(req);
        let query = db.select({
          id: verificationRequests.id,
          userId: verificationRequests.userId,
          status: verificationRequests.status,
          reason: verificationRequests.reason,
          adminNote: verificationRequests.adminNote,
          rejectionReason: verificationRequests.rejectionReason,
          createdAt: verificationRequests.createdAt,
          reviewedAt: verificationRequests.reviewedAt,
          username: users.username,
          email: users.email,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(verificationRequests).innerJoin(users, (0, import_drizzle_orm34.eq)(verificationRequests.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm34.eq)(users.id, profiles.userId));
        if (status && ["pending", "under_review", "approved", "rejected"].includes(status)) {
          query = query.where((0, import_drizzle_orm34.eq)(verificationRequests.status, status));
        }
        const list = await query.limit(limit).offset(offset).orderBy((0, import_drizzle_orm34.desc)(verificationRequests.createdAt));
        res.json({ success: true, data: list });
      } catch (error) {
        console.error("Admin verifications error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.patch("/verifications/:id", async (req, res) => {
      try {
        const requestId = parseInt(req.params.id);
        if (isNaN(requestId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID." } });
          return;
        }
        const { status, adminNote, rejectionReason } = req.body;
        const adminId = requireAuthContext(req);
        if (!["pending", "under_review", "approved", "rejected"].includes(status)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz durum." } });
          return;
        }
        const vReq = await db.select().from(verificationRequests).where((0, import_drizzle_orm34.eq)(verificationRequests.id, requestId)).limit(1);
        if (vReq.length === 0) {
          res.status(404).json({ success: false, error: { message: "Ba\u015Fvuru bulunamad\u0131." } });
          return;
        }
        const currentReq = vReq[0];
        await db.update(verificationRequests).set({
          status,
          adminNote: adminNote || currentReq.adminNote,
          rejectionReason: status === "rejected" ? rejectionReason || null : null,
          reviewedBy: adminId,
          reviewedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm34.eq)(verificationRequests.id, requestId));
        if (status === "approved" || status === "rejected") {
          const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, currentReq.userId)).limit(1);
          if (userRecord.length > 0) {
            sendVerificationStatusEmail(userRecord[0].email, userRecord[0].username, status).catch(console.error);
          }
        }
        if (status === "approved" && currentReq.status !== "approved") {
          await db.update(users).set({ isVerified: true }).where((0, import_drizzle_orm34.eq)(users.id, currentReq.userId));
        } else if (status !== "approved" && currentReq.status === "approved") {
          await db.update(users).set({ isVerified: false }).where((0, import_drizzle_orm34.eq)(users.id, currentReq.userId));
        }
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: `verification_${status}`,
          targetType: "verification_request",
          targetId: requestId.toString(),
          metadata: { previousStatus: currentReq.status, newStatus: status }
        });
        res.json({ success: true, data: { message: `Ba\u015Fvuru durumu g\xFCncellendi: ${status}` } });
      } catch (error) {
        console.error("Admin verification update error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.patch("/users/:id/verify", async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID." } });
          return;
        }
        const { isVerified } = req.body;
        const adminId = requireAuthContext(req);
        if (typeof isVerified !== "boolean") {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz veri." } });
          return;
        }
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        await db.update(users).set({ isVerified }).where((0, import_drizzle_orm34.eq)(users.id, targetUserId));
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: `user_verify_toggle`,
          targetType: "user",
          targetId: targetUserId.toString(),
          metadata: { previousStatus: userRecord[0].isVerified, newStatus: isVerified }
        });
        res.json({ success: true, data: { message: `Kullan\u0131c\u0131 do\u011Frulama durumu g\xFCncellendi: ${isVerified}` } });
      } catch (error) {
        console.error("Admin user verify update error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.post("/users/:id/reset-2fa", async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID." } });
          return;
        }
        const adminId = requireAuthContext(req);
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        await db.transaction(async (tx) => {
          await tx.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where((0, import_drizzle_orm34.eq)(users.id, targetUserId));
          await tx.delete(recoveryCodes).where((0, import_drizzle_orm34.eq)(recoveryCodes.userId, targetUserId));
          await tx.insert(adminAuditLogs).values({
            adminUserId: adminId,
            action: "admin_2fa_reset",
            targetType: "user",
            targetId: targetUserId.toString(),
            metadata: { message: "2FA manually reset by admin." }
          });
        });
        res.json({ success: true, data: { message: "Kullan\u0131c\u0131n\u0131n 2FA ayarlar\u0131 ba\u015Far\u0131yla s\u0131f\u0131rland\u0131." } });
      } catch (error) {
        console.error("Admin 2FA reset error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.patch("/users/:id/ban", async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID." } });
          return;
        }
        const adminId = requireAuthContext(req);
        const { isActive, reason, isPermanent, banExpiresAt } = req.body;
        if (typeof isActive !== "boolean") {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz veri. 'isActive' boolean olmal\u0131d\u0131r." } });
          return;
        }
        if (targetUserId === adminId) {
          res.status(400).json({ success: false, error: { message: "Kendi hesab\u0131n\u0131z\u0131 yasaklayamazs\u0131n\u0131z." } });
          return;
        }
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const targetUser = userRecord[0];
        if (targetUser.role === "ADMIN" && !isActive) {
          res.status(403).json({ success: false, error: { message: "Y\xF6netici (ADMIN) rol\xFCne sahip hesaplar do\u011Frudan yasaklanamaz. \xD6nce rol\xFCn\xFC de\u011Fi\u015Ftiriniz." } });
          return;
        }
        const expiresAt = !isActive && !isPermanent && banExpiresAt ? new Date(banExpiresAt) : null;
        const finalReason = reason?.trim() || (isActive ? "Y\xF6netici taraf\u0131ndan yasak kald\u0131r\u0131ld\u0131" : "Topluluk kurallar\u0131n\u0131n ihlali");
        await db.transaction(async (tx) => {
          await tx.update(users).set({
            isActive,
            bannedAt: isActive ? null : /* @__PURE__ */ new Date(),
            banReason: isActive ? null : finalReason,
            banExpiresAt: isActive ? null : expiresAt,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm34.eq)(users.id, targetUserId));
          if (!isActive) {
            await tx.delete(refreshTokens).where((0, import_drizzle_orm34.eq)(refreshTokens.userId, targetUserId));
          }
          await tx.insert(adminAuditLogs).values({
            adminUserId: adminId,
            action: isActive ? "user_unbanned" : "user_banned",
            targetType: "user",
            targetId: targetUserId.toString(),
            metadata: {
              username: targetUser.username,
              email: targetUser.email,
              reason: finalReason,
              isPermanent: !expiresAt,
              banExpiresAt: expiresAt ? expiresAt.toISOString() : null
            }
          });
        });
        res.json({
          success: true,
          data: {
            isActive,
            isPermanent: !expiresAt,
            banReason: finalReason,
            banExpiresAt: expiresAt,
            message: isActive ? `@${targetUser.username} kullan\u0131c\u0131s\u0131n\u0131n yasa\u011F\u0131 kald\u0131r\u0131ld\u0131 ve hesab\u0131 aktifle\u015Ftirildi.` : `@${targetUser.username} kullan\u0131c\u0131s\u0131 ${expiresAt ? "ge\xE7ici olarak" : "kal\u0131c\u0131 olarak"} yasakland\u0131 ve t\xFCm oturumlar\u0131 sonland\u0131r\u0131ld\u0131.`
          }
        });
      } catch (error) {
        console.error("Admin user ban error:", error);
        res.status(500).json({ success: false, error: { message: "Kullan\u0131c\u0131 durumu g\xFCncellenemedi." } });
      }
    });
    adminRouter.patch("/users/:id/role", async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID." } });
          return;
        }
        const adminId = requireAuthContext(req);
        const { role } = req.body;
        const validRoles = ["USER", "MODERATOR", "ADMIN"];
        if (!validRoles.includes(role)) {
          res.status(400).json({ success: false, error: { message: `Ge\xE7ersiz rol. Kabul edilen roller: ${validRoles.join(", ")}` } });
          return;
        }
        if (targetUserId === adminId && role !== "ADMIN") {
          res.status(400).json({ success: false, error: { message: "Kendi y\xF6netici rol\xFCn\xFCz\xFC d\xFC\u015F\xFCremezsiniz." } });
          return;
        }
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const targetUser = userRecord[0];
        const oldRole = targetUser.role;
        await db.transaction(async (tx) => {
          await tx.update(users).set({
            role,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm34.eq)(users.id, targetUserId));
          await tx.insert(adminAuditLogs).values({
            adminUserId: adminId,
            action: "user_role_change",
            targetType: "user",
            targetId: targetUserId.toString(),
            metadata: {
              username: targetUser.username,
              oldRole,
              newRole: role
            }
          });
        });
        res.json({
          success: true,
          data: {
            role,
            message: `@${targetUser.username} kullan\u0131c\u0131s\u0131n\u0131n rol\xFC '${role}' olarak g\xFCncellendi.`
          }
        });
      } catch (error) {
        console.error("Admin user role update error:", error);
        res.status(500).json({ success: false, error: { message: "Rol g\xFCncellenemedi." } });
      }
    });
    adminRouter.post("/users/:id/reset-password", async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID." } });
          return;
        }
        const adminId = requireAuthContext(req);
        const { newPassword } = req.body;
        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
          res.status(400).json({ success: false, error: { message: "Yeni parola en az 8 karakter uzunlu\u011Funda olmal\u0131d\u0131r." } });
          return;
        }
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const targetUser = userRecord[0];
        const passwordHash = await import_argon24.default.hash(newPassword);
        await db.transaction(async (tx) => {
          await tx.update(users).set({
            passwordHash,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm34.eq)(users.id, targetUserId));
          await tx.delete(refreshTokens).where((0, import_drizzle_orm34.eq)(refreshTokens.userId, targetUserId));
          await tx.insert(adminAuditLogs).values({
            adminUserId: adminId,
            action: "admin_password_reset",
            targetType: "user",
            targetId: targetUserId.toString(),
            metadata: {
              username: targetUser.username,
              email: targetUser.email,
              reason: "Y\xF6netici taraf\u0131ndan parola s\u0131f\u0131rland\u0131"
            }
          });
        });
        res.json({
          success: true,
          data: {
            message: `@${targetUser.username} i\xE7in yeni parola ba\u015Far\u0131yla tan\u0131mland\u0131 ve t\xFCm mevcut oturumlar\u0131 kapat\u0131ld\u0131.`
          }
        });
      } catch (error) {
        console.error("Admin user password reset error:", error);
        res.status(500).json({ success: false, error: { message: "Parola s\u0131f\u0131rlanamad\u0131." } });
      }
    });
    adminRouter.post("/users/:id/purge-content", async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID." } });
          return;
        }
        const adminId = requireAuthContext(req);
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const targetUser = userRecord[0];
        await db.transaction(async (tx) => {
          await tx.delete(posts).where((0, import_drizzle_orm34.eq)(posts.userId, targetUserId));
          await tx.delete(comments).where((0, import_drizzle_orm34.eq)(comments.userId, targetUserId));
          await tx.insert(adminAuditLogs).values({
            adminUserId: adminId,
            action: "user_content_purged",
            targetType: "user",
            targetId: targetUserId.toString(),
            metadata: {
              username: targetUser.username,
              action: "T\xFCm g\xF6nderi ve yorumlar y\xF6netici taraf\u0131ndan temizlendi"
            }
          });
        });
        res.json({
          success: true,
          data: {
            message: `@${targetUser.username} kullan\u0131c\u0131s\u0131n\u0131n t\xFCm g\xF6nderi ve yorumlar\u0131 silindi.`
          }
        });
      } catch (error) {
        console.error("Admin user purge-content error:", error);
        res.status(500).json({ success: false, error: { message: "\u0130\xE7erikler temizlenemedi." } });
      }
    });
    adminRouter.delete("/users/:id", async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID." } });
          return;
        }
        const adminId = requireAuthContext(req);
        if (targetUserId === adminId) {
          res.status(400).json({ success: false, error: { message: "Kendi y\xF6netici hesab\u0131n\u0131z\u0131 silemezsiniz." } });
          return;
        }
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const targetUser = userRecord[0];
        await db.transaction(async (tx) => {
          await tx.delete(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId));
          await tx.insert(adminAuditLogs).values({
            adminUserId: adminId,
            action: "user_deleted_permanently",
            targetType: "user",
            targetId: targetUserId.toString(),
            metadata: {
              deletedUsername: targetUser.username,
              deletedEmail: targetUser.email,
              deletedRole: targetUser.role
            }
          });
        });
        res.json({
          success: true,
          data: {
            message: `@${targetUser.username} hesab\u0131 ve ili\u015Fkili t\xFCm verileri kal\u0131c\u0131 olarak silindi.`
          }
        });
      } catch (error) {
        console.error("Admin user delete error:", error);
        res.status(500).json({ success: false, error: { message: "Kullan\u0131c\u0131 hesab\u0131 silinemedi." } });
      }
    });
    adminRouter.post("/broadcast", async (req, res) => {
      try {
        const adminId = requireAuthContext(req);
        const { title, message } = req.body;
        if (!message || typeof message !== "string" || message.trim().length === 0) {
          res.status(400).json({ success: false, error: { message: "Duyuru mesaj\u0131 bo\u015F olamaz." } });
          return;
        }
        const allActiveUsers = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm34.eq)(users.isActive, true));
        if (allActiveUsers.length > 0) {
          const notificationRows = allActiveUsers.map((u) => ({
            recipientId: u.id,
            actorId: adminId,
            type: "system_announcement",
            isRead: false,
            createdAt: /* @__PURE__ */ new Date()
          }));
          await db.insert(notifications).values(notificationRows);
        }
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "system_broadcast_sent",
          targetType: "system",
          targetId: "all",
          metadata: { title: title || "Gen\xE7 Sosyal Duyurusu", messageSnippet: message.substring(0, 100), userCount: allActiveUsers.length }
        });
        res.json({
          success: true,
          data: {
            recipientCount: allActiveUsers.length,
            message: `${allActiveUsers.length} kullan\u0131c\u0131ya sistem duyurusu ba\u015Far\u0131yla iletildi.`
          }
        });
      } catch (error) {
        console.error("Admin broadcast error:", error);
        res.status(500).json({ success: false, error: { message: "Duyuru g\xF6nderilemedi." } });
      }
    });
    adminRouter.get("/reports", async (req, res) => {
      try {
        const status = req.query.status || "PENDING";
        const { limit, offset } = getPagination(req);
        const list = await db.select({
          id: reports.id,
          reporterId: reports.reporterId,
          targetType: reports.targetType,
          targetId: reports.targetId,
          reason: reports.reason,
          status: reports.status,
          createdAt: reports.createdAt,
          reporterUsername: users.username
        }).from(reports).leftJoin(users, (0, import_drizzle_orm34.eq)(reports.reporterId, users.id)).where((0, import_drizzle_orm34.eq)(reports.status, status)).orderBy((0, import_drizzle_orm34.desc)(reports.createdAt)).limit(limit).offset(offset);
        res.json({ success: true, data: list });
      } catch (error) {
        console.error("Admin reports error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.patch("/reports/:id", async (req, res) => {
      try {
        const reportId = parseInt(req.params.id);
        const { status, action } = req.body;
        const adminId = requireAuthContext(req);
        const r = await db.select().from(reports).where((0, import_drizzle_orm34.eq)(reports.id, reportId)).limit(1);
        if (r.length === 0) {
          res.status(404).json({ success: false, error: { message: "Rapor bulunamad\u0131." } });
          return;
        }
        const report = r[0];
        if (action === "remove_content") {
          if (report.targetType === "post") {
            await db.delete(posts).where((0, import_drizzle_orm34.eq)(posts.id, report.targetId));
          } else if (report.targetType === "comment") {
            await db.delete(comments).where((0, import_drizzle_orm34.eq)(comments.id, report.targetId));
          } else if (report.targetType === "community") {
            await db.delete(communities).where((0, import_drizzle_orm34.eq)(communities.id, report.targetId));
          }
          await db.update(reports).set({ status: "RESOLVED", resolvedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm34.eq)(reports.id, reportId));
        } else if (action === "suspend_user") {
          let uId = report.targetId;
          if (report.targetType !== "user") {
            if (report.targetType === "post") {
              const p = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm34.eq)(posts.id, report.targetId)).limit(1);
              if (p.length > 0) uId = p[0].userId;
            } else if (report.targetType === "comment") {
              const c = await db.select({ userId: comments.userId }).from(comments).where((0, import_drizzle_orm34.eq)(comments.id, report.targetId)).limit(1);
              if (c.length > 0) uId = c[0].userId;
            }
          }
          await db.update(users).set({ isActive: false }).where((0, import_drizzle_orm34.eq)(users.id, uId));
          await db.update(reports).set({ status: "RESOLVED", resolvedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm34.eq)(reports.id, reportId));
        } else if (status) {
          await db.update(reports).set({ status, resolvedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm34.eq)(reports.id, reportId));
        }
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: `report_${action || status}`,
          targetType: "report",
          targetId: reportId.toString(),
          metadata: { targetType: report.targetType, targetId: report.targetId }
        });
        res.json({ success: true, data: { message: "Rapor g\xFCncellendi." } });
      } catch (error) {
        console.error("Admin report update error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.get("/appeals", requireAuth, requireRole("ADMIN"), async (req, res) => {
      try {
        const { status } = req.query;
        let query = db.select({
          id: appeals.id,
          userId: appeals.userId,
          banReason: appeals.banReason,
          reason: appeals.reason,
          status: appeals.status,
          adminResponse: appeals.adminResponse,
          reviewedBy: appeals.reviewedBy,
          reviewedAt: appeals.reviewedAt,
          createdAt: appeals.createdAt,
          updatedAt: appeals.updatedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            isActive: users.isActive,
            bannedAt: users.bannedAt,
            banReason: users.banReason,
            banExpiresAt: users.banExpiresAt,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(appeals).innerJoin(users, (0, import_drizzle_orm34.eq)(appeals.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm34.eq)(users.id, profiles.userId)).orderBy((0, import_drizzle_orm34.desc)(appeals.createdAt));
        const appealsList = typeof status === "string" && status !== "ALL" ? await query.where((0, import_drizzle_orm34.eq)(appeals.status, status)) : await query;
        res.json({
          success: true,
          data: appealsList
        });
      } catch (error) {
        console.error("Admin appeals list error:", error);
        res.status(500).json({ success: false, error: { message: "\u0130tirazlar al\u0131n\u0131rken bir sunucu hatas\u0131 olu\u015Ftu." } });
      }
    });
    adminRouter.patch("/appeals/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
      try {
        const appealId = parseInt(req.params.id);
        if (isNaN(appealId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz itiraz ID." } });
          return;
        }
        const adminId = requireAuthContext(req);
        const { action, adminResponse, humanReviewNotes } = req.body;
        if (action !== "APPROVE" && action !== "REJECT") {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz i\u015Flem. 'action' parametresi 'APPROVE' veya 'REJECT' olmal\u0131d\u0131r." } });
          return;
        }
        const existingAppeal = await db.select().from(appeals).where((0, import_drizzle_orm34.eq)(appeals.id, appealId)).limit(1);
        if (existingAppeal.length === 0) {
          res.status(404).json({ success: false, error: { message: "\u0130tiraz kayd\u0131 bulunamad\u0131." } });
          return;
        }
        const appeal = existingAppeal[0];
        const targetUserId = appeal.userId;
        const sanitizedResponse = typeof adminResponse === "string" ? adminResponse.trim() : null;
        const sanitizedHumanNotes = typeof humanReviewNotes === "string" ? humanReviewNotes.trim() : null;
        if (action === "APPROVE") {
          await db.transaction(async (tx) => {
            await tx.update(appeals).set({
              status: "APPROVED",
              adminResponse: sanitizedResponse || "\u0130tiraz\u0131n\u0131z insan incelemesi neticesinde onayland\u0131 ve hesab\u0131n\u0131z yeniden aktifle\u015Ftirildi.",
              humanReviewNotes: sanitizedHumanNotes || "\u0130nceleme yetkili moderat\xF6r taraf\u0131ndan mevzuat kriterlerine g\xF6re onayland\u0131.",
              reviewedBy: adminId,
              reviewedAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm34.eq)(appeals.id, appealId));
            const [targetUserRec] = await tx.select({ ageVerificationStatus: users.ageVerificationStatus }).from(users).where((0, import_drizzle_orm34.eq)(users.id, targetUserId)).limit(1);
            const resolvedAgeStatus = targetUserRec?.ageVerificationStatus === "REJECTED_UNDERAGE" ? "UNVERIFIED" : targetUserRec?.ageVerificationStatus;
            await tx.update(users).set({
              isActive: true,
              ageVerificationStatus: resolvedAgeStatus,
              banReason: null,
              bannedAt: null,
              banExpiresAt: null,
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm34.eq)(users.id, targetUserId));
            await tx.insert(adminAuditLogs).values({
              adminUserId: adminId,
              action: "appeal_approved",
              targetType: "appeal",
              targetId: appealId.toString(),
              metadata: {
                userId: targetUserId,
                appealId,
                adminResponse: sanitizedResponse
              }
            });
            await tx.insert(notifications).values({
              recipientId: targetUserId,
              actorId: adminId,
              type: "system",
              isRead: false,
              createdAt: /* @__PURE__ */ new Date()
            });
          });
          res.json({
            success: true,
            data: {
              message: "\u0130tiraz kabul edildi, k\u0131s\u0131tlama kald\u0131r\u0131ld\u0131 ve hesap aktifle\u015Ftirildi."
            }
          });
          return;
        }
        if (action === "REJECT") {
          await db.transaction(async (tx) => {
            await tx.update(appeals).set({
              status: "REJECTED",
              adminResponse: sanitizedResponse || "\u0130tiraz\u0131n\u0131z de\u011Ferlendirildi ancak kural ihlali nedeniyle reddedildi.",
              reviewedBy: adminId,
              reviewedAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm34.eq)(appeals.id, appealId));
            await tx.insert(adminAuditLogs).values({
              adminUserId: adminId,
              action: "appeal_rejected",
              targetType: "appeal",
              targetId: appealId.toString(),
              metadata: {
                userId: targetUserId,
                appealId,
                adminResponse: sanitizedResponse
              }
            });
            await tx.insert(notifications).values({
              recipientId: targetUserId,
              actorId: adminId,
              type: "system",
              isRead: false,
              createdAt: /* @__PURE__ */ new Date()
            });
          });
          res.json({
            success: true,
            data: {
              message: "\u0130tiraz reddedildi."
            }
          });
          return;
        }
      } catch (error) {
        console.error("Admin appeal action error:", error);
        res.status(500).json({ success: false, error: { message: "\u0130tiraz i\u015Flemi ger\xE7ekle\u015Ftirilirken hata olu\u015Ftu." } });
      }
    });
    adminRouter.get("/smtp", requireAuth, requireRole("ADMIN"), async (req, res) => {
      try {
        const settings = await db.select().from(systemSettings);
        const config = {
          smtp_host: process.env.SMTP_HOST || "",
          smtp_port: process.env.SMTP_PORT || "587",
          smtp_secure: process.env.SMTP_SECURE || "false",
          smtp_user: process.env.SMTP_USER || "",
          smtp_from: process.env.SMTP_FROM || ""
        };
        let passConfigured = !!process.env.SMTP_PASS;
        for (const s of settings) {
          if (s.key === "smtp_pass") {
            passConfigured = true;
          } else if (s.key.startsWith("smtp_")) {
            config[s.key] = s.value;
          }
        }
        res.json({
          success: true,
          data: {
            host: config.smtp_host,
            port: parseInt(config.smtp_port),
            secure: config.smtp_secure === "true",
            user: config.smtp_user,
            from: config.smtp_from,
            passConfigured
          }
        });
      } catch (error) {
        console.error("Get SMTP error:", error);
        res.status(500).json({ success: false, error: { message: "SMTP ayarlar\u0131 al\u0131namad\u0131." } });
      }
    });
    adminRouter.put("/smtp", requireAuth, requireRole("ADMIN"), async (req, res) => {
      try {
        const { host, port, secure, user, pass, from } = req.body;
        const updates = [
          { key: "smtp_host", value: host || "" },
          { key: "smtp_port", value: port ? String(port) : "587" },
          { key: "smtp_secure", value: secure ? "true" : "false" },
          { key: "smtp_user", value: user || "" },
          { key: "smtp_from", value: from || "" }
        ];
        if (pass) {
          updates.push({ key: "smtp_pass", value: encryptString(pass) });
        }
        await db.transaction(async (tx) => {
          for (const update of updates) {
            await tx.insert(systemSettings).values({ key: update.key, value: update.value, updatedBy: requireAuthContext(req) }).onConflictDoUpdate({
              target: systemSettings.key,
              set: { value: update.value, updatedBy: requireAuthContext(req), updatedAt: /* @__PURE__ */ new Date() }
            });
          }
          await tx.insert(adminAuditLogs).values({
            adminUserId: requireAuthContext(req),
            action: "update_smtp_settings",
            targetId: "0",
            targetType: "system",
            metadata: { action: "Updated SMTP settings" }
          });
        });
        res.json({ success: true, message: "SMTP ayarlar\u0131 kaydedildi." });
      } catch (error) {
        console.error("Update SMTP error:", error);
        res.status(500).json({ success: false, error: { message: "SMTP ayarlar\u0131 kaydedilemedi." } });
      }
    });
    adminRouter.post("/smtp/test", requireAuth, requireRole("ADMIN"), async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ success: false, error: { message: "Test e-postas\u0131 adresi gereklidir." } });
        }
        await sendSmtpTestEmail(email);
        res.json({ success: true, message: "Test e-postas\u0131 ba\u015Far\u0131yla g\xF6nderildi." });
      } catch (error) {
        console.error("Test email error:", error);
        res.status(500).json({ success: false, error: { message: "SMTP ba\u011Flant\u0131s\u0131 ba\u015Far\u0131s\u0131z. Sunucu, port veya kimlik do\u011Frulama bilgilerini kontrol edin." } });
      }
    });
    adminRouter.get("/official-accounts", async (req, res) => {
      try {
        const data = await db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          isVerified: users.isVerified,
          isOfficialAccount: users.isOfficialAccount,
          officialNotifyEnabled: users.officialNotifyEnabled,
          officialPriority: users.officialPriority,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm34.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm34.eq)(users.isOfficialAccount, true)).orderBy((0, import_drizzle_orm34.desc)(users.createdAt));
        res.json({ success: true, data });
      } catch (error) {
        console.error("GET /official-accounts error:", error);
        res.status(500).json({ success: false, error: { message: "Resmi hesaplar al\u0131namad\u0131." } });
      }
    });
    adminRouter.put("/official-accounts/:id", async (req, res) => {
      try {
        const targetId = parseInt(req.params.id);
        if (isNaN(targetId)) {
          return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID'si." } });
        }
        const { isOfficialAccount, officialNotifyEnabled, officialPriority } = req.body;
        await db.update(users).set({
          isOfficialAccount: !!isOfficialAccount,
          officialNotifyEnabled: !!officialNotifyEnabled,
          officialPriority: officialPriority || "normal",
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm34.eq)(users.id, targetId));
        res.json({ success: true, message: "Resmi hesap ayarlar\u0131 g\xFCncellendi." });
      } catch (error) {
        console.error("PUT /official-accounts/:id error:", error);
        res.status(500).json({ success: false, error: { message: "Ayarlar g\xFCncellenemedi." } });
      }
    });
    adminRouter.get("/auto-follow", async (req, res) => {
      try {
        const setting = await db.select().from(systemSettings).where((0, import_drizzle_orm34.eq)(systemSettings.key, "auto_follow_users")).limit(1);
        let userIds = [];
        if (setting.length > 0 && setting[0].value) {
          try {
            const parsed = JSON.parse(setting[0].value);
            if (Array.isArray(parsed)) {
              userIds = parsed.map((u) => {
                if (typeof u === "number") return u;
                if (typeof u === "string") {
                  const parsedInt = parseInt(u, 10);
                  return isNaN(parsedInt) ? null : parsedInt;
                }
                if (u && typeof u === "object" && "id" in u) {
                  const parsedInt = typeof u.id === "number" ? u.id : parseInt(u.id, 10);
                  return isNaN(parsedInt) ? null : parsedInt;
                }
                return null;
              }).filter((id) => typeof id === "number" && !isNaN(id) && id > 0);
            }
          } catch (e) {
            console.error("Failed to parse auto_follow_users setting:", e);
          }
        }
        let autoFollowUsers = [];
        if (userIds.length > 0) {
          autoFollowUsers = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            isVerified: users.isVerified,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }).from(users).leftJoin(profiles, (0, import_drizzle_orm34.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm34.inArray)(users.id, userIds));
        }
        res.json({ success: true, data: autoFollowUsers });
      } catch (error) {
        console.error("GET /auto-follow error:", error);
        res.status(500).json({ success: false, error: { message: "Otomatik takip ayarlar\u0131 al\u0131namad\u0131." } });
      }
    });
    adminRouter.put("/auto-follow", async (req, res) => {
      try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
          return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz veri format\u0131. userIds dizi olmal\u0131d\u0131r." } });
        }
        const cleanUserIds = userIds.map((u) => {
          if (typeof u === "number") return u;
          if (typeof u === "string") {
            const parsed = parseInt(u, 10);
            return isNaN(parsed) ? null : parsed;
          }
          if (u && typeof u === "object" && "id" in u) {
            const parsed = typeof u.id === "number" ? u.id : parseInt(u.id, 10);
            return isNaN(parsed) ? null : parsed;
          }
          return null;
        }).filter((id) => typeof id === "number" && !isNaN(id) && id > 0);
        let adminUserId = null;
        try {
          const callerId = optionalAuthContext(req) || requireAuthContext(req);
          if (callerId) {
            const check = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm34.eq)(users.id, callerId)).limit(1);
            if (check.length > 0) {
              adminUserId = callerId;
            }
          }
        } catch {
          adminUserId = null;
        }
        await db.insert(systemSettings).values({
          key: "auto_follow_users",
          value: JSON.stringify(cleanUserIds),
          updatedBy: adminUserId,
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value: JSON.stringify(cleanUserIds),
            updatedBy: adminUserId,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
        res.json({ success: true, message: "Otomatik takip listesi g\xFCncellendi.", data: cleanUserIds });
      } catch (error) {
        console.error("PUT /auto-follow error:", error);
        res.status(500).json({ success: false, error: { message: "Otomatik takip listesi g\xFCncellenemedi." } });
      }
    });
    adminRouter.get("/audit-logs", async (req, res) => {
      try {
        const { limit, offset } = getPagination(req);
        const action = req.query.action;
        let query = db.select({
          id: adminAuditLogs.id,
          adminUserId: adminAuditLogs.adminUserId,
          action: adminAuditLogs.action,
          targetType: adminAuditLogs.targetType,
          targetId: adminAuditLogs.targetId,
          metadata: adminAuditLogs.metadata,
          createdAt: adminAuditLogs.createdAt,
          adminUsername: users.username,
          adminDisplayName: profiles.displayName,
          adminAvatarUrl: profiles.avatarUrl
        }).from(adminAuditLogs).leftJoin(users, (0, import_drizzle_orm34.eq)(adminAuditLogs.adminUserId, users.id)).leftJoin(profiles, (0, import_drizzle_orm34.eq)(users.id, profiles.userId));
        if (action && action.trim().length > 0) {
          query = query.where((0, import_drizzle_orm34.ilike)(adminAuditLogs.action, `%${action.trim()}%`));
        }
        const list = await query.limit(limit).offset(offset).orderBy((0, import_drizzle_orm34.desc)(adminAuditLogs.createdAt));
        res.json({ success: true, data: list });
      } catch (error) {
        console.error("Admin audit logs error:", error);
        res.status(500).json({ success: false, error: { message: "Denetim kay\u0131tlar\u0131 al\u0131namad\u0131." } });
      }
    });
    adminRouter.get("/moderation/queue", async (req, res) => {
      try {
        const pendingLogs = await db.select({
          id: moderationLogs.id,
          entityType: moderationLogs.entityType,
          entityId: moderationLogs.entityId,
          status: moderationLogs.status,
          riskLevel: moderationLogs.riskLevel,
          category: moderationLogs.category,
          createdAt: moderationLogs.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName
          }
        }).from(moderationLogs).innerJoin(users, (0, import_drizzle_orm34.eq)(moderationLogs.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm34.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm34.eq)(moderationLogs.status, "PENDING")).orderBy((0, import_drizzle_orm34.desc)(moderationLogs.createdAt)).limit(50);
        const result = await Promise.all(pendingLogs.map(async (log) => {
          let content = "";
          if (log.entityType === "POST") {
            const p = await db.select({ content: posts.content }).from(posts).where((0, import_drizzle_orm34.eq)(posts.id, log.entityId)).limit(1);
            if (p.length > 0) content = p[0].content || "";
          } else if (log.entityType === "COMMENT") {
            const c = await db.select({ content: comments.content }).from(comments).where((0, import_drizzle_orm34.eq)(comments.id, log.entityId)).limit(1);
            if (c.length > 0) content = c[0].content || "";
          } else if (log.entityType === "PROFILE") {
            const p = await db.select({ bio: profiles.bio }).from(profiles).where((0, import_drizzle_orm34.eq)(profiles.userId, log.entityId)).limit(1);
            if (p.length > 0) content = p[0].bio || "";
          } else if (log.entityType === "PROJECT_COMMENT") {
            const pc = await db.select({ content: projectComments.content }).from(projectComments).where((0, import_drizzle_orm34.eq)(projectComments.id, log.entityId)).limit(1);
            if (pc.length > 0) content = pc[0].content || "";
          } else if (log.entityType === "PROJECT") {
            const pj = await db.select({ description: projects.description }).from(projects).where((0, import_drizzle_orm34.eq)(projects.id, log.entityId)).limit(1);
            if (pj.length > 0) content = pj[0].description || "";
          }
          return { ...log, content };
        }));
        res.json({ success: true, data: result });
      } catch (error) {
        console.error("Admin moderation queue fetch error:", error);
        res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    adminRouter.post("/moderation/:id/action", async (req, res) => {
      try {
        const logId = parseInt(req.params.id);
        const { action } = req.body;
        const adminId = requireAuthContext(req);
        if (action !== "APPROVE" && action !== "REJECT") {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz aksiyon." } });
        }
        const logRecord = await db.select().from(moderationLogs).where((0, import_drizzle_orm34.eq)(moderationLogs.id, logId)).limit(1);
        if (logRecord.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Log bulunamad\u0131." } });
        }
        const log = logRecord[0];
        await db.transaction(async (tx) => {
          await tx.update(moderationLogs).set({ status: "RESOLVED", actionTaken: action === "APPROVE" ? "APPROVED" : "REJECTED", adminId, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm34.eq)(moderationLogs.id, logId));
          const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
          if (log.entityType === "POST") {
            await tx.update(posts).set({ moderationStatus: newStatus }).where((0, import_drizzle_orm34.eq)(posts.id, log.entityId));
          } else if (log.entityType === "COMMENT") {
            await tx.update(comments).set({ moderationStatus: newStatus }).where((0, import_drizzle_orm34.eq)(comments.id, log.entityId));
          } else if (log.entityType === "PROJECT_COMMENT") {
            await tx.update(projectComments).set({ moderationStatus: newStatus }).where((0, import_drizzle_orm34.eq)(projectComments.id, log.entityId));
          } else if (log.entityType === "PROFILE" || log.entityType === "PROJECT") {
          }
          await tx.insert(adminAuditLogs).values({
            adminUserId: adminId,
            action: "MODERATION_DECISION",
            targetType: "MODERATION_LOG",
            targetId: logId.toString(),
            metadata: { action, entityType: log.entityType, entityId: log.entityId }
          });
        });
        res.json({ success: true });
      } catch (error) {
        console.error("Admin moderation action error:", error);
        res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    parseParamId = (param) => parseInt(Array.isArray(param) ? param[0] : param, 10);
    adminRouter.get("/announcements", async (req, res) => {
      try {
        const { status, q } = req.query;
        const { limit, offset, page } = getPagination(req);
        const now = /* @__PURE__ */ new Date();
        await db.update(announcements).set({ status: "published", updatedAt: now }).where(
          (0, import_drizzle_orm34.and)(
            (0, import_drizzle_orm34.eq)(announcements.status, "scheduled"),
            import_drizzle_orm34.sql`${announcements.startsAt} <= ${now}`
          )
        ).catch(() => {
        });
        let whereClause = void 0;
        const conditions = [];
        if (status && typeof status === "string" && status !== "ALL") {
          conditions.push((0, import_drizzle_orm34.eq)(announcements.status, status));
        }
        if (q && typeof q === "string" && q.trim()) {
          const keyword = `%${q.trim()}%`;
          conditions.push(
            (0, import_drizzle_orm34.or)(
              (0, import_drizzle_orm34.ilike)(announcements.title, keyword),
              (0, import_drizzle_orm34.ilike)(announcements.content, keyword)
            )
          );
        }
        if (conditions.length > 0) {
          whereClause = (0, import_drizzle_orm34.and)(...conditions);
        }
        const countRes = await db.select({ count: import_drizzle_orm34.sql`cast(count(*) as integer)` }).from(announcements).where(whereClause);
        const total = countRes[0]?.count || 0;
        const items = await db.select({
          id: announcements.id,
          title: announcements.title,
          content: announcements.content,
          imageUrl: announcements.imageUrl,
          buttonText: announcements.buttonText,
          buttonUrl: announcements.buttonUrl,
          status: announcements.status,
          targetType: announcements.targetType,
          targetRole: announcements.targetRole,
          priority: announcements.priority,
          startsAt: announcements.startsAt,
          endsAt: announcements.endsAt,
          createdBy: announcements.createdBy,
          createdAt: announcements.createdAt,
          updatedAt: announcements.updatedAt,
          viewsCount: import_drizzle_orm34.sql`cast(count(distinct ${announcementViews.userId}) as integer)`,
          clicksCount: import_drizzle_orm34.sql`cast(count(distinct case when ${announcementViews.clickedCta} = true then ${announcementViews.userId} end) as integer)`
        }).from(announcements).leftJoin(announcementViews, (0, import_drizzle_orm34.eq)(announcementViews.announcementId, announcements.id)).where(whereClause).groupBy(announcements.id).orderBy((0, import_drizzle_orm34.desc)(announcements.createdAt)).limit(limit).offset(offset);
        res.json({
          success: true,
          data: {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error("Admin get announcements error:", error);
        res.status(500).json({ success: false, error: { message: "Duyurular listelenemedi." } });
      }
    });
    adminRouter.get("/announcements/:id", async (req, res) => {
      try {
        const id = parseParamId(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz duyuru ID." } });
          return;
        }
        const item = await db.select({
          id: announcements.id,
          title: announcements.title,
          content: announcements.content,
          imageUrl: announcements.imageUrl,
          buttonText: announcements.buttonText,
          buttonUrl: announcements.buttonUrl,
          status: announcements.status,
          targetType: announcements.targetType,
          targetRole: announcements.targetRole,
          priority: announcements.priority,
          startsAt: announcements.startsAt,
          endsAt: announcements.endsAt,
          createdBy: announcements.createdBy,
          createdAt: announcements.createdAt,
          updatedAt: announcements.updatedAt,
          viewsCount: import_drizzle_orm34.sql`cast(count(distinct ${announcementViews.userId}) as integer)`,
          clicksCount: import_drizzle_orm34.sql`cast(count(distinct case when ${announcementViews.clickedCta} = true then ${announcementViews.userId} end) as integer)`
        }).from(announcements).leftJoin(announcementViews, (0, import_drizzle_orm34.eq)(announcementViews.announcementId, announcements.id)).where((0, import_drizzle_orm34.eq)(announcements.id, id)).groupBy(announcements.id).limit(1);
        if (!item || item.length === 0) {
          res.status(404).json({ success: false, error: { message: "Duyuru bulunamad\u0131." } });
          return;
        }
        res.json({ success: true, data: item[0] });
      } catch (error) {
        console.error("Admin get announcement detail error:", error);
        res.status(500).json({ success: false, error: { message: "Duyuru detay\u0131 al\u0131namad\u0131." } });
      }
    });
    adminRouter.post("/announcements", async (req, res) => {
      try {
        const adminId = requireAuthContext(req);
        const {
          title,
          content,
          imageUrl,
          buttonText,
          buttonUrl,
          status = "draft",
          targetType = "all",
          targetRole,
          priority = 0,
          startsAt,
          endsAt
        } = req.body;
        if (!title || typeof title !== "string" || !title.trim()) {
          res.status(400).json({ success: false, error: { message: "Duyuru ba\u015Fl\u0131\u011F\u0131 zorunludur." } });
          return;
        }
        if (!content || typeof content !== "string" || !content.trim()) {
          res.status(400).json({ success: false, error: { message: "Duyuru a\xE7\u0131klamas\u0131 zorunludur." } });
          return;
        }
        const trimmedTitle = title.trim().substring(0, 255);
        const trimmedContent = content.trim();
        const validStatus = ["draft", "scheduled", "published", "archived"].includes(status) ? status : "draft";
        const validTargetType = ["all", "authenticated", "specific_role"].includes(targetType) ? targetType : "all";
        let parsedStartsAt = startsAt ? new Date(startsAt) : null;
        let parsedEndsAt = endsAt ? new Date(endsAt) : null;
        if (validStatus === "published" && !parsedStartsAt) {
          parsedStartsAt = /* @__PURE__ */ new Date();
        }
        const [created] = await db.insert(announcements).values({
          title: trimmedTitle,
          content: trimmedContent,
          imageUrl: imageUrl && typeof imageUrl === "string" ? imageUrl.trim() : null,
          buttonText: buttonText && typeof buttonText === "string" ? buttonText.trim().substring(0, 100) : null,
          buttonUrl: buttonUrl && typeof buttonUrl === "string" ? buttonUrl.trim() : null,
          status: validStatus,
          targetType: validTargetType,
          targetRole: validTargetType === "specific_role" && targetRole ? targetRole.trim() : null,
          priority: typeof priority === "number" ? priority : 0,
          startsAt: parsedStartsAt,
          endsAt: parsedEndsAt,
          createdBy: adminId,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "ANNOUNCEMENT_CREATE",
          targetType: "ANNOUNCEMENT",
          targetId: created.id.toString(),
          metadata: {
            title: trimmedTitle,
            status: validStatus,
            targetType: validTargetType
          }
        }).catch(console.error);
        res.status(201).json({
          success: true,
          data: created
        });
      } catch (error) {
        console.error("Admin create announcement error:", error);
        res.status(500).json({ success: false, error: { message: "Duyuru olu\u015Fturulamad\u0131." } });
      }
    });
    adminRouter.put("/announcements/:id", async (req, res) => {
      try {
        const adminId = requireAuthContext(req);
        const id = parseParamId(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz duyuru ID." } });
          return;
        }
        const {
          title,
          content,
          imageUrl,
          buttonText,
          buttonUrl,
          status,
          targetType,
          targetRole,
          priority,
          startsAt,
          endsAt
        } = req.body;
        const existing = await db.select().from(announcements).where((0, import_drizzle_orm34.eq)(announcements.id, id)).limit(1);
        if (!existing || existing.length === 0) {
          res.status(404).json({ success: false, error: { message: "Duyuru bulunamad\u0131." } });
          return;
        }
        const updateData = {
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (title !== void 0) {
          if (!title || typeof title !== "string" || !title.trim()) {
            res.status(400).json({ success: false, error: { message: "Duyuru ba\u015Fl\u0131\u011F\u0131 bo\u015F olamaz." } });
            return;
          }
          updateData.title = title.trim().substring(0, 255);
        }
        if (content !== void 0) {
          if (!content || typeof content !== "string" || !content.trim()) {
            res.status(400).json({ success: false, error: { message: "Duyuru a\xE7\u0131klamas\u0131 bo\u015F olamaz." } });
            return;
          }
          updateData.content = content.trim();
        }
        if (imageUrl !== void 0) {
          updateData.imageUrl = imageUrl && typeof imageUrl === "string" ? imageUrl.trim() : null;
        }
        if (buttonText !== void 0) {
          updateData.buttonText = buttonText && typeof buttonText === "string" ? buttonText.trim().substring(0, 100) : null;
        }
        if (buttonUrl !== void 0) {
          updateData.buttonUrl = buttonUrl && typeof buttonUrl === "string" ? buttonUrl.trim() : null;
        }
        if (status !== void 0) {
          if (["draft", "scheduled", "published", "archived"].includes(status)) {
            updateData.status = status;
            if (status === "published" && !startsAt && !existing[0].startsAt) {
              updateData.startsAt = /* @__PURE__ */ new Date();
            }
          }
        }
        if (targetType !== void 0) {
          if (["all", "authenticated", "specific_role"].includes(targetType)) {
            updateData.targetType = targetType;
          }
        }
        if (targetRole !== void 0) {
          updateData.targetRole = targetRole ? targetRole.trim() : null;
        }
        if (priority !== void 0) {
          updateData.priority = typeof priority === "number" ? priority : 0;
        }
        if (startsAt !== void 0) {
          updateData.startsAt = startsAt ? new Date(startsAt) : null;
        }
        if (endsAt !== void 0) {
          updateData.endsAt = endsAt ? new Date(endsAt) : null;
        }
        const [updated] = await db.update(announcements).set(updateData).where((0, import_drizzle_orm34.eq)(announcements.id, id)).returning();
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "ANNOUNCEMENT_UPDATE",
          targetType: "ANNOUNCEMENT",
          targetId: id.toString(),
          metadata: {
            updatedFields: Object.keys(updateData)
          }
        }).catch(console.error);
        res.json({
          success: true,
          data: updated
        });
      } catch (error) {
        console.error("Admin update announcement error:", error);
        res.status(500).json({ success: false, error: { message: "Duyuru g\xFCncellenemedi." } });
      }
    });
    adminRouter.post("/announcements/:id/publish", async (req, res) => {
      try {
        const adminId = requireAuthContext(req);
        const id = parseParamId(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz duyuru ID." } });
          return;
        }
        const now = /* @__PURE__ */ new Date();
        const [updated] = await db.update(announcements).set({
          status: "published",
          startsAt: import_drizzle_orm34.sql`COALESCE(${announcements.startsAt}, ${now})`,
          updatedAt: now
        }).where((0, import_drizzle_orm34.eq)(announcements.id, id)).returning();
        if (!updated) {
          res.status(404).json({ success: false, error: { message: "Duyuru bulunamad\u0131." } });
          return;
        }
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "ANNOUNCEMENT_PUBLISH",
          targetType: "ANNOUNCEMENT",
          targetId: id.toString(),
          metadata: { title: updated.title }
        }).catch(console.error);
        res.json({ success: true, data: updated, message: "Duyuru yay\u0131na al\u0131nd\u0131." });
      } catch (error) {
        console.error("Admin publish announcement error:", error);
        res.status(500).json({ success: false, error: { message: "Duyuru yay\u0131nlanamad\u0131." } });
      }
    });
    adminRouter.post("/announcements/:id/archive", async (req, res) => {
      try {
        const adminId = requireAuthContext(req);
        const id = parseParamId(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz duyuru ID." } });
          return;
        }
        const now = /* @__PURE__ */ new Date();
        const [updated] = await db.update(announcements).set({
          status: "archived",
          updatedAt: now
        }).where((0, import_drizzle_orm34.eq)(announcements.id, id)).returning();
        if (!updated) {
          res.status(404).json({ success: false, error: { message: "Duyuru bulunamad\u0131." } });
          return;
        }
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "ANNOUNCEMENT_ARCHIVE",
          targetType: "ANNOUNCEMENT",
          targetId: id.toString(),
          metadata: { title: updated.title }
        }).catch(console.error);
        res.json({ success: true, data: updated, message: "Duyuru ar\u015Fivlendi." });
      } catch (error) {
        console.error("Admin archive announcement error:", error);
        res.status(500).json({ success: false, error: { message: "Duyuru ar\u015Fivlenemedi." } });
      }
    });
    adminRouter.delete("/announcements/:id", async (req, res) => {
      try {
        const adminId = requireAuthContext(req);
        const id = parseParamId(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz duyuru ID." } });
          return;
        }
        const [deleted] = await db.delete(announcements).where((0, import_drizzle_orm34.eq)(announcements.id, id)).returning();
        if (!deleted) {
          res.status(404).json({ success: false, error: { message: "Duyuru bulunamad\u0131." } });
          return;
        }
        await db.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "ANNOUNCEMENT_DELETE",
          targetType: "ANNOUNCEMENT",
          targetId: id.toString(),
          metadata: { title: deleted.title }
        }).catch(console.error);
        res.json({ success: true, data: { message: "Duyuru ba\u015Far\u0131yla silindi." } });
      } catch (error) {
        console.error("Admin delete announcement error:", error);
        res.status(500).json({ success: false, error: { message: "Duyuru silinemedi." } });
      }
    });
  }
});

// server/routes/verification.ts
var verification_exports = {};
__export(verification_exports, {
  verificationRouter: () => verificationRouter
});
var import_express26, import_drizzle_orm35, verificationRouter;
var init_verification = __esm({
  "server/routes/verification.ts"() {
    "use strict";
    import_express26 = require("express");
    init_db();
    init_schema();
    init_auth();
    import_drizzle_orm35 = require("drizzle-orm");
    verificationRouter = (0, import_express26.Router)();
    verificationRouter.use(requireAuth);
    verificationRouter.get("/me", async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const requests = await db.select().from(verificationRequests).where((0, import_drizzle_orm35.eq)(verificationRequests.userId, userId)).orderBy((0, import_drizzle_orm35.desc)(verificationRequests.createdAt)).limit(10);
        res.json({ success: true, data: requests });
      } catch (error) {
        console.error("Error fetching verification requests:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    verificationRouter.post("/", async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const { reason } = req.body;
        if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
          res.status(400).json({ success: false, error: { message: "L\xFCtfen ba\u015Fvuru sebebini belirtin." } });
          return;
        }
        if (reason.trim().length > 1e3) {
          res.status(400).json({ success: false, error: { message: "Ba\u015Fvuru sebebi en fazla 1000 karakter olabilir." } });
          return;
        }
        const existingActive = await db.select().from(verificationRequests).where((0, import_drizzle_orm35.eq)(verificationRequests.userId, userId)).orderBy((0, import_drizzle_orm35.desc)(verificationRequests.createdAt)).limit(5);
        const hasActive = existingActive.some((r) => r.status === "pending" || r.status === "under_review");
        if (hasActive) {
          res.status(400).json({ success: false, error: { message: "Hali haz\u0131rda devam eden bir ba\u015Fvurunuz bulunmaktad\u0131r." } });
          return;
        }
        const newReq = await db.insert(verificationRequests).values({
          userId,
          reason: reason.trim(),
          status: "pending"
        }).returning();
        res.status(201).json({ success: true, data: newReq[0] });
      } catch (error) {
        console.error("Error creating verification request:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/hashtags.ts
var hashtags_exports = {};
__export(hashtags_exports, {
  hashtagsRouter: () => hashtagsRouter
});
var import_express27, import_drizzle_orm36, hashtagsRouter;
var init_hashtags2 = __esm({
  "server/routes/hashtags.ts"() {
    "use strict";
    import_express27 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm36 = require("drizzle-orm");
    init_blocks();
    init_hashtags();
    init_auth();
    init_api();
    init_postStats();
    hashtagsRouter = (0, import_express27.Router)();
    hashtagsRouter.get("/trending/top", optionalAuth, async (req, res) => {
      try {
        const trending = await db.select({
          name: hashtags.name,
          normalizedName: hashtags.normalizedName,
          count: hashtags.usageCount
        }).from(hashtags).orderBy((0, import_drizzle_orm36.desc)(hashtags.usageCount)).limit(5);
        res.json({ success: true, data: trending });
      } catch (error) {
        console.error("Trending hashtags error:", error);
        res.status(500).json({ success: false, error: { message: "Error fetching trending hashtags" } });
      }
    });
    hashtagsRouter.get("/:name", optionalAuth, async (req, res) => {
      try {
        const rawName = req.params.name;
        const normalizedName = normalizeHashtag(rawName);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        let currentUserId = -1;
        if (req.user) {
          currentUserId = req.user.userId;
        }
        const blockedIds = await getBlockedIds(currentUserId);
        const ignoreIds = blockedIds.length > 0 ? blockedIds : [-1];
        const tagRecord = await db.select().from(hashtags).where((0, import_drizzle_orm36.eq)(hashtags.normalizedName, normalizedName)).limit(1);
        if (tagRecord.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Hashtag bulunamad\u0131." } });
        }
        const hashtag = tagRecord[0];
        let visibilityCondition;
        if (currentUserId !== -1) {
          const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm36.and)((0, import_drizzle_orm36.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm36.eq)(follows.status, "accepted")));
          const followingIds = followingRecords.map((f) => f.followingId);
          const followingIdsWithSelf = followingIds.length > 0 ? followingIds : [-1];
          visibilityCondition = (0, import_drizzle_orm36.or)(
            (0, import_drizzle_orm36.eq)(posts.userId, currentUserId),
            (0, import_drizzle_orm36.and)(
              (0, import_drizzle_orm36.or)((0, import_drizzle_orm36.eq)(posts.visibility, "PUBLIC"), (0, import_drizzle_orm36.eq)(posts.visibility, "FOLLOWERS")),
              (0, import_drizzle_orm36.or)(
                (0, import_drizzle_orm36.and)(
                  (0, import_drizzle_orm36.or)((0, import_drizzle_orm36.eq)(profiles.isPrivate, false), import_drizzle_orm36.sql`${profiles.isPrivate} IS NULL`),
                  (0, import_drizzle_orm36.eq)(posts.visibility, "PUBLIC")
                ),
                (0, import_drizzle_orm36.inArray)(posts.userId, followingIdsWithSelf)
              )
            )
          );
        } else {
          visibilityCondition = (0, import_drizzle_orm36.and)(
            (0, import_drizzle_orm36.eq)(posts.visibility, "PUBLIC"),
            (0, import_drizzle_orm36.or)((0, import_drizzle_orm36.eq)(profiles.isPrivate, false), import_drizzle_orm36.sql`${profiles.isPrivate} IS NULL`)
          );
        }
        const postsResult = await db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          visibility: posts.visibility,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
            isVerified: users.isVerified
          }
        }).from(posts).innerJoin(postHashtags, (0, import_drizzle_orm36.eq)(posts.id, postHashtags.postId)).innerJoin(users, (0, import_drizzle_orm36.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm36.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm36.and)(
          (0, import_drizzle_orm36.eq)(postHashtags.hashtagId, hashtag.id),
          (0, import_drizzle_orm36.notInArray)(posts.userId, ignoreIds),
          visibilityCondition
        )).orderBy((0, import_drizzle_orm36.desc)(posts.createdAt)).limit(limit).offset(offset);
        if (postsResult.length === 0) {
          return res.json({ success: true, data: { hashtag, posts: [] } });
        }
        const populatedPosts = await populatePostStats(postsResult, currentUserId);
        const fetchedPostIds = populatedPosts.map((p) => p.id);
        const allMedia = await db.select().from(postMedia).where((0, import_drizzle_orm36.inArray)(postMedia.postId, fetchedPostIds));
        const mediaByPost = allMedia.reduce((acc, media) => {
          if (!acc[media.postId]) acc[media.postId] = [];
          acc[media.postId].push(media);
          return acc;
        }, {});
        for (const post of populatedPosts) {
          post.media = mediaByPost[post.id] || [];
        }
        res.json({ success: true, data: { hashtag, posts: populatedPosts } });
      } catch (error) {
        console.error("Hashtags error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/collaborators.ts
var collaborators_exports = {};
__export(collaborators_exports, {
  collaboratorsRouter: () => collaboratorsRouter
});
var import_express28, import_drizzle_orm37, import_express_rate_limit3, collaboratorsRouter, actionLimiter;
var init_collaborators = __esm({
  "server/routes/collaborators.ts"() {
    "use strict";
    import_express28 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm37 = require("drizzle-orm");
    init_auth();
    init_notifications();
    import_express_rate_limit3 = __toESM(require("express-rate-limit"), 1);
    collaboratorsRouter = (0, import_express28.Router)();
    actionLimiter = (0, import_express_rate_limit3.default)({
      windowMs: 1 * 60 * 1e3,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { message: "\xC7ok fazla istek g\xF6nderdiniz, l\xFCtfen bekleyin." } }
    });
    collaboratorsRouter.use(requireAuth);
    collaboratorsRouter.use(actionLimiter);
    collaboratorsRouter.get("/invites", async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const projectInvites = await db.select({
          id: projectCollaborators.id,
          type: import_drizzle_orm37.sql`'project'`,
          projectId: projects.id,
          title: projects.title,
          status: projectCollaborators.status,
          createdAt: projectCollaborators.createdAt,
          inviterId: projects.userId,
          inviterUsername: users.username,
          inviterDisplayName: profiles.displayName,
          inviterAvatarUrl: profiles.avatarUrl
        }).from(projectCollaborators).innerJoin(projects, (0, import_drizzle_orm37.eq)(projectCollaborators.projectId, projects.id)).innerJoin(users, (0, import_drizzle_orm37.eq)(projects.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm37.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm37.and)((0, import_drizzle_orm37.eq)(projectCollaborators.userId, currentUserId), (0, import_drizzle_orm37.eq)(projectCollaborators.status, "pending")));
        const postInvites = await db.select({
          id: postCollaborators.id,
          type: import_drizzle_orm37.sql`'post'`,
          postId: posts.id,
          content: posts.content,
          postType: posts.postType,
          contentWarning: posts.contentWarning,
          status: postCollaborators.status,
          createdAt: postCollaborators.createdAt,
          inviterId: posts.userId,
          inviterUsername: users.username,
          inviterDisplayName: profiles.displayName,
          inviterAvatarUrl: profiles.avatarUrl
        }).from(postCollaborators).innerJoin(posts, (0, import_drizzle_orm37.eq)(postCollaborators.postId, posts.id)).innerJoin(users, (0, import_drizzle_orm37.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm37.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm37.and)((0, import_drizzle_orm37.eq)(postCollaborators.userId, currentUserId), (0, import_drizzle_orm37.eq)(postCollaborators.status, "pending")));
        res.json({
          success: true,
          data: {
            projects: projectInvites.map((i) => ({ ...i, type: "project" })),
            posts: postInvites.map((i) => ({ ...i, type: "post" }))
          }
        });
      } catch (error) {
        console.error("Error fetching invites:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
    collaboratorsRouter.patch("/invites/:type/:id", async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const { type, id } = req.params;
        const inviteId = parseInt(id, 10);
        const { status } = req.body;
        if (isNaN(inviteId)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz davet ID." } });
          return;
        }
        if (!["accepted", "rejected"].includes(status)) {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz durum." } });
          return;
        }
        if (type === "project") {
          const invite = await db.select().from(projectCollaborators).where((0, import_drizzle_orm37.and)((0, import_drizzle_orm37.eq)(projectCollaborators.id, inviteId), (0, import_drizzle_orm37.eq)(projectCollaborators.userId, currentUserId))).limit(1);
          if (invite.length === 0) {
            res.status(404).json({ success: false, error: { message: "Davet bulunamad\u0131." } });
            return;
          }
          if (invite[0].status !== "pending") {
            res.status(400).json({ success: false, error: { message: "Bu davet zaten yan\u0131tlanm\u0131\u015F." } });
            return;
          }
          await db.update(projectCollaborators).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm37.eq)(projectCollaborators.id, inviteId));
          const project = await db.select({ userId: projects.userId }).from(projects).where((0, import_drizzle_orm37.eq)(projects.id, invite[0].projectId)).limit(1);
          if (project.length > 0) {
            await notify(currentUserId, project[0].userId, `project_collaborator_${status}`, void 0, void 0, invite[0].projectId);
          }
          res.json({ success: true, data: { status } });
          return;
        } else if (type === "post") {
          const invite = await db.select().from(postCollaborators).where((0, import_drizzle_orm37.and)((0, import_drizzle_orm37.eq)(postCollaborators.id, inviteId), (0, import_drizzle_orm37.eq)(postCollaborators.userId, currentUserId))).limit(1);
          if (invite.length === 0) {
            res.status(404).json({ success: false, error: { message: "Davet bulunamad\u0131." } });
            return;
          }
          if (invite[0].status !== "pending") {
            res.status(400).json({ success: false, error: { message: "Bu davet zaten yan\u0131tlanm\u0131\u015F." } });
            return;
          }
          await db.update(postCollaborators).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm37.eq)(postCollaborators.id, inviteId));
          const post = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm37.eq)(posts.id, invite[0].postId)).limit(1);
          if (post.length > 0) {
            await notify(currentUserId, post[0].userId, `post_collaborator_${status}`, invite[0].postId);
          }
          res.json({ success: true, data: { status } });
          return;
        } else {
          res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz tip." } });
          return;
        }
      } catch (error) {
        console.error("Error responding to invite:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/support.ts
var support_exports = {};
__export(support_exports, {
  supportRouter: () => supportRouter
});
var import_express29, import_drizzle_orm38, import_zod9, supportRouter, createTicketSchema, createMessageSchema2;
var init_support = __esm({
  "server/routes/support.ts"() {
    "use strict";
    import_express29 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm38 = require("drizzle-orm");
    init_auth();
    import_zod9 = require("zod");
    supportRouter = (0, import_express29.Router)();
    createTicketSchema = import_zod9.z.object({
      category: import_zod9.z.string().min(1).max(50),
      subject: import_zod9.z.string().min(5, "Konu en az 5 karakter olmal\u0131d\u0131r.").max(255),
      description: import_zod9.z.string().min(10, "A\xE7\u0131klama en az 10 karakter olmal\u0131d\u0131r.")
    });
    createMessageSchema2 = import_zod9.z.object({
      message: import_zod9.z.string().min(1, "Mesaj bo\u015F olamaz.")
    });
    supportRouter.post("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = req.user.userId;
        const parsed = createTicketSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
        }
        const [ticket] = await db.insert(supportTickets).values({
          userId: currentUserId,
          category: parsed.data.category,
          subject: parsed.data.subject,
          description: parsed.data.description,
          status: "OPEN"
        }).returning();
        res.json({ success: true, data: ticket });
      } catch (error) {
        console.error("Create ticket error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131" } });
      }
    });
    supportRouter.get("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = req.user.userId;
        const tickets = await db.select().from(supportTickets).where((0, import_drizzle_orm38.eq)(supportTickets.userId, currentUserId)).orderBy((0, import_drizzle_orm38.desc)(supportTickets.createdAt));
        res.json({ success: true, data: tickets });
      } catch (error) {
        console.error("Get tickets error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131" } });
      }
    });
    supportRouter.get("/:id", requireAuth, async (req, res) => {
      try {
        const currentUserId = req.user.userId;
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID" } });
        const [ticket] = await db.select().from(supportTickets).where((0, import_drizzle_orm38.eq)(supportTickets.id, ticketId));
        if (!ticket) {
          return res.status(404).json({ success: false, error: { message: "Talep bulunamad\u0131" } });
        }
        if (ticket.userId !== currentUserId) {
          return res.status(403).json({ success: false, error: { message: "Yetkisiz eri\u015Fim" } });
        }
        const messages2 = await db.select({
          id: supportTicketMessages.id,
          message: supportTicketMessages.message,
          isAdmin: supportTicketMessages.isAdmin,
          createdAt: supportTicketMessages.createdAt,
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(supportTicketMessages).innerJoin(users, (0, import_drizzle_orm38.eq)(users.id, supportTicketMessages.userId)).leftJoin(profiles, (0, import_drizzle_orm38.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm38.eq)(supportTicketMessages.ticketId, ticketId)).orderBy(supportTicketMessages.createdAt);
        res.json({ success: true, data: { ...ticket, messages: messages2 } });
      } catch (error) {
        console.error("Get ticket error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131" } });
      }
    });
    supportRouter.post("/:id/messages", requireAuth, async (req, res) => {
      try {
        const currentUserId = req.user.userId;
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz ID" } });
        const parsed = createMessageSchema2.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ success: false, error: { message: parsed.error.issues[0].message } });
        }
        const [ticket] = await db.select().from(supportTickets).where((0, import_drizzle_orm38.eq)(supportTickets.id, ticketId));
        if (!ticket) return res.status(404).json({ success: false, error: { message: "Talep bulunamad\u0131" } });
        if (ticket.userId !== currentUserId) {
          return res.status(403).json({ success: false, error: { message: "Yetkisiz eri\u015Fim" } });
        }
        if (ticket.status === "CLOSED") {
          return res.status(400).json({ success: false, error: { message: "Kapanm\u0131\u015F bir talebe yan\u0131t veremezsiniz." } });
        }
        const [message] = await db.insert(supportTicketMessages).values({
          ticketId,
          userId: currentUserId,
          message: parsed.data.message,
          isAdmin: false
        }).returning();
        await db.update(supportTickets).set({ updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm38.eq)(supportTickets.id, ticketId));
        res.json({ success: true, data: message });
      } catch (error) {
        console.error("Create ticket message error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131" } });
      }
    });
  }
});

// server/routes/feedbacks.ts
var feedbacks_exports = {};
__export(feedbacks_exports, {
  feedbacksRouter: () => feedbacksRouter
});
var import_express30, import_drizzle_orm39, import_zod10, feedbacksRouter, createFeedbackSchema;
var init_feedbacks = __esm({
  "server/routes/feedbacks.ts"() {
    "use strict";
    import_express30 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm39 = require("drizzle-orm");
    init_auth();
    import_zod10 = require("zod");
    feedbacksRouter = (0, import_express30.Router)();
    createFeedbackSchema = import_zod10.z.object({
      type: import_zod10.z.string().min(1).max(50),
      title: import_zod10.z.string().min(5, "Ba\u015Fl\u0131k en az 5 karakter olmal\u0131d\u0131r.").max(255),
      description: import_zod10.z.string().min(10, "A\xE7\u0131klama en az 10 karakter olmal\u0131d\u0131r.")
    });
    feedbacksRouter.post("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = req.user.userId;
        const parsed = createFeedbackSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
          });
        }
        const [feedback] = await db.insert(feedbacks).values({
          userId: currentUserId,
          type: parsed.data.type,
          title: parsed.data.title,
          description: parsed.data.description,
          status: "NEW"
        }).returning();
        res.json({ success: true, data: feedback });
      } catch (error) {
        console.error("Create feedback error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131" } });
      }
    });
    feedbacksRouter.get("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = req.user.userId;
        const results = await db.select().from(feedbacks).where((0, import_drizzle_orm39.eq)(feedbacks.userId, currentUserId)).orderBy((0, import_drizzle_orm39.desc)(feedbacks.createdAt));
        res.json({ success: true, data: results });
      } catch (error) {
        console.error("Get feedbacks error:", error);
        res.status(500).json({ success: false, error: { message: "Sunucu hatas\u0131" } });
      }
    });
  }
});

// server/routes/appeals.ts
var appeals_exports = {};
__export(appeals_exports, {
  appealsRouter: () => appealsRouter
});
var import_express31, import_drizzle_orm40, appealsRouter, resolveUserFromRequest;
var init_appeals = __esm({
  "server/routes/appeals.ts"() {
    "use strict";
    import_express31 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm40 = require("drizzle-orm");
    init_auth();
    init_jwt();
    appealsRouter = (0, import_express31.Router)();
    resolveUserFromRequest = async (req) => {
      const authUserId = optionalAuthContext(req);
      if (authUserId) {
        const userRec = await db.select({
          id: users.id,
          username: users.username,
          isActive: users.isActive,
          banReason: users.banReason
        }).from(users).where((0, import_drizzle_orm40.eq)(users.id, authUserId)).limit(1);
        if (userRec.length > 0) return userRec[0];
      }
      const authHeader = req.headers.authorization;
      let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      if (!token && typeof req.body?.suspensionToken === "string") {
        token = req.body.suspensionToken;
      }
      if (!token && typeof req.query?.token === "string") {
        token = req.query.token;
      }
      if (token) {
        try {
          const decoded = verifySuspensionToken(token);
          if (decoded && decoded.userId) {
            const userRec = await db.select({
              id: users.id,
              username: users.username,
              isActive: users.isActive,
              banReason: users.banReason
            }).from(users).where((0, import_drizzle_orm40.eq)(users.id, decoded.userId)).limit(1);
            if (userRec.length > 0) return userRec[0];
          }
        } catch {
          return null;
        }
      }
      return null;
    };
    appealsRouter.post("/", async (req, res) => {
      try {
        const user = await resolveUserFromRequest(req);
        if (!user) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Yetkilendirme do\u011Frulanamad\u0131. L\xFCtfen tekrar deneyin." }
          });
          return;
        }
        if (user.isActive) {
          res.status(400).json({
            success: false,
            error: { code: "BAD_REQUEST", message: "Hesab\u0131n\u0131z aktif durumdad\u0131r. \u0130tiraz yaln\u0131zca ask\u0131ya al\u0131nan hesaplar i\xE7in ge\xE7erlidir." }
          });
          return;
        }
        const { reason } = req.body;
        if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "L\xFCtfen itiraz gerek\xE7enizi en az 10 karakter olacak \u015Fekilde a\xE7\u0131klay\u0131n\u0131z." }
          });
          return;
        }
        if (reason.trim().length > 2e3) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "\u0130tiraz gerek\xE7esi en fazla 2000 karakter olabilir." }
          });
          return;
        }
        const activeAppeal = await db.select().from(appeals).where((0, import_drizzle_orm40.eq)(appeals.userId, user.id)).orderBy((0, import_drizzle_orm40.desc)(appeals.createdAt)).limit(1);
        if (activeAppeal.length > 0 && activeAppeal[0].status === "PENDING") {
          res.status(409).json({
            success: false,
            error: {
              code: "DUPLICATE_APPEAL",
              message: "Zaten de\u011Ferlendirilmekte olan aktif bir itiraz\u0131n\u0131z bulunmaktad\u0131r. Sonu\xE7lanana kadar yeni bir itiraz g\xF6nderemezsiniz.",
              appeal: activeAppeal[0]
            }
          });
          return;
        }
        const inserted = await db.insert(appeals).values({
          userId: user.id,
          banReason: user.banReason || "Topluluk kurallar\u0131n\u0131n ihlali",
          reason: reason.trim(),
          status: "PENDING",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        res.status(201).json({
          success: true,
          data: {
            message: "\u0130tiraz\u0131n\u0131z ba\u015Far\u0131yla iletildi. Y\xF6neticilerimiz taraf\u0131ndan incelendikten sonra durumunuz g\xFCncellenecektir.",
            appeal: inserted[0]
          }
        });
      } catch (err) {
        console.error("Appeal submission error:", err);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "\u0130tiraz g\xF6nderilirken bir sunucu hatas\u0131 olu\u015Ftu." }
        });
      }
    });
    appealsRouter.get("/my", async (req, res) => {
      try {
        const user = await resolveUserFromRequest(req);
        if (!user) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Yetkilendirme do\u011Frulanamad\u0131." }
          });
          return;
        }
        const latestAppeal = await db.select().from(appeals).where((0, import_drizzle_orm40.eq)(appeals.userId, user.id)).orderBy((0, import_drizzle_orm40.desc)(appeals.createdAt)).limit(1);
        res.json({
          success: true,
          data: {
            appeal: latestAppeal.length > 0 ? latestAppeal[0] : null
          }
        });
      } catch (err) {
        console.error("Get my appeal error:", err);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "\u0130tiraz bilgisi al\u0131namad\u0131." }
        });
      }
    });
  }
});

// server/services/leagueAiQuestions.ts
async function generateDraftQuestionsWithAI({
  category = "Tarih ve K\xFClt\xFCr",
  difficulty = "MEDIUM",
  ageGroup = "ALL",
  count = 5
}) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        createdCount: 0,
        questions: [],
        error: "GEMINI_API_KEY ortam de\u011Fi\u015Fkeni bulunamad\u0131."
      };
    }
    const ai = new import_genai.GoogleGenAI();
    const prompt = `
Sen 19 May\u0131s Atat\xFCrk'\xFC Anma, Gen\xE7lik ve Spor Bayram\u0131 "Gen\xE7 Sosyal Gen\xE7lik Ligi" i\xE7in T\xFCrk\xE7e bilgi yar\u0131\u015Fmas\u0131 soru haz\u0131rlay\u0131c\u0131s\u0131s\u0131n.
L\xFCtfen a\u015Fa\u011F\u0131daki parametrelere g\xF6re tam ${count} adet \xE7oktan se\xE7meli soru \xFCret.

Parametreler:
- Kategori: ${category}
- Zorluk Derecesi: ${difficulty} (EASY, MEDIUM, HARD, EXPERT)
- Hedef Ya\u015F Grubu: ${ageGroup}
- Dil: T\xFCrk\xE7e

Kurallar:
1. Her sorunun kesinlikle 4 se\xE7ene\u011Fi olmal\u0131d\u0131r: "A", "B", "C", "D".
2. Se\xE7eneklerden yaln\u0131zca B\u0130R tanesi do\u011Fru (isCorrect: true) olmal\u0131d\u0131r, di\u011Fer \xFC\xE7\xFC yanl\u0131\u015F (isCorrect: false) olmal\u0131d\u0131r.
3. Sorular ger\xE7ek, do\u011Frulanabilir ve g\xFCncel bilgilere dayanmal\u0131d\u0131r. Belirsiz veya tart\u0131\u015Fmal\u0131 konulardan ka\xE7\u0131n.
4. A\xE7\u0131klama (explanation) b\xF6l\xFCm\xFCnde neden o se\xE7ene\u011Fin do\u011Fru oldu\u011Fu gen\xE7lere \xF6\u011Fretici bir dille \xF6zetlenmelidir.

L\xFCtfen \xE7\u0131kt\u0131y\u0131 sadece a\u015Fa\u011F\u0131daki JSON \u015Femas\u0131na uygun dizi (array) format\u0131nda ver:
[
  {
    "question": "T\xFCrkiye Cumhuriyeti'nin kurucusu Gazi Mustafa Kemal Atat\xFCrk, Milli M\xFCcadele'yi ba\u015Flatmak \xFCzere Samsun'a hangi tarihte \xE7\u0131km\u0131\u015Ft\u0131r?",
    "category": "${category}",
    "difficulty": "${difficulty}",
    "ageGroup": "${ageGroup}",
    "explanation": "Mustafa Kemal Pa\u015Fa, 19 May\u0131s 1919'da Band\u0131rma Vapuru ile Samsun'a ayak basarak Milli M\xFCcadele'yi fiilen ba\u015Flatm\u0131\u015Ft\u0131r.",
    "options": [
      { "key": "A", "text": "23 Nisan 1920", "isCorrect": false },
      { "key": "B", "text": "19 May\u0131s 1919", "isCorrect": true },
      { "key": "C", "text": "29 Ekim 1923", "isCorrect": false },
      { "key": "D", "text": "30 A\u011Fustos 1922", "isCorrect": false }
    ]
  }
]
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const rawText = response.text || "[]";
    let parsed = [];
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", rawText);
      return { createdCount: 0, questions: [], error: "Yapay zeka yan\u0131t\u0131 i\u015Flenemedi." };
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { createdCount: 0, questions: [], error: "Uygun soru format\u0131 \xFCretilemedi." };
    }
    const insertedQuestions = [];
    for (const item of parsed) {
      if (!item.question || !Array.isArray(item.options) || item.options.length !== 4) {
        continue;
      }
      const correctOpts = item.options.filter((o) => o.isCorrect);
      if (correctOpts.length !== 1) {
        continue;
      }
      const cleanQ = item.question.trim();
      const existing = await db.select({ id: leagueQuestions.id }).from(leagueQuestions).where((0, import_drizzle_orm41.ilike)(leagueQuestions.question, `%${cleanQ.substring(0, 50)}%`)).limit(1);
      if (existing.length > 0) {
        continue;
      }
      const [insertedQ] = await db.insert(leagueQuestions).values({
        question: cleanQ,
        category: item.category || category,
        difficulty: item.difficulty || difficulty,
        ageGroup: item.ageGroup || ageGroup,
        language: "tr",
        explanation: item.explanation?.trim() || null,
        sourceType: "AI",
        sourceReference: "Gemini 3.8 Flash Question Generator",
        status: "DRAFT"
        // AI generated questions start as DRAFT
      }).returning();
      for (const opt of item.options) {
        await db.insert(leagueQuestionOptions).values({
          questionId: insertedQ.id,
          optionKey: opt.key,
          optionText: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect)
        });
      }
      insertedQuestions.push(insertedQ);
    }
    return {
      createdCount: insertedQuestions.length,
      questions: insertedQuestions
    };
  } catch (error) {
    console.error("AI question generation error:", error);
    return {
      createdCount: 0,
      questions: [],
      error: error?.message || "Yapay zeka ile soru \xFCretilirken hata olu\u015Ftu."
    };
  }
}
var import_genai, import_drizzle_orm41;
var init_leagueAiQuestions = __esm({
  "server/services/leagueAiQuestions.ts"() {
    "use strict";
    import_genai = require("@google/genai");
    init_db();
    init_schema();
    import_drizzle_orm41 = require("drizzle-orm");
  }
});

// server/routes/league.ts
var league_exports = {};
__export(league_exports, {
  leagueRouter: () => leagueRouter
});
async function getMatchQuestionsSanitized(matchId) {
  const matchQuestions = await db.select({
    order: leagueMatchQuestions.order,
    questionId: leagueQuestions.id,
    question: leagueQuestions.question,
    category: leagueQuestions.category,
    difficulty: leagueQuestions.difficulty
  }).from(leagueMatchQuestions).innerJoin(leagueQuestions, (0, import_drizzle_orm42.eq)(leagueMatchQuestions.questionId, leagueQuestions.id)).where((0, import_drizzle_orm42.eq)(leagueMatchQuestions.matchId, matchId)).orderBy(leagueMatchQuestions.order);
  const result = [];
  for (const q of matchQuestions) {
    const options = await db.select({
      optionKey: leagueQuestionOptions.optionKey,
      optionText: leagueQuestionOptions.optionText
    }).from(leagueQuestionOptions).where((0, import_drizzle_orm42.eq)(leagueQuestionOptions.questionId, q.questionId)).orderBy(leagueQuestionOptions.optionKey);
    result.push({
      ...q,
      options
    });
  }
  return result;
}
var import_express32, import_drizzle_orm42, leagueRouter, requireAdmin, getReqUserId;
var init_league = __esm({
  "server/routes/league.ts"() {
    "use strict";
    import_express32 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm42 = require("drizzle-orm");
    init_leagueAutomation();
    init_leagueAiQuestions();
    init_auth();
    leagueRouter = (0, import_express32.Router)();
    requireAdmin = requireRole("ADMIN");
    getReqUserId = (req) => {
      return req.user?.userId || req.user?.id || null;
    };
    leagueRouter.get("/current", optionalAuth, async (req, res) => {
      try {
        await seedStarterQuestionsIfNeeded();
        await ensureLeagueBadges();
        await checkAndRunSeasonTransitions();
        const season = await ensureCurrentSeason();
        let userParticipation = null;
        let userAge = 16;
        let suggestedAgeGroup = "16-17";
        const currentUserId = getReqUserId(req);
        if (currentUserId) {
          const [userProfile] = await db.select({
            birthDate: profiles.birthDate
          }).from(profiles).where((0, import_drizzle_orm42.eq)(profiles.userId, currentUserId)).limit(1);
          if (userProfile?.birthDate) {
            userAge = calculateAge(userProfile.birthDate);
          }
          suggestedAgeGroup = determineAgeGroup(userAge);
          const [participant] = await db.select().from(leagueParticipants).where(
            (0, import_drizzle_orm42.and)(
              (0, import_drizzle_orm42.eq)(leagueParticipants.seasonId, season.id),
              (0, import_drizzle_orm42.eq)(leagueParticipants.userId, currentUserId)
            )
          ).limit(1);
          if (participant) {
            const [rankRes] = await db.execute(import_drizzle_orm42.sql`
          SELECT COUNT(*) + 1 as rank 
          FROM "league_participants" 
          WHERE "season_id" = ${season.id} 
            AND "total_points" > ${participant.totalPoints}
        `);
            const userRank = Number(rankRes?.rows?.[0]?.rank || 1);
            userParticipation = {
              ...participant,
              rank: userRank
            };
          }
        }
        const leaders = await db.select({
          id: leagueParticipants.id,
          userId: leagueParticipants.userId,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          totalPoints: leagueParticipants.totalPoints,
          matchesWon: leagueParticipants.matchesWon,
          matchesPlayed: leagueParticipants.matchesPlayed,
          ageGroup: leagueParticipants.ageGroup
        }).from(leagueParticipants).innerJoin(users, (0, import_drizzle_orm42.eq)(leagueParticipants.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm42.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm42.eq)(leagueParticipants.seasonId, season.id)).orderBy((0, import_drizzle_orm42.desc)(leagueParticipants.totalPoints), (0, import_drizzle_orm42.desc)(leagueParticipants.matchesWon)).limit(3);
        const [qCountRes] = await db.select({ count: import_drizzle_orm42.sql`count(*)` }).from(leagueQuestions).where((0, import_drizzle_orm42.eq)(leagueQuestions.status, "ACTIVE"));
        res.json({
          success: true,
          season,
          stats: {
            activeQuestionsCount: Number(qCountRes?.count || 0),
            topLeaders: leaders
          },
          userState: {
            isRegistered: Boolean(userParticipation),
            participation: userParticipation,
            calculatedAge: userAge,
            suggestedAgeGroup
          }
        });
      } catch (err) {
        console.error("Error fetching current league season:", err);
        res.status(500).json({ success: false, error: { message: "Lig verileri y\xFCklenirken bir hata olu\u015Ftu." } });
      }
    });
    leagueRouter.get("/seasons", async (req, res) => {
      try {
        const seasons = await db.select({
          id: leagueSeasons.id,
          year: leagueSeasons.year,
          title: leagueSeasons.title,
          theme: leagueSeasons.theme,
          description: leagueSeasons.description,
          startDate: leagueSeasons.startDate,
          endDate: leagueSeasons.endDate,
          status: leagueSeasons.status,
          totalParticipants: leagueSeasons.totalParticipants,
          totalMatches: leagueSeasons.totalMatches,
          championUserId: leagueSeasons.championUserId,
          championUsername: users.username,
          championAvatar: profiles.avatarUrl
        }).from(leagueSeasons).leftJoin(users, (0, import_drizzle_orm42.eq)(leagueSeasons.championUserId, users.id)).leftJoin(profiles, (0, import_drizzle_orm42.eq)(users.id, profiles.userId)).orderBy((0, import_drizzle_orm42.desc)(leagueSeasons.year));
        res.json({ success: true, seasons });
      } catch (err) {
        console.error("Error fetching league seasons archive:", err);
        res.status(500).json({ success: false, error: { message: "Sezon ar\u015Fivi y\xFCklenemedi." } });
      }
    });
    leagueRouter.get("/seasons/:id", async (req, res) => {
      try {
        const seasonId = parseInt(req.params.id);
        if (isNaN(seasonId)) {
          return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz sezon ID'si." } });
        }
        const [season] = await db.select().from(leagueSeasons).where((0, import_drizzle_orm42.eq)(leagueSeasons.id, seasonId)).limit(1);
        if (!season) {
          return res.status(404).json({ success: false, error: { message: "Sezon bulunamad\u0131." } });
        }
        const topParticipants = await db.select({
          userId: leagueParticipants.userId,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          totalPoints: leagueParticipants.totalPoints,
          matchesWon: leagueParticipants.matchesWon,
          matchesPlayed: leagueParticipants.matchesPlayed,
          correctAnswersCount: leagueParticipants.correctAnswersCount,
          ageGroup: leagueParticipants.ageGroup,
          status: leagueParticipants.status
        }).from(leagueParticipants).innerJoin(users, (0, import_drizzle_orm42.eq)(leagueParticipants.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm42.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm42.eq)(leagueParticipants.seasonId, seasonId)).orderBy((0, import_drizzle_orm42.desc)(leagueParticipants.totalPoints), (0, import_drizzle_orm42.desc)(leagueParticipants.matchesWon)).limit(10);
        res.json({
          success: true,
          season,
          topParticipants
        });
      } catch (err) {
        console.error("Error fetching season details:", err);
        res.status(500).json({ success: false, error: { message: "Sezon detaylar\u0131 y\xFCklenemedi." } });
      }
    });
    leagueRouter.post("/register", requireAuth, async (req, res) => {
      try {
        const userId = getReqUserId(req);
        const season = await ensureCurrentSeason();
        const isSim = season.settings?.simulationMode;
        const isOpen = season.status === "REGISTRATION_OPEN" || season.status === "IN_PROGRESS" || isSim;
        if (!isOpen) {
          return res.status(400).json({
            success: false,
            error: { message: "Bu sezon i\xE7in \u015Fu anda kay\u0131tlar a\xE7\u0131k de\u011Fildir." }
          });
        }
        const [existing] = await db.select().from(leagueParticipants).where(
          (0, import_drizzle_orm42.and)(
            (0, import_drizzle_orm42.eq)(leagueParticipants.seasonId, season.id),
            (0, import_drizzle_orm42.eq)(leagueParticipants.userId, userId)
          )
        ).limit(1);
        if (existing) {
          return res.json({
            success: true,
            participant: existing,
            message: "Zaten bu sezona kay\u0131tl\u0131s\u0131n\u0131z!"
          });
        }
        const [userProfile] = await db.select({
          birthDate: profiles.birthDate
        }).from(profiles).where((0, import_drizzle_orm42.eq)(profiles.userId, userId)).limit(1);
        let birthDate = userProfile?.birthDate;
        if (!birthDate && req.body.birthDate) {
          const parsedDate = new Date(req.body.birthDate);
          if (!isNaN(parsedDate.getTime())) {
            birthDate = parsedDate;
            await db.update(profiles).set({ birthDate: parsedDate, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm42.eq)(profiles.userId, userId));
          }
        }
        const age = calculateAge(birthDate);
        const ageGroup = req.body.ageGroup || determineAgeGroup(age);
        const [participant] = await db.insert(leagueParticipants).values({
          seasonId: season.id,
          userId,
          ageGroup,
          totalPoints: 0,
          matchesPlayed: 0,
          matchesWon: 0,
          correctAnswersCount: 0,
          totalAnswersCount: 0,
          currentRound: "QUALIFIERS",
          status: "ACTIVE"
        }).returning();
        await db.update(leagueSeasons).set({
          totalParticipants: import_drizzle_orm42.sql`${leagueSeasons.totalParticipants} + 1`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm42.eq)(leagueSeasons.id, season.id));
        res.json({
          success: true,
          participant,
          message: "\u2713 Kat\u0131l\u0131m\u0131n tamamland\u0131! 19 May\u0131s Gen\xE7lik Ligi'ne ho\u015F geldin."
        });
      } catch (err) {
        console.error("Error registering user to league:", err);
        res.status(500).json({ success: false, error: { message: "Kay\u0131t i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu." } });
      }
    });
    leagueRouter.get("/leaderboard", async (req, res) => {
      try {
        const seasonIdParam = req.query.seasonId ? parseInt(req.query.seasonId) : null;
        let seasonId;
        if (!seasonIdParam) {
          const current = await ensureCurrentSeason();
          seasonId = current.id;
        } else {
          seasonId = seasonIdParam;
        }
        const ageGroup = req.query.ageGroup;
        const page = Math.max(1, parseInt(req.query.page || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "50")));
        const offset = (page - 1) * limit;
        const conditions = [(0, import_drizzle_orm42.eq)(leagueParticipants.seasonId, seasonId)];
        if (ageGroup && ageGroup !== "all") {
          conditions.push((0, import_drizzle_orm42.eq)(leagueParticipants.ageGroup, ageGroup));
        }
        const participants = await db.select({
          id: leagueParticipants.id,
          userId: leagueParticipants.userId,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          totalPoints: leagueParticipants.totalPoints,
          matchesWon: leagueParticipants.matchesWon,
          matchesPlayed: leagueParticipants.matchesPlayed,
          correctAnswersCount: leagueParticipants.correctAnswersCount,
          ageGroup: leagueParticipants.ageGroup,
          currentRound: leagueParticipants.currentRound,
          status: leagueParticipants.status
        }).from(leagueParticipants).innerJoin(users, (0, import_drizzle_orm42.eq)(leagueParticipants.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm42.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm42.and)(...conditions)).orderBy((0, import_drizzle_orm42.desc)(leagueParticipants.totalPoints), (0, import_drizzle_orm42.desc)(leagueParticipants.matchesWon)).limit(limit).offset(offset);
        const rankedParticipants = participants.map((p, idx) => ({
          ...p,
          rank: offset + idx + 1
        }));
        const [countResult] = await db.select({ count: import_drizzle_orm42.sql`count(*)` }).from(leagueParticipants).where((0, import_drizzle_orm42.and)(...conditions));
        res.json({
          success: true,
          leaderboard: rankedParticipants,
          pagination: {
            page,
            limit,
            total: Number(countResult?.count || 0),
            totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
          }
        });
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).json({ success: false, error: { message: "Liderlik tablosu y\xFCklenemedi." } });
      }
    });
    leagueRouter.post("/match/start", requireAuth, async (req, res) => {
      try {
        const userId = getReqUserId(req);
        const season = await ensureCurrentSeason();
        const isSim = season.settings?.simulationMode;
        const isLive = season.status === "IN_PROGRESS" || isSim;
        if (!isLive) {
          return res.status(400).json({
            success: false,
            error: { message: "Lig ma\xE7lar\u0131 hen\xFCz ba\u015Flamad\u0131 veya sezon sona erdi." }
          });
        }
        let [participant] = await db.select().from(leagueParticipants).where(
          (0, import_drizzle_orm42.and)(
            (0, import_drizzle_orm42.eq)(leagueParticipants.seasonId, season.id),
            (0, import_drizzle_orm42.eq)(leagueParticipants.userId, userId)
          )
        ).limit(1);
        if (!participant) {
          const [userProfile] = await db.select({ birthDate: profiles.birthDate }).from(profiles).where((0, import_drizzle_orm42.eq)(profiles.userId, userId)).limit(1);
          const age = calculateAge(userProfile?.birthDate);
          const ageGroup = determineAgeGroup(age);
          [participant] = await db.insert(leagueParticipants).values({
            seasonId: season.id,
            userId,
            ageGroup,
            totalPoints: 0
          }).returning();
        }
        if (participant.isFlagged) {
          return res.status(403).json({
            success: false,
            error: { message: "Hesab\u0131n\u0131z hile veya \u015F\xFCpheli davran\u0131\u015F nedeniyle ligden ge\xE7ici olarak uzakla\u015Ft\u0131r\u0131lm\u0131\u015Ft\u0131r." }
          });
        }
        const [existingMatch] = await db.select().from(leagueMatches).where(
          (0, import_drizzle_orm42.and)(
            (0, import_drizzle_orm42.eq)(leagueMatches.seasonId, season.id),
            (0, import_drizzle_orm42.eq)(leagueMatches.status, "ACTIVE"),
            (0, import_drizzle_orm42.or)(
              (0, import_drizzle_orm42.eq)(leagueMatches.player1Id, userId),
              (0, import_drizzle_orm42.eq)(leagueMatches.player2Id, userId)
            )
          )
        ).limit(1);
        if (existingMatch) {
          const matchQuestionsList2 = await getMatchQuestionsSanitized(existingMatch.id);
          return res.json({
            success: true,
            match: existingMatch,
            questions: matchQuestionsList2,
            message: "Devam eden ma\xE7\u0131n\u0131za y\xF6nlendiriliyorsunuz."
          });
        }
        const previousAnsweredQIds = await db.select({ questionId: leagueMatchAnswers.questionId }).from(leagueMatchAnswers).where((0, import_drizzle_orm42.eq)(leagueMatchAnswers.userId, userId));
        const answeredIds = previousAnsweredQIds.map((a) => a.questionId);
        const questionsPerMatch = season.settings?.questionsPerMatch || 6;
        let queryConditions = [(0, import_drizzle_orm42.eq)(leagueQuestions.status, "ACTIVE")];
        if (answeredIds.length > 0) {
          const availableCountRes = await db.select({ count: import_drizzle_orm42.sql`count(*)` }).from(leagueQuestions).where((0, import_drizzle_orm42.and)((0, import_drizzle_orm42.eq)(leagueQuestions.status, "ACTIVE"), (0, import_drizzle_orm42.notInArray)(leagueQuestions.id, answeredIds)));
          if (Number(availableCountRes[0]?.count || 0) >= questionsPerMatch) {
            queryConditions.push((0, import_drizzle_orm42.notInArray)(leagueQuestions.id, answeredIds));
          }
        }
        const selectedQuestions = await db.select({
          id: leagueQuestions.id,
          question: leagueQuestions.question,
          category: leagueQuestions.category,
          difficulty: leagueQuestions.difficulty
        }).from(leagueQuestions).where((0, import_drizzle_orm42.and)(...queryConditions)).orderBy(import_drizzle_orm42.sql`RANDOM()`).limit(questionsPerMatch);
        if (selectedQuestions.length === 0) {
          const fallbackQuestions = await db.select({ id: leagueQuestions.id }).from(leagueQuestions).where((0, import_drizzle_orm42.eq)(leagueQuestions.status, "ACTIVE")).limit(questionsPerMatch);
          selectedQuestions.push(...fallbackQuestions);
        }
        const botNames = [
          "BilgeGen\xE7_06",
          "SiberY\u0131ld\u0131z_34",
          "TeknoRota_35",
          "Atat\xFCrkGen\xE7li\u011Fi_19",
          "MilliYetenek_16",
          "KodKa\u015Fifi_07"
        ];
        const randomBotName = botNames[Math.floor(Math.random() * botNames.length)];
        const now = /* @__PURE__ */ new Date();
        const [newMatch] = await db.insert(leagueMatches).values({
          seasonId: season.id,
          stage: participant.currentRound || "QUALIFIERS",
          ageGroup: participant.ageGroup,
          player1Id: userId,
          player2Id: null,
          isVsBot: true,
          botName: randomBotName,
          status: "ACTIVE",
          currentQuestionIndex: 0,
          player1Score: 0,
          player2Score: 0,
          startedAt: now,
          questionStartedAt: now
        }).returning();
        for (let i = 0; i < selectedQuestions.length; i++) {
          await db.insert(leagueMatchQuestions).values({
            matchId: newMatch.id,
            questionId: selectedQuestions[i].id,
            order: i + 1
          });
        }
        await db.update(leagueSeasons).set({
          totalMatches: import_drizzle_orm42.sql`${leagueSeasons.totalMatches} + 1`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm42.eq)(leagueSeasons.id, season.id));
        const matchQuestionsList = await getMatchQuestionsSanitized(newMatch.id);
        res.json({
          success: true,
          match: newMatch,
          questions: matchQuestionsList,
          timeLimitPerQuestion: season.settings?.questionTimeLimit || 20
        });
      } catch (err) {
        console.error("Error starting match:", err);
        res.status(500).json({ success: false, error: { message: "Ma\xE7 ba\u015Flat\u0131lamad\u0131." } });
      }
    });
    leagueRouter.get("/match/:id", requireAuth, async (req, res) => {
      try {
        const matchId = parseInt(req.params.id);
        const userId = getReqUserId(req);
        const [match] = await db.select().from(leagueMatches).where((0, import_drizzle_orm42.eq)(leagueMatches.id, matchId)).limit(1);
        if (!match) {
          return res.status(404).json({ success: false, error: { message: "Ma\xE7 bulunamad\u0131." } });
        }
        if (match.player1Id !== userId && match.player2Id !== userId && req.user?.role !== "ADMIN") {
          return res.status(403).json({ success: false, error: { message: "Bu ma\xE7a eri\u015Fim yetkiniz yok." } });
        }
        const questions = await getMatchQuestionsSanitized(matchId);
        const answers = await db.select({
          questionId: leagueMatchAnswers.questionId,
          selectedOption: leagueMatchAnswers.selectedOption,
          isCorrect: leagueMatchAnswers.isCorrect,
          pointsEarned: leagueMatchAnswers.pointsEarned
        }).from(leagueMatchAnswers).where(
          (0, import_drizzle_orm42.and)(
            (0, import_drizzle_orm42.eq)(leagueMatchAnswers.matchId, matchId),
            (0, import_drizzle_orm42.eq)(leagueMatchAnswers.userId, userId)
          )
        );
        res.json({
          success: true,
          match,
          questions,
          submittedAnswers: answers
        });
      } catch (err) {
        console.error("Error fetching match details:", err);
        res.status(500).json({ success: false, error: { message: "Ma\xE7 bilgileri y\xFCklenemedi." } });
      }
    });
    leagueRouter.post("/match/:id/answer", requireAuth, async (req, res) => {
      try {
        const matchId = parseInt(req.params.id);
        const userId = getReqUserId(req);
        const { questionId, selectedOption, timeTakenMs } = req.body;
        if (!questionId || !selectedOption) {
          return res.status(400).json({ success: false, error: { message: "Eksik parametre." } });
        }
        const [match] = await db.select().from(leagueMatches).where((0, import_drizzle_orm42.eq)(leagueMatches.id, matchId)).limit(1);
        if (!match || match.status !== "ACTIVE") {
          return res.status(400).json({ success: false, error: { message: "Aktif bir ma\xE7 bulunamad\u0131." } });
        }
        const [alreadyAnswered] = await db.select().from(leagueMatchAnswers).where(
          (0, import_drizzle_orm42.and)(
            (0, import_drizzle_orm42.eq)(leagueMatchAnswers.matchId, matchId),
            (0, import_drizzle_orm42.eq)(leagueMatchAnswers.userId, userId),
            (0, import_drizzle_orm42.eq)(leagueMatchAnswers.questionId, questionId)
          )
        ).limit(1);
        if (alreadyAnswered) {
          return res.status(400).json({ success: false, error: { message: "Bu soru i\xE7in zaten cevap verdiniz." } });
        }
        const timeMs = Math.max(0, parseInt(timeTakenMs || "0"));
        let isSuspiciousSpeed = false;
        if (timeMs > 0 && timeMs < 450) {
          isSuspiciousSpeed = true;
          console.warn(`[AntiCheat] Suspicious answer speed: user #${userId} answered in ${timeMs}ms`);
        }
        const [question] = await db.select().from(leagueQuestions).where((0, import_drizzle_orm42.eq)(leagueQuestions.id, questionId)).limit(1);
        const [correctOption] = await db.select().from(leagueQuestionOptions).where(
          (0, import_drizzle_orm42.and)(
            (0, import_drizzle_orm42.eq)(leagueQuestionOptions.questionId, questionId),
            (0, import_drizzle_orm42.eq)(leagueQuestionOptions.isCorrect, true)
          )
        ).limit(1);
        const isCorrect = correctOption?.optionKey === selectedOption;
        let pointsEarned = 0;
        if (isCorrect) {
          pointsEarned = 100;
          if (question.difficulty === "HARD") pointsEarned += 50;
          else if (question.difficulty === "EXPERT") pointsEarned += 100;
          else if (question.difficulty === "MEDIUM") pointsEarned += 25;
          if (timeMs > 0 && timeMs < 1e4 && !isSuspiciousSpeed) {
            const speedBonus = Math.round((1e4 - timeMs) / 1e4 * 25);
            pointsEarned += speedBonus;
          }
        }
        await db.insert(leagueMatchAnswers).values({
          matchId,
          userId,
          questionId,
          selectedOption,
          isCorrect,
          pointsEarned,
          timeTakenMs: timeMs
        });
        const newPlayer1Score = match.player1Score + pointsEarned;
        let botScoreGain = 0;
        if (match.isVsBot) {
          const botWillGetCorrect = Math.random() < 0.75;
          if (botWillGetCorrect) {
            botScoreGain = 100 + (Math.random() < 0.5 ? 20 : 0);
          }
        }
        const newPlayer2Score = match.player2Score + botScoreGain;
        const matchQuestions = await db.select().from(leagueMatchQuestions).where((0, import_drizzle_orm42.eq)(leagueMatchQuestions.matchId, matchId)).orderBy(leagueMatchQuestions.order);
        const nextIndex = match.currentQuestionIndex + 1;
        const isMatchCompleted = nextIndex >= matchQuestions.length;
        let matchCompletedAt = match.completedAt;
        let winnerId = match.winnerId;
        if (isMatchCompleted) {
          matchCompletedAt = /* @__PURE__ */ new Date();
          if (newPlayer1Score > newPlayer2Score) {
            winnerId = userId;
          } else if (newPlayer2Score > newPlayer1Score && !match.isVsBot) {
            winnerId = match.player2Id;
          }
          const userAnswers = await db.select().from(leagueMatchAnswers).where(
            (0, import_drizzle_orm42.and)(
              (0, import_drizzle_orm42.eq)(leagueMatchAnswers.matchId, matchId),
              (0, import_drizzle_orm42.eq)(leagueMatchAnswers.userId, userId)
            )
          );
          const totalCorrect = userAnswers.filter((a) => a.isCorrect).length;
          const isWon = newPlayer1Score > newPlayer2Score;
          await db.update(leagueParticipants).set({
            totalPoints: import_drizzle_orm42.sql`${leagueParticipants.totalPoints} + ${newPlayer1Score}`,
            matchesPlayed: import_drizzle_orm42.sql`${leagueParticipants.matchesPlayed} + 1`,
            matchesWon: isWon ? import_drizzle_orm42.sql`${leagueParticipants.matchesWon} + 1` : import_drizzle_orm42.sql`${leagueParticipants.matchesWon}`,
            correctAnswersCount: import_drizzle_orm42.sql`${leagueParticipants.correctAnswersCount} + ${totalCorrect}`,
            totalAnswersCount: import_drizzle_orm42.sql`${leagueParticipants.totalAnswersCount} + ${matchQuestions.length}`,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(
            (0, import_drizzle_orm42.and)(
              (0, import_drizzle_orm42.eq)(leagueParticipants.seasonId, match.seasonId),
              (0, import_drizzle_orm42.eq)(leagueParticipants.userId, userId)
            )
          );
          if (totalCorrect === matchQuestions.length) {
            const [badge] = await db.select().from(badges).where((0, import_drizzle_orm42.eq)(badges.key, "LEAGUE_KNOWLEDGE_MASTER")).limit(1);
            if (badge) {
              await db.insert(userBadges).values({
                userId,
                badgeId: badge.id,
                metadata: { matchId, fullScore: true, awardedAt: (/* @__PURE__ */ new Date()).toISOString() }
              }).onConflictDoNothing();
            }
          }
          const hasFastAnswer = userAnswers.some((a) => a.isCorrect && a.timeTakenMs > 500 && a.timeTakenMs < 5e3);
          if (hasFastAnswer) {
            const [badge] = await db.select().from(badges).where((0, import_drizzle_orm42.eq)(badges.key, "LEAGUE_SPEED_DEMON")).limit(1);
            if (badge) {
              await db.insert(userBadges).values({
                userId,
                badgeId: badge.id,
                metadata: { matchId, fastAnswer: true, awardedAt: (/* @__PURE__ */ new Date()).toISOString() }
              }).onConflictDoNothing();
            }
          }
        }
        await db.update(leagueMatches).set({
          player1Score: newPlayer1Score,
          player2Score: newPlayer2Score,
          currentQuestionIndex: nextIndex,
          questionStartedAt: /* @__PURE__ */ new Date(),
          status: isMatchCompleted ? "COMPLETED" : "ACTIVE",
          winnerId,
          completedAt: matchCompletedAt
        }).where((0, import_drizzle_orm42.eq)(leagueMatches.id, matchId));
        res.json({
          success: true,
          answerResult: {
            isCorrect,
            correctOptionKey: correctOption?.optionKey,
            explanation: question.explanation,
            pointsEarned
          },
          matchState: {
            player1Score: newPlayer1Score,
            player2Score: newPlayer2Score,
            currentQuestionIndex: nextIndex,
            isCompleted: isMatchCompleted,
            winnerId
          }
        });
      } catch (err) {
        console.error("Error submitting match answer:", err);
        res.status(500).json({ success: false, error: { message: "Cevap i\u015Flenirken bir hata olu\u015Ftu." } });
      }
    });
    leagueRouter.post("/match/:id/flag-cheat", requireAuth, async (req, res) => {
      try {
        const userId = getReqUserId(req);
        const { reason } = req.body;
        console.warn(`[AntiCheat Warning] User #${userId} reported for: ${reason}`);
        res.json({ success: true, message: "Uyar\u0131 kaydedildi." });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "\u0130\u015Flem ba\u015Far\u0131s\u0131z." } });
      }
    });
    leagueRouter.get("/admin/questions", requireAuth, requireAdmin, async (req, res) => {
      try {
        const page = Math.max(1, parseInt(req.query.page || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20")));
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const difficulty = req.query.difficulty;
        const status = req.query.status;
        const q = req.query.q;
        const conditions = [];
        if (category && category !== "ALL") conditions.push((0, import_drizzle_orm42.eq)(leagueQuestions.category, category));
        if (difficulty && difficulty !== "ALL") conditions.push((0, import_drizzle_orm42.eq)(leagueQuestions.difficulty, difficulty));
        if (status && status !== "ALL") conditions.push((0, import_drizzle_orm42.eq)(leagueQuestions.status, status));
        if (q) conditions.push((0, import_drizzle_orm42.ilike)(leagueQuestions.question, `%${q.trim()}%`));
        const questionsList = await db.select().from(leagueQuestions).where(conditions.length > 0 ? (0, import_drizzle_orm42.and)(...conditions) : void 0).orderBy((0, import_drizzle_orm42.desc)(leagueQuestions.createdAt)).limit(limit).offset(offset);
        const questionsWithOptions = [];
        for (const item of questionsList) {
          const options = await db.select().from(leagueQuestionOptions).where((0, import_drizzle_orm42.eq)(leagueQuestionOptions.questionId, item.id)).orderBy(leagueQuestionOptions.optionKey);
          questionsWithOptions.push({
            ...item,
            options
          });
        }
        const [countResult] = await db.select({ count: import_drizzle_orm42.sql`count(*)` }).from(leagueQuestions).where(conditions.length > 0 ? (0, import_drizzle_orm42.and)(...conditions) : void 0);
        res.json({
          success: true,
          questions: questionsWithOptions,
          pagination: {
            page,
            limit,
            total: Number(countResult?.count || 0),
            totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
          }
        });
      } catch (err) {
        console.error("Error fetching admin questions:", err);
        res.status(500).json({ success: false, error: { message: "Sorular y\xFCklenirken hata olu\u015Ftu." } });
      }
    });
    leagueRouter.post("/admin/questions", requireAuth, requireAdmin, async (req, res) => {
      try {
        const { question, category, difficulty, ageGroup, explanation, options, status } = req.body;
        if (!question || !category || !Array.isArray(options) || options.length !== 4) {
          return res.status(400).json({
            success: false,
            error: { message: "Soru metni, kategori ve tam 4 se\xE7enek zorunludur." }
          });
        }
        const correctCount = options.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          return res.status(400).json({
            success: false,
            error: { message: "Se\xE7eneklerden tam olarak biri do\u011Fru (isCorrect: true) olmal\u0131d\u0131r." }
          });
        }
        const [newQuestion] = await db.insert(leagueQuestions).values({
          question: question.trim(),
          category: category.trim(),
          difficulty: difficulty || "MEDIUM",
          ageGroup: ageGroup || "ALL",
          language: "tr",
          explanation: explanation ? explanation.trim() : null,
          sourceType: "MANUAL",
          sourceReference: "Admin Panel",
          status: status || "ACTIVE"
        }).returning();
        for (const opt of options) {
          await db.insert(leagueQuestionOptions).values({
            questionId: newQuestion.id,
            optionKey: opt.key,
            optionText: opt.text.trim(),
            isCorrect: Boolean(opt.isCorrect)
          });
        }
        res.json({
          success: true,
          question: newQuestion,
          message: "Soru ba\u015Far\u0131yla eklendi."
        });
      } catch (err) {
        console.error("Error creating question:", err);
        res.status(500).json({ success: false, error: { message: "Soru eklenemedi." } });
      }
    });
    leagueRouter.put("/admin/questions/:id", requireAuth, requireAdmin, async (req, res) => {
      try {
        const rawId = req.params.id;
        const questionId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId);
        const { question, category, difficulty, ageGroup, explanation, options, status } = req.body;
        const [existing] = await db.select().from(leagueQuestions).where((0, import_drizzle_orm42.eq)(leagueQuestions.id, questionId)).limit(1);
        if (!existing) {
          return res.status(404).json({ success: false, error: { message: "Soru bulunamad\u0131." } });
        }
        await db.update(leagueQuestions).set({
          question: question !== void 0 ? question.trim() : existing.question,
          category: category !== void 0 ? category.trim() : existing.category,
          difficulty: difficulty !== void 0 ? difficulty : existing.difficulty,
          ageGroup: ageGroup !== void 0 ? ageGroup : existing.ageGroup,
          explanation: explanation !== void 0 ? explanation?.trim() : existing.explanation,
          status: status !== void 0 ? status : existing.status,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm42.eq)(leagueQuestions.id, questionId));
        if (Array.isArray(options) && options.length === 4) {
          await db.delete(leagueQuestionOptions).where((0, import_drizzle_orm42.eq)(leagueQuestionOptions.questionId, questionId));
          for (const opt of options) {
            await db.insert(leagueQuestionOptions).values({
              questionId,
              optionKey: opt.key,
              optionText: opt.text.trim(),
              isCorrect: Boolean(opt.isCorrect)
            });
          }
        }
        res.json({ success: true, message: "Soru g\xFCncellendi." });
      } catch (err) {
        console.error("Error updating question:", err);
        res.status(500).json({ success: false, error: { message: "Soru g\xFCncellenemedi." } });
      }
    });
    leagueRouter.delete("/admin/questions/:id", requireAuth, requireAdmin, async (req, res) => {
      try {
        const rawId = req.params.id;
        const questionId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId);
        await db.delete(leagueQuestions).where((0, import_drizzle_orm42.eq)(leagueQuestions.id, questionId));
        res.json({ success: true, message: "Soru silindi." });
      } catch (err) {
        console.error("Error deleting question:", err);
        res.status(500).json({ success: false, error: { message: "Soru silinemedi." } });
      }
    });
    leagueRouter.post("/admin/questions/generate-ai", requireAuth, requireAdmin, async (req, res) => {
      try {
        const { category, difficulty, ageGroup, count } = req.body;
        const result = await generateDraftQuestionsWithAI({
          category: category || "Tarih ve K\xFClt\xFCr",
          difficulty: difficulty || "MEDIUM",
          ageGroup: ageGroup || "ALL",
          count: Math.min(10, Math.max(1, parseInt(count || "5")))
        });
        if (result.error) {
          return res.status(400).json({ success: false, error: { message: result.error } });
        }
        res.json({
          success: true,
          createdCount: result.createdCount,
          questions: result.questions,
          message: `${result.createdCount} adet soru taslak (DRAFT) olarak havuza eklendi ve incelemeye haz\u0131r.`
        });
      } catch (err) {
        console.error("Error generating AI questions:", err);
        res.status(500).json({ success: false, error: { message: "Yapay zeka ile soru \xFCretilemedi." } });
      }
    });
    leagueRouter.post("/admin/season/update", requireAuth, requireAdmin, async (req, res) => {
      try {
        const { seasonId, status, simulationMode, settings, title, theme, description } = req.body;
        const targetId = seasonId ? parseInt(seasonId) : (await ensureCurrentSeason()).id;
        const [season] = await db.select().from(leagueSeasons).where((0, import_drizzle_orm42.eq)(leagueSeasons.id, targetId)).limit(1);
        if (!season) {
          return res.status(404).json({ success: false, error: { message: "Sezon bulunamad\u0131." } });
        }
        const updatedSettings = {
          ...season.settings,
          ...settings || {},
          ...simulationMode !== void 0 ? { simulationMode: Boolean(simulationMode) } : {}
        };
        await db.update(leagueSeasons).set({
          title: title || season.title,
          theme: theme || season.theme,
          description: description || season.description,
          status: status || season.status,
          settings: updatedSettings,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm42.eq)(leagueSeasons.id, targetId));
        res.json({ success: true, message: "Sezon ayarlar\u0131 g\xFCncellendi." });
      } catch (err) {
        console.error("Error updating season:", err);
        res.status(500).json({ success: false, error: { message: "Sezon g\xFCncellenemedi." } });
      }
    });
    leagueRouter.post("/admin/season/finalize", requireAuth, requireAdmin, async (req, res) => {
      try {
        const { seasonId } = req.body;
        const targetId = seasonId ? parseInt(seasonId) : (await ensureCurrentSeason()).id;
        await finalizeSeason(targetId);
        await db.update(leagueSeasons).set({ status: "COMPLETED", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm42.eq)(leagueSeasons.id, targetId));
        res.json({ success: true, message: "Sezon ba\u015Far\u0131yla tamamland\u0131 ve rozetler da\u011F\u0131t\u0131ld\u0131." });
      } catch (err) {
        console.error("Error finalizing season:", err);
        res.status(500).json({ success: false, error: { message: "Sezon sonland\u0131r\u0131lamad\u0131." } });
      }
    });
    leagueRouter.get("/badges", optionalAuth, async (req, res) => {
      try {
        await ensureLeagueBadges();
        const leagueBadgeKeys = [
          "LEAGUE_CHAMPION",
          "LEAGUE_FINALIST",
          "LEAGUE_SPEED_DEMON",
          "LEAGUE_KNOWLEDGE_MASTER"
        ];
        const badgesList = await db.select().from(badges).where((0, import_drizzle_orm42.inArray)(badges.key, leagueBadgeKeys));
        let userEarnedBadgeIds = [];
        const currentUserId = getReqUserId(req);
        if (currentUserId) {
          const earned = await db.select({ badgeId: userBadges.badgeId }).from(userBadges).where((0, import_drizzle_orm42.eq)(userBadges.userId, currentUserId));
          userEarnedBadgeIds = earned.map((e) => e.badgeId);
        }
        const result = badgesList.map((b) => ({
          ...b,
          isEarned: userEarnedBadgeIds.includes(b.id)
        }));
        res.json({ success: true, badges: result });
      } catch (err) {
        console.error("Error fetching league badges:", err);
        res.status(500).json({ success: false, error: { message: "Rozetler y\xFCklenemedi." } });
      }
    });
  }
});

// server/services/quizEngine.ts
function checkCodeRateLimit(ipOrUserId) {
  const now = Date.now();
  const entry = roomCodeAttempts.get(ipOrUserId);
  if (!entry || now > entry.resetAt) {
    roomCodeAttempts.set(ipOrUserId, { count: 1, resetAt: now + 6e4 });
    return true;
  }
  if (entry.count >= 20) {
    return false;
  }
  entry.count++;
  return true;
}
async function generateUniqueRoomCode() {
  for (let attempt = 0; attempt < 15; attempt++) {
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    if (!activeRoomsByCode.has(code)) {
      const [existing] = await db.select({ id: quizRooms.id }).from(quizRooms).where((0, import_drizzle_orm43.and)((0, import_drizzle_orm43.eq)(quizRooms.code, code), (0, import_drizzle_orm43.inArray)(quizRooms.status, ["LOBBY", "PLAYING", "QUESTION_ACTIVE", "QUESTION_RESULT"]))).limit(1);
      if (!existing) {
        return code;
      }
    }
  }
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
async function prepareRoomQuestions({
  count = 10,
  category = "Kar\u0131\u015F\u0131k",
  difficulty = "Kar\u0131\u015F\u0131k",
  sourceType = "SYSTEM",
  questionSetId
}) {
  const questions = [];
  if (sourceType === "QUESTION_SET" && questionSetId) {
    const setItems = await db.select().from(quizQuestionSetItems).where((0, import_drizzle_orm43.eq)(quizQuestionSetItems.setId, questionSetId)).orderBy(quizQuestionSetItems.order).limit(count);
    let idx = 1;
    for (const item of setItems) {
      questions.push({
        id: item.id,
        questionText: item.question,
        category: category || "\xD6zel Soru Seti",
        difficulty: difficulty || "Orta",
        explanation: item.explanation,
        order: idx++,
        options: item.options || []
      });
    }
    if (questions.length >= count) {
      return questions;
    }
  }
  const conditions = [(0, import_drizzle_orm43.eq)(leagueQuestions.status, "ACTIVE")];
  if (category && category !== "Kar\u0131\u015F\u0131k" && category !== "ALL") {
    conditions.push((0, import_drizzle_orm43.eq)(leagueQuestions.category, category));
  }
  if (difficulty && difficulty !== "Kar\u0131\u015F\u0131k" && difficulty !== "ALL") {
    conditions.push((0, import_drizzle_orm43.eq)(leagueQuestions.difficulty, difficulty));
  }
  let dbQuestions = await db.select().from(leagueQuestions).where((0, import_drizzle_orm43.and)(...conditions)).orderBy(import_drizzle_orm43.sql`RANDOM()`).limit(count);
  if (dbQuestions.length < count) {
    const needed = count - dbQuestions.length;
    const existingIds = dbQuestions.map((q) => q.id);
    const fallbackConditions = [(0, import_drizzle_orm43.eq)(leagueQuestions.status, "ACTIVE")];
    if (existingIds.length > 0) {
      fallbackConditions.push((0, import_drizzle_orm43.notInArray)(leagueQuestions.id, existingIds));
    }
    const extraQuestions = await db.select().from(leagueQuestions).where((0, import_drizzle_orm43.and)(...fallbackConditions)).orderBy(import_drizzle_orm43.sql`RANDOM()`).limit(needed);
    dbQuestions = [...dbQuestions, ...extraQuestions];
  }
  let orderCounter = questions.length + 1;
  for (const q of dbQuestions) {
    const options = await db.select({
      optionKey: leagueQuestionOptions.optionKey,
      optionText: leagueQuestionOptions.optionText,
      isCorrect: leagueQuestionOptions.isCorrect
    }).from(leagueQuestionOptions).where((0, import_drizzle_orm43.eq)(leagueQuestionOptions.questionId, q.id)).orderBy(leagueQuestionOptions.optionKey);
    questions.push({
      id: q.id,
      questionText: q.question,
      category: q.category,
      difficulty: q.difficulty,
      explanation: q.explanation,
      order: orderCounter++,
      options: options.map((o) => ({
        key: o.optionKey,
        text: o.optionText,
        isCorrect: Boolean(o.isCorrect)
      }))
    });
  }
  return questions.slice(0, count);
}
function broadcastToRoom(room, event, payload) {
  const message = JSON.stringify({ event, data: payload, timestamp: Date.now() });
  for (const player of room.players.values()) {
    if (player.ws && player.ws.readyState === import_ws.WebSocket.OPEN) {
      try {
        player.ws.send(message);
      } catch (err) {
        console.error(`Error sending message to user #${player.userId}:`, err);
      }
    }
  }
}
function sanitizeQuestionForClients(q, currentIndex, totalCount, duration) {
  return {
    order: q.order,
    currentIndex,
    totalCount,
    duration,
    category: q.category,
    difficulty: q.difficulty,
    questionText: q.questionText,
    options: q.options.map((opt) => ({
      key: opt.key,
      text: opt.text
    }))
  };
}
function updateRoomLeaderboard(room) {
  const playersList = Array.from(room.players.values());
  playersList.sort((a, b) => b.score - a.score || b.correctAnswersCount - a.correctAnswersCount);
  playersList.forEach((p, idx) => {
    p.rank = idx + 1;
  });
  return playersList.map((p) => ({
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    score: p.score,
    correctAnswersCount: p.correctAnswersCount,
    wrongAnswersCount: p.wrongAnswersCount,
    streak: p.streak,
    rank: p.rank,
    isHost: p.isHost,
    isConnected: p.isConnected,
    hasAnsweredCurrent: p.hasAnsweredCurrent
  }));
}
async function advanceRoomQuestion(room) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }
  if (room.currentQuestionIndex + 1 < room.questions.length) {
    room.currentQuestionIndex++;
    room.status = "QUESTION_ACTIVE";
    room.questionStartedAt = Date.now();
    room.lastActiveAt = Date.now();
    for (const p of room.players.values()) {
      p.hasAnsweredCurrent = false;
    }
    const currentQ = room.questions[room.currentQuestionIndex];
    await db.update(quizRooms).set({
      currentQuestionIndex: room.currentQuestionIndex,
      questionStartedAt: new Date(room.questionStartedAt),
      status: "QUESTION_ACTIVE",
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm43.eq)(quizRooms.id, room.id));
    broadcastToRoom(room, "QUESTION_STARTED", {
      question: sanitizeQuestionForClients(currentQ, room.currentQuestionIndex, room.questions.length, room.timePerQuestion),
      currentQuestionIndex: room.currentQuestionIndex,
      totalQuestions: room.questions.length,
      duration: room.timePerQuestion,
      leaderboard: updateRoomLeaderboard(room)
    });
    room.questionTimer = setTimeout(() => {
      endRoomQuestion(room).catch(console.error);
    }, room.timePerQuestion * 1e3 + 1e3);
  } else {
    await finishQuizRoom(room);
  }
}
async function endRoomQuestion(room) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }
  room.status = "QUESTION_RESULT";
  room.lastActiveAt = Date.now();
  const currentQ = room.questions[room.currentQuestionIndex];
  const correctOption = currentQ.options.find((o) => o.isCorrect);
  for (const player of room.players.values()) {
    if (!player.hasAnsweredCurrent) {
      player.unansweredCount++;
      player.streak = 0;
    }
  }
  await db.update(quizRooms).set({
    status: "QUESTION_RESULT",
    updatedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm43.eq)(quizRooms.id, room.id));
  const leaderboard = updateRoomLeaderboard(room);
  broadcastToRoom(room, "QUESTION_ENDED", {
    currentQuestionIndex: room.currentQuestionIndex,
    correctOptionKey: correctOption?.key || "A",
    correctOptionText: correctOption?.text || "",
    explanation: currentQ.explanation,
    leaderboard
  });
  room.questionTimer = setTimeout(() => {
    advanceRoomQuestion(room).catch(console.error);
  }, 5e3);
}
async function submitPlayerAnswer(room, userId, selectedOption, timeTakenMs) {
  if (room.status !== "QUESTION_ACTIVE") {
    return { success: false, pointsEarned: 0, isCorrect: false, message: "Soru aktif de\u011Fil." };
  }
  const player = room.players.get(userId);
  if (!player) {
    return { success: false, pointsEarned: 0, isCorrect: false, message: "Oyuncu odada de\u011Fil." };
  }
  if (player.hasAnsweredCurrent) {
    return { success: false, pointsEarned: 0, isCorrect: false, message: "Bu soru i\xE7in zaten cevap verdiniz." };
  }
  const currentQ = room.questions[room.currentQuestionIndex];
  const correctOption = currentQ.options.find((o) => o.isCorrect);
  const isCorrect = correctOption?.key === selectedOption;
  let pointsEarned = 0;
  if (isCorrect) {
    const basePoints = 100;
    const totalTimeMs = room.timePerQuestion * 1e3;
    const remainingMs = Math.max(0, totalTimeMs - timeTakenMs);
    const speedBonus = Math.round(remainingMs / totalTimeMs * 50);
    const streakBonus = Math.min(50, player.streak * 10);
    pointsEarned = basePoints + speedBonus + streakBonus;
    player.score += pointsEarned;
    player.correctAnswersCount++;
    player.streak++;
    if (player.streak > player.maxStreak) {
      player.maxStreak = player.streak;
    }
  } else {
    player.wrongAnswersCount++;
    player.streak = 0;
  }
  player.hasAnsweredCurrent = true;
  player.lastActiveAt = Date.now();
  await db.insert(quizAnswers).values({
    roomId: room.id,
    userId,
    roomQuestionId: currentQ.id,
    selectedOption,
    isCorrect,
    pointsEarned,
    timeTakenMs: Math.max(0, timeTakenMs)
  }).onConflictDoNothing();
  await db.update(quizRoomPlayers).set({
    score: player.score,
    correctAnswersCount: player.correctAnswersCount,
    wrongAnswersCount: player.wrongAnswersCount,
    unansweredCount: player.unansweredCount,
    streak: player.streak,
    maxStreak: player.maxStreak,
    lastActiveAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm43.and)((0, import_drizzle_orm43.eq)(quizRoomPlayers.roomId, room.id), (0, import_drizzle_orm43.eq)(quizRoomPlayers.userId, userId)));
  if (player.ws && player.ws.readyState === import_ws.WebSocket.OPEN) {
    player.ws.send(JSON.stringify({
      event: "ANSWER_ACK",
      data: {
        pointsEarned,
        isCorrect,
        streak: player.streak
      },
      timestamp: Date.now()
    }));
  }
  const updatedLeaderboard = updateRoomLeaderboard(room);
  broadcastToRoom(room, "LEADERBOARD_UPDATED", { leaderboard: updatedLeaderboard });
  const allAnswered = Array.from(room.players.values()).every((p) => p.hasAnsweredCurrent || !p.isConnected);
  if (allAnswered && room.players.size > 0) {
    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = null;
    }
    setTimeout(() => {
      endRoomQuestion(room).catch(console.error);
    }, 600);
  }
  return { success: true, pointsEarned, isCorrect };
}
async function finishQuizRoom(room) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }
  room.status = "FINISHED";
  room.lastActiveAt = Date.now();
  const finalLeaderboard = updateRoomLeaderboard(room);
  await db.update(quizRooms).set({
    status: "FINISHED",
    finishedAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm43.eq)(quizRooms.id, room.id));
  for (const p of room.players.values()) {
    await db.insert(quizResults).values({
      roomId: room.id,
      roomTitle: room.title,
      category: room.category,
      userId: p.userId,
      rank: p.rank,
      totalPlayers: room.players.size,
      score: p.score,
      correctCount: p.correctAnswersCount,
      wrongCount: p.wrongAnswersCount,
      unansweredCount: p.unansweredCount,
      totalQuestions: room.questions.length,
      playedAt: /* @__PURE__ */ new Date()
    });
    await db.update(quizRoomPlayers).set({ rank: p.rank }).where((0, import_drizzle_orm43.and)((0, import_drizzle_orm43.eq)(quizRoomPlayers.roomId, room.id), (0, import_drizzle_orm43.eq)(quizRoomPlayers.userId, p.userId)));
  }
  const podium = finalLeaderboard.slice(0, 3);
  broadcastToRoom(room, "QUIZ_FINISHED", {
    podium,
    leaderboard: finalLeaderboard,
    totalQuestions: room.questions.length
  });
  console.log(`\u{1F3C1} Quiz #${room.id} (${room.code}) tamamland\u0131. Kazanan: ${podium[0]?.username || "N/A"}`);
}
function cleanupInactiveRooms() {
  const now = Date.now();
  for (const [code, room] of activeRoomsByCode.entries()) {
    const isLobbyTimeout = room.status === "LOBBY" && now - room.lastActiveAt > 60 * 60 * 1e3;
    const isFinishedTimeout = room.status === "FINISHED" && now - room.lastActiveAt > 30 * 60 * 1e3;
    const isAbandoned = now - room.lastActiveAt > 2 * 60 * 60 * 1e3;
    if (isLobbyTimeout || isFinishedTimeout || isAbandoned) {
      if (room.questionTimer) clearTimeout(room.questionTimer);
      activeRoomsByCode.delete(code);
      activeRoomsById.delete(room.id);
      db.update(quizRooms).set({ status: "CANCELLED", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm43.eq)(quizRooms.id, room.id)).catch(console.error);
    }
  }
}
async function getOrRehydrateRoom(code) {
  const cleanCode = code.trim().toUpperCase();
  let room = activeRoomsByCode.get(cleanCode);
  if (room) return room;
  const [dbRoom] = await db.select().from(quizRooms).where((0, import_drizzle_orm43.eq)(quizRooms.code, cleanCode)).limit(1);
  if (!dbRoom || dbRoom.status === "CANCELLED" || dbRoom.status === "FINISHED") {
    return null;
  }
  const dbQuestions = await db.select().from(quizRoomQuestions).where((0, import_drizzle_orm43.eq)(quizRoomQuestions.roomId, dbRoom.id)).orderBy(quizRoomQuestions.order);
  const dbPlayers = await db.select({
    userId: quizRoomPlayers.userId,
    score: quizRoomPlayers.score,
    isHost: quizRoomPlayers.isHost,
    username: users.username,
    avatarUrl: profiles.avatarUrl
  }).from(quizRoomPlayers).innerJoin(users, (0, import_drizzle_orm43.eq)(quizRoomPlayers.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm43.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm43.eq)(quizRoomPlayers.roomId, dbRoom.id));
  const rehydratedRoom = {
    id: dbRoom.id,
    code: dbRoom.code,
    title: dbRoom.title,
    hostId: dbRoom.hostId,
    category: dbRoom.category,
    difficulty: dbRoom.difficulty,
    questionCount: dbRoom.questionCount,
    timePerQuestion: dbRoom.timePerQuestion,
    roomType: dbRoom.roomType,
    maxPlayers: dbRoom.maxPlayers,
    status: dbRoom.status || "LOBBY",
    currentQuestionIndex: dbRoom.currentQuestionIndex || 0,
    questionStartedAt: dbRoom.questionStartedAt ? dbRoom.questionStartedAt.getTime() : null,
    players: /* @__PURE__ */ new Map(),
    questions: dbQuestions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      category: q.category,
      difficulty: q.difficulty,
      explanation: q.explanation,
      order: q.order,
      options: q.options || []
    })),
    createdAt: dbRoom.createdAt ? dbRoom.createdAt.getTime() : Date.now(),
    lastActiveAt: Date.now()
  };
  for (const p of dbPlayers) {
    rehydratedRoom.players.set(p.userId, {
      userId: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
      score: p.score,
      correctAnswersCount: 0,
      wrongAnswersCount: 0,
      unansweredCount: 0,
      streak: 0,
      maxStreak: 0,
      rank: 1,
      isHost: p.isHost,
      isConnected: false,
      hasAnsweredCurrent: false
    });
  }
  activeRoomsByCode.set(cleanCode, rehydratedRoom);
  activeRoomsById.set(dbRoom.id, rehydratedRoom);
  return rehydratedRoom;
}
var import_ws, import_drizzle_orm43, activeRoomsByCode, activeRoomsById, roomCodeAttempts;
var init_quizEngine = __esm({
  "server/services/quizEngine.ts"() {
    "use strict";
    import_ws = require("ws");
    init_db();
    init_schema();
    import_drizzle_orm43 = require("drizzle-orm");
    activeRoomsByCode = /* @__PURE__ */ new Map();
    activeRoomsById = /* @__PURE__ */ new Map();
    roomCodeAttempts = /* @__PURE__ */ new Map();
    setInterval(cleanupInactiveRooms, 15 * 60 * 1e3);
  }
});

// server/routes/quiz.ts
var quiz_exports = {};
__export(quiz_exports, {
  quizRouter: () => quizRouter
});
var import_express33, import_drizzle_orm44, quizRouter;
var init_quiz = __esm({
  "server/routes/quiz.ts"() {
    "use strict";
    import_express33 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm44 = require("drizzle-orm");
    init_auth();
    init_quizEngine();
    quizRouter = (0, import_express33.Router)();
    quizRouter.post("/rooms", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const {
          title,
          category = "Kar\u0131\u015F\u0131k",
          difficulty = "Kar\u0131\u015F\u0131k",
          questionCount = 10,
          timePerQuestion = 20,
          roomType = "PUBLIC",
          sourceType = "SYSTEM",
          questionSetId,
          maxPlayers = 30
        } = req.body;
        if (!title || !title.trim()) {
          return res.status(400).json({ success: false, error: { message: "Quiz oda ba\u015Fl\u0131\u011F\u0131 zorunludur." } });
        }
        const qCount = Math.min(25, Math.max(5, parseInt(questionCount) || 10));
        const tPerQ = Math.min(60, Math.max(10, parseInt(timePerQuestion) || 20));
        const mPlayers = Math.min(100, Math.max(2, parseInt(maxPlayers) || 30));
        const code = await generateUniqueRoomCode();
        const selectedQuestions = await prepareRoomQuestions({
          count: qCount,
          category,
          difficulty,
          sourceType,
          questionSetId: questionSetId ? parseInt(questionSetId) : null
        });
        if (selectedQuestions.length === 0) {
          return res.status(400).json({
            success: false,
            error: { message: "Se\xE7ilen kategori veya zorlukta yeterli soru bulunamad\u0131. L\xFCtfen 'Kar\u0131\u015F\u0131k' se\xE7ene\u011Fini deneyiniz." }
          });
        }
        const [newRoom] = await db.insert(quizRooms).values({
          code,
          title: title.trim(),
          hostId: userId,
          category,
          difficulty,
          questionCount: selectedQuestions.length,
          timePerQuestion: tPerQ,
          roomType,
          sourceType,
          questionSetId: questionSetId ? parseInt(questionSetId) : null,
          maxPlayers: mPlayers,
          status: "LOBBY",
          currentQuestionIndex: 0
        }).returning();
        for (const q of selectedQuestions) {
          const [insertedQ] = await db.insert(quizRoomQuestions).values({
            roomId: newRoom.id,
            questionId: q.id,
            questionText: q.questionText,
            category: q.category,
            difficulty: q.difficulty,
            explanation: q.explanation,
            options: q.options,
            order: q.order
          }).returning();
          q.id = insertedQ.id;
        }
        await db.insert(quizRoomPlayers).values({
          roomId: newRoom.id,
          userId,
          isHost: true,
          isConnected: true
        });
        const [hostProfile] = await db.select({ avatarUrl: profiles.avatarUrl, username: users.username }).from(users).leftJoin(profiles, (0, import_drizzle_orm44.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm44.eq)(users.id, userId)).limit(1);
        const activeRoomObj = {
          id: newRoom.id,
          code,
          title: newRoom.title,
          hostId: userId,
          category: newRoom.category,
          difficulty: newRoom.difficulty,
          questionCount: selectedQuestions.length,
          timePerQuestion: tPerQ,
          roomType: newRoom.roomType,
          maxPlayers: mPlayers,
          status: "LOBBY",
          currentQuestionIndex: 0,
          questionStartedAt: null,
          players: /* @__PURE__ */ new Map(),
          questions: selectedQuestions,
          createdAt: Date.now(),
          lastActiveAt: Date.now()
        };
        activeRoomObj.players.set(userId, {
          userId,
          username: hostProfile?.username || "Host",
          avatarUrl: hostProfile?.avatarUrl || null,
          score: 0,
          correctAnswersCount: 0,
          wrongAnswersCount: 0,
          unansweredCount: 0,
          streak: 0,
          maxStreak: 0,
          rank: 1,
          isHost: true,
          isConnected: true,
          hasAnsweredCurrent: false
        });
        activeRoomsByCode.set(code, activeRoomObj);
        activeRoomsById.set(newRoom.id, activeRoomObj);
        res.json({
          success: true,
          room: newRoom,
          code,
          message: "Quiz odas\u0131 olu\u015Fturuldu! Arkada\u015Flar\u0131n\u0131 kod ile davet edebilirsin."
        });
      } catch (err) {
        console.error("Error creating quiz room:", err);
        res.status(500).json({ success: false, error: { message: "Quiz odas\u0131 olu\u015Fturulamad\u0131." } });
      }
    });
    quizRouter.get("/rooms/public", async (req, res) => {
      try {
        const roomsList = [];
        for (const room of activeRoomsByCode.values()) {
          if (room.roomType === "PUBLIC" && room.status === "LOBBY") {
            roomsList.push({
              id: room.id,
              code: room.code,
              title: room.title,
              category: room.category,
              difficulty: room.difficulty,
              questionCount: room.questionCount,
              timePerQuestion: room.timePerQuestion,
              playerCount: room.players.size,
              maxPlayers: room.maxPlayers,
              createdAt: room.createdAt
            });
          }
        }
        res.json({ success: true, rooms: roomsList });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "A\xE7\u0131k odalar al\u0131namad\u0131." } });
      }
    });
    quizRouter.get("/rooms/:code", optionalAuth, async (req, res) => {
      try {
        const rawCode = req.params.code;
        const clientIdentifier = req.ip || (req.user?.userId ? `user_${req.user.userId}` : "unknown");
        if (!checkCodeRateLimit(clientIdentifier)) {
          return res.status(429).json({
            success: false,
            error: { message: "\xC7ok fazla kod denemesi yapt\u0131n\u0131z. L\xFCtfen 1 dakika sonra tekrar deneyiniz." }
          });
        }
        const code = (rawCode || "").toString().trim();
        let room = activeRoomsByCode.get(code);
        if (!room) {
          const [dbRoom] = await db.select().from(quizRooms).where((0, import_drizzle_orm44.eq)(quizRooms.code, code)).limit(1);
          if (!dbRoom || dbRoom.status === "CANCELLED" || dbRoom.status === "FINISHED") {
            return res.status(404).json({
              success: false,
              error: { message: "Bu kodla aktif bir quiz odas\u0131 bulunamad\u0131." }
            });
          }
          const dbQuestions = await db.select().from(quizRoomQuestions).where((0, import_drizzle_orm44.eq)(quizRoomQuestions.roomId, dbRoom.id)).orderBy(quizRoomQuestions.order);
          const dbPlayers = await db.select({
            userId: quizRoomPlayers.userId,
            score: quizRoomPlayers.score,
            isHost: quizRoomPlayers.isHost,
            username: users.username,
            avatarUrl: profiles.avatarUrl
          }).from(quizRoomPlayers).innerJoin(users, (0, import_drizzle_orm44.eq)(quizRoomPlayers.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm44.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm44.eq)(quizRoomPlayers.roomId, dbRoom.id));
          const rehydratedRoom = {
            id: dbRoom.id,
            code: dbRoom.code,
            title: dbRoom.title,
            hostId: dbRoom.hostId,
            category: dbRoom.category,
            difficulty: dbRoom.difficulty,
            questionCount: dbRoom.questionCount,
            timePerQuestion: dbRoom.timePerQuestion,
            roomType: dbRoom.roomType,
            maxPlayers: dbRoom.maxPlayers,
            status: dbRoom.status,
            currentQuestionIndex: dbRoom.currentQuestionIndex,
            questionStartedAt: dbRoom.questionStartedAt ? dbRoom.questionStartedAt.getTime() : null,
            players: /* @__PURE__ */ new Map(),
            questions: dbQuestions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              category: q.category,
              difficulty: q.difficulty,
              explanation: q.explanation,
              order: q.order,
              options: q.options || []
            })),
            createdAt: dbRoom.createdAt.getTime(),
            lastActiveAt: Date.now()
          };
          for (const p of dbPlayers) {
            rehydratedRoom.players.set(p.userId, {
              userId: p.userId,
              username: p.username,
              avatarUrl: p.avatarUrl,
              score: p.score,
              correctAnswersCount: 0,
              wrongAnswersCount: 0,
              unansweredCount: 0,
              streak: 0,
              maxStreak: 0,
              rank: 1,
              isHost: p.isHost,
              isConnected: false,
              hasAnsweredCurrent: false
            });
          }
          activeRoomsByCode.set(code, rehydratedRoom);
          activeRoomsById.set(dbRoom.id, rehydratedRoom);
          room = rehydratedRoom;
        }
        res.json({
          success: true,
          room: {
            id: room.id,
            code: room.code,
            title: room.title,
            hostId: room.hostId,
            category: room.category,
            difficulty: room.difficulty,
            questionCount: room.questionCount,
            timePerQuestion: room.timePerQuestion,
            playerCount: room.players.size,
            maxPlayers: room.maxPlayers,
            status: room.status
          }
        });
      } catch (err) {
        console.error("Error fetching room info:", err);
        res.status(500).json({ success: false, error: { message: "Oda bilgileri al\u0131namad\u0131." } });
      }
    });
    quizRouter.get("/history", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const historyList = await db.select().from(quizResults).where((0, import_drizzle_orm44.eq)(quizResults.userId, userId)).orderBy((0, import_drizzle_orm44.desc)(quizResults.playedAt)).limit(50);
        res.json({ success: true, history: historyList });
      } catch (err) {
        console.error("Error fetching quiz history:", err);
        res.status(500).json({ success: false, error: { message: "Ge\xE7mi\u015F quizler y\xFCklenemedi." } });
      }
    });
    quizRouter.get("/stats", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const userResults = await db.select().from(quizResults).where((0, import_drizzle_orm44.eq)(quizResults.userId, userId));
        const totalQuizes = userResults.length;
        const wins = userResults.filter((r) => r.rank === 1).length;
        const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
        const totalCorrect = userResults.reduce((sum, r) => sum + r.correctCount, 0);
        const totalQuestions = userResults.reduce((sum, r) => sum + r.totalQuestions, 0);
        const highestScore = userResults.reduce((max, r) => Math.max(max, r.score), 0);
        const accuracyRate = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
        res.json({
          success: true,
          stats: {
            totalQuizes,
            wins,
            totalScore,
            highestScore,
            accuracyRate
          }
        });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "\u0130statistikler al\u0131namad\u0131." } });
      }
    });
    quizRouter.get("/user/:username/stats", async (req, res) => {
      try {
        const username = req.params.username;
        const [targetUser] = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm44.eq)(users.username, username)).limit(1);
        if (!targetUser) {
          return res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
        }
        const userResults = await db.select().from(quizResults).where((0, import_drizzle_orm44.eq)(quizResults.userId, targetUser.id));
        const totalQuizes = userResults.length;
        const wins = userResults.filter((r) => r.rank === 1).length;
        const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
        const totalCorrect = userResults.reduce((sum, r) => sum + r.correctCount, 0);
        const totalQuestions = userResults.reduce((sum, r) => sum + r.totalQuestions, 0);
        const accuracyRate = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
        res.json({
          success: true,
          stats: {
            totalQuizes,
            wins,
            totalScore,
            accuracyRate
          }
        });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "Kullan\u0131c\u0131 istatistikleri al\u0131namad\u0131." } });
      }
    });
    quizRouter.get("/leaderboard", async (req, res) => {
      try {
        const topPlayers = await db.select({
          userId: quizResults.userId,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          totalScore: import_drizzle_orm44.sql`sum(${quizResults.score})`.as("total_score"),
          totalQuizes: import_drizzle_orm44.sql`count(${quizResults.id})`.as("total_quizes"),
          wins: import_drizzle_orm44.sql`sum(case when ${quizResults.rank} = 1 then 1 else 0 end)`.as("wins")
        }).from(quizResults).innerJoin(users, (0, import_drizzle_orm44.eq)(quizResults.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm44.eq)(users.id, profiles.userId)).groupBy(quizResults.userId, users.username, profiles.avatarUrl).orderBy((0, import_drizzle_orm44.desc)(import_drizzle_orm44.sql`sum(${quizResults.score})`), (0, import_drizzle_orm44.desc)(import_drizzle_orm44.sql`sum(case when ${quizResults.rank} = 1 then 1 else 0 end)`)).limit(50);
        const ranked = topPlayers.map((p, idx) => ({
          ...p,
          rank: idx + 1,
          totalScore: Number(p.totalScore || 0),
          totalQuizes: Number(p.totalQuizes || 0),
          wins: Number(p.wins || 0)
        }));
        res.json({ success: true, leaderboard: ranked });
      } catch (err) {
        console.error("Error fetching quiz leaderboard:", err);
        res.status(500).json({ success: false, error: { message: "Liderlik tablosu y\xFCklenemedi." } });
      }
    });
    quizRouter.get("/sets", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const sets = await db.select().from(quizQuestionSets).where((0, import_drizzle_orm44.eq)(quizQuestionSets.userId, userId)).orderBy((0, import_drizzle_orm44.desc)(quizQuestionSets.createdAt));
        res.json({ success: true, sets });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "Soru setleri y\xFCklenemedi." } });
      }
    });
    quizRouter.post("/sets", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const { title, description, category = "Genel K\xFClt\xFCr", difficulty = "Orta", isPublic = false, questions = [] } = req.body;
        if (!title || !title.trim()) {
          return res.status(400).json({ success: false, error: { message: "Set ba\u015Fl\u0131\u011F\u0131 gereklidir." } });
        }
        if (!Array.isArray(questions) || questions.length === 0) {
          return res.status(400).json({ success: false, error: { message: "En az bir soru eklemelisiniz." } });
        }
        const [newSet] = await db.insert(quizQuestionSets).values({
          userId,
          title: title.trim(),
          description: description?.trim() || null,
          category,
          difficulty,
          isPublic: Boolean(isPublic),
          questionCount: questions.length
        }).returning();
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await db.insert(quizQuestionSetItems).values({
            setId: newSet.id,
            question: q.question.trim(),
            explanation: q.explanation?.trim() || null,
            order: i + 1,
            options: q.options
          });
        }
        res.json({ success: true, set: newSet, message: "Soru seti ba\u015Far\u0131yla kaydedildi!" });
      } catch (err) {
        console.error("Error creating question set:", err);
        res.status(500).json({ success: false, error: { message: "Soru seti olu\u015Fturulamad\u0131." } });
      }
    });
    quizRouter.get("/sets/:id", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const setId = parseInt(req.params.id);
        const [qSet] = await db.select().from(quizQuestionSets).where((0, import_drizzle_orm44.eq)(quizQuestionSets.id, setId)).limit(1);
        if (!qSet) {
          return res.status(404).json({ success: false, error: { message: "Soru seti bulunamad\u0131." } });
        }
        if (qSet.userId !== userId && !qSet.isPublic && req.user?.role !== "ADMIN") {
          return res.status(403).json({ success: false, error: { message: "Bu soru setine eri\u015Fim izniniz yok." } });
        }
        const items = await db.select().from(quizQuestionSetItems).where((0, import_drizzle_orm44.eq)(quizQuestionSetItems.setId, setId)).orderBy(quizQuestionSetItems.order);
        res.json({ success: true, set: qSet, items });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "Soru seti y\xFCklenemedi." } });
      }
    });
    quizRouter.delete("/sets/:id", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const setId = parseInt(req.params.id);
        const [qSet] = await db.select().from(quizQuestionSets).where((0, import_drizzle_orm44.eq)(quizQuestionSets.id, setId)).limit(1);
        if (!qSet || qSet.userId !== userId && req.user?.role !== "ADMIN") {
          return res.status(403).json({ success: false, error: { message: "Yetkisiz i\u015Flem." } });
        }
        await db.delete(quizQuestionSets).where((0, import_drizzle_orm44.eq)(quizQuestionSets.id, setId));
        res.json({ success: true, message: "Soru seti silindi." });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "Soru seti silinemedi." } });
      }
    });
    quizRouter.post("/rooms/:code/invite", requireAuth, async (req, res) => {
      try {
        const senderId = getUserId(req);
        const { receiverUsername } = req.body;
        const code = req.params.code;
        if (!receiverUsername) {
          return res.status(400).json({ success: false, error: { message: "Kullan\u0131c\u0131 ad\u0131 gereklidir." } });
        }
        const room = activeRoomsByCode.get(code);
        if (!room) {
          return res.status(404).json({ success: false, error: { message: "Aktif quiz odas\u0131 bulunamad\u0131." } });
        }
        const [receiver] = await db.select({ id: users.id, username: users.username }).from(users).where((0, import_drizzle_orm44.eq)(users.username, receiverUsername.trim())).limit(1);
        if (!receiver) {
          return res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
        }
        if (receiver.id === senderId) {
          return res.status(400).json({ success: false, error: { message: "Kendinize davet g\xF6nderemezsiniz." } });
        }
        const [isBlocked] = await db.select().from(blocks).where(
          (0, import_drizzle_orm44.or)(
            (0, import_drizzle_orm44.and)((0, import_drizzle_orm44.eq)(blocks.blockerId, receiver.id), (0, import_drizzle_orm44.eq)(blocks.blockedId, senderId)),
            (0, import_drizzle_orm44.and)((0, import_drizzle_orm44.eq)(blocks.blockerId, senderId), (0, import_drizzle_orm44.eq)(blocks.blockedId, receiver.id))
          )
        ).limit(1);
        if (isBlocked) {
          return res.status(403).json({ success: false, error: { message: "Bu kullan\u0131c\u0131ya davet g\xF6nderemezsiniz." } });
        }
        await db.insert(quizInvites).values({
          roomId: room.id,
          senderId,
          receiverId: receiver.id,
          status: "PENDING"
        }).onConflictDoNothing();
        const [senderProfile] = await db.select({ username: users.username }).from(users).where((0, import_drizzle_orm44.eq)(users.id, senderId)).limit(1);
        await db.insert(notifications).values({
          recipientId: receiver.id,
          actorId: senderId,
          type: "QUIZ_INVITE",
          content: `@${senderProfile?.username || "Bir arkada\u015F\u0131n"} seni "${room.title}" Gen\xE7 Quiz odas\u0131na davet etti! (Oda Kodu: ${room.code})`
        });
        res.json({ success: true, message: `@${receiver.username} kullan\u0131c\u0131s\u0131na davet g\xF6nderildi!` });
      } catch (err) {
        console.error("Error sending quiz invite:", err);
        res.status(500).json({ success: false, error: { message: "Davet g\xF6nderilemedi." } });
      }
    });
    quizRouter.get("/invites", requireAuth, async (req, res) => {
      try {
        const userId = getUserId(req);
        const invites = await db.select({
          id: quizInvites.id,
          roomId: quizInvites.roomId,
          status: quizInvites.status,
          createdAt: quizInvites.createdAt,
          senderUsername: users.username,
          senderAvatar: profiles.avatarUrl,
          roomCode: quizRooms.code,
          roomTitle: quizRooms.title,
          roomStatus: quizRooms.status
        }).from(quizInvites).innerJoin(users, (0, import_drizzle_orm44.eq)(quizInvites.senderId, users.id)).leftJoin(profiles, (0, import_drizzle_orm44.eq)(users.id, profiles.userId)).innerJoin(quizRooms, (0, import_drizzle_orm44.eq)(quizInvites.roomId, quizRooms.id)).where((0, import_drizzle_orm44.and)((0, import_drizzle_orm44.eq)(quizInvites.receiverId, userId), (0, import_drizzle_orm44.eq)(quizInvites.status, "PENDING"))).orderBy((0, import_drizzle_orm44.desc)(quizInvites.createdAt)).limit(20);
        res.json({ success: true, invites });
      } catch (err) {
        res.status(500).json({ success: false, error: { message: "Davetler y\xFCklenemedi." } });
      }
    });
  }
});

// server/routes/teknofest.ts
var teknofest_exports = {};
__export(teknofest_exports, {
  teknofestRouter: () => teknofestRouter
});
var import_express34, import_fs6, import_path7, import_drizzle_orm45, teknofestRouter, requireAdmin2, getReqUserId2;
var init_teknofest = __esm({
  "server/routes/teknofest.ts"() {
    "use strict";
    import_express34 = require("express");
    import_fs6 = __toESM(require("fs"), 1);
    import_path7 = __toESM(require("path"), 1);
    init_db();
    init_schema();
    import_drizzle_orm45 = require("drizzle-orm");
    init_auth();
    init_uploadConfig();
    teknofestRouter = (0, import_express34.Router)();
    requireAdmin2 = requireRole("ADMIN");
    getReqUserId2 = (req) => {
      return req.user?.userId || req.user?.id || null;
    };
    teknofestRouter.get("/events", async (req, res) => {
      try {
        const events = await db.select().from(teknofestEvents).orderBy((0, import_drizzle_orm45.desc)(teknofestEvents.startDate));
        return res.json({
          success: true,
          data: events
        });
      } catch (error) {
        console.error("Error fetching TEKNOFEST events:", error);
        return res.status(500).json({ success: false, error: "Etkinlikler al\u0131n\u0131rken hata olu\u015Ftu." });
      }
    });
    teknofestRouter.get("/events/:slug", async (req, res) => {
      try {
        const { slug } = req.params;
        const [event] = await db.select().from(teknofestEvents).where((0, import_drizzle_orm45.eq)(teknofestEvents.slug, slug)).limit(1);
        if (!event) {
          return res.status(404).json({ success: false, error: "TEKNOFEST etkinli\u011Fi bulunamad\u0131." });
        }
        const categories = await db.select().from(teknofestCategories).where((0, import_drizzle_orm45.eq)(teknofestCategories.eventId, event.id)).orderBy(teknofestCategories.sortOrder);
        const timeline = await db.select().from(teknofestTimelineItems).where((0, import_drizzle_orm45.eq)(teknofestTimelineItems.eventId, event.id)).orderBy(teknofestTimelineItems.sortOrder);
        const [mediaCountResult] = await db.select({ count: import_drizzle_orm45.sql`count(*)` }).from(teknofestMedia).where((0, import_drizzle_orm45.and)(
          (0, import_drizzle_orm45.eq)(teknofestMedia.eventId, event.id),
          (0, import_drizzle_orm45.eq)(teknofestMedia.moderationStatus, "APPROVED")
        ));
        const [memoriesCountResult] = await db.select({ count: import_drizzle_orm45.sql`count(*)` }).from(teknofestMemories).where((0, import_drizzle_orm45.and)(
          (0, import_drizzle_orm45.eq)(teknofestMemories.eventId, event.id),
          (0, import_drizzle_orm45.eq)(teknofestMemories.moderationStatus, "APPROVED")
        ));
        return res.json({
          success: true,
          data: {
            ...event,
            categories,
            timeline,
            counts: {
              media: Number(mediaCountResult?.count || 0),
              memories: Number(memoriesCountResult?.count || 0)
            }
          }
        });
      } catch (error) {
        console.error("Error fetching event details:", error);
        return res.status(500).json({ success: false, error: "Etkinlik detaylar\u0131 al\u0131namad\u0131." });
      }
    });
    teknofestRouter.get("/events/:slug/media", async (req, res) => {
      try {
        const { slug } = req.params;
        const categorySlug = req.query.category;
        const mediaType = req.query.mediaType;
        const isFeatured = req.query.isFeatured === "true";
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "20", 10)));
        const offset = (page - 1) * limit;
        const [event] = await db.select({ id: teknofestEvents.id }).from(teknofestEvents).where((0, import_drizzle_orm45.eq)(teknofestEvents.slug, slug)).limit(1);
        if (!event) {
          return res.status(404).json({ success: false, error: "Etkinlik bulunamad\u0131." });
        }
        let categoryId = null;
        if (categorySlug && categorySlug !== "all" && categorySlug !== "tumu") {
          const [cat] = await db.select({ id: teknofestCategories.id }).from(teknofestCategories).where((0, import_drizzle_orm45.and)(
            (0, import_drizzle_orm45.eq)(teknofestCategories.eventId, event.id),
            (0, import_drizzle_orm45.eq)(teknofestCategories.slug, categorySlug)
          )).limit(1);
          if (cat) categoryId = cat.id;
        }
        const conditions = [
          (0, import_drizzle_orm45.eq)(teknofestMedia.eventId, event.id),
          (0, import_drizzle_orm45.eq)(teknofestMedia.moderationStatus, "APPROVED")
        ];
        if (categoryId) {
          conditions.push((0, import_drizzle_orm45.eq)(teknofestMedia.categoryId, categoryId));
        }
        if (mediaType && (mediaType === "IMAGE" || mediaType === "VIDEO")) {
          conditions.push((0, import_drizzle_orm45.eq)(teknofestMedia.mediaType, mediaType));
        }
        if (isFeatured) {
          conditions.push((0, import_drizzle_orm45.eq)(teknofestMedia.isFeatured, true));
        }
        const [countResult] = await db.select({ count: import_drizzle_orm45.sql`count(*)` }).from(teknofestMedia).where((0, import_drizzle_orm45.and)(...conditions));
        const total = Number(countResult?.count || 0);
        const mediaList = await db.select({
          id: teknofestMedia.id,
          eventId: teknofestMedia.eventId,
          userId: teknofestMedia.userId,
          categoryId: teknofestMedia.categoryId,
          categoryName: teknofestCategories.name,
          categorySlug: teknofestCategories.slug,
          postId: teknofestMedia.postId,
          projectId: teknofestMedia.projectId,
          mediaType: teknofestMedia.mediaType,
          mediaUrl: teknofestMedia.mediaUrl,
          thumbnailUrl: teknofestMedia.thumbnailUrl,
          title: teknofestMedia.title,
          caption: teknofestMedia.caption,
          altText: teknofestMedia.altText,
          credit: teknofestMedia.credit,
          aspectRatio: teknofestMedia.aspectRatio,
          duration: teknofestMedia.duration,
          viewsCount: teknofestMedia.viewsCount,
          likesCount: teknofestMedia.likesCount,
          isFeatured: teknofestMedia.isFeatured,
          createdAt: teknofestMedia.createdAt,
          uploaderUsername: users.username,
          uploaderDisplayName: profiles.displayName,
          uploaderAvatarUrl: profiles.avatarUrl,
          uploaderIsPrivate: profiles.isPrivate
        }).from(teknofestMedia).leftJoin(teknofestCategories, (0, import_drizzle_orm45.eq)(teknofestMedia.categoryId, teknofestCategories.id)).leftJoin(users, (0, import_drizzle_orm45.eq)(teknofestMedia.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm45.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm45.and)(...conditions)).orderBy((0, import_drizzle_orm45.desc)(teknofestMedia.isFeatured), (0, import_drizzle_orm45.desc)(teknofestMedia.createdAt)).limit(limit).offset(offset);
        const sanitizedList = mediaList.map((m) => ({
          ...m,
          uploader: m.userId ? {
            id: m.userId,
            username: m.uploaderIsPrivate ? "Gizli Kullan\u0131c\u0131" : m.uploaderUsername,
            displayName: m.uploaderIsPrivate ? "Gen\xE7 Sosyal \xDCyesi" : m.uploaderDisplayName || m.uploaderUsername,
            avatarUrl: m.uploaderIsPrivate ? null : m.uploaderAvatarUrl
          } : null
        }));
        return res.json({
          success: true,
          data: sanitizedList,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error("Error fetching media list:", error);
        return res.status(500).json({ success: false, error: "Medya galerisi y\xFCklenemedi." });
      }
    });
    teknofestRouter.get("/media/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ success: false, error: "Ge\xE7ersiz ID" });
        const [media] = await db.select({
          id: teknofestMedia.id,
          eventId: teknofestMedia.eventId,
          eventTitle: teknofestEvents.title,
          eventSlug: teknofestEvents.slug,
          eventLocation: teknofestEvents.location,
          userId: teknofestMedia.userId,
          categoryId: teknofestMedia.categoryId,
          categoryName: teknofestCategories.name,
          postId: teknofestMedia.postId,
          projectId: teknofestMedia.projectId,
          mediaType: teknofestMedia.mediaType,
          mediaUrl: teknofestMedia.mediaUrl,
          thumbnailUrl: teknofestMedia.thumbnailUrl,
          title: teknofestMedia.title,
          caption: teknofestMedia.caption,
          altText: teknofestMedia.altText,
          credit: teknofestMedia.credit,
          aspectRatio: teknofestMedia.aspectRatio,
          duration: teknofestMedia.duration,
          viewsCount: teknofestMedia.viewsCount,
          likesCount: teknofestMedia.likesCount,
          isFeatured: teknofestMedia.isFeatured,
          createdAt: teknofestMedia.createdAt,
          uploaderUsername: users.username,
          uploaderDisplayName: profiles.displayName,
          uploaderAvatarUrl: profiles.avatarUrl,
          uploaderIsPrivate: profiles.isPrivate
        }).from(teknofestMedia).innerJoin(teknofestEvents, (0, import_drizzle_orm45.eq)(teknofestMedia.eventId, teknofestEvents.id)).leftJoin(teknofestCategories, (0, import_drizzle_orm45.eq)(teknofestMedia.categoryId, teknofestCategories.id)).leftJoin(users, (0, import_drizzle_orm45.eq)(teknofestMedia.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm45.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm45.and)(
          (0, import_drizzle_orm45.eq)(teknofestMedia.id, id),
          (0, import_drizzle_orm45.eq)(teknofestMedia.moderationStatus, "APPROVED")
        )).limit(1);
        if (!media) {
          return res.status(404).json({ success: false, error: "Medya bulunamad\u0131 veya onay bekliyor." });
        }
        db.update(teknofestMedia).set({ viewsCount: import_drizzle_orm45.sql`${teknofestMedia.viewsCount} + 1` }).where((0, import_drizzle_orm45.eq)(teknofestMedia.id, id)).catch(() => {
        });
        let linkedProject = null;
        if (media.projectId) {
          const [proj] = await db.select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            category: projects.category,
            imageUrl: projects.imageUrl
          }).from(projects).where((0, import_drizzle_orm45.eq)(projects.id, media.projectId)).limit(1);
          linkedProject = proj || null;
        }
        return res.json({
          success: true,
          data: {
            ...media,
            uploader: media.userId ? {
              id: media.userId,
              username: media.uploaderIsPrivate ? "Gizli Kullan\u0131c\u0131" : media.uploaderUsername,
              displayName: media.uploaderIsPrivate ? "Gen\xE7 Sosyal \xDCyesi" : media.uploaderDisplayName || media.uploaderUsername,
              avatarUrl: media.uploaderIsPrivate ? null : media.uploaderAvatarUrl
            } : null,
            linkedProject
          }
        });
      } catch (error) {
        console.error("Error fetching single media:", error);
        return res.status(500).json({ success: false, error: "Medya y\xFCklenemedi." });
      }
    });
    teknofestRouter.post("/media/:id/like", optionalAuth, async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ success: false, error: "Ge\xE7ersiz ID" });
        const [updated] = await db.update(teknofestMedia).set({ likesCount: import_drizzle_orm45.sql`${teknofestMedia.likesCount} + 1` }).where((0, import_drizzle_orm45.eq)(teknofestMedia.id, id)).returning({ likesCount: teknofestMedia.likesCount });
        return res.json({
          success: true,
          likesCount: updated?.likesCount || 0
        });
      } catch (error) {
        return res.status(500).json({ success: false, error: "Be\u011Feni kaydedilemedi." });
      }
    });
    teknofestRouter.get("/events/:slug/projects", async (req, res) => {
      try {
        const { slug } = req.params;
        const [event] = await db.select({ id: teknofestEvents.id }).from(teknofestEvents).where((0, import_drizzle_orm45.eq)(teknofestEvents.slug, slug)).limit(1);
        if (!event) return res.status(404).json({ success: false, error: "Etkinlik bulunamad\u0131." });
        const linkedMediaProjects = await db.select({
          projectId: teknofestMedia.projectId
        }).from(teknofestMedia).where((0, import_drizzle_orm45.and)(
          (0, import_drizzle_orm45.eq)(teknofestMedia.eventId, event.id),
          import_drizzle_orm45.sql`${teknofestMedia.projectId} IS NOT NULL`,
          (0, import_drizzle_orm45.eq)(teknofestMedia.moderationStatus, "APPROVED")
        ));
        const projectIds = linkedMediaProjects.map((p) => p.projectId).filter(Boolean);
        let queryCondition = import_drizzle_orm45.sql`1=1`;
        if (projectIds.length > 0) {
          queryCondition = (0, import_drizzle_orm45.or)(
            (0, import_drizzle_orm45.inArray)(projects.id, projectIds),
            (0, import_drizzle_orm45.ilike)(projects.title, "%teknofest%"),
            (0, import_drizzle_orm45.ilike)(projects.description, "%teknofest%")
          );
        } else {
          queryCondition = (0, import_drizzle_orm45.or)(
            (0, import_drizzle_orm45.ilike)(projects.title, "%teknofest%"),
            (0, import_drizzle_orm45.ilike)(projects.description, "%teknofest%"),
            (0, import_drizzle_orm45.ilike)(projects.category, "%Havac\u0131l\u0131k%"),
            (0, import_drizzle_orm45.ilike)(projects.category, "%Robotik%")
          );
        }
        const projectList = await db.select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          category: projects.category,
          status: projects.status,
          imageUrl: projects.imageUrl,
          projectUrl: projects.projectUrl,
          githubUrl: projects.githubUrl,
          createdAt: projects.createdAt,
          authorUsername: users.username,
          authorDisplayName: profiles.displayName,
          authorAvatarUrl: profiles.avatarUrl
        }).from(projects).innerJoin(users, (0, import_drizzle_orm45.eq)(projects.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm45.eq)(users.id, profiles.userId)).where(queryCondition).orderBy((0, import_drizzle_orm45.desc)(projects.createdAt)).limit(20);
        return res.json({
          success: true,
          data: projectList
        });
      } catch (error) {
        console.error("Error fetching TEKNOFEST projects:", error);
        return res.status(500).json({ success: false, error: "Projeler al\u0131namad\u0131." });
      }
    });
    teknofestRouter.get("/events/:slug/memories", async (req, res) => {
      try {
        const { slug } = req.params;
        const [event] = await db.select({ id: teknofestEvents.id }).from(teknofestEvents).where((0, import_drizzle_orm45.eq)(teknofestEvents.slug, slug)).limit(1);
        if (!event) return res.status(404).json({ success: false, error: "Etkinlik bulunamad\u0131." });
        const memoriesList = await db.select({
          id: teknofestMemories.id,
          eventId: teknofestMemories.eventId,
          userId: teknofestMemories.userId,
          postId: teknofestMemories.postId,
          content: teknofestMemories.content,
          authorName: teknofestMemories.authorName,
          authorTitle: teknofestMemories.authorTitle,
          isFeatured: teknofestMemories.isFeatured,
          createdAt: teknofestMemories.createdAt,
          userUsername: users.username,
          userDisplayName: profiles.displayName,
          userAvatarUrl: profiles.avatarUrl,
          userIsPrivate: profiles.isPrivate
        }).from(teknofestMemories).leftJoin(users, (0, import_drizzle_orm45.eq)(teknofestMemories.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm45.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm45.and)(
          (0, import_drizzle_orm45.eq)(teknofestMemories.eventId, event.id),
          (0, import_drizzle_orm45.eq)(teknofestMemories.moderationStatus, "APPROVED")
        )).orderBy((0, import_drizzle_orm45.desc)(teknofestMemories.isFeatured), (0, import_drizzle_orm45.desc)(teknofestMemories.createdAt)).limit(30);
        const sanitizedMemories = memoriesList.map((m) => ({
          ...m,
          displayAuthor: m.authorName || (m.userIsPrivate ? "Gen\xE7 Sosyal \xDCyesi" : m.userDisplayName || m.userUsername || "Ziyaret\xE7i"),
          avatarUrl: m.userIsPrivate ? null : m.userAvatarUrl,
          username: m.userIsPrivate ? null : m.userUsername
        }));
        return res.json({
          success: true,
          data: sanitizedMemories
        });
      } catch (error) {
        console.error("Error fetching memories:", error);
        return res.status(500).json({ success: false, error: "An\u0131lar y\xFCklenemedi." });
      }
    });
    teknofestRouter.post("/events/:slug/submit", requireAuth, async (req, res) => {
      try {
        const { slug } = req.params;
        const userId = getReqUserId2(req);
        if (!userId) return res.status(401).json({ success: false, error: "Oturum a\xE7man\u0131z gerekiyor." });
        const {
          type,
          // 'PHOTO' | 'VIDEO' | 'MEMORY'
          mediaUrl,
          title,
          caption,
          categoryId,
          projectId,
          postId,
          authorTitle,
          rightsAgreed
        } = req.body;
        if (!rightsAgreed) {
          return res.status(400).json({
            success: false,
            error: "\u0130\xE7eri\u011Fin telif ve payla\u015F\u0131m haklar\u0131na sahip oldu\u011Funuzu onaylaman\u0131z gerekmektedir."
          });
        }
        const [event] = await db.select({ id: teknofestEvents.id, title: teknofestEvents.title }).from(teknofestEvents).where((0, import_drizzle_orm45.eq)(teknofestEvents.slug, slug)).limit(1);
        if (!event) return res.status(404).json({ success: false, error: "Etkinlik bulunamad\u0131." });
        const [user] = await db.select({
          username: users.username,
          displayName: profiles.displayName
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm45.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm45.eq)(users.id, userId)).limit(1);
        const creditName = user?.username ? `\u{1F4F7} @${user.username}` : "\u{1F4F7} Gen\xE7 Sosyal \xDCyesi";
        if (type === "MEMORY") {
          if (!caption || caption.trim().length < 10) {
            return res.status(400).json({ success: false, error: "L\xFCtfen en az 10 karakterden olu\u015Fan bir an\u0131/deneyim yaz\u0131s\u0131 girin." });
          }
          const [newMemory] = await db.insert(teknofestMemories).values({
            eventId: event.id,
            userId,
            postId: postId ? parseInt(postId, 10) : null,
            content: caption.trim(),
            authorName: user?.displayName || user?.username || "Gen\xE7 Sosyal \xDCreticisi",
            authorTitle: authorTitle?.trim() || "TEKNOFEST Kat\u0131l\u0131mc\u0131s\u0131",
            moderationStatus: "PENDING",
            isFeatured: false
          }).returning();
          return res.json({
            success: true,
            message: "An\u0131n\u0131z ba\u015Far\u0131yla g\xF6nderildi. Moderasyon ekibimiz inceledikten sonra TEKNOFEST K\xF6\u015Fesi'nde yay\u0131nlanacakt\u0131r.",
            data: newMemory
          });
        } else {
          if (!mediaUrl || !mediaUrl.trim()) {
            return res.status(400).json({ success: false, error: "L\xFCtfen ge\xE7erli bir g\xF6rsel veya video URL'si sa\u011Flay\u0131n." });
          }
          const mediaType = type === "VIDEO" ? "VIDEO" : "IMAGE";
          const [newMedia] = await db.insert(teknofestMedia).values({
            eventId: event.id,
            userId,
            categoryId: categoryId ? parseInt(categoryId, 10) : null,
            projectId: projectId ? parseInt(projectId, 10) : null,
            postId: postId ? parseInt(postId, 10) : null,
            mediaType,
            mediaUrl: mediaUrl.trim(),
            title: title?.trim() || "TEKNOFEST Karesi",
            caption: caption?.trim() || null,
            altText: title?.trim() ? `TEKNOFEST \u2014 ${title.trim()}` : "TEKNOFEST Etkinlik Foto\u011Fraf\u0131",
            credit: creditName,
            moderationStatus: "PENDING",
            isFeatured: false
          }).returning();
          return res.json({
            success: true,
            message: "\u0130\xE7eri\u011Finiz ba\u015Far\u0131yla g\xF6nderildi. Moderasyon onay\u0131ndan sonra ana galeride yerini alacakt\u0131r.",
            data: newMedia
          });
        }
      } catch (error) {
        console.error("Submission error:", error);
        return res.status(500).json({ success: false, error: "\u0130\xE7erik g\xF6nderilirken bir hata olu\u015Ftu." });
      }
    });
    teknofestRouter.get("/my-submissions", requireAuth, async (req, res) => {
      try {
        const userId = getReqUserId2(req);
        if (!userId) return res.status(401).json({ success: false, error: "Yetkisiz eri\u015Fim." });
        const mediaSubmissions = await db.select({
          id: teknofestMedia.id,
          type: import_drizzle_orm45.sql`'MEDIA'`,
          mediaType: teknofestMedia.mediaType,
          mediaUrl: teknofestMedia.mediaUrl,
          title: teknofestMedia.title,
          caption: teknofestMedia.caption,
          moderationStatus: teknofestMedia.moderationStatus,
          rejectionReason: teknofestMedia.rejectionReason,
          createdAt: teknofestMedia.createdAt,
          eventTitle: teknofestEvents.title,
          eventSlug: teknofestEvents.slug
        }).from(teknofestMedia).innerJoin(teknofestEvents, (0, import_drizzle_orm45.eq)(teknofestMedia.eventId, teknofestEvents.id)).where((0, import_drizzle_orm45.eq)(teknofestMedia.userId, userId)).orderBy((0, import_drizzle_orm45.desc)(teknofestMedia.createdAt));
        const memorySubmissions = await db.select({
          id: teknofestMemories.id,
          type: import_drizzle_orm45.sql`'MEMORY'`,
          mediaType: import_drizzle_orm45.sql`'TEXT'`,
          mediaUrl: import_drizzle_orm45.sql`null`,
          title: teknofestMemories.authorTitle,
          caption: teknofestMemories.content,
          moderationStatus: teknofestMemories.moderationStatus,
          rejectionReason: teknofestMemories.rejectionReason,
          createdAt: teknofestMemories.createdAt,
          eventTitle: teknofestEvents.title,
          eventSlug: teknofestEvents.slug
        }).from(teknofestMemories).innerJoin(teknofestEvents, (0, import_drizzle_orm45.eq)(teknofestMemories.eventId, teknofestEvents.id)).where((0, import_drizzle_orm45.eq)(teknofestMemories.userId, userId)).orderBy((0, import_drizzle_orm45.desc)(teknofestMemories.createdAt));
        const combined = [...mediaSubmissions, ...memorySubmissions].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return res.json({
          success: true,
          data: combined
        });
      } catch (error) {
        return res.status(500).json({ success: false, error: "G\xF6nderileriniz al\u0131namad\u0131." });
      }
    });
    teknofestRouter.get("/admin/submissions", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const status = req.query.status || "PENDING";
        let mediaConditions = import_drizzle_orm45.sql`1=1`;
        let memoryConditions = import_drizzle_orm45.sql`1=1`;
        if (status !== "ALL") {
          mediaConditions = (0, import_drizzle_orm45.eq)(teknofestMedia.moderationStatus, status);
          memoryConditions = (0, import_drizzle_orm45.eq)(teknofestMemories.moderationStatus, status);
        }
        const pendingMedia = await db.select({
          id: teknofestMedia.id,
          type: import_drizzle_orm45.sql`'MEDIA'`,
          eventId: teknofestMedia.eventId,
          eventTitle: teknofestEvents.title,
          userId: teknofestMedia.userId,
          username: users.username,
          displayName: profiles.displayName,
          mediaType: teknofestMedia.mediaType,
          mediaUrl: teknofestMedia.mediaUrl,
          title: teknofestMedia.title,
          caption: teknofestMedia.caption,
          credit: teknofestMedia.credit,
          altText: teknofestMedia.altText,
          moderationStatus: teknofestMedia.moderationStatus,
          rejectionReason: teknofestMedia.rejectionReason,
          createdAt: teknofestMedia.createdAt
        }).from(teknofestMedia).innerJoin(teknofestEvents, (0, import_drizzle_orm45.eq)(teknofestMedia.eventId, teknofestEvents.id)).leftJoin(users, (0, import_drizzle_orm45.eq)(teknofestMedia.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm45.eq)(users.id, profiles.userId)).where(mediaConditions).orderBy((0, import_drizzle_orm45.desc)(teknofestMedia.createdAt));
        const pendingMemories = await db.select({
          id: teknofestMemories.id,
          type: import_drizzle_orm45.sql`'MEMORY'`,
          eventId: teknofestMemories.eventId,
          eventTitle: teknofestEvents.title,
          userId: teknofestMemories.userId,
          username: users.username,
          displayName: profiles.displayName,
          mediaType: import_drizzle_orm45.sql`'TEXT'`,
          mediaUrl: import_drizzle_orm45.sql`null`,
          title: teknofestMemories.authorTitle,
          caption: teknofestMemories.content,
          credit: teknofestMemories.authorName,
          altText: import_drizzle_orm45.sql`null`,
          moderationStatus: teknofestMemories.moderationStatus,
          rejectionReason: teknofestMemories.rejectionReason,
          createdAt: teknofestMemories.createdAt
        }).from(teknofestMemories).innerJoin(teknofestEvents, (0, import_drizzle_orm45.eq)(teknofestMemories.eventId, teknofestEvents.id)).leftJoin(users, (0, import_drizzle_orm45.eq)(teknofestMemories.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm45.eq)(users.id, profiles.userId)).where(memoryConditions).orderBy((0, import_drizzle_orm45.desc)(teknofestMemories.createdAt));
        return res.json({
          success: true,
          data: {
            media: pendingMedia,
            memories: pendingMemories,
            totalPending: pendingMedia.filter((m) => m.moderationStatus === "PENDING").length + pendingMemories.filter((m) => m.moderationStatus === "PENDING").length
          }
        });
      } catch (error) {
        console.error("Admin submissions error:", error);
        return res.status(500).json({ success: false, error: "Moderasyon listesi al\u0131namad\u0131." });
      }
    });
    teknofestRouter.post("/admin/submissions/:id/review", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const reviewerId = getReqUserId2(req);
        const { type, action, rejectionReason, isFeatured } = req.body;
        if (action !== "APPROVE" && action !== "REJECT") {
          return res.status(400).json({ success: false, error: "Ge\xE7ersiz i\u015Flem." });
        }
        const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
        let targetUserId = null;
        let itemTitle = "TEKNOFEST \u0130\xE7eri\u011Fin";
        if (type === "MEMORY") {
          const [updated] = await db.update(teknofestMemories).set({
            moderationStatus: newStatus,
            rejectionReason: action === "REJECT" ? rejectionReason || "Topluluk kurallar\u0131na uygun bulunmad\u0131." : null,
            reviewedBy: reviewerId,
            reviewedAt: /* @__PURE__ */ new Date(),
            isFeatured: isFeatured !== void 0 ? isFeatured : void 0,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm45.eq)(teknofestMemories.id, id)).returning();
          if (!updated) return res.status(404).json({ success: false, error: "An\u0131 bulunamad\u0131." });
          targetUserId = updated.userId;
          itemTitle = "TEKNOFEST An\u0131n";
        } else {
          const [updated] = await db.update(teknofestMedia).set({
            moderationStatus: newStatus,
            rejectionReason: action === "REJECT" ? rejectionReason || "G\xF6rsel/video standartlar\u0131na uygun bulunmad\u0131." : null,
            reviewedBy: reviewerId,
            reviewedAt: /* @__PURE__ */ new Date(),
            isFeatured: isFeatured !== void 0 ? isFeatured : void 0,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm45.eq)(teknofestMedia.id, id)).returning();
          if (!updated) return res.status(404).json({ success: false, error: "Medya bulunamad\u0131." });
          targetUserId = updated.userId;
          itemTitle = updated.title || "TEKNOFEST Foto\u011Fraf\u0131n";
        }
        if (action === "APPROVE" && targetUserId) {
          try {
            await db.insert(notifications).values({
              userId: targetUserId,
              actorId: reviewerId || targetUserId,
              type: "SYSTEM",
              content: `\u{1F389} Tebrikler! "${itemTitle}" ba\u015Fl\u0131kl\u0131 i\xE7eri\u011Fin incelendi ve TEKNOFEST K\xF6\u015Fesi'nde yay\u0131nland\u0131.`
            });
          } catch (nErr) {
            console.warn("Notification insert note:", nErr);
          }
        }
        return res.json({
          success: true,
          message: action === "APPROVE" ? "\u0130\xE7erik onayland\u0131 ve galeride yay\u0131nland\u0131." : "\u0130\xE7erik reddedildi."
        });
      } catch (error) {
        console.error("Moderation review error:", error);
        return res.status(500).json({ success: false, error: "Moderasyon i\u015Flemi kaydedilemedi." });
      }
    });
    teknofestRouter.post("/admin/events", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const {
          slug,
          title,
          theme,
          description,
          location,
          startDate,
          endDate,
          coverImageUrl,
          status,
          isFeatured,
          stats
        } = req.body;
        if (!slug || !title || !description || !location || !startDate || !endDate) {
          return res.status(400).json({ success: false, error: "L\xFCtfen zorunlu alanlar\u0131 doldurun." });
        }
        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
        const [newEvent] = await db.insert(teknofestEvents).values({
          slug: cleanSlug,
          title: title.trim(),
          theme: theme?.trim() || null,
          description: description.trim(),
          location: location.trim(),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          coverImageUrl: coverImageUrl?.trim() || null,
          status: status || "COMPLETED",
          isFeatured: isFeatured !== void 0 ? isFeatured : true,
          stats: stats || { visitorCount: "1.0M+", projectCount: "1,000+", competitionsCount: "40" }
        }).returning();
        await db.insert(teknofestCategories).values([
          { eventId: newEvent.id, name: "\u{1F4F8} Etkinlik", slug: "etkinlik", icon: "Camera", sortOrder: 1 },
          { eventId: newEvent.id, name: "\u{1F680} Projeler", slug: "projeler", icon: "Rocket", sortOrder: 2 },
          { eventId: newEvent.id, name: "\u{1F916} Teknoloji", slug: "teknoloji", icon: "Cpu", sortOrder: 3 },
          { eventId: newEvent.id, name: "\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1} Gen\xE7ler", slug: "gencler", icon: "Users", sortOrder: 4 },
          { eventId: newEvent.id, name: "\u{1F3C6} Yar\u0131\u015Fmalar", slug: "yarismalar", icon: "Trophy", sortOrder: 5 },
          { eventId: newEvent.id, name: "\u{1F306} Festival Alan\u0131", slug: "alan", icon: "MapPin", sortOrder: 6 }
        ]).catch(() => {
        });
        return res.json({
          success: true,
          message: "Yeni TEKNOFEST etkinli\u011Fi ba\u015Far\u0131yla olu\u015Fturuldu.",
          data: newEvent
        });
      } catch (error) {
        console.error("Create event error:", error);
        return res.status(500).json({ success: false, error: "Etkinlik olu\u015Fturulamad\u0131." });
      }
    });
    teknofestRouter.put("/admin/events/:id", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const {
          slug,
          title,
          theme,
          description,
          location,
          startDate,
          endDate,
          coverImageUrl,
          status,
          isFeatured,
          stats
        } = req.body;
        const [updated] = await db.update(teknofestEvents).set({
          slug: slug ? slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") : void 0,
          title: title?.trim(),
          theme: theme?.trim(),
          description: description?.trim(),
          location: location?.trim(),
          startDate: startDate ? new Date(startDate) : void 0,
          endDate: endDate ? new Date(endDate) : void 0,
          coverImageUrl: coverImageUrl?.trim(),
          status,
          isFeatured,
          stats,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm45.eq)(teknofestEvents.id, id)).returning();
        return res.json({
          success: true,
          message: "Etkinlik g\xFCncellendi.",
          data: updated
        });
      } catch (error) {
        return res.status(500).json({ success: false, error: "Etkinlik g\xFCncellenemedi." });
      }
    });
    teknofestRouter.get("/admin/media", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const eventId = req.query.eventId ? parseInt(req.query.eventId, 10) : void 0;
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : void 0;
        const mediaType = req.query.mediaType;
        const search = req.query.search?.trim();
        const conditions = [];
        if (eventId) conditions.push((0, import_drizzle_orm45.eq)(teknofestMedia.eventId, eventId));
        if (categoryId) conditions.push((0, import_drizzle_orm45.eq)(teknofestMedia.categoryId, categoryId));
        if (mediaType && (mediaType === "IMAGE" || mediaType === "VIDEO")) {
          conditions.push((0, import_drizzle_orm45.eq)(teknofestMedia.mediaType, mediaType));
        }
        if (search) {
          conditions.push((0, import_drizzle_orm45.or)(
            (0, import_drizzle_orm45.ilike)(teknofestMedia.title, `%${search}%`),
            (0, import_drizzle_orm45.ilike)(teknofestMedia.caption, `%${search}%`),
            (0, import_drizzle_orm45.ilike)(teknofestMedia.credit, `%${search}%`)
          ));
        }
        const items = await db.select({
          id: teknofestMedia.id,
          eventId: teknofestMedia.eventId,
          eventTitle: teknofestEvents.title,
          categoryId: teknofestMedia.categoryId,
          categoryName: teknofestCategories.name,
          mediaType: teknofestMedia.mediaType,
          mediaUrl: teknofestMedia.mediaUrl,
          thumbnailUrl: teknofestMedia.thumbnailUrl,
          title: teknofestMedia.title,
          caption: teknofestMedia.caption,
          altText: teknofestMedia.altText,
          credit: teknofestMedia.credit,
          aspectRatio: teknofestMedia.aspectRatio,
          duration: teknofestMedia.duration,
          viewsCount: teknofestMedia.viewsCount,
          likesCount: teknofestMedia.likesCount,
          isFeatured: teknofestMedia.isFeatured,
          moderationStatus: teknofestMedia.moderationStatus,
          createdAt: teknofestMedia.createdAt
        }).from(teknofestMedia).leftJoin(teknofestEvents, (0, import_drizzle_orm45.eq)(teknofestMedia.eventId, teknofestEvents.id)).leftJoin(teknofestCategories, (0, import_drizzle_orm45.eq)(teknofestMedia.categoryId, teknofestCategories.id)).where(conditions.length > 0 ? (0, import_drizzle_orm45.and)(...conditions) : void 0).orderBy((0, import_drizzle_orm45.desc)(teknofestMedia.createdAt));
        return res.json({ success: true, data: items });
      } catch (error) {
        console.error("Admin media fetch error:", error);
        return res.status(500).json({ success: false, error: "Medyalar y\xFCklenemedi." });
      }
    });
    teknofestRouter.post("/admin/media", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const userId = getReqUserId2(req);
        const {
          eventId,
          categoryId,
          mediaType,
          mediaUrl,
          thumbnailUrl,
          title,
          caption,
          altText,
          credit,
          aspectRatio,
          duration,
          isFeatured
        } = req.body;
        if (!eventId || !mediaUrl) {
          return res.status(400).json({ success: false, error: "Etkinlik ve Medya URL'si zorunludur." });
        }
        const [newMedia] = await db.insert(teknofestMedia).values({
          eventId: parseInt(eventId, 10),
          userId,
          categoryId: categoryId ? parseInt(categoryId, 10) : null,
          mediaType: mediaType || (mediaUrl.endsWith(".mp4") ? "VIDEO" : "IMAGE"),
          mediaUrl: mediaUrl.trim(),
          thumbnailUrl: thumbnailUrl?.trim() || null,
          title: title?.trim() || "TEKNOFEST Medyas\u0131",
          caption: caption?.trim() || null,
          altText: altText?.trim() || title?.trim() || "TEKNOFEST Etkinlik Foto\u011Fraf\u0131",
          credit: credit?.trim() || "\u{1F4F7} Gen\xE7 Sosyal",
          aspectRatio: aspectRatio || "4:3",
          duration: duration ? parseInt(duration, 10) : null,
          isFeatured: Boolean(isFeatured),
          moderationStatus: "APPROVED",
          reviewedBy: userId,
          reviewedAt: /* @__PURE__ */ new Date()
        }).returning();
        return res.json({
          success: true,
          message: "Medya ba\u015Far\u0131yla eklendi ve yay\u0131nland\u0131.",
          data: newMedia
        });
      } catch (error) {
        console.error("Admin media add error:", error);
        return res.status(500).json({ success: false, error: "Medya eklenemedi." });
      }
    });
    teknofestRouter.post("/admin/media/batch", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const userId = getReqUserId2(req);
        const { eventId, items } = req.body;
        if (!eventId || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ success: false, error: "Etkinlik ve en az bir medya \xF6\u011Fesi gereklidir." });
        }
        const insertedList = [];
        for (const item of items) {
          if (!item.mediaUrl) continue;
          const [newMedia] = await db.insert(teknofestMedia).values({
            eventId: parseInt(eventId, 10),
            userId,
            categoryId: item.categoryId ? parseInt(item.categoryId, 10) : null,
            mediaType: item.mediaType || (item.mediaUrl.endsWith(".mp4") ? "VIDEO" : "IMAGE"),
            mediaUrl: item.mediaUrl.trim(),
            thumbnailUrl: item.thumbnailUrl?.trim() || null,
            title: item.title?.trim() || "TEKNOFEST Medyas\u0131",
            caption: item.caption?.trim() || null,
            altText: item.altText?.trim() || item.title?.trim() || "TEKNOFEST Etkinlik Foto\u011Fraf\u0131",
            credit: item.credit?.trim() || "\u{1F4F7} Gen\xE7 Sosyal",
            aspectRatio: item.aspectRatio || "4:3",
            duration: item.duration || null,
            isFeatured: Boolean(item.isFeatured),
            moderationStatus: "APPROVED",
            reviewedBy: userId,
            reviewedAt: /* @__PURE__ */ new Date()
          }).returning();
          insertedList.push(newMedia);
        }
        return res.json({
          success: true,
          message: `${insertedList.length} medya ba\u015Far\u0131yla kaydedildi ve yay\u0131nland\u0131.`,
          data: insertedList
        });
      } catch (error) {
        console.error("Admin batch media error:", error);
        return res.status(500).json({ success: false, error: "Toplu medya kaydedilemedi." });
      }
    });
    teknofestRouter.put("/admin/media/:id", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ success: false, error: "Ge\xE7ersiz ID" });
        const {
          eventId,
          categoryId,
          title,
          caption,
          altText,
          credit,
          aspectRatio,
          isFeatured,
          moderationStatus
        } = req.body;
        const [updated] = await db.update(teknofestMedia).set({
          eventId: eventId ? parseInt(eventId, 10) : void 0,
          categoryId: categoryId !== void 0 ? categoryId ? parseInt(categoryId, 10) : null : void 0,
          title: title?.trim(),
          caption: caption !== void 0 ? caption?.trim() : void 0,
          altText: altText?.trim(),
          credit: credit?.trim(),
          aspectRatio: aspectRatio || void 0,
          isFeatured: isFeatured !== void 0 ? Boolean(isFeatured) : void 0,
          moderationStatus: moderationStatus || void 0,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm45.eq)(teknofestMedia.id, id)).returning();
        return res.json({ success: true, message: "Medya g\xFCncellendi.", data: updated });
      } catch (error) {
        console.error("Admin media update error:", error);
        return res.status(500).json({ success: false, error: "Medya g\xFCncellenemedi." });
      }
    });
    teknofestRouter.delete("/admin/media/:id", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const [media] = await db.select().from(teknofestMedia).where((0, import_drizzle_orm45.eq)(teknofestMedia.id, id)).limit(1);
        if (media) {
          const uploadDir = getUploadDir();
          if (media.mediaUrl && media.mediaUrl.startsWith("/uploads/")) {
            const filename = import_path7.default.basename(media.mediaUrl);
            const filePath = import_path7.default.join(uploadDir, filename);
            if (import_fs6.default.existsSync(filePath)) {
              try {
                import_fs6.default.unlinkSync(filePath);
              } catch (e) {
              }
            }
          }
          if (media.thumbnailUrl && media.thumbnailUrl.startsWith("/uploads/")) {
            const filename = import_path7.default.basename(media.thumbnailUrl);
            const filePath = import_path7.default.join(uploadDir, filename);
            if (import_fs6.default.existsSync(filePath)) {
              try {
                import_fs6.default.unlinkSync(filePath);
              } catch (e) {
              }
            }
          }
          await db.delete(teknofestMedia).where((0, import_drizzle_orm45.eq)(teknofestMedia.id, id));
        }
        return res.json({ success: true, message: "Medya ve dosyalar ba\u015Far\u0131yla silindi." });
      } catch (error) {
        return res.status(500).json({ success: false, error: "Medya silinemedi." });
      }
    });
    teknofestRouter.post("/admin/timeline", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const { eventId, dateLabel, title, description, icon, sortOrder } = req.body;
        if (!eventId || !dateLabel || !title) {
          return res.status(400).json({ success: false, error: "Zorunlu alanlar\u0131 doldurun." });
        }
        const [item] = await db.insert(teknofestTimelineItems).values({
          eventId: parseInt(eventId, 10),
          dateLabel: dateLabel.trim(),
          title: title.trim(),
          description: description?.trim() || null,
          icon: icon || "Sparkles",
          sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0
        }).returning();
        return res.json({ success: true, data: item });
      } catch (error) {
        return res.status(500).json({ success: false, error: "Zaman t\xFCneli \xF6gesi eklenemedi." });
      }
    });
    teknofestRouter.delete("/admin/timeline/:id", requireAuth, requireAdmin2, async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        await db.delete(teknofestTimelineItems).where((0, import_drizzle_orm45.eq)(teknofestTimelineItems.id, id));
        return res.json({ success: true, message: "Zaman t\xFCneli \xF6gesi silindi." });
      } catch (error) {
        return res.status(500).json({ success: false, error: "\xD6ge silinemedi." });
      }
    });
  }
});

// server/routes/childSafety.ts
var childSafety_exports = {};
__export(childSafety_exports, {
  childSafetyRouter: () => childSafetyRouter
});
var import_express35, import_crypto7, import_zod11, import_drizzle_orm46, import_express_rate_limit4, childSafetyRouter, safetyRateLimiter, verifyAgeSchema, parentalRequestSchema, parentalVerifySchema, childAppealSchema;
var init_childSafety2 = __esm({
  "server/routes/childSafety.ts"() {
    "use strict";
    import_express35 = require("express");
    import_crypto7 = __toESM(require("crypto"), 1);
    import_zod11 = require("zod");
    init_db();
    init_schema();
    import_drizzle_orm46 = require("drizzle-orm");
    init_auth();
    init_childSafety();
    init_jwt();
    import_express_rate_limit4 = __toESM(require("express-rate-limit"), 1);
    childSafetyRouter = (0, import_express35.Router)();
    safetyRateLimiter = (0, import_express_rate_limit4.default)({
      windowMs: 15 * 60 * 1e3,
      max: 30,
      message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "\xC7ok fazla istek yap\u0131ld\u0131. L\xFCtfen biraz bekleyin." } }
    });
    childSafetyRouter.get("/status", requireAuth, async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const userRec = await db.select({
          id: users.id,
          username: users.username,
          isMinor: users.isMinor,
          ageVerificationStatus: users.ageVerificationStatus,
          ageVerificationToken: users.ageVerificationToken,
          ageVerifiedAt: users.ageVerifiedAt,
          ageVerificationMethod: users.ageVerificationMethod,
          birthDate: profiles.birthDate,
          isPrivate: profiles.isPrivate,
          isScreenshotProtected: profiles.isScreenshotProtected,
          dailyScreenTimeLimitMinutes: profiles.dailyScreenTimeLimitMinutes
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm46.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm46.eq)(users.id, userId)).limit(1);
        if (userRec.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const u = userRec[0];
        const isNight = isDigitalWellbeingNightHours();
        const [pc] = await db.select().from(parentalControls).where((0, import_drizzle_orm46.eq)(parentalControls.childUserId, userId)).limit(1);
        res.json({
          success: true,
          data: {
            isMinor: u.isMinor,
            ageVerificationStatus: u.ageVerificationStatus,
            ageVerifiedAt: u.ageVerifiedAt,
            ageVerificationMethod: u.ageVerificationMethod,
            hasVerificationToken: Boolean(u.ageVerificationToken),
            birthDate: u.birthDate,
            isPrivate: u.isPrivate,
            isScreenshotProtected: u.isScreenshotProtected,
            dailyScreenTimeLimitMinutes: u.dailyScreenTimeLimitMinutes,
            digitalWellbeing: {
              isNightTime: isNight,
              recommendedSleepWindow: "22:00 - 06:00",
              nightWarning: isNight ? "Gece saatlerinde ekran kullan\u0131m\u0131n\u0131 s\u0131n\u0131rland\u0131rman\u0131z ve dinlenmeniz sa\u011Fl\u0131\u011F\u0131n\u0131z i\xE7in \xF6nemlidir." : null
            },
            parentalControl: pc ? {
              status: pc.status,
              parentEmailMasked: pc.parentEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
              dailyScreenTimeMinutes: pc.dailyScreenTimeMinutes,
              messagingRestricted: pc.messagingRestricted,
              nightModeEnforced: pc.nightModeEnforced,
              pairedAt: pc.pairedAt
            } : null,
            regulationInfo: {
              title: "Sosyal A\u011F Sa\u011Flay\u0131c\u0131 Taraf\u0131ndan \xC7ocuklara \xD6zg\xFC Ayr\u0131\u015Ft\u0131r\u0131lm\u0131\u015F Hizmet Sunulmas\u0131 ve Ya\u015F Do\u011Frulama Y\xF6netmeli\u011Fi",
              publicationDate: "10 Ekim 2026",
              mandate: "15 ya\u015F alt\u0131 hesap a\xE7\u0131lamaz; 15-18 ya\u015F aras\u0131 \xE7ocuk kullan\u0131c\u0131lar i\xE7in y\xFCksek korumal\u0131 ayr\u0131\u015Ft\u0131r\u0131lm\u0131\u015F hizmet zorunludur."
            }
          }
        });
      } catch (error) {
        console.error("Child safety status error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Durum bilgisi al\u0131namad\u0131." } });
      }
    });
    verifyAgeSchema = import_zod11.z.object({
      birthDate: import_zod11.z.string().min(1, "Do\u011Fum tarihi se\xE7ilmelidir."),
      verificationMethod: import_zod11.z.enum(["DECLARATION", "NV_KPS", "E_DEVLET"]).default("DECLARATION"),
      documentNo: import_zod11.z.string().optional()
      // Simulated TC Kimlik / Belge No - never saved in plain text
    });
    childSafetyRouter.post("/verify-age", requireAuth, safetyRateLimiter, async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const parsed = verifyAgeSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
          return;
        }
        const { birthDate, verificationMethod } = parsed.data;
        if (verificationMethod === "E_DEVLET" || verificationMethod === "NV_KPS") {
          return res.status(503).json({
            success: false,
            error: {
              code: "BLOCKED_EXTERNAL_DEPENDENCY",
              message: "Resm\xEE e-Devlet Kap\u0131s\u0131 / NV-KPS Ya\u015F Do\u011Frulama entegrasyonu kamu teknik altyap\u0131s\u0131 ve kurumsal gateway yetkilendirmesi beklenmektedir. Servis sa\u011Flay\u0131c\u0131s\u0131 hen\xFCz kamuya a\xE7\u0131k canl\u0131 do\u011Frulama protokol\xFC sunmad\u0131\u011F\u0131ndan i\u015Flem harici ba\u011F\u0131ml\u0131l\u0131k nedeniyle ger\xE7ekle\u015Ftirilememektedir.",
              dependency: "e-Devlet Kap\u0131s\u0131 Ya\u015F Do\u011Frulama Gateway (BTK & T.C. Cumhurba\u015Fkanl\u0131\u011F\u0131 Dijital D\xF6n\xFC\u015F\xFCm Ofisi)",
              status: "BLOCKED_EXTERNAL_DEPENDENCY"
            }
          });
        }
        const classification = classifyAge(birthDate);
        const rawIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
        const ipHash = hashIpForAudit(rawIp);
        if (classification.category === "UNDER_15") {
          await db.update(users).set({
            isActive: true,
            isMinor: true,
            ageVerificationStatus: "UNVERIFIED",
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm46.eq)(users.id, userId));
          await db.update(profiles).set({
            birthDate: new Date(birthDate),
            isPrivate: true,
            messagePreference: "FOLLOWERS",
            defaultPostVisibility: "FOLLOWERS",
            isScreenshotProtected: true,
            dailyScreenTimeLimitMinutes: 120,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm46.eq)(profiles.userId, userId));
          await db.insert(ageVerificationLogs).values({
            userId,
            action: "VERIFIED_SAFE_MINOR",
            calculatedAge: classification.age,
            verificationMethod,
            ipHash,
            notes: "Kullan\u0131c\u0131 g\xFCvenli korumal\u0131 gen\xE7 moduna al\u0131nd\u0131, hesap ask\u0131ya al\u0131nmad\u0131."
          });
          res.json({
            success: true,
            data: {
              category: "UNDER_15",
              isMinor: true,
              age: classification.age,
              message: "Hesab\u0131n\u0131z korumal\u0131 g\xFCvenli gen\xE7 moduna al\u0131nd\u0131. \u0130yi e\u011Flenceler!",
              protectionsEnabled: true
            }
          });
          return;
        }
        if (classification.category === "MINOR_15_18") {
          await db.update(users).set({
            isMinor: true,
            ageVerificationStatus: "UNVERIFIED",
            // Beyan resmi doğrulama sayılmaz!
            ageVerificationToken: null,
            ageVerifiedAt: null,
            ageVerificationMethod: "DECLARATION",
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm46.eq)(users.id, userId));
          await db.update(profiles).set({
            birthDate: new Date(birthDate),
            isPrivate: true,
            // Default private for minors
            allowSearchEngineIndexing: false,
            // Default unindexed
            messagePreference: "FOLLOWERS",
            // Stranger adult contact blocked
            defaultPostVisibility: "FOLLOWERS",
            isScreenshotProtected: true,
            dailyScreenTimeLimitMinutes: 120,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm46.eq)(profiles.userId, userId));
          await db.insert(ageVerificationLogs).values({
            userId,
            action: "DECLARED_MINOR_AGE",
            calculatedAge: classification.age,
            verificationMethod: "DECLARATION",
            tokenHash: null,
            ipHash,
            notes: `Kullan\u0131c\u0131 15-18 ya\u015F \xE7ocuk beyan\u0131nda bulundu (${classification.age} ya\u015F). Ayr\u0131\u015Ft\u0131r\u0131lm\u0131\u015F \xE7ocuk koruma tedbirleri uyguland\u0131, hesap stat\xFCs\xFC UNVERIFIED olarak kaydedildi.`
          });
          res.json({
            success: true,
            data: {
              isMinor: true,
              ageVerificationStatus: "UNVERIFIED",
              declaredAge: classification.age,
              message: "Ya\u015F beyan\u0131n\u0131z kaydedildi. 10 Ekim 2026 Y\xF6netmeli\u011Fi gere\u011Fi hesab\u0131n\u0131z \xE7ocuklara \xF6zg\xFC ayr\u0131\u015Ft\u0131r\u0131lm\u0131\u015F koruma moduna ge\xE7irilmi\u015Ftir.",
              legalExplanation: classification.legalExplanation,
              protectionsEnabled: [
                "Varsay\u0131lan gizli hesap",
                "Arama motoru indeksleme engeli",
                "Yeti\u015Fkinlerden gelen tek tarafl\u0131 do\u011Frudan mesaj k\u0131s\u0131tlamas\u0131",
                "Takip\xE7i listesi gizlili\u011Fi",
                "Ekran g\xF6r\xFCnt\xFCs\xFC ve i\xE7erik korumas\u0131",
                "Gece dijital esenlik uyar\u0131s\u0131"
              ]
            }
          });
          return;
        }
        await db.update(users).set({
          isMinor: false,
          ageVerificationStatus: "UNVERIFIED",
          // Beyan resmi doğrulama sayılmaz!
          ageVerificationToken: null,
          ageVerifiedAt: null,
          ageVerificationMethod: "DECLARATION",
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm46.eq)(users.id, userId));
        await db.update(profiles).set({
          birthDate: new Date(birthDate),
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm46.eq)(profiles.userId, userId));
        await db.insert(ageVerificationLogs).values({
          userId,
          action: "DECLARED_ADULT_AGE",
          calculatedAge: classification.age,
          verificationMethod: "DECLARATION",
          tokenHash: null,
          ipHash,
          notes: `Kullan\u0131c\u0131 18+ yeti\u015Fkin beyan\u0131nda bulundu (${classification.age} ya\u015F). Resm\xEE do\u011Frulama yap\u0131lmad\u0131\u011F\u0131 i\xE7in hesap UNVERIFIED olarak kaydedildi.`
        });
        res.json({
          success: true,
          data: {
            isMinor: false,
            ageVerificationStatus: "UNVERIFIED",
            declaredAge: classification.age,
            message: "Ya\u015F beyan\u0131n\u0131z kaydedildi. Resm\xEE e-Devlet do\u011Frulamas\u0131 kamu teknik altyap\u0131s\u0131 haz\u0131r oldu\u011Funda sunulacakt\u0131r."
          }
        });
      } catch (error) {
        console.error("Age verification error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Ya\u015F do\u011Frulamas\u0131 s\u0131ras\u0131nda bir hata olu\u015Ftu." } });
      }
    });
    parentalRequestSchema = import_zod11.z.object({
      parentEmail: import_zod11.z.string().email("Ge\xE7erli bir veli e-posta adresi giriniz.").toLowerCase(),
      dailyScreenTimeMinutes: import_zod11.z.number().int().min(30).max(480).default(120)
    });
    childSafetyRouter.post("/parental-control/request", requireAuth, safetyRateLimiter, async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const parsed = parentalRequestSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
          return;
        }
        const { parentEmail, dailyScreenTimeMinutes } = parsed.data;
        const part1 = import_crypto7.default.randomBytes(2).toString("hex").toUpperCase();
        const part2 = import_crypto7.default.randomBytes(2).toString("hex").toUpperCase();
        const pairingCode = `GS-${part1}-${part2}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
        const existing = await db.select().from(parentalControls).where((0, import_drizzle_orm46.eq)(parentalControls.childUserId, userId)).limit(1);
        if (existing.length > 0) {
          await db.update(parentalControls).set({
            parentEmail,
            pairingCode,
            status: "PENDING",
            attempts: 0,
            expiresAt,
            dailyScreenTimeMinutes,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm46.eq)(parentalControls.id, existing[0].id));
        } else {
          await db.insert(parentalControls).values({
            childUserId: userId,
            parentEmail,
            pairingCode,
            status: "PENDING",
            attempts: 0,
            expiresAt,
            dailyScreenTimeMinutes,
            messagingRestricted: true,
            nightModeEnforced: true
          });
        }
        res.json({
          success: true,
          data: {
            pairingCode,
            parentEmail,
            status: "PENDING",
            expiresAt,
            message: `Veli e\u015Fle\u015Ftirme talebi olu\u015Fturuldu. Y\xFCksek g\xFCvenlikli e\u015Fle\u015Fme kodunu (${pairingCode}) velinizle payla\u015Farak 24 saat i\xE7inde onaylamas\u0131n\u0131 isteyiniz.`
          }
        });
      } catch (error) {
        console.error("Parental request error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Veli e\u015Fle\u015Ftirme talebi olu\u015Fturulamad\u0131." } });
      }
    });
    parentalVerifySchema = import_zod11.z.object({
      pairingCode: import_zod11.z.string().min(4, "E\u015Fle\u015Ftirme kodu zorunludur."),
      parentConfirmationEmail: import_zod11.z.string().email("Do\u011Frulayan veli e-posta adresi gereklidir.").toLowerCase(),
      dailyScreenTimeMinutes: import_zod11.z.number().int().min(30).max(480).optional()
    });
    childSafetyRouter.post("/parental-control/verify", requireAuth, safetyRateLimiter, async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const parsed = parentalVerifySchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
          return;
        }
        const { pairingCode, parentConfirmationEmail, dailyScreenTimeMinutes } = parsed.data;
        const [record] = await db.select().from(parentalControls).where((0, import_drizzle_orm46.eq)(parentalControls.childUserId, userId)).limit(1);
        if (!record) {
          res.status(404).json({
            success: false,
            error: { code: "RECORD_NOT_FOUND", message: "Aktif bir e\u015Fle\u015Ftirme talebi bulunamad\u0131." }
          });
          return;
        }
        if (record.attempts >= 5) {
          return res.status(429).json({
            success: false,
            error: { code: "TOO_MANY_FAILED_ATTEMPTS", message: "\xC7ok fazla hatal\u0131 e\u015Fle\u015Ftirme denemesi yap\u0131ld\u0131. L\xFCtfen yeni bir e\u015Fle\u015Ftirme kodu talep edin." }
          });
        }
        if (record.expiresAt && /* @__PURE__ */ new Date() > new Date(record.expiresAt)) {
          return res.status(400).json({
            success: false,
            error: { code: "CODE_EXPIRED", message: "E\u015Fle\u015Ftirme kodunun s\xFCresi (24 saat) dolmu\u015Ftur. L\xFCtfen yeni kod olu\u015Fturun." }
          });
        }
        const isCodeMatch = record.pairingCode.toUpperCase().replace(/\s/g, "") === pairingCode.trim().toUpperCase().replace(/\s/g, "");
        const isEmailMatch = record.parentEmail.toLowerCase().trim() === parentConfirmationEmail.toLowerCase().trim();
        if (!isCodeMatch || !isEmailMatch) {
          await db.update(parentalControls).set({
            attempts: import_drizzle_orm46.sql`${parentalControls.attempts} + 1`,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm46.eq)(parentalControls.id, record.id));
          const remainingAttempts = Math.max(0, 4 - record.attempts);
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_PAIRING_CREDENTIALS",
              message: `E\u015Fle\u015Ftirme kodu veya veli e-posta adresi uyu\u015Fmuyor. Kalan deneme hakk\u0131: ${remainingAttempts}`
            }
          });
        }
        const finalScreenTime = dailyScreenTimeMinutes || record.dailyScreenTimeMinutes;
        await db.update(parentalControls).set({
          status: "ACTIVE",
          pairedAt: /* @__PURE__ */ new Date(),
          attempts: 0,
          dailyScreenTimeMinutes: finalScreenTime,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm46.eq)(parentalControls.id, record.id));
        await db.update(profiles).set({
          dailyScreenTimeLimitMinutes: finalScreenTime,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm46.eq)(profiles.userId, userId));
        res.json({
          success: true,
          data: {
            status: "ACTIVE",
            dailyScreenTimeMinutes: finalScreenTime,
            message: "Ebeveyn kontrol\xFC ba\u015Far\u0131yla etkinle\u015Ftirildi."
          }
        });
      } catch (error) {
        console.error("Parental verify error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Onay i\u015Flemi tamamlanamad\u0131." } });
      }
    });
    childAppealSchema = import_zod11.z.object({
      reason: import_zod11.z.string().min(15, "\u0130tiraz gerek\xE7eniz en az 15 karakter olmal\u0131d\u0131r.").max(2e3),
      declaredBirthDate: import_zod11.z.string().optional(),
      contactEmail: import_zod11.z.string().email().optional(),
      suspensionToken: import_zod11.z.string().optional()
    });
    childSafetyRouter.post("/appeal", async (req, res) => {
      try {
        const parsed = childAppealSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
          return;
        }
        let targetUserId = optionalAuthContext(req);
        if (!targetUserId && parsed.data.suspensionToken) {
          const decoded = verifySuspensionToken(parsed.data.suspensionToken);
          if (decoded?.userId) {
            targetUserId = decoded.userId;
          }
        }
        if (!targetUserId) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "\u0130tiraz i\xE7in ge\xE7erli bir kullan\u0131c\u0131 kimli\u011Fi veya ask\u0131ya alma belirteci gereklidir." }
          });
          return;
        }
        const existingAppeal = await db.select().from(appeals).where((0, import_drizzle_orm46.and)((0, import_drizzle_orm46.eq)(appeals.userId, targetUserId), (0, import_drizzle_orm46.eq)(appeals.status, "PENDING"))).limit(1);
        if (existingAppeal.length > 0) {
          res.status(400).json({
            success: false,
            error: { code: "DUPLICATE_APPEAL", message: "Zaten inceleme bekleyen bir itiraz\u0131n\u0131z bulunmaktad\u0131r." }
          });
          return;
        }
        const banReasonStr = "10 Ekim 2026 Sosyal A\u011F \xC7ocuk G\xFCvenli\u011Fi ve Ya\u015F Do\u011Frulama \u0130tiraz\u0131";
        const fullReason = parsed.data.declaredBirthDate ? `[Beyan Edilen Do\u011Fum Tarihi: ${parsed.data.declaredBirthDate}] ${parsed.data.reason}` : parsed.data.reason;
        const [createdAppeal] = await db.insert(appeals).values({
          userId: targetUserId,
          appealType: "AGE_VERIFICATION_DISPUTE",
          banReason: banReasonStr,
          reason: fullReason,
          status: "PENDING"
        }).returning();
        res.json({
          success: true,
          data: {
            appealId: createdAppeal.id,
            status: "PENDING",
            message: "\u0130tiraz\u0131n\u0131z insan moderat\xF6r incelemesine ba\u015Far\u0131yla iletildi. Mevzuat gere\u011Fince itirazlar yetkili inceleme uzmanlar\u0131 taraf\u0131ndan de\u011Ferlendirilecektir."
          }
        });
      } catch (error) {
        console.error("Child safety appeal error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "\u0130tiraz kaydedilemedi." } });
      }
    });
  }
});

// server/middleware/seo.ts
var seo_exports = {};
__export(seo_exports, {
  createSeoMiddleware: () => createSeoMiddleware
});
function getIndexHtml(isProd) {
  const distPath = import_path8.default.join(process.cwd(), "dist", "index.html");
  const rootPath = import_path8.default.join(process.cwd(), "index.html");
  try {
    if (isProd && import_fs7.default.existsSync(distPath)) {
      if (indexHtmlCache) return indexHtmlCache;
      indexHtmlCache = import_fs7.default.readFileSync(distPath, "utf-8");
      return indexHtmlCache;
    } else if (import_fs7.default.existsSync(rootPath)) {
      return import_fs7.default.readFileSync(rootPath, "utf-8");
    }
  } catch (err) {
    console.error("Error reading index.html template:", err);
  }
  return "";
}
function escapeHtml2(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function linkifyHashtags(text2, domain) {
  if (!text2) return "";
  const escaped = escapeHtml2(text2);
  return escaped.replace(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g, (match, tag) => {
    return `<a href="${domain}/hashtags/${encodeURIComponent(tag)}" style="color:#2563eb;text-decoration:none;font-weight:600;">#${tag}</a>`;
  });
}
function createSeoMiddleware(vite) {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/")) return next();
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|json|woff2?|map|txt|xml|webmanifest)$/i)) return next();
    const isProd = process.env.NODE_ENV === "production";
    const template = getIndexHtml(isProd);
    if (!template) {
      return next();
    }
    const domain = "https://gencsosyal.com";
    const cleanPath = req.path.length > 1 && req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;
    const canonicalUrl = `${domain}${cleanPath}`;
    let title = "Gen\xE7 Sosyal \u2014 Gen\xE7 \xDCretici Platformu";
    let description = "Gen\xE7 \xFCreticilerin, yaz\u0131l\u0131mc\u0131lar\u0131n ve tasar\u0131mc\u0131lar\u0131n projelerini, topluluklar\u0131n\u0131 ve fikirlerini payla\u015Ft\u0131\u011F\u0131 yeni nesil sosyal platform.";
    const keywords = "gen\xE7 sosyal, gen\xE7lik platformu, sosyal medya, yaz\u0131l\u0131mc\u0131 gen\xE7lik, a\xE7\u0131k kaynak projeler, teknoloji toplulu\u011Fu, gen\xE7 geli\u015Ftiriciler, portf\xF6y payla\u015F\u0131m\u0131, yaz\u0131l\u0131m projeleri, dijital topluluk, kodlama";
    let imageUrl = `${domain}/icon-512.png`;
    let ogType = "website";
    let shouldNoIndex = false;
    let isNotFound = false;
    let semanticBody = "";
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Gen\xE7 Sosyal",
        "url": domain,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${domain}/explore?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Gen\xE7 Sosyal",
        "url": domain,
        "logo": `${domain}/icon-512.png`,
        "description": "Gen\xE7 \xFCretici, geli\u015Ftirici ve tasar\u0131mc\u0131 topluluk platformu."
      }
    ];
    try {
      const postMatch = cleanPath.match(/^\/post\/(\d+)$/);
      const profileMatch = cleanPath.match(/^\/profile\/([a-zA-Z0-9_]{3,30})$/);
      const communityMatch = cleanPath.match(/^\/communities\/([a-zA-Z0-9_-]+)$/);
      const projectMatch = cleanPath.match(/^\/projects\/(\d+)$/);
      const hashtagMatch = cleanPath.match(/^\/(?:hashtag|hashtags)\/([a-zA-Z0-9_\u00C0-\u017F]+)$/);
      if (postMatch) {
        const postId = parseInt(postMatch[1], 10);
        const postRecord = await db.select({
          id: posts.id,
          content: posts.content,
          postType: posts.postType,
          visibility: posts.visibility,
          moderationStatus: posts.moderationStatus,
          createdAt: posts.createdAt,
          displayName: profiles.displayName,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          userIsActive: users.isActive,
          allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
          userIsPrivate: profiles.isPrivate
        }).from(posts).innerJoin(users, (0, import_drizzle_orm47.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm47.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm47.eq)(posts.id, postId)).limit(1);
        if (postRecord.length === 0 || postRecord[0].visibility !== "PUBLIC" || postRecord[0].moderationStatus !== "APPROVED" || !postRecord[0].userIsActive) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "G\xF6nderi Bulunamad\u0131 | Gen\xE7 Sosyal";
          description = "G\xF6r\xFCnt\xFClemek istedi\u011Finiz g\xF6nderi mevcut de\u011Fil, silinmi\u015F veya gizli olabilir.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">G\xF6nderi Bulunamad\u0131</h1>
              <p style="color:#64748b;margin-bottom:24px;">Arad\u0131\u011F\u0131n\u0131z g\xF6nderi silinmi\u015F, gizlenmi\u015F veya hen\xFCz onaylanmam\u0131\u015F olabilir.</p>
              <p><a href="${domain}/" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Gen\xE7 Sosyal Ana Sayfas\u0131na D\xF6n</a></p>
            </main>
          `;
        } else {
          const p = postRecord[0];
          const authorName = p.displayName || p.username;
          if (!p.allowSearchEngineIndexing || p.userIsPrivate) {
            shouldNoIndex = true;
          }
          title = `${authorName} taraf\u0131ndan payla\u015F\u0131lan g\xF6nderi | Gen\xE7 Sosyal`;
          description = p.content ? p.content.slice(0, 155) + (p.content.length > 155 ? "..." : "") : `${authorName} taraf\u0131ndan Gen\xE7 Sosyal'de payla\u015F\u0131lan g\xF6nderiye g\xF6z at\u0131n.`;
          const mediaRows = await db.select({ url: postMedia.mediaUrl }).from(postMedia).where((0, import_drizzle_orm47.eq)(postMedia.postId, postId)).limit(1);
          if (mediaRows.length > 0 && mediaRows[0].url) {
            imageUrl = mediaRows[0].url.startsWith("http") ? mediaRows[0].url : `${domain}${mediaRows[0].url}`;
          } else if (p.avatarUrl) {
            imageUrl = p.avatarUrl.startsWith("http") ? p.avatarUrl : `${domain}${p.avatarUrl}`;
          }
          ogType = "article";
          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "SocialMediaPosting",
            "headline": title,
            "articleBody": p.content || "",
            "datePublished": p.createdAt?.toISOString(),
            "url": canonicalUrl,
            "image": imageUrl,
            "author": {
              "@type": "Person",
              "name": authorName,
              "url": `${domain}/profile/${p.username}`,
              "image": p.avatarUrl || `${domain}/icon-512.png`
            },
            "publisher": {
              "@type": "Organization",
              "name": "Gen\xE7 Sosyal",
              "url": domain,
              "logo": `${domain}/icon-512.png`
            }
          });
          semanticBody = `
            <article itemscope itemtype="https://schema.org/SocialMediaPosting" style="max-width:680px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div>
                  <h1 style="font-size:18px;font-weight:700;margin:0;">
                    <a href="${domain}/profile/${escapeHtml2(p.username)}" style="color:#0f172a;text-decoration:none;">${escapeHtml2(authorName)}</a>
                  </h1>
                  <p style="margin:2px 0 0 0;font-size:14px;color:#64748b;">
                    <a href="${domain}/profile/${escapeHtml2(p.username)}" style="color:#64748b;text-decoration:none;">@${escapeHtml2(p.username)}</a> \xB7 
                    <time datetime="${p.createdAt?.toISOString()}">${new Date(p.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</time>
                  </p>
                </div>
              </header>
              <section style="font-size:17px;margin:20px 0;line-height:1.6;white-space:pre-wrap;">${linkifyHashtags(p.content || "", domain)}</section>
              <footer style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;color:#64748b;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <a href="${domain}/" style="color:#2563eb;text-decoration:none;font-weight:600;">Gen\xE7 Sosyal</a> \xB7 
                  <a href="${domain}/explore" style="color:#2563eb;text-decoration:none;font-weight:600;">Ke\u015Ffet</a>
                </div>
                <span>Gen\xE7 \xDCretici Platformu</span>
              </footer>
            </article>
          `;
        }
      } else if (profileMatch) {
        const username = profileMatch[1];
        const userRecord = await db.select({
          id: users.id,
          username: users.username,
          isActive: users.isActive,
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          isPrivate: profiles.isPrivate,
          allowSearchEngineIndexing: profiles.allowSearchEngineIndexing
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm47.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm47.eq)(users.username, username)).limit(1);
        if (userRecord.length === 0 || !userRecord[0].isActive) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Kullan\u0131c\u0131 Bulunamad\u0131 | Gen\xE7 Sosyal";
          description = "Arad\u0131\u011F\u0131n\u0131z kullan\u0131c\u0131 profili mevcut de\u011Fil veya silinmi\u015F.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">Kullan\u0131c\u0131 Bulunamad\u0131</h1>
              <p style="color:#64748b;margin-bottom:24px;">Arad\u0131\u011F\u0131n\u0131z kullan\u0131c\u0131 profili mevcut de\u011Fil veya silinmi\u015F olabilir.</p>
              <p><a href="${domain}/" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Gen\xE7 Sosyal Ana Sayfas\u0131na D\xF6n</a></p>
            </main>
          `;
        } else {
          const u = userRecord[0];
          const name = u.displayName || u.username;
          if (!u.allowSearchEngineIndexing || u.isPrivate) {
            shouldNoIndex = true;
          }
          title = `${name} (@${u.username}) | Gen\xE7 Sosyal`;
          description = u.bio ? u.bio.slice(0, 155) + (u.bio.length > 155 ? "..." : "") : `${name} (@${u.username}) profilini Gen\xE7 Sosyal'de inceleyin. Projeleri, g\xF6nderileri ve payla\u015F\u0131mlar\u0131n\u0131 ke\u015Ffedin.`;
          if (u.avatarUrl) {
            imageUrl = u.avatarUrl.startsWith("http") ? u.avatarUrl : `${domain}${u.avatarUrl}`;
          }
          ogType = "profile";
          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "url": canonicalUrl,
            "mainEntity": {
              "@type": "Person",
              "name": name,
              "alternateName": u.username,
              "description": description,
              "image": imageUrl,
              "url": canonicalUrl
            }
          });
          const userPosts = await db.select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt
          }).from(posts).where(
            (0, import_drizzle_orm47.and)(
              (0, import_drizzle_orm47.eq)(posts.userId, u.id),
              (0, import_drizzle_orm47.eq)(posts.visibility, "PUBLIC"),
              (0, import_drizzle_orm47.eq)(posts.moderationStatus, "APPROVED"),
              (0, import_drizzle_orm47.isNull)(posts.communityId)
            )
          ).orderBy((0, import_drizzle_orm47.desc)(posts.createdAt)).limit(5);
          let userProjects = [];
          try {
            userProjects = await db.select({
              id: projects.id,
              title: projects.title,
              category: projects.category
            }).from(projects).where((0, import_drizzle_orm47.eq)(projects.userId, u.id)).orderBy((0, import_drizzle_orm47.desc)(projects.createdAt)).limit(5);
          } catch (upErr) {
            console.warn("Could not fetch user projects for SEO:", upErr);
          }
          let postsListHtml = "";
          if (userPosts.length > 0) {
            postsListHtml = `
              <section style="margin-top:24px;">
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">G\xF6nderiler</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${userPosts.map((post) => `
                    <li style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
                      <a href="${domain}/post/${post.id}" style="color:#0f172a;text-decoration:none;font-weight:500;">
                        ${escapeHtml2(post.content?.slice(0, 100) || "G\xF6nderi")}
                      </a>
                    </li>
                  `).join("")}
                </ul>
              </section>
            `;
          }
          let projectsListHtml = "";
          if (userProjects.length > 0) {
            projectsListHtml = `
              <section style="margin-top:24px;">
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Projeler</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${userProjects.map((proj) => `
                    <li style="padding:8px 0;">
                      <a href="${domain}/projects/${proj.id}" style="color:#2563eb;text-decoration:none;font-weight:600;">
                        ${escapeHtml2(proj.title)}
                      </a>
                      <span style="font-size:13px;color:#64748b;margin-left:8px;">(${escapeHtml2(proj.category)})</span>
                    </li>
                  `).join("")}
                </ul>
              </section>
            `;
          }
          semanticBody = `
            <main itemscope itemtype="https://schema.org/Person" style="max-width:680px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:20px;">
                <h1 itemprop="name" style="font-size:24px;font-weight:800;margin:0 0 4px 0;">${escapeHtml2(name)}</h1>
                <p style="font-size:15px;color:#64748b;margin:0 0 12px 0;">@${escapeHtml2(u.username)}</p>
                <p itemprop="description" style="font-size:16px;color:#334155;margin:0;">${escapeHtml2(u.bio || "Gen\xE7 Sosyal \xFCreticisi.")}</p>
              </header>
              ${projectsListHtml}
              ${postsListHtml}
              <nav style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
                <a href="${domain}/" style="color:#2563eb;text-decoration:none;font-weight:600;">Gen\xE7 Sosyal</a> \xB7 
                <a href="${domain}/explore" style="color:#2563eb;text-decoration:none;font-weight:600;">Ke\u015Ffet</a> \xB7 
                <a href="${domain}/projects" style="color:#2563eb;text-decoration:none;font-weight:600;">Projeler</a> \xB7 
                <a href="${domain}/communities" style="color:#2563eb;text-decoration:none;font-weight:600;">Topluluklar</a>
              </nav>
            </main>
          `;
        }
      } else if (projectMatch) {
        const projectId = parseInt(projectMatch[1], 10);
        const projectRecord = await db.select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          detailedDescription: projects.detailedDescription,
          category: projects.category,
          status: projects.status,
          projectUrl: projects.projectUrl,
          githubUrl: projects.githubUrl,
          imageUrl: projects.imageUrl,
          tags: projects.tags,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          authorUsername: users.username,
          authorDisplayName: profiles.displayName,
          authorIsActive: users.isActive,
          allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
          userIsPrivate: profiles.isPrivate
        }).from(projects).innerJoin(users, (0, import_drizzle_orm47.eq)(projects.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm47.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm47.eq)(projects.id, projectId)).limit(1);
        if (projectRecord.length === 0 || !projectRecord[0].authorIsActive) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Proje Bulunamad\u0131 | Gen\xE7 Sosyal";
          description = "Arad\u0131\u011F\u0131n\u0131z proje yay\u0131ndan kald\u0131r\u0131lm\u0131\u015F veya silinmi\u015F olabilir.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">Proje Bulunamad\u0131</h1>
              <p style="color:#64748b;margin-bottom:24px;">Arad\u0131\u011F\u0131n\u0131z proje yay\u0131ndan kald\u0131r\u0131lm\u0131\u015F veya silinmi\u015F olabilir.</p>
              <p><a href="${domain}/projects" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">T\xFCm Projeleri Ke\u015Ffet</a></p>
            </main>
          `;
        } else {
          const prj = projectRecord[0];
          const creatorName = prj.authorDisplayName || prj.authorUsername;
          if (!prj.allowSearchEngineIndexing || prj.userIsPrivate) {
            shouldNoIndex = true;
          }
          title = `${prj.title} | Gen\xE7 Sosyal`;
          description = prj.description ? prj.description.slice(0, 155) + (prj.description.length > 155 ? "..." : "") : "Gen\xE7 Sosyal'de geli\u015Ftirilen yenilik\xE7i projeyi inceleyin.";
          if (prj.imageUrl) {
            imageUrl = prj.imageUrl.startsWith("http") ? prj.imageUrl : `${domain}${prj.imageUrl}`;
          }
          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": prj.title,
            "headline": title,
            "description": description,
            "applicationCategory": prj.category || "DeveloperApplication",
            "url": canonicalUrl,
            "image": imageUrl,
            "author": {
              "@type": "Person",
              "name": creatorName,
              "url": `${domain}/profile/${prj.authorUsername}`
            }
          });
          semanticBody = `
            <article style="max-width:720px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
                <h1 style="font-size:26px;font-weight:800;margin:0 0 8px 0;">${escapeHtml2(prj.title)}</h1>
                <p style="font-size:15px;color:#64748b;margin:0;">
                  Geli\u015Ftirici: <a href="${domain}/profile/${escapeHtml2(prj.authorUsername)}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml2(creatorName)} (@${escapeHtml2(prj.authorUsername)})</a> \xB7 
                  Kategori: <strong>${escapeHtml2(prj.category)}</strong>
                </p>
              </header>
              <section style="margin:20px 0;font-size:16px;color:#334155;">
                <p style="font-size:17px;font-weight:500;color:#0f172a;">${escapeHtml2(prj.description || "")}</p>
                ${prj.detailedDescription ? `<div style="margin-top:16px;white-space:pre-wrap;">${escapeHtml2(prj.detailedDescription)}</div>` : ""}
              </section>
              <footer style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
                <p><a href="${domain}/projects" style="color:#2563eb;font-weight:600;text-decoration:none;">\u2190 Gen\xE7 Sosyal Projelerine D\xF6n</a> \xB7 <a href="${domain}/explore" style="color:#2563eb;font-weight:600;text-decoration:none;">Ke\u015Ffet</a></p>
              </footer>
            </article>
          `;
        }
      } else if (communityMatch) {
        const communitySlug = communityMatch[1];
        const commRecord = await db.select({
          id: communities.id,
          name: communities.name,
          slug: communities.slug,
          description: communities.description,
          avatarUrl: communities.avatarUrl,
          coverUrl: communities.coverUrl,
          createdAt: communities.createdAt,
          ownerUsername: users.username,
          ownerDisplayName: profiles.displayName
        }).from(communities).innerJoin(users, (0, import_drizzle_orm47.eq)(communities.ownerId, users.id)).leftJoin(profiles, (0, import_drizzle_orm47.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm47.and)((0, import_drizzle_orm47.eq)(communities.slug, communitySlug), (0, import_drizzle_orm47.isNull)(communities.deletedAt))).limit(1);
        if (commRecord.length === 0) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Topluluk Bulunamad\u0131 | Gen\xE7 Sosyal";
          description = "Arad\u0131\u011F\u0131n\u0131z topluluk mevcut de\u011Fil veya silinmi\u015F.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">Topluluk Bulunamad\u0131</h1>
              <p style="color:#64748b;margin-bottom:24px;">Arad\u0131\u011F\u0131n\u0131z topluluk mevcut de\u011Fil veya kald\u0131r\u0131lm\u0131\u015F olabilir.</p>
              <p><a href="${domain}/communities" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">T\xFCm Topluluklar\u0131 Ke\u015Ffet</a></p>
            </main>
          `;
        } else {
          const c = commRecord[0];
          title = `${c.name} | Gen\xE7 Sosyal`;
          description = c.description ? c.description.slice(0, 155) + (c.description.length > 155 ? "..." : "") : `${c.name} toplulu\u011Funa kat\u0131l\u0131n ve tart\u0131\u015Fmalara dahil olun.`;
          if (c.avatarUrl) {
            imageUrl = c.avatarUrl.startsWith("http") ? c.avatarUrl : `${domain}${c.avatarUrl}`;
          }
          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "Community",
            "name": c.name,
            "description": description,
            "url": canonicalUrl,
            "image": imageUrl
          });
          semanticBody = `
            <main style="max-width:720px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
                <h1 style="font-size:26px;font-weight:800;margin:0 0 8px 0;">${escapeHtml2(c.name)}</h1>
                <p style="font-size:16px;color:#334155;margin:0 0 8px 0;">${escapeHtml2(c.description || "Gen\xE7 Sosyal toplulu\u011Fu.")}</p>
                <p style="font-size:14px;color:#64748b;margin:0;">
                  Kurucu: <a href="${domain}/profile/${escapeHtml2(c.ownerUsername)}" style="color:#2563eb;text-decoration:none;font-weight:600;">@${escapeHtml2(c.ownerUsername)}</a>
                </p>
              </header>
              <nav style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
                <a href="${domain}/communities" style="color:#2563eb;font-weight:600;text-decoration:none;">\u2190 T\xFCm Topluluklar</a> \xB7 
                <a href="${domain}/explore" style="color:#2563eb;font-weight:600;text-decoration:none;">Ke\u015Ffet</a> \xB7 
                <a href="${domain}/" style="color:#2563eb;font-weight:600;text-decoration:none;">Ana Sayfa</a>
              </nav>
            </main>
          `;
        }
      } else if (hashtagMatch) {
        const tagName = decodeURIComponent(hashtagMatch[1]);
        title = `#${tagName} | Gen\xE7 Sosyal`;
        description = `#${tagName} etiketi alt\u0131ndaki pop\xFCler g\xF6nderileri, projeleri ve gen\xE7 yaz\u0131l\u0131mc\u0131 tart\u0131\u015Fmalar\u0131n\u0131 ke\u015Ffedin.`;
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": title,
          "description": description,
          "url": canonicalUrl
        });
        semanticBody = `
          <main style="max-width:680px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
              <h1 style="font-size:26px;font-weight:800;margin:0 0 8px 0;color:#2563eb;">#${escapeHtml2(tagName)}</h1>
              <p style="font-size:16px;color:#64748b;margin:0;">${escapeHtml2(description)}</p>
            </header>
            <nav style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
              <a href="${domain}/explore" style="color:#2563eb;font-weight:600;text-decoration:none;">Ke\u015Ffet</a> \xB7 
              <a href="${domain}/projects" style="color:#2563eb;font-weight:600;text-decoration:none;">Projeler</a> \xB7 
              <a href="${domain}/" style="color:#2563eb;font-weight:600;text-decoration:none;">Ana Sayfa</a>
            </nav>
          </main>
        `;
      } else if (cleanPath === "/" || cleanPath === "/home") {
        title = "Gen\xE7 Sosyal \u2014 Gen\xE7 \xDCretici Platformu";
        description = "Gen\xE7 \xFCreticilerin, yaz\u0131l\u0131mc\u0131lar\u0131n ve tasar\u0131mc\u0131lar\u0131n projelerini, topluluklar\u0131n\u0131 ve fikirlerini payla\u015Ft\u0131\u011F\u0131 yeni nesil sosyal platform.";
        let homeProjects = [];
        try {
          homeProjects = await db.select({
            id: projects.id,
            title: projects.title,
            category: projects.category
          }).from(projects).orderBy((0, import_drizzle_orm47.desc)(projects.createdAt)).limit(3);
        } catch (pErr) {
          console.warn("Could not fetch home projects for SEO:", pErr);
        }
        let homeCommunities = [];
        try {
          homeCommunities = await db.select({
            slug: communities.slug,
            name: communities.name
          }).from(communities).where((0, import_drizzle_orm47.and)((0, import_drizzle_orm47.isNull)(communities.deletedAt), (0, import_drizzle_orm47.eq)(communities.isPrivate, false))).limit(3);
        } catch (cErr) {
          console.warn("Could not fetch home communities for SEO:", cErr);
        }
        semanticBody = `
          <main style="max-width:800px;margin:40px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="text-align:center;margin-bottom:36px;">
              <h1 style="font-size:32px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;margin-bottom:12px;">Gen\xE7 Sosyal \u2014 Gen\xE7 \xDCretici Platformu</h1>
              <p style="font-size:18px;color:#475569;max-width:600px;margin:0 auto 20px auto;">Gen\xE7lerin projelerini, topluluklar\u0131n\u0131 ve \xFCretimlerini \xF6zg\xFCrce payla\u015Ft\u0131\u011F\u0131, a\xE7\u0131k kaynak ve teknoloji odakl\u0131 yeni nesil sosyal platform.</p>
              <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                <a href="${domain}/explore" style="padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">Ke\u015Ffetmeye Ba\u015Fla</a>
                <a href="${domain}/projects" style="padding:10px 20px;background:#f1f5f9;color:#0f172a;border-radius:12px;text-decoration:none;font-weight:700;">Projeleri G\xF6r</a>
              </div>
            </header>
            
            ${homeProjects.length > 0 ? `
              <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:24px;">
                <h2 style="font-size:20px;font-weight:700;margin-bottom:16px;">\xD6ne \xC7\u0131kan Projeler</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${homeProjects.map((hp) => `
                    <li style="padding:10px 0;">
                      <a href="${domain}/projects/${hp.id}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml2(hp.title)}</a>
                      <span style="color:#64748b;font-size:14px;margin-left:8px;">(${escapeHtml2(hp.category)})</span>
                    </li>
                  `).join("")}
                </ul>
              </section>
            ` : ""}

            ${homeCommunities.length > 0 ? `
              <section style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:24px;">
                <h2 style="font-size:20px;font-weight:700;margin-bottom:16px;">Pop\xFCler Topluluklar</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${homeCommunities.map((hc) => `
                    <li style="padding:10px 0;">
                      <a href="${domain}/communities/${encodeURIComponent(hc.slug)}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml2(hc.name)}</a>
                    </li>
                  `).join("")}
                </ul>
              </section>
            ` : ""}

            <footer style="margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0;display:flex;justify-content:center;gap:16px;font-size:14px;color:#64748b;flex-wrap:wrap;">
              <a href="${domain}/explore" style="color:#64748b;text-decoration:none;">Ke\u015Ffet</a>
              <a href="${domain}/projects" style="color:#64748b;text-decoration:none;">Projeler</a>
              <a href="${domain}/communities" style="color:#64748b;text-decoration:none;">Topluluklar</a>
              <a href="${domain}/sitemap" style="color:#64748b;text-decoration:none;">Site Haritas\u0131</a>
              <a href="${domain}/privacy" style="color:#64748b;text-decoration:none;">Gizlilik \u0130lkeleri</a>
              <a href="${domain}/terms" style="color:#64748b;text-decoration:none;">Kullan\u0131m \u015Eartlar\u0131</a>
            </footer>
          </main>
        `;
      } else if (cleanPath === "/teknofest" || cleanPath.startsWith("/teknofest/")) {
        const teknofestSlug = cleanPath.replace("/teknofest/", "").replace("/teknofest", "") || "2026";
        title = `TEKNOFEST ${teknofestSlug} K\xF6\u015Fesi \u2014 Foto\u011Fraf ve An\u0131 Ar\u015Fivi | Gen\xE7 Sosyal`;
        description = `TEKNOFEST ${teknofestSlug} etkinlik foto\u011Fraflar\u0131, gen\xE7 \xFCreticilerin projeleri, unutulmayan an\u0131lar\u0131 ve g\xFCn g\xFCn festival zaman t\xFCneli ar\u015Fivi.`;
        ogType = "event";
        jsonLd.push(
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": domain
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "TEKNOFEST K\xF6\u015Fesi",
                "item": `${domain}/teknofest`
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": `TEKNOFEST ${teknofestSlug}`,
            "description": `TEKNOFEST ${teknofestSlug} havac\u0131l\u0131k, uzay ve teknoloji festivali etkinlik ar\u015Fivi.`,
            "startDate": "2026-09-30T09:00:00+03:00",
            "endDate": "2026-10-04T19:00:00+03:00",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
              "@type": "Place",
              "name": "\u015Eanl\u0131urfa GAP Havaliman\u0131",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "\u015Eanl\u0131urfa",
                "addressCountry": "TR"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": "Gen\xE7 Sosyal",
              "url": domain
            }
          }
        );
        semanticBody = `
          <main style="max-width:800px;margin:40px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="text-align:center;margin-bottom:32px;">
              <h1 style="font-size:30px;font-weight:900;color:#0f172a;">TEKNOFEST K\xF6\u015Fesi \u2014 Bilim, Teknoloji ve Unutulmayan An\u0131lar</h1>
              <p style="font-size:17px;color:#475569;max-width:640px;margin:12px auto 24px auto;">Bir festival sona erdi, an\u0131lar\u0131n hik\xE2yesi devam ediyor. TEKNOFEST'te geride kalan foto\u011Fraflar\u0131, yar\u0131\u015Fma projelerini ve gen\xE7lerin an\u0131lar\u0131n\u0131 ke\u015Ffet.</p>
              <div style="display:flex;justify-content:center;gap:12px;">
                <a href="${domain}/teknofest" style="padding:12px 24px;background:#0284c7;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">Ar\u015Fivi Ke\u015Ffet</a>
              </div>
            </header>
            <section style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:24px;">
              <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">TEKNOFEST Ar\u015Fivinde Neler Var?</h2>
              <ul style="padding-left:20px;line-height:1.8;color:#334155;">
                <li>\u{1F4F8} <strong>Foto\u011Fraf Galerisi:</strong> Festival alan\u0131ndan, stantlardan ve u\xE7u\u015F g\xF6sterilerinden ger\xE7ek kareler.</li>
                <li>\u{1F680} <strong>Projeler:</strong> Gen\xE7 geli\u015Ftirici ve tak\u0131mlar\u0131n yar\u0131\u015Fma projeleri.</li>
                <li>\u{1F499} <strong>Gen\xE7lerin An\u0131lar\u0131:</strong> Kat\u0131l\u0131mc\u0131lar\u0131n ve yar\u0131\u015Fmac\u0131lar\u0131n unutulmaz deneyimleri.</li>
                <li>\u23F3 <strong>Zaman T\xFCneli:</strong> 30 Eyl\xFCl \u2013 4 Ekim g\xFCn g\xFCn festival ak\u0131\u015F\u0131.</li>
              </ul>
            </section>
            <footer style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:14px;">
              <a href="${domain}/" style="color:#2563eb;font-weight:600;text-decoration:none;">\u2190 Gen\xE7 Sosyal Ana Sayfa</a> \xB7 
              <a href="${domain}/projects" style="color:#2563eb;font-weight:600;text-decoration:none;">Projeler</a>
            </footer>
          </main>
        `;
      } else if (cleanPath === "/quiz") {
        title = "Gen\xE7 Quiz \u2014 Canl\u0131 \xC7ok Oyunculu Bilgi Yar\u0131\u015Fmas\u0131 | Gen\xE7 Sosyal";
        description = "Arkada\u015Flar\u0131nla veya toplulukla canl\u0131 bilgi yar\u0131\u015Fmas\u0131 odalar\u0131 kur, oda kodunu payla\u015F, d\xFCellolara kat\u0131l ve genel k\xFClt\xFCr\xFCn\xFC test et.";
        ogType = "game";
        jsonLd.push(
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": domain
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Gen\xE7 Quiz",
                "item": `${domain}/quiz`
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": "Gen\xE7 Quiz",
            "description": "Ger\xE7ek zamanl\u0131 interaktif bilgi yar\u0131\u015Fmas\u0131 oyunu ve canl\u0131 lobi sistemi.",
            "url": `${domain}/quiz`,
            "genre": ["Trivia", "Quiz", "Educational", "Multiplayer"],
            "gamePlatform": ["Web Browser", "Mobile Web"],
            "numberOfPlayers": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 100
            }
          }
        );
        semanticBody = `
          <main style="max-width:800px;margin:40px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="text-align:center;margin-bottom:32px;">
              <h1 style="font-size:30px;font-weight:900;color:#0f172a;">Gen\xE7 Quiz \u2014 Canl\u0131 \xC7ok Oyunculu Bilgi Yar\u0131\u015Fmas\u0131</h1>
              <p style="font-size:17px;color:#475569;max-width:640px;margin:12px auto 24px auto;">Arkada\u015Flar\u0131nla ayn\u0131 anda yar\u0131\u015Fabilece\u011Fin, oda kodu ile an\u0131nda kat\u0131l\u0131nabilen ger\xE7ek zamanl\u0131 bilgi yar\u0131\u015Fmas\u0131 arenas\u0131.</p>
              <div style="display:flex;justify-content:center;gap:12px;">
                <a href="${domain}/quiz" style="padding:12px 24px;background:#4f46e5;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">Hemen Yar\u0131\u015Fmaya Kat\u0131l</a>
              </div>
            </header>
            <section style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:24px;">
              <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Nas\u0131l Oynan\u0131r?</h2>
              <ol style="padding-left:20px;line-height:1.8;color:#334155;">
                <li>Oda kurucusundan ald\u0131\u011F\u0131n\u0131z 6 haneli oda kodunu girin.</li>
                <li>Lobi ekran\u0131nda di\u011Fer yar\u0131\u015Fmac\u0131larla bulu\u015Fun ve haz\u0131rlan\u0131n.</li>
                <li>Soru s\xFCresi dolmadan en h\u0131zl\u0131 ve do\u011Fru cevab\u0131 vererek puanlar\u0131 toplay\u0131n!</li>
              </ol>
            </section>
            <footer style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:14px;">
              <a href="${domain}/" style="color:#2563eb;font-weight:600;text-decoration:none;">\u2190 Gen\xE7 Sosyal Ana Sayfa</a> \xB7 
              <a href="${domain}/youth-league" style="color:#2563eb;font-weight:600;text-decoration:none;">19 May\u0131s Gen\xE7lik Ligi</a>
            </footer>
          </main>
        `;
      } else if (cleanPath === "/youth-league") {
        title = "19 May\u0131s Gen\xE7lik Ligi \u2014 1v1 Bilgi Arenas\u0131 | Gen\xE7 Sosyal";
        description = "19 May\u0131s Atat\xFCrk'\xFC Anma, Gen\xE7lik ve Spor Bayram\u0131 \u015Ferefine d\xFCzenlenen 1v1 d\xFCellolu, dinamik s\u0131ralamal\u0131 ve rozet \xF6d\xFCll\xFC bilgi ligi.";
        jsonLd.push(
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": domain
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "19 May\u0131s Gen\xE7lik Ligi",
                "item": `${domain}/youth-league`
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "19 May\u0131s Gen\xE7lik Ligi",
            "description": "Atat\xFCrk, Milli M\xFCcadele, Bilim & Sanat temal\u0131 1v1 d\xFCellolu lig yar\u0131\u015Fmas\u0131.",
            "startDate": "2026-05-01T00:00:00+03:00",
            "endDate": "2026-05-31T23:59:59+03:00",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
              "@type": "VirtualLocation",
              "url": `${domain}/youth-league`
            },
            "organizer": {
              "@type": "Organization",
              "name": "Gen\xE7 Sosyal",
              "url": domain
            }
          }
        );
        semanticBody = `
          <main style="max-width:800px;margin:40px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="text-align:center;margin-bottom:32px;">
              <h1 style="font-size:30px;font-weight:900;color:#dc2626;">19 May\u0131s Gen\xE7lik Ligi</h1>
              <p style="font-size:17px;color:#475569;max-width:640px;margin:12px auto 24px auto;">Milli M\xFCcadele ruhunu, cumhuriyet tarihini ve bilim k\xFClt\xFCr\xFCn\xFC ya\u015Fatan 1v1 d\xFCellolarla \u015Fampiyonluk yar\u0131\u015F\u0131na kat\u0131l\u0131n.</p>
              <div style="display:flex;justify-content:center;gap:12px;">
                <a href="${domain}/youth-league" style="padding:12px 24px;background:#dc2626;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">Lig D\xFCellosuna Ba\u015Fla</a>
                <a href="${domain}/youth-league/leaderboard" style="padding:12px 24px;background:#f1f5f9;color:#0f172a;border-radius:12px;text-decoration:none;font-weight:700;">Liderlik Tablosu</a>
              </div>
            </header>
            <footer style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:14px;">
              <a href="${domain}/" style="color:#2563eb;font-weight:600;text-decoration:none;">\u2190 Gen\xE7 Sosyal Ana Sayfa</a> \xB7 
              <a href="${domain}/quiz" style="color:#2563eb;font-weight:600;text-decoration:none;">Gen\xE7 Quiz</a>
            </footer>
          </main>
        `;
      } else if (cleanPath === "/youth-league/leaderboard") {
        title = "19 May\u0131s Gen\xE7lik Ligi Liderlik Tablosu | Gen\xE7 Sosyal";
        description = "Gen\xE7lik Ligi en y\xFCksek puanl\u0131 yar\u0131\u015Fmac\u0131lar\u0131, \u015Fampiyonlar s\u0131ralamas\u0131 ve kazan\u0131lan unvanlar.";
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Ana Sayfa",
              "item": domain
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "19 May\u0131s Gen\xE7lik Ligi",
              "item": `${domain}/youth-league`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Liderlik Tablosu",
              "item": `${domain}/youth-league/leaderboard`
            }
          ]
        });
      } else if (cleanPath === "/faq") {
        title = "S\u0131k\xE7a Sorulan Sorular (SSS) | Gen\xE7 Sosyal";
        description = "Gen\xE7 Sosyal platformu, projeler, topluluklar ve Gen\xE7 Quiz hakk\u0131nda en \xE7ok sorulan sorular\u0131n yan\u0131tlar\u0131.";
        jsonLd.push(
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": domain
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "S\u0131k\xE7a Sorulan Sorular",
                "item": `${domain}/faq`
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Gen\xE7 Sosyal nedir?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Gen\xE7 Sosyal, gen\xE7 yaz\u0131l\u0131mc\u0131, tasar\u0131mc\u0131 ve \xFCreticilerin projelerini sergiledi\u011Fi, topluluklar kurdu\u011Fu ve ger\xE7ek zamanl\u0131 quizlerle yar\u0131\u015Ft\u0131\u011F\u0131 sosyal platformdur."
                }
              },
              {
                "@type": "Question",
                "name": "Gen\xE7 Quiz nas\u0131l oynan\u0131r?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oda kodu girerek veya kendi odan\u0131z\u0131 olu\u015Fturarak arkada\u015Flar\u0131n\u0131zla \xE7ok oyunculu bilgi yar\u0131\u015Fmas\u0131 yapabilirsiniz."
                }
              },
              {
                "@type": "Question",
                "name": "Gen\xE7 Sosyal'e kat\u0131l\u0131m \xFCcretli mi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Hay\u0131r, Gen\xE7 Sosyal platformuna \xFCye olmak ve t\xFCm \xF6zellikleri kullanmak tamamen \xFCcretsizdir."
                }
              }
            ]
          }
        );
      } else if (cleanPath === "/about") {
        title = "Hakk\u0131m\u0131zda | Gen\xE7 Sosyal";
        description = "Gen\xE7 Sosyal'in kurulu\u015F amac\u0131, vizyonu ve gen\xE7 \xFCreticileri destekleyen a\xE7\u0131k kaynak misyonu.";
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Ana Sayfa",
              "item": domain
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Hakk\u0131m\u0131zda",
              "item": `${domain}/about`
            }
          ]
        });
      } else if (cleanPath === "/explore") {
        title = "Ke\u015Ffet \u2014 Trend Projeler ve Topluluklar | Gen\xE7 Sosyal";
        description = "Gen\xE7 Sosyal Ke\u015Ffet ile trend teknoloji projelerini, pop\xFCler yaz\u0131l\u0131m etiketlerini, aktif topluluklar\u0131 ve \xFCretken gen\xE7 geli\u015Ftiricileri an\u0131nda ke\u015Ffedin.";
        if (req.query.q) {
          shouldNoIndex = true;
          title = `"${escapeHtml2(String(req.query.q))}" i\xE7in Arama Sonu\xE7lar\u0131 | Gen\xE7 Sosyal`;
        }
      } else if (cleanPath === "/projects") {
        title = "Projeler \u2014 Gen\xE7 \xDCretici ve Yaz\u0131l\u0131m Projeleri | Gen\xE7 Sosyal";
        description = "Gen\xE7 yaz\u0131l\u0131mc\u0131, tasar\u0131mc\u0131 ve m\xFChendislerin geli\u015Ftirdi\u011Fi a\xE7\u0131k kaynak ve yenilik\xE7i projeleri inceleyin, geri bildirim verin ve ortakl\u0131k kurun.";
      } else if (cleanPath === "/communities") {
        title = "Topluluklar \u2014 Teknoloji ve \xDCretim Gruplar\u0131 | Gen\xE7 Sosyal";
        description = "Yaz\u0131l\u0131m, yapay zeka, tasar\u0131m, robotik ve giri\u015Fimcilik alan\u0131ndaki gen\xE7 topluluklara kat\u0131l\u0131n; etkinlikler d\xFCzenleyin ve birlikte \xFCretin.";
      } else if (cleanPath === "/privacy") {
        title = "Gizlilik \u0130lkeleri ve Veri G\xFCvenli\u011Fi | Gen\xE7 Sosyal";
        description = "Gen\xE7 Sosyal kullan\u0131c\u0131 gizlili\u011Fi, ki\u015Fisel verilerin korunmas\u0131 (KVKK) ve platform bilgi g\xFCvenli\u011Fi ilkeleri hakk\u0131nda detayl\u0131 bilgilendirme.";
      } else if (cleanPath === "/terms") {
        title = "Kullan\u0131m \u015Eartlar\u0131 ve Topluluk Kurallar\u0131 | Gen\xE7 Sosyal";
        description = "Gen\xE7 Sosyal platformu \xFCyelik s\xF6zle\u015Fmesi, kullan\u0131c\u0131 haklar\u0131, topluluk ilkeleri ve hizmet \u015Fartlar\u0131 hakk\u0131nda resmi bilgilendirme.";
      } else if (cleanPath === "/sitemap") {
        title = "Site Haritas\u0131 \u2014 T\xFCm Sayfalar ve Dizin | Gen\xE7 Sosyal";
        description = "Gen\xE7 Sosyal platformundaki t\xFCm a\xE7\u0131k projelere, topluluklara, quiz odalar\u0131na ve bilgi sayfalar\u0131na h\u0131zl\u0131 ve kolay eri\u015Fim dizini.";
        semanticBody = `
          <main style="max-width:800px;margin:40px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="margin-bottom:28px;">
              <h1 style="font-size:28px;font-weight:800;">Gen\xE7 Sosyal Site Haritas\u0131</h1>
              <p style="color:#64748b;">Gen\xE7 \xFCreticilerin a\xE7\u0131k i\xE7eriklerine ve b\xF6l\xFCmlerine h\u0131zl\u0131 dizin.</p>
            </header>
            <nav style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;">
              <div>
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Ana Sayfalar</h2>
                <ul style="list-style:none;padding:0;margin:0;line-height:2;">
                  <li><a href="${domain}/" style="color:#2563eb;text-decoration:none;">Ana Sayfa</a></li>
                  <li><a href="${domain}/explore" style="color:#2563eb;text-decoration:none;">Ke\u015Ffet</a></li>
                  <li><a href="${domain}/projects" style="color:#2563eb;text-decoration:none;">Projeler</a></li>
                  <li><a href="${domain}/communities" style="color:#2563eb;text-decoration:none;">Topluluklar</a></li>
                  <li><a href="${domain}/sitemap.xml" style="color:#2563eb;text-decoration:none;">XML Sitemap</a></li>
                </ul>
              </div>
              <div>
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Yasal & G\xFCvenlik</h2>
                <ul style="list-style:none;padding:0;margin:0;line-height:2;">
                  <li><a href="${domain}/privacy" style="color:#2563eb;text-decoration:none;">Gizlilik \u0130lkeleri</a></li>
                  <li><a href="${domain}/terms" style="color:#2563eb;text-decoration:none;">Kullan\u0131m \u015Eartlar\u0131</a></li>
                </ul>
              </div>
            </nav>
          </main>
        `;
      }
      const privateRoutes = [
        "/messages",
        "/settings",
        "/admin",
        "/notifications",
        "/bookmarks",
        "/onboarding",
        "/create",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/account-suspended",
        "/support"
      ];
      if (privateRoutes.some((r) => cleanPath.startsWith(r))) {
        shouldNoIndex = true;
      }
      const safeTitle = escapeHtml2(title);
      const safeDescription = escapeHtml2(description);
      const safeKeywords = escapeHtml2(keywords);
      const safeImageUrl = escapeHtml2(imageUrl);
      const safeCanonicalUrl = escapeHtml2(canonicalUrl);
      const robotsContent = shouldNoIndex ? "noindex, nofollow" : "index, follow";
      const headMetadata = `
      <title>${safeTitle}</title>
      <meta name="description" content="${safeDescription}" />
      <meta name="keywords" content="${safeKeywords}" />
      <meta name="robots" content="${robotsContent}" />
      <link rel="canonical" href="${safeCanonicalUrl}" />
      <meta property="og:type" content="${ogType}" />
      <meta property="og:url" content="${safeCanonicalUrl}" />
      <meta property="og:title" content="${safeTitle}" />
      <meta property="og:description" content="${safeDescription}" />
      <meta property="og:image" content="${safeImageUrl}" />
      <meta property="og:site_name" content="Gen\xE7 Sosyal" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="${safeCanonicalUrl}" />
      <meta property="twitter:title" content="${safeTitle}" />
      <meta property="twitter:description" content="${safeDescription}" />
      <meta property="twitter:image" content="${safeImageUrl}" />
      <script type="application/ld+json">
        ${JSON.stringify(jsonLd)}
      </script>
      `;
      let finalHtml = template;
      finalHtml = finalHtml.replace(/<title>.*?<\/title>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="keywords"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="robots"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+property="og:.*?"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+property="twitter:.*?"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
      finalHtml = finalHtml.replace("</head>", `${headMetadata}</head>`);
      if (semanticBody) {
        finalHtml = finalHtml.replace(
          '<div id="root">',
          `<div id="root">${semanticBody}`
        );
      }
      if (vite) {
        try {
          finalHtml = await vite.transformIndexHtml(req.originalUrl, finalHtml);
        } catch (vErr) {
          console.error("Vite transformIndexHtml error:", vErr);
        }
      }
      const statusCode = isNotFound ? 404 : 200;
      res.status(statusCode).send(finalHtml);
    } catch (error) {
      console.error("SEO Middleware error:", error);
      res.status(200).send(template);
    }
  };
}
var import_fs7, import_path8, import_drizzle_orm47, indexHtmlCache;
var init_seo = __esm({
  "server/middleware/seo.ts"() {
    "use strict";
    import_fs7 = __toESM(require("fs"), 1);
    import_path8 = __toESM(require("path"), 1);
    init_db();
    init_schema();
    import_drizzle_orm47 = require("drizzle-orm");
    indexHtmlCache = "";
  }
});

// server/services/quizWebSocket.ts
var quizWebSocket_exports = {};
__export(quizWebSocket_exports, {
  setupQuizWebSocketServer: () => setupQuizWebSocketServer
});
function setupQuizWebSocketServer(httpServer) {
  const wss = new import_ws2.WebSocketServer({ noServer: true });
  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    if (url.pathname === "/api/v1/quiz/ws" || url.pathname === "/ws/quiz") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.isAlive === false) {
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, 3e4);
  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });
  wss.on("connection", (ws, req) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    try {
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const token = url.searchParams.get("token");
      if (token && token !== "null" && token !== "undefined") {
        try {
          const decoded = verifyAccessToken(token);
          if (decoded?.userId) {
            ws.userId = decoded.userId;
            ws.username = decoded.username || "";
          }
        } catch {
        }
      }
      if (!ws.userId && req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)refreshToken=([^;]+)/);
        if (match && match[1]) {
          try {
            const refDecoded = verifyRefreshToken(decodeURIComponent(match[1]));
            if (refDecoded?.userId) {
              ws.userId = refDecoded.userId;
              ws.username = refDecoded.username || "";
            }
          } catch {
          }
        }
      }
    } catch (e) {
    }
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { event, payload } = message;
        switch (event) {
          case "PING": {
            ws.send(JSON.stringify({ event: "PONG", timestamp: Date.now() }));
            break;
          }
          case "AUTH": {
            if (payload?.token && payload.token !== "null" && payload.token !== "undefined") {
              try {
                const decoded = verifyAccessToken(payload.token);
                if (decoded?.userId) {
                  ws.userId = decoded.userId;
                  ws.username = decoded.username || "";
                  ws.send(JSON.stringify({ event: "AUTH_SUCCESS", data: { userId: decoded.userId } }));
                } else {
                  ws.send(JSON.stringify({ event: "ERROR", data: { message: "Yetkisiz token." } }));
                }
              } catch {
                ws.send(JSON.stringify({ event: "ERROR", data: { message: "Oturum s\xFCreniz sona erdi. L\xFCtfen sayfay\u0131 yenileyin." } }));
              }
            }
            break;
          }
          case "JOIN_ROOM": {
            const { roomCode, token } = payload || {};
            let userId = ws.userId;
            let username = ws.username;
            if (!userId && token && token !== "null" && token !== "undefined") {
              try {
                const decoded = verifyAccessToken(token);
                if (decoded?.userId) {
                  userId = decoded.userId;
                  username = decoded.username || "";
                  ws.userId = userId;
                  ws.username = username;
                }
              } catch {
              }
            }
            if (!userId) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Odaya kat\u0131lmak i\xE7in giri\u015F yapmal\u0131s\u0131n\u0131z." } }));
              return;
            }
            if (!roomCode) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Ge\xE7ersiz oda kodu." } }));
              return;
            }
            const cleanCode = roomCode.toString().trim().toUpperCase();
            let room = await getOrRehydrateRoom(cleanCode);
            if (!room) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Bu kodla aktif bir quiz odas\u0131 bulunamad\u0131." } }));
              return;
            }
            if (room.status === "FINISHED" || room.status === "CANCELLED") {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Bu quiz sona ermi\u015Ftir." } }));
              return;
            }
            if (room.players.size >= room.maxPlayers && !room.players.has(userId)) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Bu quiz odas\u0131 tamamen dolu." } }));
              return;
            }
            const [userProfile] = await db.select({ avatarUrl: profiles.avatarUrl, username: users.username }).from(users).leftJoin(profiles, (0, import_drizzle_orm48.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm48.eq)(users.id, userId)).limit(1);
            const userAvatar = userProfile?.avatarUrl || null;
            const finalUsername = userProfile?.username || username || `Oyuncu_${userId}`;
            ws.username = finalUsername;
            ws.avatarUrl = userAvatar;
            ws.roomCode = cleanCode;
            let player = room.players.get(userId);
            if (player) {
              player.ws = ws;
              player.isConnected = true;
              player.lastActiveAt = Date.now();
            } else {
              const isHost = room.hostId === userId;
              player = {
                userId,
                username: finalUsername,
                avatarUrl: userAvatar,
                ws,
                score: 0,
                correctAnswersCount: 0,
                wrongAnswersCount: 0,
                unansweredCount: 0,
                streak: 0,
                maxStreak: 0,
                rank: room.players.size + 1,
                isHost,
                isConnected: true,
                hasAnsweredCurrent: false,
                lastActiveAt: Date.now()
              };
              room.players.set(userId, player);
              await db.insert(quizRoomPlayers).values({
                roomId: room.id,
                userId,
                score: 0,
                isHost,
                isConnected: true
              }).onConflictDoNothing();
            }
            room.lastActiveAt = Date.now();
            const currentQ = room.questions[room.currentQuestionIndex];
            const sanitizedQ = room.status === "QUESTION_ACTIVE" && currentQ ? sanitizeQuestionForClients(currentQ, room.currentQuestionIndex, room.questions.length, room.timePerQuestion) : null;
            const roomData = {
              id: room.id,
              roomId: room.id,
              code: room.code,
              title: room.title,
              hostId: room.hostId,
              category: room.category,
              difficulty: room.difficulty,
              questionCount: room.questionCount || room.questions.length,
              timePerQuestion: room.timePerQuestion,
              totalQuestions: room.questions.length,
              status: room.status,
              currentQuestionIndex: room.currentQuestionIndex,
              currentQuestion: sanitizedQ,
              isHost: room.hostId === userId
            };
            const playersList = updateRoomLeaderboard(room);
            ws.send(JSON.stringify({
              event: "ROOM_STATE",
              data: {
                room: roomData,
                players: playersList,
                ...roomData
              },
              timestamp: Date.now()
            }));
            broadcastToRoom(room, "PLAYER_JOINED", {
              player: {
                userId,
                username: finalUsername,
                avatarUrl: userAvatar,
                score: player.score,
                isHost: player.isHost,
                rank: player.rank,
                isConnected: true
              },
              totalPlayers: room.players.size,
              leaderboard: playersList,
              players: playersList
            });
            break;
          }
          case "START_QUIZ": {
            if (!ws.userId || !ws.roomCode) return;
            const room = activeRoomsByCode.get(ws.roomCode);
            if (!room) return;
            if (room.hostId !== ws.userId) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Yaln\u0131zca oda kurucusu quiz'i ba\u015Flatabilir." } }));
              return;
            }
            if (room.status !== "LOBBY") {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Quiz zaten ba\u015Flat\u0131ld\u0131." } }));
              return;
            }
            if (room.questions.length === 0) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Soru havuzunda soru bulunamad\u0131." } }));
              return;
            }
            room.status = "PLAYING";
            room.currentQuestionIndex = -1;
            room.lastActiveAt = Date.now();
            await db.update(quizRooms).set({
              status: "PLAYING",
              startedAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm48.eq)(quizRooms.id, room.id));
            broadcastToRoom(room, "QUIZ_STARTED", {
              title: room.title,
              totalQuestions: room.questions.length,
              timePerQuestion: room.timePerQuestion
            });
            setTimeout(() => {
              advanceRoomQuestion(room).catch(console.error);
            }, 3e3);
            break;
          }
          case "SUBMIT_ANSWER": {
            if (!ws.userId || !ws.roomCode) return;
            const room = activeRoomsByCode.get(ws.roomCode);
            if (!room) return;
            const { optionKey, timeTakenMs } = payload || {};
            if (!optionKey) return;
            await submitPlayerAnswer(room, ws.userId, optionKey, timeTakenMs || 0);
            break;
          }
          case "KICK_PLAYER": {
            if (!ws.userId || !ws.roomCode) return;
            const room = activeRoomsByCode.get(ws.roomCode);
            if (!room || room.hostId !== ws.userId) return;
            const targetUserId = parseInt(payload?.targetUserId);
            if (!targetUserId || targetUserId === ws.userId) return;
            const targetPlayer = room.players.get(targetUserId);
            if (targetPlayer) {
              if (targetPlayer.ws && targetPlayer.ws.readyState === import_ws2.WebSocket.OPEN) {
                targetPlayer.ws.send(JSON.stringify({
                  event: "PLAYER_KICKED",
                  data: { message: "Oda kurucusu taraf\u0131ndan odadan \xE7\u0131kar\u0131ld\u0131n\u0131z." }
                }));
                targetPlayer.ws.close();
              }
              room.players.delete(targetUserId);
              await db.delete(quizRoomPlayers).where((0, import_drizzle_orm48.and)((0, import_drizzle_orm48.eq)(quizRoomPlayers.roomId, room.id), (0, import_drizzle_orm48.eq)(quizRoomPlayers.userId, targetUserId)));
              broadcastToRoom(room, "PLAYER_LEFT", {
                userId: targetUserId,
                username: targetPlayer.username,
                totalPlayers: room.players.size,
                leaderboard: updateRoomLeaderboard(room)
              });
            }
            break;
          }
          case "LOBBY_REACTION": {
            if (!ws.userId || !ws.roomCode) return;
            const room = activeRoomsByCode.get(ws.roomCode);
            if (!room) return;
            const emoji = payload?.emoji || "\u{1F525}";
            broadcastToRoom(room, "LOBBY_REACTION", {
              userId: ws.userId,
              username: ws.username || "Oyuncu",
              emoji,
              id: `${Date.now()}_${Math.random()}`
            });
            break;
          }
          case "LEAVE_ROOM": {
            handlePlayerLeave(ws);
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error("WebSocket message handling error:", err);
      }
    });
    ws.on("close", () => {
      handlePlayerLeave(ws, true);
    });
    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      handlePlayerLeave(ws, true);
    });
  });
  return wss;
}
function handlePlayerLeave(ws, isDisconnect = false) {
  if (!ws.userId || !ws.roomCode) return;
  const room = activeRoomsByCode.get(ws.roomCode);
  if (!room) return;
  const player = room.players.get(ws.userId);
  if (!player) return;
  if (isDisconnect && (room.status === "QUESTION_ACTIVE" || room.status === "PLAYING")) {
    player.isConnected = false;
    player.ws = null;
    broadcastToRoom(room, "PLAYER_DISCONNECTED", {
      userId: ws.userId,
      username: player.username,
      leaderboard: updateRoomLeaderboard(room)
    });
    return;
  }
  room.players.delete(ws.userId);
  if (room.hostId === ws.userId) {
    if (room.players.size > 0) {
      const nextPlayer = room.players.values().next().value;
      if (nextPlayer) {
        room.hostId = nextPlayer.userId;
        nextPlayer.isHost = true;
        db.update(quizRooms).set({ hostId: nextPlayer.userId, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm48.eq)(quizRooms.id, room.id)).catch(console.error);
        broadcastToRoom(room, "HOST_CHANGED", {
          newHostId: nextPlayer.userId,
          newHostUsername: nextPlayer.username
        });
      }
    } else {
      room.status = "CANCELLED";
      if (room.questionTimer) clearTimeout(room.questionTimer);
      activeRoomsByCode.delete(room.code);
      activeRoomsById.delete(room.id);
      db.update(quizRooms).set({ status: "CANCELLED", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm48.eq)(quizRooms.id, room.id)).catch(console.error);
      return;
    }
  }
  broadcastToRoom(room, "PLAYER_LEFT", {
    userId: ws.userId,
    username: player.username,
    totalPlayers: room.players.size,
    leaderboard: updateRoomLeaderboard(room)
  });
}
var import_ws2, import_drizzle_orm48;
var init_quizWebSocket = __esm({
  "server/services/quizWebSocket.ts"() {
    "use strict";
    import_ws2 = require("ws");
    init_jwt();
    init_db();
    init_schema();
    import_drizzle_orm48 = require("drizzle-orm");
    init_quizEngine();
  }
});

// server.ts
init_uploadConfig();

// server/routes/onboarding.ts
var import_express = require("express");
init_auth();
init_db();
init_schema();
var import_drizzle_orm5 = require("drizzle-orm");
init_suggestions();
var onboardingRouter = (0, import_express.Router)();
onboardingRouter.get("/progress", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const followCountResult = await db.select({ count: import_drizzle_orm5.sql`count(*)::int` }).from(follows).where((0, import_drizzle_orm5.eq)(follows.followerId, currentUserId));
    const followCount = followCountResult[0]?.count || 0;
    const postCountResult = await db.select({ count: import_drizzle_orm5.sql`count(*)::int` }).from(posts).where((0, import_drizzle_orm5.eq)(posts.userId, currentUserId));
    const hasPost = (postCountResult[0]?.count || 0) > 0;
    const projectCountResult = await db.select({ count: import_drizzle_orm5.sql`count(*)::int` }).from(projects).where((0, import_drizzle_orm5.eq)(projects.userId, currentUserId));
    const hasProject = (projectCountResult[0]?.count || 0) > 0;
    const profileResult = await db.select({ onboardingCompleted: profiles.onboardingCompleted }).from(profiles).where((0, import_drizzle_orm5.eq)(profiles.userId, currentUserId));
    res.json({
      success: true,
      data: {
        followCount,
        hasPost,
        hasProject,
        isCompleted: profileResult[0]?.onboardingCompleted || false
      }
    });
  } catch (error) {
    console.error("Onboarding progress error:", error);
    res.status(500).json({ success: false, error: { message: "Error fetching progress" } });
  }
});
onboardingRouter.post("/complete", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    await db.update(profiles).set({ onboardingCompleted: true }).where((0, import_drizzle_orm5.eq)(profiles.userId, currentUserId));
    res.json({ success: true, data: { completed: true } });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    res.status(500).json({ success: false, error: { message: "Error completing onboarding" } });
  }
});
onboardingRouter.get("/suggested-users", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const result = await getFollowSuggestions(currentUserId, { limit: 10 });
    res.json({
      success: true,
      data: result.users
    });
  } catch (error) {
    console.error("Onboarding suggestions error:", error);
    res.status(500).json({ success: false, error: { message: "Error fetching suggestions" } });
  }
});

// server.ts
var import_express36 = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path9 = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_vite = require("vite");

// server/routes/gamification.ts
var import_express2 = require("express");
init_db();
init_schema();
var import_drizzle_orm6 = require("drizzle-orm");
init_auth();
var gamificationRouter = (0, import_express2.Router)();
var getStartOfWeek = () => {
  const d = /* @__PURE__ */ new Date();
  const day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};
var getEndOfWeek = (start) => {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};
gamificationRouter.get("/leaderboard", async (req, res) => {
  try {
    const weekStart = getStartOfWeek();
    const weekEnd = getEndOfWeek(weekStart);
    const recentPosts = await db.select({ userId: posts.userId, count: import_drizzle_orm6.sql`count(*)::int` }).from(posts).where((0, import_drizzle_orm6.gte)(posts.createdAt, weekStart)).groupBy(posts.userId);
    const recentProjects = await db.select({ userId: projects.userId, count: import_drizzle_orm6.sql`count(*)::int` }).from(projects).where((0, import_drizzle_orm6.gte)(projects.createdAt, weekStart)).groupBy(projects.userId);
    const recentComments = await db.select({ userId: comments.userId, count: import_drizzle_orm6.sql`count(*)::int` }).from(comments).where((0, import_drizzle_orm6.gte)(comments.createdAt, weekStart)).groupBy(comments.userId);
    const scoresMap = /* @__PURE__ */ new Map();
    const addToMap = (userId, type, count) => {
      if (!scoresMap.has(userId)) scoresMap.set(userId, { production: 0, community: 0, total: 0 });
      const current = scoresMap.get(userId);
      if (type === "post") current.production += count * 10;
      if (type === "project") current.production += count * 50;
      if (type === "comment") current.community += count * 5;
      current.total = current.production + current.community;
    };
    recentPosts.forEach((p) => addToMap(p.userId, "post", p.count));
    recentProjects.forEach((p) => addToMap(p.userId, "project", p.count));
    recentComments.forEach((p) => addToMap(p.userId, "comment", p.count));
    if (scoresMap.size === 0) {
      const allPosts = await db.select({ userId: posts.userId, count: import_drizzle_orm6.sql`count(*)::int` }).from(posts).groupBy(posts.userId);
      const allProjects = await db.select({ userId: projects.userId, count: import_drizzle_orm6.sql`count(*)::int` }).from(projects).groupBy(projects.userId);
      const allComments = await db.select({ userId: comments.userId, count: import_drizzle_orm6.sql`count(*)::int` }).from(comments).groupBy(comments.userId);
      allPosts.forEach((p) => addToMap(p.userId, "post", p.count));
      allProjects.forEach((p) => addToMap(p.userId, "project", p.count));
      allComments.forEach((p) => addToMap(p.userId, "comment", p.count));
    }
    const sorted = Array.from(scoresMap.entries()).map(([userId, scores]) => ({ userId, ...scores })).sort((a, b) => b.total - a.total);
    const top = sorted.slice(0, 50);
    for (let i = 0; i < top.length; i++) {
      const u = top[i];
      await db.insert(weeklyLeaderboards).values({
        userId: u.userId,
        weekStart,
        weekEnd,
        rank: i + 1,
        score: u.total,
        productionScore: u.production,
        communityScore: u.community,
        qualityScore: 0
      }).onConflictDoUpdate({
        target: [weeklyLeaderboards.userId, weeklyLeaderboards.weekStart],
        set: {
          rank: i + 1,
          score: u.total,
          productionScore: u.production,
          communityScore: u.community
        }
      });
    }
    const leaderboard = await db.select({
      rank: weeklyLeaderboards.rank,
      score: weeklyLeaderboards.score,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: users.isVerified
      }
    }).from(weeklyLeaderboards).innerJoin(users, (0, import_drizzle_orm6.eq)(weeklyLeaderboards.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm6.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm6.eq)(weeklyLeaderboards.weekStart, weekStart)).orderBy(weeklyLeaderboards.rank).limit(10);
    let myRank = null;
    let currentUserId = optionalAuthContext(req);
    if (currentUserId) {
      const myRecord = await db.select().from(weeklyLeaderboards).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(weeklyLeaderboards.userId, currentUserId), (0, import_drizzle_orm6.eq)(weeklyLeaderboards.weekStart, weekStart))).limit(1);
      if (myRecord.length > 0) {
        myRank = { rank: myRecord[0].rank, score: myRecord[0].score };
      }
    }
    res.json({ success: true, data: { leaderboard, myRank, weekStart, weekEnd } });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});
gamificationRouter.get("/badges/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ success: false });
    const userBadgeList = await db.select({
      id: userBadges.id,
      awardedAt: userBadges.awardedAt,
      badge: {
        id: badges.id,
        key: badges.key,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl
      }
    }).from(userBadges).innerJoin(badges, (0, import_drizzle_orm6.eq)(userBadges.badgeId, badges.id)).where((0, import_drizzle_orm6.eq)(userBadges.userId, userId)).orderBy((0, import_drizzle_orm6.desc)(userBadges.awardedAt));
    res.json({ success: true, data: userBadgeList });
  } catch (error) {
    console.error("Badges fetch error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});
gamificationRouter.get("/daily-quest", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split("T")[0];
    const claimKey = `DAILY_QUEST_${dateStr}`;
    let claimed = false;
    const badgeCheck = await db.select().from(badges).where((0, import_drizzle_orm6.eq)(badges.key, claimKey)).limit(1);
    if (badgeCheck.length > 0) {
      const uBadge = await db.select().from(userBadges).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(userBadges.userId, currentUserId), (0, import_drizzle_orm6.eq)(userBadges.badgeId, badgeCheck[0].id))).limit(1);
      if (uBadge.length > 0) claimed = true;
    }
    const recentComments = await db.select({ count: import_drizzle_orm6.sql`count(*)::int` }).from(comments).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(comments.userId, currentUserId), (0, import_drizzle_orm6.gte)(comments.createdAt, today)));
    const progress = recentComments[0]?.count || 0;
    const total = 3;
    res.json({ success: true, data: {
      questId: claimKey,
      title: "G\xFCn\xFCn G\xF6revi",
      description: "Bug\xFCn 3 farkl\u0131 g\xF6nderiye yorum yap ve sohbete kat\u0131l.",
      rewardXP: 50,
      progress,
      total,
      claimed,
      isComplete: progress >= total
    } });
  } catch (error) {
    console.error("Daily quest fetch error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});
gamificationRouter.post("/daily-quest/claim", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split("T")[0];
    const claimKey = `DAILY_QUEST_${dateStr}`;
    let bId = -1;
    const existingBadge = await db.select().from(badges).where((0, import_drizzle_orm6.eq)(badges.key, claimKey)).limit(1);
    if (existingBadge.length === 0) {
      const resBadge = await db.insert(badges).values({
        key: claimKey,
        name: "G\xFCnl\xFCk G\xF6rev: " + dateStr,
        description: "G\xFCnl\xFCk g\xF6rev tamamland\u0131",
        iconUrl: "Target"
      }).returning({ id: badges.id });
      bId = resBadge[0].id;
    } else {
      bId = existingBadge[0].id;
    }
    const uBadge = await db.select().from(userBadges).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(userBadges.userId, currentUserId), (0, import_drizzle_orm6.eq)(userBadges.badgeId, bId))).limit(1);
    if (uBadge.length > 0) {
      return res.status(400).json({ success: false, error: { message: "Already claimed" } });
    }
    await db.insert(userBadges).values({
      userId: currentUserId,
      badgeId: bId,
      metadata: { type: "daily_quest", date: dateStr }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Daily quest claim error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});

// server.ts
if (process.env.NODE_ENV !== "production") {
  import("dotenv").then((dotenv) => dotenv.config());
}
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const app = (0, import_express36.default)();
  app.set("trust proxy", 1);
  const PORT = Number(process.env.PORT) || 3e3;
  app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
  if (isProd) {
    app.use((req, res, next) => {
      next();
    });
  }
  app.use((0, import_helmet.default)({
    contentSecurityPolicy: isProd ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "wss:", process.env.FRONTEND_URL || "http://localhost:3000"],
        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:"],
        frameSrc: ["'none'"]
      }
    } : false,
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536e3,
      includeSubDomains: true,
      preload: true
    }
  }));
  const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000").split(",");
  app.use((0, import_cors.default)({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }));
  app.use(import_express36.default.json());
  app.use(import_express36.default.urlencoded({ extended: true }));
  app.use((0, import_cookie_parser.default)());
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        const rawIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
        const maskedIp = rawIp.replace(/\.\d+$/, ".xxx");
        console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms) [${maskedIp}]`);
      });
    }
    next();
  });
  ensureUploadDir();
  app.use("/uploads", import_express36.default.static(getUploadDir(), { dotfiles: "deny" }));
  try {
    const { ensureDatabaseReady: ensureDatabaseReady2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    await ensureDatabaseReady2();
    const { runMigration: runMigration2 } = await Promise.resolve().then(() => (init_migrate(), migrate_exports));
    await runMigration2(false);
    const { seedInitialDataIfNeeded: seedInitialDataIfNeeded2 } = await Promise.resolve().then(() => (init_seed(), seed_exports));
    await seedInitialDataIfNeeded2();
    try {
      const {
        ensureCurrentSeason: ensureCurrentSeason2,
        checkAndRunSeasonTransitions: checkAndRunSeasonTransitions2,
        seedStarterQuestionsIfNeeded: seedStarterQuestionsIfNeeded2,
        ensureLeagueBadges: ensureLeagueBadges2
      } = await Promise.resolve().then(() => (init_leagueAutomation(), leagueAutomation_exports));
      await ensureCurrentSeason2();
      await ensureLeagueBadges2();
      await seedStarterQuestionsIfNeeded2();
      await checkAndRunSeasonTransitions2();
      setInterval(() => {
        checkAndRunSeasonTransitions2().catch(console.error);
      }, 60 * 60 * 1e3);
    } catch (leagueInitErr) {
      console.error("League startup initialization failed:", leagueInitErr);
    }
  } catch (migErr) {
    console.error("Database migration/seed check failed on startup:", migErr);
  }
  app.use((req, res, next) => {
    if (req.method === "GET" && req.path.length > 1 && req.path.endsWith("/") && !req.path.startsWith("/api/")) {
      const query = req.url.slice(req.path.length);
      const safePath = req.path.slice(0, -1);
      return res.redirect(301, safePath + query);
    }
    next();
  });
  app.get("/hashtag/:name", (req, res) => {
    return res.redirect(301, `/hashtags/${encodeURIComponent(req.params.name)}`);
  });
  const { healthRouter: healthRouter2 } = await Promise.resolve().then(() => (init_health(), health_exports));
  app.use("/api/v1/health", healthRouter2);
  app.use("/api/health", healthRouter2);
  const { robotsRouter: robotsRouter2 } = await Promise.resolve().then(() => (init_robots(), robots_exports));
  app.use("/", robotsRouter2);
  const { sitemapRouter: sitemapRouter2 } = await Promise.resolve().then(() => (init_sitemap(), sitemap_exports));
  app.use("/", sitemapRouter2);
  const { projectsRouter: projectsRouter2 } = await Promise.resolve().then(() => (init_projects(), projects_exports));
  app.use("/api/v1/projects", projectsRouter2);
  const { authRouter: authRouter2 } = await Promise.resolve().then(() => (init_auth3(), auth_exports));
  app.use("/api/v1/auth", authRouter2);
  const { usersRouter: usersRouter2 } = await Promise.resolve().then(() => (init_users(), users_exports));
  app.use("/api/v1/users", usersRouter2);
  const { postsRouter: postsRouter2 } = await Promise.resolve().then(() => (init_posts(), posts_exports));
  app.use("/api/v1/posts", postsRouter2);
  const { feedRouter: feedRouter2 } = await Promise.resolve().then(() => (init_feed(), feed_exports));
  app.use("/api/v1/feed", feedRouter2);
  const { userPostsRouter: userPostsRouter2 } = await Promise.resolve().then(() => (init_userPosts(), userPosts_exports));
  app.use("/api/v1/users", userPostsRouter2);
  const { followsRouter: followsRouter2 } = await Promise.resolve().then(() => (init_follows(), follows_exports));
  app.use("/api/v1/users", followsRouter2);
  const { bookmarksRouter: bookmarksRouter2 } = await Promise.resolve().then(() => (init_bookmarks(), bookmarks_exports));
  app.use("/api/v1/bookmarks", bookmarksRouter2);
  const { searchRouter: searchRouter2 } = await Promise.resolve().then(() => (init_search(), search_exports));
  app.use("/api/v1/search", searchRouter2);
  const { notificationsRouter: notificationsRouter2 } = await Promise.resolve().then(() => (init_notifications2(), notifications_exports2));
  app.use("/api/v1/notifications", notificationsRouter2);
  const { blocksRouter: blocksRouter2 } = await Promise.resolve().then(() => (init_blocks2(), blocks_exports));
  app.use("/api/v1/users", blocksRouter2);
  const { mediaRouter: mediaRouter2 } = await Promise.resolve().then(() => (init_media(), media_exports));
  app.use("/api/v1/media", mediaRouter2);
  const { storiesRouter: storiesRouter2 } = await Promise.resolve().then(() => (init_stories(), stories_exports));
  app.use("/api/v1/stories", storiesRouter2);
  const { announcementsRouter: announcementsRouter2 } = await Promise.resolve().then(() => (init_announcements(), announcements_exports));
  app.use("/api/v1/announcements", announcementsRouter2);
  const { messagesRouter: messagesRouter2 } = await Promise.resolve().then(() => (init_messages(), messages_exports));
  app.use("/api/v1/messages", messagesRouter2);
  const { communitiesRouter: communitiesRouter2 } = await Promise.resolve().then(() => (init_communities(), communities_exports));
  app.use("/api/v1/communities", communitiesRouter2);
  const { reactionsRouter: reactionsRouter2 } = await Promise.resolve().then(() => (init_reactions(), reactions_exports));
  app.use("/api/v1/posts", reactionsRouter2);
  const { commentsRouter: commentsRouter2 } = await Promise.resolve().then(() => (init_comments(), comments_exports));
  app.use("/api/v1/posts", commentsRouter2);
  const { reportsRouter: reportsRouter2 } = await Promise.resolve().then(() => (init_reports(), reports_exports));
  app.use("/api/v1/reports", reportsRouter2);
  const { adminRouter: adminRouter2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
  const { verificationRouter: verificationRouter2 } = await Promise.resolve().then(() => (init_verification(), verification_exports));
  const { hashtagsRouter: hashtagsRouter2 } = await Promise.resolve().then(() => (init_hashtags2(), hashtags_exports));
  const { collaboratorsRouter: collaboratorsRouter2 } = await Promise.resolve().then(() => (init_collaborators(), collaborators_exports));
  app.use("/api/v1/admin", adminRouter2);
  app.use("/api/v1/verification", verificationRouter2);
  app.use("/api/v1/hashtags", hashtagsRouter2);
  app.use("/api/v1/collaborators", collaboratorsRouter2);
  app.use("/api/v1/onboarding", onboardingRouter);
  app.use("/api/v1/gamification", gamificationRouter);
  const { supportRouter: supportRouter2 } = await Promise.resolve().then(() => (init_support(), support_exports));
  app.use("/api/v1/support", supportRouter2);
  const { feedbacksRouter: feedbacksRouter2 } = await Promise.resolve().then(() => (init_feedbacks(), feedbacks_exports));
  app.use("/api/v1/feedbacks", feedbacksRouter2);
  const { appealsRouter: appealsRouter2 } = await Promise.resolve().then(() => (init_appeals(), appeals_exports));
  app.use("/api/v1/appeals", appealsRouter2);
  const { leagueRouter: leagueRouter2 } = await Promise.resolve().then(() => (init_league(), league_exports));
  app.use("/api/v1/league", leagueRouter2);
  const { quizRouter: quizRouter2 } = await Promise.resolve().then(() => (init_quiz(), quiz_exports));
  app.use("/api/v1/quiz", quizRouter2);
  const { teknofestRouter: teknofestRouter2 } = await Promise.resolve().then(() => (init_teknofest(), teknofest_exports));
  app.use("/api/v1/teknofest", teknofestRouter2);
  const { childSafetyRouter: childSafetyRouter2 } = await Promise.resolve().then(() => (init_childSafety2(), childSafety_exports));
  app.use("/api/v1/child-safety", childSafetyRouter2);
  app.use("/api", (err, req, res, next) => {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
    if (res.headersSent) {
      return next(err);
    }
    const statusCode = typeof err.status === "number" ? err.status : err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production" ? "Bir sunucu hatas\u0131 olu\u015Ftu." : err.message || "Sunucu hatas\u0131 olu\u015Ftu."
      }
    });
  });
  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "API endpoint not found." } });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "custom"
    });
    app.use(vite.middlewares);
    const { createSeoMiddleware: createSeoMiddleware2 } = await Promise.resolve().then(() => (init_seo(), seo_exports));
    app.use(createSeoMiddleware2(vite));
  } else {
    const distPath = import_path9.default.join(process.cwd(), "dist");
    app.use(import_express36.default.static(distPath, { dotfiles: "deny" }));
    app.use((req, res, next) => {
      if (req.path.match(/\.(env|php|git|map|bak|sql|config|yml|yaml|js\.map|log)$/i) || req.path.match(/^\/(wp-admin|graphql|\.git|admin\.php)/i)) {
        return res.status(403).json({ success: false, error: { message: "403 Forbidden: Access is denied." } });
      }
      next();
    });
    const { createSeoMiddleware: createSeoMiddleware2 } = await Promise.resolve().then(() => (init_seo(), seo_exports));
    app.use(createSeoMiddleware2());
    app.get("*all", (req, res) => {
      res.sendFile(import_path9.default.join(distPath, "index.html"));
    });
  }
  const httpServer = import_http.default.createServer(app);
  try {
    const { setupQuizWebSocketServer: setupQuizWebSocketServer2 } = await Promise.resolve().then(() => (init_quizWebSocket(), quizWebSocket_exports));
    setupQuizWebSocketServer2(httpServer);
  } catch (wsErr) {
    console.error("Failed to initialize Quiz WebSocket Server:", wsErr);
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Gen\xE7 Sosyal Server running on http://localhost:${PORT}`);
  });
}
startServer().catch(console.error);
