import re

with open("server/routes/admin.ts", "r") as f:
    content = f.read()

import_target = "import { adminAuditLogs, users, profiles, systemSettings, reports, posts, comments } from \"../../src/db/schema.js\";"
import_replacement = "import { adminAuditLogs, users, profiles, systemSettings, reports, posts, comments, moderationLogs } from \"../../src/db/schema.js\";"
if "moderationLogs" not in content:
    content = content.replace(import_target, import_replacement)

admin_endpoints = """

adminRouter.get("/moderation/queue", requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingLogs = await db.select({
      id: moderationLogs.id,
      entityType: moderationLogs.entityType,
      entityId: moderationLogs.entityId,
      status: moderationLogs.status,
      riskLevel: moderationLogs.riskLevel,
      category: moderationLogs.category,
      createdAt: moderationLogs.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName
      }
    })
    .from(moderationLogs)
    .innerJoin(users, eq(moderationLogs.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(50);
    
    // Fetch content
    const result = await Promise.all(pendingLogs.map(async (log) => {
      let content = "";
      if (log.entityType === 'POST') {
        const p = await db.select({ content: posts.content }).from(posts).where(eq(posts.id, log.entityId)).limit(1);
        if (p.length > 0) content = p[0].content || "";
      } else if (log.entityType === 'COMMENT') {
        const c = await db.select({ content: comments.content }).from(comments).where(eq(comments.id, log.entityId)).limit(1);
        if (c.length > 0) content = c[0].content || "";
      }
      return { ...log, content };
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Admin moderation queue fetch error:", error);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

adminRouter.post("/moderation/:id/action", requireAuth, requireAdmin, async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const adminId = req.user!.userId;

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz aksiyon." }});
    }

    const logRecord = await db.select().from(moderationLogs).where(eq(moderationLogs.id, logId)).limit(1);
    if (logRecord.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Log bulunamadı." }});
    }

    const log = logRecord[0];

    await db.transaction(async (tx) => {
      await tx.update(moderationLogs)
        .set({ status: 'RESOLVED', actionTaken: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', adminId, updatedAt: new Date() })
        .where(eq(moderationLogs.id, logId));

      const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      
      if (log.entityType === 'POST') {
        await tx.update(posts).set({ moderationStatus: newStatus }).where(eq(posts.id, log.entityId));
      } else if (log.entityType === 'COMMENT') {
        await tx.update(comments).set({ moderationStatus: newStatus }).where(eq(comments.id, log.entityId));
      }

      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        actionType: 'MODERATION_DECISION',
        entityType: 'MODERATION_LOG',
        entityId: logId,
        details: JSON.stringify({ action, entityType: log.entityType, entityId: log.entityId })
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Admin moderation action error:", error);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

"""

if "adminRouter.get(\"/moderation/queue\"" not in content:
    content = content + admin_endpoints

with open("server/routes/admin.ts", "w") as f:
    f.write(content)
