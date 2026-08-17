import re

with open("server/routes/communities.ts", "r") as f:
    content = f.read()

target = ".where(eq(posts.communityId, communityId))"
replacement = ".where(and(eq(posts.communityId, communityId), eq(posts.moderationStatus, 'APPROVED')))"
content = content.replace(target, replacement)

with open("server/routes/communities.ts", "w") as f:
    f.write(content)
