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
var __copyProps = (to, from, except, desc16) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc16 = __getOwnPropDesc(from, key)) || desc16.enumerable });
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
  generateTwoFactorToken: () => generateTwoFactorToken,
  getEmailTokenSecret: () => getEmailTokenSecret,
  getTwoFactorTokenSecret: () => getTwoFactorTokenSecret,
  verifyAccessToken: () => verifyAccessToken,
  verifyEmailToken: () => verifyEmailToken,
  verifyRefreshToken: () => verifyRefreshToken,
  verifyTwoFactorToken: () => verifyTwoFactorToken
});
var import_jsonwebtoken, getAccessTokenSecret, getRefreshTokenSecret, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, getEmailTokenSecret, generateEmailToken, verifyEmailToken, getTwoFactorTokenSecret, generateTwoFactorToken, verifyTwoFactorToken;
var init_jwt = __esm({
  "server/utils/jwt.ts"() {
    "use strict";
    import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
    getAccessTokenSecret = () => {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("FATAL: JWT_SECRET is missing in production!");
        }
        return "dev_secret_do_not_use_in_prod";
      }
      return secret;
    };
    getRefreshTokenSecret = () => {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("FATAL: JWT_REFRESH_SECRET is missing in production!");
        }
        return "dev_refresh_secret_do_not_use_in_prod";
      }
      return secret;
    };
    generateAccessToken = (userId, role) => {
      return import_jsonwebtoken.default.sign(
        { userId, role, type: "access" },
        getAccessTokenSecret(),
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
      );
    };
    generateRefreshToken = (userId, role) => {
      return import_jsonwebtoken.default.sign(
        { userId, role, type: "refresh" },
        getRefreshTokenSecret(),
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
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
  }
});

