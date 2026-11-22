import crypto from "crypto";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db } from "../../src/db/index.js";
import {
  adminAuditLogs,
  emergencyAlertAcknowledgments,
  emergencyAlerts,
  notifications,
  profiles,
  users,
} from "../../src/db/schema.js";
import {
  optionalAuth,
  requireAuth,
  requireAuthContext,
  requireRole,
} from "../middleware/auth.js";
import {
  getSmtpConfig,
  sendEmergencySecurityAlertEmail,
  type EmergencyAlertCategory,
  type EmergencyAlertSeverity,
} from "../utils/mailer.js";

const SEVERITIES = ["CRITICAL", "HIGH", "ELEVATED"] as const;
const CATEGORIES = [
  "CYBER_ATTACK",
  "DATA_SECURITY",
  "PHISHING",
  "SERVICE_OUTAGE",
  "MAINTENANCE",
  "OTHER",
] as const;
const AUDIENCES = ["ALL_ACTIVE", "ADMINS_ONLY"] as const;

const REQUIRED_CONFIRM_PHRASE = "ACİL UYARI GÖNDER";

const isSafeActionUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) {
    return !trimmed.startsWith("//") && !trimmed.includes("\\") && !trimmed.includes("..");
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const createEmergencyAlertSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(4, "Başlık en az 4 karakter olmalıdır.")
      .max(160, "Başlık en fazla 160 karakter olabilir."),
    message: z
      .string()
      .trim()
      .min(10, "Uyarı mesajı en az 10 karakter olmalıdır.")
      .max(3000, "Uyarı mesajı en fazla 3000 karakter olabilir."),
    recommendedAction: z
      .string()
      .trim()
      .max(1500, "Önerilen adımlar en fazla 1500 karakter olabilir.")
      .optional()
      .nullable(),
    severity: z.enum(SEVERITIES).default("CRITICAL"),
    category: z.enum(CATEGORIES).default("CYBER_ATTACK"),
    targetAudience: z.enum(AUDIENCES).default("ALL_ACTIVE"),
    actionLabel: z.string().trim().max(80).optional().nullable(),
    actionUrl: z
      .string()
      .trim()
      .max(500)
      .refine((v) => isSafeActionUrl(v), {
        message: "Yönlendirme bağlantısı geçerli bir sayfa yolu (/) veya https:// adresi olmalıdır.",
      })
      .optional()
      .nullable(),
    sendNotification: z.boolean().default(true),
    sendEmail: z.boolean().default(true),
    showBanner: z.boolean().default(true),
    confirmPhrase: z.string().trim().optional(),
  })
  .refine((data) => data.sendNotification || data.sendEmail || data.showBanner, {
    message: "En az bir iletim kanalı (bildirim, e-posta veya üst uyarı şeridi) seçilmelidir.",
  });

const resolveEmergencyAlertSchema = z.object({
  resolutionNote: z.string().trim().max(1000).optional().nullable(),
});

const testEmergencyEmailSchema = z.object({
  title: z.string().trim().min(4).max(160),
  message: z.string().trim().min(10).max(3000),
  recommendedAction: z.string().trim().max(1500).optional().nullable(),
  severity: z.enum(SEVERITIES).default("CRITICAL"),
  category: z.enum(CATEGORIES).default("CYBER_ATTACK"),
  actionLabel: z.string().trim().max(80).optional().nullable(),
  actionUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => isSafeActionUrl(v), {
      message: "Geçersiz yönlendirme bağlantısı.",
    })
    .optional()
    .nullable(),
});

// Cooldown guard against accidental duplicate mass dispatches
let lastLiveDispatchAt = 0;
let lastDrillDispatchAt = 0;

const generateIncidentCode = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `GS-SEC-${y}${m}${d}-${rand}`;
};

// ============================================================================
// PUBLIC / MEMBER ROUTER: /api/v1/emergency-alerts
// ============================================================================
export const emergencyAlertsRouter = Router();

