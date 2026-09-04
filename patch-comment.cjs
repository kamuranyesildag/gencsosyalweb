const fs = require('fs');
const path = 'server/routes/posts.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /return newComment;\n    \}\);\n\n    if \(returnedError\)/,
  `const userProfile = await tx.select({ username: users.username, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl }).from(users).leftJoin(profiles, eq(users.id, profiles.userId)).where(eq(users.id, currentUserId)).limit(1);\n      return { ...newComment, user: userProfile[0] };\n    });\n\n    if (returnedError)`
);

fs.writeFileSync(path, content);
