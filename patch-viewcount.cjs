const fs = require('fs');
function patchFile(filepath) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/visibility: posts\.visibility,/g, 'visibility: posts.visibility,\n      viewCount: posts.viewCount,');
    fs.writeFileSync(filepath, content);
}
['server/routes/feed.ts', 'server/routes/posts.ts', 'server/routes/userPosts.ts'].forEach(patchFile);
console.log('Patched viewCount in server routes');
