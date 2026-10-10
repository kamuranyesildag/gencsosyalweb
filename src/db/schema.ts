import { relations } from 'drizzle-orm';
import { 
  pgTable, serial, text, timestamp, varchar, boolean, jsonb, 
  primaryKey, integer, unique, index, real
} from 'drizzle-orm/pg-core';

// --- USERS & PROFILES ---

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).default('USER').notNull(), // USER, MODERATOR, ADMIN
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  isOfficialAccount: boolean('is_official_account').default(false).notNull(),
  officialNotifyEnabled: boolean('official_notify_enabled').default(true).notNull(),
  officialPriority: varchar('official_priority', { length: 20 }).default('normal').notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  twoFactorSecret: text('two_factor_secret'),
  // Child Safety & Age Verification (10 Ekim 2026 Yönetmeliği)
  isMinor: boolean('is_minor').default(false).notNull(),
  ageVerificationStatus: varchar('age_verification_status', { length: 30 }).default('UNVERIFIED').notNull(), // UNVERIFIED, VERIFIED_CHILD, VERIFIED_ADULT, REJECTED_UNDERAGE
  ageVerificationToken: text('age_verification_token'),
  ageVerifiedAt: timestamp('age_verified_at'),
  ageVerificationMethod: varchar('age_verification_method', { length: 50 }), // NV_KPS, E_DEVLET, DECLARATION
  bannedAt: timestamp('banned_at'),
  banReason: text('ban_reason'),
  banExpiresAt: timestamp('ban_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'),
  location: varchar('location', { length: 100 }),
  website: varchar('website', { length: 255 }),
  isPrivate: boolean('is_private').default(false).notNull(),
  allowSearchEngineIndexing: boolean('allow_search_engine_indexing').default(true).notNull(),
  messagePreference: varchar('message_preference', { length: 20 }).default('ANYONE').notNull(),
  mentionPreference: varchar('mention_preference', { length: 20 }).default('ANYONE').notNull(),
  defaultPostVisibility: varchar('default_post_visibility', { length: 20 }).default('PUBLIC').notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  interests: jsonb('interests').default([]),
  birthDate: timestamp('birth_date'),
  // Minor safety features
  isScreenshotProtected: boolean('is_screenshot_protected').default(false).notNull(),
  dailyScreenTimeLimitMinutes: integer('daily_screen_time_limit_minutes').default(120),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recoveryCodes = pgTable('recovery_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  used: boolean('used').default(false).notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('recovery_codes_user_id_idx').on(t.userId),
}));

// --- PROJECTS ---
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  detailedDescription: text('detailed_description'),
  category: varchar('category', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  projectUrl: varchar('project_url', { length: 255 }),
  githubUrl: varchar('github_url', { length: 255 }),
  imageUrl: text('image_url'),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('projects_user_id_idx').on(t.userId),
}));

export const projectLikes = pgTable('project_likes', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('project_likes_user_project_unq').on(t.userId, t.projectId),
  projectIdIdx: index('project_likes_project_id_idx').on(t.projectId),
  userIdIdx: index('project_likes_user_id_idx').on(t.userId),
}));

export const projectComments = pgTable('project_comments', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  moderationStatus: varchar('moderation_status', { length: 20 }).default('APPROVED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  projectIdIdx: index('project_comments_project_id_idx').on(t.projectId),
  userIdIdx: index('project_comments_user_id_idx').on(t.userId),
}));

// --- POSTS & MEDIA ---

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  communityId: integer('community_id').references(() => communities.id, { onDelete: 'cascade' }),
  content: text('content'),
  visibility: varchar('visibility', { length: 20 }).default('PUBLIC').notNull(), 
  postType: varchar('post_type', { length: 20 }).default('NORMAL').notNull(), // NORMAL, POLL, SENSITIVE, QUOTE
  quotedPostId: integer('quoted_post_id').references((): any => posts.id, { onDelete: 'set null' }), // Self-reference for quotes
  moderationStatus: varchar('moderation_status', { length: 20 }).default('APPROVED').notNull(),
  contentWarning: text('content_warning'),
  baseScore: real('base_score').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('posts_user_id_idx').on(t.userId),
  createdAtIdx: index('posts_created_at_idx').on(t.createdAt),
  userCreatedAtIdx: index('posts_user_id_created_at_idx').on(t.userId, t.createdAt),
}));



export const pollOptions = pgTable('poll_options', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  text: varchar('text', { length: 255 }).notNull(),
  order: integer('order').default(0).notNull(),
});

export const pollVotes = pgTable('poll_votes', {
  id: serial('id').primaryKey(),
  optionId: integer('option_id').notNull().references(() => pollOptions.id, { onDelete: 'cascade' }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueVote: unique('poll_votes_post_user_unique').on(t.postId, t.userId),
  optionIdx: index('poll_votes_option_idx').on(t.optionId),
}));

export const postMedia = pgTable('post_media', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  mediaUrl: text('media_url').notNull(),
  mediaType: varchar('media_type', { length: 20 }).notNull(), // image, video
  width: integer('width'),
  height: integer('height'),
  duration: integer('duration'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- INTERACTIONS ---

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references((): any => comments.id, { onDelete: 'cascade' }), // Self-reference for replies
  content: text('content').notNull(),
  moderationStatus: varchar('moderation_status', { length: 20 }).default('APPROVED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  postIdIdx: index('comments_post_id_idx').on(t.postId),
  userIdIdx: index('comments_user_id_idx').on(t.userId),
}));

export const likes = pgTable('likes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('likes_user_post_unq').on(t.userId, t.postId),
  postIdIdx: index('likes_post_id_idx').on(t.postId),
  userIdIdx: index('likes_user_id_idx').on(t.userId),
}));

