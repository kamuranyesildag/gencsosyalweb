const fs = require('fs');
const path = 'server/routes/posts.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  "await notify(currentUserId, qRecord[0].userId, 'repost', newPost.id);",
  "await notify(currentUserId, qRecord[0].userId, 'repost', parsed.data.quotedPostId);"
);
fs.writeFileSync(path, code);
