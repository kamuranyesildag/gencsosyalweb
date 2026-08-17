const fs = require('fs');

let content = fs.readFileSync('server/routes/reactions.ts', 'utf8');

if (!content.includes('verifyPostAccess')) {
  content = content.replace(
    'import { standardLimiter } from "../middleware/rateLimiter.js";',
    'import { standardLimiter } from "../middleware/rateLimiter.js";\nimport { verifyPostAccess } from "../utils/visibility.js";'
  );
}

function protectEndpoint(methodAndPath, varName) {
  const search = `const currentUserId = req.user!.userId;`;
  const replace = `const currentUserId = req.user!.userId;\n    if (!(await verifyPostAccess(${varName}, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});`;
  
  const routeIdx = content.indexOf(methodAndPath);
  if (routeIdx === -1) return;
  const nextRouteIdx = content.indexOf('//', routeIdx + 10);
  const block = nextRouteIdx === -1 ? content.substring(routeIdx) : content.substring(routeIdx, nextRouteIdx);
  
  if (!block.includes('verifyPostAccess')) {
    const modifiedBlock = block.replace(search, replace);
    content = content.replace(block, modifiedBlock);
  }
}

protectEndpoint('// POST /posts/:id/reaction', 'postId');
protectEndpoint('// DELETE /posts/:id/reaction', 'postId');

fs.writeFileSync('server/routes/reactions.ts', content);
