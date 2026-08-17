const fs = require('fs');
let content = fs.readFileSync('server/routes/posts.ts', 'utf8');

const search = `    if (blockedIds.includes(post.userId)) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    }
    
    // Visibility checks
    if (post.visibility === 'PRIVATE' && post.userId !== currentUserId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    }
    if (post.visibility === 'FOLLOWERS' && post.userId !== currentUserId) {
      const { follows } = await import("../../src/db/schema.js");
      const follow = await db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, post.userId))).limit(1);
      if (follow.length === 0) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
      }
    }`;

const replace = `    if (!(await verifyPostAccess(postId, currentUserId))) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    }`;

content = content.replace(search, replace);
fs.writeFileSync('server/routes/posts.ts', content);
