const fs = require('fs');
let content = fs.readFileSync('server/routes/communities.ts', 'utf8');

content = content.replace(
  'import { requireAuth } from "../middleware/auth.js";',
  'import { requireAuth, optionalAuth } from "../middleware/auth.js";'
);

content = content.replace(
  'communitiesRouter.get("/", requireAuth,',
  'communitiesRouter.get("/", optionalAuth,'
);

content = content.replace(
  'communitiesRouter.get("/:slug", requireAuth,',
  'communitiesRouter.get("/:slug", optionalAuth,'
);

content = content.replace(
  'communitiesRouter.get("/:id/members", requireAuth,',
  'communitiesRouter.get("/:id/members", optionalAuth,'
);

content = content.replace(
  'communitiesRouter.get("/:id/posts", requireAuth,',
  'communitiesRouter.get("/:id/posts", optionalAuth,'
);

// We need to replace currentUserId
content = content.replaceAll(
  'const currentUserId = req.user!.userId;',
  'const currentUserId = req.user?.userId || -1;'
);

fs.writeFileSync('server/routes/communities.ts', content);
