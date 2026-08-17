import sys

with open("server/routes/posts.ts", "r") as f:
    content = f.read()

content = content.replace("userId: f.followerId,", "recipientId: f.followerId,")

with open("server/routes/posts.ts", "w") as f:
    f.write(content)

