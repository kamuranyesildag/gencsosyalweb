import { Router } from "express";
import fs from "fs";
import path from "path";
import { db } from "../../src/db/index.js";
import { 
  teknofestEvents, 
  teknofestCategories, 
  teknofestTimelineItems, 
  teknofestMedia, 
  teknofestMemories,
  users, 
  profiles,
  posts,
  projects,
  notifications,
  reports
} from "../../src/db/schema.js";
import { eq, and, desc, sql, or, inArray, ilike } from "drizzle-orm";
import { requireAuth, optionalAuth, requireRole } from "../middleware/auth.js";
import { getUploadDir } from "../utils/uploadConfig.js";

export const teknofestRouter = Router();
const requireAdmin = requireRole("ADMIN");

const getReqUserId = (req: any): number | null => {
  return req.user?.userId || req.user?.id || null;
};

/**
 * GET /api/v1/teknofest/events
 * List all events (e.g. 2026, 2025, 2027)
 */
teknofestRouter.get("/events", async (req, res) => {
  try {
    const events = await db
      .select()
      .from(teknofestEvents)
      .orderBy(desc(teknofestEvents.startDate));

    return res.json({
      success: true,
      data: events
    });
  } catch (error: any) {
    console.error("Error fetching TEKNOFEST events:", error);
    return res.status(500).json({ success: false, error: "Etkinlikler alınırken hata oluştu." });
  }
});

/**
 * GET /api/v1/teknofest/events/:slug
 * Get specific event details by slug with categories, timeline, and featured counts
 */
teknofestRouter.get("/events/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [event] = await db
      .select()
      .from(teknofestEvents)
      .where(eq(teknofestEvents.slug, slug))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, error: "TEKNOFEST etkinliği bulunamadı." });
    }

    // Categories
    const categories = await db
      .select()
      .from(teknofestCategories)
      .where(eq(teknofestCategories.eventId, event.id))
      .orderBy(teknofestCategories.sortOrder);

    // Timeline items
    const timeline = await db
      .select()
      .from(teknofestTimelineItems)
      .where(eq(teknofestTimelineItems.eventId, event.id))
      .orderBy(teknofestTimelineItems.sortOrder);

    // Total approved media count
    const [mediaCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teknofestMedia)
      .where(and(
        eq(teknofestMedia.eventId, event.id),
        eq(teknofestMedia.moderationStatus, 'APPROVED')
      ));

    // Total approved memories count
    const [memoriesCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teknofestMemories)
      .where(and(
        eq(teknofestMemories.eventId, event.id),
        eq(teknofestMemories.moderationStatus, 'APPROVED')
      ));

    return res.json({
      success: true,
      data: {
        ...event,
        categories,
        timeline,
        counts: {
          media: Number(mediaCountResult?.count || 0),
          memories: Number(memoriesCountResult?.count || 0)
        }
      }
    });
  } catch (error: any) {
    console.error("Error fetching event details:", error);
    return res.status(500).json({ success: false, error: "Etkinlik detayları alınamadı." });
  }
});

/**
 * GET /api/v1/teknofest/events/:slug/media
 * Fetch approved media with filters (category, type, featured, pagination)
 */
