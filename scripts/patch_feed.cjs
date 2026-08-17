const fs = require('fs');
let content = fs.readFileSync('server/routes/feed.ts', 'utf8');

// Change requireAuth to optionalAuth
content = content.replace(
  'import { requireAuth } from "../middleware/auth.js";',
  'import { requireAuth, optionalAuth } from "../middleware/auth.js";'
);

content = content.replace(
  'feedRouter.get("/", requireAuth, async (req, res) => {',
  'feedRouter.get("/", optionalAuth, async (req, res) => {'
);

content = content.replace(
  'const currentUserId = req.user!.userId;',
  'const currentUserId = req.user?.userId || -1;'
);

fs.writeFileSync('server/routes/feed.ts', content);