// GET /api/v1/emergency-alerts/active - Active banners for current user/guest
emergencyAlertsRouter.get("/active", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;
    const isAdmin = req.user?.role?.toUpperCase() === "ADMIN";

    let acknowledgedIds: number[] = [];
    if (currentUserId) {
      const acks = await db
        .select({ alertId: emergencyAlertAcknowledgments.alertId })
        .from(emergencyAlertAcknowledgments)
        .where(eq(emergencyAlertAcknowledgments.userId, currentUserId));
      acknowledgedIds = acks.map((a: { alertId: number }) => a.alertId);
    }

    const conditions: any[] = [
      eq(emergencyAlerts.status, "ACTIVE"),
      eq(emergencyAlerts.showBanner, true),
    ];

    if (!isAdmin) {
      conditions.push(eq(emergencyAlerts.targetAudience, "ALL_ACTIVE"));
    }

    if (acknowledgedIds.length > 0) {
      conditions.push(notInArray(emergencyAlerts.id, acknowledgedIds));
    }

    const activeList = await db
      .select({
        id: emergencyAlerts.id,
        incidentCode: emergencyAlerts.incidentCode,
        title: emergencyAlerts.title,
        message: emergencyAlerts.message,
        recommendedAction: emergencyAlerts.recommendedAction,
        severity: emergencyAlerts.severity,
        category: emergencyAlerts.category,
        targetAudience: emergencyAlerts.targetAudience,
        actionLabel: emergencyAlerts.actionLabel,
        actionUrl: emergencyAlerts.actionUrl,
        createdAt: emergencyAlerts.createdAt,
      })
      .from(emergencyAlerts)
      .where(and(...conditions))
      .orderBy(desc(emergencyAlerts.createdAt))
      .limit(3);

    res.json({ success: true, data: activeList });
  } catch (error) {
    console.error("Fetch active emergency alerts error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Acil durum uyarıları yüklenemedi." },
    });
  }
});

// POST /api/v1/emergency-alerts/:id/acknowledge - Acknowledge an active alert
emergencyAlertsRouter.post("/:id/acknowledge", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = requireAuthContext(req);
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const alertId = parseInt(rawId, 10);
    if (isNaN(alertId) || alertId <= 0) {
      res.status(400).json({ success: false, error: { message: "Geçersiz uyarı kimliği." } });
      return;
    }

    const [existing] = await db
      .select({ id: emergencyAlerts.id })
      .from(emergencyAlerts)
      .where(eq(emergencyAlerts.id, alertId))
      .limit(1);

    if (!existing) {
      res.status(404).json({ success: false, error: { message: "Uyarı kaydı bulunamadı." } });
      return;
    }

    await db
      .insert(emergencyAlertAcknowledgments)
      .values({
        alertId,
        userId: currentUserId,
        acknowledgedAt: new Date(),
      })
      .onConflictDoNothing();

    // Mark related notification(s) as read for this user
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.recipientId, currentUserId),
          eq(notifications.emergencyAlertId, alertId)
        )
      );

    res.json({ success: true, data: { message: "Uyarı okundu olarak onaylandı." } });
  } catch (error) {
    console.error("Acknowledge emergency alert error:", error);
    res.status(500).json({ success: false, error: { message: "Onay kaydedilemedi." } });
  }
});

// ============================================================================
// ADMIN ROUTER: /api/v1/admin/emergency-alerts
// ============================================================================
export const adminEmergencyAlertsRouter = Router();
adminEmergencyAlertsRouter.use(requireAuth, requireRole("ADMIN"));

