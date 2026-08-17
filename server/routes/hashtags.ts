import { Router } from "express";
import { db } from "../../src/db/index.js";
import { posts, users, profiles, postMedia, reposts, hashtags, postHashtags, follows } from "../../src/db/schema.js";
import { eq, and, desc, inArray, or, notInArray, isNull, sql } from "drizzle-orm";
import { getBlockedIds } from "../utils/blocks.js";
import { normalizeHashtag } from "../utils/hashtags.js";
import { optionalAuth } from "../middleware/auth.js";
import { paginationSchema } from "../validators/api.js";
import { populatePostStats } from "../utils/postStats.js";

export const hashtagsRouter = Router();

hashtagsRouter.get("/:name", optionalAuth, async (req, res) => {
  try {
    const rawName = req.params.name as string;
    const normalizedName = normalizeHashtag(rawName);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    let currentUserId = -1;
    if (req.user) {
      currentUserId = req.user.userId;
    }
    const blockedIds = await getBlockedIds(currentUserId);
    const ignoreIds = blockedIds.length > 0 ? blockedIds : [-1];

    // Find hashtag
    const tagRecord = await db.select().from(hashtags).where(eq(hashtags.normalizedName, normalizedName)).limit(1);
    if (tagRecord.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Hashtag bulunamadı." }});
    }
    const hashtag = tagRecord[0];

    // Build visibility condition
    let visibilityCondition;
    if (currentUserId !== -1) {
      // Get following IDs for FOLLOWERS visibility
      const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, currentUserId));
      const followingIds = followingRecords.map(f => f.followingId);
      const followingIdsWithSelf = followingIds.length > 0 ? followingIds : [-1];

      visibilityCondition = or(
        eq(posts.visibility, 'PUBLIC'),
        eq(posts.userId, currentUserId),
        and(eq(posts.visibility, 'FOLLOWERS'), inArray(posts.userId, followingIdsWithSelf))
      );
    } else {
      visibilityCondition = eq(posts.visibility, 'PUBLIC');
    }

    // Single query with JOIN to handle pagination correctly
    const postsResult = await db.select({
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
        isVerified: users.isVerified
      }
    }).from(posts)
      .innerJoin(postHashtags, eq(posts.id, postHashtags.postId))
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(
        eq(postHashtags.hashtagId, hashtag.id),
        notInArray(posts.userId, ignoreIds),
        visibilityCondition
      ))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    if (postsResult.length === 0) {
      return res.json({ success: true, data: { hashtag, posts: [] }});
    }

    const populatedPosts = await populatePostStats(postsResult, currentUserId);
    
    // Batch query media (Fix N+1)
    const fetchedPostIds = populatedPosts.map(p => p.id);
    const allMedia = await db.select().from(postMedia).where(inArray(postMedia.postId, fetchedPostIds));
    
    const mediaByPost = allMedia.reduce((acc, media) => {
      if (!acc[media.postId]) acc[media.postId] = [];
      acc[media.postId].push(media);
      return acc;
    }, {} as Record<number, typeof allMedia>);

    for (const post of populatedPosts) {
      post.media = mediaByPost[post.id] || [];
    }

    res.json({ success: true, data: { hashtag, posts: populatedPosts }});
  } catch (error) {
    console.error("Hashtags error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