teknofestRouter.get("/events/:slug/media", async (req, res) => {
  try {
    const { slug } = req.params;
    const categorySlug = req.query.category as string | undefined;
    const mediaType = req.query.mediaType as string | undefined; // 'IMAGE' | 'VIDEO'
    const isFeatured = req.query.isFeatured === "true";
    const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || "20", 10)));
    const offset = (page - 1) * limit;

    const [event] = await db
      .select({ id: teknofestEvents.id })
      .from(teknofestEvents)
      .where(eq(teknofestEvents.slug, slug))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, error: "Etkinlik bulunamadı." });
    }

    let categoryId: number | null = null;
    if (categorySlug && categorySlug !== "all" && categorySlug !== "tumu") {
      const [cat] = await db
        .select({ id: teknofestCategories.id })
        .from(teknofestCategories)
        .where(and(
          eq(teknofestCategories.eventId, event.id),
          eq(teknofestCategories.slug, categorySlug)
        ))
        .limit(1);
      if (cat) categoryId = cat.id;
    }

    const conditions = [
      eq(teknofestMedia.eventId, event.id),
      eq(teknofestMedia.moderationStatus, 'APPROVED')
    ];

    if (categoryId) {
      conditions.push(eq(teknofestMedia.categoryId, categoryId));
    }

    if (mediaType && (mediaType === "IMAGE" || mediaType === "VIDEO")) {
      conditions.push(eq(teknofestMedia.mediaType, mediaType));
    }

    if (isFeatured) {
      conditions.push(eq(teknofestMedia.isFeatured, true));
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teknofestMedia)
      .where(and(...conditions));

    const total = Number(countResult?.count || 0);

    const mediaList = await db
      .select({
        id: teknofestMedia.id,
        eventId: teknofestMedia.eventId,
        userId: teknofestMedia.userId,
        categoryId: teknofestMedia.categoryId,
        categoryName: teknofestCategories.name,
        categorySlug: teknofestCategories.slug,
        postId: teknofestMedia.postId,
        projectId: teknofestMedia.projectId,
        mediaType: teknofestMedia.mediaType,
        mediaUrl: teknofestMedia.mediaUrl,
        thumbnailUrl: teknofestMedia.thumbnailUrl,
        title: teknofestMedia.title,
        caption: teknofestMedia.caption,
        altText: teknofestMedia.altText,
        credit: teknofestMedia.credit,
        aspectRatio: teknofestMedia.aspectRatio,
        duration: teknofestMedia.duration,
        viewsCount: teknofestMedia.viewsCount,
        likesCount: teknofestMedia.likesCount,
        isFeatured: teknofestMedia.isFeatured,
        createdAt: teknofestMedia.createdAt,
        uploaderUsername: users.username,
        uploaderDisplayName: profiles.displayName,
        uploaderAvatarUrl: profiles.avatarUrl,
        uploaderIsPrivate: profiles.isPrivate
      })
      .from(teknofestMedia)
      .leftJoin(teknofestCategories, eq(teknofestMedia.categoryId, teknofestCategories.id))
      .leftJoin(users, eq(teknofestMedia.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(...conditions))
      .orderBy(desc(teknofestMedia.isFeatured), desc(teknofestMedia.createdAt))
      .limit(limit)
      .offset(offset);

    // Filter out private user identities if account is private
    const sanitizedList = mediaList.map((m: any) => ({
      ...m,
      uploader: m.userId ? {
        id: m.userId,
        username: m.uploaderIsPrivate ? "Gizli Kullanıcı" : m.uploaderUsername,
        displayName: m.uploaderIsPrivate ? "Genç Sosyal Üyesi" : (m.uploaderDisplayName || m.uploaderUsername),
        avatarUrl: m.uploaderIsPrivate ? null : m.uploaderAvatarUrl
      } : null
    }));

    return res.json({
      success: true,
      data: sanitizedList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching media list:", error);
    return res.status(500).json({ success: false, error: "Medya galerisi yüklenemedi." });
  }
});

/**
 * GET /api/v1/teknofest/media/:id
 * Single media details with project and post info
 */
teknofestRouter.get("/media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Geçersiz ID" });

    const [media] = await db
      .select({
        id: teknofestMedia.id,
        eventId: teknofestMedia.eventId,
        eventTitle: teknofestEvents.title,
        eventSlug: teknofestEvents.slug,
        eventLocation: teknofestEvents.location,
        userId: teknofestMedia.userId,
        categoryId: teknofestMedia.categoryId,
        categoryName: teknofestCategories.name,
        postId: teknofestMedia.postId,
        projectId: teknofestMedia.projectId,
        mediaType: teknofestMedia.mediaType,
        mediaUrl: teknofestMedia.mediaUrl,
        thumbnailUrl: teknofestMedia.thumbnailUrl,
        title: teknofestMedia.title,
        caption: teknofestMedia.caption,
        altText: teknofestMedia.altText,
        credit: teknofestMedia.credit,
        aspectRatio: teknofestMedia.aspectRatio,
        duration: teknofestMedia.duration,
        viewsCount: teknofestMedia.viewsCount,
        likesCount: teknofestMedia.likesCount,
        isFeatured: teknofestMedia.isFeatured,
        createdAt: teknofestMedia.createdAt,
        uploaderUsername: users.username,
        uploaderDisplayName: profiles.displayName,
        uploaderAvatarUrl: profiles.avatarUrl,
        uploaderIsPrivate: profiles.isPrivate
      })
      .from(teknofestMedia)
      .innerJoin(teknofestEvents, eq(teknofestMedia.eventId, teknofestEvents.id))
      .leftJoin(teknofestCategories, eq(teknofestMedia.categoryId, teknofestCategories.id))
      .leftJoin(users, eq(teknofestMedia.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(
        eq(teknofestMedia.id, id),
        eq(teknofestMedia.moderationStatus, 'APPROVED')
      ))
      .limit(1);

    if (!media) {
      return res.status(404).json({ success: false, error: "Medya bulunamadı veya onay bekliyor." });
    }

    // Increment view count asynchronously
    db.update(teknofestMedia)
      .set({ viewsCount: sql`${teknofestMedia.viewsCount} + 1` })
      .where(eq(teknofestMedia.id, id))
      .catch(() => {});

    // Fetch linked project if exists
    let linkedProject: any = null;
    if (media.projectId) {
      const [proj] = await db
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          category: projects.category,
          imageUrl: projects.imageUrl
        })
        .from(projects)
        .where(eq(projects.id, media.projectId))
        .limit(1);
      linkedProject = proj || null;
    }

    return res.json({
      success: true,
      data: {
        ...media,
        uploader: media.userId ? {
          id: media.userId,
          username: media.uploaderIsPrivate ? "Gizli Kullanıcı" : media.uploaderUsername,
          displayName: media.uploaderIsPrivate ? "Genç Sosyal Üyesi" : (media.uploaderDisplayName || media.uploaderUsername),
          avatarUrl: media.uploaderIsPrivate ? null : media.uploaderAvatarUrl
        } : null,
        linkedProject
      }
    });
  } catch (error: any) {
    console.error("Error fetching single media:", error);
    return res.status(500).json({ success: false, error: "Medya yüklenemedi." });
  }
});

