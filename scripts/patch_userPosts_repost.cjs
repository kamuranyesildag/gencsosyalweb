const fs = require('fs');

let content = fs.readFileSync('server/routes/userPosts.ts', 'utf8');

if (!content.includes(' reposts ')) {
  content = content.replace(
    'import { posts, postMedia, users, profiles, follows } from "../../src/db/schema.js";',
    'import { posts, postMedia, users, profiles, follows, reposts } from "../../src/db/schema.js";'
  );
}

const search = `    for (let p of visiblePosts) {
      const media = await db.select().from(postMedia).where(eq(postMedia.postId, p.id));
      (p as any).media = media;
    }`;

const replace = `    for (let p of visiblePosts) {
      const media = await db.select().from(postMedia).where(eq(postMedia.postId, p.id));
      (p as any).media = media;
      const repostRecords = await db.select().from(reposts).where(eq(reposts.postId, p.id));
      (p as any).repostCount = repostRecords.length;
      (p as any).isReposted = repostRecords.some(r => r.userId === currentUserId);
    }`;

if (content.includes('for (let p of visiblePosts) {')) {
    content = content.replace(search, replace);
    fs.writeFileSync('server/routes/userPosts.ts', content);
    console.log("Patched userPosts.ts");
} else {
    console.log("Could not patch userPosts.ts");
}
