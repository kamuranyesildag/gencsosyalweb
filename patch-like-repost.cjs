const fs = require('fs');
const path = 'server/routes/posts.ts';
let content = fs.readFileSync(path, 'utf8');

// Remove self-like restriction
content = content.replace(
  /if \(postRecord\[0\]\.userId === currentUserId\) \{\n\s*return res\.status\(400\)\.json\(\{ success: false, error: \{ code: "BAD_REQUEST", message: "Kendi gönderinize beğeni atamazsınız\." \}\}\);\n\s*\}/g,
  ''
);

// Remove self-repost restriction
content = content.replace(
  /if \(postRecord\[0\]\.userId === currentUserId\) \{\n\s*return res\.status\(400\)\.json\(\{ success: false, error: \{ code: "BAD_REQUEST", message: "Kendi gönderinizi yeniden paylaşamazsınız\." \}\}\);\n\s*\}/g,
  ''
);

fs.writeFileSync(path, content);
