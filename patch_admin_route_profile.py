import re

with open("server/routes/admin.ts", "r") as f:
    content = f.read()

target = """      } else if (log.entityType === 'COMMENT') {
        const c = await db.select({ content: comments.content }).from(comments).where(eq(comments.id, log.entityId)).limit(1);
        if (c.length > 0) content = c[0].content || "";
      }
      return { ...log, content };"""

replacement = """      } else if (log.entityType === 'COMMENT') {
        const c = await db.select({ content: comments.content }).from(comments).where(eq(comments.id, log.entityId)).limit(1);
        if (c.length > 0) content = c[0].content || "";
      } else if (log.entityType === 'PROFILE') {
        const p = await db.select({ bio: profiles.bio }).from(profiles).where(eq(profiles.userId, log.entityId)).limit(1);
        if (p.length > 0) content = p[0].bio || "";
      }
      return { ...log, content };"""

content = content.replace(target, replacement)

target2 = """      if (log.entityType === 'POST') {
        await tx.update(posts).set({ moderationStatus: newStatus }).where(eq(posts.id, log.entityId));
      } else if (log.entityType === 'COMMENT') {
        await tx.update(comments).set({ moderationStatus: newStatus }).where(eq(comments.id, log.entityId));
      }"""

replacement2 = """      if (log.entityType === 'POST') {
        await tx.update(posts).set({ moderationStatus: newStatus }).where(eq(posts.id, log.entityId));
      } else if (log.entityType === 'COMMENT') {
        await tx.update(comments).set({ moderationStatus: newStatus }).where(eq(comments.id, log.entityId));
      } else if (log.entityType === 'PROFILE') {
        // Just resolve the log, bio is already either saved or blocked.
      }"""

content = content.replace(target2, replacement2)

with open("server/routes/admin.ts", "w") as f:
    f.write(content)
