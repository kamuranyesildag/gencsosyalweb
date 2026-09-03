import { Router } from "express";
import { db } from "../../src/db/index.js";
import { comments, users, profiles } from "../../src/db/schema.js";
import { eq, desc, lt, or, and } from "drizzle-orm";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";
import { requireAuth, requireAuthContext, optionalAuthContext, optionalAuth } from "../middleware/auth.js";
import { paginationSchema } from "../validators/api.js";
import { verifyPostAccess } from "../utils/visibility.js";

export const commentsRouter = Router();

// GET /posts/:id/comments
commentsRouter.get("/:id/comments", optionalAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };

    let cursorCondition: any = undefined;
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        cursorCondition = or(lt(comments.createdAt, decoded.createdAt), and(eq(comments.createdAt, decoded.createdAt), lt(comments.id, decoded.id)));
      }
    }

    const list = await db.select({
      id: comments.id,
      content: comments.content,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      }
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(comments.postId, postId), eq(comments.moderationStatus, 'APPROVED'), cursorCondition ? cursorCondition : undefined))
    .orderBy(desc(comments.createdAt), desc(comments.id))
    .limit(limit)
;

    let nextCursor: string | undefined = undefined;
    if (list.length === limit) {
      const last = list[list.length - 1];
      nextCursor = encodeCursor(last.createdAt, last.id);
    }
    res.json({ success: true, data: list, meta: { nextCursor } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
