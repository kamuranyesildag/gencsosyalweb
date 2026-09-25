import { encryptString } from "../utils/encryption.js";
import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import type { DbTransaction } from "../../src/db/index.js";
import { users, profiles, verificationRequests, adminAuditLogs, moderationLogs, posts, comments, projectComments, projects, reports, communities, systemSettings, recoveryCodes, refreshTokens, notifications, announcements, announcementViews, appeals } from "../../src/db/schema.js";
import { eq, ilike, or, desc, sql, and, inArray } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext, requireRole } from "../middleware/auth.js";
import { sendVerificationStatusEmail, sendSmtpTestEmail } from "../utils/mailer.js";
import argon2 from "argon2";

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
    const bannedUsers = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(users).where(eq(users.isActive, false));
    const pendingVerifications = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'pending'));
    const pendingReports = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(reports)
      .where(eq(reports.status, 'PENDING'));

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers[0]?.count || 0,
        bannedUsers: bannedUsers[0]?.count || 0,
        pendingVerifications: pendingVerifications[0]?.count || 0,
        openReports: pendingReports[0]?.count || 0,
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
    const statusFilter = req.query.status as string; // 'ALL', 'ACTIVE', 'BANNED'
    const { limit, offset } = getPagination(req);
    
    let query = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      isVerified: users.isVerified,
      isOfficialAccount: users.isOfficialAccount,
      emailVerified: users.emailVerified,
      twoFactorEnabled: users.twoFactorEnabled,
      createdAt: users.createdAt,
      bannedAt: users.bannedAt,
      banReason: users.banReason,
      banExpiresAt: users.banExpiresAt,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId));
    
    const conditions = [];

    if (q && q.trim().length > 0) {
      const qTerm = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(users.username, qTerm),
          ilike(profiles.displayName, qTerm),
          ilike(users.email, qTerm)
        )
      );
    }

    if (statusFilter === 'ACTIVE') {
      conditions.push(eq(users.isActive, true));
    } else if (statusFilter === 'BANNED') {
      conditions.push(eq(users.isActive, false));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
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

// PATCH /api/v1/admin/users/:id/ban - Ban or unban user
adminRouter.patch("/users/:id/ban", async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz kullanıcı ID." } });
      return;
    }
    const adminId = requireAuthContext(req);
    const { isActive, reason, isPermanent, banExpiresAt } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ success: false, error: { message: "Geçersiz veri. 'isActive' boolean olmalıdır." } });
      return;
    }

    if (targetUserId === adminId) {
      res.status(400).json({ success: false, error: { message: "Kendi hesabınızı yasaklayamazsınız." } });
      return;
    }

    const userRecord = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (userRecord.length === 0) {
      res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
      return;
    }

    const targetUser = userRecord[0];

    // Prevent banning other admins
    if (targetUser.role === 'ADMIN' && !isActive) {
      res.status(403).json({ success: false, error: { message: "Yönetici (ADMIN) rolüne sahip hesaplar doğrudan yasaklanamaz. Önce rolünü değiştiriniz." } });
      return;
    }

    const expiresAt = !isActive && !isPermanent && banExpiresAt ? new Date(banExpiresAt) : null;
    const finalReason = reason?.trim() || (isActive ? 'Yönetici tarafından yasak kaldırıldı' : 'Topluluk kurallarının ihlali');

    await db.transaction(async (tx: DbTransaction) => {
      await tx.update(users).set({
        isActive,
        bannedAt: isActive ? null : new Date(),
        banReason: isActive ? null : finalReason,
        banExpiresAt: isActive ? null : expiresAt,
        updatedAt: new Date()
      }).where(eq(users.id, targetUserId));

      // If banned, revoke all active sessions/refresh tokens immediately
      if (!isActive) {
        await tx.delete(refreshTokens).where(eq(refreshTokens.userId, targetUserId));
      }

      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: isActive ? 'user_unbanned' : 'user_banned',
        targetType: 'user',
        targetId: targetUserId.toString(),
        metadata: {
          username: targetUser.username,
          email: targetUser.email,
          reason: finalReason,
          isPermanent: !expiresAt,
          banExpiresAt: expiresAt ? expiresAt.toISOString() : null
        }
      });
    });

    res.json({
      success: true,
      data: {
        isActive,
        isPermanent: !expiresAt,
        banReason: finalReason,
        banExpiresAt: expiresAt,
        message: isActive
          ? `@${targetUser.username} kullanıcısının yasağı kaldırıldı ve hesabı aktifleştirildi.`
          : `@${targetUser.username} kullanıcısı ${expiresAt ? 'geçici olarak' : 'kalıcı olarak'} yasaklandı ve tüm oturumları sonlandırıldı.`
      }
    });
  } catch (error) {
    console.error("Admin user ban error:", error);
    res.status(500).json({ success: false, error: { message: "Kullanıcı durumu güncellenemedi." } });
  }
});

