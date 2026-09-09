const fs = require('fs');
const path = 'server/routes/search.ts';
let code = fs.readFileSync(path, 'utf8');

const vis_old = `      const visibilityCondition = or(
        eq(posts.visibility, "PUBLIC"),
        eq(posts.userId, currentUserId),
        and(
          eq(posts.visibility, "FOLLOWERS"),
          currentUserId !== -1 
            ? inArray(posts.userId, db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, currentUserId)))
            : sql\`FALSE\`
        )
      );`;

const vis_new = `      const visibilityCondition = or(
        eq(posts.userId, currentUserId),
        and(
          or(eq(posts.visibility, "PUBLIC"), eq(posts.visibility, "FOLLOWERS")),
          or(
            and(
              or(eq(profiles.isPrivate, false), sql\`\${profiles.isPrivate} IS NULL\`),
              eq(posts.visibility, "PUBLIC")
            ),
            currentUserId !== -1 
              ? inArray(posts.userId, db.select({ followingId: follows.followingId }).from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.status, 'accepted'))))
              : sql\`FALSE\`
          )
        )
      );`;

code = code.replace(vis_old, vis_new);
fs.writeFileSync(path, code);
