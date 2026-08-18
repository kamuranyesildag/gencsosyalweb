import re

with open("server/routes/onboarding.ts", "r") as f:
    content = f.read()

if "eq(follows.followerId, currentUserId)" in content:
    print("Follows query uses followerId = currentUserId")

if "eq(posts.userId, currentUserId)" in content:
    print("Posts query uses userId = currentUserId")

if "eq(projects.userId, currentUserId)" in content:
    print("Projects query uses userId = currentUserId")

if "notInArray(users.id, excludedUserIds)" in content:
    print("Suggestions exclude properly")

