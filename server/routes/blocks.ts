import { Router } from "express";
import { db } from "../../src/db/index.js";
import { blocks, users, profiles } from "../../src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext } from "../middleware/auth.js";

export const blocksRouter = Router();

blocksRouter.post("/:id/block", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (targetUserId === currentUserId) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz işlem." }});
    
    await db.insert(blocks).values({ blockerId: currentUserId, blockedId: targetUserId }).onConflictDoNothing();
    res.json({ success: true, data: { message: "Engellendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

blocksRouter.delete("/:id/block", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    
    await db.delete(blocks).where(and(eq(blocks.blockerId, currentUserId), eq(blocks.blockedId, targetUserId)));
    res.json({ success: true, data: { message: "Engel kaldırıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

blocksRouter.get("/me/blocked", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const list = await db.select({
      id: users.id,
      username: users.username,
      displayName: profiles.displayName
    })
    .from(blocks)
    .innerJoin(users, eq(blocks.blockedId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(blocks.blockerId, currentUserId));

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
