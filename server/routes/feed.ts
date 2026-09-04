import { Router } from "express";
import { db } from "../../src/db/index.js";
import type { DbTransaction } from "../../src/db/index.js";
import { posts, postMedia, follows, users, profiles, postViews, reposts } from "../../src/db/schema.js";
import { eq, inArray, desc, or, and, not, sql, isNull } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext, optionalAuth } from "../middleware/auth.js";
import { populatePostStats } from "../utils/postStats.js";
import { paginationSchema } from "../validators/api.js";
import { getBlockedIds } from "../utils/blocks.js";
import { verifyPostAccess } from "../utils/visibility.js";
import { z } from "zod";
import rateLimit from "express-rate-limit";

export const feedRouter = Router();

const viewLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 views per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Çok fazla istek gönderdiniz." } }
});

const viewSchema = z.object({
  postId: z.number().int().positive()
});

feedRouter.post("/view", requireAuth, viewLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const parsed = viewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz postId." } });
    }
    const { postId } = parsed.data;

    // 1. Check access
    if (!(await verifyPostAccess(postId, currentUserId))) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu içeriğe erişiminiz yok." } });
    }

    // 2. Cooldown check (5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentView = await db.select()
      .from(postViews)
      .where(
        and(
          eq(postViews.userId, currentUserId),
          eq(postViews.postId, postId),
          sql`${postViews.viewedAt} > ${fiveMinutesAgo.toISOString()}`
        )
      )
      .limit(1);

    if (recentView.length > 0) {
      return res.json({ success: true, message: "Cooldown active." });
    }

    // 3. Database transaction
    await db.transaction(async (tx: DbTransaction) => {
      await tx.insert(postViews).values({
        userId: currentUserId,
        postId: postId
      });

      await tx.update(posts)
        .set({ viewCount: sql`${posts.viewCount} + 1` })
        .where(eq(posts.id, postId));
    });

    res.json({ success: true });
  } catch (error) {
    console.error("View track error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

const ALGO_CONFIG = {
  GRAVITY: 1.5,
  BASE_SCORE_WEIGHT: 1.0,
  FOLLOWING_BONUS: 15.0,
  OWN_POST_BONUS: 5.0,
  USER_VIEW_PENALTY: 3.0,
  TIME_CONSTANT: 2 // Saat cinsinden yaşa eklenecek sabit değer (bölme hatasını ve yeni gönderilerdeki anormalliği önler)
};

const getFeedHandler = async (req: any, res: any) => {
  try {
    const currentUserId = req.user?.userId ?? null;
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };
    // we will implement cursor below, but offset is fallback
    const offset = (page - 1) * limit;

    const blockedIds = currentUserId ? await getBlockedIds(currentUserId) : [];
    const safeBlockedIds = blockedIds.length > 0 ? blockedIds : [-1];

    // Get following IDs
    let followingIds: number[] = [];
    if (currentUserId) {
      const followingRecords = await db.select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, currentUserId));
      followingIds = followingRecords.map((f: any) => f.followingId).filter((id: any) => !blockedIds.includes(id));
    }
    const safeFollowingIds = followingIds.length > 0 ? followingIds : [-1];

    // --- ALGORİTMA (MATEMATİKSEL FORMÜL & SQL YANSIMASI) ---
    // 1. Gönderi Yaşı (Saat cinsinden)
    const ageInHours = sql`GREATEST(EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600, 0)`;
    
    // 2. Takip Edilen / Kendi Gönderisi Bonusu
    let isFollowingBonus = sql`0`;
    let isOwnPostBonus = sql`0`;
    let userViewsCountSq = sql`0`;

    if (currentUserId) {
      const followingIdsSql = sql.join(safeFollowingIds.map((id: any) => sql`${id}`), sql`, `);
      isFollowingBonus = sql`CASE WHEN ${posts.userId} IN (${followingIdsSql}) THEN ${ALGO_CONFIG.FOLLOWING_BONUS} ELSE 0 END`;
      isOwnPostBonus = sql`CASE WHEN ${posts.userId} = ${currentUserId} THEN ${ALGO_CONFIG.OWN_POST_BONUS} ELSE 0 END`;
      // 3. Kullanıcının Görüntüleme Geçmişi (Tekrar/Diversity Filtresi)
      userViewsCountSq = sql`(SELECT COUNT(*) FROM ${postViews} pv WHERE pv.post_id = ${posts.id} AND pv.user_id = ${currentUserId})`;
    }

    // 4. Nihai Puanlama (Score)
    const numerator = sql`GREATEST((${posts.baseScore} * ${ALGO_CONFIG.BASE_SCORE_WEIGHT}) + ${isFollowingBonus} + ${isOwnPostBonus} - (${userViewsCountSq} * ${ALGO_CONFIG.USER_VIEW_PENALTY}), 0.1)`;
    const denominator = sql`POWER(${ageInHours} + ${ALGO_CONFIG.TIME_CONSTANT}, ${ALGO_CONFIG.GRAVITY})`;
    const rankScore = sql`${numerator} / ${denominator}`;
    // -----------------------------------------------------

    const whereConditions: any[] = [
      isNull(posts.communityId),
      eq(posts.moderationStatus, 'APPROVED'),
      sql`${posts.createdAt} >= NOW() - INTERVAL '30 days'`
    ];

    if (currentUserId) {
      whereConditions.push(
        or(
          eq(posts.userId, currentUserId), // Kendi gönderileri
          and( // Takip ettiklerinin gönderileri
            inArray(posts.userId, safeFollowingIds),
            or(eq(posts.visibility, 'PUBLIC'), eq(posts.visibility, 'FOLLOWERS'))
          ),
          and( // Herkese açık olan, ama engellenmemiş genel gönderiler (Discover/Keşfet)
            eq(posts.visibility, 'PUBLIC'),
            not(inArray(posts.userId, safeBlockedIds))
          )
        )
      );
    } else {
      whereConditions.push(
        eq(posts.visibility, 'PUBLIC')
      );
    }

    const feedPosts = await db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: users.isVerified,
      }
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(...whereConditions.filter(Boolean) as any))
    .orderBy(desc(rankScore))
    .limit(limit)
    .offset(offset);
    
    const formattedPosts = await populatePostStats(feedPosts, currentUserId ?? -1);
    const hasMore = formattedPosts.length >= limit;
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        hasMore,
      },
      posts: formattedPosts,
      hasMore,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
};

