const fs = require('fs');

let content = fs.readFileSync('server/routes/posts.ts', 'utf8');

const search = `    const media = await db.select().from(postMedia).where(eq(postMedia.postId, postId));
    res.json({ success: true, data: { ...post, media }});`;

const replace = `    const media = await db.select().from(postMedia).where(eq(postMedia.postId, postId));
    const repostRecords = await db.select().from(reposts).where(eq(reposts.postId, postId));
    const repostCount = repostRecords.length;
    const isReposted = repostRecords.some(r => r.userId === currentUserId);
    res.json({ success: true, data: { ...post, media, repostCount, isReposted }});`;

if (content.includes('const media = await db.select()')) {
    content = content.replace(search, replace);
    fs.writeFileSync('server/routes/posts.ts', content);
    console.log("Patched posts.ts");
} else {
    console.log("Could not patch posts.ts");
}