/**
 * POST /api/v1/teknofest/media/:id/like
 * Increment likes count on media item
 */
teknofestRouter.post("/media/:id/like", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Geçersiz ID" });

    const [updated] = await db
      .update(teknofestMedia)
      .set({ likesCount: sql`${teknofestMedia.likesCount} + 1` })
      .where(eq(teknofestMedia.id, id))
      .returning({ likesCount: teknofestMedia.likesCount });

    return res.json({
      success: true,
      likesCount: updated?.likesCount || 0
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Beğeni kaydedilemedi." });
  }
});

/**
 * GET /api/v1/teknofest/events/:slug/projects
 * Fetch featured projects for TEKNOFEST
 */
teknofestRouter.get("/events/:slug/projects", async (req, res) => {
  try {
    const { slug } = req.params;

    const [event] = await db
      .select({ id: teknofestEvents.id })
      .from(teknofestEvents)
      .where(eq(teknofestEvents.slug, slug))
      .limit(1);

    if (!event) return res.status(404).json({ success: false, error: "Etkinlik bulunamadı." });

    // Fetch projects directly linked in media or tagged with teknofest
    const linkedMediaProjects = await db
      .select({
        projectId: teknofestMedia.projectId
      })
      .from(teknofestMedia)
      .where(and(
        eq(teknofestMedia.eventId, event.id),
        sql`${teknofestMedia.projectId} IS NOT NULL`,
        eq(teknofestMedia.moderationStatus, 'APPROVED')
      ));

    const projectIds = linkedMediaProjects.map((p: any) => p.projectId).filter(Boolean) as number[];

    // Fetch matching projects
    let queryCondition = sql`1=1`;
    if (projectIds.length > 0) {
      queryCondition = or(
        inArray(projects.id, projectIds),
        ilike(projects.title, '%teknofest%'),
        ilike(projects.description, '%teknofest%')
      )!;
    } else {
      queryCondition = or(
        ilike(projects.title, '%teknofest%'),
        ilike(projects.description, '%teknofest%'),
        ilike(projects.category, '%Havacılık%'),
        ilike(projects.category, '%Robotik%')
      )!;
    }

    const projectList = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        category: projects.category,
        status: projects.status,
        imageUrl: projects.imageUrl,
        projectUrl: projects.projectUrl,
        githubUrl: projects.githubUrl,
        createdAt: projects.createdAt,
        authorUsername: users.username,
        authorDisplayName: profiles.displayName,
        authorAvatarUrl: profiles.avatarUrl
      })
      .from(projects)
      .innerJoin(users, eq(projects.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(queryCondition)
      .orderBy(desc(projects.createdAt))
      .limit(20);

    return res.json({
      success: true,
      data: projectList
    });
  } catch (error: any) {
    console.error("Error fetching TEKNOFEST projects:", error);
    return res.status(500).json({ success: false, error: "Projeler alınamadı." });
  }
});

/**
 * GET /api/v1/teknofest/events/:slug/memories
 * Fetch approved memories and experiences
 */