// PATCH /api/v1/admin/users/:id/role - Update user role (USER, MODERATOR, ADMIN)
adminRouter.patch("/users/:id/role", async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz kullanıcı ID." } });
      return;
    }
    const adminId = requireAuthContext(req);
    const { role } = req.body;

    const validRoles = ['USER', 'MODERATOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, error: { message: `Geçersiz rol. Kabul edilen roller: ${validRoles.join(', ')}` } });
      return;
    }

    if (targetUserId === adminId && role !== 'ADMIN') {
      res.status(400).json({ success: false, error: { message: "Kendi yönetici rolünüzü düşüremezsiniz." } });
      return;
    }

    const userRecord = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (userRecord.length === 0) {
      res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
      return;
    }

    const targetUser = userRecord[0];
    const oldRole = targetUser.role;

    await db.transaction(async (tx: DbTransaction) => {
      await tx.update(users).set({
        role,
        updatedAt: new Date()
      }).where(eq(users.id, targetUserId));

      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: 'user_role_change',
        targetType: 'user',
        targetId: targetUserId.toString(),
        metadata: {
          username: targetUser.username,
          oldRole,
          newRole: role
        }
      });
    });

    res.json({
      success: true,
      data: {
        role,
        message: `@${targetUser.username} kullanıcısının rolü '${role}' olarak güncellendi.`
      }
    });
  } catch (error) {
    console.error("Admin user role update error:", error);
    res.status(500).json({ success: false, error: { message: "Rol güncellenemedi." } });
  }
});

// POST /api/v1/admin/users/:id/reset-password - Set new password for user
adminRouter.post("/users/:id/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz kullanıcı ID." } });
      return;
    }
    const adminId = requireAuthContext(req);
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ success: false, error: { message: "Yeni parola en az 8 karakter uzunluğunda olmalıdır." } });
      return;
    }

    const userRecord = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (userRecord.length === 0) {
      res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
      return;
    }

    const targetUser = userRecord[0];
    const passwordHash = await argon2.hash(newPassword);

    await db.transaction(async (tx: DbTransaction) => {
      await tx.update(users).set({
        passwordHash,
        updatedAt: new Date()
      }).where(eq(users.id, targetUserId));

      // Revoke all refresh tokens so re-login is required with new password
      await tx.delete(refreshTokens).where(eq(refreshTokens.userId, targetUserId));

      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: 'admin_password_reset',
        targetType: 'user',
        targetId: targetUserId.toString(),
        metadata: {
          username: targetUser.username,
          email: targetUser.email,
          reason: 'Yönetici tarafından parola sıfırlandı'
        }
      });
    });

    res.json({
      success: true,
      data: {
        message: `@${targetUser.username} için yeni parola başarıyla tanımlandı ve tüm mevcut oturumları kapatıldı.`
      }
    });
  } catch (error) {
    console.error("Admin user password reset error:", error);
    res.status(500).json({ success: false, error: { message: "Parola sıfırlanamadı." } });
  }
});

