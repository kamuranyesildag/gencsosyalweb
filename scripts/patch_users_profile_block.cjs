const fs = require('fs');
let content = fs.readFileSync('server/routes/users.ts', 'utf8');

if (!content.includes('getBlockedIds')) {
  content = content.replace(
    'import { requireAuth } from "../middleware/auth.js";',
    'import { requireAuth } from "../middleware/auth.js";\nimport { getBlockedIds } from "../utils/blocks.js";'
  );

  const search = `    if (userRecords.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." }});`;
  
  const replace = `    if (userRecords.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." }});\n\n    const blockedIds = await getBlockedIds(currentUserId);\n    if (blockedIds.includes(userRecords[0].id)) {\n      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu profile erişiminiz yok." }});\n    }`;

  content = content.replace(search, replace);
  fs.writeFileSync('server/routes/users.ts', content);
  console.log("Patched users.ts with block filter");
}
