import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import type { DbTransaction } from "../../src/db/index.js";
import { users, profiles, verificationRequests, adminAuditLogs, moderationLogs, posts, comments, projectComments, projects, reports, communities } from "../../src/db/schema.js";
import { eq, ilike, or, desc, sql, and } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext, requireRole } from "../middleware/auth.js";
import { sendVerificationStatusEmail } from "../utils/mailer.js";

export const adminRouter = Router();

// Helper for pagination
const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  return { page, limit, offset: (page - 1) * limit };
};

// Apply auth and admin role check to all admin routes
adminRouter.use(requireAuth, requireRole("ADMIN"));

// GET /api/v1/admin/stats - Basic admin dashboard stats
adminRouter.get("/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(users);
    const pendingVerifications = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'pending'));

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers[0]?.count || 0,
        pendingVerifications: pendingVerifications[0]?.count || 0,
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// GET /api/v1/admin/users
adminRouter.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    const { limit, offset } = getPagination(req);
    
    let query = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId));
    
    if (q && q.trim().length > 0) {
      const qTerm = `%${q.trim()}%`;
      query = query.where(
        or(
          ilike(users.username, qTerm),
          ilike(profiles.displayName, qTerm),
          ilike(users.email, qTerm)
        )
      ) as any;
    }
    
    const list = await query.limit(limit).offset(offset).orderBy(desc(users.createdAt));
    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// GET /api/v1/admin/verifications
