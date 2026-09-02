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
  postType: varchar('post_type', { length: 20 }).default('NORMAL').notNull(), // NORMAL, POLL, SENSITIVE
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
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  recipientIdx: index('notifications_recipient_idx').on(t.recipientId),
  isReadIdx: index('notifications_is_read_idx').on(t.isRead),
  recipientUnreadDateIdx: index('notifications_recipient_unread_date_idx').on(t.recipientId, t.isRead, t.createdAt),
  recipientCreatedAtIdx: index('notifications_recipient_created_at_idx').on(t.recipientId, t.createdAt),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const communityMembers = pgTable('community_members', {
  communityId: integer('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).default('MEMBER').notNull(), // OWNER, MODERATOR, MEMBER
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.communityId, t.userId] }),
  communityIdx: index('community_members_community_idx').on(t.communityId),
  userIdIdx: index('community_members_user_idx').on(t.userId),
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
