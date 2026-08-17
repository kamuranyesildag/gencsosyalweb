const fs = require('fs');
let content = fs.readFileSync('server/routes/posts.ts', 'utf8');

if (!content.includes('import { pollOptions, pollVotes }')) {
    content = content.replace(
        'import { posts, postMedia, likes, comments, bookmarks, users, profiles, reposts, postCollaborators, communityMembers, communities } from "../../src/db/schema.js";',
        'import { posts, postMedia, likes, comments, bookmarks, users, profiles, reposts, postCollaborators, communityMembers, communities, pollOptions, pollVotes } from "../../src/db/schema.js";'
    );
}

const targetInsert = `      const [newPost] = await tx.insert(posts).values({
        userId: currentUserId,
        content: content || null,
        visibility: finalVisibility as any,

      }).returning();`;

const replacementInsert = `      const [newPost] = await tx.insert(posts).values({
        userId: currentUserId,
        content: content || null,
        visibility: finalVisibility as any,
        postType: parsed.data.postType,
        contentWarning: parsed.data.contentWarning || null,
      }).returning();
      
      if (parsed.data.postType === 'POLL' && parsed.data.pollOptions) {
         const optionsToInsert = parsed.data.pollOptions.map((text, i) => ({
             postId: newPost.id,
             text,
             order: i
         }));
         await tx.insert(pollOptions).values(optionsToInsert);
      }
`;

content = content.replace(targetInsert, replacementInsert);
fs.writeFileSync('server/routes/posts.ts', content);