adminRouter.get("/verifications", async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const { limit, offset } = getPagination(req);
    
    let query = db.select({
      id: verificationRequests.id,
      userId: verificationRequests.userId,
      status: verificationRequests.status,
      reason: verificationRequests.reason,
      adminNote: verificationRequests.adminNote,
      rejectionReason: verificationRequests.rejectionReason,
      createdAt: verificationRequests.createdAt,
      reviewedAt: verificationRequests.reviewedAt,
      username: users.username,
      email: users.email,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl
    })
    .from(verificationRequests)
    .innerJoin(users, eq(verificationRequests.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId));
    
    if (status && ['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
      query = query.where(eq(verificationRequests.status, status)) as any;
    }
    
    const list = await query.limit(limit).offset(offset).orderBy(desc(verificationRequests.createdAt));
    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin verifications error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// PATCH /api/v1/admin/verifications/:id
adminRouter.patch("/verifications/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id as string);
    if (isNaN(requestId)) { res.status(400).json({ success: false, error: { message: "Geçersiz ID." } }); return; }
    const { status, adminNote, rejectionReason } = req.body;
    const adminId = requireAuthContext(req);

    if (!['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz durum." } });
      return;
    }
    
    // Start a basic transaction-like update
    const vReq = await db.select().from(verificationRequests).where(eq(verificationRequests.id, requestId)).limit(1);
    
    if (vReq.length === 0) {
      res.status(404).json({ success: false, error: { message: "Başvuru bulunamadı." } });
      return;
    }

    const currentReq = vReq[0];

    // Update the request
    await db.update(verificationRequests).set({
      status,
      adminNote: adminNote || currentReq.adminNote,
      rejectionReason: status === 'rejected' ? (rejectionReason || null) : null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date()
    }).where(eq(verificationRequests.id, requestId));

    if (status === 'approved' || status === 'rejected') {
      const userRecord = await db.select().from(users).where(eq(users.id, currentReq.userId)).limit(1);
      if (userRecord.length > 0) {
         sendVerificationStatusEmail(userRecord[0].email, userRecord[0].username, status).catch(console.error);
      }
    }
    
    // If approved, update user's isVerified status
    if (status === 'approved' && currentReq.status !== 'approved') {
      await db.update(users).set({ isVerified: true }).where(eq(users.id, currentReq.userId));
    } else if (status !== 'approved' && currentReq.status === 'approved') {
      // Revert if changed from approved
      await db.update(users).set({ isVerified: false }).where(eq(users.id, currentReq.userId));
    }
    
    // Audit log
    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: `verification_${status}`,
      targetType: 'verification_request',
      targetId: requestId.toString(),
      metadata: { previousStatus: currentReq.status, newStatus: status }
    });
    
    res.json({ success: true, data: { message: `Başvuru durumu güncellendi: ${status}` } });
  } catch (error) {
    console.error("Admin verification update error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// PATCH /api/v1/admin/users/:id/verify
adminRouter.patch("/users/:id/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) { res.status(400).json({ success: false, error: { message: "Geçersiz ID." } }); return; }
    const { isVerified } = req.body;
    const adminId = requireAuthContext(req);
    
    if (typeof isVerified !== 'boolean') {
      res.status(400).json({ success: false, error: { message: "Geçersiz veri." } });
      return;
    }
    
    const userRecord = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    
    if (userRecord.length === 0) {
      res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
      return;
    }
    
    await db.update(users).set({ isVerified }).where(eq(users.id, targetUserId));
    
    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: `user_verify_toggle`,
      targetType: 'user',
      targetId: targetUserId.toString(),
      metadata: { previousStatus: userRecord[0].isVerified, newStatus: isVerified }
    });
    
    res.json({ success: true, data: { message: `Kullanıcı doğrulama durumu güncellendi: ${isVerified}` } });
  } catch (error) {
    console.error("Admin user verify update error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// POST /api/v1/admin/users/:id/reset-2fa
adminRouter.post("/users/:id/reset-2fa", async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) { res.status(400).json({ success: false, error: { message: "Geçersiz ID." } }); return; }
    const adminId = requireAuthContext(req);
    
    const userRecord = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    
    if (userRecord.length === 0) {
      res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
      return;
    }

    const { recoveryCodes } = await import("../../src/db/schema.js");

    await db.transaction(async (tx: DbTransaction) => {
      await tx.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where(eq(users.id, targetUserId));
      await tx.delete(recoveryCodes).where(eq(recoveryCodes.userId, targetUserId));
      
      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: 'admin_2fa_reset',
        targetType: 'user',
        targetId: targetUserId.toString(),
        metadata: { message: "2FA manually reset by admin." }
      });
    });

    res.json({ success: true, data: { message: "Kullanıcının 2FA ayarları başarıyla sıfırlandı." } });
  } catch (error) {
    console.error("Admin 2FA reset error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// GET /api/v1/admin/reports
adminRouter.get("/reports", async (req: Request, res: Response): Promise<void> => {
  try {
    const status = (req.query.status as string) || 'PENDING';
    const { limit, offset } = getPagination(req);
    
    // We need to import reports from schema, let's just use it directly
    const list = await db.select({
      id: reports.id,
      reporterId: reports.reporterId,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterUsername: users.username,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .where(eq(reports.status, status))
    .orderBy(desc(reports.createdAt))
    .limit(limit).offset(offset);

    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// PATCH /api/v1/admin/reports/:id
adminRouter.patch("/reports/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = parseInt(req.params.id as string);
    const { status, action } = req.body;
    const adminId = requireAuthContext(req);

    const r = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
    if (r.length === 0) {
      res.status(404).json({ success: false, error: { message: "Rapor bulunamadı." } });
      return;
    }
    const report = r[0];

    if (action === 'remove_content') {
      if (report.targetType === 'post') {
        await db.delete(posts).where(eq(posts.id, report.targetId));
      } else if (report.targetType === 'comment') {
        await db.delete(comments).where(eq(comments.id, report.targetId));
      } else if (report.targetType === 'community') {
        await db.delete(communities).where(eq(communities.id, report.targetId));
      }
      
      await db.update(reports).set({ status: 'RESOLVED', resolvedAt: new Date() }).where(eq(reports.id, reportId));
    } else if (action === 'suspend_user') {
      let uId = report.targetId;
      if (report.targetType !== 'user') {
        // Find owner of content
        if (report.targetType === 'post') {
           const p = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, report.targetId)).limit(1);
           if(p.length > 0) uId = p[0].userId;
        } else if (report.targetType === 'comment') {
           const c = await db.select({ userId: comments.userId }).from(comments).where(eq(comments.id, report.targetId)).limit(1);
           if(c.length > 0) uId = c[0].userId;
        }
      }
      
      await db.update(users).set({ isActive: false }).where(eq(users.id, uId));
      await db.update(reports).set({ status: 'RESOLVED', resolvedAt: new Date() }).where(eq(reports.id, reportId));
    } else if (status) {
      await db.update(reports).set({ status, resolvedAt: new Date() }).where(eq(reports.id, reportId));
    }

    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: `report_${action || status}`,
      targetType: 'report',
      targetId: reportId.toString(),
      metadata: { targetType: report.targetType, targetId: report.targetId }
    });

    res.json({ success: true, data: { message: "Rapor güncellendi." } });
  } catch (error) {
    console.error("Admin report update error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});


// --- SMTP SETTINGS ---

adminRouter.get("/smtp", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { systemSettings } = await import("../../src/db/schema.js");
    const settings = await db.select().from(systemSettings);
    
    const config: Record<string, string> = {
      smtp_host: process.env.SMTP_HOST || "",
      smtp_port: process.env.SMTP_PORT || "587",
      smtp_secure: process.env.SMTP_SECURE || "false",
      smtp_user: process.env.SMTP_USER || "",
      smtp_from: process.env.SMTP_FROM || "",
    };

    let passConfigured = !!process.env.SMTP_PASS;

    for (const s of settings) {
      if (s.key === "smtp_pass") {
        passConfigured = true;
      } else if (s.key.startsWith("smtp_")) {
        config[s.key] = s.value;
      }
    }

    res.json({
      success: true,
      data: {
        host: config.smtp_host,
        port: parseInt(config.smtp_port),
        secure: config.smtp_secure === "true",
        user: config.smtp_user,
        from: config.smtp_from,
        passConfigured,
      }
    });
  } catch (error) {
    console.error("Get SMTP error:", error);
    res.status(500).json({ success: false, error: { message: "SMTP ayarları alınamadı." } });
  }
});

adminRouter.put("/smtp", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { systemSettings, adminAuditLogs } = await import("../../src/db/schema.js");
    const { host, port, secure, user, pass, from } = req.body;
    
    const updates = [
      { key: "smtp_host", value: host || "" },
      { key: "smtp_port", value: port ? String(port) : "587" },
      { key: "smtp_secure", value: secure ? "true" : "false" },
      { key: "smtp_user", value: user || "" },
      { key: "smtp_from", value: from || "" },
    ];
    
    if (pass) {
      const { encryptString } = await import("../utils/encryption.js");
      updates.push({ key: "smtp_pass", value: encryptString(pass) });
    }

    await db.transaction(async (tx: DbTransaction) => {
      for (const update of updates) {
        await tx.insert(systemSettings)
          .values({ key: update.key, value: update.value, updatedBy: requireAuthContext(req) })
          .onConflictDoUpdate({
            target: systemSettings.key,
            set: { value: update.value, updatedBy: requireAuthContext(req), updatedAt: new Date() }
          });
      }

      await tx.insert(adminAuditLogs).values({
        adminUserId: requireAuthContext(req),
        action: "update_smtp_settings",
        targetId: '0',
        targetType: "system",
        metadata: { action: "Updated SMTP settings" }
      });
    });

    res.json({ success: true, message: "SMTP ayarları kaydedildi." });
  } catch (error) {
    console.error("Update SMTP error:", error);
    res.status(500).json({ success: false, error: { message: "SMTP ayarları kaydedilemedi." } });
  }
});

adminRouter.post("/smtp/test", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { message: "Test e-postası adresi gereklidir." } });
    }

    const { sendSmtpTestEmail } = await import("../utils/mailer.js");
    await sendSmtpTestEmail(email);

    res.json({ success: true, message: "Test e-postası başarıyla gönderildi." });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ success: false, error: { message: "SMTP bağlantısı başarısız. Sunucu, port veya kimlik doğrulama bilgilerini kontrol edin." } });
  }
});