export const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // like, love, haha, wow, sad, angry
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('reactions_user_post_unq').on(t.userId, t.postId),
}));

export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('bookmarks_user_post_unq').on(t.userId, t.postId),
}));

export const postViews = pgTable('post_views', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
}, (t) => ({
  userPostIdx: index('post_views_user_post_idx').on(t.userId, t.postId),
  postViewedAtIdx: index('post_views_post_viewed_at_idx').on(t.postId, t.viewedAt),
}));

export const reposts = pgTable('reposts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('reposts_user_post_unq').on(t.userId, t.postId),
  postCreatedAtIdx: index('reposts_post_created_at_idx').on(t.postId, t.createdAt),
}));

// --- SOCIAL GRAPH ---

export const follows = pgTable('follows', {
  id: serial('id').primaryKey(),
  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('accepted').notNull(),
  notificationPreference: varchar('notification_preference', { length: 20 }).default('standard').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('follows_follower_following_unq').on(t.followerId, t.followingId),
  followerIdx: index('follows_follower_idx').on(t.followerId),
  followingIdx: index('follows_following_idx').on(t.followingId),
}));

export const blocks = pgTable('blocks', {
  blockerId: integer('blocker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedId: integer('blocked_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.blockerId, t.blockedId] }),
}));

// --- HASHTAGS ---

export const postMentions = pgTable('post_mentions', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  mentionedUserId: integer('mentioned_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorUserId: integer('actor_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.mentionedUserId] }),
  mentionedUserIdIdx: index('post_mentions_user_idx').on(t.mentionedUserId),
}));

export const commentMentions = pgTable('comment_mentions', {
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  mentionedUserId: integer('mentioned_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorUserId: integer('actor_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.commentId, t.mentionedUserId] }),
  mentionedUserIdIdx: index('comment_mentions_user_idx').on(t.mentionedUserId),
}));

export const hashtags = pgTable('hashtags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  normalizedName: varchar('normalized_name', { length: 100 }).notNull().unique(),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const postHashtags = pgTable('post_hashtags', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  hashtagId: integer('hashtag_id').notNull().references(() => hashtags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.hashtagId] }),
}));

// --- NOTIFICATIONS ---

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  recipientId: integer('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorId: integer('actor_id').references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // follow, like, comment, message, etc.
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  communityId: integer('community_id').references(() => communities.id, { onDelete: 'cascade' }),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  recipientIdx: index('notifications_recipient_idx').on(t.recipientId),
  isReadIdx: index('notifications_is_read_idx').on(t.isRead),
  recipientUnreadDateIdx: index('notifications_recipient_unread_date_idx').on(t.recipientId, t.isRead, t.createdAt),
  recipientCreatedAtIdx: index('notifications_recipient_created_at_idx').on(t.recipientId, t.createdAt),
  communityIdx: index('notifications_community_idx').on(t.communityId),
}));

// --- STORIES ---

export const stories = pgTable('stories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mediaUrl: text('media_url').notNull(),
  mediaType: varchar('media_type', { length: 20 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const storyViews = pgTable('story_views', {
  storyId: integer('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.storyId, t.userId] }),
}));

// --- MESSAGES ---

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversationMembers = pgTable('conversation_members', {
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.conversationId, t.userId] }),
}));

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  mediaUrl: text('media_url'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  conversationIdx: index('messages_conversation_idx').on(t.conversationId),
  createdAtIdx: index('messages_created_at_idx').on(t.createdAt),
  conversationCreatedAtIdx: index('messages_conversation_created_at_idx').on(t.conversationId, t.createdAt),
}));

// --- COMMUNITIES ---

export const communities = pgTable('communities', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'),
  category: varchar('category', { length: 50 }).default('Genel').notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  rules: text('rules'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  deletedAtIdx: index('communities_deleted_at_idx').on(t.deletedAt),
  ownerIdIdx: index('communities_owner_id_idx').on(t.ownerId),
  categoryIdx: index('communities_category_idx').on(t.category),
}));

export const communityMembers = pgTable('community_members', {
  communityId: integer('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).default('MEMBER').notNull(), // OWNER, MODERATOR (or ADMIN), MEMBER
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.communityId, t.userId] }),
  communityIdx: index('community_members_community_idx').on(t.communityId),
  userIdIdx: index('community_members_user_idx').on(t.userId),
  roleIdx: index('community_members_role_idx').on(t.role),
}));

export const communityJoinRequests = pgTable('community_join_requests', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // PENDING, ACCEPTED, REJECTED
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('community_join_requests_user_community_unq').on(t.communityId, t.userId),
  communityIdx: index('community_join_requests_community_idx').on(t.communityId),
  userIdIdx: index('community_join_requests_user_idx').on(t.userId),
  statusIdx: index('community_join_requests_status_idx').on(t.status),
}));

export const communityAuditLogs = pgTable('community_audit_logs', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  actorId: integer('actor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetUserId: integer('target_user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 50 }).notNull(), // ADMIN_ADDED, ADMIN_REMOVED, MEMBER_REMOVED, OWNERSHIP_TRANSFERRED, SETTINGS_UPDATED, COMMUNITY_DELETED, REQUEST_ACCEPTED, REQUEST_REJECTED
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  communityIdx: index('community_audit_logs_community_idx').on(t.communityId),
  actorIdx: index('community_audit_logs_actor_idx').on(t.actorId),
  createdAtIdx: index('community_audit_logs_created_at_idx').on(t.createdAt),
}));

