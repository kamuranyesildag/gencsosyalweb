import re

with open("server/routes/comments.ts", "r") as f:
    content = f.read()

target = ".where(and(eq(comments.postId, postId), cursorCondition ? cursorCondition : undefined))"
replacement = ".where(and(eq(comments.postId, postId), eq(comments.moderationStatus, 'APPROVED'), cursorCondition ? cursorCondition : undefined))"
content = content.replace(target, replacement)

with open("server/routes/comments.ts", "w") as f:
    f.write(content)