// POST /api/v1/admin/users/:id/purge-content - Delete all posts and comments by user
adminRouter.post("/users/:id/purge-content", async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz kullanıcı ID." } });
      return;
    }
    const adminId = requireAuthContext(req);

    const userRecord = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (userRecord.length === 0) {
      res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
      return;
    }

    const targetUser = userRecord[0];

    await db.transaction(async (tx: DbTransaction) => {
      await tx.delete(posts).where(eq(posts.userId, targetUserId));
      await tx.delete(comments).where(eq(comments.userId, targetUserId));

      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: 'user_content_purged',
        targetType: 'user',
        targetId: targetUserId.toString(),
        metadata: {
          username: targetUser.username,
          action: 'Tüm gönderi ve yorumlar yönetici tarafından temizlendi'
        }
      });
    });

    res.json({
      success: true,
      data: {
        message: `@${targetUser.username} kullanıcısının tüm gönderi ve yorumları silindi.`
      }
    });
  } catch (error) {
    console.error("Admin user purge-content error:", error);
    res.status(500).json({ success: false, error: { message: "İçerikler temizlenemedi." } });
  }
});

// DELETE /api/v1/admin/users/:id - Delete user permanently
adminRouter.delete("/users/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz kullanıcı ID." } });
      return;
    }
    const adminId = requireAuthContext(req);

    if (targetUserId === adminId) {
      res.status(400).json({ success: false, error: { message: "Kendi yönetici hesabınızı silemezsiniz." } });
      return;
    }

    const userRecord = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (userRecord.length === 0) {
      res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
      return;
    }

    const targetUser = userRecord[0];

    await db.transaction(async (tx: DbTransaction) => {
      await tx.delete(users).where(eq(users.id, targetUserId));

      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: 'user_deleted_permanently',
        targetType: 'user',
        targetId: targetUserId.toString(),
        metadata: {
          deletedUsername: targetUser.username,
          deletedEmail: targetUser.email,
          deletedRole: targetUser.role
        }
      });
    });

    res.json({
      success: true,
      data: {
        message: `@${targetUser.username} hesabı ve ilişkili tüm verileri kalıcı olarak silindi.`
      }
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    res.status(500).json({ success: false, error: { message: "Kullanıcı hesabı silinemedi." } });
  }
});

// POST /api/v1/admin/broadcast - Send platform notification broadcast
adminRouter.post("/broadcast", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const { title, message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, error: { message: "Duyuru mesajı boş olamaz." } });
      return;
    }

    const allActiveUsers = await db.select({ id: users.id }).from(users).where(eq(users.isActive, true));

    if (allActiveUsers.length > 0) {
      const notificationRows = allActiveUsers.map((u: { id: number }) => ({
        recipientId: u.id,
        actorId: adminId,
        type: 'system_announcement',
        isRead: false,
        createdAt: new Date()
      }));

      // Insert notifications
      await db.insert(notifications).values(notificationRows);
    }

    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: 'system_broadcast_sent',
      targetType: 'system',
      targetId: 'all',
      metadata: { title: title || 'Genç Sosyal Duyurusu', messageSnippet: message.substring(0, 100), userCount: allActiveUsers.length }
    });

    res.json({
      success: true,
      data: {
        recipientCount: allActiveUsers.length,
        message: `${allActiveUsers.length} kullanıcıya sistem duyurusu başarıyla iletildi.`
      }
    });
  } catch (error) {
    console.error("Admin broadcast error:", error);
    res.status(500).json({ success: false, error: { message: "Duyuru gönderilemedi." } });
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

// --- ACCOUNT APPEALS (HESAP İTİRAZLARI) MANAGEMENT ---

// GET /api/v1/admin/appeals - List all appeals with optional status filter
adminRouter.get("/appeals", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    let query = db.select({
      id: appeals.id,
      userId: appeals.userId,
      banReason: appeals.banReason,
      reason: appeals.reason,
      status: appeals.status,
      adminResponse: appeals.adminResponse,
      reviewedBy: appeals.reviewedBy,
      reviewedAt: appeals.reviewedAt,
      createdAt: appeals.createdAt,
      updatedAt: appeals.updatedAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        isActive: users.isActive,
        bannedAt: users.bannedAt,
        banReason: users.banReason,
        banExpiresAt: users.banExpiresAt,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      }
    })
    .from(appeals)
    .innerJoin(users, eq(appeals.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(appeals.createdAt));

    const appealsList = typeof status === "string" && status !== "ALL"
      ? await query.where(eq(appeals.status, status))
      : await query;

    res.json({
      success: true,
      data: appealsList
    });
  } catch (error) {
    console.error("Admin appeals list error:", error);
    res.status(500).json({ success: false, error: { message: "İtirazlar alınırken bir sunucu hatası oluştu." } });
  }
});