teknofestRouter.get("/events/:slug/memories", async (req, res) => {
  try {
    const { slug } = req.params;

    const [event] = await db
      .select({ id: teknofestEvents.id })
      .from(teknofestEvents)
      .where(eq(teknofestEvents.slug, slug))
      .limit(1);

    if (!event) return res.status(404).json({ success: false, error: "Etkinlik bulunamadı." });

    const memoriesList = await db
      .select({
        id: teknofestMemories.id,
        eventId: teknofestMemories.eventId,
        userId: teknofestMemories.userId,
        postId: teknofestMemories.postId,
        content: teknofestMemories.content,
        authorName: teknofestMemories.authorName,
        authorTitle: teknofestMemories.authorTitle,
        isFeatured: teknofestMemories.isFeatured,
        createdAt: teknofestMemories.createdAt,
        userUsername: users.username,
        userDisplayName: profiles.displayName,
        userAvatarUrl: profiles.avatarUrl,
        userIsPrivate: profiles.isPrivate
      })
      .from(teknofestMemories)
      .leftJoin(users, eq(teknofestMemories.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(
        eq(teknofestMemories.eventId, event.id),
        eq(teknofestMemories.moderationStatus, 'APPROVED')
      ))
      .orderBy(desc(teknofestMemories.isFeatured), desc(teknofestMemories.createdAt))
      .limit(30);

    const sanitizedMemories = memoriesList.map((m: any) => ({
      ...m,
      displayAuthor: m.authorName || (m.userIsPrivate ? "Genç Sosyal Üyesi" : (m.userDisplayName || m.userUsername || "Ziyaretçi")),
      avatarUrl: m.userIsPrivate ? null : m.userAvatarUrl,
      username: m.userIsPrivate ? null : m.userUsername
    }));

    return res.json({
      success: true,
      data: sanitizedMemories
    });
  } catch (error: any) {
    console.error("Error fetching memories:", error);
    return res.status(500).json({ success: false, error: "Anılar yüklenemedi." });
  }
});

/**
 * POST /api/v1/teknofest/events/:slug/submit
 * User submission endpoint (Photo, Video, Memory, or Link Post/Project)
 * Automatically enters moderation queue with status 'PENDING'
 */
teknofestRouter.post("/events/:slug/submit", requireAuth, async (req: any, res) => {
  try {
    const { slug } = req.params;
    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Oturum açmanız gerekiyor." });

    const {
      type, // 'PHOTO' | 'VIDEO' | 'MEMORY'
      mediaUrl,
      title,
      caption,
      categoryId,
      projectId,
      postId,
      authorTitle,
      rightsAgreed
    } = req.body;

    if (!rightsAgreed) {
      return res.status(400).json({
        success: false,
        error: "İçeriğin telif ve paylaşım haklarına sahip olduğunuzu onaylamanız gerekmektedir."
      });
    }

    const [event] = await db
      .select({ id: teknofestEvents.id, title: teknofestEvents.title })
      .from(teknofestEvents)
      .where(eq(teknofestEvents.slug, slug))
      .limit(1);

    if (!event) return res.status(404).json({ success: false, error: "Etkinlik bulunamadı." });

    // Fetch user profile for default credit
    const [user] = await db
      .select({
        username: users.username,
        displayName: profiles.displayName
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, userId))
      .limit(1);

    const creditName = user?.username ? `📷 @${user.username}` : "📷 Genç Sosyal Üyesi";

    if (type === "MEMORY") {
      if (!caption || caption.trim().length < 10) {
        return res.status(400).json({ success: false, error: "Lütfen en az 10 karakterden oluşan bir anı/deneyim yazısı girin." });
      }

      const [newMemory] = await db
        .insert(teknofestMemories)
        .values({
          eventId: event.id,
          userId: userId,
          postId: postId ? parseInt(postId, 10) : null,
          content: caption.trim(),
          authorName: user?.displayName || user?.username || "Genç Sosyal Üreticisi",
          authorTitle: authorTitle?.trim() || "TEKNOFEST Katılımcısı",
          moderationStatus: "PENDING",
          isFeatured: false
        })
        .returning();

      return res.json({
        success: true,
        message: "Anınız başarıyla gönderildi. Moderasyon ekibimiz inceledikten sonra TEKNOFEST Köşesi'nde yayınlanacaktır.",
        data: newMemory
      });
    } else {
      // PHOTO or VIDEO
      if (!mediaUrl || !mediaUrl.trim()) {
        return res.status(400).json({ success: false, error: "Lütfen geçerli bir görsel veya video URL'si sağlayın." });
      }

      const mediaType = type === "VIDEO" ? "VIDEO" : "IMAGE";

      const [newMedia] = await db
        .insert(teknofestMedia)
        .values({
          eventId: event.id,
          userId: userId,
          categoryId: categoryId ? parseInt(categoryId, 10) : null,
          projectId: projectId ? parseInt(projectId, 10) : null,
          postId: postId ? parseInt(postId, 10) : null,
          mediaType: mediaType,
          mediaUrl: mediaUrl.trim(),
          title: title?.trim() || "TEKNOFEST Karesi",
          caption: caption?.trim() || null,
          altText: title?.trim() ? `TEKNOFEST — ${title.trim()}` : "TEKNOFEST Etkinlik Fotoğrafı",
          credit: creditName,
          moderationStatus: "PENDING",
          isFeatured: false
        })
        .returning();

      return res.json({
        success: true,
        message: "İçeriğiniz başarıyla gönderildi. Moderasyon onayından sonra ana galeride yerini alacaktır.",
        data: newMedia
      });
    }
  } catch (error: any) {
    console.error("Submission error:", error);
    return res.status(500).json({ success: false, error: "İçerik gönderilirken bir hata oluştu." });
  }
});

/**
 * GET /api/v1/teknofest/my-submissions
 * Get current user's TEKNOFEST submissions
 */
teknofestRouter.get("/my-submissions", requireAuth, async (req: any, res) => {
  try {
    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Yetkisiz erişim." });

    const mediaSubmissions = await db
      .select({
        id: teknofestMedia.id,
        type: sql<string>`'MEDIA'`,
        mediaType: teknofestMedia.mediaType,
        mediaUrl: teknofestMedia.mediaUrl,
        title: teknofestMedia.title,
        caption: teknofestMedia.caption,
        moderationStatus: teknofestMedia.moderationStatus,
        rejectionReason: teknofestMedia.rejectionReason,
        createdAt: teknofestMedia.createdAt,
        eventTitle: teknofestEvents.title,
        eventSlug: teknofestEvents.slug
      })
      .from(teknofestMedia)
      .innerJoin(teknofestEvents, eq(teknofestMedia.eventId, teknofestEvents.id))
      .where(eq(teknofestMedia.userId, userId))
      .orderBy(desc(teknofestMedia.createdAt));

    const memorySubmissions = await db
      .select({
        id: teknofestMemories.id,
        type: sql<string>`'MEMORY'`,
        mediaType: sql<string>`'TEXT'`,
        mediaUrl: sql<string>`null`,
        title: teknofestMemories.authorTitle,
        caption: teknofestMemories.content,
        moderationStatus: teknofestMemories.moderationStatus,
        rejectionReason: teknofestMemories.rejectionReason,
        createdAt: teknofestMemories.createdAt,
        eventTitle: teknofestEvents.title,
        eventSlug: teknofestEvents.slug
      })
      .from(teknofestMemories)
      .innerJoin(teknofestEvents, eq(teknofestMemories.eventId, teknofestEvents.id))
      .where(eq(teknofestMemories.userId, userId))
      .orderBy(desc(teknofestMemories.createdAt));

    const combined = [...mediaSubmissions, ...memorySubmissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json({
      success: true,
      data: combined
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Gönderileriniz alınamadı." });
  }
});

// ==========================================
// ADMIN ENDPOINTS (Require Role 'ADMIN')
// ==========================================

/**
 * GET /api/v1/teknofest/admin/submissions
 * Get pending moderation items
 */
teknofestRouter.get("/admin/submissions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status as string) || "PENDING"; // 'PENDING', 'APPROVED', 'REJECTED', 'ALL'

    let mediaConditions = sql`1=1`;
    let memoryConditions = sql`1=1`;

    if (status !== "ALL") {
      mediaConditions = eq(teknofestMedia.moderationStatus, status);
      memoryConditions = eq(teknofestMemories.moderationStatus, status);
    }

    const pendingMedia = await db
      .select({
        id: teknofestMedia.id,
        type: sql<string>`'MEDIA'`,
        eventId: teknofestMedia.eventId,
        eventTitle: teknofestEvents.title,
        userId: teknofestMedia.userId,
        username: users.username,
        displayName: profiles.displayName,
        mediaType: teknofestMedia.mediaType,
        mediaUrl: teknofestMedia.mediaUrl,
        title: teknofestMedia.title,
        caption: teknofestMedia.caption,
        credit: teknofestMedia.credit,
        altText: teknofestMedia.altText,
        moderationStatus: teknofestMedia.moderationStatus,
        rejectionReason: teknofestMedia.rejectionReason,
        createdAt: teknofestMedia.createdAt
      })
      .from(teknofestMedia)
      .innerJoin(teknofestEvents, eq(teknofestMedia.eventId, teknofestEvents.id))
      .leftJoin(users, eq(teknofestMedia.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(mediaConditions)
      .orderBy(desc(teknofestMedia.createdAt));

    const pendingMemories = await db
      .select({
        id: teknofestMemories.id,
        type: sql<string>`'MEMORY'`,
        eventId: teknofestMemories.eventId,
        eventTitle: teknofestEvents.title,
        userId: teknofestMemories.userId,
        username: users.username,
        displayName: profiles.displayName,
        mediaType: sql<string>`'TEXT'`,
        mediaUrl: sql<string>`null`,
        title: teknofestMemories.authorTitle,
        caption: teknofestMemories.content,
        credit: teknofestMemories.authorName,
        altText: sql<string>`null`,
        moderationStatus: teknofestMemories.moderationStatus,
        rejectionReason: teknofestMemories.rejectionReason,
        createdAt: teknofestMemories.createdAt
      })
      .from(teknofestMemories)
      .innerJoin(teknofestEvents, eq(teknofestMemories.eventId, teknofestEvents.id))
      .leftJoin(users, eq(teknofestMemories.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(memoryConditions)
      .orderBy(desc(teknofestMemories.createdAt));

    return res.json({
      success: true,
      data: {
        media: pendingMedia,
        memories: pendingMemories,
        totalPending: pendingMedia.filter((m: any) => m.moderationStatus === 'PENDING').length +
                      pendingMemories.filter((m: any) => m.moderationStatus === 'PENDING').length
      }
    });
  } catch (error: any) {
    console.error("Admin submissions error:", error);
    return res.status(500).json({ success: false, error: "Moderasyon listesi alınamadı." });
  }
});

/**
 * POST /api/v1/teknofest/admin/submissions/:id/review
 * Approve or reject submission (with optional notification trigger)
 */
teknofestRouter.post("/admin/submissions/:id/review", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const reviewerId = getReqUserId(req);
    const { type, action, rejectionReason, isFeatured } = req.body; // type: 'MEDIA' | 'MEMORY', action: 'APPROVE' | 'REJECT'

    if (action !== "APPROVE" && action !== "REJECT") {
      return res.status(400).json({ success: false, error: "Geçersiz işlem." });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    let targetUserId: number | null = null;
    let itemTitle = "TEKNOFEST İçeriğin";

    if (type === "MEMORY") {
      const [updated] = await db
        .update(teknofestMemories)
        .set({
          moderationStatus: newStatus,
          rejectionReason: action === "REJECT" ? (rejectionReason || "Topluluk kurallarına uygun bulunmadı.") : null,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          isFeatured: isFeatured !== undefined ? isFeatured : undefined,
          updatedAt: new Date()
        })
        .where(eq(teknofestMemories.id, id))
        .returning();

      if (!updated) return res.status(404).json({ success: false, error: "Anı bulunamadı." });
      targetUserId = updated.userId;
      itemTitle = "TEKNOFEST Anın";
    } else {
      const [updated] = await db
        .update(teknofestMedia)
        .set({
          moderationStatus: newStatus,
          rejectionReason: action === "REJECT" ? (rejectionReason || "Görsel/video standartlarına uygun bulunmadı.") : null,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          isFeatured: isFeatured !== undefined ? isFeatured : undefined,
          updatedAt: new Date()
        })
        .where(eq(teknofestMedia.id, id))
        .returning();

      if (!updated) return res.status(404).json({ success: false, error: "Medya bulunamadı." });
      targetUserId = updated.userId;
      itemTitle = updated.title || "TEKNOFEST Fotoğrafın";
    }

    // Send user notification on approve
    if (action === "APPROVE" && targetUserId) {
      try {
        await db.insert(notifications).values({
          userId: targetUserId,
          actorId: reviewerId || targetUserId,
          type: "SYSTEM",
          content: `🎉 Tebrikler! "${itemTitle}" başlıklı içeriğin incelendi ve TEKNOFEST Köşesi'nde yayınlandı.`
        });
      } catch (nErr) {
        console.warn("Notification insert note:", nErr);
      }
    }

    return res.json({
      success: true,
      message: action === "APPROVE" ? "İçerik onaylandı ve galeride yayınlandı." : "İçerik reddedildi."
    });
  } catch (error: any) {
    console.error("Moderation review error:", error);
    return res.status(500).json({ success: false, error: "Moderasyon işlemi kaydedilemedi." });
  }
});

/**
 * POST /api/v1/teknofest/admin/events
 * Create a new festival event (e.g. TEKNOFEST 2027)
 */
teknofestRouter.post("/admin/events", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      slug,
      title,
      theme,
      description,
      location,
      startDate,
      endDate,
      coverImageUrl,
      status,
      isFeatured,
      stats
    } = req.body;

    if (!slug || !title || !description || !location || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: "Lütfen zorunlu alanları doldurun." });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    const [newEvent] = await db
      .insert(teknofestEvents)
      .values({
        slug: cleanSlug,
        title: title.trim(),
        theme: theme?.trim() || null,
        description: description.trim(),
        location: location.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverImageUrl: coverImageUrl?.trim() || null,
        status: status || "COMPLETED",
        isFeatured: isFeatured !== undefined ? isFeatured : true,
        stats: stats || { visitorCount: "1.0M+", projectCount: "1,000+", competitionsCount: "40" }
      })
      .returning();

    // Create default categories for new event
    await db.insert(teknofestCategories).values([
      { eventId: newEvent.id, name: "📸 Etkinlik", slug: "etkinlik", icon: "Camera", sortOrder: 1 },
      { eventId: newEvent.id, name: "🚀 Projeler", slug: "projeler", icon: "Rocket", sortOrder: 2 },
      { eventId: newEvent.id, name: "🤖 Teknoloji", slug: "teknoloji", icon: "Cpu", sortOrder: 3 },
      { eventId: newEvent.id, name: "🧑‍🤝‍🧑 Gençler", slug: "gencler", icon: "Users", sortOrder: 4 },
      { eventId: newEvent.id, name: "🏆 Yarışmalar", slug: "yarismalar", icon: "Trophy", sortOrder: 5 },
      { eventId: newEvent.id, name: "🌆 Festival Alanı", slug: "alan", icon: "MapPin", sortOrder: 6 }
    ]).catch(() => {});

    return res.json({
      success: true,
      message: "Yeni TEKNOFEST etkinliği başarıyla oluşturuldu.",
      data: newEvent
    });
  } catch (error: any) {
    console.error("Create event error:", error);
    return res.status(500).json({ success: false, error: "Etkinlik oluşturulamadı." });
  }
});

/**
 * PUT /api/v1/teknofest/admin/events/:id
 * Update event metadata
 */
teknofestRouter.put("/admin/events/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const {
      slug,
      title,
      theme,
      description,
      location,
      startDate,
      endDate,
      coverImageUrl,
      status,
      isFeatured,
      stats
    } = req.body;

    const [updated] = await db
      .update(teknofestEvents)
      .set({
        slug: slug ? slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") : undefined,
        title: title?.trim(),
        theme: theme?.trim(),
        description: description?.trim(),
        location: location?.trim(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        coverImageUrl: coverImageUrl?.trim(),
        status: status,
        isFeatured: isFeatured,
        stats: stats,
        updatedAt: new Date()
      })
      .where(eq(teknofestEvents.id, id))
      .returning();

    return res.json({
      success: true,
      message: "Etkinlik güncellendi.",
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Etkinlik güncellenemedi." });
  }
});

/**
 * GET /api/v1/teknofest/admin/media
 * Admin list all media items with filters
 */
teknofestRouter.get("/admin/media", requireAuth, requireAdmin, async (req, res) => {
  try {
    const eventId = req.query.eventId ? parseInt(req.query.eventId as string, 10) : undefined;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
    const mediaType = req.query.mediaType as string | undefined;
    const search = (req.query.search as string)?.trim();

    const conditions: any[] = [];
    if (eventId) conditions.push(eq(teknofestMedia.eventId, eventId));
    if (categoryId) conditions.push(eq(teknofestMedia.categoryId, categoryId));
    if (mediaType && (mediaType === "IMAGE" || mediaType === "VIDEO")) {
      conditions.push(eq(teknofestMedia.mediaType, mediaType));
    }
    if (search) {
      conditions.push(or(
        ilike(teknofestMedia.title, `%${search}%`),
        ilike(teknofestMedia.caption, `%${search}%`),
        ilike(teknofestMedia.credit, `%${search}%`)
      ));
    }

    const items = await db
      .select({
        id: teknofestMedia.id,
        eventId: teknofestMedia.eventId,
        eventTitle: teknofestEvents.title,
        categoryId: teknofestMedia.categoryId,
        categoryName: teknofestCategories.name,
        mediaType: teknofestMedia.mediaType,
        mediaUrl: teknofestMedia.mediaUrl,
        thumbnailUrl: teknofestMedia.thumbnailUrl,
        title: teknofestMedia.title,
        caption: teknofestMedia.caption,
        altText: teknofestMedia.altText,
        credit: teknofestMedia.credit,
        aspectRatio: teknofestMedia.aspectRatio,
        duration: teknofestMedia.duration,
        viewsCount: teknofestMedia.viewsCount,
        likesCount: teknofestMedia.likesCount,
        isFeatured: teknofestMedia.isFeatured,
        moderationStatus: teknofestMedia.moderationStatus,
        createdAt: teknofestMedia.createdAt
      })
      .from(teknofestMedia)
      .leftJoin(teknofestEvents, eq(teknofestMedia.eventId, teknofestEvents.id))
      .leftJoin(teknofestCategories, eq(teknofestMedia.categoryId, teknofestCategories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(teknofestMedia.createdAt));

    return res.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Admin media fetch error:", error);
    return res.status(500).json({ success: false, error: "Medyalar yüklenemedi." });
  }
});

/**
 * POST /api/v1/teknofest/admin/media
 * Admin direct add single photo/video
 */
teknofestRouter.post("/admin/media", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const userId = getReqUserId(req);
    const {
      eventId,
      categoryId,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      title,
      caption,
      altText,
      credit,
      aspectRatio,
      duration,
      isFeatured
    } = req.body;

    if (!eventId || !mediaUrl) {
      return res.status(400).json({ success: false, error: "Etkinlik ve Medya URL'si zorunludur." });
    }

    const [newMedia] = await db
      .insert(teknofestMedia)
      .values({
        eventId: parseInt(eventId, 10),
        userId: userId,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        mediaType: mediaType || (mediaUrl.endsWith(".mp4") ? "VIDEO" : "IMAGE"),
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        title: title?.trim() || "TEKNOFEST Medyası",
        caption: caption?.trim() || null,
        altText: altText?.trim() || title?.trim() || "TEKNOFEST Etkinlik Fotoğrafı",
        credit: credit?.trim() || "📷 Genç Sosyal",
        aspectRatio: aspectRatio || "4:3",
        duration: duration ? parseInt(duration, 10) : null,
        isFeatured: Boolean(isFeatured),
        moderationStatus: "APPROVED",
        reviewedBy: userId,
        reviewedAt: new Date()
      })
      .returning();

    return res.json({
      success: true,
      message: "Medya başarıyla eklendi ve yayınlandı.",
      data: newMedia
    });
  } catch (error: any) {
    console.error("Admin media add error:", error);
    return res.status(500).json({ success: false, error: "Medya eklenemedi." });
  }
});

