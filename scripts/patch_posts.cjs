const fs = require('fs');

let content = fs.readFileSync('server/routes/posts.ts', 'utf8');

// Add import
content = content.replace(
  'import { getBlockedIds } from "../utils/blocks.js";',
  'import { getBlockedIds } from "../utils/blocks.js";\nimport { verifyPostAccess } from "../utils/visibility.js";'
);

// Helper function to insert verifyPostAccess check
function protectEndpoint(methodAndPath, varName) {
  const search = `const currentUserId = req.user!.userId;`;
  const replace = `const currentUserId = req.user!.userId;\n    if (!(await verifyPostAccess(${varName}, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});`;
  
  // Find the exact block for the route and replace inside it
  const routeIdx = content.indexOf(methodAndPath);
  if (routeIdx === -1) return;
  const nextRouteIdx = content.indexOf('//', routeIdx + 10);
  const block = nextRouteIdx === -1 ? content.substring(routeIdx) : content.substring(routeIdx, nextRouteIdx);
  
  const modifiedBlock = block.replace(search, replace);
  content = content.replace(block, modifiedBlock);
}

protectEndpoint('// POST /posts/:id/like', 'postId');
protectEndpoint('// DELETE /posts/:id/like', 'postId');
protectEndpoint('// POST /posts/:id/comments', 'postId');
protectEndpoint('// POST /posts/:id/bookmark', 'postId');
protectEndpoint('// DELETE /posts/:id/bookmark', 'postId');
protectEndpoint('// POST /posts/:id/repost', 'postId');
protectEndpoint('// DELETE /posts/:id/repost', 'postId');

fs.writeFileSync('server/routes/posts.ts', content);