// PATCH /api/v1/admin/appeals/:id - Review and resolve an appeal (APPROVE or REJECT)
adminRouter.patch("/appeals/:id", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
  try {
    const appealId = parseInt(req.params.id as string);
    if (isNaN(appealId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz itiraz ID." } });
      return;
    }

    const adminId = requireAuthContext(req);
    const { action, adminResponse } = req.body;

    if (action !== "APPROVE" && action !== "REJECT") {
      res.status(400).json({ success: false, error: { message: "Geçersiz işlem. 'action' parametresi 'APPROVE' veya 'REJECT' olmalıdır." } });
      return;
    }

    const existingAppeal = await db.select().from(appeals).where(eq(appeals.id, appealId)).limit(1);
    if (existingAppeal.length === 0) {
      res.status(404).json({ success: false, error: { message: "İtiraz kaydı bulunamadı." } });
      return;
    }

    const appeal = existingAppeal[0];
    const targetUserId = appeal.userId;
    const sanitizedResponse = typeof adminResponse === "string" ? adminResponse.trim() : null;

    if (action === "APPROVE") {
      await db.transaction(async (tx: DbTransaction) => {
        // 1. Update appeal status
        await tx.update(appeals).set({
          status: "APPROVED",
          adminResponse: sanitizedResponse || "İtirazınız onaylandı ve hesabınız yeniden aktifleştirildi.",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          updatedAt: new Date()
        }).where(eq(appeals.id, appealId));

        // 2. Reactivate target user
        await tx.update(users).set({
          isActive: true,
          banReason: null,
          bannedAt: null,
          banExpiresAt: null,
          updatedAt: new Date()
        }).where(eq(users.id, targetUserId));

        // 3. Log admin audit action
        await tx.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "appeal_approved",
          targetType: "appeal",
          targetId: appealId.toString(),
          metadata: {
            userId: targetUserId,
            appealId,
            adminResponse: sanitizedResponse
          }
        });

        // 4. Create in-app notification for the user
        await tx.insert(notifications).values({
          recipientId: targetUserId,
          actorId: adminId,
          type: "system",
          isRead: false,
          createdAt: new Date()
        });
      });

      res.json({
        success: true,
        data: {
          message: "İtiraz kabul edildi, kısıtlama kaldırıldı ve hesap aktifleştirildi."
        }
      });
      return;
    }

    if (action === "REJECT") {
      await db.transaction(async (tx: DbTransaction) => {
        // 1. Update appeal status
        await tx.update(appeals).set({
          status: "REJECTED",
          adminResponse: sanitizedResponse || "İtirazınız değerlendirildi ancak kural ihlali nedeniyle reddedildi.",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          updatedAt: new Date()
        }).where(eq(appeals.id, appealId));

        // 2. Log admin audit action
        await tx.insert(adminAuditLogs).values({
          adminUserId: adminId,
          action: "appeal_rejected",
          targetType: "appeal",
          targetId: appealId.toString(),
          metadata: {
            userId: targetUserId,
            appealId,
            adminResponse: sanitizedResponse
          }
        });

        // 3. Create notification
        await tx.insert(notifications).values({
          recipientId: targetUserId,
          actorId: adminId,
          type: "system",
          isRead: false,
          createdAt: new Date()
        });
      });

      res.json({
        success: true,
        data: {
          message: "İtiraz reddedildi."
        }
      });
      return;
    }
  } catch (error) {
    console.error("Admin appeal action error:", error);
    res.status(500).json({ success: false, error: { message: "İtiraz işlemi gerçekleştirilirken hata oluştu." } });
  }
});



