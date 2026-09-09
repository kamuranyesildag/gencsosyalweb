const fs = require('fs');
const path = 'server/routes/userPosts.ts';
let code = fs.readFileSync(path, 'utf8');

// The result of our Promise.all replacement is `userPosts` array with `__repostUserId`
// Let's attach `repostedBy` if __repostUserId is present.

const injectCode = `
    const targetUser = await db.select({
       id: users.id,
       username: users.username,
       displayName: profiles.displayName,
       avatarUrl: profiles.avatarUrl,
    }).from(users).leftJoin(profiles, eq(users.id, profiles.userId)).where(eq(users.id, targetUserId)).limit(1);

    const targetUserInfo = targetUser.length > 0 ? targetUser[0] : null;

    userPosts = userPosts.map(p => {
       if (p.__repostUserId) {
          return { ...p, repostedBy: targetUserInfo };
       }
       return p;
    });
`;

code = code.replace(
  'const formattedPosts = await populatePostStats(userPosts, currentUserId);',
  injectCode + '\n    const formattedPosts = await populatePostStats(userPosts, currentUserId);'
);

fs.writeFileSync(path, code);
