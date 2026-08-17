const fs = require('fs');
let content = fs.readFileSync('src/db/schema.ts', 'utf8');

content = content.replace(
  "  createdAt: timestamp('created_at').defaultNow().notNull(),\n});",
  "  createdAt: timestamp('created_at').defaultNow().notNull(),\n}, (t) => ({\n  userIdIdx: index('refresh_tokens_user_id_idx').on(t.userId),\n}));"
);

fs.writeFileSync('src/db/schema.ts', content);
