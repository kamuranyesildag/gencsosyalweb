const fs = require('fs');
const path = 'server/routes/posts.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /if \(parsed\.data\.quotedPostId\)/;
if (!code.match(regex)) {
   const replacement = `
      if (parsed.data.quotedPostId) {
        const qRecord = await tx.select().from(posts).where(eq(posts.id, parsed.data.quotedPostId)).limit(1);
        if (qRecord.length > 0 && qRecord[0].userId !== currentUserId) {
          // Send notification (we can just use 'repost' type for quotes too, or 'quote' if it exists. Let's use 'repost')
          await notify(currentUserId, qRecord[0].userId, 'repost', newPost.id);
        }
      }
      return newPost;
   `;
   code = code.replace('return newPost;', replacement);
   fs.writeFileSync(path, code);
}
