import { Router } from "express";
import { db } from "../../src/db/index.js";
import { 
  communities, 
  communityMembers, 
  communityJoinRequests, 
  communityAuditLogs, 
  posts, 
  users, 
  profiles, 
  notifications 
} from "../../src/db/schema.js";
import { eq, and, desc, asc, isNull, sql, or, ilike, inArray } from "drizzle-orm";
import { requireAuth, requireAuthContext, optionalAuth, optionalAuthContext } from "../middleware/auth.js";
import { paginationSchema } from "../validators/api.js";
import { populatePostStats } from "../utils/postStats.js";
import { getBlockedIds } from "../utils/blocks.js";

export const communitiesRouter = Router();

/**
 * Helper to check community role for a user
 */
async function getCommunityRole(communityId: number, userId: number, ownerId: number) {
  if (userId === ownerId) {
    return { isOwner: true, isModerator: true, isMember: true, role: 'OWNER' };
  }
  const memberRecord = await db
    .select()
    .from(communityMembers)
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)))
    .limit(1);

  if (memberRecord.length === 0) {
    return { isOwner: false, isModerator: false, isMember: false, role: null };
  }

  const role = memberRecord[0].role;
  const isMod = ['admin', 'OWNER', 'MODERATOR'].includes(role);
  return { isOwner: role === 'OWNER', isModerator: isMod, isMember: true, role };
}

/**
 * GET / - List active communities
 */
