const fs = require('fs');
const path = 'server/routes/admin.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace recoveryCodes
content = content.replace(
  /const \{ recoveryCodes \} = await import\("\.\.\/\.\.\/src\/db\/schema\.js"\);\n/g,
  ''
);
if (!content.includes('recoveryCodes')) {
  // need to add recoveryCodes to schema import
}

// Replace systemSettings, adminAuditLogs
content = content.replace(
  /const \{ systemSettings, adminAuditLogs \} = await import\("\.\.\/\.\.\/src\/db\/schema\.js"\);\n/g,
  ''
);

content = content.replace(
  /import \{ users, profiles, verificationRequests, adminAuditLogs, moderationLogs, posts, comments, projectComments, projects, reports, communities, systemSettings \} from "\.\.\/\.\.\/src\/db\/schema\.js";/,
  'import { users, profiles, verificationRequests, adminAuditLogs, moderationLogs, posts, comments, projectComments, projects, reports, communities, systemSettings, recoveryCodes } from "../../src/db/schema.js";'
);

// Replace utils imports
content = content.replace(
  /const \{ encryptString \} = await import\("\.\.\/utils\/encryption\.js"\);\n/g,
  ''
);
content = content.replace(
  /const \{ sendSmtpTestEmail \} = await import\("\.\.\/utils\/mailer\.js"\);\n/g,
  ''
);

if (!content.includes('import { encryptString }')) {
  content = 'import { encryptString } from "../utils/encryption.js";\n' + content;
}
if (!content.includes('import { sendSmtpTestEmail }')) {
  // It might already have sendVerificationStatusEmail from mailer.js
  content = content.replace(
    /import \{ sendVerificationStatusEmail \} from "\.\.\/utils\/mailer\.js";/,
    'import { sendVerificationStatusEmail, sendSmtpTestEmail } from "../utils/mailer.js";'
  );
}

fs.writeFileSync(path, content);