// --- REPORTS ---

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: varchar('target_type', { length: 50 }).notNull(), // user, post, comment, community
  targetId: integer('target_id').notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // PENDING, RESOLVED, DISMISSED
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// --- AUTHENTICATION ---

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  deviceInfo: text('device_info'),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('refresh_tokens_user_id_idx').on(t.userId),
}));

export const otpVerifications = pgTable('otp_verifications', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  otpHash: text('otp_hash').notNull(),
  type: varchar('type', { length: 50 }).default('REGISTER').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(5).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  lastSentAt: timestamp('last_sent_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: index('otp_verifications_email_idx').on(t.email),
  typeIdx: index('otp_verifications_type_idx').on(t.type),
  emailTypeUnique: unique('otp_verifications_email_type_unique').on(t.email, t.type),
}));

// --- RELATIONS ---



// --- VERIFICATION REQUESTS ---
export const verificationRequests = pgTable('verification_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, under_review, approved, rejected
  reason: text('reason').notNull(),
  adminNote: text('admin_note'),
  rejectionReason: text('rejection_reason'),
  reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('verification_requests_user_id_idx').on(t.userId),
  statusIdx: index('verification_requests_status_idx').on(t.status),
}));

// --- ADMIN AUDIT LOGS ---

export const systemSettings = pgTable('system_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
});

export const securityAuditLogs = pgTable('security_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('security_audit_logs_user_id_idx').on(t.userId),
  actionIdx: index('security_audit_logs_action_idx').on(t.action),
}));

export const notificationPreferences = pgTable('notification_preferences', {
  userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  pushEnabled: boolean('push_enabled').default(true).notNull(),
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  likes: boolean('likes').default(true).notNull(),
  comments: boolean('comments').default(true).notNull(),
  mentions: boolean('mentions').default(true).notNull(),
  follows: boolean('follows').default(true).notNull(),
  messages: boolean('messages').default(true).notNull(),
  newsletters: boolean('newsletters').default(false).notNull(),
});

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: serial('id').primaryKey(),
  adminUserId: integer('admin_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }).notNull(), // e.g., 'user', 'verification_request'
  targetId: varchar('target_id', { length: 50 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  adminUserIdIdx: index('admin_audit_logs_admin_user_id_idx').on(t.adminUserId),
  actionIdx: index('admin_audit_logs_action_idx').on(t.action),
}));


export const projectCollaborators = pgTable('project_collaborators', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, accepted, rejected, cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  projectIdx: index('project_collaborators_project_id_idx').on(t.projectId),
  userIdx: index('project_collaborators_user_id_idx').on(t.userId),
  uniqueUserProject: unique('project_collaborators_unique_user_project').on(t.projectId, t.userId),
}));

export const postCollaborators = pgTable('post_collaborators', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, accepted, rejected, cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  postIdx: index('post_collaborators_post_id_idx').on(t.postId),
  userIdx: index('post_collaborators_user_id_idx').on(t.userId),
  uniqueUserPost: unique('post_collaborators_unique_user_post').on(t.postId, t.userId),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  weeklyLeaderboards: many(weeklyLeaderboards),
  userBadges: many(userBadges),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  projects: many(projects),
  projectLikes: many(projectLikes),
  projectComments: many(projectComments),
  posts: many(posts),
  likes: many(likes),
  mentions: many(commentMentions),
  comments: many(comments),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
  bookmarks: many(bookmarks),
  reactions: many(reactions),
  notificationsReceived: many(notifications, { relationName: 'recipient' }),
  notificationsSent: many(notifications, { relationName: 'actor' }),
  stories: many(stories),
  conversationMemberships: many(conversationMembers),
  messages: many(messages),
  communitiesOwned: many(communities),
  communityMemberships: many(communityMembers),
  reports: many(reports),
  refreshTokens: many(refreshTokens),
  blocksInitiated: many(blocks, { relationName: 'blocker' }),
  blocksReceived: many(blocks, { relationName: 'blocked' }),
  postViews: many(postViews),
  reposts: many(reposts),
  verificationRequests: many(verificationRequests),
  verificationReviews: many(verificationRequests, { relationName: 'reviewer' }),
  adminAuditLogs: many(adminAuditLogs),
  projectCollaborators: many(projectCollaborators),
  postCollaborators: many(postCollaborators),
  announcementsCreated: many(announcements),
  announcementViews: many(announcementViews),
  appeals: many(appeals, { relationName: 'appealingUser' }),
  appealsReviewed: many(appeals, { relationName: 'appealReviewer' }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id]
  }),
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  quotedPost: one(posts, {
    fields: [posts.quotedPostId],
    references: [posts.id],
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
  pollOptions: many(pollOptions),
}));


export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  post: one(posts, {
    fields: [pollOptions.postId],
    references: [posts.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id],
  }),
  post: one(posts, {
    fields: [pollVotes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'replies',
  }),
  replies: many(comments, { relationName: 'replies' }),
}));

export const hashtagsRelations = relations(hashtags, ({ many }) => ({
  posts: many(postHashtags),
}));

