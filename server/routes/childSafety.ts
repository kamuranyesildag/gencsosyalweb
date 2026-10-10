import { Router, Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../../src/db/index.js";
import { users, profiles, parentalControls, ageVerificationLogs, appeals } from "../../src/db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext } from "../middleware/auth.js";
import { 
  classifyAge, 
  generateAgeVerificationToken, 
  isDigitalWellbeingNightHours, 
  hashIpForAudit 
} from "../utils/childSafety.js";
import { generateSuspensionToken, verifySuspensionToken } from "../utils/jwt.js";
import rateLimit from "express-rate-limit";

export const childSafetyRouter = Router();

const safetyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Çok fazla istek yapıldı. Lütfen biraz bekleyin." } }
});

// GET /api/v1/child-safety/status
childSafetyRouter.get("/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);

    const userRec = await db.select({
      id: users.id,
      username: users.username,
      isMinor: users.isMinor,
      ageVerificationStatus: users.ageVerificationStatus,
      ageVerificationToken: users.ageVerificationToken,
      ageVerifiedAt: users.ageVerifiedAt,
      ageVerificationMethod: users.ageVerificationMethod,
      birthDate: profiles.birthDate,
      isPrivate: profiles.isPrivate,
      isScreenshotProtected: profiles.isScreenshotProtected,
      dailyScreenTimeLimitMinutes: profiles.dailyScreenTimeLimitMinutes,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId))
    .limit(1);

    if (userRec.length === 0) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." } });
      return;
    }

    const u = userRec[0];
    const isNight = isDigitalWellbeingNightHours();

    // Check parental control pairing
    const [pc] = await db.select().from(parentalControls).where(eq(parentalControls.childUserId, userId)).limit(1);

    res.json({
      success: true,
      data: {
        isMinor: u.isMinor,
        ageVerificationStatus: u.ageVerificationStatus,
        ageVerifiedAt: u.ageVerifiedAt,
        ageVerificationMethod: u.ageVerificationMethod,
        hasVerificationToken: Boolean(u.ageVerificationToken),
        birthDate: u.birthDate,
        isPrivate: u.isPrivate,
        isScreenshotProtected: u.isScreenshotProtected,
        dailyScreenTimeLimitMinutes: u.dailyScreenTimeLimitMinutes,
        digitalWellbeing: {
          isNightTime: isNight,
          recommendedSleepWindow: "22:00 - 06:00",
          nightWarning: isNight 
            ? "Gece saatlerinde ekran kullanımını sınırlandırmanız ve dinlenmeniz sağlığınız için önemlidir." 
            : null
        },
        parentalControl: pc ? {
          status: pc.status,
          parentEmailMasked: pc.parentEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
          dailyScreenTimeMinutes: pc.dailyScreenTimeMinutes,
          messagingRestricted: pc.messagingRestricted,
          nightModeEnforced: pc.nightModeEnforced,
          pairedAt: pc.pairedAt,
        } : null,
        regulationInfo: {
          title: "Sosyal Ağ Sağlayıcı Tarafından Çocuklara Özgü Ayrıştırılmış Hizmet Sunulması ve Yaş Doğrulama Yönetmeliği",
          publicationDate: "10 Ekim 2026",
          mandate: "15 yaş altı hesap açılamaz; 15-18 yaş arası çocuk kullanıcılar için yüksek korumalı ayrıştırılmış hizmet zorunludur."
        }
      }
    });
  } catch (error) {
    console.error("Child safety status error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Durum bilgisi alınamadı." } });
  }
});

const verifyAgeSchema = z.object({
  birthDate: z.string().min(1, "Doğum tarihi seçilmelidir."),
  verificationMethod: z.enum(['DECLARATION', 'NV_KPS', 'E_DEVLET']).default('DECLARATION'),
  documentNo: z.string().optional() // Simulated TC Kimlik / Belge No - never saved in plain text
});

