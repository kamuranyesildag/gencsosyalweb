const fs = require('fs');
let content = fs.readFileSync('server/routes/search.ts', 'utf8');

content = content.replace(
  'import { requireAuth } from "../middleware/auth.js";',
  'import { requireAuth, optionalAuth } from "../middleware/auth.js";'
);
content = content.replace(
  'searchRouter.get("/", requireAuth,',
  'searchRouter.get("/", optionalAuth,'
);
content = content.replace(
  'const currentUserId = req.user!.userId;',
  'const currentUserId = req.user?.userId || -1;'
);

fs.writeFileSync('server/routes/search.ts', content);
