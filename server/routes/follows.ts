import { Router } from "express";
import { db } from "../../src/db/index.js";
import { follows, blocks, users, profiles } from "../../src/db/schema.js";
import { eq, and, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { standardLimiter } from "../middleware/rateLimiter.js";
import { notify } from "../utils/notifications.js";
import { paginationSchema } from "../validators/api.js";

export const followsRouter = Router();

// POST /users/:id/follow
followsRouter.post("/:id/follow", requireAuth, standardLimiter, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = req.user!.userId;
    
    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi takip edemezsiniz." }});
    }

    // Check if blocked
    const blockRecord = await db.select().from(blocks).where(
      or(
        and(eq(blocks.blockerId, currentUserId), eq(blocks.blockedId, targetUserId)),
        and(eq(blocks.blockerId, targetUserId), eq(blocks.blockedId, currentUserId))
      )
    ).limit(1);

    if (blockRecord.length > 0) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu işlemi gerçekleştiremezsiniz." }});
    }

    const result = await db.insert(follows).values({ followerId: currentUserId, followingId: targetUserId }).onConflictDoNothing();
    
    // Check if it was actually inserted
    if (result.rowCount && result.rowCount > 0) { 
      await notify(currentUserId, targetUserId, 'follow');
    }
    
    res.json({ success: true, data: { message: "Takip ediliyor." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// DELETE /users/:id/follow
followsRouter.delete("/:id/follow", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = req.user!.userId;
    await db.delete(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)));
    res.json({ success: true, data: { message: "Takipten çıkıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// GET /users/:id/followers
followsRouter.get("/:id/followers", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const followersList = await db.select({
      id: users.id,
      username: users.username,
      isVerified: users.isVerified,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(follows.followingId, targetUserId))
    .limit(limit)
    .offset(offset);

    res.json({ success: true, data: followersList });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// GET /users/:id/following
followsRouter.get("/:id/following", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const followingList = await db.select({
      id: users.id,
      username: users.username,
      isVerified: users.isVerified,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(follows.followerId, targetUserId))
    .limit(limit)
    .offset(offset);

    res.json({ success: true, data: followingList });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
