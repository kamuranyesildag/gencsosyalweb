import re

with open("server/routes/userPosts.ts", "r") as f:
    content = f.read()

target = ".where(and(eq(posts.userId, targetUserId), isNull(posts.communityId), cursorCondition ? cursorCondition : undefined))"
replacement = ".where(and(eq(posts.userId, targetUserId), isNull(posts.communityId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)), cursorCondition ? cursorCondition : undefined))"
content = content.replace(target, replacement)

with open("server/routes/userPosts.ts", "w") as f:
    f.write(content)
