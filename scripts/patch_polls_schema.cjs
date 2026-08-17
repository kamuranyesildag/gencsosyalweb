const fs = require('fs');
let content = fs.readFileSync('src/db/schema.ts', 'utf8');

const pollTables = `

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
`;

content = content.replace(
  "export const postMedia = pgTable('post_media', {",
  pollTables + "\nexport const postMedia = pgTable('post_media', {"
);

const pollRelations = `
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
`;

content = content.replace(
  "export const commentsRelations = relations(comments, ({ one, many }) => ({",
  pollRelations + "\nexport const commentsRelations = relations(comments, ({ one, many }) => ({"
);

content = content.replace(
  "  collaborators: many(postCollaborators),",
  "  collaborators: many(postCollaborators),\n  pollOptions: many(pollOptions),"
);

fs.writeFileSync('src/db/schema.ts', content);
