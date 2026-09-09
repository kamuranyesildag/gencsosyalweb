const fs = require('fs');
const path = 'server/utils/postStats.ts';
let code = fs.readFileSync(path, 'utf8');

// We need to fetch quoted posts.
// The posts we want to fetch are those in `postIds` where quotedPostId is not null.
const injectCode = `
  const quotedPostIds = Array.from(new Set(postsList.map(p => p.quotedPostId).filter(Boolean)));
  let quotedPosts: any[] = [];
  if (quotedPostIds.length > 0) {
    const qPosts = await db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      userId: posts.userId,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: users.isVerified,
      }
    }).from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(inArray(posts.id, quotedPostIds));

    // Also populate media for quoted posts.
    const qMedia = await db.select().from(postMedia).where(inArray(postMedia.postId, quotedPostIds));
    quotedPosts = qPosts.map((qp: any) => ({
       ...qp,
       media: qMedia.filter(m => m.postId === qp.id)
    }));
  }
`;

// Insert it right after the promise.all block.
code = code.replace(
  '// Map everything back',
  injectCode + '\n  // Map everything back'
);

// Map the quotedPost to the post.
code = code.replace(
  'postCollaborators: allCollabs.filter(c => c.postId === p.id).map(c => c.user),',
  'postCollaborators: allCollabs.filter(c => c.postId === p.id).map(c => c.user),\n      quotedPost: p.quotedPostId ? quotedPosts.find(qp => qp.id === p.quotedPostId) : undefined,'
);

fs.writeFileSync(path, code);
