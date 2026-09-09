const fs = require('fs');
const path = './server/routes/users.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /let isFollowing = false;\s*let followsMe = false;\s*let notificationPreference = null;\s*if \(currentUserId\) {/,
  `let isFollowing = false;
    let followStatus = 'none';
    let followsMe = false;
    let notificationPreference = null;
    if (currentUserId) {`
);

code = code.replace(
  /if \(isFollowingRes.length > 0\) {\s*isFollowing = true;\s*notificationPreference = isFollowingRes\[0\]\.notificationPreference;\s*}/,
  `if (isFollowingRes.length > 0) {
        followStatus = isFollowingRes[0].status;
        isFollowing = followStatus === 'accepted';
        notificationPreference = isFollowingRes[0].notificationPreference;
      }`
);

code = code.replace(
  /if \(followsMeRes.length > 0\) {\s*followsMe = true;\s*}/,
  `if (followsMeRes.length > 0 && followsMeRes[0].status === 'accepted') {
        followsMe = true;
      }`
);

fs.writeFileSync(path, code);