export const postHashtagsRelations = relations(postHashtags, ({ one }) => ({
  post: one(posts, {
    fields: [postHashtags.postId],
    references: [posts.id],
  }),
  hashtag: one(hashtags, {
    fields: [postHashtags.hashtagId],
    references: [hashtags.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  members: many(conversationMembers),
  messages: many(messages),
}));

export const conversationMembersRelations = relations(conversationMembers, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationMembers.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationMembers.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const postViewsRelations = relations(postViews, ({ one }) => ({
  user: one(users, {
    fields: [postViews.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postViews.postId],
    references: [posts.id],
  }),
}));

export const repostsRelations = relations(reposts, ({ one }) => ({
  user: one(users, {
    fields: [reposts.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [reposts.postId],
    references: [posts.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  likes: many(projectLikes),
  comments: many(projectComments),
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));


export const projectLikesRelations = relations(projectLikes, ({ one }) => ({
  user: one(users, {
    fields: [projectLikes.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [projectLikes.projectId],
    references: [projects.id],
  }),
}));

export const projectCommentsRelations = relations(projectComments, ({ one }) => ({
  author: one(users, {
    fields: [projectComments.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [projectComments.projectId],
    references: [projects.id],
  }),
}));

export const verificationRequestsRelations = relations(verificationRequests, ({ one }) => ({
  user: one(users, {
    fields: [verificationRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [verificationRequests.reviewedBy],
    references: [users.id],
    relationName: 'reviewer'
  }),
}));

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLogs.adminUserId],
    references: [users.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  posts: many(posts),
  owner: one(users, {
    fields: [communities.ownerId],
    references: [users.id],
  }),
  members: many(communityMembers),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id],
  }),
}));


export const projectCollaboratorsRelations = relations(projectCollaborators, ({ one }) => ({
  project: one(projects, {
    fields: [projectCollaborators.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectCollaborators.userId],
    references: [users.id],
  }),
}));

export const postCollaboratorsRelations = relations(postCollaborators, ({ one }) => ({
  post: one(posts, {
    fields: [postCollaborators.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postCollaborators.userId],
    references: [users.id],
  }),
}));



export const postMentionsRelations = relations(postMentions, ({ one }) => ({
  post: one(posts, {
    fields: [postMentions.postId],
    references: [posts.id],
  }),
  mentionedUser: one(users, {
    fields: [postMentions.mentionedUserId],
    references: [users.id],
  }),
  actorUser: one(users, {
    fields: [postMentions.actorUserId],
    references: [users.id],
  }),
}));

export const commentMentionsRelations = relations(commentMentions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentMentions.commentId],
    references: [comments.id],
  }),
  mentionedUser: one(users, {
    fields: [commentMentions.mentionedUserId],
    references: [users.id],
  }),
  actorUser: one(users, {
    fields: [commentMentions.actorUserId],
    references: [users.id],
  }),
}));

export const moderationLogs = pgTable('moderation_logs', {
  id: serial('id').primaryKey(),
  entityType: varchar('entity_type', { length: 20 }).notNull(), // 'POST', 'COMMENT'
  entityId: integer('entity_id').notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // 'PENDING', 'REVIEWED', 'APPEALED', 'RESOLVED'
  actionTaken: varchar('action_taken', { length: 20 }), // 'APPROVED', 'REJECTED'
  riskLevel: varchar('risk_level', { length: 20 }).notNull(), // 'SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'
  category: varchar('category', { length: 50 }),
  reason: text('reason'),
  adminId: integer('admin_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  entityIdx: index('mod_logs_entity_idx').on(t.entityType, t.entityId),
  userIdIdx: index('mod_logs_user_id_idx').on(t.userId),
  statusIdx: index('mod_logs_status_idx').on(t.status)
}));

// --- WEEKLY LEADERBOARDS & GAMIFICATION ---

export const weeklyLeaderboards = pgTable('weekly_leaderboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weekStart: timestamp('week_start').notNull(),
  weekEnd: timestamp('week_end').notNull(),
  rank: integer('rank').notNull(),
  score: real('score').default(0).notNull(),
  productionScore: real('production_score').default(0).notNull(),
  communityScore: real('community_score').default(0).notNull(),
  qualityScore: real('quality_score').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq_user_week: unique('weekly_leaderboards_user_week_unq').on(t.userId, t.weekStart),
  weekStartIdx: index('weekly_leaderboards_week_start_idx').on(t.weekStart),
  rankIdx: index('weekly_leaderboards_rank_idx').on(t.rank),
  userIdIdx: index('weekly_leaderboards_user_id_idx').on(t.userId),
}));

export const badges = pgTable('badges', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 50 }).notNull().unique(), // e.g., 'WEEKLY_TOP_1'
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  iconUrl: varchar('icon_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userBadges = pgTable('user_badges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: integer('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}), // e.g., { weekStart: '2023-10-01' }
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('user_badges_user_id_idx').on(t.userId),
  badgeIdIdx: index('user_badges_badge_id_idx').on(t.badgeId),
}));

export const weeklyLeaderboardsRelations = relations(weeklyLeaderboards, ({ one }) => ({
  user: one(users, {
    fields: [weeklyLeaderboards.userId],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

// --- SUPPORT & FEEDBACK ---

export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).default('OPEN').notNull(), // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const supportTicketMessages = pgTable('support_ticket_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // FEATURE_REQUEST, BUG_REPORT, UI_UX, PERFORMANCE, GENERAL
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).default('NEW').notNull(), // NEW, REVIEWED, IN_PROGRESS, RESOLVED, REJECTED
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  messages: many(supportTicketMessages),
}));

export const supportTicketMessagesRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketMessages.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [supportTicketMessages.userId],
    references: [users.id],
  }),
}));

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
}));

// --- ANNOUNCEMENTS & POPUP SYSTEM ---

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  buttonText: varchar('button_text', { length: 100 }),
  buttonUrl: text('button_url'),
  status: varchar('status', { length: 30 }).default('draft').notNull(), // 'draft' | 'scheduled' | 'published' | 'archived'
  targetType: varchar('target_type', { length: 30 }).default('all').notNull(), // 'all' | 'authenticated' | 'specific_role'
  targetRole: varchar('target_role', { length: 50 }), // 'USER' | 'ADMIN' | 'MODERATOR'
  priority: integer('priority').default(0).notNull(), // higher integer = higher priority
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  statusIdx: index('announcements_status_idx').on(t.status),
  startsEndsIdx: index('announcements_starts_ends_idx').on(t.startsAt, t.endsAt),
  createdAtIdx: index('announcements_created_at_idx').on(t.createdAt),
}));