/**
 * POST /api/v1/teknofest/admin/media/batch
 * Admin batch add multiple media items
 */
teknofestRouter.post("/admin/media/batch", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const userId = getReqUserId(req);
    const { eventId, items } = req.body;

    if (!eventId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Etkinlik ve en az bir medya öğesi gereklidir." });
    }

    const insertedList = [];
    for (const item of items) {
      if (!item.mediaUrl) continue;
      const [newMedia] = await db
        .insert(teknofestMedia)
        .values({
          eventId: parseInt(eventId, 10),
          userId: userId,
          categoryId: item.categoryId ? parseInt(item.categoryId, 10) : null,
          mediaType: item.mediaType || (item.mediaUrl.endsWith(".mp4") ? "VIDEO" : "IMAGE"),
          mediaUrl: item.mediaUrl.trim(),
          thumbnailUrl: item.thumbnailUrl?.trim() || null,
          title: item.title?.trim() || "TEKNOFEST Medyası",
          caption: item.caption?.trim() || null,
          altText: item.altText?.trim() || item.title?.trim() || "TEKNOFEST Etkinlik Fotoğrafı",
          credit: item.credit?.trim() || "📷 Genç Sosyal",
          aspectRatio: item.aspectRatio || "4:3",
          duration: item.duration || null,
          isFeatured: Boolean(item.isFeatured),
          moderationStatus: "APPROVED",
          reviewedBy: userId,
          reviewedAt: new Date()
        })
        .returning();
      insertedList.push(newMedia);
    }

    return res.json({
      success: true,
      message: `${insertedList.length} medya başarıyla kaydedildi ve yayınlandı.`,
      data: insertedList
    });
  } catch (error: any) {
    console.error("Admin batch media error:", error);
    return res.status(500).json({ success: false, error: "Toplu medya kaydedilemedi." });
  }
});

