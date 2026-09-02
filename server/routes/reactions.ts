import { Router } from "express";
import { db } from "../../src/db/index.js";
import { reactions, posts } from "../../src/db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { notify } from "../utils/notifications.js";
import { standardLimiter } from "../middleware/rateLimiter.js";
import { verifyPostAccess } from "../utils/visibility.js";
import { z } from "zod";

export const reactionsRouter = Router();

const reactionSchema = z.object({
  type: z.enum(["like", "love", "haha", "wow", "sad", "angry"])
});

// POST /posts/:id/reaction
reactionsRouter.post("/:id/reaction", requireAuth, standardLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = req.user?.userId || -1;
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    const parsed = reactionSchema.safeParse(req.body);
    
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    
    const postRecord = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    
    if (postRecord[0].userId === currentUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendi gönderinize tepki veremezsiniz." }});
    }
    if (postRecord[0].moderationStatus === "REJECTED" || postRecord[0].moderationStatus === "BLOCKED") {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderi kısıtlanmış." }});
    }
    
    let isNew = false;
    // UPSERT reaction
    try {
      await db.transaction(async (tx: any) => {
        const existing = await tx.select().from(reactions).where(and(eq(reactions.postId, postId), eq(reactions.userId, currentUserId))).limit(1);
        if (existing.length > 0) {
          await tx.update(reactions).set({ type: parsed.data.type }).where(eq(reactions.id, existing[0].id));
        } else {
          await tx.insert(reactions).values({ postId, userId: currentUserId, type: parsed.data.type });
          await tx.update(posts)
            .set({ baseScore: sql`GREATEST(${posts.baseScore} + 1, 0)` })
            .where(eq(posts.id, postId));
          isNew = true;
        }
      });
    } catch (e: any) {
      if (e.code !== '23505') throw e; // ignore unique constraint violation on race condition
    }

    if (isNew) {
      await notify(currentUserId, postRecord[0].userId, 'reaction', postId);
    }
    
    res.json({ success: true, data: { message: "Tepki verildi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// DELETE /posts/:id/reaction
reactionsRouter.delete("/:id/reaction", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = req.user?.userId || -1;
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    
    const postRecord = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    
    await db.transaction(async (tx: any) => {
      const existing = await tx.select().from(reactions).where(and(eq(reactions.postId, postId), eq(reactions.userId, currentUserId))).limit(1);
      if (existing.length > 0) {
        await tx.delete(reactions).where(and(eq(reactions.postId, postId), eq(reactions.userId, currentUserId)));
        await tx.update(posts)
          .set({ baseScore: sql`GREATEST(${posts.baseScore} - 1, 0)` })
          .where(eq(posts.id, postId));
      }
    });

    res.json({ success: true, data: { message: "Tepki kaldırıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