export const announcementViews = pgTable('announcement_views', {
  id: serial('id').primaryKey(),
  announcementId: integer('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seenAt: timestamp('seen_at').defaultNow().notNull(),
  dismissedAt: timestamp('dismissed_at'),
  clickedCta: boolean('clicked_cta').default(false).notNull(),
}, (t) => ({
  unqUserAnnouncement: unique('announcement_views_user_announcement_unq').on(t.announcementId, t.userId),
  announcementIdx: index('announcement_views_announcement_idx').on(t.announcementId),
  userIdx: index('announcement_views_user_idx').on(t.userId),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
  views: many(announcementViews),
}));

export const announcementViewsRelations = relations(announcementViews, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementViews.announcementId],
    references: [announcements.id],
  }),
  user: one(users, {
    fields: [announcementViews.userId],
    references: [users.id],
  }),
}));

// --- ACCOUNT APPEALS (HESAP İTİRAZLARI) ---

export const appeals = pgTable('appeals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  appealType: varchar('appeal_type', { length: 50 }).default('ACCOUNT_SUSPENSION').notNull(), // 'ACCOUNT_SUSPENSION', 'AGE_VERIFICATION_DISPUTE', 'CHILD_SAFETY_RESTRICTION'
  banReason: text('ban_reason'),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // 'PENDING', 'APPROVED', 'REJECTED'
  adminResponse: text('admin_response'),
  reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  humanReviewNotes: text('human_review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('appeals_user_id_idx').on(t.userId),
  statusIdx: index('appeals_status_idx').on(t.status),
  createdAtIdx: index('appeals_created_at_idx').on(t.createdAt),
}));

// --- CHILD SAFETY & PARENTAL CONTROLS (10 EKİM 2026 YÖNETMELİĞİ) ---

export const parentalControls = pgTable('parental_controls', {
  id: serial('id').primaryKey(),
  childUserId: integer('child_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentEmail: varchar('parent_email', { length: 255 }).notNull(),
  pairingCode: varchar('pairing_code', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // PENDING, ACTIVE, REVOKED
  dailyScreenTimeMinutes: integer('daily_screen_time_minutes').default(120).notNull(),
  messagingRestricted: boolean('messaging_restricted').default(true).notNull(),
  nightModeEnforced: boolean('night_mode_enforced').default(true).notNull(),
  lastNotifiedAt: timestamp('last_notified_at'),
  pairedAt: timestamp('paired_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  childIdx: index('parental_controls_child_idx').on(t.childUserId),
  unqChild: unique('parental_controls_child_unq').on(t.childUserId),
}));

export const ageVerificationLogs = pgTable('age_verification_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(), // VERIFICATION_ATTEMPT, VERIFIED_CHILD, VERIFIED_ADULT, REJECTED_UNDERAGE, REVERTED
  calculatedAge: integer('calculated_age'),
  verificationMethod: varchar('verification_method', { length: 50 }).notNull(),
  tokenHash: text('token_hash'),
  ipHash: varchar('ip_hash', { length: 128 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('age_verification_logs_user_idx').on(t.userId),
}));

export const parentalControlsRelations = relations(parentalControls, ({ one }) => ({
  child: one(users, {
    fields: [parentalControls.childUserId],
    references: [users.id],
  }),
}));

export const ageVerificationLogsRelations = relations(ageVerificationLogs, ({ one }) => ({
  user: one(users, {
    fields: [ageVerificationLogs.userId],
    references: [users.id],
  }),
}));

export const appealsRelations = relations(appeals, ({ one }) => ({
  user: one(users, {
    fields: [appeals.userId],
    references: [users.id],
    relationName: 'appealingUser',
  }),
  reviewer: one(users, {
    fields: [appeals.reviewedBy],
    references: [users.id],
    relationName: 'appealReviewer',
  }),
}));

// --- 19 MAYIS GENÇLİK LİGİ (FAZ 67) ---

export const leagueSeasons = pgTable('league_seasons', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull().unique(), // e.g., 2027
  title: varchar('title', { length: 150 }).notNull(),
  theme: varchar('theme', { length: 150 }),
  description: text('description'),
  registrationStartDate: timestamp('registration_start_date').notNull(),
  registrationEndDate: timestamp('registration_end_date').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 30 }).default('UPCOMING').notNull(), // 'UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'
  settings: jsonb('settings').$type<{
    ageGroups: string[];
    pointsCorrect: number;
    pointsHardBonus: number;
    maxSpeedBonus: number;
    questionTimeLimit: number;
    questionsPerMatch: number;
    simulationMode?: boolean;
  }>().default({
    ageGroups: ['13-15', '16-17', '18+'],
    pointsCorrect: 100,
    pointsHardBonus: 50,
    maxSpeedBonus: 25,
    questionTimeLimit: 20,
    questionsPerMatch: 8,
    simulationMode: false,
  }).notNull(),
  championUserId: integer('champion_user_id').references(() => users.id, { onDelete: 'set null' }),
  totalParticipants: integer('total_participants').default(0).notNull(),
  totalMatches: integer('total_matches').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  yearIdx: index('league_seasons_year_idx').on(t.year),
  statusIdx: index('league_seasons_status_idx').on(t.status),
}));