/**
 * PUT /api/v1/teknofest/admin/media/:id
 * Admin update existing media metadata
 */
teknofestRouter.put("/admin/media/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Geçersiz ID" });

    const {
      eventId,
      categoryId,
      title,
      caption,
      altText,
      credit,
      aspectRatio,
      isFeatured,
      moderationStatus
    } = req.body;

    const [updated] = await db
      .update(teknofestMedia)
      .set({
        eventId: eventId ? parseInt(eventId, 10) : undefined,
        categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId, 10) : null) : undefined,
        title: title?.trim(),
        caption: caption !== undefined ? caption?.trim() : undefined,
        altText: altText?.trim(),
        credit: credit?.trim(),
        aspectRatio: aspectRatio || undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        moderationStatus: moderationStatus || undefined,
        updatedAt: new Date()
      })
      .where(eq(teknofestMedia.id, id))
      .returning();

    return res.json({ success: true, message: "Medya güncellendi.", data: updated });
  } catch (error) {
    console.error("Admin media update error:", error);
    return res.status(500).json({ success: false, error: "Medya güncellenemedi." });
  }
});

/**
 * DELETE /api/v1/teknofest/admin/media/:id
 * Delete media & cleanup local files
 */
teknofestRouter.delete("/admin/media/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const [media] = await db
      .select()
      .from(teknofestMedia)
      .where(eq(teknofestMedia.id, id))
      .limit(1);

    if (media) {
      // If local uploaded file in /uploads, safely delete from filesystem
      const uploadDir = getUploadDir();
      if (media.mediaUrl && media.mediaUrl.startsWith("/uploads/")) {
        const filename = path.basename(media.mediaUrl);
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      if (media.thumbnailUrl && media.thumbnailUrl.startsWith("/uploads/")) {
        const filename = path.basename(media.thumbnailUrl);
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      await db.delete(teknofestMedia).where(eq(teknofestMedia.id, id));
    }
    return res.json({ success: true, message: "Medya ve dosyalar başarıyla silindi." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Medya silinemedi." });
  }
});

/**
 * POST /api/v1/teknofest/admin/timeline
 * Add timeline item
 */
teknofestRouter.post("/admin/timeline", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { eventId, dateLabel, title, description, icon, sortOrder } = req.body;
    if (!eventId || !dateLabel || !title) {
      return res.status(400).json({ success: false, error: "Zorunlu alanları doldurun." });
    }

    const [item] = await db
      .insert(teknofestTimelineItems)
      .values({
        eventId: parseInt(eventId, 10),
        dateLabel: dateLabel.trim(),
        title: title.trim(),
        description: description?.trim() || null,
        icon: icon || "Sparkles",
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0
      })
      .returning();

    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Zaman tüneli ögesi eklenemedi." });
  }
});

/**
 * DELETE /api/v1/teknofest/admin/timeline/:id
 * Delete timeline item
 */
teknofestRouter.delete("/admin/timeline/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    await db.delete(teknofestTimelineItems).where(eq(teknofestTimelineItems.id, id));
    return res.json({ success: true, message: "Zaman tüneli ögesi silindi." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Öge silinemedi." });
  }
});
