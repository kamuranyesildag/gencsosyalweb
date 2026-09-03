import { Router } from "express";
import { db } from "../../src/db/index.js";
import { bookmarks, posts, postMedia, users, profiles, reposts } from "../../src/db/schema.js";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext } from "../middleware/auth.js";
import { populatePostStats } from "../utils/postStats.js";
import { paginationSchema } from "../validators/api.js";

export const bookmarksRouter = Router();

bookmarksRouter.get("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const savedPosts = await db.select({
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
    .from(bookmarks)
    .innerJoin(posts, eq(bookmarks.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(bookmarks.userId, currentUserId))
    .orderBy(desc(bookmarks.createdAt))
    .limit(limit)
    .offset(offset);

    const formattedPosts = await populatePostStats(savedPosts, currentUserId);
    res.json({ success: true, data: formattedPosts });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
