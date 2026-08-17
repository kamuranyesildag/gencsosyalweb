import sys

with open("server/routes/posts.ts", "r") as f:
    content = f.read()

old_notify_loop = """            for (const f of followers) {
               if (f.preference !== 'none') {
                  await notify(currentUserId, f.followerId, 'post', result.id).catch(() => {});
               }
            }"""

new_notify_loop = """            // Batch insert notifications
            const { notifications } = await import("../../src/db/schema.js");
            const notifsToInsert = followers
                .filter((f: any) => f.preference !== 'none')
                .map((f: any) => ({
                    userId: f.followerId,
                    actorId: currentUserId,
                    type: 'post',
                    postId: result.id,
                    isRead: false
                }));
            if (notifsToInsert.length > 0) {
                // Insert in chunks of 1000 to avoid DB limits
                const chunkSize = 1000;
                for (let i = 0; i < notifsToInsert.length; i += chunkSize) {
                    await db.insert(notifications).values(notifsToInsert.slice(i, i + chunkSize)).onConflictDoNothing();
                }
            }"""

if old_notify_loop in content:
    content = content.replace(old_notify_loop, new_notify_loop)
    with open("server/routes/posts.ts", "w") as f:
        f.write(content)
        print("Patched posts.ts with batch insert successfully")
else:
    print("Could not find old_notify_loop block in posts.ts")

