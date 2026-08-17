import sys

with open("server/routes/posts.ts", "r") as f:
    content = f.read()

old_res = "    res.status(201).json({ success: true, data: result });"

new_res = """
    // Official Account Notifications
    (async () => {
      try {
        const { users, follows } = await import("../../src/db/schema.js");
        const { notify } = await import("../utils/notifications.js");
        
        const author = await db.select({ 
            isOfficialAccount: users.isOfficialAccount, 
            officialNotifyEnabled: users.officialNotifyEnabled 
        }).from(users).where(eq(users.id, currentUserId)).limit(1);
        
        if (author.length > 0 && author[0].isOfficialAccount && author[0].officialNotifyEnabled) {
            const followers = await db.select({ followerId: follows.followerId, preference: follows.notificationPreference })
              .from(follows)
              .where(eq(follows.followingId, currentUserId));
              
            for (const f of followers) {
               if (f.preference !== 'none') {
                  await notify(currentUserId, f.followerId, 'post', result.id).catch(() => {});
               }
            }
        }
      } catch (err) {
        console.error("Failed to generate official notifications:", err);
      }
    })();

    res.status(201).json({ success: true, data: result });
"""

if old_res in content:
    content = content.replace(old_res, new_res)
    with open("server/routes/posts.ts", "w") as f:
        f.write(content)
        print("Patched posts.ts successfully")
else:
    print("Could not find old_res block in posts.ts")

