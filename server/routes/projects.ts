import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import { projects, users, profiles, projectLikes, projectComments, notifications, projectCollaborators } from "../../src/db/schema.js";
import { eq, desc, and, ilike, or, asc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { notify } from "../utils/notifications.js";
import { projectSchema } from "../validators/project.js";

export const projectsRouter = Router();

// GET /api/v1/projects
// Get all public projects with filtering/search
projectsRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, category, status, sort, page = "1", limit = "20" } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;
    
    let conditions = [];
    
    if (category) {
      conditions.push(eq(projects.category, category as string));
    }
    
    if (status) {
      conditions.push(eq(projects.status, status as string));
    }
    
    if (q) {
      const search = `%${q}%`;
      // Convert tags array to text for searching, or just search title and description
      conditions.push(
        or(
          ilike(projects.title, search),
          ilike(projects.description, search),
          sql`${projects.tags}::text ILIKE ${search}`
        )
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const orderClause = sort === 'oldest' ? asc(projects.createdAt) : desc(projects.createdAt);
    
    const totalCountResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(projects)
      .where(whereClause);
    const total = totalCountResult[0]?.count || 0;
    
    const allProjects = await db.select({
      id: projects.id,
      userId: projects.userId,
      title: projects.title,
      description: projects.description,
      category: projects.category,
      status: projects.status,
      projectUrl: projects.projectUrl,
      githubUrl: projects.githubUrl,
      imageUrl: projects.imageUrl,
      tags: projects.tags,
      createdAt: projects.createdAt,
      username: users.username
    })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.id))
    .where(whereClause)
    .orderBy(orderClause)
    .limit(limitNum)
    .offset(offset);
    
    const hasMore = offset + allProjects.length < total;
    
    res.json({
      success: true,
      data: {
        projects: allProjects,
        total,
        page: pageNum,
        hasMore
      }
    });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ error: { message: "Projeler yüklenirken bir hata oluştu." } });
  }
});


// GET /api/v1/projects/:userId
// Get a user's projects
projectsRouter.get("/user/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: { message: "Geçersiz kullanıcı ID'si." } });
      return;
    }

    const userProjects = await db.select({
      id: projects.id,
      userId: projects.userId,
      title: projects.title,
      description: projects.description,
      category: projects.category,
      status: projects.status,
      projectUrl: projects.projectUrl,
      githubUrl: projects.githubUrl,
      imageUrl: projects.imageUrl,
      tags: projects.tags,
      createdAt: projects.createdAt,
      username: users.username
    })
      .from(projects)
      .leftJoin(users, eq(projects.userId, users.id))
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));

    res.json({ success: true, data: { projects: userProjects } });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: { message: "Projeler yüklenirken bir hata oluştu." } });
  }
});


// GET /api/v1/projects/:id
// Get a single project
projectsRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }

    const project = await db.select({
      id: projects.id,
      userId: projects.userId,
      title: projects.title,
      description: projects.description,
      detailedDescription: projects.detailedDescription,
      category: projects.category,
      status: projects.status,
      projectUrl: projects.projectUrl,
      githubUrl: projects.githubUrl,
      imageUrl: projects.imageUrl,
      tags: projects.tags,
      sortOrder: projects.sortOrder,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      username: users.username
    }).from(projects).leftJoin(users, eq(projects.userId, users.id)).where(eq(projects.id, projectId)).limit(1);
    if (project.length === 0) {
      res.status(404).json({ error: { message: "Proje bulunamadı." } });
      return;
    }

    res.json({ success: true, data: { project: project[0] } });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: { message: "Proje yüklenirken bir hata oluştu." } });
  }
});

// POST /api/v1/projects
// Create a new project
projectsRouter.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: (parsed.error as any).errors[0].message } });
      return;
    }

    const data = parsed.data;
    
    // Additional validation for URL protocols to prevent XSS
    const isValidUrl = (url: string | undefined) => {
      if (!url) return true;
      try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    };

    if (!isValidUrl(data.projectUrl) || !isValidUrl(data.githubUrl) || !isValidUrl(data.imageUrl)) {
      res.status(400).json({ error: { message: "Yalnızca http:// ve https:// bağlantılarına izin verilmektedir." } });
      return;
    }

    // Clean up tags
    const cleanedTags = Array.from(new Set(
      (data.tags || []).map(t => t.trim()).filter(t => t.length > 0 && t.length <= 30)
    )).slice(0, 10);

    const newProject = await db.insert(projects).values({
      userId: req.user!.userId,
      title: data.title,
      description: data.description,
      detailedDescription: data.detailedDescription || null,
      category: data.category,
      status: data.status,
      projectUrl: data.projectUrl || null,
      githubUrl: data.githubUrl || null,
      imageUrl: data.imageUrl || null,
      tags: cleanedTags,
    }).returning();

    res.status(201).json({ success: true, data: { project: newProject[0] } });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: { message: "Proje oluşturulurken bir hata oluştu." } });
  }
});