// --- SMTP SETTINGS ---

adminRouter.get("/smtp", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
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
        const { host, port, secure, user, pass, from } = req.body;
    
    const updates = [
      { key: "smtp_host", value: host || "" },
      { key: "smtp_port", value: port ? String(port) : "587" },
      { key: "smtp_secure", value: secure ? "true" : "false" },
      { key: "smtp_user", value: user || "" },
      { key: "smtp_from", value: from || "" },
    ];
    
    if (pass) {
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
        isVerified: users.isVerified,
        isOfficialAccount: users.isOfficialAccount,
        officialNotifyEnabled: users.officialNotifyEnabled,
        officialPriority: users.officialPriority,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.isOfficialAccount, true))
      .orderBy(desc(users.createdAt));
      
    res.json({ success: true, data });
  } catch (error) {
    console.error("GET /official-accounts error:", error);
    res.status(500).json({ success: false, error: { message: "Resmi hesaplar alınamadı." } });
  }
});

adminRouter.put("/official-accounts/:id", async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    if (isNaN(targetId)) {
      return res.status(400).json({ success: false, error: { message: "Geçersiz kullanıcı ID'si." } });
    }
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
    console.error("PUT /official-accounts/:id error:", error);
    res.status(500).json({ success: false, error: { message: "Ayarlar güncellenemedi." } });
  }
});

// --- AUTO FOLLOW ---

adminRouter.get("/auto-follow", async (req, res) => {
  try {
    const setting = await db.select().from(systemSettings).where(eq(systemSettings.key, 'auto_follow_users')).limit(1);
    
    let userIds: number[] = [];
    if (setting.length > 0 && setting[0].value) {
      try {
        const parsed = JSON.parse(setting[0].value);
        if (Array.isArray(parsed)) {
          userIds = parsed
            .map((u: any) => {
              if (typeof u === 'number') return u;
              if (typeof u === 'string') {
                const parsedInt = parseInt(u, 10);
                return isNaN(parsedInt) ? null : parsedInt;
              }
              if (u && typeof u === 'object' && 'id' in u) {
                const parsedInt = typeof u.id === 'number' ? u.id : parseInt(u.id, 10);
                return isNaN(parsedInt) ? null : parsedInt;
              }
              return null;
            })
            .filter((id): id is number => typeof id === 'number' && !isNaN(id) && id > 0);
        }
      } catch (e) {
        console.error("Failed to parse auto_follow_users setting:", e);
      }
    }
    
    let autoFollowUsers: any[] = [];
    if (userIds.length > 0) {
      autoFollowUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isVerified: users.isVerified,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(inArray(users.id, userIds));
    }
    
    res.json({ success: true, data: autoFollowUsers });
  } catch (error) {
    console.error("GET /auto-follow error:", error);
    res.status(500).json({ success: false, error: { message: "Otomatik takip ayarları alınamadı." } });
  }
});

