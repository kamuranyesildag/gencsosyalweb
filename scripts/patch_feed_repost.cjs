const fs = require('fs');

let content = fs.readFileSync('server/routes/feed.ts', 'utf8');

if (!content.includes(' reposts ')) {
  content = content.replace(
    'import { posts, postMedia, follows, users, profiles, postViews } from "../../src/db/schema.js";',
    'import { posts, postMedia, follows, users, profiles, postViews, reposts } from "../../src/db/schema.js";'
  );
}

const search = `    // N+1 Query problemini çözmek için tüm medyaları tek seferde çekiyoruz
    const postIds = feedPosts.map(p => p.id);
    let allMedia: any[] = [];
    if (postIds.length > 0) {
      allMedia = await db.select().from(postMedia).where(inArray(postMedia.postId, postIds));
    }

    const formattedPosts = feedPosts.map(p => ({
      ...p,
      media: allMedia.filter(m => m.postId === p.id).sort((a, b) => a.sortOrder - b.sortOrder)
    }));`;

const replace = `    // N+1 Query problemini çözmek için tüm medyaları tek seferde çekiyoruz
    const postIds = feedPosts.map(p => p.id);
    let allMedia: any[] = [];
    let allReposts: any[] = [];
    if (postIds.length > 0) {
      allMedia = await db.select().from(postMedia).where(inArray(postMedia.postId, postIds));
      allReposts = await db.select().from(reposts).where(inArray(reposts.postId, postIds));
    }

    const formattedPosts = feedPosts.map(p => {
      const postReposts = allReposts.filter(r => r.postId === p.id);
      return {
        ...p,
        media: allMedia.filter(m => m.postId === p.id).sort((a, b) => a.sortOrder - b.sortOrder),
        repostCount: postReposts.length,
        isReposted: postReposts.some(r => r.userId === currentUserId)
      };
    });`;

if (content.includes('const postIds = feedPosts.map(p => p.id);')) {
    content = content.replace(search, replace);
    fs.writeFileSync('server/routes/feed.ts', content);
    console.log("Patched feed.ts");
} else {
    console.log("Could not patch feed.ts");
}