// PATCH /api/v1/projects/:id
// Edit a project
projectsRouter.patch("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }

    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: (parsed.error as any).errors[0].message } });
      return;
    }

    const data = parsed.data;

    // Check ownership
    const existing = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: { message: "Proje bulunamadı." } });
      return;
    }
    
    if (existing[0].userId !== req.user!.userId) {
      res.status(403).json({ error: { message: "Bu projeyi düzenleme yetkiniz yok." } });
      return;
    }
    
    // Additional validation for URL protocols to prevent XSS
    const isValidUrl = (url: string | undefined) => {
      if (!url) return true;
      try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    };

    if (!isValidUrl(data.projectUrl) || !isValidUrl(data.githubUrl) || !isValidUrl(data.imageUrl)) {
      res.status(400).json({ error: { message: "Yalnızca http:// ve https:// bağlantılarına izin verilmektedir." } });
      return;
    }

    // Clean up tags
    const cleanedTags = Array.from(new Set(
      (data.tags || []).map(t => t.trim()).filter(t => t.length > 0 && t.length <= 30)
    )).slice(0, 10);

    const updated = await db.update(projects).set({
      title: data.title,
      description: data.description,
      detailedDescription: data.detailedDescription || null,
      category: data.category,
      status: data.status,
      projectUrl: data.projectUrl || null,
      githubUrl: data.githubUrl || null,
      imageUrl: data.imageUrl || null,
      tags: cleanedTags,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

    res.json({ success: true, data: { project: updated[0] } });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: { message: "Proje güncellenirken bir hata oluştu." } });
  }
});

// DELETE /api/v1/projects/:id
// Delete a project
projectsRouter.delete("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }

    // Check ownership
    const existing = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: { message: "Proje bulunamadı." } });
      return;
    }
    
    if (existing[0].userId !== req.user!.userId) {
      res.status(403).json({ error: { message: "Bu projeyi silme yetkiniz yok." } });
      return;
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    res.json({ success: true, data: { message: "Proje silindi." } });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: { message: "Proje silinirken bir hata oluştu." } });
  }
});



// --- PROJECT LIKES ---

// GET /api/v1/projects/:id/like
// Check if user liked a project and get total likes
projectsRouter.get("/:id/like", async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }

    const likesCountResult = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(projectLikes)
      .where(eq(projectLikes.projectId, projectId));
    const totalLikes = likesCountResult[0].count;

    let hasLiked = false;
    
    // Attempt to get user from auth middleware (might need optional auth here, but assuming required or checking token)
    // Actually we don't have optional auth middleware easily accessible, so we rely on token in header if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Very basic check, proper way is to use a middleware, but let's just use requireAuth on POST instead
      // If we want to check hasLiked, we can extract it from the DB if we know user ID
      // Let's decode token manually or just assume frontend will fetch hasLiked securely or we use requireAuth
      // Since it's a GET, maybe we just return totalLikes for now, frontend handles auth?
      // No, we need userId. Let's just import jsonwebtoken and verify if we can, or just return total likes.
    }
    
    // We'll return just totalLikes for the public endpoint, frontend can determine hasLiked if we return the list of likes, 
    // or we just make a dedicated authenticated endpoint.
    // Let's return all likes' userIds, it's a small app.
    const likesList = await db.select({ userId: projectLikes.userId })
      .from(projectLikes)
      .where(eq(projectLikes.projectId, projectId));
    
    res.json({ success: true, data: { totalLikes, likes: likesList } });
  } catch (error) {
    console.error("Error fetching project likes:", error);
    res.status(500).json({ error: { message: "Beğeniler yüklenirken bir hata oluştu." } });
  }
});