adminRouter.put("/auto-follow", async (req, res) => {
  try {
    const { userIds } = req.body; // array of numbers
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ success: false, error: { message: "Geçersiz veri formatı. userIds dizi olmalıdır." } });
    }

    const cleanUserIds = userIds
      .map((u: any) => {
        if (typeof u === 'number') return u;
        if (typeof u === 'string') {
          const parsed = parseInt(u, 10);
          return isNaN(parsed) ? null : parsed;
        }
        if (u && typeof u === 'object' && 'id' in u) {
          const parsed = typeof u.id === 'number' ? u.id : parseInt(u.id, 10);
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      })
      .filter((id): id is number => typeof id === 'number' && !isNaN(id) && id > 0);

    // Safely check if admin user exists in DB to prevent foreign key violation on updatedBy
    let adminUserId: number | null = null;
    try {
      const callerId = optionalAuthContext(req) || requireAuthContext(req);
      if (callerId) {
        const check = await db.select({ id: users.id }).from(users).where(eq(users.id, callerId)).limit(1);
        if (check.length > 0) {
          adminUserId = callerId;
        }
      }
    } catch {
      adminUserId = null;
    }
    
    await db.insert(systemSettings)
      .values({
        key: "auto_follow_users",
        value: JSON.stringify(cleanUserIds),
        updatedBy: adminUserId,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: JSON.stringify(cleanUserIds),
          updatedBy: adminUserId,
          updatedAt: new Date()
        }
      });
      
    res.json({ success: true, message: "Otomatik takip listesi güncellendi.", data: cleanUserIds });
  } catch (error) {
    console.error("PUT /auto-follow error:", error);
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

// ==========================================
// ADMIN ANNOUNCEMENTS SYSTEM (FAZ 58)
// ==========================================

const parseParamId = (param: string | string[]): number => parseInt(Array.isArray(param) ? param[0] : param, 10);

// GET /api/v1/admin/announcements - List announcements with view/click metrics
adminRouter.get("/announcements", async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, q } = req.query;
    const { limit, offset, page } = getPagination(req);

    // Auto-update scheduled items to published if startsAt has passed
    const now = new Date();
    await db
      .update(announcements)
      .set({ status: 'published', updatedAt: now })
      .where(
        and(
          eq(announcements.status, 'scheduled'),
          sql`${announcements.startsAt} <= ${now}`
        )
      )
      .catch(() => {});

    let whereClause = undefined;
    const conditions = [];

    if (status && typeof status === 'string' && status !== 'ALL') {
      conditions.push(eq(announcements.status, status));
    }

    if (q && typeof q === 'string' && q.trim()) {
      const keyword = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(announcements.title, keyword),
          ilike(announcements.content, keyword)
        )
      );
    }

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    // Get total count
    const countRes = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(announcements)
      .where(whereClause);
    const total = countRes[0]?.count || 0;

    // Get items with metrics
    const items = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        imageUrl: announcements.imageUrl,
        buttonText: announcements.buttonText,
        buttonUrl: announcements.buttonUrl,
        status: announcements.status,
        targetType: announcements.targetType,
        targetRole: announcements.targetRole,
        priority: announcements.priority,
        startsAt: announcements.startsAt,
        endsAt: announcements.endsAt,
        createdBy: announcements.createdBy,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        viewsCount: sql<number>`cast(count(distinct ${announcementViews.userId}) as integer)`,
        clicksCount: sql<number>`cast(count(distinct case when ${announcementViews.clickedCta} = true then ${announcementViews.userId} end) as integer)`,
      })
      .from(announcements)
      .leftJoin(announcementViews, eq(announcementViews.announcementId, announcements.id))
      .where(whereClause)
      .groupBy(announcements.id)
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get announcements error:", error);
    res.status(500).json({ success: false, error: { message: "Duyurular listelenemedi." } });
  }
});

// GET /api/v1/admin/announcements/:id - Single announcement detail
adminRouter.get("/announcements/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseParamId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz duyuru ID." } });
      return;
    }

    const item = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        imageUrl: announcements.imageUrl,
        buttonText: announcements.buttonText,
        buttonUrl: announcements.buttonUrl,
        status: announcements.status,
        targetType: announcements.targetType,
        targetRole: announcements.targetRole,
        priority: announcements.priority,
        startsAt: announcements.startsAt,
        endsAt: announcements.endsAt,
        createdBy: announcements.createdBy,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        viewsCount: sql<number>`cast(count(distinct ${announcementViews.userId}) as integer)`,
        clicksCount: sql<number>`cast(count(distinct case when ${announcementViews.clickedCta} = true then ${announcementViews.userId} end) as integer)`,
      })
      .from(announcements)
      .leftJoin(announcementViews, eq(announcementViews.announcementId, announcements.id))
      .where(eq(announcements.id, id))
      .groupBy(announcements.id)
      .limit(1);

    if (!item || item.length === 0) {
      res.status(404).json({ success: false, error: { message: "Duyuru bulunamadı." } });
      return;
    }

    res.json({ success: true, data: item[0] });
  } catch (error) {
    console.error("Admin get announcement detail error:", error);
    res.status(500).json({ success: false, error: { message: "Duyuru detayı alınamadı." } });
  }
});

