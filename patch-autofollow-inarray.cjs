const fs = require('fs');
const path = 'server/routes/admin.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { eq, ilike, or, desc, sql, and, inArray }')) {
  content = content.replace(
    /import \{ eq, ilike, or, desc, sql, and \} from "drizzle-orm";/,
    'import { eq, ilike, or, desc, sql, and, inArray } from "drizzle-orm";'
  );
}

content = content.replace(
  /\.where\(sql\`\$\{users\.id\} = ANY\(\$\{userIds\}\)\`\);/,
  '.where(inArray(users.id, userIds));'
);

fs.writeFileSync(path, content);
