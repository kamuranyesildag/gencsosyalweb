import re

with open("src/db/schema.ts", "r") as f:
    content = f.read()

# Add to posts
posts_target = "postType: varchar('post_type', { length: 20 }).default('NORMAL').notNull(), // NORMAL, POLL, SENSITIVE"
posts_replacement = "postType: varchar('post_type', { length: 20 }).default('NORMAL').notNull(), // NORMAL, POLL, SENSITIVE\n  moderationStatus: varchar('moderation_status', { length: 20 }).default('APPROVED').notNull(),"
content = content.replace(posts_target, posts_replacement)

# Add to comments
comments_target = "content: text('content').notNull(),"
comments_replacement = "content: text('content').notNull(),\n  moderationStatus: varchar('moderation_status', { length: 20 }).default('APPROVED').notNull(),"
content = content.replace(comments_target, comments_replacement)

# Add moderation_logs table
if "export const moderationLogs" not in content:
    moderation_table = """
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
"""
    content += moderation_table

with open("src/db/schema.ts", "w") as f:
    f.write(content)
