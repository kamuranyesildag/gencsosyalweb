import { Router } from "express";
import { db } from "../../src/db/index.js";
import { feedbacks } from "../../src/db/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";

export const feedbacksRouter = Router();

const createFeedbackSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır.").max(255),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır.")
});

feedbacksRouter.post("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const parsed = createFeedbackSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
    }

    const [feedback] = await db.insert(feedbacks).values({
      userId: currentUserId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "NEW"
    }).returning();

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası" } });
  }
});

feedbacksRouter.get("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    
    const results = await db.select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, currentUserId))
      .orderBy(desc(feedbacks.createdAt));
      
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Get feedbacks error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası" } });
  }
});
