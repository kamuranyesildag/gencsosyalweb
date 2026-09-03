import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import { projectCollaborators, postCollaborators, projects, posts, users, profiles } from "../../src/db/schema.js";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuthContext } from "../middleware/auth.js";
import { notify } from "../utils/notifications.js";
import rateLimit from "express-rate-limit";

export const collaboratorsRouter = Router();

const actionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Çok fazla istek gönderdiniz, lütfen bekleyin." } }
});

collaboratorsRouter.use(requireAuth);
collaboratorsRouter.use(actionLimiter);

// GET /api/v1/collaborators/invites - Get pending invites for current user
collaboratorsRouter.get("/invites", async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = requireAuthContext(req);

    const projectInvites = await db.select({
      id: projectCollaborators.id,
      type: sql<string>`'project'`,
      projectId: projects.id,
      title: projects.title,
      status: projectCollaborators.status,
      createdAt: projectCollaborators.createdAt,
      inviterId: projects.userId,
      inviterUsername: users.username,
      inviterDisplayName: profiles.displayName,
      inviterAvatarUrl: profiles.avatarUrl,
    })
    .from(projectCollaborators)
    .innerJoin(projects, eq(projectCollaborators.projectId, projects.id))
    .innerJoin(users, eq(projects.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(projectCollaborators.userId, currentUserId), eq(projectCollaborators.status, 'pending')));

    const postInvites = await db.select({
      id: postCollaborators.id,
      type: sql<string>`'post'`,
      postId: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      status: postCollaborators.status,
      createdAt: postCollaborators.createdAt,
      inviterId: posts.userId,
      inviterUsername: users.username,
      inviterDisplayName: profiles.displayName,
      inviterAvatarUrl: profiles.avatarUrl,
    })
    .from(postCollaborators)
    .innerJoin(posts, eq(postCollaborators.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(postCollaborators.userId, currentUserId), eq(postCollaborators.status, 'pending')));

    res.json({
      success: true,
      data: {
        projects: projectInvites.map((i: any) => ({...i, type: 'project'})),
        posts: postInvites.map((i: any) => ({...i, type: 'post'}))
      }
    });
  } catch (error) {
    console.error("Error fetching invites:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// PATCH /api/v1/collaborators/invites/:type/:id - Accept or reject invite
collaboratorsRouter.patch("/invites/:type/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = requireAuthContext(req);
    const { type, id } = req.params;
    const inviteId = parseInt(id as string, 10);
    const { status } = req.body; // 'accepted' or 'rejected'
    
    if (isNaN(inviteId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz davet ID." } });
      return;
    }

    if (!['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz durum." } });
      return;
    }

    if (type === 'project') {
      const invite = await db.select().from(projectCollaborators)
        .where(and(eq(projectCollaborators.id, inviteId), eq(projectCollaborators.userId, currentUserId)))
        .limit(1);
      
      if (invite.length === 0) {
        res.status(404).json({ success: false, error: { message: "Davet bulunamadı." } });
        return;
      }
      
      if (invite[0].status !== 'pending') {
        res.status(400).json({ success: false, error: { message: "Bu davet zaten yanıtlanmış." } });
        return;
      }

      await db.update(projectCollaborators)
        .set({ status, updatedAt: new Date() })
        .where(eq(projectCollaborators.id, inviteId));

      const project = await db.select({ userId: projects.userId }).from(projects).where(eq(projects.id, invite[0].projectId)).limit(1);
      if (project.length > 0) {
        await notify(currentUserId, project[0].userId, `project_collaborator_${status}`, undefined, undefined, invite[0].projectId);
      }
      
      res.json({ success: true, data: { status } });
      return;
      
    } else if (type === 'post') {
      const invite = await db.select().from(postCollaborators)
        .where(and(eq(postCollaborators.id, inviteId), eq(postCollaborators.userId, currentUserId)))
        .limit(1);
      
      if (invite.length === 0) {
        res.status(404).json({ success: false, error: { message: "Davet bulunamadı." } });
        return;
      }

      if (invite[0].status !== 'pending') {
        res.status(400).json({ success: false, error: { message: "Bu davet zaten yanıtlanmış." } });
        return;
      }

      await db.update(postCollaborators)
        .set({ status, updatedAt: new Date() })
        .where(eq(postCollaborators.id, inviteId));

      const post = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, invite[0].postId)).limit(1);
      if (post.length > 0) {
        await notify(currentUserId, post[0].userId, `post_collaborator_${status}`, invite[0].postId);
      }
      
      res.json({ success: true, data: { status } });
      return;
    } else {
      res.status(400).json({ success: false, error: { message: "Geçersiz tip." } });
      return;
    }

  } catch (error) {
    console.error("Error responding to invite:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});