communitiesRouter.get("/", optionalAuth, async (req, res) => {
  try {
    const currentUserId = optionalAuthContext(req);
    const searchQuery = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 30 };
    const offset = (page - 1) * limit;

    const conditions = [isNull(communities.deletedAt)];

    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim().toLowerCase()}%`;
      conditions.push(or(
        ilike(communities.name, q),
        ilike(communities.slug, q),
        ilike(communities.description, q)
      )!);
    }

    if (category.trim() && category !== "Tümü") {
      conditions.push(eq(communities.category, category.trim()));
    }

    const list = await db
      .select({
        id: communities.id,
        name: communities.name,
        slug: communities.slug,
        description: communities.description,
        avatarUrl: communities.avatarUrl,
        coverUrl: communities.coverUrl,
        category: communities.category,
        isPrivate: communities.isPrivate,
        ownerId: communities.ownerId,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
        memberCount: sql<number>`(SELECT count(*)::int FROM ${communityMembers} WHERE ${communityMembers.communityId} = ${communities.id})`,
        postCount: sql<number>`(SELECT count(*)::int FROM ${posts} WHERE ${posts.communityId} = ${communities.id} AND ${posts.moderationStatus} = 'APPROVED')`,
      })
      .from(communities)
      .where(and(...conditions))
      .orderBy(desc(communities.createdAt))
      .limit(limit)
      .offset(offset);

    // If user is authenticated, determine membership status
    let enrichedList = list;
    if (currentUserId && currentUserId !== -1) {
      const userMemberships = await db
        .select({ communityId: communityMembers.communityId, role: communityMembers.role })
        .from(communityMembers)
        .where(eq(communityMembers.userId, currentUserId));

      const memberMap = new Map(userMemberships.map((m: any) => [m.communityId, m.role]));

      enrichedList = list.map((c: any) => {
        const role = c.ownerId === currentUserId ? 'OWNER' : memberMap.get(c.id) || null;
        return {
          ...c,
          isMember: !!role,
          role,
          isOwner: c.ownerId === currentUserId,
          isModerator: c.ownerId === currentUserId || (role ? ['admin', 'OWNER', 'MODERATOR'].includes(role as string) : false),
        };
      });
    }

    res.json({ success: true, data: enrichedList });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * POST / - Create a community
 */
communitiesRouter.post("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const { name, description, slug, category, isPrivate, rules, avatarUrl, coverUrl } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Topluluk adı en az 3 karakter olmalıdır." }});
    }

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçerli bir slug gereklidir." }});
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanSlug.length < 3) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Slug en az 3 alfanümerik karakter olmalıdır." }});
    }

    // Check slug collision
    const existing = await db
      .select({ id: communities.id })
      .from(communities)
      .where(and(eq(communities.slug, cleanSlug), isNull(communities.deletedAt)))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Bu topluluk adresi (slug) zaten kullanımda." }});
    }

    const [community] = await db
      .insert(communities)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        slug: cleanSlug,
        category: category?.trim() || "Genel",
        isPrivate: Boolean(isPrivate),
        rules: rules?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        coverUrl: coverUrl?.trim() || null,
        ownerId: currentUserId,
      })
      .returning();

    // Owner automatically added as member with 'OWNER' role
    await db.insert(communityMembers).values({
      communityId: community.id,
      userId: currentUserId,
      role: 'OWNER',
    }).onConflictDoNothing();

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId: community.id,
      actorId: currentUserId,
      action: 'COMMUNITY_CREATED',
      details: `Topluluk oluşturuldu: ${community.name}`,
    });

    res.status(201).json({ success: true, data: { ...community, isMember: true, isOwner: true, isModerator: true, role: 'OWNER', memberCount: 1 } });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Topluluk oluşturulurken hata meydana geldi." }});
  }
});

/**
 * GET /:slug - Get community detail
 */
communitiesRouter.get("/:slug", optionalAuth, async (req, res) => {
  try {
    const slug = req.params.slug as string;
    const currentUserId = optionalAuthContext(req);

    const [community] = await db
      .select({
        id: communities.id,
        name: communities.name,
        slug: communities.slug,
        description: communities.description,
        avatarUrl: communities.avatarUrl,
        coverUrl: communities.coverUrl,
        category: communities.category,
        isPrivate: communities.isPrivate,
        rules: communities.rules,
        ownerId: communities.ownerId,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
        owner: {
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        }
      })
      .from(communities)
      .innerJoin(users, eq(communities.ownerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(communities.slug, slug), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı veya silinmiş." }});
    }

    // Check blocks
    if (currentUserId && currentUserId !== -1) {
      const blockedIds = await getBlockedIds(currentUserId);
      if (blockedIds.includes(community.ownerId)) {
        return res.status(403).json({ success: false, error: { code: "BLOCKED", message: "Bu topluluğa erişiminiz kısıtlanmıştır." }});
      }
    }

    // Get counts
    const [memberCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communityMembers)
      .where(eq(communityMembers.communityId, community.id));

    const [postCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(and(eq(posts.communityId, community.id), eq(posts.moderationStatus, 'APPROVED')));

    let isMember = false;
    let isOwner = false;
    let isModerator = false;
    let role: string | null = null;
    let hasPendingRequest = false;

    if (currentUserId && currentUserId !== -1) {
      const roleInfo = await getCommunityRole(community.id, currentUserId, community.ownerId);
      isMember = roleInfo.isMember;
      isOwner = roleInfo.isOwner;
      isModerator = roleInfo.isModerator;
      role = roleInfo.role;

      if (!isMember && community.isPrivate) {
        const [pendingReq] = await db
          .select({ id: communityJoinRequests.id })
          .from(communityJoinRequests)
          .where(and(
            eq(communityJoinRequests.communityId, community.id),
            eq(communityJoinRequests.userId, currentUserId),
            eq(communityJoinRequests.status, 'PENDING')
          ))
          .limit(1);
        hasPendingRequest = !!pendingReq;
      }
    }

    res.json({
      success: true,
      data: {
        ...community,
        memberCount: memberCountRes?.count || 0,
        postCount: postCountRes?.count || 0,
        isMember,
        isOwner,
        isModerator,
        role,
        hasPendingRequest,
      }
    });
  } catch (error) {
    console.error("Error fetching community by slug:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * PUT /:id - Update community settings (Owner only)
 */
communitiesRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // Role check: Only Owner can edit settings
    if (community.ownerId !== currentUserId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Topluluk ayarlarını yalnızca topluluk kurucusu düzenleyebilir." }});
    }

    const { name, description, category, isPrivate, rules, avatarUrl, coverUrl } = req.body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (!name || name.trim().length < 3) {
        return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Topluluk adı en az 3 karakter olmalıdır." }});
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) updateData.description = description?.trim() || null;
    if (category !== undefined) updateData.category = category?.trim() || "Genel";
    if (isPrivate !== undefined) updateData.isPrivate = Boolean(isPrivate);
    if (rules !== undefined) updateData.rules = rules?.trim() || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl?.trim() || null;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl?.trim() || null;

    const [updated] = await db
      .update(communities)
      .set(updateData)
      .where(eq(communities.id, communityId))
      .returning();

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      action: 'SETTINGS_UPDATED',
      details: 'Topluluk ayarları güncellendi.',
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating community:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * DELETE /:id - Soft-delete community (Owner only)
 */
communitiesRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // Role check: Only Owner can delete community
    if (community.ownerId !== currentUserId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Topluluğu yalnızca topluluk kurucusu silebilir." }});
    }

    // Safe Soft Delete
    await db
      .update(communities)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(communities.id, communityId));

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      action: 'COMMUNITY_DELETED',
      details: `Topluluk silindi (soft delete): ${community.name}`,
    });

    res.json({ success: true, data: { message: "Topluluk başarıyla silindi." }});
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * POST /:id/join - Join or request to join community
 */
communitiesRouter.post("/:id/join", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // Check blocks
    const blockedIds = await getBlockedIds(currentUserId);
    if (blockedIds.includes(community.ownerId)) {
      return res.status(403).json({ success: false, error: { code: "BLOCKED", message: "Bu topluluğa katılamazsınız." }});
    }

    // Check if already a member
    const [existingMember] = await db
      .select()
      .from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, currentUserId)))
      .limit(1);

    if (existingMember || community.ownerId === currentUserId) {
      return res.status(400).json({ success: false, error: { code: "ALREADY_MEMBER", message: "Zaten bu topluluğun üyesisiniz." }});
    }

    // If private community -> Create Join Request
    if (community.isPrivate) {
      // Check if already requested
      const [existingRequest] = await db
        .select()
        .from(communityJoinRequests)
        .where(and(eq(communityJoinRequests.communityId, communityId), eq(communityJoinRequests.userId, currentUserId)))
        .limit(1);

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          return res.status(400).json({ success: false, error: { code: "ALREADY_REQUESTED", message: "Zaten bekleyen bir katılım isteğiniz bulunmaktadır." }});
        } else if (existingRequest.status === 'REJECTED') {
          // Allow re-requesting if rejected
          await db
            .update(communityJoinRequests)
            .set({ status: 'PENDING', updatedAt: new Date() })
            .where(eq(communityJoinRequests.id, existingRequest.id));
        }
      } else {
        await db.insert(communityJoinRequests).values({
          communityId,
          userId: currentUserId,
          status: 'PENDING',
          note: req.body.note || null,
        });
      }

      // Notify owner & moderators
      const mods = await db
        .select({ userId: communityMembers.userId })
        .from(communityMembers)
        .where(and(
          eq(communityMembers.communityId, communityId),
          inArray(communityMembers.role, ['OWNER', 'MODERATOR', 'admin'])
        ));

      const notifyUserIds = new Set<number>([community.ownerId, ...mods.map((m: any) => m.userId)]);
      notifyUserIds.delete(currentUserId);

      for (const targetId of notifyUserIds) {
        await db.insert(notifications).values({
          recipientId: targetId,
          actorId: currentUserId,
          type: 'community_join_request',
          communityId,
        });
      }

      return res.json({
        success: true,
        data: {
          status: 'PENDING',
          message: "Katılım isteğiniz topluluk yöneticilerine iletildi."
        }
      });
    }

    // Public community -> Immediate join
    await db.insert(communityMembers).values({
      communityId,
      userId: currentUserId,
      role: 'MEMBER',
    }).onConflictDoNothing();

    res.json({
      success: true,
      data: {
        status: 'JOINED',
        message: "Topluluğa katıldınız."
      }
    });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * DELETE /:id/leave - Leave community
 */
communitiesRouter.delete("/:id/leave", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // OWNER departure rule: Owner cannot simply leave
    if (community.ownerId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "OWNER_CANNOT_LEAVE",
          message: "Topluluk kurucusu topluluktan ayrılamaz. Lütfen önce topluluk sahipliğini başka bir üyeye devredin veya topluluğu silin."
        }
      });
    }

    // Check membership
    const [membership] = await db
      .select()
      .from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, currentUserId)))
      .limit(1);

    if (!membership) {
      return res.status(400).json({ success: false, error: { code: "NOT_MEMBER", message: "Bu topluluğun üyesi değilsiniz." }});
    }

    await db
      .delete(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, currentUserId)));

    // Also remove any pending join requests
    await db
      .delete(communityJoinRequests)
      .where(and(eq(communityJoinRequests.communityId, communityId), eq(communityJoinRequests.userId, currentUserId)));

    res.json({ success: true, data: { message: "Topluluktan başarıyla ayrıldınız." }});
  } catch (error) {
    console.error("Error leaving community:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * POST /:id/transfer-ownership - Transfer ownership to another member (Owner only)
 */
communitiesRouter.post("/:id/transfer-ownership", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    const { newOwnerId } = req.body;

    if (isNaN(communityId) || !newOwnerId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." }});
    }

    const targetUserId = parseInt(newOwnerId);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz hedef kullanıcı ID." }});
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Sahipliği kendinize devredemezsiniz." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // Role check: Only current Owner can transfer ownership
    if (community.ownerId !== currentUserId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Sahipliği devretme yetkisi yalnızca topluluk kurucusuna aittir." }});
    }

    // Verify target user is an existing member
    const [targetMembership] = await db
      .select()
      .from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId)))
      .limit(1);

    if (!targetMembership) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Sahiplik yalnızca mevcut bir topluluk üyesine devredilebilir." }});
    }

    // Transfer ownership
    await db
      .update(communities)
      .set({ ownerId: targetUserId, updatedAt: new Date() })
      .where(eq(communities.id, communityId));

    // Update old owner to MEMBER role
    await db
      .update(communityMembers)
      .set({ role: 'MEMBER' })
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, currentUserId)));

    // Update new owner to OWNER role
    await db
      .update(communityMembers)
      .set({ role: 'OWNER' })
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId)));

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      targetUserId,
      action: 'OWNERSHIP_TRANSFERRED',
      details: `Topluluk sahipliği devredildi: ${targetUserId}`,
    });

    // Send notification to new owner
    await db.insert(notifications).values({
      recipientId: targetUserId,
      actorId: currentUserId,
      type: 'community_role_updated',
      communityId,
    });

    res.json({ success: true, data: { message: "Topluluk sahipliği başarıyla devredildi." }});
  } catch (error) {
    console.error("Error transferring ownership:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * GET /:id/members - List community members
 */
communitiesRouter.get("/:id/members", optionalAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const searchQuery = (req.query.search as string) || "";
    const roleFilter = (req.query.role as string) || "";
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 50 };
    const offset = (page - 1) * limit;

    const conditions = [eq(communityMembers.communityId, communityId)];

    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim().toLowerCase()}%`;
      conditions.push(or(
        ilike(users.username, q),
        ilike(profiles.displayName, q)
      )!);
    }

    if (roleFilter && ['OWNER', 'MODERATOR', 'MEMBER'].includes(roleFilter)) {
      if (roleFilter === 'MODERATOR') {
        conditions.push(inArray(communityMembers.role, ['MODERATOR', 'admin']));
      } else {
        conditions.push(eq(communityMembers.role, roleFilter));
      }
    }

    const members = await db
      .select({
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
      .where(and(...conditions))
      .orderBy(
        // Order: OWNER first, then MODERATOR, then MEMBER
        sql`CASE WHEN ${communityMembers.role} IN ('OWNER', 'admin') THEN 1 WHEN ${communityMembers.role} = 'MODERATOR' THEN 2 ELSE 3 END`,
        desc(communityMembers.createdAt)
      )
      .limit(limit)
      .offset(offset);

    res.json({ success: true, data: members });
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * DELETE /:id/members/:targetUserId - Remove member (Owner or Moderator)
 */
communitiesRouter.delete("/:id/members/:targetUserId", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.targetUserId as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId) || isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." }});
    }

    // User cannot kick self via this endpoint
    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi bu bölümden çıkaramazsınız, lütfen topluluktan ayrılma seçeneğini kullanın." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // Owner cannot be removed
    if (community.ownerId === targetUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk kurucusu topluluktan çıkarılamaz." }});
    }

    // Check operator's permissions
    const operatorRole = await getCommunityRole(communityId, currentUserId, community.ownerId);
    if (!operatorRole.isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu işlemi yapmak için yönetici veya kurucu yetkisine sahip olmalısınız." }});
    }

    // Check target's membership
    const [targetMembership] = await db
      .select()
      .from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId)))
      .limit(1);

    if (!targetMembership) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bu topluluğun üyesi değil." }});
    }

    // Moderator cannot remove another Moderator or Owner
    const isTargetMod = ['admin', 'OWNER', 'MODERATOR'].includes(targetMembership.role);
    if (isTargetMod && !operatorRole.isOwner) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yöneticileri yalnızca topluluk kurucusu çıkarabilir." }});
    }

    // Delete membership
    await db
      .delete(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId)));

    // Delete any pending requests
    await db
      .delete(communityJoinRequests)
      .where(and(eq(communityJoinRequests.communityId, communityId), eq(communityJoinRequests.userId, targetUserId)));

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      targetUserId,
      action: 'MEMBER_REMOVED',
      details: 'Üye topluluktan çıkarıldı.',
    });

    // Notify kicked member
    await db.insert(notifications).values({
      recipientId: targetUserId,
      actorId: currentUserId,
      type: 'community_removed',
      communityId,
    });

    res.json({ success: true, data: { message: "Üye başarıyla çıkarıldı." }});
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * PUT /:id/members/:targetUserId/role - Promote or Demote Admin/Moderator (Owner only)
 */
