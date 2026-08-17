const fs = require('fs');

let content = fs.readFileSync('server/routes/bookmarks.ts', 'utf8');

if (!content.includes(' reposts ')) {
  content = content.replace(
    'import { bookmarks, posts, postMedia, users, profiles } from "../../src/db/schema.js";',
    'import { bookmarks, posts, postMedia, users, profiles, reposts } from "../../src/db/schema.js";'
  );
}

const search = `    for (let p of savedPosts) {
      const media = await db.select().from(postMedia).where(eq(postMedia.postId, p.id));
      (p as any).media = media;
    }`;

const replace = `    for (let p of savedPosts) {
      const media = await db.select().from(postMedia).where(eq(postMedia.postId, p.id));
      (p as any).media = media;
      const repostRecords = await db.select().from(reposts).where(eq(reposts.postId, p.id));
      (p as any).repostCount = repostRecords.length;
      (p as any).isReposted = repostRecords.some(r => r.userId === currentUserId);
    }`;

if (content.includes('for (let p of savedPosts) {')) {
    content = content.replace(search, replace);
    fs.writeFileSync('server/routes/bookmarks.ts', content);
    console.log("Patched bookmarks.ts");
} else {
    console.log("Could not patch bookmarks.ts");
}
