import { Router } from "express";
import { requireAuth, requireAuthContext, optionalAuthContext } from "../middleware/auth.js";
import { db } from "../../src/db/index.js";
import { users, profiles, follows, posts, projects, blocks } from "../../src/db/schema.js";
import { eq, ne, and, or, isNull, inArray, sql, notInArray } from "drizzle-orm";
import { getFollowSuggestions } from "../services/suggestions.js";

export const onboardingRouter = Router();

// GET /api/onboarding/progress
onboardingRouter.get("/progress", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    
    // Check follows count
    const followCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, currentUserId));
    const followCount = followCountResult[0]?.count || 0;

    // Check posts
    const postCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(eq(posts.userId, currentUserId));
    const hasPost = (postCountResult[0]?.count || 0) > 0;

    // Check projects
    const projectCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.userId, currentUserId));
    const hasProject = (projectCountResult[0]?.count || 0) > 0;
    
    // Check global status
    const profileResult = await db.select({ onboardingCompleted: profiles.onboardingCompleted })
      .from(profiles)
      .where(eq(profiles.userId, currentUserId));
    
    res.json({
      success: true,
      data: {
        followCount,
        hasPost,
        hasProject,
        isCompleted: profileResult[0]?.onboardingCompleted || false
      }
    });
  } catch (error) {
    console.error("Onboarding progress error:", error);
    res.status(500).json({ success: false, error: { message: "Error fetching progress" } });
  }
});

// POST /api/onboarding/complete
onboardingRouter.post("/complete", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    await db.update(profiles)
      .set({ onboardingCompleted: true })
      .where(eq(profiles.userId, currentUserId));
    
    res.json({ success: true, data: { completed: true } });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    res.status(500).json({ success: false, error: { message: "Error completing onboarding" } });
  }
});

// GET /api/onboarding/suggested-users
onboardingRouter.get("/suggested-users", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const result = await getFollowSuggestions(currentUserId, { limit: 10 });
    res.json({
      success: true,
      data: result.users
    });
  } catch (error) {
    console.error("Onboarding suggestions error:", error);
    res.status(500).json({ success: false, error: { message: "Error fetching suggestions" } });
  }
});
