const fs = require('fs');
const path = 'server/utils/postStats.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'import { postMedia, reposts, likes, bookmarks, comments, postCollaborators, users, profiles, pollOptions, pollVotes, follows } from "../../src/db/schema.js";',
  'import { postMedia, reposts, likes, reactions, bookmarks, comments, postCollaborators, users, profiles, pollOptions, pollVotes, follows } from "../../src/db/schema.js";'
);

code = code.replace(
  'const likesMap = new Map(likeStats.map(s => [s.postId, { count: s.count, isLiked: s.isLiked === 1 }]));',
  'const reactionsMap = new Map(likeStats.map(s => [s.postId, { count: s.count, myReaction: s.myReaction }]));'
);

code = code.replace(
  'const lStat = likesMap.get(p.id) || { count: 0, isLiked: false };',
  'const rStat2 = reactionsMap.get(p.id) || { count: 0, myReaction: null };'
);

code = code.replace(
  '      likeCount: lStat.count,\n      isLiked: lStat.isLiked,',
  '      likeCount: rStat2.count,\n      isLiked: !!rStat2.myReaction,\n      myReaction: rStat2.myReaction,'
);

fs.writeFileSync(path, code);
