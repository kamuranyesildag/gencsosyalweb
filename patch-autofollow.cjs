const fs = require('fs');
const path = 'server/routes/admin.ts';
let content = fs.readFileSync(path, 'utf8');

// replace the dynamic import
content = content.replace(
  /const \{ systemSettings \} = await import\("\.\.\/\.\.\/src\/db\/schema\.js"\);\n/,
  ''
);

// add to top imports
if (!content.includes(', systemSettings }')) {
  content = content.replace(
    /import \{ users, profiles, verificationRequests, adminAuditLogs, moderationLogs, posts, comments, projectComments, projects, reports, communities \} from "\.\.\/\.\.\/src\/db\/schema\.js";/,
    'import { users, profiles, verificationRequests, adminAuditLogs, moderationLogs, posts, comments, projectComments, projects, reports, communities, systemSettings } from "../../src/db/schema.js";'
  );
}

fs.writeFileSync(path, content);