export const leagueParticipants = pgTable('league_participants', {
  id: serial('id').primaryKey(),
  seasonId: integer('season_id').notNull().references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ageGroup: varchar('age_group', { length: 20 }).notNull(), // '13-15', '16-17', '18+'
  totalPoints: integer('total_points').default(0).notNull(),
  matchesPlayed: integer('matches_played').default(0).notNull(),
  matchesWon: integer('matches_won').default(0).notNull(),
  correctAnswersCount: integer('correct_answers_count').default(0).notNull(),
  totalAnswersCount: integer('total_answers_count').default(0).notNull(),
  currentRound: varchar('current_round', { length: 30 }).default('QUALIFIERS').notNull(),
  status: varchar('status', { length: 30 }).default('ACTIVE').notNull(), // 'ACTIVE', 'ELIMINATED', 'FINALIST', 'CHAMPION'
  isFlagged: boolean('is_flagged').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('league_participants_season_user_unq').on(t.seasonId, t.userId),
  seasonIdx: index('league_participants_season_idx').on(t.seasonId),
  userIdx: index('league_participants_user_idx').on(t.userId),
  pointsIdx: index('league_participants_points_idx').on(t.seasonId, t.totalPoints),
  ageGroupIdx: index('league_participants_age_group_idx').on(t.seasonId, t.ageGroup),
}));

export const leagueQuestions = pgTable('league_questions', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // 'Tarih ve Kültür', 'Bilim', 'Teknoloji', 'Genel Kültür', 'Mantık', 'Spor'
  difficulty: varchar('difficulty', { length: 20 }).default('MEDIUM').notNull(), // 'EASY', 'MEDIUM', 'HARD', 'EXPERT'
  ageGroup: varchar('age_group', { length: 20 }).default('ALL').notNull(), // 'ALL', '13-15', '16-17', '18+'
  language: varchar('language', { length: 10 }).default('tr').notNull(),
  explanation: text('explanation'),
  sourceType: varchar('source_type', { length: 30 }).default('MANUAL').notNull(), // 'MANUAL', 'AI', 'OFFICIAL'
  sourceReference: text('source_reference'),
  status: varchar('status', { length: 20 }).default('ACTIVE').notNull(), // 'DRAFT', 'ACTIVE', 'INACTIVE'
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  categoryIdx: index('league_questions_category_idx').on(t.category),
  difficultyIdx: index('league_questions_difficulty_idx').on(t.difficulty),
  statusIdx: index('league_questions_status_idx').on(t.status),
  ageGroupIdx: index('league_questions_age_group_idx').on(t.ageGroup),
}));

export const leagueQuestionOptions = pgTable('league_question_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').notNull().references(() => leagueQuestions.id, { onDelete: 'cascade' }),
  optionKey: varchar('option_key', { length: 5 }).notNull(), // 'A', 'B', 'C', 'D'
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
}, (t) => ({
  unq: unique('league_question_options_q_key_unq').on(t.questionId, t.optionKey),
  questionIdx: index('league_question_options_q_idx').on(t.questionId),
}));

export const leagueMatches = pgTable('league_matches', {
  id: serial('id').primaryKey(),
  seasonId: integer('season_id').notNull().references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  stage: varchar('stage', { length: 30 }).default('QUALIFIERS').notNull(), // 'QUALIFIERS', 'TOP_32', 'TOP_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'
  ageGroup: varchar('age_group', { length: 20 }).default('13-15').notNull(),
  player1Id: integer('player1_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  player2Id: integer('player2_id').references(() => users.id, { onDelete: 'set null' }),
  isVsBot: boolean('is_vs_bot').default(false).notNull(),
  botName: varchar('bot_name', { length: 50 }),
  winnerId: integer('winner_id').references(() => users.id, { onDelete: 'set null' }),
  player1Score: integer('player1_score').default(0).notNull(),
  player2Score: integer('player2_score').default(0).notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  currentQuestionIndex: integer('current_question_index').default(0).notNull(),
  questionStartedAt: timestamp('question_started_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  seasonIdx: index('league_matches_season_idx').on(t.seasonId),
  player1Idx: index('league_matches_player1_idx').on(t.player1Id),
  player2Idx: index('league_matches_player2_idx').on(t.player2Id),
  statusIdx: index('league_matches_status_idx').on(t.status),
  stageIdx: index('league_matches_stage_idx').on(t.stage),
}));

export const leagueMatchQuestions = pgTable('league_match_questions', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').notNull().references(() => leagueMatches.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => leagueQuestions.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
}, (t) => ({
  unq: unique('league_match_questions_match_q_unq').on(t.matchId, t.questionId),
  matchIdx: index('league_match_questions_match_idx').on(t.matchId),
}));

export const leagueMatchAnswers = pgTable('league_match_answers', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').notNull().references(() => leagueMatches.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => leagueQuestions.id, { onDelete: 'cascade' }),
  selectedOption: varchar('selected_option', { length: 5 }),
  isCorrect: boolean('is_correct').default(false).notNull(),
  pointsEarned: integer('points_earned').default(0).notNull(),
  timeTakenMs: integer('time_taken_ms').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('league_match_answers_match_user_q_unq').on(t.matchId, t.userId, t.questionId),
  matchIdx: index('league_match_answers_match_idx').on(t.matchId),
  userIdx: index('league_match_answers_user_idx').on(t.userId),
}));

// --- GENÇ QUIZ (FAZ 68) ---

export const quizQuestionSets = pgTable('quiz_question_sets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 120 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('Genel Kültür').notNull(),
  difficulty: varchar('difficulty', { length: 20 }).default('Orta').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  questionCount: integer('question_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('quiz_question_sets_user_idx').on(t.userId),
  isPublicIdx: index('quiz_question_sets_public_idx').on(t.isPublic),
}));

