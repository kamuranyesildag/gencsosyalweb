import { Router } from "express";
import { db } from "../../src/db/index.js";
import { communities, communityMembers, posts, users, profiles } from "../../src/db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { paginationSchema } from "../validators/api.js";
import { populatePostStats } from "../utils/postStats.js";
export const communitiesRouter = Router();

communitiesRouter.get("/", optionalAuth, async (req, res) => {
  try {
    const list = await db.select().from(communities).limit(20);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

communitiesRouter.post("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user?.userId || -1;
    const { name, description, slug } = req.body;
    
    const [community] = await db.insert(communities).values({
      name, description, slug, ownerId: currentUserId
    }).returning();
    
    await db.insert(communityMembers).values({
      communityId: community.id,
      userId: currentUserId,
      role: 'admin'
    });
    
    res.status(201).json({ success: true, data: community });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

communitiesRouter.get("/:slug", optionalAuth, async (req, res) => {
  try {
    const slug = req.params.slug as string;
    const [community] = await db.select().from(communities).where(eq(communities.slug, slug)).limit(1);
    
    if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    
    const currentUserId = req.user?.userId || -1;
    const memberRecord = await db.select().from(communityMembers).where(and(eq(communityMembers.communityId, community.id), eq(communityMembers.userId, currentUserId))).limit(1);
    const isMember = memberRecord.length > 0 || community.ownerId === currentUserId;
    const isModerator = community.ownerId === currentUserId || (memberRecord.length > 0 && ['admin', 'OWNER', 'MODERATOR'].includes(memberRecord[0].role));
    
    res.json({ success: true, data: { ...community, isMember, isModerator } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

communitiesRouter.post("/:id/join", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = req.user?.userId || -1;
    
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
    if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    
    await db.insert(communityMembers).values({ communityId, userId: currentUserId, role: 'MEMBER' }).onConflictDoNothing();
    
    res.json({ success: true, data: { message: "Katıldınız." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

communitiesRouter.delete("/:id/leave", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = req.user?.userId || -1;
    
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
    if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    
    if (community.ownerId === currentUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk sahibi ayrılamaz." }});
    }
    
    
    await db.delete(communityMembers).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, currentUserId)));
    
    res.json({ success: true, data: { message: "Ayrıldınız." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});


communitiesRouter.get("/:id/members", optionalAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 50 };
    const offset = (page - 1) * limit;

    const members = await db.select({
      id: communityMembers.userId,
      role: communityMembers.role,
      joinedAt: communityMembers.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      }
    })
    .from(communityMembers)
    .innerJoin(users, eq(communityMembers.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(communityMembers.communityId, communityId))
    .orderBy(desc(communityMembers.createdAt))
    .limit(limit)
    .offset(offset);

    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

communitiesRouter.delete("/:id/members/:targetUserId", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.targetUserId as string);
    const currentUserId = req.user?.userId || -1;

    if (isNaN(communityId) || isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." }});
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi bu bölümden çıkaramazsınız, lütfen ayrılma seçeneğini kullanın." }});
    }

    const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
    if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});

    if (community.ownerId === targetUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk sahibi çıkarılamaz." }});
    }

    // Check permissions
    const currentUserMembership = await db.select().from(communityMembers).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, currentUserId))).limit(1);
    
    const isOwner = community.ownerId === currentUserId;
    const isModerator = currentUserMembership.length > 0 && ['admin', 'OWNER', 'MODERATOR'].includes(currentUserMembership[0].role);

    if (!isOwner && !isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu işlemi yapmak için yetkiniz yok." }});
    }

    const targetMembership = await db.select().from(communityMembers).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId))).limit(1);
    if (targetMembership.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bu topluluğun üyesi değil." }});
    }

    await db.delete(communityMembers).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId)));

    res.json({ success: true, data: { message: "Üye başarıyla çıkarıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

communitiesRouter.get("/:id/posts", optionalAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = req.user?.userId || -1;
    
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
    if (!community) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    
    // Optional: Only members can view posts? Let's just allow it for now or enforce membership.
    // The prompt only requires restricting *creation* to members.

    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const communityPosts = await db.select({
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
      }
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(posts.communityId, communityId), eq(posts.moderationStatus, 'APPROVED')))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

    const formattedPosts = await populatePostStats(communityPosts, currentUserId);
    res.json({ success: true, data: formattedPosts });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