// POST /api/v1/projects/:id/like
// Like a project
projectsRouter.post("/:id/like", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }
    
    const userId = req.user!.userId;

    // Check if project exists
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (project.length === 0) {
      res.status(404).json({ error: { message: "Proje bulunamadı." } });
      return;
    }

    // Check if already liked
    const existing = await db.select().from(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId))).limit(1);
      
    if (existing.length === 0) {
      try {
        await db.insert(projectLikes).values({ projectId, userId });
      } catch (err: any) {
        // Ignore unique constraint violation if they double-clicked
        if (err.code !== '23505') throw err;
      }
      
      // Create notification
      if (project[0].userId !== userId) {
        await db.insert(notifications).values({
          recipientId: project[0].userId,
          actorId: userId,
          type: 'project_like',
          projectId: projectId,
        });
      }
    }
    
    res.json({ success: true, data: { message: "Proje beğenildi." } });
  } catch (error) {
    console.error("Error liking project:", error);
    res.status(500).json({ error: { message: "İşlem sırasında bir hata oluştu." } });
  }
});

// DELETE /api/v1/projects/:id/like
// Unlike a project
projectsRouter.delete("/:id/like", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }
    
    const userId = req.user!.userId;
    
    await db.delete(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));
      
    res.json({ success: true, data: { message: "Beğeni kaldırıldı." } });
  } catch (error) {
    console.error("Error unliking project:", error);
    res.status(500).json({ error: { message: "İşlem sırasında bir hata oluştu." } });
  }
});

// --- PROJECT COMMENTS ---

// GET /api/v1/projects/:id/comments
// Get comments for a project
projectsRouter.get("/:id/comments", async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }

    const commentsList = await db.select({
      id: projectComments.id,
      content: projectComments.content,
      createdAt: projectComments.createdAt,
      userId: users.id,
      username: users.username,
      avatarUrl: profiles.avatarUrl,
      fullName: profiles.displayName
    })
    .from(projectComments)
    .innerJoin(users, eq(projectComments.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(projectComments.projectId, projectId))
    .orderBy(asc(projectComments.createdAt));

    res.json({ success: true, data: { comments: commentsList } });
  } catch (error) {
    console.error("Error fetching project comments:", error);
    res.status(500).json({ error: { message: "Yorumlar yüklenirken bir hata oluştu." } });
  }
});

// POST /api/v1/projects/:id/comments
// Add a comment
projectsRouter.post("/:id/comments", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz proje ID'si." } });
      return;
    }
    
    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: { message: "Yorum içeriği boş olamaz." } });
      return;
    }

    if (content.trim().length > 2000) {
      res.status(400).json({ error: { message: "Yorum en fazla 2000 karakter olabilir." } });
      return;
    }
    
    const userId = req.user!.userId;

    // Check if project exists
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (project.length === 0) {
      res.status(404).json({ error: { message: "Proje bulunamadı." } });
      return;
    }

    const newComment = await db.insert(projectComments).values({
      projectId,
      userId,
      content: content.trim()
    }).returning();
    
    // Create notification
    if (project[0].userId !== userId) {
      await db.insert(notifications).values({
        recipientId: project[0].userId,
        actorId: userId,
        type: 'project_comment',
        projectId: projectId,
        // we can reuse commentId if we alter notifications but we don't have projectCommentId, so we just pass projectId
      });
    }

    // Get user details to return with comment
    const user = await db.select({
      username: users.username,
      avatarUrl: profiles.avatarUrl,
      fullName: profiles.displayName
    }).from(users).leftJoin(profiles, eq(users.id, profiles.userId)).where(eq(users.id, userId)).limit(1);

    const commentData = {
      id: newComment[0].id,
      content: newComment[0].content,
      createdAt: newComment[0].createdAt,
      userId: userId,
      username: user[0].username,
      avatarUrl: user[0].avatarUrl,
      fullName: user[0].fullName
    };

    res.status(201).json({ success: true, data: { comment: commentData } });
  } catch (error) {
    console.error("Error adding project comment:", error);
    res.status(500).json({ error: { message: "Yorum eklenirken bir hata oluştu." } });
  }
});

// DELETE /api/v1/projects/:id/comments/:commentId
// Delete a comment
projectsRouter.delete("/:id/comments/:commentId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    const commentId = parseInt(req.params.commentId as string, 10);
    
    if (isNaN(projectId) || isNaN(commentId)) {
      res.status(400).json({ error: { message: "Geçersiz ID." } });
      return;
    }
    
    const userId = req.user!.userId;
    
    // Check if comment exists and belongs to user
    const comment = await db.select().from(projectComments)
      .where(and(eq(projectComments.id, commentId), eq(projectComments.projectId, projectId)))
      .limit(1);
      
    if (comment.length === 0) {
      res.status(404).json({ error: { message: "Yorum bulunamadı." } });
      return;
    }
    
    // IDOR protection: only comment author can delete
    if (comment[0].userId !== userId) {
      res.status(403).json({ error: { message: "Bu yorumu silme yetkiniz yok." } });
      return;
    }
    
    await db.delete(projectComments).where(eq(projectComments.id, commentId));
      
    res.json({ success: true, data: { message: "Yorum silindi." } });
  } catch (error) {
    console.error("Error deleting project comment:", error);
    res.status(500).json({ error: { message: "İşlem sırasında bir hata oluştu." } });
  }
});


