import { Router } from "express";
import { db } from "../../src/db/index.js";
import { weeklyLeaderboards, badges, userBadges, users, profiles, posts, projects, comments } from "../../src/db/schema.js";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { requireAuthContext, requireAuth, optionalAuthContext } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

export const gamificationRouter = Router();

const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getEndOfWeek = (start: Date) => {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

// GET /api/v1/gamification/leaderboard
gamificationRouter.get("/leaderboard", async (req, res) => {
  try {
    const weekStart = getStartOfWeek();
    const weekEnd = getEndOfWeek(weekStart);

    // Fetch or calculate top 10 for the current week
    // We will dynamically calculate it for simplicity and freshness, 
    // then store/update it in weeklyLeaderboards.
    
    // Calculate scores for all users active this week
    const recentPosts = await db.select({ userId: posts.userId, count: sql<number>`count(*)::int` })
      .from(posts).where(gte(posts.createdAt, weekStart)).groupBy(posts.userId);
      
    const recentProjects = await db.select({ userId: projects.userId, count: sql<number>`count(*)::int` })
      .from(projects).where(gte(projects.createdAt, weekStart)).groupBy(projects.userId);
      
    const recentComments = await db.select({ userId: comments.userId, count: sql<number>`count(*)::int` })
      .from(comments).where(gte(comments.createdAt, weekStart)).groupBy(comments.userId);

    const scoresMap = new Map<number, any>();
    
    const addToMap = (userId: number, type: string, count: number) => {
      if (!scoresMap.has(userId)) scoresMap.set(userId, { production: 0, community: 0, total: 0 });
      const current = scoresMap.get(userId);
      if (type === 'post') current.production += count * 10;
      if (type === 'project') current.production += count * 50;
      if (type === 'comment') current.community += count * 5;
      current.total = current.production + current.community;
    };

    recentPosts.forEach((p: any) => addToMap(p.userId, 'post', p.count));
    recentProjects.forEach((p: any) => addToMap(p.userId, 'project', p.count));
    recentComments.forEach((p: any) => addToMap(p.userId, 'comment', p.count));

    // Fallback: If no activity in current week yet, populate from all-time activity
    if (scoresMap.size === 0) {
      const allPosts = await db.select({ userId: posts.userId, count: sql<number>`count(*)::int` })
        .from(posts).groupBy(posts.userId);
      const allProjects = await db.select({ userId: projects.userId, count: sql<number>`count(*)::int` })
        .from(projects).groupBy(projects.userId);
      const allComments = await db.select({ userId: comments.userId, count: sql<number>`count(*)::int` })
        .from(comments).groupBy(comments.userId);

      allPosts.forEach((p: any) => addToMap(p.userId, 'post', p.count));
      allProjects.forEach((p: any) => addToMap(p.userId, 'project', p.count));
      allComments.forEach((p: any) => addToMap(p.userId, 'comment', p.count));
    }

    // Convert to array and sort
    const sorted = Array.from(scoresMap.entries())
      .map(([userId, scores]) => ({ userId, ...scores }))
      .sort((a, b) => b.total - a.total);

    // Take top 50
    const top = sorted.slice(0, 50);
    
    // Upsert to DB (in background or await)
    for (let i = 0; i < top.length; i++) {
      const u = top[i];
      await db.insert(weeklyLeaderboards).values({
        userId: u.userId,
        weekStart,
        weekEnd,
        rank: i + 1,
        score: u.total,
        productionScore: u.production,
        communityScore: u.community,
        qualityScore: 0
      }).onConflictDoUpdate({
        target: [weeklyLeaderboards.userId, weeklyLeaderboards.weekStart],
        set: {
          rank: i + 1,
          score: u.total,
          productionScore: u.production,
          communityScore: u.community
        }
      });
    }

    // Fetch the detailed list for response (top 10)
    const leaderboard = await db.select({
      rank: weeklyLeaderboards.rank,
      score: weeklyLeaderboards.score,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: users.isVerified
      }
    })
    .from(weeklyLeaderboards)
    .innerJoin(users, eq(weeklyLeaderboards.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(weeklyLeaderboards.weekStart, weekStart))
    .orderBy(weeklyLeaderboards.rank)
    .limit(10);

    let myRank = null;
    let currentUserId = optionalAuthContext(req);
    if (currentUserId) {
      const myRecord = await db.select().from(weeklyLeaderboards)
        .where(and(eq(weeklyLeaderboards.userId, currentUserId), eq(weeklyLeaderboards.weekStart, weekStart)))
        .limit(1);
      if (myRecord.length > 0) {
        myRank = { rank: myRecord[0].rank, score: myRecord[0].score };
      }
    }

    res.json({ success: true, data: { leaderboard, myRank, weekStart, weekEnd } });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});

// GET /api/v1/gamification/badges/:userId
gamificationRouter.get("/badges/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId as string);
    if (isNaN(userId)) return res.status(400).json({ success: false });

    const userBadgeList = await db.select({
      id: userBadges.id,
      awardedAt: userBadges.awardedAt,
      badge: {
        id: badges.id,
        key: badges.key,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl
      }
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.awardedAt));

    res.json({ success: true, data: userBadgeList });
  } catch (error) {
    console.error("Badges fetch error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});

// GET /api/v1/gamification/daily-quest
gamificationRouter.get("/daily-quest", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0];
    const claimKey = `DAILY_QUEST_${dateStr}`;

    // 1. Check if claimed
    // Check if the user has this pseudo-badge
    let claimed = false;
    const badgeCheck = await db.select().from(badges).where(eq(badges.key, claimKey)).limit(1);
    if (badgeCheck.length > 0) {
      const uBadge = await db.select().from(userBadges).where(and(eq(userBadges.userId, currentUserId), eq(userBadges.badgeId, badgeCheck[0].id))).limit(1);
      if (uBadge.length > 0) claimed = true;
    }

    // 2. Compute progress (e.g. 3 comments today)
    const recentComments = await db.select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .where(and(eq(comments.userId, currentUserId), gte(comments.createdAt, today)));
      
    const progress = recentComments[0]?.count || 0;
    const total = 3;

    res.json({ success: true, data: {
      questId: claimKey,
      title: "Günün Görevi",
      description: "Bugün 3 farklı gönderiye yorum yap ve sohbete katıl.",
      rewardXP: 50,
      progress,
      total,
      claimed,
      isComplete: progress >= total
    }});

  } catch (error) {
    console.error("Daily quest fetch error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});

// POST /api/v1/gamification/daily-quest/claim
gamificationRouter.post("/daily-quest/claim", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0];
    const claimKey = `DAILY_QUEST_${dateStr}`;

    // 1. Ensure badge exists
    let bId = -1;
    const existingBadge = await db.select().from(badges).where(eq(badges.key, claimKey)).limit(1);
    if (existingBadge.length === 0) {
      const resBadge = await db.insert(badges).values({
        key: claimKey,
        name: "Günlük Görev: " + dateStr,
        description: "Günlük görev tamamlandı",
        iconUrl: "Target"
      }).returning({ id: badges.id });
      bId = resBadge[0].id;
    } else {
      bId = existingBadge[0].id;
    }

    // 2. Ensure not already claimed
    const uBadge = await db.select().from(userBadges).where(and(eq(userBadges.userId, currentUserId), eq(userBadges.badgeId, bId))).limit(1);
    if (uBadge.length > 0) {
      return res.status(400).json({ success: false, error: { message: "Already claimed" } });
    }

    // 3. Insert claim
    await db.insert(userBadges).values({
      userId: currentUserId,
      badgeId: bId,
      metadata: { type: 'daily_quest', date: dateStr }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Daily quest claim error:", error);
    res.status(500).json({ success: false, error: { message: "Server error" } });
  }
});