// GET /api/v1/admin/emergency-alerts - List alerts & real operational readiness summary
adminEmergencyAlertsRouter.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [activeMembersRow, activeAdminsRow, activeAlertsRow, smtpConfig, recentAlerts] =
      await Promise.all([
        db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(users)
          .where(eq(users.isActive, true)),
        db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(users)
          .where(and(eq(users.isActive, true), eq(sql`UPPER(${users.role})`, "ADMIN"))),
        db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(emergencyAlerts)
          .where(eq(emergencyAlerts.status, "ACTIVE")),
        getSmtpConfig(),
        db
          .select({
            id: emergencyAlerts.id,
            incidentCode: emergencyAlerts.incidentCode,
            title: emergencyAlerts.title,
            message: emergencyAlerts.message,
            recommendedAction: emergencyAlerts.recommendedAction,
            severity: emergencyAlerts.severity,
            category: emergencyAlerts.category,
            status: emergencyAlerts.status,
            targetAudience: emergencyAlerts.targetAudience,
            actionLabel: emergencyAlerts.actionLabel,
            actionUrl: emergencyAlerts.actionUrl,
            sendNotification: emergencyAlerts.sendNotification,
            sendEmail: emergencyAlerts.sendEmail,
            showBanner: emergencyAlerts.showBanner,
            recipientCount: emergencyAlerts.recipientCount,
            notificationSentCount: emergencyAlerts.notificationSentCount,
            emailStatus: emergencyAlerts.emailStatus,
            emailAttemptedCount: emergencyAlerts.emailAttemptedCount,
            emailSentCount: emergencyAlerts.emailSentCount,
            emailFailedCount: emergencyAlerts.emailFailedCount,
            createdBy: emergencyAlerts.createdBy,
            resolvedBy: emergencyAlerts.resolvedBy,
            resolutionNote: emergencyAlerts.resolutionNote,
            resolvedAt: emergencyAlerts.resolvedAt,
            createdAt: emergencyAlerts.createdAt,
            updatedAt: emergencyAlerts.updatedAt,
          })
          .from(emergencyAlerts)
          .orderBy(desc(emergencyAlerts.createdAt))
          .limit(50),
      ]);

    const alertIds: number[] = recentAlerts.map((a: { id: number }) => a.id);
    const ackCountMap = new Map<number, number>();
    if (alertIds.length > 0) {
      const ackCounts = await db
        .select({
          alertId: emergencyAlertAcknowledgments.alertId,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(emergencyAlertAcknowledgments)
        .where(inArray(emergencyAlertAcknowledgments.alertId, alertIds))
        .groupBy(emergencyAlertAcknowledgments.alertId);
      for (const row of ackCounts) {
        ackCountMap.set(row.alertId, row.count);
      }
    }

    const userIds: number[] = Array.from(
      new Set(
        recentAlerts
          .flatMap((a: { createdBy: number | null; resolvedBy: number | null }) => [
            a.createdBy,
            a.resolvedBy,
          ])
          .filter((id: number | null): id is number => typeof id === "number")
      )
    );
    const userMap = new Map<number, { username: string; displayName: string | null }>();
    if (userIds.length > 0) {
      const adminRows = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(inArray(users.id, userIds));
      for (const u of adminRows) {
        userMap.set(u.id, { username: u.username, displayName: u.displayName });
      }
    }

    const enrichedAlerts = recentAlerts.map(
      (a: { id: number; createdBy: number | null; resolvedBy: number | null; [key: string]: any }) => ({
        ...a,
        acknowledgedCount: ackCountMap.get(a.id) || 0,
        createdByUser: a.createdBy ? userMap.get(a.createdBy) || null : null,
        resolvedByUser: a.resolvedBy ? userMap.get(a.resolvedBy) || null : null,
      })
    );

    res.json({
      success: true,
      data: {
        summary: {
          activeMembersCount: activeMembersRow[0]?.count || 0,
          activeAdminsCount: activeAdminsRow[0]?.count || 0,
          activeAlertsCount: activeAlertsRow[0]?.count || 0,
          smtpConfigured: smtpConfig.isConfigured,
          smtpFrom: smtpConfig.from,
        },
        alerts: enrichedAlerts,
      },
    });
  } catch (error) {
    console.error("Admin fetch emergency alerts error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Acil durum uyarı kayıtları alınamadı." },
    });
  }
});

// POST /api/v1/admin/emergency-alerts/test-email - Send draft preview only to the signed-in admin
adminEmergencyAlertsRouter.post("/test-email", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const parsed = testEmergencyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: parsed.error.issues[0]?.message || "Geçersiz e-posta test içeriği." },
      });
      return;
    }

    const [adminUser] = await db
      .select({
        email: users.email,
        username: users.username,
        displayName: profiles.displayName,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, adminId))
      .limit(1);

    if (!adminUser?.email) {
      res.status(400).json({
        success: false,
        error: { message: "Yönetici hesabınızda kayıtlı bir e-posta adresi bulunamadı." },
      });
      return;
    }

    const data = parsed.data;
    await sendEmergencySecurityAlertEmail({
      to: adminUser.email,
      displayName: adminUser.displayName || adminUser.username,
      incidentCode: "GS-SEC-TEST",
      title: `[TEST] ${data.title}`,
      message: data.message,
      recommendedAction: data.recommendedAction,
      severity: data.severity as EmergencyAlertSeverity,
      category: data.category as EmergencyAlertCategory,
      actionLabel: data.actionLabel,
      actionUrl: data.actionUrl,
      throwOnUnconfigured: true,
      throwOnError: true,
    });

    res.json({
      success: true,
      data: {
        message: `Test güvenlik e-postası ${adminUser.email} adresine gönderildi.`,
      },
    });
  } catch (error: any) {
    console.error("Emergency test email error:", error);
    res.status(400).json({
      success: false,
      error: {
        message: error?.message || "Test e-postası gönderilemedi. SMTP ayarlarınızı kontrol edin.",
      },
    });
  }
});