export const quizQuestionSetItems = pgTable('quiz_question_set_items', {
  id: serial('id').primaryKey(),
  setId: integer('set_id').notNull().references(() => quizQuestionSets.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  explanation: text('explanation'),
  order: integer('order').default(1).notNull(),
  options: jsonb('options').$type<{
    key: string;
    text: string;
    isCorrect: boolean;
  }[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  setIdx: index('quiz_question_set_items_set_idx').on(t.setId),
}));

export const quizRooms = pgTable('quiz_rooms', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(), // e.g. "482731"
  title: varchar('title', { length: 150 }).notNull(),
  hostId: integer('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).default('Karışık').notNull(),
  difficulty: varchar('difficulty', { length: 20 }).default('Karışık').notNull(),
  questionCount: integer('question_count').default(10).notNull(),
  timePerQuestion: integer('time_per_question').default(20).notNull(), // seconds
  roomType: varchar('room_type', { length: 20 }).default('PUBLIC').notNull(), // 'PUBLIC', 'CODE_ONLY', 'PRIVATE'
  sourceType: varchar('source_type', { length: 30 }).default('SYSTEM').notNull(), // 'SYSTEM', 'QUESTION_SET', 'MIXED'
  questionSetId: integer('question_set_id').references(() => quizQuestionSets.id, { onDelete: 'set null' }),
  maxPlayers: integer('max_players').default(30).notNull(),
  status: varchar('status', { length: 25 }).default('LOBBY').notNull(), // 'LOBBY', 'PLAYING', 'QUESTION_ACTIVE', 'QUESTION_RESULT', 'FINISHED', 'CANCELLED'
  currentQuestionIndex: integer('current_question_index').default(0).notNull(),
  questionStartedAt: timestamp('question_started_at'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  settings: jsonb('settings').$type<{
    allowAnswerChange?: boolean;
    speedBonus?: boolean;
    soundEnabled?: boolean;
  }>().default({
    allowAnswerChange: false,
    speedBonus: true,
    soundEnabled: true,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  codeIdx: index('quiz_rooms_code_idx').on(t.code),
  hostIdx: index('quiz_rooms_host_idx').on(t.hostId),
  statusIdx: index('quiz_rooms_status_idx').on(t.status),
}));

export const quizRoomPlayers = pgTable('quiz_room_players', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => quizRooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').default(0).notNull(),
  correctAnswersCount: integer('correct_answers_count').default(0).notNull(),
  wrongAnswersCount: integer('wrong_answers_count').default(0).notNull(),
  unansweredCount: integer('unanswered_count').default(0).notNull(),
  streak: integer('streak').default(0).notNull(),
  maxStreak: integer('max_streak').default(0).notNull(),
  rank: integer('rank').default(1),
  isHost: boolean('is_host').default(false).notNull(),
  isConnected: boolean('is_connected').default(true).notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('quiz_room_players_room_user_unq').on(t.roomId, t.userId),
  roomIdx: index('quiz_room_players_room_idx').on(t.roomId),
  userIdx: index('quiz_room_players_user_idx').on(t.userId),
  scoreIdx: index('quiz_room_players_score_idx').on(t.roomId, t.score),
}));

export const quizRoomQuestions = pgTable('quiz_room_questions', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => quizRooms.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').references(() => leagueQuestions.id, { onDelete: 'set null' }),
  questionText: text('question_text').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(),
  explanation: text('explanation'),
  options: jsonb('options').$type<{
    key: string;
    text: string;
    isCorrect: boolean;
  }[]>().notNull(),
  order: integer('order').notNull(),
}, (t) => ({
  unq: unique('quiz_room_questions_room_order_unq').on(t.roomId, t.order),
  roomIdx: index('quiz_room_questions_room_idx').on(t.roomId),
}));

export const quizAnswers = pgTable('quiz_answers', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => quizRooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roomQuestionId: integer('room_question_id').notNull().references(() => quizRoomQuestions.id, { onDelete: 'cascade' }),
  selectedOption: varchar('selected_option', { length: 5 }),
  isCorrect: boolean('is_correct').default(false).notNull(),
  pointsEarned: integer('points_earned').default(0).notNull(),
  timeTakenMs: integer('time_taken_ms').default(0).notNull(),
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('quiz_answers_room_user_q_unq').on(t.roomId, t.userId, t.roomQuestionId),
  roomIdx: index('quiz_answers_room_idx').on(t.roomId),
  userIdx: index('quiz_answers_user_idx').on(t.userId),
}));

export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => quizRooms.id, { onDelete: 'set null' }),
  roomTitle: varchar('room_title', { length: 150 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rank: integer('rank').notNull(),
  totalPlayers: integer('total_players').notNull(),
  score: integer('score').notNull(),
  correctCount: integer('correct_count').notNull(),
  wrongCount: integer('wrong_count').notNull(),
  unansweredCount: integer('unanswered_count').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  playedAt: timestamp('played_at').defaultNow().notNull(),
}, (t) => ({
  userPlayedIdx: index('quiz_results_user_played_idx').on(t.userId, t.playedAt),
  userScoreIdx: index('quiz_results_user_score_idx').on(t.userId, t.score),
}));

export const quizInvites = pgTable('quiz_invites', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => quizRooms.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique('quiz_invites_room_receiver_unq').on(t.roomId, t.receiverId),
  receiverIdx: index('quiz_invites_receiver_idx').on(t.receiverId),
}));

// --- FAZ 69: TEKNOFEST KÖŞESİ (FESTIVAL & EVENT ARCHIVE) ---