// --- OFFICIAL ACCOUNTS ---

adminRouter.get("/official-accounts", async (req, res) => {
  try {
    const data = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        isOfficialAccount: users.isOfficialAccount,
        officialNotifyEnabled: users.officialNotifyEnabled,
        officialPriority: users.officialPriority,
      })
      .from(users)
      .where(eq(users.isOfficialAccount, true))
      .orderBy(desc(users.createdAt));
      
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Resmi hesaplar alınamadı." } });
  }
});

adminRouter.put("/official-accounts/:id", async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    const { isOfficialAccount, officialNotifyEnabled, officialPriority } = req.body;
    
    await db.update(users)
      .set({ 
        isOfficialAccount: !!isOfficialAccount,
        officialNotifyEnabled: !!officialNotifyEnabled,
        officialPriority: officialPriority || 'normal',
        updatedAt: new Date()
      })
      .where(eq(users.id, targetId));
      
    res.json({ success: true, message: "Resmi hesap ayarları güncellendi." });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Ayarlar güncellenemedi." } });
  }
});

// --- AUTO FOLLOW ---

adminRouter.get("/auto-follow", async (req, res) => {
  try {
    const { systemSettings } = await import("../../src/db/schema.js");
    const setting = await db.select().from(systemSettings).where(eq(systemSettings.key, 'auto_follow_users')).limit(1);
    
    let userIds: number[] = [];
    if (setting.length > 0 && setting[0].value) {
      try {
        userIds = JSON.parse(setting[0].value);
      } catch (e) {}
    }
    
    let autoFollowUsers: any[] = [];
    if (userIds.length > 0) {
        autoFollowUsers = await db.select({
            id: users.id,
            username: users.username,
            email: users.email
        }).from(users).where(sql`${users.id} = ANY(${userIds})`);
    }
    
    res.json({ success: true, data: autoFollowUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Otomatik takip ayarları alınamadı." } });
  }
});

adminRouter.put("/auto-follow", async (req, res) => {
  try {
    const { systemSettings } = await import("../../src/db/schema.js");
    const { userIds } = req.body; // array of numbers
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ success: false, error: { message: "Geçersiz veri formatı." } });
    }
    
    await db.insert(systemSettings)
      .values({ key: "auto_follow_users", value: JSON.stringify(userIds), updatedBy: requireAuthContext(req) })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: JSON.stringify(userIds), updatedBy: requireAuthContext(req), updatedAt: new Date() }
      });
      
    res.json({ success: true, message: "Otomatik takip listesi güncellendi." });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Otomatik takip listesi güncellenemedi." } });
  }
});

