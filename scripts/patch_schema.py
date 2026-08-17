import sys

def replace_in_file(filename, old, new):
    with open(filename, "r") as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filename, "w") as f:
        f.write(content)

old_users = """  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),"""
new_users = """  emailVerified: boolean('email_verified').default(false).notNull(),
  isOfficialAccount: boolean('is_official_account').default(false).notNull(),
  officialNotifyEnabled: boolean('official_notify_enabled').default(true).notNull(),
  officialPriority: varchar('official_priority', { length: 20 }).default('normal').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),"""

replace_in_file("src/db/schema.ts", old_users, new_users)

old_follows = """  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),"""
new_follows = """  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  notificationPreference: varchar('notification_preference', { length: 20 }).default('standard').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),"""

replace_in_file("src/db/schema.ts", old_follows, new_follows)