export const teknofestEvents = pgTable('teknofest_events', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(), // e.g. "2026", "2025", "2027"
  title: varchar('title', { length: 150 }).notNull(), // e.g. "TEKNOFEST 2026"
  theme: varchar('theme', { length: 255 }), // e.g. "Geleceğin Teknolojileri ve Havacılık"
  description: text('description').notNull(),
  location: varchar('location', { length: 150 }).notNull(), // e.g. "İstanbul — Atatürk Havalimanı"
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  coverImageUrl: text('cover_image_url'),
  status: varchar('status', { length: 30 }).default('COMPLETED').notNull(), // 'UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'
  isFeatured: boolean('is_featured').default(true).notNull(),
  stats: jsonb('stats').default({
    visitorCount: '1.2M+',
    projectCount: '1,500+',
    competitionsCount: '44',
    teamCount: '25,000+'
  }),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  slugIdx: index('teknofest_events_slug_idx').on(t.slug),
  statusIdx: index('teknofest_events_status_idx').on(t.status),
}));

export const teknofestCategories = pgTable('teknofest_categories', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => teknofestEvents.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).default('Camera').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  eventCategoryUnq: unique('teknofest_categories_event_slug_unq').on(t.eventId, t.slug),
  eventIdIdx: index('teknofest_categories_event_id_idx').on(t.eventId),
}));

export const teknofestTimelineItems = pgTable('teknofest_timeline_items', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => teknofestEvents.id, { onDelete: 'cascade' }),
  dateLabel: varchar('date_label', { length: 50 }).notNull(), // e.g. "30 Eylül", "01 Ekim"
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }).default('Sparkles').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  eventIdIdx: index('teknofest_timeline_event_id_idx').on(t.eventId),
}));

export const teknofestMedia = pgTable('teknofest_media', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => teknofestEvents.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  categoryId: integer('category_id').references(() => teknofestCategories.id, { onDelete: 'set null' }),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  mediaType: varchar('media_type', { length: 20 }).default('IMAGE').notNull(), // 'IMAGE', 'VIDEO'
  mediaUrl: text('media_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: varchar('title', { length: 200 }),
  caption: text('caption'),
  altText: varchar('alt_text', { length: 255 }),
  credit: varchar('credit', { length: 200 }).default('📷 Genç Sosyal Topluluğu').notNull(),
  aspectRatio: varchar('aspect_ratio', { length: 20 }).default('4:3'), // '1:1', '4:3', '16:9', '3:4', '9:16'
  duration: integer('duration'), // In seconds if video
  viewsCount: integer('views_count').default(0).notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  moderationStatus: varchar('moderation_status', { length: 20 }).default('APPROVED').notNull(), // 'PENDING', 'APPROVED', 'REJECTED'
  rejectionReason: text('rejection_reason'),
  reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  eventIdIdx: index('teknofest_media_event_id_idx').on(t.eventId),
  userIdIdx: index('teknofest_media_user_id_idx').on(t.userId),
  categoryIdx: index('teknofest_media_category_id_idx').on(t.categoryId),
  modStatusIdx: index('teknofest_media_mod_status_idx').on(t.moderationStatus),
  isFeaturedIdx: index('teknofest_media_is_featured_idx').on(t.isFeatured),
}));

export const teknofestMemories = pgTable('teknofest_memories', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => teknofestEvents.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  authorName: varchar('author_name', { length: 100 }),
  authorTitle: varchar('author_title', { length: 150 }), // e.g. "İHA Takım Kaptanı", "Yarışmacı"
  isFeatured: boolean('is_featured').default(false).notNull(),
  moderationStatus: varchar('moderation_status', { length: 20 }).default('APPROVED').notNull(), // 'PENDING', 'APPROVED', 'REJECTED'
  rejectionReason: text('rejection_reason'),
  reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  eventIdIdx: index('teknofest_memories_event_id_idx').on(t.eventId),
  userIdIdx: index('teknofest_memories_user_id_idx').on(t.userId),
  modStatusIdx: index('teknofest_memories_mod_status_idx').on(t.moderationStatus),
}));

export const teknofestEventsRelations = relations(teknofestEvents, ({ many }) => ({
  categories: many(teknofestCategories),
  timelineItems: many(teknofestTimelineItems),
  media: many(teknofestMedia),
  memories: many(teknofestMemories),
}));

export const teknofestCategoriesRelations = relations(teknofestCategories, ({ one, many }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestCategories.eventId],
    references: [teknofestEvents.id],
  }),
  media: many(teknofestMedia),
}));

export const teknofestTimelineItemsRelations = relations(teknofestTimelineItems, ({ one }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestTimelineItems.eventId],
    references: [teknofestEvents.id],
  }),
}));

export const teknofestMediaRelations = relations(teknofestMedia, ({ one }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestMedia.eventId],
    references: [teknofestEvents.id],
  }),
  user: one(users, {
    fields: [teknofestMedia.userId],
    references: [users.id],
  }),
  category: one(teknofestCategories, {
    fields: [teknofestMedia.categoryId],
    references: [teknofestCategories.id],
  }),
  post: one(posts, {
    fields: [teknofestMedia.postId],
    references: [posts.id],
  }),
  project: one(projects, {
    fields: [teknofestMedia.projectId],
    references: [projects.id],
  }),
}));

export const teknofestMemoriesRelations = relations(teknofestMemories, ({ one }) => ({
  event: one(teknofestEvents, {
    fields: [teknofestMemories.eventId],
    references: [teknofestEvents.id],
  }),
  user: one(users, {
    fields: [teknofestMemories.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [teknofestMemories.postId],
    references: [posts.id],
  }),
}));






