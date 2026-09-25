import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import { users, appeals } from "../../src/db/schema.js";
import { eq, desc } from "drizzle-orm";
import { optionalAuthContext } from "../middleware/auth.js";
import { verifySuspensionToken } from "../utils/jwt.js";

export const appealsRouter = Router();

// Helper to resolve user from auth header or suspension token
const resolveUserFromRequest = async (req: Request): Promise<{ id: number; username: string; isActive: boolean; banReason: string | null } | null> => {
  // 1. Try standard auth context
  const authUserId = optionalAuthContext(req);
  if (authUserId) {
    const userRec = await db.select({
      id: users.id,
      username: users.username,
      isActive: users.isActive,
      banReason: users.banReason
    }).from(users).where(eq(users.id, authUserId)).limit(1);

    if (userRec.length > 0) return userRec[0];
  }

  // 2. Try suspension token
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token && typeof req.body?.suspensionToken === "string") {
    token = req.body.suspensionToken;
  }
  if (!token && typeof req.query?.token === "string") {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = verifySuspensionToken(token);
      if (decoded && decoded.userId) {
        const userRec = await db.select({
          id: users.id,
          username: users.username,
          isActive: users.isActive,
          banReason: users.banReason
        }).from(users).where(eq(users.id, decoded.userId)).limit(1);

        if (userRec.length > 0) return userRec[0];
      }
    } catch {
      return null;
    }
  }

  return null;
};

// POST /api/v1/appeals - Submit an appeal for suspended account
appealsRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Yetkilendirme doğrulanamadı. Lütfen tekrar deneyin." }
      });
      return;
    }

    // Only suspended accounts can appeal
    if (user.isActive) {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Hesabınız aktif durumdadır. İtiraz yalnızca askıya alınan hesaplar için geçerlidir." }
      });
      return;
    }

    const { reason } = req.body;
    if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Lütfen itiraz gerekçenizi en az 10 karakter olacak şekilde açıklayınız." }
      });
      return;
    }

    if (reason.trim().length > 2000) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "İtiraz gerekçesi en fazla 2000 karakter olabilir." }
      });
      return;
    }

    // Prevent duplicate pending appeals
    const activeAppeal = await db.select().from(appeals)
      .where(eq(appeals.userId, user.id))
      .orderBy(desc(appeals.createdAt))
      .limit(1);

    if (activeAppeal.length > 0 && activeAppeal[0].status === "PENDING") {
      res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_APPEAL",
          message: "Zaten değerlendirilmekte olan aktif bir itirazınız bulunmaktadır. Sonuçlanana kadar yeni bir itiraz gönderemezsiniz.",
          appeal: activeAppeal[0]
        }
      });
      return;
    }

    // Insert appeal
    const inserted = await db.insert(appeals).values({
      userId: user.id,
      banReason: user.banReason || "Topluluk kurallarının ihlali",
      reason: reason.trim(),
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    res.status(201).json({
      success: true,
      data: {
        message: "İtirazınız başarıyla iletildi. Yöneticilerimiz tarafından incelendikten sonra durumunuz güncellenecektir.",
        appeal: inserted[0]
      }
    });
  } catch (err) {
    console.error("Appeal submission error:", err);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "İtiraz gönderilirken bir sunucu hatası oluştu." }
    });
  }
});

// GET /api/v1/appeals/my - Get user's current/latest appeal
appealsRouter.get("/my", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Yetkilendirme doğrulanamadı." }
      });
      return;
    }

    const latestAppeal = await db.select().from(appeals)
      .where(eq(appeals.userId, user.id))
      .orderBy(desc(appeals.createdAt))
      .limit(1);

    res.json({
      success: true,
      data: {
        appeal: latestAppeal.length > 0 ? latestAppeal[0] : null
      }
    });
  } catch (err) {
    console.error("Get my appeal error:", err);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "İtiraz bilgisi alınamadı." }
    });
  }
});