// POST /api/v1/admin/emergency-alerts - Dispatch emergency notification + email + banner
adminEmergencyAlertsRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const parsed = createEmergencyAlertSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: parsed.error.issues[0]?.message || "Geçersiz uyarı verisi." },
      });
      return;
    }

    const payload = parsed.data;
    const nowMs = Date.now();

    // Safeguard 1: Explicit confirmation phrase for live all-member dispatches
    if (payload.targetAudience === "ALL_ACTIVE") {
      if ((payload.confirmPhrase || "").trim().toLocaleUpperCase("tr-TR") !== REQUIRED_CONFIRM_PHRASE) {
        res.status(400).json({
          success: false,
          error: {
            message: `Tüm üyelere acil uyarı göndermek için onay kutusuna "${REQUIRED_CONFIRM_PHRASE}" yazmalısınız.`,
          },
        });
        return;
      }

      if (nowMs - lastLiveDispatchAt < 60_000) {
        const waitSec = Math.ceil((60_000 - (nowMs - lastLiveDispatchAt)) / 1000);
        res.status(429).json({
          success: false,
          error: {
            message: `Çift gönderim koruması aktif. Yeni bir genel acil uyarı için ${waitSec} saniye bekleyin.`,
          },
        });
        return;
      }
      lastLiveDispatchAt = nowMs;
    } else {
      if (nowMs - lastDrillDispatchAt < 10_000) {
        res.status(429).json({
          success: false,
          error: { message: "Tatbikat uyarısı çok kısa süre önce gönderildi. Lütfen birkaç saniye bekleyin." },
        });
        return;
      }
      lastDrillDispatchAt = nowMs;
    }

    // Fetch recipients
    const recipientConditions =
      payload.targetAudience === "ADMINS_ONLY"
        ? and(eq(users.isActive, true), eq(sql`UPPER(${users.role})`, "ADMIN"))
        : eq(users.isActive, true);

    const recipients: Array<{
      id: number;
      email: string;
      username: string;
      displayName: string | null;
    }> = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        displayName: profiles.displayName,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(recipientConditions);

    const smtpConfig = await getSmtpConfig();
    const emailRecipients = recipients.filter((r) => Boolean(r.email && r.email.includes("@")));

    let initialEmailStatus = "SKIPPED";
    if (payload.sendEmail) {
      if (!smtpConfig.isConfigured) {
        initialEmailStatus = "UNCONFIGURED";
      } else if (emailRecipients.length === 0) {
        initialEmailStatus = "COMPLETED";
      } else {
        initialEmailStatus = "SENDING";
      }
    }

    const incidentCode = generateIncidentCode();

    const [createdAlert] = await db
      .insert(emergencyAlerts)
      .values({
        incidentCode,
        title: payload.title,
        message: payload.message,
        recommendedAction: payload.recommendedAction || null,
        severity: payload.severity,
        category: payload.category,
        status: "ACTIVE",
        targetAudience: payload.targetAudience,
        actionLabel: payload.actionLabel || null,
        actionUrl: payload.actionUrl || null,
        sendNotification: payload.sendNotification,
        sendEmail: payload.sendEmail,
        showBanner: payload.showBanner,
        recipientCount: recipients.length,
        notificationSentCount: 0,
        emailStatus: initialEmailStatus,
        emailAttemptedCount: payload.sendEmail && smtpConfig.isConfigured ? emailRecipients.length : 0,
        emailSentCount: 0,
        emailFailedCount: 0,
        createdBy: adminId,
      })
      .returning();

    // 1. In-App Notifications (chunked inserts so large member lists never hit parameter limits)
    let notificationSentCount = 0;
    if (payload.sendNotification && recipients.length > 0) {
      const CHUNK_SIZE = 500;
      const issuedAt = new Date();
      for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
        const batch = recipients.slice(i, i + CHUNK_SIZE).map((r) => ({
          recipientId: r.id,
          actorId: adminId,
          type: "emergency_alert",
          emergencyAlertId: createdAlert.id,
          isRead: false,
          createdAt: issuedAt,
        }));
        await db.insert(notifications).values(batch);
        notificationSentCount += batch.length;
      }

      await db
        .update(emergencyAlerts)
        .set({ notificationSentCount, updatedAt: new Date() })
        .where(eq(emergencyAlerts.id, createdAlert.id));
    }

    // 2. Audit log entry
    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: "emergency_alert_dispatched",
      targetType: "emergency_alert",
      targetId: String(createdAlert.id),
      metadata: {
        incidentCode,
        severity: payload.severity,
        category: payload.category,
        targetAudience: payload.targetAudience,
        recipientCount: recipients.length,
        sendNotification: payload.sendNotification,
        sendEmail: payload.sendEmail,
        showBanner: payload.showBanner,
        smtpConfigured: smtpConfig.isConfigured,
      },
    });

    // 3. Asynchronous batched transactional security email delivery
    if (payload.sendEmail && smtpConfig.isConfigured && emailRecipients.length > 0) {
      const alertId = createdAlert.id;
      const issuedAt = createdAlert.createdAt;
      setImmediate(async () => {
        let sentCount = 0;
        let failedCount = 0;
        const BATCH_CONCURRENCY = 5;

        try {
          for (let i = 0; i < emailRecipients.length; i += BATCH_CONCURRENCY) {
            const slice = emailRecipients.slice(i, i + BATCH_CONCURRENCY);
            const results = await Promise.all(
              slice.map(async (member) => {
                try {
                  const resMail = await sendEmergencySecurityAlertEmail({
                    to: member.email,
                    displayName: member.displayName || member.username,
                    incidentCode,
                    title: payload.title,
                    message: payload.message,
                    recommendedAction: payload.recommendedAction,
                    severity: payload.severity as EmergencyAlertSeverity,
                    category: payload.category as EmergencyAlertCategory,
                    actionLabel: payload.actionLabel,
                    actionUrl: payload.actionUrl,
                    issuedAt,
                  });
                  return resMail.sent;
                } catch {
                  return false;
                }
              })
            );

            for (const ok of results) {
              if (ok) sentCount += 1;
              else failedCount += 1;
            }

            await db
              .update(emergencyAlerts)
              .set({
                emailSentCount: sentCount,
                emailFailedCount: failedCount,
                updatedAt: new Date(),
              })
              .where(eq(emergencyAlerts.id, alertId));
          }

          const finalStatus =
            failedCount === 0 ? "COMPLETED" : sentCount > 0 ? "PARTIAL" : "FAILED";

          await db
            .update(emergencyAlerts)
            .set({
              emailSentCount: sentCount,
              emailFailedCount: failedCount,
              emailStatus: finalStatus,
              updatedAt: new Date(),
            })
            .where(eq(emergencyAlerts.id, alertId));
        } catch (err) {
          console.error(`[Emergency Alert ${incidentCode}] Batch email delivery error:`, err);
          await db
            .update(emergencyAlerts)
            .set({
              emailSentCount: sentCount,
              emailFailedCount: Math.max(failedCount, emailRecipients.length - sentCount),
              emailStatus: sentCount > 0 ? "PARTIAL" : "FAILED",
              updatedAt: new Date(),
            })
            .where(eq(emergencyAlerts.id, alertId));
        }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        alert: {
          ...createdAlert,
          notificationSentCount,
        },
        message:
          payload.sendEmail && !smtpConfig.isConfigured
            ? `Acil uyarı (${incidentCode}) uygulama içi kanallara yayınlandı, ancak SMTP yapılandırılmadığı için e-posta gönderimi başlatılamadı.`
            : `Acil güvenlik uyarısı (${incidentCode}) ${recipients.length} hedef üye için başlatıldı.`,
      },
    });
  } catch (error) {
    console.error("Admin dispatch emergency alert error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Acil durum uyarısı gönderilemedi." },
    });
  }
});

