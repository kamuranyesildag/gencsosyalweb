import { Router } from "express";
import { db } from "../../src/db/index.js";
import { reports } from "../../src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { standardLimiter } from "../middleware/rateLimiter.js";
import { z } from "zod";

export const reportsRouter = Router();

const reportSchema = z.object({
  targetType: z.enum(["user", "post", "comment", "community"]),
  targetId: z.number(),
  reason: z.string().min(10).max(1000)
});

reportsRouter.post("/", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = req.user?.userId || -1;
    const parsed = reportSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    }
    
    const { targetType, targetId, reason } = parsed.data;
    
    // Check for duplicate pending report by same user
    const existing = await db.select().from(reports).where(
      and(
        eq(reports.reporterId, currentUserId),
        eq(reports.targetType, targetType),
        eq(reports.targetId, targetId),
        eq(reports.status, 'PENDING')
      )
    ).limit(1);
    
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Bu içerik için zaten açık bir raporunuz bulunuyor." }});
    }
    
    await db.insert(reports).values({
      reporterId: currentUserId,
      targetType,
      targetId,
      reason
    });
    
    res.status(201).json({ success: true, data: { message: "Rapor başarıyla gönderildi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
