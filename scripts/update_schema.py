import re

with open('src/db/schema.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_fields = """  isPrivate: boolean('is_private').default(false).notNull(),
  allowSearchEngineIndexing: boolean('allow_search_engine_indexing').default(true).notNull(),
  messagePreference: varchar('message_preference', { length: 20 }).default('ANYONE').notNull(),
  mentionPreference: varchar('mention_preference', { length: 20 }).default('ANYONE').notNull(),
  defaultPostVisibility: varchar('default_post_visibility', { length: 20 }).default('PUBLIC').notNull(),"""

content = content.replace("  website: varchar('website', { length: 255 }),", f"  website: varchar('website', {{ length: 255 }}),\n{new_fields}")

with open('src/db/schema.ts', 'w', encoding='utf-8') as f:
    f.write(content)