// server/middleware/auth.ts
var requireAuth, requireRole, optionalAuth, optionalAuthContext, AuthContextError, requireAuthContext;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
    init_jwt();
    requireAuth = (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Yetkilendirme token'\u0131 bulunamad\u0131." }
        });
        return;
      }
      const token = authHeader.split(" ")[1];
      try {
        const decoded = verifyAccessToken(token);
        if (!decoded || !decoded.userId) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz kullan\u0131c\u0131 context'i." }
          });
          return;
        }
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F token." }
        });
      }
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
    optionalAuth = (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = verifyAccessToken(token);
          req.user = decoded;
        } catch (error) {
        }
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
var import_drizzle_orm, import_pg_core, users, profiles, recoveryCodes, projects, projectLikes, projectComments, posts, pollOptions, pollVotes, postMedia, comments, likes, reactions, bookmarks, postViews, reposts, follows, blocks, postMentions, commentMentions, hashtags, postHashtags, notifications, stories, storyViews, conversations, conversationMembers, messages, communities, communityMembers, reports, refreshTokens, otpVerifications, verificationRequests, systemSettings, securityAuditLogs, adminAuditLogs, projectCollaborators, postCollaborators, usersRelations, postsRelations, pollOptionsRelations, pollVotesRelations, commentsRelations, hashtagsRelations, postHashtagsRelations, conversationsRelations, conversationMembersRelations, messagesRelations, followsRelations, postViewsRelations, repostsRelations, projectsRelations, projectLikesRelations, projectCommentsRelations, verificationRequestsRelations, adminAuditLogsRelations, communitiesRelations, communityMembersRelations, projectCollaboratorsRelations, postCollaboratorsRelations, postMentionsRelations, commentMentionsRelations, moderationLogs, weeklyLeaderboards, badges, userBadges, weeklyLeaderboardsRelations, userBadgesRelations, badgesRelations;
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
      isRead: (0, import_pg_core.boolean)("is_read").default(false).notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    }, (t) => ({
      recipientIdx: (0, import_pg_core.index)("notifications_recipient_idx").on(t.recipientId),
      isReadIdx: (0, import_pg_core.index)("notifications_is_read_idx").on(t.isRead),
      recipientUnreadDateIdx: (0, import_pg_core.index)("notifications_recipient_unread_date_idx").on(t.recipientId, t.isRead, t.createdAt),
      recipientCreatedAtIdx: (0, import_pg_core.index)("notifications_recipient_created_at_idx").on(t.recipientId, t.createdAt)
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
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
    });
    communityMembers = (0, import_pg_core.pgTable)("community_members", {
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
    postsRelations = (0, import_drizzle_orm.relations)(posts, ({ one, many }) => ({
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
  }
});

// src/db/index.ts
var import_fs2, import_node_postgres, import_pglite, import_pg, import_pglite2, import_path2, createPool, createPglite, getDb, db;
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
    createPglite = () => {
      if (!global._pgliteClient) {
        console.warn("=========================================================");
        console.warn("\u26A0\uFE0F  UYARI: DATABASE_URL ortam de\u011Fi\u015Fkeni bulunamad\u0131!");
        console.warn("Lokal PGlite (WASM) fallback veritaban\u0131 ba\u015Flat\u0131l\u0131yor...");
        console.warn("T\xFCm verileriniz ./database klas\xF6r\xFCne kaydedilecektir.");
        console.warn("=========================================================");
        const dbPath = import_path2.default.join(process.cwd(), "database");
        const pidPath = import_path2.default.join(dbPath, "postmaster.pid");
        if (import_fs2.default.existsSync(pidPath)) {
          try {
            import_fs2.default.unlinkSync(pidPath);
          } catch (_) {
          }
        }
        try {
          global._pgliteClient = new import_pglite2.PGlite(dbPath);
        } catch (err) {
          console.error("PGlite initialization failed, attempting to clear database folder...", err);
          try {
            import_fs2.default.rmSync(dbPath, { recursive: true, force: true });
            global._pgliteClient = new import_pglite2.PGlite(dbPath);
          } catch (retryErr) {
            console.error("Failed to recover PGlite:", retryErr);
            throw retryErr;
          }
        }
      }
      return global._pgliteClient;
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

// server/routes/setup.ts
var setup_exports = {};
__export(setup_exports, {
  setupRouter: () => setupRouter
});
var import_express2, import_drizzle_orm3, argon2, import_nodemailer, setupRouter;
var init_setup = __esm({
  "server/routes/setup.ts"() {
    "use strict";
    import_express2 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm3 = require("drizzle-orm");
    argon2 = __toESM(require("argon2"), 1);
    import_nodemailer = __toESM(require("nodemailer"), 1);
    setupRouter = (0, import_express2.Router)();
    setupRouter.use(async (req, res, next) => {
      if (process.env.SETUP_COMPLETED === "true") {
        return res.status(403).json({ success: false, error: { message: "Setup is already completed and locked by environment." } });
      }
      try {
        const adminUser = await db.query.users.findFirst({
          where: (0, import_drizzle_orm3.eq)(users.role, "admin")
        });
        if (adminUser) {
          return res.status(403).json({ success: false, error: { message: "Setup is already completed and locked by database state." } });
        }
      } catch (error) {
      }
      next();
    });
    setupRouter.get("/status", async (req, res) => {
      const statusReport = {
        state: "UNINITIALIZED",
        steps: []
      };
      const isProduction = process.env.NODE_ENV === "production";
      const requiredEnv = isProduction ? ["JWT_SECRET", "JWT_REFRESH_SECRET", "ENCRYPTION_KEY"] : [];
      const missingEnv = requiredEnv.filter((k) => !process.env[k]);
      if (missingEnv.length > 0) {
        statusReport.steps.push({
          step: "ENVIRONMENT_VALIDATION",
          status: "FAILED",
          message: "Eksik ortam anahtarlar\u0131: " + missingEnv.join(", "),
          diagnostic_code: "ENV_MISSING_SECRETS"
        });
        statusReport.state = "FAILED";
        return res.json({ success: true, data: statusReport });
      }
      statusReport.steps.push({
        step: "ENVIRONMENT_VALIDATION",
        status: "SUCCESS",
        message: isProduction ? "Ortam de\u011Fi\u015Fkenleri ve g\xFCvenlik anahtarlar\u0131 do\u011Fruland\u0131." : "Geli\u015Ftirme/yerel \xE7al\u0131\u015Fma ortam\u0131 ve g\xFCvenlik anahtarlar\u0131 haz\u0131r.",
        diagnostic_code: "ENV_OK"
      });
      try {
        await db.execute(import_drizzle_orm3.sql`SELECT 1`);
        const isPg = Boolean(process.env.DATABASE_URL);
        statusReport.steps.push({
          step: "DATABASE_CONNECTION",
          status: "SUCCESS",
          message: isPg ? "PostgreSQL veritaban\u0131 ba\u011Flant\u0131s\u0131 kuruldu." : "Lokal PGlite veritaban\u0131 ba\u011Flant\u0131s\u0131 aktif.",
          diagnostic_code: "DB_OK"
        });
        statusReport.state = "DATABASE_READY";
      } catch (e) {
        statusReport.steps.push({
          step: "DATABASE_CONNECTION",
          status: "FAILED",
          message: "Veritaban\u0131 ba\u011Flant\u0131s\u0131 kurulamad\u0131.",
          diagnostic_code: "DB_CONN_FAIL"
        });
        statusReport.state = "FAILED";
        return res.json({ success: true, data: statusReport });
      }
      try {
        await db.execute(import_drizzle_orm3.sql`SELECT count(*) FROM users`);
        statusReport.steps.push({
          step: "DATABASE_MIGRATION",
          status: "SUCCESS",
          message: "Veritaban\u0131 \u015Femas\u0131 ve tablolar haz\u0131r.",
          diagnostic_code: "DB_MIGRATED"
        });
        statusReport.state = "MIGRATED";
      } catch (e) {
        statusReport.steps.push({
          step: "DATABASE_MIGRATION",
          status: "FAILED",
          message: "Veritaban\u0131 \u015Femas\u0131 bulunamad\u0131.",
          diagnostic_code: "DB_NOT_MIGRATED"
        });
        statusReport.state = "FAILED";
        return res.json({ success: true, data: statusReport });
      }
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        statusReport.steps.push({
          step: "SMTP_CONFIGURATION",
          status: "PARTIAL",
          message: "SMTP yap\u0131land\u0131r\u0131lmad\u0131 (\u0130ste\u011Fe ba\u011Fl\u0131, kurulum sonras\u0131nda Y\xF6netim Paneli \xFCzerinden ayarlanabilir).",
          diagnostic_code: "SMTP_NOT_CONFIGURED"
        });
      } else {
        try {
          const transporter = import_nodemailer.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });
          await transporter.verify();
          statusReport.steps.push({
            step: "SMTP_CONFIGURATION",
            status: "SUCCESS",
            message: "SMTP ba\u011Flant\u0131s\u0131 ba\u015Far\u0131l\u0131.",
            diagnostic_code: "SMTP_OK"
          });
        } catch (e) {
          statusReport.steps.push({
            step: "SMTP_CONFIGURATION",
            status: "PARTIAL",
            message: "SMTP sunucusuna eri\u015Filemedi (Daha sonra ayarlanabilir).",
            diagnostic_code: "SMTP_VERIFY_FAIL"
          });
        }
      }
      res.json({ success: true, data: statusReport });
    });
    setupRouter.post("/run", async (req, res) => {
      const { adminEmail, adminUsername, adminPassword, adminFullName } = req.body;
      if (!adminEmail || !adminUsername || !adminPassword || !adminFullName) {
        return res.status(400).json({ success: false, error: { message: "T\xFCm alanlar\u0131n doldurulmas\u0131 zorunludur." } });
      }
      try {
        const result = await db.transaction(async (tx) => {
          const existingAdmin = await tx.query.users.findFirst({
            where: (0, import_drizzle_orm3.eq)(users.role, "admin")
          });
          if (existingAdmin) {
            throw new Error("ADMIN_EXISTS");
          }
          const hashedPassword = await argon2.hash(adminPassword);
          const newAdmin = await tx.insert(users).values({
            email: adminEmail,
            username: adminUsername,
            passwordHash: hashedPassword,
            role: "admin",
            isVerified: true,
            emailVerified: true,
            isActive: true
          }).returning();
          const { profiles: profiles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          await tx.insert(profiles2).values({
            userId: newAdmin[0].id,
            displayName: adminFullName
          }).onConflictDoNothing();
          return newAdmin[0];
        });
        return res.json({
          success: true,
          data: {
            state: "COMPLETED",
            message: "Kurulum ba\u015Far\u0131yla tamamland\u0131."
          }
        });
      } catch (error) {
        if (error.message === "ADMIN_EXISTS") {
          return res.status(403).json({ success: false, error: { message: "Kurulum zaten tamamlanm\u0131\u015F." } });
        }
        console.error("Setup run error:", error);
        return res.status(500).json({ success: false, error: { message: "Kurulum s\u0131ras\u0131nda bir hata olu\u015Ftu." } });
      }
    });
  }
});

// server/routes/health.ts
var health_exports = {};
__export(health_exports, {
  healthRouter: () => healthRouter
});
var import_express3, import_drizzle_orm4, healthRouter;
var init_health = __esm({
  "server/routes/health.ts"() {
    "use strict";
    import_express3 = require("express");
    init_db();
    import_drizzle_orm4 = require("drizzle-orm");
    healthRouter = (0, import_express3.Router)();
    healthRouter.get("/", async (req, res) => {
      let dbStatus = "ok";
      let error;
      let statusCode = 200;
      try {
        await db.execute(import_drizzle_orm4.sql`SELECT 1`);
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

// server/routes/sitemap.ts
var sitemap_exports = {};
__export(sitemap_exports, {
  sitemapRouter: () => sitemapRouter
});
var import_express4, import_drizzle_orm5, sitemapRouter;
var init_sitemap = __esm({
  "server/routes/sitemap.ts"() {
    "use strict";
    import_express4 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm5 = require("drizzle-orm");
    sitemapRouter = (0, import_express4.Router)();
    sitemapRouter.get("/sitemap.xml", async (req, res) => {
      try {
        const domain = "https://gencsosyal.com";
        const publicProfiles = await db.select({ username: users.username }).from(profiles).innerJoin(users, (0, import_drizzle_orm5.eq)(profiles.userId, users.id)).where((0, import_drizzle_orm5.eq)(profiles.allowSearchEngineIndexing, true));
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
        xml += `  <url>
    <loc>${domain}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
`;
        publicProfiles.forEach((profile) => {
          xml += `  <url>
    <loc>${domain}/profile/${profile.username}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });
        xml += `</urlset>`;
        res.header("Content-Type", "application/xml");
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
      max: 20,
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
      max: 10,
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
async function notify(actorId, recipientId, type, postId, commentId, projectId) {
  if (actorId === recipientId) return;
  try {
    await db.insert(notifications).values({ actorId, recipientId, type, postId, commentId, projectId });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}
var init_notifications = __esm({
  "server/utils/notifications.ts"() {
    "use strict";
    init_db();
    init_schema();
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
  return text2.toLocaleLowerCase("tr-TR").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c");
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

// server/utils/blocks.ts
async function getBlockedIds(userId) {
  if (!userId) return [];
  const records = await db.select().from(blocks).where((0, import_drizzle_orm6.or)((0, import_drizzle_orm6.eq)(blocks.blockerId, userId), (0, import_drizzle_orm6.eq)(blocks.blockedId, userId)));
  const ids = /* @__PURE__ */ new Set();
  records.forEach((r) => {
    if (r.blockerId !== userId) ids.add(r.blockerId);
    if (r.blockedId !== userId) ids.add(r.blockedId);
  });
  return Array.from(ids);
}
var import_drizzle_orm6;
var init_blocks = __esm({
  "server/utils/blocks.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm6 = require("drizzle-orm");
  }
});

// server/routes/projects.ts
var projects_exports = {};
__export(projects_exports, {
  projectsRouter: () => projectsRouter
});
var import_express5, import_drizzle_orm7, import_drizzle_orm8, projectsRouter;
var init_projects = __esm({
  "server/routes/projects.ts"() {
    "use strict";
    import_express5 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm7 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_notifications();
    init_project();
    init_moderation();
    init_blocks();
    import_drizzle_orm8 = require("drizzle-orm");
    projectsRouter = (0, import_express5.Router)();
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
          conditions.push((0, import_drizzle_orm7.eq)(projects.category, category));
        }
        if (status) {
          conditions.push((0, import_drizzle_orm7.eq)(projects.status, status));
        }
        if (q) {
          const search = `%${q}%`;
          conditions.push(
            (0, import_drizzle_orm7.or)(
              (0, import_drizzle_orm7.ilike)(projects.title, search),
              (0, import_drizzle_orm7.ilike)(projects.description, search),
              import_drizzle_orm7.sql`${projects.tags}::text ILIKE ${search}`
            )
          );
        }
        conditions.push((0, import_drizzle_orm8.notInArray)(projects.userId, ignoreIds));
        const whereClause = conditions.length > 0 ? (0, import_drizzle_orm7.and)(...conditions) : void 0;
        const orderClause = sort === "oldest" ? (0, import_drizzle_orm7.asc)(projects.createdAt) : (0, import_drizzle_orm7.desc)(projects.createdAt);
        const totalCountResult = await db.select({ count: import_drizzle_orm7.sql`cast(count(*) as integer)` }).from(projects).where(whereClause);
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
        }).from(projects).leftJoin(users, (0, import_drizzle_orm7.eq)(projects.userId, users.id)).where(whereClause).orderBy(orderClause).limit(limitNum).offset(offset);
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
    projectsRouter.get("/user/:userId", async (req, res) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz kullan\u0131c\u0131 ID'si." } });
          return;
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
        }).from(projects).leftJoin(users, (0, import_drizzle_orm7.eq)(projects.userId, users.id)).where((0, import_drizzle_orm7.eq)(projects.userId, userId)).orderBy((0, import_drizzle_orm7.desc)(projects.createdAt));
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
        }).from(projects).leftJoin(users, (0, import_drizzle_orm7.eq)(projects.userId, users.id)).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).limit(1);
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
        const existing = await db.select().from(projects).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).limit(1);
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
        if (modResult.riskLevel === "HIGH_RISK" || modResult.riskLevel === "MEDIUM_RISK") {
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
        const updated = await db.update(projects).set({
          title: data.title,
          description: data.description,
          detailedDescription: data.detailedDescription || null,
          category: data.category,
          status: data.status,
          projectUrl: data.projectUrl || null,
          githubUrl: data.githubUrl || null,
          imageUrl: data.imageUrl || null,
          tags: cleanedTags,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).returning();
        res.json({ success: true, data: { project: updated[0] } });
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
        const existing = await db.select().from(projects).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).limit(1);
        if (existing.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (existing[0].userId !== requireAuthContext(req)) {
          res.status(403).json({ error: { message: "Bu projeyi silme yetkiniz yok." } });
          return;
        }
        await db.delete(projects).where((0, import_drizzle_orm7.eq)(projects.id, projectId));
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
        const likesCountResult = await db.select({ count: import_drizzle_orm7.sql`cast(count(*) as integer)` }).from(projectLikes).where((0, import_drizzle_orm7.eq)(projectLikes.projectId, projectId));
        const totalLikes = likesCountResult[0].count || 0;
        let viewerHasLiked = false;
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
        const project = await db.select().from(projects).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).limit(1);
        if (project.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (project[0].userId === userId) {
          res.status(400).json({ error: { message: "Kendi projenizi be\u011Fenemezsiniz." } });
          return;
        }
        const existing = await db.select().from(projectLikes).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(projectLikes.projectId, projectId), (0, import_drizzle_orm7.eq)(projectLikes.userId, userId))).limit(1);
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
        await db.delete(projectLikes).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(projectLikes.projectId, projectId), (0, import_drizzle_orm7.eq)(projectLikes.userId, userId)));
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
        }).from(projectComments).innerJoin(users, (0, import_drizzle_orm7.eq)(projectComments.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm7.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(projectComments.projectId, projectId), (0, import_drizzle_orm7.eq)(projectComments.moderationStatus, "APPROVED"))).orderBy((0, import_drizzle_orm7.asc)(projectComments.createdAt));
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
        const project = await db.select().from(projects).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).limit(1);
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
            projectId
            // we can reuse commentId if we alter notifications but we don't have projectCommentId, so we just pass projectId
          });
        }
        const user = await db.select({
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          fullName: profiles.displayName
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm7.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm7.eq)(users.id, userId)).limit(1);
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
        const comment = await db.select().from(projectComments).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(projectComments.id, commentId), (0, import_drizzle_orm7.eq)(projectComments.projectId, projectId))).limit(1);
        if (comment.length === 0) {
          res.status(404).json({ error: { message: "Yorum bulunamad\u0131." } });
          return;
        }
        if (comment[0].userId !== userId) {
          res.status(403).json({ error: { message: "Bu yorumu silme yetkiniz yok." } });
          return;
        }
        await db.delete(projectComments).where((0, import_drizzle_orm7.eq)(projectComments.id, commentId));
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
        const proj = await db.select({ userId: projects.userId }).from(projects).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).limit(1);
        if (proj.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (proj[0].userId !== currentUserId) {
          res.status(403).json({ error: { message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        const target = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, targetUserId)).limit(1);
        if (target.length === 0) {
          res.status(404).json({ error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const existing = await db.select().from(projectCollaborators).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(projectCollaborators.projectId, projectId), (0, import_drizzle_orm7.eq)(projectCollaborators.userId, targetUserId))).limit(1);
        if (existing.length > 0) {
          if (existing[0].status === "pending") {
            res.status(400).json({ error: { message: "Bu kullan\u0131c\u0131ya zaten davet g\xF6nderilmi\u015F." } });
            return;
          } else if (existing[0].status === "accepted") {
            res.status(400).json({ error: { message: "Bu kullan\u0131c\u0131 zaten ortak \xFCretici." } });
            return;
          } else {
            await db.update(projectCollaborators).set({ status: "pending", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm7.eq)(projectCollaborators.id, existing[0].id));
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
        const proj = await db.select({ userId: projects.userId }).from(projects).where((0, import_drizzle_orm7.eq)(projects.id, projectId)).limit(1);
        if (proj.length === 0) {
          res.status(404).json({ error: { message: "Proje bulunamad\u0131." } });
          return;
        }
        if (proj[0].userId !== currentUserId && currentUserId !== targetUserId) {
          res.status(403).json({ error: { message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        await db.delete(projectCollaborators).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(projectCollaborators.projectId, projectId), (0, import_drizzle_orm7.eq)(projectCollaborators.userId, targetUserId)));
        res.json({ success: true, message: "Ortak \xFCretici kald\u0131r\u0131ld\u0131." });
      } catch (error) {
        console.error("Remove collaborator error:", error);
        res.status(500).json({ error: { message: "Sunucu hatas\u0131." } });
      }
    });
    projectsRouter.get("/:id/collaborators", async (req, res) => {
      try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
          res.status(400).json({ error: { message: "Ge\xE7ersiz ID." } });
          return;
        }
        const list = await db.select({
          userId: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          status: projectCollaborators.status
        }).from(projectCollaborators).innerJoin(users, (0, import_drizzle_orm7.eq)(projectCollaborators.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm7.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm7.and)(
          (0, import_drizzle_orm7.eq)(projectCollaborators.projectId, projectId),
          (0, import_drizzle_orm7.or)((0, import_drizzle_orm7.eq)(projectCollaborators.status, "accepted"), (0, import_drizzle_orm7.eq)(projectCollaborators.status, "pending"))
        ));
        res.json({ success: true, data: list });
      } catch (error) {
        console.error("Get project collaborators error:", error);
        res.status(500).json({ error: { message: "Sunucu hatas\u0131." } });
      }
    });
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
      displayName: import_zod2.z.string().min(2, "G\xF6r\xFCnen ad en az 2 karakter olmal\u0131d\u0131r.").max(50, "G\xF6r\xFCnen ad en fazla 50 karakter olabilir.")
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
      displayName: import_zod2.z.string().min(2, "G\xF6r\xFCnen ad en az 2 karakter olmal\u0131d\u0131r.").max(50, "G\xF6r\xFCnen ad en fazla 50 karakter olabilir.")
    });
    verifyRegisterOtpSchema = import_zod2.z.object({
      username: import_zod2.z.string().min(3, "Kullan\u0131c\u0131 ad\u0131 en az 3 karakter olmal\u0131d\u0131r.").max(30, "Kullan\u0131c\u0131 ad\u0131 en fazla 30 karakter olabilir.").regex(/^[a-zA-Z0-9_]+$/, "Kullan\u0131c\u0131 ad\u0131nda T\xFCrk\xE7e karakter (\xE7,\u011F,\u0131,\xF6,\u015F,\xFC) ve bo\u015Fluk kullan\u0131lamaz.").toLowerCase(),
      email: import_zod2.z.string().email("Ge\xE7erli bir e-posta adresi giriniz.").toLowerCase(),
      password: import_zod2.z.string().min(8, "\u015Eifre en az 8 karakter olmal\u0131d\u0131r.").regex(/[a-z]/, "\u015Eifre en az bir k\xFC\xE7\xFCk harf i\xE7ermelidir.").regex(/[A-Z]/, "\u015Eifre en az bir b\xFCy\xFCk harf i\xE7ermelidir.").regex(/[0-9]/, "\u015Eifre en az bir rakam i\xE7ermelidir."),
      displayName: import_zod2.z.string().min(2, "G\xF6r\xFCnen ad en az 2 karakter olmal\u0131d\u0131r.").max(50, "G\xF6r\xFCnen ad en fazla 50 karakter olabilir."),
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
function getKey() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: ENCRYPTION_KEY is required in production environment.");
    }
    console.warn("WARNING: ENCRYPTION_KEY ayarl\u0131 de\u011Fil, izole bir fallback anahtar kullan\u0131l\u0131yor - production i\xE7in \xF6nerilmez.");
    const fallbackSecret = "isolated_dev_fallback_secret_only_for_local_development";
    return import_crypto.default.scryptSync(fallbackSecret, "salt", 32);
  }
  return import_crypto.default.scryptSync(secret, "salt", 32);
}
function encryptString(text2) {
  const iv = import_crypto.default.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = import_crypto.default.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text2, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}
function decryptString(encryptedText) {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  const key = getKey();
  const decipher = import_crypto.default.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
var import_crypto, ALGORITHM, IV_LENGTH;
var init_encryption = __esm({
  "server/utils/encryption.ts"() {
    "use strict";
    import_crypto = __toESM(require("crypto"), 1);
    ALGORITHM = "aes-256-gcm";
    IV_LENGTH = 16;
  }
});

// server/utils/mailer.ts
var import_nodemailer2, getSmtpConfig, getTransporter, escapeHtml, baseTemplate, sendOtpVerificationEmail, sendVerificationEmail, sendPasswordResetEmail, sendSecurityAlertEmail, sendVerificationStatusEmail, sendSmtpTestEmail;
var init_mailer = __esm({
  "server/utils/mailer.ts"() {
    "use strict";
    import_nodemailer2 = __toESM(require("nodemailer"), 1);
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
      return import_nodemailer2.default.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 5e3,
        greetingTimeout: 5e3,
        socketTimeout: 5e3
      });
    };
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
\u{1F511} Do\u011Frulama Kodu: ${otpCode}
\u2139\uFE0F SMTP sunucusu hen\xFCz yap\u0131land\u0131r\u0131lmad\u0131\u011F\u0131 i\xE7in test kodu terminale yazd\u0131r\u0131ld\u0131.
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
        console.warn(`[SMTP] E-posta g\xF6nderilemedi (${err?.message}). Kod terminale yazd\u0131r\u0131ld\u0131.`);
        console.log(`
=======================================================
\u{1F4E7} [FALLBACK OTP KODU] Al\u0131c\u0131: ${to}
\u{1F511} KOD: ${otpCode}
=======================================================
`);
        return { sent: false };
      }
    };
    sendVerificationEmail = async (to, displayName, verifyLink) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        console.log(`
\u{1F4E7} [DO\u011ERULAMA BA\u011ELANTISI] Al\u0131c\u0131: ${to} -> ${verifyLink}
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
        console.warn(`[SMTP] Do\u011Frulama linki e-postas\u0131 g\xF6nderilemedi (${err?.message}). Link: ${verifyLink}`);
      }
    };
    sendPasswordResetEmail = async (to, displayName, resetLink) => {
      const config = await getSmtpConfig();
      if (!config.isConfigured) {
        console.log(`
\u{1F511} [\u015E\u0130FRE SIFIRLAMA BA\u011ELANTISI] Al\u0131c\u0131: ${to} -> ${resetLink}
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
        console.warn(`[SMTP] \u015Eifre s\u0131f\u0131rlama e-postas\u0131 g\xF6nderilemedi (${err?.message}). Link: ${resetLink}`);
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
async function handleSendOtp(email, displayName, username, password) {
  const existingUsername = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm9.eq)(users.username, username)).limit(1);
  if (existingUsername.length > 0) {
    return {
      status: 409,
      body: {
        success: false,
        error: { code: "USERNAME_TAKEN", message: "Bu kullan\u0131c\u0131 ad\u0131 zaten kullan\u0131mda." }
      }
    };
  }
  const existingEmail = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm9.eq)(users.email, email)).limit(1);
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
    (0, import_drizzle_orm9.and)((0, import_drizzle_orm9.eq)(otpVerifications.email, email), (0, import_drizzle_orm9.eq)(otpVerifications.type, "REGISTER"))
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
  const otpCode = import_crypto2.default.randomInt(1e5, 1e6).toString();
  const otpHash = await import_argon2.default.hash(otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  if (existingOtpRecords.length > 0) {
    await db.update(otpVerifications).set({
      otpHash,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      lastSentAt: /* @__PURE__ */ new Date(),
      verifiedAt: null
    }).where((0, import_drizzle_orm9.eq)(otpVerifications.id, existingOtpRecords[0].id));
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
  const { username, email, password, displayName, otp } = parsedData;
  const otpRecords = await db.select().from(otpVerifications).where(
    (0, import_drizzle_orm9.and)((0, import_drizzle_orm9.eq)(otpVerifications.email, email), (0, import_drizzle_orm9.eq)(otpVerifications.type, "REGISTER"))
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
  const updateResult = await db.update(otpVerifications).set({ attempts: import_drizzle_orm9.sql`${otpVerifications.attempts} + 1` }).where((0, import_drizzle_orm9.eq)(otpVerifications.id, otpRecord.id)).returning({ newAttempts: otpVerifications.attempts });
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
  const isValid = await import_argon2.default.verify(otpRecord.otpHash, otp);
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
  const passwordHash = await import_argon2.default.hash(password);
  let newUser;
  try {
    newUser = await db.transaction(async (tx) => {
      const existingUser = await tx.select().from(users).where(
        (0, import_drizzle_orm9.or)((0, import_drizzle_orm9.eq)(users.username, username), (0, import_drizzle_orm9.eq)(users.email, email))
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
        isActive: true
      }).returning();
      await tx.insert(profiles).values({
        userId: createdUser.id,
        displayName
      });
      await tx.delete(otpVerifications).where((0, import_drizzle_orm9.eq)(otpVerifications.id, otpRecord.id));
      try {
        const setting = await tx.select().from(systemSettings).where((0, import_drizzle_orm9.eq)(systemSettings.key, "auto_follow_users")).limit(1);
        if (setting.length > 0 && setting[0].value) {
          const parsed = JSON.parse(setting[0].value);
          let userIds = Array.isArray(parsed) ? parsed.map((u) => typeof u === "number" ? u : u.id).filter((id) => typeof id === "number" && id !== createdUser.id) : [];
          if (userIds.length > 0) {
            const followsToInsert = userIds.map((id) => ({
              followerId: createdUser.id,
              followingId: id,
              notificationPreference: "standard"
            }));
            await tx.insert(follows).values(followsToInsert).onConflictDoNothing();
          }
        }
      } catch (e) {
        console.error("Auto-follow error on register:", e);
      }
      const accessToken2 = generateAccessToken(createdUser.id, createdUser.role);
      const refreshToken2 = generateRefreshToken(createdUser.id, createdUser.role);
      const tokenHash = await import_argon2.default.hash(refreshToken2);
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
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
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.APP_URL?.startsWith("https") ?? false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
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
      accessToken
    }
  });
}
var import_express6, jwt2, import_argon2, import_crypto2, import_drizzle_orm9, import_otplib, authRouter;
var init_auth3 = __esm({
  "server/routes/auth.ts"() {
    "use strict";
    import_express6 = require("express");
    jwt2 = __toESM(require("jsonwebtoken"), 1);
    import_argon2 = __toESM(require("argon2"), 1);
    import_crypto2 = __toESM(require("crypto"), 1);
    init_db();
    init_schema();
    import_drizzle_orm9 = require("drizzle-orm");
    init_auth2();
    init_jwt();
    init_encryption();
    import_otplib = require("otplib");
    init_mailer();
    init_rateLimiter();
    init_auth();
    authRouter = (0, import_express6.Router)();
    authRouter.get("/setup-admin-secure", async (req, res) => {
      try {
        const { key, email } = req.query;
        if (key !== "GencSosyalAdmin2026") {
          return res.status(403).json({ success: false, message: "Ge\xE7ersiz anahtar." });
        }
        const targetEmail = email || "imranyesildag123@gmail.com";
        const result = await db.update(users).set({ role: "ADMIN" }).where((0, import_drizzle_orm9.eq)(users.email, targetEmail)).returning();
        if (result.length > 0) {
          return res.json({ success: true, message: `${result[0].username} kullan\u0131c\u0131s\u0131 ADMIN yap\u0131ld\u0131! L\xFCtfen hesaba \xE7\u0131k\u0131\u015F-giri\u015F yap\u0131n.` });
        } else {
          return res.status(404).json({ success: false, message: "Kullan\u0131c\u0131 bulunamad\u0131. L\xFCtfen \xF6nce uygulamaya bu e-posta ile kay\u0131t olun." });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Sunucu hatas\u0131" });
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
        const { email, displayName, username, password } = parsed.data;
        const result = await handleSendOtp(email, displayName, username, password);
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
        const existingUser = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm9.eq)(users.email, email)).limit(1);
        if (existingUser.length > 0) {
          res.status(409).json({
            success: false,
            error: { code: "EMAIL_TAKEN", message: "Bu e-posta adresi zaten kay\u0131tl\u0131." }
          });
          return;
        }
        const existingOtpRecords = await db.select().from(otpVerifications).where(
          (0, import_drizzle_orm9.and)((0, import_drizzle_orm9.eq)(otpVerifications.email, email), (0, import_drizzle_orm9.eq)(otpVerifications.type, "REGISTER"))
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
        const otpCode = import_crypto2.default.randomInt(1e5, 1e6).toString();
        const otpHash = await import_argon2.default.hash(otpCode);
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
          }).where((0, import_drizzle_orm9.eq)(otpVerifications.id, existingOtpRecords[0].id));
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
          (0, import_drizzle_orm9.or)((0, import_drizzle_orm9.eq)(users.username, identifier), (0, import_drizzle_orm9.eq)(users.email, identifier))
        ).limit(1);
        const user = userRecord.length > 0 ? userRecord[0] : null;
        const dummyHash = "$argon2id$v=19$m=65536,t=3,p=4$R3q+z0x4J4Q4gVvJ8n5Z9g$O5x1/l4zZ3z0x4J4Q4gVvJ8n5Z9gO5x1/l4zZ3z0x4I";
        const hashToVerify = user ? user.passwordHash : dummyHash;
        const isPasswordValid = await import_argon2.default.verify(hashToVerify, password).catch(() => false);
        if (!user || !isPasswordValid) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz e-posta/kullan\u0131c\u0131 ad\u0131 veya \u015Fifre." }
          });
          return;
        }
        if (!user.isActive) {
          res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Hesab\u0131n\u0131z pasif durumdad\u0131r." }
          });
          return;
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
        const tokenHash = await import_argon2.default.hash(refreshToken);
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
        expiresAt.setDate(expiresAt.getDate() + 7);
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
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.APP_URL?.startsWith("https") ?? false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1e3
          // 7 days
        });
        sendSecurityAlertEmail(user.email, user.username, "Yeni Giri\u015F \u0130\u015Flemi", (/* @__PURE__ */ new Date()).toLocaleString("tr-TR"), ua.substring(0, 50), os, browser, ipAddress).catch(console.error);
        res.json({
          success: true,
          data: {
            accessToken
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, decoded.userId)).limit(1);
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
            (0, import_drizzle_orm9.and)((0, import_drizzle_orm9.eq)(recoveryCodes2.userId, user.id), (0, import_drizzle_orm9.eq)(recoveryCodes2.used, false))
          );
          for (const rc of codes) {
            const isValid = await import_argon2.default.verify(rc.codeHash, recoveryCode).catch(() => false);
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
            const updateResult = await tx.update(recoveryCodes2).set({ used: true, usedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.and)((0, import_drizzle_orm9.eq)(recoveryCodes2.id, usedRecoveryCodeId), (0, import_drizzle_orm9.eq)(recoveryCodes2.used, false))).returning();
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
          tokenHash = await import_argon2.default.hash(refreshToken);
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
        expiresAt.setDate(expiresAt.getDate() + 7);
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
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.APP_URL?.startsWith("https") ?? false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1e3
          // 7 days
        });
        sendSecurityAlertEmail(user.email, user.username, "Yeni Giri\u015F \u0130\u015Flemi (2FA Onayl\u0131)", (/* @__PURE__ */ new Date()).toLocaleString("tr-TR"), ua.substring(0, 50), os, browser, ipAddress).catch(console.error);
        res.json({
          success: true,
          data: {
            accessToken
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, userId)).limit(1);
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
        await db.update(users).set({ twoFactorSecret: encryptedSecret }).where((0, import_drizzle_orm9.eq)(users.id, userId));
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, userId)).limit(1);
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
          const code = import_crypto2.default.randomBytes(4).toString("hex").toUpperCase();
          plainCodes.push(code);
          const hash2 = await import_argon2.default.hash(code);
          newCodes.push({ userId, codeHash: hash2 });
        }
        await db.transaction(async (tx) => {
          await tx.update(users).set({ twoFactorEnabled: true }).where((0, import_drizzle_orm9.eq)(users.id, userId));
          await tx.delete(recoveryCodes2).where((0, import_drizzle_orm9.eq)(recoveryCodes2.userId, userId));
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, userId)).limit(1);
        if (userRecord.length === 0 || !userRecord[0].twoFactorEnabled) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "2FA aktif de\u011Fil." } });
          return;
        }
        const isPasswordValid = await import_argon2.default.verify(userRecord[0].passwordHash, parsed.data.password).catch(() => false);
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
          await tx.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where((0, import_drizzle_orm9.eq)(users.id, userId));
          await tx.delete(recoveryCodes2).where((0, import_drizzle_orm9.eq)(recoveryCodes2.userId, userId));
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
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Oturum s\xFCresi dolmu\u015F, l\xFCtfen tekrar giri\u015F yap\u0131n." }
          });
          return;
        }
        let decoded;
        try {
          decoded = verifyRefreshToken(refreshToken);
        } catch (e) {
          res.clearCookie("refreshToken");
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz oturum." }
          });
          return;
        }
        const activeTokens = await db.select().from(refreshTokens).where((0, import_drizzle_orm9.eq)(refreshTokens.userId, decoded.userId));
        let matchedTokenId = null;
        let reusedTokenDetected = false;
        for (const record of activeTokens) {
          const isValid = await import_argon2.default.verify(record.tokenHash, refreshToken).catch(() => false);
          if (isValid) {
            if (record.revokedAt) {
              reusedTokenDetected = true;
            } else if (/* @__PURE__ */ new Date() <= record.expiresAt) {
              matchedTokenId = record.id;
            }
            break;
          }
        }
        if (reusedTokenDetected) {
          await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.eq)(refreshTokens.userId, decoded.userId));
          const { securityAuditLogs: securityAuditLogs2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          await db.insert(securityAuditLogs2).values({
            userId: decoded.userId,
            action: "refresh_token_reuse",
            metadata: {
              details: "\u0130ptal edilmi\u015F bir oturum yenileme tokeni tekrar kullan\u0131ld\u0131. Olas\u0131 token h\u0131rs\u0131zl\u0131\u011F\u0131na kar\u015F\u0131 kullan\u0131c\u0131n\u0131n t\xFCm oturumlar\u0131 sonland\u0131r\u0131ld\u0131.",
              ipAddress: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim().substring(0, 45)
            }
          }).catch(console.error);
          res.clearCookie("refreshToken");
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "\u015E\xFCpheli oturum hareketi alg\u0131land\u0131. T\xFCm oturumlar\u0131n\u0131z g\xFCvenlik amac\u0131yla sonland\u0131r\u0131ld\u0131, l\xFCtfen tekrar giri\u015F yap\u0131n." }
          });
          return;
        }
        if (!matchedTokenId) {
          res.clearCookie("refreshToken");
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Ge\xE7ersiz oturum." }
          });
          return;
        }
        const txResult = await db.transaction(async (tx) => {
          const updateResult = await tx.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.and)(
            (0, import_drizzle_orm9.eq)(refreshTokens.id, matchedTokenId),
            (0, import_drizzle_orm9.isNull)(refreshTokens.revokedAt)
          )).returning();
          if (updateResult.length === 0) {
            return { error: "race_condition" };
          }
          const user = await tx.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, decoded.userId)).limit(1);
          if (user.length === 0 || !user[0].isActive) {
            return { error: "inactive" };
          }
          const newAccessToken2 = generateAccessToken(user[0].id, user[0].role);
          const newRefreshToken2 = generateRefreshToken(user[0].id, user[0].role);
          const tokenHash = await import_argon2.default.hash(newRefreshToken2);
          const expiresAt = /* @__PURE__ */ new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          await tx.insert(refreshTokens).values({
            userId: user[0].id,
            tokenHash,
            expiresAt,
            ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
            deviceInfo: req.headers["user-agent"] || null
          });
          return { newAccessToken: newAccessToken2, newRefreshToken: newRefreshToken2 };
        });
        if (txResult.error === "race_condition") {
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "E\u015Fzamanl\u0131 oturum yenileme alg\u0131land\u0131. L\xFCtfen tekrar deneyin." }
          });
          return;
        }
        if (txResult.error === "inactive") {
          res.clearCookie("refreshToken");
          res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Hesap pasif." }
          });
          return;
        }
        const { newAccessToken, newRefreshToken } = txResult;
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.APP_URL?.startsWith("https") ?? false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1e3
        });
        res.json({
          success: true,
          data: {
            accessToken: newAccessToken
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
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
          try {
            const decoded = verifyRefreshToken(refreshToken);
            const activeTokens = await db.select().from(refreshTokens).where((0, import_drizzle_orm9.eq)(refreshTokens.userId, decoded.userId));
            for (const record of activeTokens) {
              if (!record.revokedAt) {
                const isValid = await import_argon2.default.verify(record.tokenHash, refreshToken);
                if (isValid) {
                  await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.eq)(refreshTokens.id, record.id));
                  break;
                }
              }
            }
          } catch (e) {
          }
        }
        res.clearCookie("refreshToken");
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
          isVerified: users.isVerified,
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
          interests: profiles.interests
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm9.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm9.eq)(users.id, userId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({
            success: false,
            error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." }
          });
          return;
        }
        res.json({
          success: true,
          data: userRecord[0]
        });
      } catch (error) {
        console.error("Me error:", error);
        res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Bilgiler al\u0131n\u0131rken hata olu\u015Ftu." }
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, decoded.userId)).limit(1);
        if (userRecord.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
        }
        if (userRecord[0].isVerified) {
          return res.json({ success: true, data: { message: "Hesap zaten do\u011Frulanm\u0131\u015F." } });
        }
        await db.update(users).set({ isVerified: true, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.eq)(users.id, decoded.userId));
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
        const userRecord = await db.select({ id: users.id, username: users.username, displayName: profiles.displayName, passwordHash: users.passwordHash }).from(users).leftJoin(profiles, (0, import_drizzle_orm9.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm9.eq)(users.email, email)).limit(1);
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
        const userRecord = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where((0, import_drizzle_orm9.eq)(users.id, userId)).limit(1);
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
        const passwordHash = await import_argon2.default.hash(newPassword);
        await db.update(users).set({ passwordHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.eq)(users.id, userId));
        await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.eq)(refreshTokens.userId, decoded.userId));
        res.json({ success: true, data: { message: "\u015Eifreniz ba\u015Far\u0131yla g\xFCncellendi." } });
      } catch (error) {
        console.error("Reset password error:", error);
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F token." } });
      }
    });
    authRouter.get("/sessions", requireAuth, async (req, res) => {
      try {
        const activeTokens = await db.select().from(refreshTokens).where(
          (0, import_drizzle_orm9.and)(
            (0, import_drizzle_orm9.eq)(refreshTokens.userId, requireAuthContext(req)),
            import_drizzle_orm9.sql`${refreshTokens.revokedAt} IS NULL`,
            import_drizzle_orm9.sql`${refreshTokens.expiresAt} > NOW()`
          )
        ).orderBy((0, import_drizzle_orm9.desc)(refreshTokens.lastActiveAt));
        let currentHash = "";
        const currentToken = req.cookies.refreshToken;
        if (currentToken) {
          for (const t of activeTokens) {
            try {
              const isMatch = await import_argon2.default.verify(t.tokenHash, currentToken);
              if (isMatch) {
                currentHash = t.tokenHash;
                await db.update(refreshTokens).set({ lastActiveAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.eq)(refreshTokens.id, t.id));
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
            (0, import_drizzle_orm9.and)(
              (0, import_drizzle_orm9.eq)(refreshTokens.userId, requireAuthContext(req)),
              import_drizzle_orm9.sql`${refreshTokens.revokedAt} IS NULL`,
              import_drizzle_orm9.sql`${refreshTokens.expiresAt} > NOW()`
            )
          );
          for (const t of activeTokens) {
            try {
              if (await import_argon2.default.verify(t.tokenHash, currentToken)) {
                currentId = t.id;
                break;
              }
            } catch (e) {
            }
          }
        }
        if (currentId) {
          await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where(
            (0, import_drizzle_orm9.and)(
              (0, import_drizzle_orm9.eq)(refreshTokens.userId, requireAuthContext(req)),
              import_drizzle_orm9.sql`${refreshTokens.id} != ${currentId}`
            )
          );
        } else {
          await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm9.eq)(refreshTokens.userId, requireAuthContext(req)));
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
          (0, import_drizzle_orm9.and)(
            (0, import_drizzle_orm9.eq)(refreshTokens.id, sessionId),
            (0, import_drizzle_orm9.eq)(refreshTokens.userId, requireAuthContext(req))
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
var import_zod3, paginationSchema, updateProfileSchema, createPostSchema, createCommentSchema, changePasswordSchema, changeEmailSchema, deleteAccountSchema;
var init_api = __esm({
  "server/validators/api.ts"() {
    "use strict";
    import_zod3 = require("zod");
    paginationSchema = import_zod3.z.object({
      page: import_zod3.z.coerce.number().min(1).default(1),
      limit: import_zod3.z.coerce.number().min(1).max(50).default(20),
      cursor: import_zod3.z.string().optional()
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
      visibility: import_zod3.z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]).default("PUBLIC"),
      postType: import_zod3.z.enum(["NORMAL", "POLL", "SENSITIVE"]).default("NORMAL"),
      contentWarning: import_zod3.z.string().max(100).optional(),
      pollOptions: import_zod3.z.array(import_zod3.z.string().min(1).max(100)).min(2).max(10).optional(),
      media: import_zod3.z.array(import_zod3.z.object({
        url: import_zod3.z.string(),
        type: import_zod3.z.enum(["image", "video"]),
        width: import_zod3.z.number().optional(),
        height: import_zod3.z.number().optional()
      })).optional()
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
var import_argon22, import_fs3, import_path3, import_express7, import_drizzle_orm10, import_otplib2, usersRouter;
var init_users = __esm({
  "server/routes/users.ts"() {
    "use strict";
    import_argon22 = __toESM(require("argon2"), 1);
    init_schema();
    init_api();
    init_mailer();
    init_jwt();
    import_fs3 = __toESM(require("fs"), 1);
    import_path3 = __toESM(require("path"), 1);
    import_express7 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm10 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_api();
    init_moderation();
    init_schema();
    import_otplib2 = require("otplib");
    init_encryption();
    usersRouter = (0, import_express7.Router)();
    usersRouter.get("/:username", optionalAuth, async (req, res) => {
      try {
        const { username } = req.params;
        const currentUserId = requireAuthContext(req);
        const userRecords = await db.select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
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
          defaultPostVisibility: profiles.defaultPostVisibility
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm10.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm10.eq)(users.username, username)).limit(1);
        if (userRecords.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const targetUser = userRecords[0];
        const blockRecord = await db.select().from(blocks).where(
          (0, import_drizzle_orm10.or)(
            (0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm10.eq)(blocks.blockedId, targetUser.id)),
            (0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(blocks.blockerId, targetUser.id), (0, import_drizzle_orm10.eq)(blocks.blockedId, currentUserId))
          )
        ).limit(1);
        if (blockRecord.length > 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const followerCountRes = await db.select({ count: import_drizzle_orm10.sql`count(*)` }).from(follows).where((0, import_drizzle_orm10.eq)(follows.followingId, targetUser.id));
        const followingCountRes = await db.select({ count: import_drizzle_orm10.sql`count(*)` }).from(follows).where((0, import_drizzle_orm10.eq)(follows.followerId, targetUser.id));
        const isFollowingRes = await db.select().from(follows).where((0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm10.eq)(follows.followingId, targetUser.id))).limit(1);
        const responseData = {
          ...targetUser,
          followersCount: followerCountRes[0].count,
          followingCount: followingCountRes[0].count,
          isFollowing: isFollowingRes.length > 0,
          notificationPreference: isFollowingRes.length > 0 ? isFollowingRes[0].notificationPreference : null
        };
        responseData.mutualFollowers = [];
        responseData.mutualFollowersCount = 0;
        if (currentUserId !== targetUser.id) {
          const myFollowing = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm10.eq)(follows.followerId, currentUserId));
          const myFollowingIds = myFollowing.map((f) => f.followingId);
          if (myFollowingIds.length > 0) {
            const mutuals = await db.select({
              id: users.id,
              username: users.username,
              avatarUrl: profiles.avatarUrl,
              displayName: profiles.displayName
            }).from(follows).innerJoin(users, (0, import_drizzle_orm10.eq)(users.id, follows.followerId)).leftJoin(profiles, (0, import_drizzle_orm10.eq)(profiles.userId, users.id)).where(
              (0, import_drizzle_orm10.and)(
                (0, import_drizzle_orm10.eq)(follows.followingId, targetUser.id),
                (0, import_drizzle_orm10.inArray)(follows.followerId, myFollowingIds)
              )
            ).limit(3);
            const mutualsCountRes = await db.select({ count: import_drizzle_orm10.sql`count(*)` }).from(follows).where(
              (0, import_drizzle_orm10.and)(
                (0, import_drizzle_orm10.eq)(follows.followingId, targetUser.id),
                (0, import_drizzle_orm10.inArray)(follows.followerId, myFollowingIds)
              )
            );
            responseData.mutualFollowers = mutuals;
            responseData.mutualFollowersCount = mutualsCountRes[0].count;
          }
        }
        res.json({ success: true, data: responseData });
      } catch (error) {
        console.error(error);
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
        await db.update(profiles).set({ ...parsed.data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm10.eq)(profiles.userId, currentUserId));
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm10.eq)(users.id, currentUserId)).limit(1);
        if (userRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
        const isPasswordValid = await import_argon22.default.verify(userRecord[0].passwordHash, currentPassword);
        if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Mevcut \u015Fifre hatal\u0131." } });
        const newHash = await import_argon22.default.hash(newPassword);
        await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm10.eq)(users.id, currentUserId));
        await db.update(refreshTokens).set({ revokedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm10.eq)(refreshTokens.userId, currentUserId));
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm10.eq)(users.id, currentUserId)).limit(1);
        const isPasswordValid = await import_argon22.default.verify(userRecord[0].passwordHash, password);
        if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "\u015Eifre hatal\u0131." } });
        const existingEmail = await db.select().from(users).where((0, import_drizzle_orm10.eq)(users.email, email)).limit(1);
        if (existingEmail.length > 0 && existingEmail[0].id !== currentUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu e-posta adresi zaten kullan\u0131l\u0131yor." } });
        }
        await db.update(users).set({ email, emailVerified: false, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm10.eq)(users.id, currentUserId));
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm10.eq)(users.id, currentUserId)).limit(1);
        const isPasswordValid = await import_argon22.default.verify(userRecord[0].passwordHash, password);
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
        const userProfile = await db.select({ avatarUrl: profiles.avatarUrl, coverUrl: profiles.coverUrl }).from(profiles).where((0, import_drizzle_orm10.eq)(profiles.userId, currentUserId)).limit(1);
        const userPosts = await db.select({ id: posts.id }).from(posts).where((0, import_drizzle_orm10.eq)(posts.userId, currentUserId));
        const postIds = userPosts.map((p) => p.id);
        let allMediaUrls = [];
        if (userProfile.length > 0) {
          if (userProfile[0].avatarUrl) allMediaUrls.push(userProfile[0].avatarUrl);
          if (userProfile[0].coverUrl) allMediaUrls.push(userProfile[0].coverUrl);
        }
        if (postIds.length > 0) {
          const pm = await db.select({ mediaUrl: postMedia.mediaUrl }).from(postMedia).where((0, import_drizzle_orm10.inArray)(postMedia.postId, postIds));
          allMediaUrls.push(...pm.map((m) => m.mediaUrl));
        }
        allMediaUrls.forEach((url) => {
          try {
            if (!url || !url.startsWith("/uploads/") || url.includes("..")) return;
            const filePath = import_path3.default.join(process.cwd(), url);
            if (import_fs3.default.existsSync(filePath)) import_fs3.default.unlinkSync(filePath);
          } catch (e) {
            console.error("File deletion failed:", e);
          }
        });
        await db.delete(users).where((0, import_drizzle_orm10.eq)(users.id, currentUserId));
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
          (0, import_drizzle_orm10.or)(
            (0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm10.eq)(follows.followingId, targetUserId)),
            (0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(follows.followerId, targetUserId), (0, import_drizzle_orm10.eq)(follows.followingId, currentUserId))
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
          (0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm10.eq)(blocks.blockedId, targetUserId))
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
        const result = await db.update(follows).set({ notificationPreference: preference }).where((0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm10.eq)(follows.followingId, targetUserId)));
        if (result.rowCount === 0) {
          return res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 takip edilmiyor." } });
        }
        res.json({ success: true, message: "Bildirim tercihi g\xFCncellendi." });
      } catch (error) {
        console.error("Follow preference error:", error);
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
  }).from(posts).where((0, import_drizzle_orm11.eq)(posts.id, postId)).limit(1);
  if (postRecord.length === 0) return false;
  const post = postRecord[0];
  if (post.userId === currentUserId) return true;
  const blockedIds = currentUserId ? await getBlockedIds(currentUserId) : [];
  if (blockedIds.includes(post.userId)) return false;
  if (post.visibility === "PRIVATE") return false;
  if (post.visibility === "FOLLOWERS") {
    const follow = currentUserId ? await db.select().from(follows).where((0, import_drizzle_orm11.and)((0, import_drizzle_orm11.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm11.eq)(follows.followingId, post.userId))).limit(1) : [];
    if (follow.length === 0) return false;
  }
  return true;
}
var import_drizzle_orm11;
var init_visibility = __esm({
  "server/utils/visibility.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm11 = require("drizzle-orm");
    init_blocks();
  }
});

// server/routes/posts.ts
var posts_exports = {};
__export(posts_exports, {
  postsRouter: () => postsRouter
});
var import_express8, import_drizzle_orm12, import_fs4, import_path4, postsRouter;
var init_posts = __esm({
  "server/routes/posts.ts"() {
    "use strict";
    import_express8 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm12 = require("drizzle-orm");
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
    import_path4 = __toESM(require("path"), 1);
    postsRouter = (0, import_express8.Router)();
    postsRouter.post("/:id/poll/vote", requireAuth, strictLimiter, async (req, res) => {
      try {
        const postId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const { optionId } = req.body;
        if (!optionId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "optionId gereklidir." } });
        }
        const postRecord = await db.select({ postType: posts.postType }).from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0 || postRecord[0].postType !== "POLL") {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Anket bulunamad\u0131." } });
        }
        const optionRecord = await db.select().from(pollOptions).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(pollOptions.id, optionId), (0, import_drizzle_orm12.eq)(pollOptions.postId, postId))).limit(1);
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
          createdAt: posts.createdAt,
          userId: posts.userId,
          // We need this to check owner
          user: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
            allowSearchEngineIndexing: profiles.allowSearchEngineIndexing
          }
        }).from(posts).innerJoin(users, (0, import_drizzle_orm12.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.and)(
          (0, import_drizzle_orm12.eq)(posts.id, postId),
          (0, import_drizzle_orm12.or)(
            (0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"),
            currentUserId ? (0, import_drizzle_orm12.eq)(posts.userId, currentUserId) : import_drizzle_orm12.sql`false`
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
          const options = await db.select().from(pollOptions).where((0, import_drizzle_orm12.eq)(pollOptions.postId, postId)).orderBy(pollOptions.order);
          const votes = await db.select().from(pollVotes).where((0, import_drizzle_orm12.eq)(pollVotes.postId, postId));
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
        const media = await db.select().from(postMedia).where((0, import_drizzle_orm12.eq)(postMedia.postId, postId));
        const repostRecords = await db.select().from(reposts).where((0, import_drizzle_orm12.eq)(reposts.postId, postId));
        const repostCount = repostRecords.length;
        const isReposted = repostRecords.some((r) => r.userId === currentUserId);
        res.json({ success: true, data: { ...post, media, repostCount, isReposted, pollData } });
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
          const communityRecord = await db.select().from(communities).where((0, import_drizzle_orm12.eq)(communities.id, communityId)).limit(1);
          if (communityRecord.length === 0) {
            return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
          }
          const memberRecord = await db.select().from(communityMembers).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm12.eq)(communityMembers.userId, currentUserId))).limit(1);
          if (memberRecord.length === 0 && communityRecord[0].ownerId !== currentUserId) {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu toplulu\u011Fa g\xF6nderi payla\u015Fmak i\xE7in \xFCye olmal\u0131s\u0131n\u0131z." } });
          }
        }
        let finalVisibility = visibility;
        if (!finalVisibility) {
          const p = await db.select({ defaultPostVisibility: profiles.defaultPostVisibility }).from(profiles).where((0, import_drizzle_orm12.eq)(profiles.userId, currentUserId)).limit(1);
          finalVisibility = p.length > 0 ? p[0].defaultPostVisibility : "PUBLIC";
        }
        const modResult = await moderateContent(content || "");
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        let returnedError = null;
        const result = await db.transaction(async (tx) => {
          const [newPost] = await tx.insert(posts).values({
            userId: currentUserId,
            content: content || null,
            visibility: finalVisibility,
            postType: parsed.data.postType,
            contentWarning: parsed.data.contentWarning || null,
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
            }).from(users).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.inArray)(users.username, extractedMentions));
            for (const mUser of mentionedUsers) {
              if (mUser.id !== currentUserId) {
                let canMention = true;
                if (mUser.mentionPreference === "NONE") {
                  canMention = false;
                } else if (mUser.mentionPreference === "FOLLOWERS") {
                  const isFollowedByTarget = await tx.select().from(follows).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(follows.followerId, mUser.id), (0, import_drizzle_orm12.eq)(follows.followingId, currentUserId))).limit(1);
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
                set: { usageCount: import_drizzle_orm12.sql`${hashtags.usageCount} + 1` }
              }).returning();
              await tx.insert(postHashtags).values({
                postId: newPost.id,
                hashtagId: insertedTag.id
              }).onConflictDoNothing();
            }
          }
          if (media && media.length > 0) {
            await tx.insert(postMedia).values(
              media.map((m, i) => ({
                postId: newPost.id,
                mediaUrl: m.url,
                mediaType: m.type,
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
            const { users: users2, follows: follows2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
            const { notify: notify2 } = await Promise.resolve().then(() => (init_notifications(), notifications_exports));
            const author = await db.select({
              isOfficialAccount: users2.isOfficialAccount,
              officialNotifyEnabled: users2.officialNotifyEnabled
            }).from(users2).where((0, import_drizzle_orm12.eq)(users2.id, currentUserId)).limit(1);
            if (author.length > 0 && author[0].isOfficialAccount && author[0].officialNotifyEnabled) {
              const followers = await db.select({ followerId: follows2.followerId, preference: follows2.notificationPreference }).from(follows2).where((0, import_drizzle_orm12.eq)(follows2.followingId, currentUserId));
              const { notifications: notifications3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
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
                  await db.insert(notifications3).values(notifsToInsert.slice(i, i + chunkSize)).onConflictDoNothing();
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        if (postRecord[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz i\u015Flem." } });
        const modResult = await moderateContent(postContent);
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        await db.update(posts).set({ content: postContent, moderationStatus: modStatus, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        if (postRecord[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz i\u015Flem." } });
        const postTags = await db.select().from(postHashtags).where((0, import_drizzle_orm12.eq)(postHashtags.postId, postId));
        if (postTags.length > 0) {
          const tagIds = postTags.map((pt) => pt.hashtagId);
          await db.update(hashtags).set({ usageCount: import_drizzle_orm12.sql`${hashtags.usageCount} - 1` }).where((0, import_drizzle_orm12.inArray)(hashtags.id, tagIds));
        }
        const media = await db.select().from(postMedia).where((0, import_drizzle_orm12.eq)(postMedia.postId, postId));
        media.forEach((m) => {
          try {
            if (!m.mediaUrl || !m.mediaUrl.startsWith("/uploads/") || m.mediaUrl.includes("..")) {
              return;
            }
            const filePath = import_path4.default.join(process.cwd(), m.mediaUrl);
            if (import_fs4.default.existsSync(filePath)) import_fs4.default.unlinkSync(filePath);
          } catch (e) {
            console.error("File deletion failed:", e);
          }
        });
        await db.delete(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        let wasLiked = false;
        try {
          await db.transaction(async (tx) => {
            const existing = await tx.select().from(likes).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(likes.postId, postId), (0, import_drizzle_orm12.eq)(likes.userId, currentUserId))).limit(1);
            if (existing.length === 0) {
              await tx.insert(likes).values({ postId, userId: currentUserId });
              await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} + 1, 0)` }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.eq)(posts.id, postId)).limit(1);
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(likes).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(likes.postId, postId), (0, import_drizzle_orm12.eq)(likes.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(likes).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(likes.postId, postId), (0, import_drizzle_orm12.eq)(likes.userId, currentUserId)));
            if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
              await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} - 1, 0)` }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
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
            }).from(users).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.inArray)(users.username, extractedMentions));
            for (const mUser of mentionedUsers) {
              if (mUser.id !== currentUserId) {
                let canMention = true;
                if (mUser.mentionPreference === "NONE") {
                  canMention = false;
                } else if (mUser.mentionPreference === "FOLLOWERS") {
                  const isFollowedByTarget = await tx.select().from(follows).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(follows.followerId, mUser.id), (0, import_drizzle_orm12.eq)(follows.followingId, currentUserId))).limit(1);
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
            await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} + 3, 0)` }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
          }
          const userProfile = await tx.select({ username: users.username, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl }).from(users).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.eq)(users.id, currentUserId)).limit(1);
          return { ...newComment, user: userProfile[0] };
        });
        if (returnedError) {
          return res.status(403).json({ success: false, error: returnedError });
        }
        if (modStatus === "APPROVED") {
          await notify(currentUserId, postRecord[0].userId, "comment", postId, comment.id);
          if (parsed.data.parentId) {
            const parentRecord = await db.select().from(comments).where((0, import_drizzle_orm12.eq)(comments.id, parsed.data.parentId)).limit(1);
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
        const c = await db.select().from(comments).where((0, import_drizzle_orm12.eq)(comments.id, commentId)).limit(1);
        if (c.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Yorum bulunamad\u0131." } });
        if (c[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        const modResult = await moderateContent(commentContent);
        const modStatus = modResult.riskLevel === "HIGH_RISK" ? "REJECTED" : modResult.riskLevel === "MEDIUM_RISK" ? "PENDING" : "APPROVED";
        await db.update(comments).set({ content: commentContent, moderationStatus: modStatus, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm12.eq)(comments.id, commentId));
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
        const c = await db.select().from(comments).where((0, import_drizzle_orm12.eq)(comments.id, commentId)).limit(1);
        if (c.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Yorum bulunamad\u0131." } });
        if (c[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.eq)(posts.id, c[0].postId)).limit(1);
        await db.transaction(async (tx) => {
          await tx.delete(comments).where((0, import_drizzle_orm12.eq)(comments.id, commentId));
          if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
            await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} - 3, 0)` }).where((0, import_drizzle_orm12.eq)(posts.id, c[0].postId));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        try {
          await db.transaction(async (tx) => {
            const existing = await tx.select().from(bookmarks).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(bookmarks.postId, postId), (0, import_drizzle_orm12.eq)(bookmarks.userId, currentUserId))).limit(1);
            if (existing.length === 0) {
              await tx.insert(bookmarks).values({ postId, userId: currentUserId });
              if (postRecord[0].userId !== currentUserId) {
                await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} + 4, 0)` }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.eq)(posts.id, postId)).limit(1);
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(bookmarks).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(bookmarks.postId, postId), (0, import_drizzle_orm12.eq)(bookmarks.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(bookmarks).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(bookmarks.postId, postId), (0, import_drizzle_orm12.eq)(bookmarks.userId, currentUserId)));
            if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
              await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} - 4, 0)` }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        let wasReposted = false;
        try {
          await db.transaction(async (tx) => {
            const existing = await tx.select().from(reposts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(reposts.postId, postId), (0, import_drizzle_orm12.eq)(reposts.userId, currentUserId))).limit(1);
            if (existing.length === 0) {
              await tx.insert(reposts).values({ postId, userId: currentUserId });
              await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} + 4, 0)` }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm12.eq)(posts.id, postId)).limit(1);
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(reposts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(reposts.postId, postId), (0, import_drizzle_orm12.eq)(reposts.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(reposts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(reposts.postId, postId), (0, import_drizzle_orm12.eq)(reposts.userId, currentUserId)));
            if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
              await tx.update(posts).set({ baseScore: import_drizzle_orm12.sql`GREATEST(${posts.baseScore} - 4, 0)` }).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId))));
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
        const post = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (post.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
          return;
        }
        if (post[0].userId !== currentUserId) {
          res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        const target = await db.select().from(users).where((0, import_drizzle_orm12.eq)(users.id, targetUserId)).limit(1);
        if (target.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        const existing = await db.select().from(postCollaborators).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(postCollaborators.postId, postId), (0, import_drizzle_orm12.eq)(postCollaborators.userId, targetUserId))).limit(1);
        if (existing.length > 0) {
          if (existing[0].status === "pending") {
            res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu kullan\u0131c\u0131ya zaten davet g\xF6nderilmi\u015F." } });
            return;
          } else if (existing[0].status === "accepted") {
            res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu kullan\u0131c\u0131 zaten ortak \xFCretici." } });
            return;
          } else {
            await db.update(postCollaborators).set({ status: "pending", updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm12.eq)(postCollaborators.id, existing[0].id));
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
        const post = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(posts.id, postId), (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm12.eq)(posts.userId, currentUserId)))).limit(1);
        if (post.length === 0) {
          res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
          return;
        }
        if (post[0].userId !== currentUserId && currentUserId !== targetUserId) {
          res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flem i\xE7in yetkiniz yok." } });
          return;
        }
        await db.delete(postCollaborators).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(postCollaborators.postId, postId), (0, import_drizzle_orm12.eq)(postCollaborators.userId, targetUserId)));
        res.json({ success: true, message: "Ortak \xFCretici kald\u0131r\u0131ld\u0131." });
      } catch (error) {
        console.error("Remove collaborator error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    postsRouter.get("/:id/collaborators", async (req, res) => {
      try {
        const postId = parseInt(req.params.id, 10);
        if (isNaN(postId)) {
          res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz ID." } });
          return;
        }
        const list = await db.select({
          userId: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          status: postCollaborators.status
        }).from(postCollaborators).innerJoin(users, (0, import_drizzle_orm12.eq)(postCollaborators.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm12.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm12.and)(
          (0, import_drizzle_orm12.eq)(postCollaborators.postId, postId),
          (0, import_drizzle_orm12.or)((0, import_drizzle_orm12.eq)(postCollaborators.status, "accepted"), (0, import_drizzle_orm12.eq)(postCollaborators.status, "pending"))
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
  let allMedia = [];
  let repostStats = [];
  let likeStats = [];
  let bookmarkStats = [];
  let commentStats = [];
  let allCollabs = [];
  let allPollOptions = [];
  let allPollVotes = [];
  if (postIds.length > 0) {
    [allMedia, repostStats, likeStats, bookmarkStats, commentStats, allCollabs, allPollOptions, allPollVotes] = await Promise.all([
      db.select().from(postMedia).where((0, import_drizzle_orm13.inArray)(postMedia.postId, postIds)),
      db.select({
        postId: reposts.postId,
        count: import_drizzle_orm13.sql`cast(count(*) as integer)`,
        isReposted: import_drizzle_orm13.sql`MAX(CASE WHEN ${reposts.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(reposts).where((0, import_drizzle_orm13.inArray)(reposts.postId, postIds)).groupBy(reposts.postId),
      db.select({
        postId: likes.postId,
        count: import_drizzle_orm13.sql`cast(count(*) as integer)`,
        isLiked: import_drizzle_orm13.sql`MAX(CASE WHEN ${likes.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(likes).where((0, import_drizzle_orm13.inArray)(likes.postId, postIds)).groupBy(likes.postId),
      db.select({
        postId: bookmarks.postId,
        isSaved: import_drizzle_orm13.sql`MAX(CASE WHEN ${bookmarks.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(bookmarks).where((0, import_drizzle_orm13.inArray)(bookmarks.postId, postIds)).groupBy(bookmarks.postId),
      db.select({
        postId: comments.postId,
        count: import_drizzle_orm13.sql`cast(count(*) as integer)`
      }).from(comments).where((0, import_drizzle_orm13.inArray)(comments.postId, postIds)).groupBy(comments.postId),
      db.select({
        postId: postCollaborators.postId,
        userId: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      }).from(postCollaborators).innerJoin(users, (0, import_drizzle_orm13.eq)(postCollaborators.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm13.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm13.and)((0, import_drizzle_orm13.inArray)(postCollaborators.postId, postIds), (0, import_drizzle_orm13.eq)(postCollaborators.status, "accepted"))),
      db.select().from(pollOptions).where((0, import_drizzle_orm13.inArray)(pollOptions.postId, postIds)),
      db.select({
        optionId: pollVotes.optionId,
        postId: pollVotes.postId,
        count: import_drizzle_orm13.sql`cast(count(*) as integer)`,
        isVoted: import_drizzle_orm13.sql`MAX(CASE WHEN ${pollVotes.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(pollVotes).where((0, import_drizzle_orm13.inArray)(pollVotes.postId, postIds)).groupBy(pollVotes.optionId, pollVotes.postId)
    ]);
  }
  const repostsMap = new Map(repostStats.map((s) => [s.postId, { count: s.count, isReposted: s.isReposted === 1 }]));
  const likesMap = new Map(likeStats.map((s) => [s.postId, { count: s.count, isLiked: s.isLiked === 1 }]));
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
    const pCollabs = collabsMap.get(p.id) || [];
    const rStat = repostsMap.get(p.id) || { count: 0, isReposted: false };
    const lStat = likesMap.get(p.id) || { count: 0, isLiked: false };
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
    return {
      ...p,
      pollData: pPollOptions,
      media: pMedia,
      repostCount: rStat.count,
      isReposted: rStat.isReposted,
      likeCount: lStat.count,
      isLiked: lStat.isLiked,
      commentCount: cStat.count,
      isSaved: bStat.isSaved,
      collaborators: pCollabs.map((c) => ({ userId: c.userId, username: c.username, displayName: c.displayName, avatarUrl: c.avatarUrl }))
    };
  });
}
var import_drizzle_orm13;
var init_postStats = __esm({
  "server/utils/postStats.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm13 = require("drizzle-orm");
  }
});

// server/routes/feed.ts
var feed_exports = {};
__export(feed_exports, {
  feedRouter: () => feedRouter
});
var import_express9, import_drizzle_orm14, import_zod4, import_express_rate_limit2, feedRouter, viewLimiter, viewSchema, ALGO_CONFIG;
var init_feed = __esm({
  "server/routes/feed.ts"() {
    "use strict";
    import_express9 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm14 = require("drizzle-orm");
    init_auth();
    init_postStats();
    init_api();
    init_blocks();
    init_visibility();
    import_zod4 = require("zod");
    import_express_rate_limit2 = __toESM(require("express-rate-limit"), 1);
    feedRouter = (0, import_express9.Router)();
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
          (0, import_drizzle_orm14.and)(
            (0, import_drizzle_orm14.eq)(postViews.userId, currentUserId),
            (0, import_drizzle_orm14.eq)(postViews.postId, postId),
            import_drizzle_orm14.sql`${postViews.viewedAt} > ${fiveMinutesAgo.toISOString()}`
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
          await tx.update(posts).set({ viewCount: import_drizzle_orm14.sql`${posts.viewCount} + 1` }).where((0, import_drizzle_orm14.eq)(posts.id, postId));
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
    feedRouter.get("/", optionalAuth, async (req, res) => {
      try {
        const currentUserId = req.user?.userId ?? null;
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: void 0 };
        const offset = (page - 1) * limit;
        const blockedIds = currentUserId ? await getBlockedIds(currentUserId) : [];
        const safeBlockedIds = blockedIds.length > 0 ? blockedIds : [-1];
        let followingIds = [];
        if (currentUserId) {
          const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm14.eq)(follows.followerId, currentUserId));
          followingIds = followingRecords.map((f) => f.followingId).filter((id) => !blockedIds.includes(id));
        }
        const safeFollowingIds = followingIds.length > 0 ? followingIds : [-1];
        const ageInHours = import_drizzle_orm14.sql`GREATEST(EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600, 0)`;
        let isFollowingBonus = import_drizzle_orm14.sql`0`;
        let isOwnPostBonus = import_drizzle_orm14.sql`0`;
        let userViewsCountSq = import_drizzle_orm14.sql`0`;
        if (currentUserId) {
          const followingIdsSql = import_drizzle_orm14.sql.join(safeFollowingIds.map((id) => import_drizzle_orm14.sql`${id}`), import_drizzle_orm14.sql`, `);
          isFollowingBonus = import_drizzle_orm14.sql`CASE WHEN ${posts.userId} IN (${followingIdsSql}) THEN ${ALGO_CONFIG.FOLLOWING_BONUS} ELSE 0 END`;
          isOwnPostBonus = import_drizzle_orm14.sql`CASE WHEN ${posts.userId} = ${currentUserId} THEN ${ALGO_CONFIG.OWN_POST_BONUS} ELSE 0 END`;
          userViewsCountSq = import_drizzle_orm14.sql`(SELECT COUNT(*) FROM ${postViews} pv WHERE pv.post_id = ${posts.id} AND pv.user_id = ${currentUserId})`;
        }
        const numerator = import_drizzle_orm14.sql`GREATEST((${posts.baseScore} * ${ALGO_CONFIG.BASE_SCORE_WEIGHT}) + ${isFollowingBonus} + ${isOwnPostBonus} - (${userViewsCountSq} * ${ALGO_CONFIG.USER_VIEW_PENALTY}), 0.1)`;
        const denominator = import_drizzle_orm14.sql`POWER(${ageInHours} + ${ALGO_CONFIG.TIME_CONSTANT}, ${ALGO_CONFIG.GRAVITY})`;
        const rankScore = import_drizzle_orm14.sql`${numerator} / ${denominator}`;
        const whereConditions = [
          (0, import_drizzle_orm14.isNull)(posts.communityId),
          (0, import_drizzle_orm14.eq)(posts.moderationStatus, "APPROVED"),
          import_drizzle_orm14.sql`${posts.createdAt} >= NOW() - INTERVAL '30 days'`
        ];
        if (currentUserId) {
          whereConditions.push(
            (0, import_drizzle_orm14.or)(
              (0, import_drizzle_orm14.eq)(posts.userId, currentUserId),
              // Kendi gönderileri
              (0, import_drizzle_orm14.and)(
                // Takip ettiklerinin gönderileri
                (0, import_drizzle_orm14.inArray)(posts.userId, safeFollowingIds),
                (0, import_drizzle_orm14.or)((0, import_drizzle_orm14.eq)(posts.visibility, "PUBLIC"), (0, import_drizzle_orm14.eq)(posts.visibility, "FOLLOWERS"))
              ),
              (0, import_drizzle_orm14.and)(
                // Herkese açık olan, ama engellenmemiş genel gönderiler (Discover/Keşfet)
                (0, import_drizzle_orm14.eq)(posts.visibility, "PUBLIC"),
                (0, import_drizzle_orm14.not)((0, import_drizzle_orm14.inArray)(posts.userId, safeBlockedIds))
              )
            )
          );
        } else {
          whereConditions.push(
            (0, import_drizzle_orm14.eq)(posts.visibility, "PUBLIC")
          );
        }
        const feedPosts = await db.select({
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
        }).from(posts).innerJoin(users, (0, import_drizzle_orm14.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm14.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm14.and)(...whereConditions.filter(Boolean))).orderBy((0, import_drizzle_orm14.desc)(rankScore)).limit(limit).offset(offset);
        const formattedPosts = await populatePostStats(feedPosts, currentUserId ?? -1);
        res.json({ success: true, data: formattedPosts });
      } catch (error) {
        console.error("Feed error:", error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    feedRouter.get("/following", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const blockedIds = await getBlockedIds(currentUserId);
        const safeBlockedIds = blockedIds.length > 0 ? blockedIds : [-1];
        const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm14.eq)(follows.followerId, currentUserId));
        let followingIds = followingRecords.map((f) => f.followingId).filter((id) => !blockedIds.includes(id));
        const safeFollowingIds = followingIds.length > 0 ? followingIds : [-1];
        if (safeFollowingIds[0] === -1) {
          return res.json({ success: true, data: [], meta: { followingCount: 0 } });
        }
        const ageInHours = import_drizzle_orm14.sql`GREATEST(EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600, 0)`;
        const userViewsCountSq = import_drizzle_orm14.sql`(SELECT COUNT(*) FROM ${postViews} pv WHERE pv.post_id = ${posts.id} AND pv.user_id = ${currentUserId})`;
        const numerator = import_drizzle_orm14.sql`GREATEST((${posts.baseScore} * ${ALGO_CONFIG.BASE_SCORE_WEIGHT}) + ${ALGO_CONFIG.FOLLOWING_BONUS} - (${userViewsCountSq} * ${ALGO_CONFIG.USER_VIEW_PENALTY}), 0.1)`;
        const denominator = import_drizzle_orm14.sql`POWER(${ageInHours} + ${ALGO_CONFIG.TIME_CONSTANT}, ${ALGO_CONFIG.GRAVITY})`;
        const rankScore = import_drizzle_orm14.sql`${numerator} / ${denominator}`;
        const feedPosts = await db.select({
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
        }).from(posts).innerJoin(users, (0, import_drizzle_orm14.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm14.eq)(users.id, profiles.userId)).where(
          (0, import_drizzle_orm14.and)(
            (0, import_drizzle_orm14.isNull)(posts.communityId),
            (0, import_drizzle_orm14.eq)(posts.moderationStatus, "APPROVED"),
            (0, import_drizzle_orm14.inArray)(posts.userId, safeFollowingIds),
            (0, import_drizzle_orm14.not)((0, import_drizzle_orm14.inArray)(posts.userId, safeBlockedIds)),
            (0, import_drizzle_orm14.or)((0, import_drizzle_orm14.eq)(posts.visibility, "PUBLIC"), (0, import_drizzle_orm14.eq)(posts.visibility, "FOLLOWERS"))
          )
        ).orderBy((0, import_drizzle_orm14.desc)(rankScore)).limit(limit).offset(offset);
        const formattedPosts = await populatePostStats(feedPosts, currentUserId);
        res.json({ success: true, data: formattedPosts, meta: { followingCount: followingIds.length } });
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
var import_express10, import_drizzle_orm15, userPostsRouter;
var init_userPosts = __esm({
  "server/routes/userPosts.ts"() {
    "use strict";
    import_express10 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm15 = require("drizzle-orm");
    init_cursor();
    init_auth();
    init_postStats();
    init_api();
    init_blocks();
    userPostsRouter = (0, import_express10.Router)();
    userPostsRouter.get("/:id/posts", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: void 0 };
        const offset = (page - 1) * limit;
        let cursorCondition = void 0;
        if (cursor) {
          const decoded = decodeCursor(cursor);
          if (decoded) {
            cursorCondition = (0, import_drizzle_orm15.or)((0, import_drizzle_orm15.lt)(posts.createdAt, decoded.createdAt), (0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(posts.createdAt, decoded.createdAt), (0, import_drizzle_orm15.lt)(posts.id, decoded.id)));
          }
        }
        const userPosts = await db.select({
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
        }).from(posts).innerJoin(users, (0, import_drizzle_orm15.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm15.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(posts.userId, targetUserId), (0, import_drizzle_orm15.isNull)(posts.communityId), (0, import_drizzle_orm15.or)((0, import_drizzle_orm15.eq)(posts.moderationStatus, "APPROVED"), (0, import_drizzle_orm15.eq)(posts.userId, currentUserId)), cursorCondition ? cursorCondition : void 0)).orderBy((0, import_drizzle_orm15.desc)(posts.createdAt), (0, import_drizzle_orm15.desc)(posts.id)).limit(limit).offset(offset);
        const targetProfile = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where((0, import_drizzle_orm15.eq)(profiles.userId, targetUserId)).limit(1);
        const isPrivate = targetProfile.length > 0 ? targetProfile[0].isPrivate : false;
        const followRecord = await db.select().from(follows).where((0, import_drizzle_orm15.and)((0, import_drizzle_orm15.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm15.eq)(follows.followingId, targetUserId))).limit(1);
        const isFollowing = followRecord.length > 0;
        const isSelf = currentUserId === targetUserId;
        if (isPrivate && !isSelf && !isFollowing) {
          return res.json({ success: true, data: [] });
        }
        const blockedIds = await getBlockedIds(currentUserId);
        if (blockedIds.includes(targetUserId)) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullan\u0131c\u0131ya eri\u015Fiminiz yok." } });
        }
        const visiblePosts = userPosts.filter((p) => {
          if (p.visibility === "PUBLIC") return true;
          if (isSelf) return true;
          if (p.visibility === "FOLLOWERS" && isFollowing) return true;
          return false;
        });
        const formattedPosts = await populatePostStats(visiblePosts, currentUserId);
        let nextCursor = void 0;
        if (visiblePosts.length === limit) {
          const last = visiblePosts[visiblePosts.length - 1];
          nextCursor = encodeCursor(last.createdAt, last.id);
        }
        res.json({ success: true, data: formattedPosts, meta: { nextCursor } });
      } catch (error) {
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
var import_express11, import_drizzle_orm16, followsRouter;
var init_follows = __esm({
  "server/routes/follows.ts"() {
    "use strict";
    import_express11 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm16 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_schema();
    init_api();
    followsRouter = (0, import_express11.Router)();
    followsRouter.post("/:id/follow", requireAuth, standardLimiter, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        if (targetUserId === currentUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi takip edemezsiniz." } });
        }
        const blockRecord = await db.select().from(blocks).where(
          (0, import_drizzle_orm16.or)(
            (0, import_drizzle_orm16.and)((0, import_drizzle_orm16.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm16.eq)(blocks.blockedId, targetUserId)),
            (0, import_drizzle_orm16.and)((0, import_drizzle_orm16.eq)(blocks.blockerId, targetUserId), (0, import_drizzle_orm16.eq)(blocks.blockedId, currentUserId))
          )
        ).limit(1);
        if (blockRecord.length > 0) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flemi ger\xE7ekle\u015Ftiremezsiniz." } });
        }
        await db.transaction(async (tx) => {
          const result = await tx.insert(follows).values({ followerId: currentUserId, followingId: targetUserId }).onConflictDoNothing();
          if (result.rowCount && result.rowCount > 0) {
            await tx.insert(notifications).values({ actorId: currentUserId, recipientId: targetUserId, type: "follow" });
          }
        });
        res.json({ success: true, data: { message: "Takip ediliyor." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.delete("/:id/follow", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        await db.delete(follows).where((0, import_drizzle_orm16.and)((0, import_drizzle_orm16.eq)(follows.followerId, currentUserId), (0, import_drizzle_orm16.eq)(follows.followingId, targetUserId)));
        res.json({ success: true, data: { message: "Takipten \xE7\u0131k\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.get("/:id/followers", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const followersList = await db.select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(follows).innerJoin(users, (0, import_drizzle_orm16.eq)(follows.followerId, users.id)).leftJoin(profiles, (0, import_drizzle_orm16.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm16.eq)(follows.followingId, targetUserId)).limit(limit).offset(offset);
        res.json({ success: true, data: followersList });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    followsRouter.get("/:id/following", requireAuth, async (req, res) => {
      try {
        const targetUserId = parseInt(req.params.id);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const followingList = await db.select({
          id: users.id,
          username: users.username,
          isVerified: users.isVerified,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(follows).innerJoin(users, (0, import_drizzle_orm16.eq)(follows.followingId, users.id)).leftJoin(profiles, (0, import_drizzle_orm16.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm16.eq)(follows.followerId, targetUserId)).limit(limit).offset(offset);
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
var import_express12, import_drizzle_orm17, bookmarksRouter;
var init_bookmarks = __esm({
  "server/routes/bookmarks.ts"() {
    "use strict";
    import_express12 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm17 = require("drizzle-orm");
    init_auth();
    init_postStats();
    init_api();
    bookmarksRouter = (0, import_express12.Router)();
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
        }).from(bookmarks).innerJoin(posts, (0, import_drizzle_orm17.eq)(bookmarks.postId, posts.id)).innerJoin(users, (0, import_drizzle_orm17.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm17.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm17.eq)(bookmarks.userId, currentUserId)).orderBy((0, import_drizzle_orm17.desc)(bookmarks.createdAt)).limit(limit).offset(offset);
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
var import_express13, import_drizzle_orm18, searchRouter;
var init_search = __esm({
  "server/routes/search.ts"() {
    "use strict";
    import_express13 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm18 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_blocks();
    init_api();
    init_postStats();
    searchRouter = (0, import_express13.Router)();
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
        const currentUserId = requireAuthContext(req);
        const blockedIds = await getBlockedIds(currentUserId);
        const ignoreIds = blockedIds.length > 0 ? blockedIds : [-1];
        if (type === "users") {
          const searchResults = await db.select({
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }).from(users).leftJoin(profiles, (0, import_drizzle_orm18.eq)(users.id, profiles.userId)).where(
            (0, import_drizzle_orm18.and)(
              (0, import_drizzle_orm18.or)(
                (0, import_drizzle_orm18.ilike)(users.username, `%${q}%`),
                (0, import_drizzle_orm18.ilike)(profiles.displayName, `%${q}%`)
              ),
              (0, import_drizzle_orm18.notInArray)(users.id, ignoreIds)
            )
          ).limit(limit).offset(offset);
          return res.json({ success: true, data: searchResults });
        } else if (type === "posts") {
          const visibilityCondition = (0, import_drizzle_orm18.or)(
            (0, import_drizzle_orm18.eq)(posts.visibility, "PUBLIC"),
            (0, import_drizzle_orm18.eq)(posts.userId, currentUserId),
            (0, import_drizzle_orm18.and)(
              (0, import_drizzle_orm18.eq)(posts.visibility, "FOLLOWERS"),
              currentUserId !== -1 ? (0, import_drizzle_orm18.inArray)(posts.userId, db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm18.eq)(follows.followerId, currentUserId))) : import_drizzle_orm18.sql`FALSE`
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
          }).from(posts).innerJoin(users, (0, import_drizzle_orm18.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm18.eq)(users.id, profiles.userId)).where(
            (0, import_drizzle_orm18.and)(
              (0, import_drizzle_orm18.ilike)(posts.content, `%${q}%`),
              (0, import_drizzle_orm18.notInArray)(posts.userId, ignoreIds),
              visibilityCondition
            )
          ).orderBy((0, import_drizzle_orm18.desc)(posts.createdAt)).limit(limit).offset(offset);
          const formattedPosts = await populatePostStats(searchResults, currentUserId);
          return res.json({ success: true, data: formattedPosts });
        } else if (type === "tags") {
          if (q.startsWith("#")) {
            q = q.substring(1);
          }
          const searchResults = await db.select({
            id: hashtags.id,
            name: hashtags.name,
            postCount: import_drizzle_orm18.sql`(SELECT count(*) FROM ${postHashtags} WHERE ${postHashtags.hashtagId} = ${hashtags.id})`
          }).from(hashtags).where((0, import_drizzle_orm18.ilike)(hashtags.name, `%${q}%`)).limit(limit).offset(offset);
          return res.json({ success: true, data: searchResults });
        } else {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz arama tipi." } });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/notifications.ts
var notifications_exports2 = {};
__export(notifications_exports2, {
  notificationsRouter: () => notificationsRouter
});
var import_express14, import_drizzle_orm19, notificationsRouter;
var init_notifications2 = __esm({
  "server/routes/notifications.ts"() {
    "use strict";
    import_express14 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm19 = require("drizzle-orm");
    init_cursor();
    init_auth();
    init_api();
    notificationsRouter = (0, import_express14.Router)();
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
            cursorCondition = (0, import_drizzle_orm19.or)((0, import_drizzle_orm19.lt)(notifications.createdAt, decoded.createdAt), (0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(notifications.createdAt, decoded.createdAt), (0, import_drizzle_orm19.lt)(notifications.id, decoded.id)));
          }
        }
        const list = await db.select({
          id: notifications.id,
          type: notifications.type,
          postId: notifications.postId,
          projectId: notifications.projectId,
          commentId: notifications.commentId,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
          actor: {
            id: users.id,
            username: users.username,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl
          }
        }).from(notifications).innerJoin(users, (0, import_drizzle_orm19.eq)(notifications.actorId, users.id)).leftJoin(profiles, (0, import_drizzle_orm19.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(notifications.recipientId, currentUserId), cursorCondition ? cursorCondition : void 0)).orderBy((0, import_drizzle_orm19.desc)(notifications.createdAt), (0, import_drizzle_orm19.desc)(notifications.id)).limit(limit).offset(offset);
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
        await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm19.eq)(notifications.recipientId, currentUserId));
        res.json({ success: true, data: { message: "T\xFCm\xFC okundu olarak i\u015Faretlendi." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    notificationsRouter.post("/:id/read", requireAuth, async (req, res) => {
      try {
        const notifId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(notifications.id, notifId), (0, import_drizzle_orm19.eq)(notifications.recipientId, currentUserId)));
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
var import_express15, import_drizzle_orm20, blocksRouter;
var init_blocks2 = __esm({
  "server/routes/blocks.ts"() {
    "use strict";
    import_express15 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm20 = require("drizzle-orm");
    init_auth();
    blocksRouter = (0, import_express15.Router)();
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
        await db.delete(blocks).where((0, import_drizzle_orm20.and)((0, import_drizzle_orm20.eq)(blocks.blockerId, currentUserId), (0, import_drizzle_orm20.eq)(blocks.blockedId, targetUserId)));
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
        }).from(blocks).innerJoin(users, (0, import_drizzle_orm20.eq)(blocks.blockedId, users.id)).leftJoin(profiles, (0, import_drizzle_orm20.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm20.eq)(blocks.blockerId, currentUserId));
        res.json({ success: true, data: list });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
  }
});

// server/routes/media.ts
var media_exports = {};
__export(media_exports, {
  mediaRouter: () => mediaRouter
});
var import_express16, import_multer, import_path5, import_crypto3, import_fs5, import_sharp, import_file_type, mimeToExt, storage, dangerousExts, upload, mediaRouter;
var init_media = __esm({
  "server/routes/media.ts"() {
    "use strict";
    import_express16 = require("express");
    import_multer = __toESM(require("multer"), 1);
    import_path5 = __toESM(require("path"), 1);
    import_crypto3 = __toESM(require("crypto"), 1);
    import_fs5 = __toESM(require("fs"), 1);
    import_sharp = __toESM(require("sharp"), 1);
    import_file_type = require("file-type");
    init_auth();
    init_rateLimiter();
    init_uploadConfig();
    mimeToExt = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "video/mp4": ".mp4"
    };
    storage = import_multer.default.diskStorage({
      destination: (req, file, cb) => {
        cb(null, getUploadDir());
      },
      filename: (req, file, cb) => {
        const ext = mimeToExt[file.mimetype] || ".bin";
        const id = import_crypto3.default.randomBytes(16).toString("hex");
        cb(null, `${id}${ext}`);
      }
    });
    dangerousExts = [".exe", ".sh", ".bat", ".cmd", ".php", ".js", ".html", ".htm", ".jar", ".vbs", ".scr"];
    upload = (0, import_multer.default)({
      storage,
      limits: { fileSize: 50 * 1024 * 1024 },
      // 50MB max for video. Image is checked in controller.
      fileFilter: (req, file, cb) => {
        const allowedMimes = Object.keys(mimeToExt);
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(new Error("Desteklenmeyen dosya format\u0131."));
        }
        if (file.originalname) {
          const originalExt = import_path5.default.extname(file.originalname).toLowerCase();
          if (dangerousExts.includes(originalExt)) {
            return cb(new Error("G\xFCvenlik nedeniyle bu dosya uzant\u0131s\u0131na izin verilmiyor."));
          }
        }
        cb(null, true);
      }
    });
    mediaRouter = (0, import_express16.Router)();
    mediaRouter.post("/upload", requireAuth, strictLimiter, (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: err.message } });
        }
        next();
      });
    }, async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Dosya y\xFCklenemedi." } });
      }
      const filePath = req.file.path;
      try {
        const fileType = await (0, import_file_type.fileTypeFromFile)(filePath);
        const allowed = Object.keys(mimeToExt);
        if (!fileType || !allowed.includes(fileType.mime)) {
          import_fs5.default.unlinkSync(filePath);
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Ge\xE7ersiz veya desteklenmeyen dosya i\xE7eri\u011Fi (MIME uyumsuz)." } });
        }
        const isImage = fileType.mime.startsWith("image/");
        const size = req.file.size;
        if (isImage && size > 5 * 1024 * 1024) {
          import_fs5.default.unlinkSync(filePath);
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "G\xF6rseller maksimum 5MB olabilir." } });
        }
        if (!isImage && size > 50 * 1024 * 1024) {
          import_fs5.default.unlinkSync(filePath);
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Videolar maksimum 50MB olabilir." } });
        }
        if (isImage) {
          const metadata = await (0, import_sharp.default)(filePath).metadata();
          if (metadata.width && metadata.width > 8e3 || metadata.height && metadata.height > 8e3) {
            import_fs5.default.unlinkSync(filePath);
            return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "G\xF6rsel boyutlar\u0131 \xE7ok b\xFCy\xFCk (Max 8000x8000)." } });
          }
          const processedBuffer = await (0, import_sharp.default)(filePath).rotate().toBuffer();
          import_fs5.default.writeFileSync(filePath, processedBuffer);
        }
        const url = `/uploads/${req.file.filename}`;
        const type = isImage ? "image" : "video";
        res.json({ success: true, data: { url, type } });
      } catch (error) {
        console.error("Media upload error:", error);
        if (import_fs5.default.existsSync(filePath)) {
          import_fs5.default.unlinkSync(filePath);
        }
        res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Medya i\u015Flenirken hata olu\u015Ftu." } });
      }
    });
  }
});

// server/routes/stories.ts
var stories_exports = {};
__export(stories_exports, {
  storiesRouter: () => storiesRouter
});
var import_express17, import_drizzle_orm21, import_zod5, storiesRouter, createStorySchema;
var init_stories = __esm({
  "server/routes/stories.ts"() {
    "use strict";
    import_express17 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm21 = require("drizzle-orm");
    init_auth();
    init_blocks();
    import_zod5 = require("zod");
    storiesRouter = (0, import_express17.Router)();
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
    storiesRouter.get("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const blockedIds = await getBlockedIds(currentUserId);
        const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm21.eq)(follows.followerId, currentUserId));
        let targetIds = followingRecords.map((f) => f.followingId);
        targetIds.push(currentUserId);
        targetIds = targetIds.filter((id) => !blockedIds.includes(id));
        if (targetIds.length === 0) targetIds = [-1];
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
        }).from(stories).innerJoin(users, (0, import_drizzle_orm21.eq)(stories.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm21.eq)(users.id, profiles.userId)).where(
          (0, import_drizzle_orm21.and)(
            (0, import_drizzle_orm21.inArray)(stories.userId, targetIds),
            (0, import_drizzle_orm21.gt)(stories.expiresAt, /* @__PURE__ */ new Date())
          )
        ).orderBy((0, import_drizzle_orm21.desc)(stories.createdAt));
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
  }
});

// server/routes/messages.ts
var messages_exports = {};
__export(messages_exports, {
  messagesRouter: () => messagesRouter
});
var import_express18, import_drizzle_orm22, import_zod6, messagesRouter, createMessageSchema;
var init_messages = __esm({
  "server/routes/messages.ts"() {
    "use strict";
    import_express18 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm22 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    init_blocks();
    init_api();
    import_zod6 = require("zod");
    messagesRouter = (0, import_express18.Router)();
    messagesRouter.get("/conversations", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const offset = (page - 1) * limit;
        const memberships = await db.select().from(conversationMembers).where((0, import_drizzle_orm22.eq)(conversationMembers.userId, currentUserId));
        const convIds = memberships.map((m) => m.conversationId);
        if (convIds.length === 0) {
          return res.json({ success: true, data: [] });
        }
        const convs = await db.select().from(conversations).where((0, import_drizzle_orm22.inArray)(conversations.id, convIds)).orderBy((0, import_drizzle_orm22.desc)(conversations.updatedAt)).limit(limit).offset(offset);
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
        }).from(conversationMembers).innerJoin(users, (0, import_drizzle_orm22.eq)(conversationMembers.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm22.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.inArray)(conversationMembers.conversationId, fetchedConvIds), (0, import_drizzle_orm22.not)((0, import_drizzle_orm22.eq)(conversationMembers.userId, currentUserId))));
        const unreadCounts = await db.select({
          conversationId: messages.conversationId,
          count: import_drizzle_orm22.sql`cast(count(*) as integer)`
        }).from(messages).where((0, import_drizzle_orm22.and)(
          (0, import_drizzle_orm22.inArray)(messages.conversationId, fetchedConvIds),
          (0, import_drizzle_orm22.eq)(messages.isRead, false),
          (0, import_drizzle_orm22.not)((0, import_drizzle_orm22.eq)(messages.senderId, currentUserId))
        )).groupBy(messages.conversationId);
        const convIdsSql = import_drizzle_orm22.sql.join(fetchedConvIds.map((id) => import_drizzle_orm22.sql`${id}`), import_drizzle_orm22.sql`, `);
        const lastMessagesResult = await db.execute(import_drizzle_orm22.sql`
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
        const targetProfile = await db.select({ messagePreference: profiles.messagePreference }).from(profiles).where((0, import_drizzle_orm22.eq)(profiles.userId, targetUserId)).limit(1);
        if (targetProfile.length > 0) {
          const pref = targetProfile[0].messagePreference;
          if (pref === "NONE") {
            return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu kullan\u0131c\u0131ya mesaj g\xF6nderilemiyor." } });
          } else if (pref === "FOLLOWERS") {
            const isFollowedByTarget = await db.select().from(follows).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(follows.followerId, targetUserId), (0, import_drizzle_orm22.eq)(follows.followingId, currentUserId))).limit(1);
            if (isFollowedByTarget.length === 0) {
              return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullan\u0131c\u0131 sadece takip etti\u011Fi ki\u015Filerden mesaj kabul ediyor." } });
            }
          }
        }
        const userConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where((0, import_drizzle_orm22.eq)(conversationMembers.userId, currentUserId));
        const userConvIds = userConvs.map((c) => c.convId);
        if (userConvIds.length > 0) {
          const targetConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(conversationMembers.userId, targetUserId), (0, import_drizzle_orm22.inArray)(conversationMembers.conversationId, userConvIds))).limit(1);
          if (targetConvs.length > 0) {
            const [existing] = await db.select().from(conversations).where((0, import_drizzle_orm22.eq)(conversations.id, targetConvs[0].convId)).limit(1);
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
        const membership = await db.select().from(conversationMembers).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(conversationMembers.conversationId, conversationId), (0, import_drizzle_orm22.eq)(conversationMembers.userId, currentUserId))).limit(1);
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
        }).from(messages).innerJoin(users, (0, import_drizzle_orm22.eq)(messages.senderId, users.id)).leftJoin(profiles, (0, import_drizzle_orm22.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm22.eq)(messages.conversationId, conversationId)).orderBy((0, import_drizzle_orm22.desc)(messages.createdAt)).limit(limit).offset(offset);
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
        const membership = await db.select().from(conversationMembers).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(conversationMembers.conversationId, conversationId), (0, import_drizzle_orm22.eq)(conversationMembers.userId, currentUserId))).limit(1);
        if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        const [msg] = await db.insert(messages).values({
          conversationId,
          senderId: currentUserId,
          content: parsed.data.content || null,
          mediaUrl: parsed.data.mediaUrl || null
        }).returning();
        await db.update(conversations).set({ updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm22.eq)(conversations.id, conversationId));
        res.status(201).json({ success: true, data: msg });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    messagesRouter.patch("/conversations/:id/read", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const conversationId = parseInt(req.params.id);
        const membership = await db.select().from(conversationMembers).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(conversationMembers.conversationId, conversationId), (0, import_drizzle_orm22.eq)(conversationMembers.userId, currentUserId))).limit(1);
        if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
        await db.update(messages).set({ isRead: true }).where((0, import_drizzle_orm22.and)(
          (0, import_drizzle_orm22.eq)(messages.conversationId, conversationId),
          (0, import_drizzle_orm22.not)((0, import_drizzle_orm22.eq)(messages.senderId, currentUserId)),
          (0, import_drizzle_orm22.eq)(messages.isRead, false)
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
var import_express19, import_drizzle_orm23, communitiesRouter;
var init_communities = __esm({
  "server/routes/communities.ts"() {
    "use strict";
    import_express19 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm23 = require("drizzle-orm");
    init_auth();
    init_api();
    init_postStats();
    communitiesRouter = (0, import_express19.Router)();
    communitiesRouter.get("/", optionalAuth, async (req, res) => {
      try {
        const list = await db.select().from(communities).limit(20);
        res.json({ success: true, data: list });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.post("/", requireAuth, async (req, res) => {
      try {
        const currentUserId = requireAuthContext(req);
        const { name, description, slug } = req.body;
        const [community] = await db.insert(communities).values({
          name,
          description,
          slug,
          ownerId: currentUserId
        }).returning();
        await db.insert(communityMembers).values({
          communityId: community.id,
          userId: currentUserId,
          role: "admin"
        });
        res.status(201).json({ success: true, data: community });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:slug", optionalAuth, async (req, res) => {
      try {
        const slug = req.params.slug;
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm23.eq)(communities.slug, slug)).limit(1);
        if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        const currentUserId = requireAuthContext(req);
        const memberRecord = await db.select().from(communityMembers).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(communityMembers.communityId, community.id), (0, import_drizzle_orm23.eq)(communityMembers.userId, currentUserId))).limit(1);
        const isMember = memberRecord.length > 0 || community.ownerId === currentUserId;
        const isModerator = community.ownerId === currentUserId || memberRecord.length > 0 && ["admin", "OWNER", "MODERATOR"].includes(memberRecord[0].role);
        res.json({ success: true, data: { ...community, isMember, isModerator } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.post("/:id/join", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm23.eq)(communities.id, communityId)).limit(1);
        if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        await db.insert(communityMembers).values({ communityId, userId: currentUserId, role: "MEMBER" }).onConflictDoNothing();
        res.json({ success: true, data: { message: "Kat\u0131ld\u0131n\u0131z." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.delete("/:id/leave", requireAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm23.eq)(communities.id, communityId)).limit(1);
        if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        if (community.ownerId === currentUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk sahibi ayr\u0131lamaz." } });
        }
        await db.delete(communityMembers).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm23.eq)(communityMembers.userId, currentUserId)));
        res.json({ success: true, data: { message: "Ayr\u0131ld\u0131n\u0131z." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:id/members", optionalAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const parsed = paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 50 };
        const offset = (page - 1) * limit;
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
        }).from(communityMembers).innerJoin(users, (0, import_drizzle_orm23.eq)(communityMembers.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm23.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm23.eq)(communityMembers.communityId, communityId)).orderBy((0, import_drizzle_orm23.desc)(communityMembers.createdAt)).limit(limit).offset(offset);
        res.json({ success: true, data: members });
      } catch (error) {
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
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi bu b\xF6l\xFCmden \xE7\u0131karamazs\u0131n\u0131z, l\xFCtfen ayr\u0131lma se\xE7ene\u011Fini kullan\u0131n." } });
        }
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm23.eq)(communities.id, communityId)).limit(1);
        if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
        if (community.ownerId === targetUserId) {
          return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk sahibi \xE7\u0131kar\u0131lamaz." } });
        }
        const currentUserMembership = await db.select().from(communityMembers).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm23.eq)(communityMembers.userId, currentUserId))).limit(1);
        const isOwner = community.ownerId === currentUserId;
        const isModerator = currentUserMembership.length > 0 && ["admin", "OWNER", "MODERATOR"].includes(currentUserMembership[0].role);
        if (!isOwner && !isModerator) {
          return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu i\u015Flemi yapmak i\xE7in yetkiniz yok." } });
        }
        const targetMembership = await db.select().from(communityMembers).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm23.eq)(communityMembers.userId, targetUserId))).limit(1);
        if (targetMembership.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullan\u0131c\u0131 bu toplulu\u011Fun \xFCyesi de\u011Fil." } });
        }
        await db.delete(communityMembers).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(communityMembers.communityId, communityId), (0, import_drizzle_orm23.eq)(communityMembers.userId, targetUserId)));
        res.json({ success: true, data: { message: "\xDCye ba\u015Far\u0131yla \xE7\u0131kar\u0131ld\u0131." } });
      } catch (error) {
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatas\u0131." } });
      }
    });
    communitiesRouter.get("/:id/posts", optionalAuth, async (req, res) => {
      try {
        const communityId = parseInt(req.params.id);
        const currentUserId = requireAuthContext(req);
        const [community] = await db.select().from(communities).where((0, import_drizzle_orm23.eq)(communities.id, communityId)).limit(1);
        if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamad\u0131." } });
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
        }).from(posts).innerJoin(users, (0, import_drizzle_orm23.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm23.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(posts.communityId, communityId), (0, import_drizzle_orm23.eq)(posts.moderationStatus, "APPROVED"))).orderBy((0, import_drizzle_orm23.desc)(posts.createdAt)).limit(limit).offset(offset);
        const formattedPosts = await populatePostStats(communityPosts, currentUserId);
        res.json({ success: true, data: formattedPosts });
      } catch (error) {
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
var import_express20, import_drizzle_orm24, import_zod7, reactionsRouter, reactionSchema;
var init_reactions = __esm({
  "server/routes/reactions.ts"() {
    "use strict";
    import_express20 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm24 = require("drizzle-orm");
    init_auth();
    init_notifications();
    init_rateLimiter();
    init_visibility();
    import_zod7 = require("zod");
    reactionsRouter = (0, import_express20.Router)();
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm24.eq)(posts.id, postId)).limit(1);
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
            const existing = await tx.select().from(reactions).where((0, import_drizzle_orm24.and)((0, import_drizzle_orm24.eq)(reactions.postId, postId), (0, import_drizzle_orm24.eq)(reactions.userId, currentUserId))).limit(1);
            if (existing.length > 0) {
              await tx.update(reactions).set({ type: parsed.data.type }).where((0, import_drizzle_orm24.eq)(reactions.id, existing[0].id));
            } else {
              await tx.insert(reactions).values({ postId, userId: currentUserId, type: parsed.data.type });
              await tx.update(posts).set({ baseScore: import_drizzle_orm24.sql`GREATEST(${posts.baseScore} + 1, 0)` }).where((0, import_drizzle_orm24.eq)(posts.id, postId));
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
        const postRecord = await db.select().from(posts).where((0, import_drizzle_orm24.eq)(posts.id, postId)).limit(1);
        if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "G\xF6nderi bulunamad\u0131." } });
        await db.transaction(async (tx) => {
          const existing = await tx.select().from(reactions).where((0, import_drizzle_orm24.and)((0, import_drizzle_orm24.eq)(reactions.postId, postId), (0, import_drizzle_orm24.eq)(reactions.userId, currentUserId))).limit(1);
          if (existing.length > 0) {
            await tx.delete(reactions).where((0, import_drizzle_orm24.and)((0, import_drizzle_orm24.eq)(reactions.postId, postId), (0, import_drizzle_orm24.eq)(reactions.userId, currentUserId)));
            await tx.update(posts).set({ baseScore: import_drizzle_orm24.sql`GREATEST(${posts.baseScore} - 1, 0)` }).where((0, import_drizzle_orm24.eq)(posts.id, postId));
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
var import_express21, import_drizzle_orm25, commentsRouter;
var init_comments = __esm({
  "server/routes/comments.ts"() {
    "use strict";
    import_express21 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm25 = require("drizzle-orm");
    init_cursor();
    init_auth();
    init_api();
    init_visibility();
    commentsRouter = (0, import_express21.Router)();
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
            cursorCondition = (0, import_drizzle_orm25.or)((0, import_drizzle_orm25.lt)(comments.createdAt, decoded.createdAt), (0, import_drizzle_orm25.and)((0, import_drizzle_orm25.eq)(comments.createdAt, decoded.createdAt), (0, import_drizzle_orm25.lt)(comments.id, decoded.id)));
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
        }).from(comments).innerJoin(users, (0, import_drizzle_orm25.eq)(comments.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm25.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm25.and)((0, import_drizzle_orm25.eq)(comments.postId, postId), (0, import_drizzle_orm25.eq)(comments.moderationStatus, "APPROVED"), cursorCondition ? cursorCondition : void 0)).orderBy((0, import_drizzle_orm25.desc)(comments.createdAt), (0, import_drizzle_orm25.desc)(comments.id)).limit(limit);
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
var import_express22, import_drizzle_orm26, import_zod8, reportsRouter, reportSchema;
var init_reports = __esm({
  "server/routes/reports.ts"() {
    "use strict";
    import_express22 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm26 = require("drizzle-orm");
    init_auth();
    init_rateLimiter();
    import_zod8 = require("zod");
    reportsRouter = (0, import_express22.Router)();
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
          (0, import_drizzle_orm26.and)(
            (0, import_drizzle_orm26.eq)(reports.reporterId, currentUserId),
            (0, import_drizzle_orm26.eq)(reports.targetType, targetType),
            (0, import_drizzle_orm26.eq)(reports.targetId, targetId),
            (0, import_drizzle_orm26.eq)(reports.status, "PENDING")
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
var import_express23, import_drizzle_orm27, adminRouter, getPagination;
var init_admin = __esm({
  "server/routes/admin.ts"() {
    "use strict";
    init_encryption();
    import_express23 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm27 = require("drizzle-orm");
    init_auth();
    init_mailer();
    adminRouter = (0, import_express23.Router)();
    getPagination = (req) => {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
      return { page, limit, offset: (page - 1) * limit };
    };
    adminRouter.use(requireAuth, requireRole("ADMIN"));
    adminRouter.get("/stats", async (req, res) => {
      try {
        const totalUsers = await db.select({ count: import_drizzle_orm27.sql`cast(count(*) as integer)` }).from(users);
        const pendingVerifications = await db.select({ count: import_drizzle_orm27.sql`cast(count(*) as integer)` }).from(verificationRequests).where((0, import_drizzle_orm27.eq)(verificationRequests.status, "pending"));
        res.json({
          success: true,
          data: {
            totalUsers: totalUsers[0]?.count || 0,
            pendingVerifications: pendingVerifications[0]?.count || 0
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
        const { limit, offset } = getPagination(req);
        let query = db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          isVerified: users.isVerified,
          createdAt: users.createdAt,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }).from(users).leftJoin(profiles, (0, import_drizzle_orm27.eq)(users.id, profiles.userId));
        if (q && q.trim().length > 0) {
          const qTerm = `%${q.trim()}%`;
          query = query.where(
            (0, import_drizzle_orm27.or)(
              (0, import_drizzle_orm27.ilike)(users.username, qTerm),
              (0, import_drizzle_orm27.ilike)(profiles.displayName, qTerm),
              (0, import_drizzle_orm27.ilike)(users.email, qTerm)
            )
          );
        }
        const list = await query.limit(limit).offset(offset).orderBy((0, import_drizzle_orm27.desc)(users.createdAt));
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
        }).from(verificationRequests).innerJoin(users, (0, import_drizzle_orm27.eq)(verificationRequests.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm27.eq)(users.id, profiles.userId));
        if (status && ["pending", "under_review", "approved", "rejected"].includes(status)) {
          query = query.where((0, import_drizzle_orm27.eq)(verificationRequests.status, status));
        }
        const list = await query.limit(limit).offset(offset).orderBy((0, import_drizzle_orm27.desc)(verificationRequests.createdAt));
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
        const vReq = await db.select().from(verificationRequests).where((0, import_drizzle_orm27.eq)(verificationRequests.id, requestId)).limit(1);
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
        }).where((0, import_drizzle_orm27.eq)(verificationRequests.id, requestId));
        if (status === "approved" || status === "rejected") {
          const userRecord = await db.select().from(users).where((0, import_drizzle_orm27.eq)(users.id, currentReq.userId)).limit(1);
          if (userRecord.length > 0) {
            sendVerificationStatusEmail(userRecord[0].email, userRecord[0].username, status).catch(console.error);
          }
        }
        if (status === "approved" && currentReq.status !== "approved") {
          await db.update(users).set({ isVerified: true }).where((0, import_drizzle_orm27.eq)(users.id, currentReq.userId));
        } else if (status !== "approved" && currentReq.status === "approved") {
          await db.update(users).set({ isVerified: false }).where((0, import_drizzle_orm27.eq)(users.id, currentReq.userId));
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm27.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        await db.update(users).set({ isVerified }).where((0, import_drizzle_orm27.eq)(users.id, targetUserId));
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
        const userRecord = await db.select().from(users).where((0, import_drizzle_orm27.eq)(users.id, targetUserId)).limit(1);
        if (userRecord.length === 0) {
          res.status(404).json({ success: false, error: { message: "Kullan\u0131c\u0131 bulunamad\u0131." } });
          return;
        }
        await db.transaction(async (tx) => {
          await tx.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where((0, import_drizzle_orm27.eq)(users.id, targetUserId));
          await tx.delete(recoveryCodes).where((0, import_drizzle_orm27.eq)(recoveryCodes.userId, targetUserId));
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
        }).from(reports).leftJoin(users, (0, import_drizzle_orm27.eq)(reports.reporterId, users.id)).where((0, import_drizzle_orm27.eq)(reports.status, status)).orderBy((0, import_drizzle_orm27.desc)(reports.createdAt)).limit(limit).offset(offset);
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
        const r = await db.select().from(reports).where((0, import_drizzle_orm27.eq)(reports.id, reportId)).limit(1);
        if (r.length === 0) {
          res.status(404).json({ success: false, error: { message: "Rapor bulunamad\u0131." } });
          return;
        }
        const report = r[0];
        if (action === "remove_content") {
          if (report.targetType === "post") {
            await db.delete(posts).where((0, import_drizzle_orm27.eq)(posts.id, report.targetId));
          } else if (report.targetType === "comment") {
            await db.delete(comments).where((0, import_drizzle_orm27.eq)(comments.id, report.targetId));
          } else if (report.targetType === "community") {
            await db.delete(communities).where((0, import_drizzle_orm27.eq)(communities.id, report.targetId));
          }
          await db.update(reports).set({ status: "RESOLVED", resolvedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm27.eq)(reports.id, reportId));
        } else if (action === "suspend_user") {
          let uId = report.targetId;
          if (report.targetType !== "user") {
            if (report.targetType === "post") {
              const p = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm27.eq)(posts.id, report.targetId)).limit(1);
              if (p.length > 0) uId = p[0].userId;
            } else if (report.targetType === "comment") {
              const c = await db.select({ userId: comments.userId }).from(comments).where((0, import_drizzle_orm27.eq)(comments.id, report.targetId)).limit(1);
              if (c.length > 0) uId = c[0].userId;
            }
          }
          await db.update(users).set({ isActive: false }).where((0, import_drizzle_orm27.eq)(users.id, uId));
          await db.update(reports).set({ status: "RESOLVED", resolvedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm27.eq)(reports.id, reportId));
        } else if (status) {
          await db.update(reports).set({ status, resolvedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm27.eq)(reports.id, reportId));
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
          isOfficialAccount: users.isOfficialAccount,
          officialNotifyEnabled: users.officialNotifyEnabled,
          officialPriority: users.officialPriority
        }).from(users).where((0, import_drizzle_orm27.eq)(users.isOfficialAccount, true)).orderBy((0, import_drizzle_orm27.desc)(users.createdAt));
        res.json({ success: true, data });
      } catch (error) {
        res.status(500).json({ success: false, error: { message: "Resmi hesaplar al\u0131namad\u0131." } });
      }
    });
    adminRouter.put("/official-accounts/:id", async (req, res) => {
      try {
        const targetId = parseInt(req.params.id);
        const { isOfficialAccount, officialNotifyEnabled, officialPriority } = req.body;
        await db.update(users).set({
          isOfficialAccount: !!isOfficialAccount,
          officialNotifyEnabled: !!officialNotifyEnabled,
          officialPriority: officialPriority || "normal",
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm27.eq)(users.id, targetId));
        res.json({ success: true, message: "Resmi hesap ayarlar\u0131 g\xFCncellendi." });
      } catch (error) {
        res.status(500).json({ success: false, error: { message: "Ayarlar g\xFCncellenemedi." } });
      }
    });
    adminRouter.get("/auto-follow", async (req, res) => {
      try {
        const setting = await db.select().from(systemSettings).where((0, import_drizzle_orm27.eq)(systemSettings.key, "auto_follow_users")).limit(1);
        let userIds = [];
        if (setting.length > 0 && setting[0].value) {
          try {
            userIds = JSON.parse(setting[0].value);
          } catch (e) {
          }
        }
        let autoFollowUsers = [];
        if (userIds.length > 0) {
          autoFollowUsers = await db.select({
            id: users.id,
            username: users.username,
            email: users.email
          }).from(users).where((0, import_drizzle_orm27.inArray)(users.id, userIds));
        }
        res.json({ success: true, data: autoFollowUsers });
      } catch (error) {
        res.status(500).json({ success: false, error: { message: "Otomatik takip ayarlar\u0131 al\u0131namad\u0131." } });
      }
    });
    adminRouter.put("/auto-follow", async (req, res) => {
      try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
          return res.status(400).json({ success: false, error: { message: "Ge\xE7ersiz veri format\u0131." } });
        }
        await db.insert(systemSettings).values({ key: "auto_follow_users", value: JSON.stringify(userIds), updatedBy: requireAuthContext(req) }).onConflictDoUpdate({
          target: systemSettings.key,
          set: { value: JSON.stringify(userIds), updatedBy: requireAuthContext(req), updatedAt: /* @__PURE__ */ new Date() }
        });
        res.json({ success: true, message: "Otomatik takip listesi g\xFCncellendi." });
      } catch (error) {
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
        }).from(adminAuditLogs).leftJoin(users, (0, import_drizzle_orm27.eq)(adminAuditLogs.adminUserId, users.id)).leftJoin(profiles, (0, import_drizzle_orm27.eq)(users.id, profiles.userId));
        if (action && action.trim().length > 0) {
          query = query.where((0, import_drizzle_orm27.ilike)(adminAuditLogs.action, `%${action.trim()}%`));
        }
        const list = await query.limit(limit).offset(offset).orderBy((0, import_drizzle_orm27.desc)(adminAuditLogs.createdAt));
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
        }).from(moderationLogs).innerJoin(users, (0, import_drizzle_orm27.eq)(moderationLogs.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm27.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm27.eq)(moderationLogs.status, "PENDING")).orderBy((0, import_drizzle_orm27.desc)(moderationLogs.createdAt)).limit(50);
        const result = await Promise.all(pendingLogs.map(async (log) => {
          let content = "";
          if (log.entityType === "POST") {
            const p = await db.select({ content: posts.content }).from(posts).where((0, import_drizzle_orm27.eq)(posts.id, log.entityId)).limit(1);
            if (p.length > 0) content = p[0].content || "";
          } else if (log.entityType === "COMMENT") {
            const c = await db.select({ content: comments.content }).from(comments).where((0, import_drizzle_orm27.eq)(comments.id, log.entityId)).limit(1);
            if (c.length > 0) content = c[0].content || "";
          } else if (log.entityType === "PROFILE") {
            const p = await db.select({ bio: profiles.bio }).from(profiles).where((0, import_drizzle_orm27.eq)(profiles.userId, log.entityId)).limit(1);
            if (p.length > 0) content = p[0].bio || "";
          } else if (log.entityType === "PROJECT_COMMENT") {
            const pc = await db.select({ content: projectComments.content }).from(projectComments).where((0, import_drizzle_orm27.eq)(projectComments.id, log.entityId)).limit(1);
            if (pc.length > 0) content = pc[0].content || "";
          } else if (log.entityType === "PROJECT") {
            const pj = await db.select({ description: projects.description }).from(projects).where((0, import_drizzle_orm27.eq)(projects.id, log.entityId)).limit(1);
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
        const logRecord = await db.select().from(moderationLogs).where((0, import_drizzle_orm27.eq)(moderationLogs.id, logId)).limit(1);
        if (logRecord.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Log bulunamad\u0131." } });
        }
        const log = logRecord[0];
        await db.transaction(async (tx) => {
          await tx.update(moderationLogs).set({ status: "RESOLVED", actionTaken: action === "APPROVE" ? "APPROVED" : "REJECTED", adminId, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm27.eq)(moderationLogs.id, logId));
          const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
          if (log.entityType === "POST") {
            await tx.update(posts).set({ moderationStatus: newStatus }).where((0, import_drizzle_orm27.eq)(posts.id, log.entityId));
          } else if (log.entityType === "COMMENT") {
            await tx.update(comments).set({ moderationStatus: newStatus }).where((0, import_drizzle_orm27.eq)(comments.id, log.entityId));
          } else if (log.entityType === "PROJECT_COMMENT") {
            await tx.update(projectComments).set({ moderationStatus: newStatus }).where((0, import_drizzle_orm27.eq)(projectComments.id, log.entityId));
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
  }
});

// server/routes/verification.ts
var verification_exports = {};
__export(verification_exports, {
  verificationRouter: () => verificationRouter
});
var import_express24, import_drizzle_orm28, verificationRouter;
var init_verification = __esm({
  "server/routes/verification.ts"() {
    "use strict";
    import_express24 = require("express");
    init_db();
    init_schema();
    init_auth();
    import_drizzle_orm28 = require("drizzle-orm");
    verificationRouter = (0, import_express24.Router)();
    verificationRouter.use(requireAuth);
    verificationRouter.get("/me", async (req, res) => {
      try {
        const userId = requireAuthContext(req);
        const requests = await db.select().from(verificationRequests).where((0, import_drizzle_orm28.eq)(verificationRequests.userId, userId)).orderBy((0, import_drizzle_orm28.desc)(verificationRequests.createdAt)).limit(10);
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
        const existingActive = await db.select().from(verificationRequests).where((0, import_drizzle_orm28.eq)(verificationRequests.userId, userId)).orderBy((0, import_drizzle_orm28.desc)(verificationRequests.createdAt)).limit(5);
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
var import_express25, import_drizzle_orm29, hashtagsRouter;
var init_hashtags2 = __esm({
  "server/routes/hashtags.ts"() {
    "use strict";
    import_express25 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm29 = require("drizzle-orm");
    init_blocks();
    init_hashtags();
    init_auth();
    init_api();
    init_postStats();
    hashtagsRouter = (0, import_express25.Router)();
    hashtagsRouter.get("/trending/top", optionalAuth, async (req, res) => {
      try {
        const trending = await db.select({
          name: hashtags.name,
          normalizedName: hashtags.normalizedName,
          count: hashtags.usageCount
        }).from(hashtags).orderBy((0, import_drizzle_orm29.desc)(hashtags.usageCount)).limit(5);
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
        const tagRecord = await db.select().from(hashtags).where((0, import_drizzle_orm29.eq)(hashtags.normalizedName, normalizedName)).limit(1);
        if (tagRecord.length === 0) {
          return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Hashtag bulunamad\u0131." } });
        }
        const hashtag = tagRecord[0];
        let visibilityCondition;
        if (currentUserId !== -1) {
          const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm29.eq)(follows.followerId, currentUserId));
          const followingIds = followingRecords.map((f) => f.followingId);
          const followingIdsWithSelf = followingIds.length > 0 ? followingIds : [-1];
          visibilityCondition = (0, import_drizzle_orm29.or)(
            (0, import_drizzle_orm29.eq)(posts.visibility, "PUBLIC"),
            (0, import_drizzle_orm29.eq)(posts.userId, currentUserId),
            (0, import_drizzle_orm29.and)((0, import_drizzle_orm29.eq)(posts.visibility, "FOLLOWERS"), (0, import_drizzle_orm29.inArray)(posts.userId, followingIdsWithSelf))
          );
        } else {
          visibilityCondition = (0, import_drizzle_orm29.eq)(posts.visibility, "PUBLIC");
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
        }).from(posts).innerJoin(postHashtags, (0, import_drizzle_orm29.eq)(posts.id, postHashtags.postId)).innerJoin(users, (0, import_drizzle_orm29.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm29.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm29.and)(
          (0, import_drizzle_orm29.eq)(postHashtags.hashtagId, hashtag.id),
          (0, import_drizzle_orm29.notInArray)(posts.userId, ignoreIds),
          visibilityCondition
        )).orderBy((0, import_drizzle_orm29.desc)(posts.createdAt)).limit(limit).offset(offset);
        if (postsResult.length === 0) {
          return res.json({ success: true, data: { hashtag, posts: [] } });
        }
        const populatedPosts = await populatePostStats(postsResult, currentUserId);
        const fetchedPostIds = populatedPosts.map((p) => p.id);
        const allMedia = await db.select().from(postMedia).where((0, import_drizzle_orm29.inArray)(postMedia.postId, fetchedPostIds));
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
var import_express26, import_drizzle_orm30, import_express_rate_limit3, collaboratorsRouter, actionLimiter;
var init_collaborators = __esm({
  "server/routes/collaborators.ts"() {
    "use strict";
    import_express26 = require("express");
    init_db();
    init_schema();
    import_drizzle_orm30 = require("drizzle-orm");
    init_auth();
    init_notifications();
    import_express_rate_limit3 = __toESM(require("express-rate-limit"), 1);
    collaboratorsRouter = (0, import_express26.Router)();
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
          type: import_drizzle_orm30.sql`'project'`,
          projectId: projects.id,
          title: projects.title,
          status: projectCollaborators.status,
          createdAt: projectCollaborators.createdAt,
          inviterId: projects.userId,
          inviterUsername: users.username,
          inviterDisplayName: profiles.displayName,
          inviterAvatarUrl: profiles.avatarUrl
        }).from(projectCollaborators).innerJoin(projects, (0, import_drizzle_orm30.eq)(projectCollaborators.projectId, projects.id)).innerJoin(users, (0, import_drizzle_orm30.eq)(projects.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm30.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(projectCollaborators.userId, currentUserId), (0, import_drizzle_orm30.eq)(projectCollaborators.status, "pending")));
        const postInvites = await db.select({
          id: postCollaborators.id,
          type: import_drizzle_orm30.sql`'post'`,
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
        }).from(postCollaborators).innerJoin(posts, (0, import_drizzle_orm30.eq)(postCollaborators.postId, posts.id)).innerJoin(users, (0, import_drizzle_orm30.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm30.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(postCollaborators.userId, currentUserId), (0, import_drizzle_orm30.eq)(postCollaborators.status, "pending")));
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
          const invite = await db.select().from(projectCollaborators).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(projectCollaborators.id, inviteId), (0, import_drizzle_orm30.eq)(projectCollaborators.userId, currentUserId))).limit(1);
          if (invite.length === 0) {
            res.status(404).json({ success: false, error: { message: "Davet bulunamad\u0131." } });
            return;
          }
          if (invite[0].status !== "pending") {
            res.status(400).json({ success: false, error: { message: "Bu davet zaten yan\u0131tlanm\u0131\u015F." } });
            return;
          }
          await db.update(projectCollaborators).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(projectCollaborators.id, inviteId));
          const project = await db.select({ userId: projects.userId }).from(projects).where((0, import_drizzle_orm30.eq)(projects.id, invite[0].projectId)).limit(1);
          if (project.length > 0) {
            await notify(currentUserId, project[0].userId, `project_collaborator_${status}`, void 0, void 0, invite[0].projectId);
          }
          res.json({ success: true, data: { status } });
          return;
        } else if (type === "post") {
          const invite = await db.select().from(postCollaborators).where((0, import_drizzle_orm30.and)((0, import_drizzle_orm30.eq)(postCollaborators.id, inviteId), (0, import_drizzle_orm30.eq)(postCollaborators.userId, currentUserId))).limit(1);
          if (invite.length === 0) {
            res.status(404).json({ success: false, error: { message: "Davet bulunamad\u0131." } });
            return;
          }
          if (invite[0].status !== "pending") {
            res.status(400).json({ success: false, error: { message: "Bu davet zaten yan\u0131tlanm\u0131\u015F." } });
            return;
          }
          await db.update(postCollaborators).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm30.eq)(postCollaborators.id, inviteId));
          const post = await db.select({ userId: posts.userId }).from(posts).where((0, import_drizzle_orm30.eq)(posts.id, invite[0].postId)).limit(1);
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

// server/middleware/seo.ts
var seo_exports = {};
__export(seo_exports, {
  seoMiddleware: () => seoMiddleware
});
function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}
function escapeHtml2(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
var import_drizzle_orm31, BOT_USER_AGENTS, seoMiddleware;
var init_seo = __esm({
  "server/middleware/seo.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm31 = require("drizzle-orm");
    BOT_USER_AGENTS = [
      "twitterbot",
      "facebookexternalhit",
      "whatsapp",
      "telegrambot",
      "linkedinbot",
      "slackbot",
      "vkshare",
      "skypeuripreview",
      "discordbot",
      "bingbot",
      "yandexbot",
      "googlebot",
      "applebot"
    ];
    seoMiddleware = async (req, res, next) => {
      const userAgent = req.headers["user-agent"] || "";
      if (!isBot(userAgent)) {
        return next();
      }
      try {
        let title = "Gen\xE7 Sosyal";
        let description = "Gen\xE7lerin bulu\u015Fma noktas\u0131: Gen\xE7 Sosyal.";
        let imageUrl = "https://gencsosyal.com/default-og.png";
        let url = "https://gencsosyal.com" + req.originalUrl;
        const postMatch = req.path.match(/^\/post\/(\d+)$/);
        const profileMatch = req.path.match(/^\/profile\/([a-zA-Z0-9_]{3,30})$/);
        const communityMatch = req.path.match(/^\/communities\/([a-zA-Z0-9_-]+)$/);
        if (postMatch) {
          const postId = parseInt(postMatch[1]);
          const postRecord = await db.select({
            content: posts.content,
            postType: posts.postType,
            contentWarning: posts.contentWarning,
            visibility: posts.visibility,
            displayName: profiles.displayName,
            username: users.username
          }).from(posts).innerJoin(users, (0, import_drizzle_orm31.eq)(posts.userId, users.id)).leftJoin(profiles, (0, import_drizzle_orm31.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm31.eq)(posts.id, postId)).limit(1);
          if (postRecord.length > 0) {
            const p = postRecord[0];
            if (p.visibility === "PUBLIC") {
              title = `${p.displayName} (@${p.username}) - Gen\xE7 Sosyal`;
              description = p.content ? p.content.substring(0, 150) + (p.content.length > 150 ? "..." : "") : "G\xF6nderiye g\xF6z at.";
            }
          }
        } else if (communityMatch) {
          const communitySlug = communityMatch[1];
          const commRecord = await db.select().from(communities).where((0, import_drizzle_orm31.eq)(communities.slug, communitySlug)).limit(1);
          if (commRecord.length > 0) {
            const c = commRecord[0];
            title = `${c.name} - Gen\xE7 Sosyal Toplulu\u011Fu`;
            description = c.description ? c.description.substring(0, 150) : "Bu toplulu\u011Fa kat\u0131l ve tart\u0131\u015Fmalara ba\u015Fla.";
            if (c.avatarUrl) imageUrl = c.avatarUrl;
          }
        } else if (profileMatch) {
          const username = profileMatch[1];
          const userRecord = await db.select({
            displayName: profiles.displayName,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl
          }).from(users).leftJoin(profiles, (0, import_drizzle_orm31.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm31.eq)(users.username, username)).limit(1);
          if (userRecord.length > 0) {
            const u = userRecord[0];
            title = `${u.displayName} (@${username}) - Gen\xE7 Sosyal`;
            description = u.bio ? u.bio.substring(0, 150) : `${u.displayName} profilini Gen\xE7 Sosyal'de incele.`;
            if (u.avatarUrl) imageUrl = u.avatarUrl;
          }
        } else {
          return next();
        }
        const safeTitle = escapeHtml2(title);
        const safeDescription = escapeHtml2(description);
        const safeImageUrl = escapeHtml2(imageUrl);
        const safeUrl = escapeHtml2(url);
        const html = `
      <!doctype html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${safeTitle}</title>
          <meta name="description" content="${safeDescription}" />
          
          <!-- Open Graph -->
          <meta property="og:type" content="website" />
          <meta property="og:url" content="${safeUrl}" />
          <meta property="og:title" content="${safeTitle}" />
          <meta property="og:description" content="${safeDescription}" />
          <meta property="og:image" content="${safeImageUrl}" />
          
          <!-- Twitter -->
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="${safeUrl}" />
          <meta property="twitter:title" content="${safeTitle}" />
          <meta property="twitter:description" content="${safeDescription}" />
          <meta property="twitter:image" content="${safeImageUrl}" />
        </head>
        <body>
          <p>${safeDescription}</p>
        </body>
      </html>
    `;
        res.send(html);
      } catch (error) {
        console.error("SEO Middleware error:", error);
        next();
      }
    };
  }
});

// server.ts
init_uploadConfig();

// server/routes/onboarding.ts
var import_express = require("express");
init_auth();
init_db();
init_schema();
var import_drizzle_orm2 = require("drizzle-orm");
var onboardingRouter = (0, import_express.Router)();
onboardingRouter.get("/progress", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const followCountResult = await db.select({ count: import_drizzle_orm2.sql`count(*)::int` }).from(follows).where((0, import_drizzle_orm2.eq)(follows.followerId, currentUserId));
    const followCount = followCountResult[0]?.count || 0;
    const postCountResult = await db.select({ count: import_drizzle_orm2.sql`count(*)::int` }).from(posts).where((0, import_drizzle_orm2.eq)(posts.userId, currentUserId));
    const hasPost = (postCountResult[0]?.count || 0) > 0;
    const projectCountResult = await db.select({ count: import_drizzle_orm2.sql`count(*)::int` }).from(projects).where((0, import_drizzle_orm2.eq)(projects.userId, currentUserId));
    const hasProject = (projectCountResult[0]?.count || 0) > 0;
    const profileResult = await db.select({ onboardingCompleted: profiles.onboardingCompleted }).from(profiles).where((0, import_drizzle_orm2.eq)(profiles.userId, currentUserId));
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
    await db.update(profiles).set({ onboardingCompleted: true }).where((0, import_drizzle_orm2.eq)(profiles.userId, currentUserId));
    res.json({ success: true, data: { completed: true } });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    res.status(500).json({ success: false, error: { message: "Error completing onboarding" } });
  }
});
onboardingRouter.get("/suggested-users", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const followedResult = await db.select({ followingId: follows.followingId }).from(follows).where((0, import_drizzle_orm2.eq)(follows.followerId, currentUserId));
    const excludedUserIds = followedResult.map((f) => f.followingId);
    excludedUserIds.push(currentUserId);
    const blocksResult = await db.select().from(blocks).where((0, import_drizzle_orm2.or)(
      (0, import_drizzle_orm2.eq)(blocks.blockerId, currentUserId),
      (0, import_drizzle_orm2.eq)(blocks.blockedId, currentUserId)
    ));
    blocksResult.forEach((b) => {
      if (b.blockerId !== currentUserId) excludedUserIds.push(b.blockerId);
      if (b.blockedId !== currentUserId) excludedUserIds.push(b.blockedId);
    });
    const suggestedUsers = await db.select({
      id: users.id,
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      bio: profiles.bio
    }).from(users).leftJoin(profiles, (0, import_drizzle_orm2.eq)(users.id, profiles.userId)).where((0, import_drizzle_orm2.and)(
      (0, import_drizzle_orm2.notInArray)(users.id, excludedUserIds),
      (0, import_drizzle_orm2.eq)(users.isActive, true)
    )).limit(10);
    res.json({
      success: true,
      data: suggestedUsers
    });
  } catch (error) {
    console.error("Onboarding suggestions error:", error);
    res.status(500).json({ success: false, error: { message: "Error fetching suggestions" } });
  }
});

// server.ts
var import_express27 = __toESM(require("express"), 1);
var import_path6 = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_vite = require("vite");
if (process.env.NODE_ENV !== "production") {
  import("dotenv").then((dotenv) => dotenv.config());
}
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const app = (0, import_express27.default)();
  app.set("trust proxy", 1);
  const PORT = 3e3;
  app.use((0, import_helmet.default)({
    contentSecurityPolicy: isProd ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000", "wss:"],
        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:"],
        frameSrc: ["'none'"]
      }
    } : false,
    crossOriginEmbedderPolicy: false
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
  app.use(import_express27.default.json());
  app.use(import_express27.default.urlencoded({ extended: true }));
  app.use((0, import_cookie_parser.default)());
  ensureUploadDir();
  app.use("/uploads", import_express27.default.static(getUploadDir()));
  const { setupRouter: setupRouter2 } = await Promise.resolve().then(() => (init_setup(), setup_exports));
  app.use("/api/setup", setupRouter2);
  app.use("/api/v1/setup", setupRouter2);
  const { healthRouter: healthRouter2 } = await Promise.resolve().then(() => (init_health(), health_exports));
  app.use("/api/v1/health", healthRouter2);
  app.use("/api/health", healthRouter2);
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
  const { seoMiddleware: seoMiddleware2 } = await Promise.resolve().then(() => (init_seo(), seo_exports));
  app.use(seoMiddleware2);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path6.default.join(process.cwd(), "dist");
    app.use(import_express27.default.static(distPath));
    app.use("/api", (req, res) => {
      res.status(404).json({ success: false, error: { message: "API endpoint not found." } });
    });
    app.get("*all", (req, res) => {
      res.sendFile(import_path6.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Gen\xE7 Sosyal Server running on http://localhost:${PORT}`);
  });
}
startServer().catch(console.error);
//# sourceMappingURL=server.cjs.map
