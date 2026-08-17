const fs = require('fs');
let content = fs.readFileSync('src/db/schema.ts', 'utf8');

content = content.replace(
  "}, (t) => ({\n  userIdIdx: index('refresh_tokens_user_id_idx').on(t.userId),\n}));\n\n// --- INTERACTIONS ---",
  "});\n\n// --- INTERACTIONS ---"
);

const parts = content.split("export const refreshTokens = pgTable('refresh_tokens', {");
const secondPart = parts[1];
const endIndex = secondPart.indexOf("\n});");
const newSecondPart = secondPart.substring(0, endIndex) + "\n}, (t) => ({\n  userIdIdx: index('refresh_tokens_user_id_idx').on(t.userId),\n}));" + secondPart.substring(endIndex + 4);

content = parts[0] + "export const refreshTokens = pgTable('refresh_tokens', {" + newSecondPart;

fs.writeFileSync('src/db/schema.ts', content);
