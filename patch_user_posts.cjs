const fs = require('fs');
const path = 'server/routes/userPosts.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /const userPosts = await db\.select\([\s\S]*?\.offset\(offset\);/;
const match = code.match(regex);
if (match) {
  const replacement = `
    const p1 = db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      quotedPostId: posts.quotedPostId,
      userId: posts.userId,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      __repostCreatedAt: sql<Date>\`NULL\`,
      __repostUserId: sql<number>\`NULL\`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(posts.userId, targetUserId), isNull(posts.communityId), moderationCondition, cursorCondition ? cursorCondition : undefined))
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit);

    let repostCursorCondition: any = undefined;
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        repostCursorCondition = or(lt(reposts.createdAt, decoded.createdAt), and(eq(reposts.createdAt, decoded.createdAt), lt(reposts.id, decoded.id)));
      }
    }

    const p2 = db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      quotedPostId: posts.quotedPostId,
      userId: posts.userId,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      __repostCreatedAt: reposts.createdAt,
      __repostUserId: reposts.userId,
    })
    .from(reposts)
    .innerJoin(posts, eq(reposts.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(reposts.userId, targetUserId), isNull(posts.communityId), moderationCondition, repostCursorCondition ? repostCursorCondition : undefined))
    .orderBy(desc(reposts.createdAt), desc(reposts.id))
    .limit(limit);

    const [authoredPosts, repostedPosts] = await Promise.all([p1, p2]);

    let userPosts = [...authoredPosts, ...repostedPosts].sort((a, b) => {
      const timeA = (a.__repostCreatedAt || a.createdAt).getTime();
      const timeB = (b.__repostCreatedAt || b.createdAt).getTime();
      return timeB - timeA;
    }).slice(0, limit);
  `;
  code = code.replace(match[0], replacement);
  fs.writeFileSync(path, code);
}
