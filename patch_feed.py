import re

with open("server/routes/feed.ts", "r") as f:
    content = f.read()

# For ALGORITHMIC Feed
target_alg = "isNull(posts.communityId), // Community gönderilerini ana akıştan gizle"
replacement_alg = "isNull(posts.communityId), // Community gönderilerini ana akıştan gizle\n        eq(posts.moderationStatus, 'APPROVED'),"
content = content.replace(target_alg, replacement_alg)

# For FOLLOWING Feed
target_foll = "isNull(posts.communityId),"
replacement_foll = "isNull(posts.communityId),\n        eq(posts.moderationStatus, 'APPROVED'),"
content = content.replace(target_foll, replacement_foll)

with open("server/routes/feed.ts", "w") as f:
    f.write(content)
