import { Router } from "express";
import { db } from "../../src/db/index.js";
import { stories, storyViews, follows, users, profiles } from "../../src/db/schema.js";
import { eq, inArray, gt, desc, and } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext } from "../middleware/auth.js";
import { getBlockedIds } from "../utils/blocks.js";
import { z } from "zod";

export const storiesRouter = Router();

const createStorySchema = z.object({
  mediaUrl: z.string().min(1),
  mediaType: z.enum(["image", "video"])
});

storiesRouter.post("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const parsed = createStorySchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    }
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const [story] = await db.insert(stories).values({
      userId: currentUserId,
      mediaUrl: parsed.data.mediaUrl,
      mediaType: parsed.data.mediaType,
      expiresAt
    }).returning();
    
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

storiesRouter.get("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const blockedIds = await getBlockedIds(currentUserId);
    
    const followingRecords = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, currentUserId));
    let targetIds = followingRecords.map((f: any) => f.followingId);
    targetIds.push(currentUserId);
    
    // Filter out blocked
    targetIds = targetIds.filter((id: any) => !blockedIds.includes(id));
    if (targetIds.length === 0) targetIds = [-1]; // empty array fallback for inArray

    const activeStories = await db.select({
      id: stories.id,
      mediaUrl: stories.mediaUrl,
      mediaType: stories.mediaType,
      createdAt: stories.createdAt,
      expiresAt: stories.expiresAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      }
    })
    .from(stories)
    .innerJoin(users, eq(stories.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(
      and(
        inArray(stories.userId, targetIds),
        gt(stories.expiresAt, new Date())
      )
    )
    .orderBy(desc(stories.createdAt));
    
    res.json({ success: true, data: activeStories });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

storiesRouter.post("/:id/view", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const storyId = parseInt(req.params.id as string);
    
    // insert into storyViews
    await db.insert(storyViews).values({
      storyId,
      userId: currentUserId
    }).onConflictDoNothing();
    
    res.json({ success: true, data: { message: "Görüntülendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

storiesRouter.get("/:id/views", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const storyId = parseInt(req.params.id as string);

    // Verify owner
    const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
    if (!story || story.userId !== currentUserId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkiniz yok." } });
    }

    const viewers = await db.select({
      id: users.id,
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      viewedAt: storyViews.viewedAt,
    })
    .from(storyViews)
    .innerJoin(users, eq(storyViews.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(storyViews.storyId, storyId))
    .orderBy(desc(storyViews.viewedAt));

    res.json({ success: true, data: viewers });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

storiesRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const storyId = parseInt(req.params.id as string);

    const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
    if (!story) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Hikaye bulunamadı." } });
    }

    if (story.userId !== currentUserId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkiniz yok." } });
    }

    await db.delete(stories).where(eq(stories.id, storyId));
    res.json({ success: true, data: { message: "Hikaye silindi." } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
