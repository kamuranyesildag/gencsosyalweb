import { Router } from "express";
import { db } from "../../src/db/index.js";
import { notifications, users, profiles } from "../../src/db/schema.js";
import { eq, desc, and, lt, or } from "drizzle-orm";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";
import { requireAuth } from "../middleware/auth.js";
import { paginationSchema } from "../validators/api.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user?.userId || -1;
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };
    const offset = (page - 1) * limit;
    let cursorCondition: any = undefined;
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        cursorCondition = or(lt(notifications.createdAt, decoded.createdAt), and(eq(notifications.createdAt, decoded.createdAt), lt(notifications.id, decoded.id)));
      }
    }

    const list = await db.select({
      id: notifications.id,
      type: notifications.type,
      postId: notifications.postId,
      projectId: notifications.projectId,
      commentId: notifications.commentId,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      actor: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      }
    })
    .from(notifications)
    .innerJoin(users, eq(notifications.actorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(notifications.recipientId, currentUserId), cursorCondition ? cursorCondition : undefined))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(limit)
    .offset(offset);

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

notificationsRouter.put("/read", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user?.userId || -1;
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.recipientId, currentUserId));
      
    res.json({ success: true, data: { message: "Tümü okundu olarak işaretlendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

notificationsRouter.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const notifId = parseInt(req.params.id as string);
    const currentUserId = req.user?.userId || -1;
    
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notifId), eq(notifications.recipientId, currentUserId)));
      
    res.json({ success: true, data: { message: "Okundu olarak işaretlendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
