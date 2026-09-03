
import { Router } from "express";
import { db } from "../../src/db/index.js";
import { users, profiles, posts, hashtags, postHashtags, follows } from "../../src/db/schema.js";
import { eq, or, and, ilike, notInArray, isNull, desc, sql, inArray } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext, optionalAuth } from "../middleware/auth.js";
import { standardLimiter } from "../middleware/rateLimiter.js";
import { getBlockedIds } from "../utils/blocks.js";
import { paginationSchema } from "../validators/api.js";
import { populatePostStats } from "../utils/postStats.js";



export const searchRouter = Router();

searchRouter.get("/", optionalAuth, standardLimiter, async (req, res) => {
  try {
    let q = req.query.q as string;
    const type = (req.query.type as string) || "users"; // users, posts, tags

    if (!q || q.length < 2 || q.length > 50) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Arama terimi 2-50 karakter arasında olmalıdır." }});
    }

    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const currentUserId = requireAuthContext(req);
    const blockedIds = await getBlockedIds(currentUserId);
    const ignoreIds = blockedIds.length > 0 ? blockedIds : [-1];

    if (type === "users") {
      const searchResults = await db.select({
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          or(
            ilike(users.username, `%${q}%`),
            ilike(profiles.displayName, `%${q}%`)
          ),
          notInArray(users.id, ignoreIds)
        )
      )
      .limit(limit)
      .offset(offset);
      
      return res.json({ success: true, data: searchResults });
    } 
    else if (type === "posts") {
      
      const visibilityCondition = or(
        eq(posts.visibility, "PUBLIC"),
        eq(posts.userId, currentUserId),
        and(
          eq(posts.visibility, "FOLLOWERS"),
          currentUserId !== -1 
            ? inArray(posts.userId, db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, currentUserId)))
            : sql`FALSE`
        )
      );

      const searchResults = await db.select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        postType: posts.postType,
        contentWarning: posts.contentWarning,
        visibility: posts.visibility,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          ilike(posts.content, `%${q}%`),
          notInArray(posts.userId, ignoreIds),
          visibilityCondition
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

      const formattedPosts = await populatePostStats(searchResults, currentUserId);
      return res.json({ success: true, data: formattedPosts });

    }
    else if (type === "tags") {
      if (q.startsWith('#')) {
        q = q.substring(1);
      }
      const searchResults = await db.select({
        id: hashtags.id,
        name: hashtags.name,
        postCount: sql<number>`(SELECT count(*) FROM ${postHashtags} WHERE ${postHashtags.hashtagId} = ${hashtags.id})`
      })
      .from(hashtags)
      .where(ilike(hashtags.name, `%${q}%`))
      .limit(limit)
      .offset(offset);

      return res.json({ success: true, data: searchResults });
    }
    else {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz arama tipi." }});
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
