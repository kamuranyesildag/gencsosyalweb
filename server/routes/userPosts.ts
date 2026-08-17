import { Router } from "express";
import { db } from "../../src/db/index.js";
import { posts, postMedia, users, profiles, follows, reposts } from "../../src/db/schema.js";
import { eq, desc, isNull, inArray, and, or, lt } from "drizzle-orm";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { populatePostStats } from "../utils/postStats.js";
import { paginationSchema } from "../validators/api.js";
import { getBlockedIds } from "../utils/blocks.js";

export const userPostsRouter = Router();

userPostsRouter.get("/:id/posts", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = req.user?.userId || -1;
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };
    const offset = (page - 1) * limit;
    let cursorCondition = undefined;
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        cursorCondition = or(lt(posts.createdAt, decoded.createdAt), and(eq(posts.createdAt, decoded.createdAt), lt(posts.id, decoded.id)));
      }
    }

    const userPosts = await db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      }
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(posts.userId, targetUserId), isNull(posts.communityId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)), cursorCondition ? cursorCondition : undefined))
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit)
    .offset(offset);
    

    // Profile privacy check
    const targetProfile = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where(eq(profiles.userId, targetUserId)).limit(1);
    const isPrivate = targetProfile.length > 0 ? targetProfile[0].isPrivate : false;

    const followRecord = await db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId))).limit(1);
    const isFollowing = followRecord.length > 0;
    const isSelf = currentUserId === targetUserId;

    if (isPrivate && !isSelf && !isFollowing) {
      return res.json({ success: true, data: [] });
    }

    const blockedIds = await getBlockedIds(currentUserId);

    if (blockedIds.includes(targetUserId)) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullanıcıya erişiminiz yok." } });
    }

    const visiblePosts = userPosts.filter(p => {
        if (p.visibility === 'PUBLIC') return true;
        if (isSelf) return true;
        if (p.visibility === 'FOLLOWERS' && isFollowing) return true;
        return false;
    });

    const formattedPosts = await populatePostStats(visiblePosts, currentUserId);
    let nextCursor = undefined;
    if (visiblePosts.length === limit) {
      const last = visiblePosts[visiblePosts.length - 1];
      nextCursor = encodeCursor(last.createdAt, last.id);
    }
    res.json({ success: true, data: formattedPosts, meta: { nextCursor } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
