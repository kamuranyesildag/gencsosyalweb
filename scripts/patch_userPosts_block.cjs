const fs = require('fs');

let content = fs.readFileSync('server/routes/userPosts.ts', 'utf8');

if (!content.includes('getBlockedIds')) {
  content = content.replace(
    'import { paginationSchema } from "../validators/api.js";',
    'import { paginationSchema } from "../validators/api.js";\nimport { getBlockedIds } from "../utils/blocks.js";'
  );

  const search = `    const isSelf = currentUserId === targetUserId;`;
  const replace = `    const isSelf = currentUserId === targetUserId;\n    \n    // Block filter\n    const blockedIds = await getBlockedIds(currentUserId);\n    if (blockedIds.includes(targetUserId)) {\n      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullanıcıya erişiminiz yok." } });\n    }`;

  content = content.replace(search, replace);
  fs.writeFileSync('server/routes/userPosts.ts', content);
  console.log("Patched userPosts.ts with block filter");
}