communitiesRouter.put("/:id/members/:targetUserId/role", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.targetUserId as string);
    const currentUserId = requireAuthContext(req);
    const { role } = req.body;

    if (isNaN(communityId) || isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." }});
    }

    if (!role || !['MODERATOR', 'MEMBER'].includes(role)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Rol 'MODERATOR' veya 'MEMBER' olmalıdır." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // Role Escalation Security: Only Owner can assign or remove moderators
    if (community.ownerId !== currentUserId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yönetici atama ve kaldırma yetkisi yalnızca topluluk kurucusuna aittir." }});
    }

    // Owner cannot change their own role here
    if (targetUserId === community.ownerId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Topluluk kurucusunun rolü bu alandan değiştirilemez." }});
    }

    const [targetMembership] = await db
      .select()
      .from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId)))
      .limit(1);

    if (!targetMembership) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bu topluluğun üyesi değil." }});
    }

    await db
      .update(communityMembers)
      .set({ role })
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, targetUserId)));

    // Audit log
    const action = role === 'MODERATOR' ? 'ADMIN_ADDED' : 'ADMIN_REMOVED';
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      targetUserId,
      action,
      details: role === 'MODERATOR' ? 'Yönetici olarak atandı.' : 'Yöneticilik yetkisi kaldırıldı.',
    });

    // Notify target user
    await db.insert(notifications).values({
      recipientId: targetUserId,
      actorId: currentUserId,
      type: 'community_role_updated',
      communityId,
    });

    res.json({
      success: true,
      data: {
        message: role === 'MODERATOR' ? "Kullanıcı yönetici olarak atandı." : "Kullanıcının yöneticilik yetkisi kaldırıldı.",
        role
      }
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * GET /:id/requests - List pending join requests (Owner or Moderator only)
 */
communitiesRouter.get("/:id/requests", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
    if (!roleInfo.isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Katılım isteklerini yalnızca yöneticiler görüntüleyebilir." }});
    }

    const requests = await db
      .select({
        id: communityJoinRequests.id,
        status: communityJoinRequests.status,
        note: communityJoinRequests.note,
        createdAt: communityJoinRequests.createdAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        }
      })
      .from(communityJoinRequests)
      .innerJoin(users, eq(communityJoinRequests.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(
        eq(communityJoinRequests.communityId, communityId),
        eq(communityJoinRequests.status, 'PENDING')
      ))
      .orderBy(desc(communityJoinRequests.createdAt));

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * POST /:id/requests/:requestId/accept - Accept join request (Owner or Moderator)
 */
communitiesRouter.post("/:id/requests/:requestId/accept", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const requestId = parseInt(req.params.requestId as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId) || isNaN(requestId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
    if (!roleInfo.isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu işlemi yapmak için yetkiniz yok." }});
    }

    const [request] = await db
      .select()
      .from(communityJoinRequests)
      .where(and(
        eq(communityJoinRequests.id, requestId),
        eq(communityJoinRequests.communityId, communityId),
        eq(communityJoinRequests.status, 'PENDING')
      ))
      .limit(1);

    if (!request) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Bekleyen katılım isteği bulunamadı." }});
    }

    // Add user as member
    await db.insert(communityMembers).values({
      communityId,
      userId: request.userId,
      role: 'MEMBER',
    }).onConflictDoNothing();

    // Mark request as ACCEPTED
    await db
      .update(communityJoinRequests)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(communityJoinRequests.id, requestId));

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      targetUserId: request.userId,
      action: 'REQUEST_ACCEPTED',
      details: 'Katılım isteği onaylandı.',
    });

    // Notify user
    await db.insert(notifications).values({
      recipientId: request.userId,
      actorId: currentUserId,
      type: 'community_request_accepted',
      communityId,
    });

    res.json({ success: true, data: { message: "Katılım isteği onaylandı." }});
  } catch (error) {
    console.error("Error accepting join request:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * POST /:id/requests/:requestId/reject - Reject join request (Owner or Moderator)
 */
communitiesRouter.post("/:id/requests/:requestId/reject", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const requestId = parseInt(req.params.requestId as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId) || isNaN(requestId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
    if (!roleInfo.isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu işlemi yapmak için yetkiniz yok." }});
    }

    const [request] = await db
      .select()
      .from(communityJoinRequests)
      .where(and(
        eq(communityJoinRequests.id, requestId),
        eq(communityJoinRequests.communityId, communityId),
        eq(communityJoinRequests.status, 'PENDING')
      ))
      .limit(1);

    if (!request) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Bekleyen katılım isteği bulunamadı." }});
    }

    // Mark request as REJECTED
    await db
      .update(communityJoinRequests)
      .set({ status: 'REJECTED', updatedAt: new Date() })
      .where(eq(communityJoinRequests.id, requestId));

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      targetUserId: request.userId,
      action: 'REQUEST_REJECTED',
      details: 'Katılım isteği reddedildi.',
    });

    // Notify user
    await db.insert(notifications).values({
      recipientId: request.userId,
      actorId: currentUserId,
      type: 'community_request_rejected',
      communityId,
    });

    res.json({ success: true, data: { message: "Katılım isteği reddedildi." }});
  } catch (error) {
    console.error("Error rejecting join request:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * GET /:id/stats - Metrics for community management dashboard
 */
communitiesRouter.get("/:id/stats", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
    if (!roleInfo.isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Topluluk istatistiklerini yalnızca yöneticiler görebilir." }});
    }

    const [memberCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communityMembers)
      .where(eq(communityMembers.communityId, communityId));

    const [pendingRequestsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communityJoinRequests)
      .where(and(
        eq(communityJoinRequests.communityId, communityId),
        eq(communityJoinRequests.status, 'PENDING')
      ));

    const [totalPostsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(and(eq(posts.communityId, communityId), eq(posts.moderationStatus, 'APPROVED')));

    const [moderatorsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communityMembers)
      .where(and(
        eq(communityMembers.communityId, communityId),
        inArray(communityMembers.role, ['OWNER', 'MODERATOR', 'admin'])
      ));

    res.json({
      success: true,
      data: {
        totalMembers: memberCountRes?.count || 0,
        pendingRequests: pendingRequestsRes?.count || 0,
        totalPosts: totalPostsRes?.count || 0,
        moderatorCount: moderatorsRes?.count || 1,
      }
    });
  } catch (error) {
    console.error("Error fetching community stats:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * GET /:id/audit-logs - Audit logs for community
 */
communitiesRouter.get("/:id/audit-logs", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
    if (!roleInfo.isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Denetim kayıtlarını yalnızca yöneticiler görebilir." }});
    }

    const logs = await db
      .select({
        id: communityAuditLogs.id,
        action: communityAuditLogs.action,
        details: communityAuditLogs.details,
        createdAt: communityAuditLogs.createdAt,
        actor: {
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        }
      })
      .from(communityAuditLogs)
      .innerJoin(users, eq(communityAuditLogs.actorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(communityAuditLogs.communityId, communityId))
      .orderBy(desc(communityAuditLogs.createdAt))
      .limit(100);

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching community audit logs:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * GET /:id/posts - Community posts (respects community privacy)
 */
communitiesRouter.get("/:id/posts", optionalAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const currentUserId = optionalAuthContext(req);

    if (isNaN(communityId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz topluluk ID." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    // If community is private, check if current user is member or moderator
    if (community.isPrivate) {
      if (!currentUserId || currentUserId === -1) {
        return res.status(403).json({ success: false, error: { code: "PRIVATE_COMMUNITY", message: "Bu topluluk özeldir. Gönderileri görüntülemek için üye olmalısınız." }});
      }

      const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
      if (!roleInfo.isMember) {
        return res.status(403).json({ success: false, error: { code: "PRIVATE_COMMUNITY", message: "Bu topluluk özeldir. Gönderileri görüntülemek için üye olmalısınız." }});
      }
    }

    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const communityPosts = await db
      .select({
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

    const formattedPosts = await populatePostStats(communityPosts, currentUserId || -1);
    res.json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

/**
 * DELETE /:id/posts/:postId - Moderate (remove) post inside community (Owner or Moderator)
 */
communitiesRouter.delete("/:id/posts/:postId", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id as string);
    const postId = parseInt(req.params.postId as string);
    const currentUserId = requireAuthContext(req);

    if (isNaN(communityId) || isNaN(postId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." }});
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, communityId), isNull(communities.deletedAt)))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
    }

    const roleInfo = await getCommunityRole(communityId, currentUserId, community.ownerId);
    if (!roleInfo.isModerator) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Topluluk gönderilerini yalnızca yöneticiler kaldırabilir." }});
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.communityId, communityId)))
      .limit(1);

    if (!post) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bu toplulukta bulunamadı." }});
    }

    // Set post moderationStatus to REJECTED so it's removed from community without breaking references
    await db
      .update(posts)
      .set({ moderationStatus: 'REJECTED', updatedAt: new Date() })
      .where(eq(posts.id, postId));

    // Audit log
    await db.insert(communityAuditLogs).values({
      communityId,
      actorId: currentUserId,
      targetUserId: post.userId,
      action: 'POST_REMOVED',
      details: `Topluluk içi gönderi kaldırıldı (#${postId}).`,
    });

    res.json({ success: true, data: { message: "Gönderi topluluktan başarıyla kaldırıldı." }});
  } catch (error) {
    console.error("Error removing community post:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