// POST /api/v1/admin/emergency-alerts/:id/resolve - Mark an active emergency alert resolved
adminEmergencyAlertsRouter.post("/:id/resolve", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = requireAuthContext(req);
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const alertId = parseInt(rawId, 10);
    if (isNaN(alertId) || alertId <= 0) {
      res.status(400).json({ success: false, error: { message: "Geçersiz uyarı kimliği." } });
      return;
    }

    const parsed = resolveEmergencyAlertSchema.safeParse(req.body || {});
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: parsed.error.issues[0]?.message || "Geçersiz çözüm notu." },
      });
      return;
    }

    const [updated] = await db
      .update(emergencyAlerts)
      .set({
        status: "RESOLVED",
        resolvedBy: adminId,
        resolutionNote: parsed.data.resolutionNote || null,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emergencyAlerts.id, alertId))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, error: { message: "Uyarı kaydı bulunamadı." } });
      return;
    }

    await db.insert(adminAuditLogs).values({
      adminUserId: adminId,
      action: "emergency_alert_resolved",
      targetType: "emergency_alert",
      targetId: String(updated.id),
      metadata: {
        incidentCode: updated.incidentCode,
        resolutionNote: parsed.data.resolutionNote || null,
      },
    });

    res.json({
      success: true,
      data: {
        alert: updated,
        message: `${updated.incidentCode} kodlu acil uyarı çözüldü olarak kapatıldı.`,
      },
    });
  } catch (error) {
    console.error("Resolve emergency alert error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Uyarı kapatılırken bir hata oluştu." },
    });
  }
});