// POST /api/v1/admin/announcements - Create new announcement
adminRouter.post("/announcements", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const {
      title,
      content,
      imageUrl,
      buttonText,
      buttonUrl,
      status = 'draft',
      targetType = 'all',
      targetRole,
      priority = 0,
      startsAt,
      endsAt,
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, error: { message: "Duyuru başlığı zorunludur." } });
      return;
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ success: false, error: { message: "Duyuru açıklaması zorunludur." } });
      return;
    }

    const trimmedTitle = title.trim().substring(0, 255);
    const trimmedContent = content.trim();
    const validStatus = ['draft', 'scheduled', 'published', 'archived'].includes(status) ? status : 'draft';
    const validTargetType = ['all', 'authenticated', 'specific_role'].includes(targetType) ? targetType : 'all';

    let parsedStartsAt: Date | null = startsAt ? new Date(startsAt) : null;
    let parsedEndsAt: Date | null = endsAt ? new Date(endsAt) : null;

    if (validStatus === 'published' && !parsedStartsAt) {
      parsedStartsAt = new Date();
    }

    const [created] = await db
      .insert(announcements)
      .values({
        title: trimmedTitle,
        content: trimmedContent,
        imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : null,
        buttonText: buttonText && typeof buttonText === 'string' ? buttonText.trim().substring(0, 100) : null,
        buttonUrl: buttonUrl && typeof buttonUrl === 'string' ? buttonUrl.trim() : null,
        status: validStatus,
        targetType: validTargetType,
        targetRole: validTargetType === 'specific_role' && targetRole ? targetRole.trim() : null,
        priority: typeof priority === 'number' ? priority : 0,
        startsAt: parsedStartsAt,
        endsAt: parsedEndsAt,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Log admin action
    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: 'ANNOUNCEMENT_CREATE',
      targetType: 'ANNOUNCEMENT',
      targetId: created.id.toString(),
      metadata: {
        title: trimmedTitle,
        status: validStatus,
        targetType: validTargetType,
      },
    }).catch(console.error);

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error("Admin create announcement error:", error);
    res.status(500).json({ success: false, error: { message: "Duyuru oluşturulamadı." } });
  }
});

