import sys

with open("server/routes/auth.ts", "r") as f:
    content = f.read()

old_register = """      await tx.insert(profiles).values({
        userId: newUser.id,
        displayName,
      });

      return newUser;"""

new_register = """      await tx.insert(profiles).values({
        userId: newUser.id,
        displayName,
      });
      
      // Auto follow logic
      try {
        const { systemSettings, follows } = await import("../../src/db/schema.js");
        const setting = await tx.select().from(systemSettings).where(eq(systemSettings.key, 'auto_follow_users')).limit(1);
        if (setting.length > 0 && setting[0].value) {
          let userIds: number[] = JSON.parse(setting[0].value);
          if (Array.isArray(userIds) && userIds.length > 0) {
            userIds = userIds.filter(id => id !== newUser.id);
            if (userIds.length > 0) {
               const followsToInsert = userIds.map(id => ({
                  followerId: newUser.id,
                  followingId: id,
                  notificationPreference: 'standard'
               }));
               await tx.insert(follows).values(followsToInsert).onConflictDoNothing();
            }
          }
        }
      } catch (e) {
        console.error("Auto-follow error on register:", e);
      }

      return newUser;"""

if old_register in content:
    content = content.replace(old_register, new_register)
    with open("server/routes/auth.ts", "w") as f:
        f.write(content)
        print("Patched auth.ts successfully")
else:
    print("Could not find old_register block in auth.ts")

