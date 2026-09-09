import { sql } from 'drizzle-orm';
import { Router } from "express";
import { db } from "../../src/db/index.js";
import { posts, postMedia, users, profiles, follows, reposts } from "../../src/db/schema.js";
import { eq, desc, isNull, inArray, and, or, lt } from "drizzle-orm";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";
import { requireAuth, requireAuthContext, optionalAuthContext, optionalAuth } from "../middleware/auth.js";
import { populatePostStats } from "../utils/postStats.js";
import { paginationSchema } from "../validators/api.js";
import { getBlockedIds } from "../utils/blocks.js";

export const userPostsRouter = Router();

userPostsRouter.get("/:id/posts", optionalAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz kullanıcı ID'si." } });
    }
    const currentUserId = optionalAuthContext(req);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };
    const offset = (page - 1) * limit;
    let cursorCondition: any = undefined;
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        cursorCondition = or(lt(posts.createdAt, decoded.createdAt), and(eq(posts.createdAt, decoded.createdAt), lt(posts.id, decoded.id)));
      }
    }

    const moderationCondition = currentUserId
      ? or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))
      : eq(posts.moderationStatus, 'APPROVED');

    
    const p1 = db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      quotedPostId: posts.quotedPostId,
      userId: posts.userId,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      __repostCreatedAt: sql<Date>`NULL`,
      __repostUserId: sql<number>`NULL`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(posts.userId, targetUserId), isNull(posts.communityId), moderationCondition, cursorCondition ? cursorCondition : undefined))
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit);

    let repostCursorCondition: any = undefined;
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        repostCursorCondition = or(lt(reposts.createdAt, decoded.createdAt), and(eq(reposts.createdAt, decoded.createdAt), lt(reposts.id, decoded.id)));
      }
    }

    const p2 = db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      quotedPostId: posts.quotedPostId,
      userId: posts.userId,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      __repostCreatedAt: reposts.createdAt,
      __repostUserId: reposts.userId,
    })
    .from(reposts)
    .innerJoin(posts, eq(reposts.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(reposts.userId, targetUserId), isNull(posts.communityId), moderationCondition, repostCursorCondition ? repostCursorCondition : undefined))
    .orderBy(desc(reposts.createdAt), desc(reposts.id))
    .limit(limit);

    const [authoredPosts, repostedPosts] = await Promise.all([p1, p2]);

    let userPosts = [...authoredPosts, ...repostedPosts].sort((a, b) => {
      const timeA = (a.__repostCreatedAt || a.createdAt).getTime();
      const timeB = (b.__repostCreatedAt || b.createdAt).getTime();
      return timeB - timeA;
    }).slice(0, limit);
  

    // Profile privacy check
    const targetProfile = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where(eq(profiles.userId, targetUserId)).limit(1);
    const isPrivate = targetProfile.length > 0 ? targetProfile[0].isPrivate : false;

    let isFollowing = false;
    if (currentUserId) {
      const followRecord = await db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId))).limit(1);
      isFollowing = followRecord.length > 0 && followRecord[0].status === 'accepted';
    }
    const isSelf = currentUserId ? currentUserId === targetUserId : false;

    if (isPrivate && !isSelf && !isFollowing) {
      return res.json({ success: true, data: [] });
    }

    if (currentUserId) {
      const blockedIds = await getBlockedIds(currentUserId);
      if (blockedIds.includes(targetUserId)) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullanıcıya erişiminiz yok." } });
      }
    }

    const visiblePosts = userPosts.filter((p: any) => {
        if (p.visibility === 'PUBLIC') return true;
        if (isSelf) return true;
        if (p.visibility === 'FOLLOWERS' && isFollowing) return true;
        return false;
    });

    const formattedPosts = await populatePostStats(visiblePosts, currentUserId ?? undefined);
    let nextCursor: string | undefined = undefined;
    if (visiblePosts.length === limit) {
      const last = visiblePosts[visiblePosts.length - 1];
      nextCursor = encodeCursor(last.createdAt, last.id);
    }
    res.json({ success: true, data: formattedPosts, meta: { nextCursor } });
  } catch (error) {
    console.error("userPostsRouter error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
