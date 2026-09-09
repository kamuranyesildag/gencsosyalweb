const fs = require('fs');
const path = 'server/utils/postStats.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'isFollowing: followStats.some(f => f.followingId === p.userId),',
  'isFollowing: followStats.some(f => f.followingId === p.userId),\n      repostedBy: p.repostedBy,'
);

fs.writeFileSync(path, code);
