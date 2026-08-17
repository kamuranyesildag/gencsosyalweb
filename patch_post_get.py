import re

with open("server/routes/posts.ts", "r") as f:
    content = f.read()

target = ".where(eq(posts.id, postId))"
replacement = ".where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))))"
content = content.replace(target, replacement)

with open("server/routes/posts.ts", "w") as f:
    f.write(content)