// POST /api/v1/child-safety/verify-age
childSafetyRouter.post("/verify-age", requireAuth, safetyRateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const parsed = verifyAgeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
      return;
    }

    const { birthDate, verificationMethod } = parsed.data;
    const classification = classifyAge(birthDate);

    const rawIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
    const ipHash = hashIpForAudit(rawIp);

    // CASE 1: UNDER 15 - STRICT LAW FORBIDDEN
    if (classification.category === 'UNDER_15') {
      const banReason = "10 Ekim 2026 tarihli Sosyal Ağ Sağlayıcı Yönetmeliği gereğince 15 yaşını doldurmamış çocuk kullanıcıların sosyal ağ hesabı bulundurması kanunen yasaktır.";

      await db.update(users).set({
        isActive: false,
        isMinor: true,
        ageVerificationStatus: 'REJECTED_UNDERAGE',
        banReason,
        bannedAt: new Date(),
        updatedAt: new Date()
      }).where(eq(users.id, userId));

      await db.insert(ageVerificationLogs).values({
        userId,
        action: 'REJECTED_UNDERAGE',
        calculatedAge: classification.age,
        verificationMethod,
        ipHash,
        notes: classification.legalExplanation
      });

      const [userRec] = await db.select({ username: users.username }).from(users).where(eq(users.id, userId)).limit(1);
      const suspensionToken = generateSuspensionToken(userId, userRec?.username || '');

      res.status(403).json({
        success: false,
        error: {
          code: "AGE_RESTRICTED_UNDER_15",
          message: classification.legalExplanation,
          suspension: {
            userId,
            isPermanent: true,
            banReason,
            bannedAt: new Date(),
            suspensionToken
          }
        }
      });
      return;
    }

    // CASE 2: MINOR 15-18 YEARS
    if (classification.category === 'MINOR_15_18') {
      const token = generateAgeVerificationToken(userId, classification.age, 'VERIFIED_CHILD');

      await db.update(users).set({
        isMinor: true,
        ageVerificationStatus: 'VERIFIED_CHILD',
        ageVerificationToken: token,
        ageVerifiedAt: new Date(),
        ageVerificationMethod: verificationMethod,
        updatedAt: new Date()
      }).where(eq(users.id, userId));

      await db.update(profiles).set({
        birthDate: new Date(birthDate),
        isPrivate: true, // Default private
        allowSearchEngineIndexing: false, // Default unindexed
        messagePreference: 'FOLLOWERS', // Stranger contact blocked
        defaultPostVisibility: 'FOLLOWERS',
        isScreenshotProtected: true,
        dailyScreenTimeLimitMinutes: 120,
        updatedAt: new Date()
      }).where(eq(profiles.userId, userId));

      await db.insert(ageVerificationLogs).values({
        userId,
        action: 'VERIFIED_CHILD',
        calculatedAge: classification.age,
        verificationMethod,
        tokenHash: token.split('.')[2] || null,
        ipHash,
        notes: classification.legalExplanation
      });

      res.json({
        success: true,
        data: {
          isMinor: true,
          ageVerificationStatus: 'VERIFIED_CHILD',
          age: classification.age,
          message: "Yaşınız başarıyla doğrulandı. Hesabınız çocuk güvenliği mevzuatı gereği ayrıştırılmış koruma moduna geçirilmiştir.",
          legalExplanation: classification.legalExplanation,
          protectionsEnabled: [
            "Varsayılan gizli hesap",
            "Arama motoru indeksleme engeli",
            "Yetişkinlerden gelen tek taraflı doğrudan mesaj kısıtlaması",
            "Takipçi listesi gizliliği",
            "Ekran görüntüsü ve içerik koruması",
            "Gece dijital esenlik uyarısı"
          ]
        }
      });
      return;
    }

    // CASE 3: ADULT 18+ YEARS
    const token = generateAgeVerificationToken(userId, classification.age, 'VERIFIED_ADULT');

    await db.update(users).set({
      isMinor: false,
      ageVerificationStatus: 'VERIFIED_ADULT',
      ageVerificationToken: token,
      ageVerifiedAt: new Date(),
      ageVerificationMethod: verificationMethod,
      updatedAt: new Date()
    }).where(eq(users.id, userId));

    await db.update(profiles).set({
      birthDate: new Date(birthDate),
      updatedAt: new Date()
    }).where(eq(profiles.userId, userId));

    await db.insert(ageVerificationLogs).values({
      userId,
      action: 'VERIFIED_ADULT',
      calculatedAge: classification.age,
      verificationMethod,
      tokenHash: token.split('.')[2] || null,
      ipHash,
      notes: classification.legalExplanation
    });

    res.json({
      success: true,
      data: {
        isMinor: false,
        ageVerificationStatus: 'VERIFIED_ADULT',
        age: classification.age,
        message: "Yaş doğrulamanız başarıyla tamamlandı. Yetişkin kullanıcı statünüz onaylanmıştır."
      }
    });
  } catch (error) {
    console.error("Age verification error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Yaş doğrulaması sırasında bir hata oluştu." } });
  }
});

// POST /api/v1/child-safety/parental-control/request
const parentalRequestSchema = z.object({
  parentEmail: z.string().email("Geçerli bir veli e-posta adresi giriniz.").toLowerCase(),
  dailyScreenTimeMinutes: z.number().int().min(30).max(480).default(120)
});

