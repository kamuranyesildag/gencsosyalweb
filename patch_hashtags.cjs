const fs = require('fs');
const path = 'server/routes/hashtags.ts';
let code = fs.readFileSync(path, 'utf8');

const vis_old = `    let visibilityCondition;
    if (currentUserId !== -1) {
      // Get following IDs for FOLLOWERS visibility
      const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, currentUserId));
      const followingIds = followingRecords.map((f: any) => f.followingId);
      const followingIdsWithSelf = followingIds.length > 0 ? followingIds : [-1];

      visibilityCondition = or(
        eq(posts.visibility, 'PUBLIC'),
        eq(posts.userId, currentUserId),
        and(eq(posts.visibility, 'FOLLOWERS'), inArray(posts.userId, followingIdsWithSelf))
      );
    } else {
      visibilityCondition = eq(posts.visibility, 'PUBLIC');
    }`;

const vis_new = `    let visibilityCondition;
    if (currentUserId !== -1) {
      // Get following IDs for FOLLOWERS visibility
      const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.status, 'accepted')));
      const followingIds = followingRecords.map((f: any) => f.followingId);
      const followingIdsWithSelf = followingIds.length > 0 ? followingIds : [-1];

      visibilityCondition = or(
        eq(posts.userId, currentUserId),
        and(
          or(eq(posts.visibility, 'PUBLIC'), eq(posts.visibility, 'FOLLOWERS')),
          or(
            and(
              or(eq(profiles.isPrivate, false), sql\`\${profiles.isPrivate} IS NULL\`),
              eq(posts.visibility, 'PUBLIC')
            ),
            inArray(posts.userId, followingIdsWithSelf)
          )
        )
      );
    } else {
      visibilityCondition = and(
        eq(posts.visibility, 'PUBLIC'),
        or(eq(profiles.isPrivate, false), sql\`\${profiles.isPrivate} IS NULL\`)
      );
    }`;

code = code.replace(vis_old, vis_new);
fs.writeFileSync(path, code);
