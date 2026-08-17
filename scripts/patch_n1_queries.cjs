const fs = require('fs');
const { inArray } = require('drizzle-orm'); // Just making sure I don't import, it's string replace

function fixN1(file, arrayName) {
  let content = fs.readFileSync(file, 'utf8');

  // Add inArray import if not exists
  if (!content.includes('inArray')) {
    content = content.replace(
      'import { eq, desc',
      'import { eq, desc, inArray'
    );
  }

  const search = `    for (let p of ${arrayName}) {
      const media = await db.select().from(postMedia).where(eq(postMedia.postId, p.id));
      (p as any).media = media;
      const repostRecords = await db.select().from(reposts).where(eq(reposts.postId, p.id));
      (p as any).repostCount = repostRecords.length;
      (p as any).isReposted = repostRecords.some(r => r.userId === currentUserId);
    }`;

  const replace = `    const postIds = ${arrayName}.map(p => p.id);
    let allMedia: any[] = [];
    let allReposts: any[] = [];
    if (postIds.length > 0) {
      allMedia = await db.select().from(postMedia).where(inArray(postMedia.postId, postIds));
      allReposts = await db.select().from(reposts).where(inArray(reposts.postId, postIds));
    }

    for (let p of ${arrayName}) {
      (p as any).media = allMedia.filter(m => m.postId === p.id).sort((a, b) => a.sortOrder - b.sortOrder);
      const postReposts = allReposts.filter(r => r.postId === p.id);
      (p as any).repostCount = postReposts.length;
      (p as any).isReposted = postReposts.some(r => r.userId === currentUserId);
    }`;

  if (content.includes(`for (let p of ${arrayName}) {`)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content);
    console.log("Patched N+1 in " + file);
  } else {
    console.log("Could not find N+1 loop in " + file);
  }
}

fixN1('server/routes/userPosts.ts', 'visiblePosts');
fixN1('server/routes/bookmarks.ts', 'savedPosts');