// PUT /api/v1/admin/announcements/:id - Update announcement
adminRouter.put("/announcements/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const id = parseParamId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz duyuru ID." } });
      return;
    }

    const {
      title,
      content,
      imageUrl,
      buttonText,
      buttonUrl,
      status,
      targetType,
      targetRole,
      priority,
      startsAt,
      endsAt,
    } = req.body;

    const existing = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      res.status(404).json({ success: false, error: { message: "Duyuru bulunamadı." } });
      return;
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ success: false, error: { message: "Duyuru başlığı boş olamaz." } });
        return;
      }
      updateData.title = title.trim().substring(0, 255);
    }

    if (content !== undefined) {
      if (!content || typeof content !== 'string' || !content.trim()) {
        res.status(400).json({ success: false, error: { message: "Duyuru açıklaması boş olamaz." } });
        return;
      }
      updateData.content = content.trim();
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : null;
    }

    if (buttonText !== undefined) {
      updateData.buttonText = buttonText && typeof buttonText === 'string' ? buttonText.trim().substring(0, 100) : null;
    }

    if (buttonUrl !== undefined) {
      updateData.buttonUrl = buttonUrl && typeof buttonUrl === 'string' ? buttonUrl.trim() : null;
    }

    if (status !== undefined) {
      if (['draft', 'scheduled', 'published', 'archived'].includes(status)) {
        updateData.status = status;
        if (status === 'published' && !startsAt && !existing[0].startsAt) {
          updateData.startsAt = new Date();
        }
      }
    }

    if (targetType !== undefined) {
      if (['all', 'authenticated', 'specific_role'].includes(targetType)) {
        updateData.targetType = targetType;
      }
    }

    if (targetRole !== undefined) {
      updateData.targetRole = targetRole ? targetRole.trim() : null;
    }

    if (priority !== undefined) {
      updateData.priority = typeof priority === 'number' ? priority : 0;
    }

    if (startsAt !== undefined) {
      updateData.startsAt = startsAt ? new Date(startsAt) : null;
    }

    if (endsAt !== undefined) {
      updateData.endsAt = endsAt ? new Date(endsAt) : null;
    }

    const [updated] = await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, id))
      .returning();

    // Log admin action
    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: 'ANNOUNCEMENT_UPDATE',
      targetType: 'ANNOUNCEMENT',
      targetId: id.toString(),
      metadata: {
        updatedFields: Object.keys(updateData),
      },
    }).catch(console.error);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Admin update announcement error:", error);
    res.status(500).json({ success: false, error: { message: "Duyuru güncellenemedi." } });
  }
});

// POST /api/v1/admin/announcements/:id/publish - Quick publish
adminRouter.post("/announcements/:id/publish", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const id = parseParamId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz duyuru ID." } });
      return;
    }

    const now = new Date();
    const [updated] = await db
      .update(announcements)
      .set({
        status: 'published',
        startsAt: sql`COALESCE(${announcements.startsAt}, ${now})`,
        updatedAt: now,
      })
      .where(eq(announcements.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, error: { message: "Duyuru bulunamadı." } });
      return;
    }

    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: 'ANNOUNCEMENT_PUBLISH',
      targetType: 'ANNOUNCEMENT',
      targetId: id.toString(),
      metadata: { title: updated.title },
    }).catch(console.error);

    res.json({ success: true, data: updated, message: "Duyuru yayına alındı." });
  } catch (error) {
    console.error("Admin publish announcement error:", error);
    res.status(500).json({ success: false, error: { message: "Duyuru yayınlanamadı." } });
  }
});

// POST /api/v1/admin/announcements/:id/archive - Quick archive
adminRouter.post("/announcements/:id/archive", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const id = parseParamId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz duyuru ID." } });
      return;
    }

    const now = new Date();
    const [updated] = await db
      .update(announcements)
      .set({
        status: 'archived',
        updatedAt: now,
      })
      .where(eq(announcements.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, error: { message: "Duyuru bulunamadı." } });
      return;
    }

    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: 'ANNOUNCEMENT_ARCHIVE',
      targetType: 'ANNOUNCEMENT',
      targetId: id.toString(),
      metadata: { title: updated.title },
    }).catch(console.error);

    res.json({ success: true, data: updated, message: "Duyuru arşivlendi." });
  } catch (error) {
    console.error("Admin archive announcement error:", error);
    res.status(500).json({ success: false, error: { message: "Duyuru arşivlenemedi." } });
  }
});

// DELETE /api/v1/admin/announcements/:id - Delete announcement
adminRouter.delete("/announcements/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const id = parseParamId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz duyuru ID." } });
      return;
    }

    const [deleted] = await db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ success: false, error: { message: "Duyuru bulunamadı." } });
      return;
    }

    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: 'ANNOUNCEMENT_DELETE',
      targetType: 'ANNOUNCEMENT',
      targetId: id.toString(),
      metadata: { title: deleted.title },
    }).catch(console.error);

    res.json({ success: true, data: { message: "Duyuru başarıyla silindi." } });
  } catch (error) {
    console.error("Admin delete announcement error:", error);
    res.status(500).json({ success: false, error: { message: "Duyuru silinemedi." } });
  }
});