feedRouter.get("/", optionalAuth, getFeedHandler);
feedRouter.get("/for-you", optionalAuth, getFeedHandler);

feedRouter.get("/following", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const blockedIds = await getBlockedIds(currentUserId);
    const safeBlockedIds = blockedIds.length > 0 ? blockedIds : [-1];

    const followingRecords = await db.select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, currentUserId));
    
    let followingIds = followingRecords.map((f: any) => f.followingId).filter((id: any) => !blockedIds.includes(id));
    const safeFollowingIds = followingIds.length > 0 ? followingIds : [-1];

    if (safeFollowingIds[0] === -1) {
       return res.json({
         success: true,
         data: { posts: [], hasMore: false },
         posts: [],
         hasMore: false,
         meta: { followingCount: 0 }
       });
    }

    const ageInHours = sql`GREATEST(EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600, 0)`;
    const userViewsCountSq = sql`(SELECT COUNT(*) FROM ${postViews} pv WHERE pv.post_id = ${posts.id} AND pv.user_id = ${currentUserId})`;
    const numerator = sql`GREATEST((${posts.baseScore} * ${ALGO_CONFIG.BASE_SCORE_WEIGHT}) + ${ALGO_CONFIG.FOLLOWING_BONUS} - (${userViewsCountSq} * ${ALGO_CONFIG.USER_VIEW_PENALTY}), 0.1)`;
    const denominator = sql`POWER(${ageInHours} + ${ALGO_CONFIG.TIME_CONSTANT}, ${ALGO_CONFIG.GRAVITY})`;
    const rankScore = sql`${numerator} / ${denominator}`;

    const feedPosts = await db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: users.isVerified,
      }
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(
      and(
        isNull(posts.communityId),
        eq(posts.moderationStatus, 'APPROVED'),
        inArray(posts.userId, safeFollowingIds),
        not(inArray(posts.userId, safeBlockedIds)),
        or(eq(posts.visibility, 'PUBLIC'), eq(posts.visibility, 'FOLLOWERS'))
      )
    )
    .orderBy(desc(rankScore))
    .limit(limit)
    .offset(offset);
    
    const formattedPosts = await populatePostStats(feedPosts, currentUserId);
    const hasMore = formattedPosts.length >= limit;
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        hasMore,
      },
      posts: formattedPosts,
      hasMore,
      meta: { followingCount: followingIds.length }
    });
  } catch (error) {
    console.error("Feed following error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