childSafetyRouter.post("/parental-control/request", requireAuth, safetyRateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const parsed = parentalRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
      return;
    }

    const { parentEmail, dailyScreenTimeMinutes } = parsed.data;

    // Generate secure pairing code (e.g. GS-74921)
    const codeNum = crypto.randomInt(10000, 99999);
    const pairingCode = `GS-${codeNum}`;

    const existing = await db.select().from(parentalControls).where(eq(parentalControls.childUserId, userId)).limit(1);

    if (existing.length > 0) {
      await db.update(parentalControls).set({
        parentEmail,
        pairingCode,
        status: 'PENDING',
        dailyScreenTimeMinutes,
        updatedAt: new Date()
      }).where(eq(parentalControls.id, existing[0].id));
    } else {
      await db.insert(parentalControls).values({
        childUserId: userId,
        parentEmail,
        pairingCode,
        status: 'PENDING',
        dailyScreenTimeMinutes,
        messagingRestricted: true,
        nightModeEnforced: true,
      });
    }

    res.json({
      success: true,
      data: {
        pairingCode,
        parentEmail,
        status: 'PENDING',
        message: `Veli eşleştirme talebi oluşturuldu. Bu eşleşme kodunu (${pairingCode}) velinizle paylaşarak ebeveyn onayını tamamlayabilirsiniz.`
      }
    });
  } catch (error) {
    console.error("Parental request error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Veli eşleştirme talebi oluşturulamadı." } });
  }
});

// POST /api/v1/child-safety/parental-control/verify
const parentalVerifySchema = z.object({
  pairingCode: z.string().min(4, "Eşleştirme kodu zorunludur."),
  dailyScreenTimeMinutes: z.number().int().min(30).max(480).optional(),
});

childSafetyRouter.post("/parental-control/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const parsed = parentalVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
      return;
    }

    const { pairingCode, dailyScreenTimeMinutes } = parsed.data;

    const [record] = await db.select().from(parentalControls)
      .where(and(eq(parentalControls.childUserId, userId), eq(parentalControls.pairingCode, pairingCode.trim().toUpperCase())))
      .limit(1);

    if (!record) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_PAIRING_CODE", message: "Girdiğiniz eşleştirme kodu geçersiz veya süresi dolmuş." }
      });
      return;
    }

    const finalScreenTime = dailyScreenTimeMinutes || record.dailyScreenTimeMinutes;

    await db.update(parentalControls).set({
      status: 'ACTIVE',
      pairedAt: new Date(),
      dailyScreenTimeMinutes: finalScreenTime,
      updatedAt: new Date()
    }).where(eq(parentalControls.id, record.id));

    await db.update(profiles).set({
      dailyScreenTimeLimitMinutes: finalScreenTime,
      updatedAt: new Date()
    }).where(eq(profiles.userId, userId));

    res.json({
      success: true,
      data: {
        status: 'ACTIVE',
        dailyScreenTimeMinutes: finalScreenTime,
        message: "Ebeveyn kontrolü başarıyla etkinleştirildi."
      }
    });
  } catch (error) {
    console.error("Parental verify error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Onay işlemi tamamlanamadı." } });
  }
});

// POST /api/v1/child-safety/appeal
const childAppealSchema = z.object({
  reason: z.string().min(15, "İtiraz gerekçeniz en az 15 karakter olmalıdır.").max(2000),
  declaredBirthDate: z.string().optional(),
  contactEmail: z.string().email().optional(),
  suspensionToken: z.string().optional()
});

childSafetyRouter.post("/appeal", async (req: Request, res: Response) => {
  try {
    const parsed = childAppealSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
      return;
    }

    let targetUserId: number | null = optionalAuthContext(req);

    if (!targetUserId && parsed.data.suspensionToken) {
      const decoded = verifySuspensionToken(parsed.data.suspensionToken);
      if (decoded?.userId) {
        targetUserId = decoded.userId;
      }
    }

    if (!targetUserId) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "İtiraz için geçerli bir kullanıcı kimliği veya askıya alma belirteci gereklidir." }
      });
      return;
    }

    const existingAppeal = await db.select().from(appeals)
      .where(and(eq(appeals.userId, targetUserId), eq(appeals.status, 'PENDING')))
      .limit(1);

    if (existingAppeal.length > 0) {
      res.status(400).json({
        success: false,
        error: { code: "DUPLICATE_APPEAL", message: "Zaten inceleme bekleyen bir itirazınız bulunmaktadır." }
      });
      return;
    }

    const banReasonStr = "10 Ekim 2026 Sosyal Ağ Çocuk Güvenliği ve Yaş Doğrulama İtirazı";
    const fullReason = parsed.data.declaredBirthDate 
      ? `[Beyan Edilen Doğum Tarihi: ${parsed.data.declaredBirthDate}] ${parsed.data.reason}`
      : parsed.data.reason;

    const [createdAppeal] = await db.insert(appeals).values({
      userId: targetUserId,
      appealType: 'AGE_VERIFICATION_DISPUTE',
      banReason: banReasonStr,
      reason: fullReason,
      status: 'PENDING'
    }).returning();

    res.json({
      success: true,
      data: {
        appealId: createdAppeal.id,
        status: 'PENDING',
        message: "İtirazınız insan moderatör incelemesine başarıyla iletildi. Mevzuat gereğince itirazlar yetkili inceleme uzmanları tarafından değerlendirilecektir."
      }
    });
  } catch (error) {
    console.error("Child safety appeal error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "İtiraz kaydedilemedi." } });
  }
});