// POST /api/v1/projects/:id/collaborators
projectsRouter.post("/:id/collaborators", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    const { targetUserId } = req.body;
    
    if (isNaN(projectId) || typeof targetUserId !== 'number') {
      res.status(400).json({ error: { message: "Geçersiz veriler." } });
      return;
    }
    
    const currentUserId = req.user!.userId;
    
    if (targetUserId === currentUserId) {
      res.status(400).json({ error: { message: "Kendinizi ortak üretici olarak ekleyemezsiniz." } });
      return;
    }

    // Check project ownership
    const proj = await db.select({ userId: projects.userId }).from(projects).where(eq(projects.id, projectId)).limit(1);
    if (proj.length === 0) {
      res.status(404).json({ error: { message: "Proje bulunamadı." } });
      return;
    }
    if (proj[0].userId !== currentUserId) {
      res.status(403).json({ error: { message: "Bu işlem için yetkiniz yok." } });
      return;
    }

    // Check if target user exists
    const target = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (target.length === 0) {
      res.status(404).json({ error: { message: "Kullanıcı bulunamadı." } });
      return;
    }

    // Check if already a collaborator or invited
    const existing = await db.select().from(projectCollaborators)
      .where(and(eq(projectCollaborators.projectId, projectId), eq(projectCollaborators.userId, targetUserId)))
      .limit(1);
      
    if (existing.length > 0) {
      if (existing[0].status === 'pending') {
        res.status(400).json({ error: { message: "Bu kullanıcıya zaten davet gönderilmiş." } });
        return;
      } else if (existing[0].status === 'accepted') {
        res.status(400).json({ error: { message: "Bu kullanıcı zaten ortak üretici." } });
        return;
      } else {
        // Re-invite by updating status to pending
        await db.update(projectCollaborators)
          .set({ status: 'pending', updatedAt: new Date() })
          .where(eq(projectCollaborators.id, existing[0].id));
      }
    } else {
      await db.insert(projectCollaborators).values({
        projectId,
        userId: targetUserId,
        status: 'pending'
      });
    }

    await notify(currentUserId, targetUserId, 'project_collaborator_invite', undefined, undefined, projectId);
    
    res.json({ success: true, message: "Davet gönderildi." });
  } catch (error) {
    console.error("Invite collaborator error:", error);
    res.status(500).json({ error: { message: "Sunucu hatası." } });
  }
});

// DELETE /api/v1/projects/:id/collaborators/:userId
projectsRouter.delete("/:id/collaborators/:userId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    const targetUserId = parseInt(req.params.userId as string, 10);
    
    if (isNaN(projectId) || isNaN(targetUserId)) {
      res.status(400).json({ error: { message: "Geçersiz ID." } });
      return;
    }
    
    const currentUserId = req.user!.userId;
    
    const proj = await db.select({ userId: projects.userId }).from(projects).where(eq(projects.id, projectId)).limit(1);
    if (proj.length === 0) {
      res.status(404).json({ error: { message: "Proje bulunamadı." } });
      return;
    }
    
    // Only project owner OR the collaborator themselves can remove
    if (proj[0].userId !== currentUserId && currentUserId !== targetUserId) {
      res.status(403).json({ error: { message: "Bu işlem için yetkiniz yok." } });
      return;
    }

    await db.delete(projectCollaborators)
      .where(and(eq(projectCollaborators.projectId, projectId), eq(projectCollaborators.userId, targetUserId)));
      
    res.json({ success: true, message: "Ortak üretici kaldırıldı." });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    res.status(500).json({ error: { message: "Sunucu hatası." } });
  }
});

// GET /api/v1/projects/:id/collaborators
projectsRouter.get("/:id/collaborators", async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ error: { message: "Geçersiz ID." } });
      return;
    }
    
    const list = await db.select({
      userId: users.id,
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      status: projectCollaborators.status,
    })
    .from(projectCollaborators)
    .innerJoin(users, eq(projectCollaborators.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(
      eq(projectCollaborators.projectId, projectId),
      or(eq(projectCollaborators.status, 'accepted'), eq(projectCollaborators.status, 'pending'))
    ));
    
    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Get project collaborators error:", error);
    res.status(500).json({ error: { message: "Sunucu hatası." } });
  }
});