// --- AUDIT LOGS ---
adminRouter.get("/audit-logs", async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, offset } = getPagination(req);
    const action = req.query.action as string;

    let query = db
      .select({
        id: adminAuditLogs.id,
        adminUserId: adminAuditLogs.adminUserId,
        action: adminAuditLogs.action,
        targetType: adminAuditLogs.targetType,
        targetId: adminAuditLogs.targetId,
        metadata: adminAuditLogs.metadata,
        createdAt: adminAuditLogs.createdAt,
        adminUsername: users.username,
        adminDisplayName: profiles.displayName,
        adminAvatarUrl: profiles.avatarUrl,
      })
      .from(adminAuditLogs)
      .leftJoin(users, eq(adminAuditLogs.adminUserId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId));

    if (action && action.trim().length > 0) {
      query = query.where(ilike(adminAuditLogs.action, `%${action.trim()}%`)) as any;
    }

    const list = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(adminAuditLogs.createdAt));

    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin audit logs error:", error);
    res.status(500).json({ success: false, error: { message: "Denetim kayıtları alınamadı." } });
  }
});



adminRouter.get("/moderation/queue", async (req, res) => {
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
    .where(eq(moderationLogs.status, 'PENDING'))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(50);
    
    // Fetch content
    const result = await Promise.all(pendingLogs.map(async (log: any) => {
      let content = "";
      if (log.entityType === 'POST') {
        const p = await db.select({ content: posts.content }).from(posts).where(eq(posts.id, log.entityId)).limit(1);
        if (p.length > 0) content = p[0].content || "";
      } else if (log.entityType === 'COMMENT') {
        const c = await db.select({ content: comments.content }).from(comments).where(eq(comments.id, log.entityId)).limit(1);
        if (c.length > 0) content = c[0].content || "";
      } else if (log.entityType === 'PROFILE') {
        const p = await db.select({ bio: profiles.bio }).from(profiles).where(eq(profiles.userId, log.entityId)).limit(1);
        if (p.length > 0) content = p[0].bio || "";
      } else if (log.entityType === 'PROJECT_COMMENT') {
        const pc = await db.select({ content: projectComments.content }).from(projectComments).where(eq(projectComments.id, log.entityId)).limit(1);
        if (pc.length > 0) content = pc[0].content || "";
      } else if (log.entityType === 'PROJECT') {
        const pj = await db.select({ description: projects.description }).from(projects).where(eq(projects.id, log.entityId)).limit(1);
        if (pj.length > 0) content = pj[0].description || "";
      }
      return { ...log, content };
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Admin moderation queue fetch error:", error);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

adminRouter.post("/moderation/:id/action", async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const adminId = requireAuthContext(req);

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz aksiyon." }});
    }

    const logRecord = await db.select().from(moderationLogs).where(eq(moderationLogs.id, logId)).limit(1);
    if (logRecord.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Log bulunamadı." }});
    }

    const log = logRecord[0];

    await db.transaction(async (tx: DbTransaction) => {
      await tx.update(moderationLogs)
        .set({ status: 'RESOLVED', actionTaken: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', adminId, updatedAt: new Date() })
        .where(eq(moderationLogs.id, logId));

      const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      
      if (log.entityType === 'POST') {
        await tx.update(posts).set({ moderationStatus: newStatus }).where(eq(posts.id, log.entityId));
      } else if (log.entityType === 'COMMENT') {
        await tx.update(comments).set({ moderationStatus: newStatus }).where(eq(comments.id, log.entityId));
      } else if (log.entityType === 'PROJECT_COMMENT') {
        await tx.update(projectComments).set({ moderationStatus: newStatus }).where(eq(projectComments.id, log.entityId));
      } else if (log.entityType === 'PROFILE' || log.entityType === 'PROJECT') {
        // Just resolve the log, entity is already either saved or blocked.
      }

      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: 'MODERATION_DECISION',
        targetType: 'MODERATION_LOG',
        targetId: logId.toString(),
        metadata: { action, entityType: log.entityType, entityId: log.entityId }
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Admin moderation action error:", error);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

