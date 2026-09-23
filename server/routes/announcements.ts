import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import { announcements, announcementViews, users } from "../../src/db/schema.js";
import { eq, and, or, sql, isNull, lte, gt, notInArray, desc } from "drizzle-orm";
import { optionalAuth } from "../middleware/auth.js";

export const announcementsRouter = Router();

// GET /api/v1/announcements/active - Fetch active announcements for the current user/guest
announcementsRouter.get("/active", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const currentUserId = req.user?.userId;
    const currentUserRole = req.user?.role?.toUpperCase();

    // Base conditions for active published announcements
    // 1. status is 'published'
    // 2. startsAt is NULL or startsAt <= NOW()
    // 3. endsAt is NULL or endsAt > NOW()
    const activeTimeCondition = and(
      eq(announcements.status, "published"),
      or(isNull(announcements.startsAt), lte(announcements.startsAt, now)),
      or(isNull(announcements.endsAt), gt(announcements.endsAt, now))
    );

    // Target audience matching
    let targetCondition;
    if (currentUserId) {
      // Authenticated user
      targetCondition = or(
        eq(announcements.targetType, "all"),
        eq(announcements.targetType, "authenticated"),
        and(
          eq(announcements.targetType, "specific_role"),
          currentUserRole ? eq(sql`UPPER(${announcements.targetRole})`, currentUserRole) : sql`false`
        )
      );
    } else {
      // Guest / unauthenticated
      targetCondition = eq(announcements.targetType, "all");
    }

    // If authenticated, find IDs of announcements already dismissed by this user
    let dismissedIds: number[] = [];
    if (currentUserId) {
      const dismissedViews = await db
        .select({ announcementId: announcementViews.announcementId })
        .from(announcementViews)
        .where(
          and(
            eq(announcementViews.userId, currentUserId),
            sql`${announcementViews.dismissedAt} IS NOT NULL`
          )
        );
      dismissedIds = dismissedViews.map((v: { announcementId: number }) => v.announcementId);
    }

    // Assemble query
    const whereConditions = [activeTimeCondition, targetCondition];
    if (dismissedIds.length > 0) {
      whereConditions.push(notInArray(announcements.id, dismissedIds));
    }

    const items = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        imageUrl: announcements.imageUrl,
        buttonText: announcements.buttonText,
        buttonUrl: announcements.buttonUrl,
        priority: announcements.priority,
        startsAt: announcements.startsAt,
        endsAt: announcements.endsAt,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .where(and(...whereConditions))
      .orderBy(desc(announcements.priority), desc(announcements.createdAt))
      .limit(5);

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Fetch active announcements error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Duyurular yüklenirken hata oluştu." },
    });
  }
});

// POST /api/v1/announcements/:id/seen - Mark announcement as seen / dismissed
announcementsRouter.post("/:id/seen", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const announcementId = parseInt(rawId, 10);
    if (isNaN(announcementId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz duyuru ID." } });
      return;
    }

    const currentUserId = req.user?.userId;
    const clickedCta = Boolean(req.body.clickedCta);

    if (currentUserId) {
      // Upsert into announcement_views
      await db
        .insert(announcementViews)
        .values({
          announcementId,
          userId: currentUserId,
          seenAt: new Date(),
          dismissedAt: new Date(),
          clickedCta,
        })
        .onConflictDoUpdate({
          target: [announcementViews.announcementId, announcementViews.userId],
          set: {
            dismissedAt: new Date(),
            ...(clickedCta ? { clickedCta: true } : {}),
          },
        });
    }

    res.json({ success: true, data: { message: "Duyuru görüldü olarak işaretlendi." } });
  } catch (error) {
    console.error("Mark announcement seen error:", error);
    // Return 200 with fallback so client UI does not hang
    res.json({ success: false, error: { message: "Görüldü kaydedilemedi ancak UI güncellendi." } });
  }
});

// POST /api/v1/announcements/:id/click - Track button click
announcementsRouter.post("/:id/click", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const announcementId = parseInt(rawId, 10);
    if (isNaN(announcementId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz duyuru ID." } });
      return;
    }

    const currentUserId = req.user?.userId;
    if (currentUserId) {
      await db
        .insert(announcementViews)
        .values({
          announcementId,
          userId: currentUserId,
          seenAt: new Date(),
          clickedCta: true,
        })
        .onConflictDoUpdate({
          target: [announcementViews.announcementId, announcementViews.userId],
          set: {
            clickedCta: true,
          },
        });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Track announcement click error:", error);
    res.json({ success: false });
  }
});
