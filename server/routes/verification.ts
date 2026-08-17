import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import { verificationRequests } from "../../src/db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { eq, desc } from "drizzle-orm";

export const verificationRouter = Router();

verificationRouter.use(requireAuth);

// GET /api/v1/verification/me - Get current user's verification requests
verificationRouter.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const requests = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .orderBy(desc(verificationRequests.createdAt))
      .limit(10);
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching verification requests:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// POST /api/v1/verification - Create a new verification request
verificationRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { reason } = req.body;
    
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      res.status(400).json({ success: false, error: { message: "Lütfen başvuru sebebini belirtin." } });
      return;
    }
    
    if (reason.trim().length > 1000) {
      res.status(400).json({ success: false, error: { message: "Başvuru sebebi en fazla 1000 karakter olabilir." } });
      return;
    }
    
    // Check if there is an active (pending or under_review) request
    const existingActive = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .orderBy(desc(verificationRequests.createdAt))
      .limit(5);
      
    const hasActive = existingActive.some(r => r.status === "pending" || r.status === "under_review");
    if (hasActive) {
      res.status(400).json({ success: false, error: { message: "Hali hazırda devam eden bir başvurunuz bulunmaktadır." } });
      return;
    }
    
    const newReq = await db.insert(verificationRequests).values({
      userId,
      reason: reason.trim(),
      status: "pending"
    }).returning();
    
    res.status(201).json({ success: true, data: newReq[0] });
  } catch (error) {
    console.error("Error creating verification request:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});
