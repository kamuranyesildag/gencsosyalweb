const fs = require('fs');

function patchFile(filepath, replaces) {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    for (const [search, replace] of replaces) {
      content = content.replace(search, replace);
    }
    fs.writeFileSync(filepath, content);
  }
}

// posts.ts
patchFile('server/routes/posts.ts', [
  ['import { requireAuth } from "../middleware/auth.js";', 'import { requireAuth, optionalAuth } from "../middleware/auth.js";'],
  ['postsRouter.get("/:id", requireAuth,', 'postsRouter.get("/:id", optionalAuth,'],
  ['const currentUserId = req.user!.userId;', 'const currentUserId = req.user?.userId || -1;']
]);

// userPosts.ts
patchFile('server/routes/userPosts.ts', [
  ['import { requireAuth } from "../middleware/auth.js";', 'import { requireAuth, optionalAuth } from "../middleware/auth.js";'],
  ['userPostsRouter.get("/:username/posts", requireAuth,', 'userPostsRouter.get("/:username/posts", optionalAuth,'],
  ['const currentUserId = req.user!.userId;', 'const currentUserId = req.user?.userId || -1;']
]);

// comments.ts
patchFile('server/routes/comments.ts', [
  ['import { requireAuth } from "../middleware/auth.js";', 'import { requireAuth, optionalAuth } from "../middleware/auth.js";'],
  ['commentsRouter.get("/:id/comments", requireAuth,', 'commentsRouter.get("/:id/comments", optionalAuth,'],
  ['const currentUserId = req.user!.userId;', 'const currentUserId = req.user?.userId || -1;']
]);

// users.ts
patchFile('server/routes/users.ts', [
  ['import { requireAuth } from "../middleware/auth.js";', 'import { requireAuth, optionalAuth } from "../middleware/auth.js";'],
  ['usersRouter.get("/:username", requireAuth,', 'usersRouter.get("/:username", optionalAuth,'],
  ['const currentUserId = req.user!.userId;', 'const currentUserId = req.user?.userId || -1;']
]);

