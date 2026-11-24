import { Router } from "express";
import { db } from "../../src/db/index.js";
import { conversations, conversationMembers, messages, users, profiles, follows, blocks } from "../../src/db/schema.js";
import { eq, and, desc, asc, inArray, not, or, sql, gt } from "drizzle-orm";
import { requireAuth, requireAuthContext } from "../middleware/auth.js";
import { standardLimiter } from "../middleware/rateLimiter.js";
import { getBlockedIds } from "../utils/blocks.js";
import { paginationSchema } from "../validators/api.js";
import { z } from "zod";
import { sendNewMessageEmail, getEmailRecipientIfAllowed } from "../utils/mailer.js";
import { broadcastToUsers, isUserOnline } from "../services/messagesWebSocket.js";

export const messagesRouter = Router();

const MAX_GROUP_MEMBERS = 50;

/**
 * Validates that a media/avatar URL is strictly either a safe local /uploads path
 * or an http(s) URL, rejecting traversal sequences and javascript:/data: protocols.
 */
function isSafeMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2048) return false;
  if (trimmed.includes("..") || trimmed.includes("\\")) return false;
  if (trimmed.startsWith("/uploads/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const safeOptionalUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((val) => val === "" || isSafeMediaUrl(val), {
    message: "Geçersiz görsel bağlantısı.",
  })
  .optional()
  .nullable();

const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Grup adı en az 2 karakter olmalıdır.")
    .max(80, "Grup adı en fazla 80 karakter olabilir."),
  description: z
    .string()
    .trim()
    .max(300, "Grup açıklaması en fazla 300 karakter olabilir.")
    .optional()
    .nullable(),
  avatarUrl: safeOptionalUrlSchema,
  memberIds: z
    .array(z.number().int().positive())
    .min(1, "Gruba en az 1 kişi eklemelisiniz.")
    .max(MAX_GROUP_MEMBERS - 1, `Gruba en fazla ${MAX_GROUP_MEMBERS - 1} kişi ekleyebilirsiniz.`),
});

const updateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Grup adı en az 2 karakter olmalıdır.")
    .max(80, "Grup adı en fazla 80 karakter olabilir.")
    .optional(),
  description: z
    .string()
    .trim()
    .max(300, "Grup açıklaması en fazla 300 karakter olabilir.")
    .optional()
    .nullable(),
  avatarUrl: safeOptionalUrlSchema,
});

const addMembersSchema = z.object({
  memberIds: z
    .array(z.number().int().positive())
    .min(1, "En az 1 kullanıcı seçmelisiniz.")
    .max(20, "Tek seferde en fazla 20 kişi eklenebilir."),
});

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

const createMessageSchema = z.object({
  content: z.string().max(4000, "Mesaj en fazla 4000 karakter olabilir.").optional(),
  mediaUrl: safeOptionalUrlSchema,
});

async function getMemberIds(conversationId: number): Promise<number[]> {
  const rows = await db
    .select({ userId: conversationMembers.userId })
    .from(conversationMembers)
    .where(eq(conversationMembers.conversationId, conversationId));
  return rows.map((r: { userId: number }) => r.userId);
}

async function getUserBrief(userId: number) {
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      isVerified: users.isVerified,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId))
    .limit(1);
  return row || null;
}

async function insertSystemMessage(conversationId: number, actorUserId: number, content: string) {
  const [sysMsg] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: actorUserId,
      content,
      mediaUrl: null,
      messageType: "SYSTEM",
      isRead: true,
    })
    .returning();

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  const sender = await getUserBrief(actorUserId);
  return {
    id: sysMsg.id,
    conversationId: sysMsg.conversationId,
    content: sysMsg.content,
    mediaUrl: sysMsg.mediaUrl,
    messageType: sysMsg.messageType,
    isRead: sysMsg.isRead,
    createdAt: sysMsg.createdAt,
    sender: sender || {
      id: actorUserId,
      username: "sistem",
      displayName: "Sistem",
      avatarUrl: null,
      isVerified: false,
    },
  };
}

/**
 * Verifies whether `actorId` is allowed to invite `targetUserIds` into a group
 * respecting account status, blocks, and child-safety regulations.
 */
async function validateTargetUsersForGroup(
  actor: { id: number; isActive: boolean; isMinor: boolean; ageVerificationStatus: string },
  targetUserIds: number[]
): Promise<{ ok: true; users: Array<{ id: number; username: string; displayName: string | null }> } | { ok: false; status: number; code: string; message: string }> {
  if (!actor.isActive || actor.ageVerificationStatus === "REJECTED_UNDERAGE") {
    return {
      ok: false,
      status: 403,
      code: "CHILD_PROTECTION_RESTRICTION",
      message: "15 yaş altı veya askıya alınmış hesaplar grup oluşturamaz.",
    };
  }

  const blockedIds = await getBlockedIds(actor.id);
  const blockedSet = new Set(blockedIds);

  for (const uid of targetUserIds) {
    if (blockedSet.has(uid)) {
      return {
        ok: false,
        status: 403,
        code: "FORBIDDEN",
        message: "Engelli kullanıcılar gruba eklenemez.",
      };
    }
  }

  const targetRows = await db
    .select({
      id: users.id,
      username: users.username,
      isActive: users.isActive,
      isMinor: users.isMinor,
      ageVerificationStatus: users.ageVerificationStatus,
      displayName: profiles.displayName,
      messagePreference: profiles.messagePreference,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(inArray(users.id, targetUserIds));

  if (targetRows.length !== targetUserIds.length) {
    return {
      ok: false,
      status: 404,
      code: "NOT_FOUND",
      message: "Seçilen kullanıcılardan biri bulunamadı.",
    };
  }

  for (const target of targetRows) {
    if (!target.isActive || target.ageVerificationStatus === "REJECTED_UNDERAGE") {
      return {
        ok: false,
        status: 403,
        code: "CHILD_PROTECTION_RESTRICTION",
        message: `@${target.username} gruba eklenemez (hesap aktif değil veya yaş kısıtlaması bulunuyor).`,
      };
    }

    if (target.messagePreference === "NONE") {
      return {
        ok: false,
        status: 403,
        code: "FORBIDDEN",
        message: `@${target.username} mesaj ve grup davetlerini kapatmış.`,
      };
    }

    // Adult-to-Minor child protection: require mutual accepted follow
    if (!actor.isMinor && target.isMinor) {
      const [minorFollowsAdult] = await db
        .select({ followerId: follows.followerId })
        .from(follows)
        .where(
          and(
            eq(follows.followerId, target.id),
            eq(follows.followingId, actor.id),
            eq(follows.status, "accepted")
          )
        )
        .limit(1);

      const [adultFollowsMinor] = await db
        .select({ followerId: follows.followerId })
        .from(follows)
        .where(
          and(
            eq(follows.followerId, actor.id),
            eq(follows.followingId, target.id),
            eq(follows.status, "accepted")
          )
        )
        .limit(1);

      if (!minorFollowsAdult || !adultFollowsMinor) {
        return {
          ok: false,
          status: 403,
          code: "CHILD_PROTECTION_RESTRICTION",
          message: `Çocuk güvenliği yönetmeliği gereği @${target.username} kullanıcısını gruba eklemek için karşılıklı onaylı takipleşme gereklidir.`,
        };
      }
    }
  }

  return {
    ok: true,
    users: targetRows.map((t: any) => ({
      id: t.id,
      username: t.username,
      displayName: t.displayName,
    })),
  };
}

// GET /conversations — List both 1v1 and Group conversations
messagesRouter.get("/conversations", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 30 };
    const offset = (page - 1) * limit;

    const myMemberships = await db
      .select({
        conversationId: conversationMembers.conversationId,
        role: conversationMembers.role,
        lastReadAt: conversationMembers.lastReadAt,
      })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, currentUserId));

    const convIds = myMemberships.map((m: any) => m.conversationId);
    if (convIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const membershipMap = new Map<number, { role: string; lastReadAt: Date | null }>();
    for (const m of myMemberships as Array<{ conversationId: number; role: string; lastReadAt: Date | null }>) {
      membershipMap.set(m.conversationId, { role: m.role || "MEMBER", lastReadAt: m.lastReadAt });
    }

    const convs = await db
      .select()
      .from(conversations)
      .where(inArray(conversations.id, convIds))
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
      .offset(offset);

    if (convs.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const fetchedConvIds = convs.map((c: any) => c.id);

    // Fetch all members for these conversations
    const allMembers = await db
      .select({
        conversationId: conversationMembers.conversationId,
        role: conversationMembers.role,
        joinedAt: conversationMembers.joinedAt,
        id: users.id,
        username: users.username,
        isVerified: users.isVerified,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(inArray(conversationMembers.conversationId, fetchedConvIds))
      .orderBy(asc(conversationMembers.joinedAt));

    const membersByConv = new Map<number, any[]>();
    for (const m of allMembers as any[]) {
      const list = membersByConv.get(m.conversationId) || [];
      list.push({
        id: m.id,
        username: m.username,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl,
        isVerified: Boolean(m.isVerified),
        role: m.role || "MEMBER",
        isOnline: isUserOnline(m.id),
      });
      membersByConv.set(m.conversationId, list);
    }

    // Fetch last message per conversation with sender details
    const convIdsSql = sql.join(fetchedConvIds.map((id: number) => sql`${id}`), sql`, `);
    const lastMessagesResult = await db.execute(sql`
      SELECT DISTINCT ON (m.conversation_id)
        m.id,
        m.conversation_id as "conversationId",
        m.sender_id as "senderId",
        m.content,
        m.media_url as "mediaUrl",
        m.message_type as "messageType",
        m.is_read as "isRead",
        m.created_at as "createdAt",
        u.username as "senderUsername",
        p.display_name as "senderDisplayName"
      FROM messages m
      INNER JOIN users u ON u.id = m.sender_id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE m.conversation_id IN (${convIdsSql})
      ORDER BY m.conversation_id, m.created_at DESC, m.id DESC
    `);

    const lastMessagesMap = new Map<number, any>();
    for (const row of lastMessagesResult.rows as any[]) {
      lastMessagesMap.set(Number(row.conversationId), {
        id: Number(row.id),
        conversationId: Number(row.conversationId),
        senderId: Number(row.senderId),
        content: row.content,
        mediaUrl: row.mediaUrl,
        messageType: row.messageType || "TEXT",
        isRead: Boolean(row.isRead),
        createdAt: row.createdAt,
        sender: {
          id: Number(row.senderId),
          username: row.senderUsername,
          displayName: row.senderDisplayName,
        },
      });
    }

    // Compute accurate per-member unread counts using lastReadAt (for groups & DMs) with legacy fallback
    const unreadRows = await db.execute(sql`
      SELECT
        m.conversation_id as "conversationId",
        CAST(COUNT(*) AS INTEGER) as "count"
      FROM messages m
      INNER JOIN conversation_members cm
        ON cm.conversation_id = m.conversation_id AND cm.user_id = ${currentUserId}
      WHERE m.conversation_id IN (${convIdsSql})
        AND m.sender_id <> ${currentUserId}
        AND COALESCE(m.message_type, 'TEXT') <> 'SYSTEM'
        AND (
          (cm.last_read_at IS NOT NULL AND m.created_at > cm.last_read_at)
          OR (cm.last_read_at IS NULL AND m.is_read = false)
        )
      GROUP BY m.conversation_id
    `);

    const unreadMap = new Map<number, number>();
    for (const row of unreadRows.rows as any[]) {
      unreadMap.set(Number(row.conversationId), Number(row.count) || 0);
    }

    const formattedConvs = convs.map((c: any) => {
      const members = membersByConv.get(c.id) || [];
      const otherMembers = members.filter((m: any) => m.id !== currentUserId);
      const otherUser = !c.isGroup ? otherMembers[0] || null : null;
      const myMeta = membershipMap.get(c.id);
      const onlineCount = members.filter((m: any) => m.isOnline).length;

      return {
        id: c.id,
        isGroup: Boolean(c.isGroup),
        name: c.name || null,
        description: c.description || null,
        avatarUrl: c.avatarUrl || null,
        createdBy: c.createdBy || null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        myRole: myMeta?.role || "MEMBER",
        memberCount: members.length,
        onlineCount,
        membersPreview: members.slice(0, 4),
        otherUser,
        unreadCount: unreadMap.get(c.id) || 0,
        lastMessage: lastMessagesMap.get(c.id) || null,
      };
    });

    res.json({ success: true, data: formattedConvs });
  } catch (error) {
    console.error("[Messages] GET /conversations error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// GET /conversations/:id — Detailed conversation metadata & full member list
messagesRouter.get("/conversations/:id", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz sohbet kimliği." } });
    }

    const [myMembership] = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      )
      .limit(1);

    if (!myMembership) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu sohbete erişim yetkiniz yok." } });
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conv) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Sohbet bulunamadı." } });
    }

    const memberRows = await db
      .select({
        id: users.id,
        username: users.username,
        isVerified: users.isVerified,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        role: conversationMembers.role,
        joinedAt: conversationMembers.joinedAt,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(conversationMembers.conversationId, conversationId))
      .orderBy(asc(conversationMembers.joinedAt));

    const members = memberRows.map((m: any) => ({
      id: m.id,
      username: m.username,
      displayName: m.displayName,
      avatarUrl: m.avatarUrl,
      isVerified: Boolean(m.isVerified),
      role: m.role || "MEMBER",
      joinedAt: m.joinedAt,
      isOnline: isUserOnline(m.id),
    }));

    const otherUser = !conv.isGroup ? members.find((m: any) => m.id !== currentUserId) || null : null;

    res.json({
      success: true,
      data: {
        id: conv.id,
        isGroup: Boolean(conv.isGroup),
        name: conv.name || null,
        description: conv.description || null,
        avatarUrl: conv.avatarUrl || null,
        createdBy: conv.createdBy || null,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        myRole: myMembership.role || "MEMBER",
        memberCount: members.length,
        onlineCount: members.filter((m: any) => m.isOnline).length,
        members,
        otherUser,
      },
    });
  } catch (error) {
    console.error("[Messages] GET /conversations/:id error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// POST /conversations (create or get existing 1v1 DM)
messagesRouter.post("/conversations", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const targetUserId = Number(req.body.targetUserId);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0 || targetUserId === currentUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz kullanıcı." } });
    }

    const blockedIds = await getBlockedIds(currentUserId);
    if (blockedIds.includes(targetUserId)) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Engelli kullanıcı." } });
    }

    // Child Protection & Age Verification Rules (10 Ekim 2026 Yönetmeliği)
    const [currentUserRec] = await db
      .select({
        id: users.id,
        isActive: users.isActive,
        isMinor: users.isMinor,
        ageVerificationStatus: users.ageVerificationStatus,
      })
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1);

    const [targetUserRec] = await db
      .select({
        id: users.id,
        isActive: users.isActive,
        isMinor: users.isMinor,
        ageVerificationStatus: users.ageVerificationStatus,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!targetUserRec || !targetUserRec.isActive) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." } });
    }

    if (
      !currentUserRec ||
      !currentUserRec.isActive ||
      targetUserRec.ageVerificationStatus === "REJECTED_UNDERAGE" ||
      currentUserRec.ageVerificationStatus === "REJECTED_UNDERAGE"
    ) {
      return res.status(403).json({
        success: false,
        error: { code: "CHILD_PROTECTION_RESTRICTION", message: "15 yaş altı hesaplar mesajlaşamaz." },
      });
    }

    // Adult to Minor Contact Restriction
    if (targetUserRec.isMinor && !currentUserRec.isMinor) {
      const minorFollowsAdult = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.followerId, targetUserId),
            eq(follows.followingId, currentUserId),
            eq(follows.status, "accepted")
          )
        )
        .limit(1);
      const adultFollowsMinor = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, targetUserId),
            eq(follows.status, "accepted")
          )
        )
        .limit(1);

      if (minorFollowsAdult.length === 0 || adultFollowsMinor.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: "CHILD_PROTECTION_RESTRICTION",
            message:
              "10 Ekim 2026 Sosyal Ağ Çocuk Güvenliği Yönetmeliği uyarınca 15-18 yaş arası kullanıcılara karşılıklı onaylı takipleşme olmadan yetişkinler tarafından doğrudan mesaj başlatılamaz.",
          },
        });
      }
    }

    // Privacy Preferences
    const targetProfile = await db
      .select({ messagePreference: profiles.messagePreference })
      .from(profiles)
      .where(eq(profiles.userId, targetUserId))
      .limit(1);
    if (targetProfile.length > 0) {
      const pref = targetProfile[0].messagePreference;
      if (pref === "NONE") {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Bu kullanıcıya mesaj gönderilemiyor." },
        });
      } else if (pref === "FOLLOWERS") {
        const isFollowedByTarget = await db
          .select()
          .from(follows)
          .where(and(eq(follows.followerId, targetUserId), eq(follows.followingId, currentUserId)))
          .limit(1);
        if (isFollowedByTarget.length === 0) {
          return res.status(403).json({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Kullanıcı sadece takip ettiği kişilerden mesaj kabul ediyor.",
            },
          });
        }
      }
    }

    // Look for an existing 1v1 (non-group) conversation between the two users
    const userDirectConvs = await db
      .select({ convId: conversations.id })
      .from(conversationMembers)
      .innerJoin(conversations, eq(conversationMembers.conversationId, conversations.id))
      .where(
        and(eq(conversationMembers.userId, currentUserId), eq(conversations.isGroup, false))
      );

    const userDirectConvIds = userDirectConvs.map((c: { convId: number }) => c.convId);

    if (userDirectConvIds.length > 0) {
      const targetConvs = await db
        .select({ convId: conversationMembers.conversationId })
        .from(conversationMembers)
        .where(
          and(
            eq(conversationMembers.userId, targetUserId),
            inArray(conversationMembers.conversationId, userDirectConvIds)
          )
        )
        .limit(1);

      if (targetConvs.length > 0) {
        const [existing] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, targetConvs[0].convId))
          .limit(1);
        return res.json({ success: true, data: existing });
      }
    }

    const now = new Date();
    const [conv] = await db
      .insert(conversations)
      .values({ isGroup: false, createdBy: currentUserId, updatedAt: now })
      .returning();

    await db.insert(conversationMembers).values([
      { conversationId: conv.id, userId: currentUserId, role: "MEMBER", lastReadAt: now },
      { conversationId: conv.id, userId: targetUserId, role: "MEMBER", lastReadAt: null },
    ]);

    broadcastToUsers([currentUserId, targetUserId], "conversation:created", {
      conversationId: conv.id,
      isGroup: false,
    });

    res.status(201).json({ success: true, data: conv });
  } catch (error) {
    console.error("[Messages] POST /conversations error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// POST /conversations/group — Create a new group chat
messagesRouter.post("/conversations/group", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const parsed = createGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Geçersiz grup bilgileri.",
        },
      });
    }

    const { name, description, avatarUrl } = parsed.data;
    const uniqueMemberIds = Array.from(
      new Set(parsed.data.memberIds.filter((uid) => uid !== currentUserId))
    );

    if (uniqueMemberIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Kendiniz dışında en az 1 kişi eklemelisiniz." },
      });
    }

    if (uniqueMemberIds.length > MAX_GROUP_MEMBERS - 1) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: `Bir grupta en fazla ${MAX_GROUP_MEMBERS} kişi olabilir.` },
      });
    }

    const [creator] = await db
      .select({
        id: users.id,
        username: users.username,
        isActive: users.isActive,
        isMinor: users.isMinor,
        ageVerificationStatus: users.ageVerificationStatus,
      })
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1);

    if (!creator) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yetkisiz." } });
    }

    const validation = await validateTargetUsersForGroup(creator, uniqueMemberIds);
    if (!validation.ok) {
      return res.status(validation.status).json({
        success: false,
        error: { code: validation.code, message: validation.message },
      });
    }

    const now = new Date();
    const [conv] = await db
      .insert(conversations)
      .values({
        isGroup: true,
        name: name.trim(),
        description: description?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const memberRecords = [
      { conversationId: conv.id, userId: currentUserId, role: "ADMIN", lastReadAt: now },
      ...uniqueMemberIds.map((uid) => ({
        conversationId: conv.id,
        userId: uid,
        role: "MEMBER",
        lastReadAt: null as Date | null,
      })),
    ];

    await db.insert(conversationMembers).values(memberRecords);

    const sysMsg = await insertSystemMessage(
      conv.id,
      currentUserId,
      `@${creator.username} "${conv.name}" grubunu oluşturdu`
    );

    const allMemberIds = [currentUserId, ...uniqueMemberIds];
    broadcastToUsers(allMemberIds, "conversation:created", {
      conversationId: conv.id,
      isGroup: true,
      name: conv.name,
    });
    broadcastToUsers(allMemberIds, "message:created", {
      conversationId: conv.id,
      message: sysMsg,
    });

    res.status(201).json({
      success: true,
      data: {
        ...conv,
        myRole: "ADMIN",
        memberCount: allMemberIds.length,
      },
    });
  } catch (error) {
    console.error("[Messages] POST /conversations/group error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Grup oluşturulamadı." } });
  }
});

// PATCH /conversations/:id — Update group name, description, avatar (Admin only)
messagesRouter.patch("/conversations/:id", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz sohbet kimliği." } });
    }

    const parsed = updateGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Geçersiz bilgiler." },
      });
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conv || !conv.isGroup) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Grup bulunamadı." } });
    }

    const [membership] = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      )
      .limit(1);

    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Yalnızca grup yöneticileri grup ayarlarını düzenleyebilir." },
      });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
    if (parsed.data.description !== undefined) updates.description = parsed.data.description?.trim() || null;
    if (parsed.data.avatarUrl !== undefined) updates.avatarUrl = parsed.data.avatarUrl?.trim() || null;

    const [updated] = await db
      .update(conversations)
      .set(updates)
      .where(eq(conversations.id, conversationId))
      .returning();

    const actor = await getUserBrief(currentUserId);
    const memberIds = await getMemberIds(conversationId);

    if (parsed.data.name !== undefined && parsed.data.name.trim() !== conv.name) {
      const sysMsg = await insertSystemMessage(
        conversationId,
        currentUserId,
        `@${actor?.username || "yönetici"} grup adını "${updated.name}" olarak değiştirdi`
      );
      broadcastToUsers(memberIds, "message:created", { conversationId, message: sysMsg });
    } else if (parsed.data.avatarUrl !== undefined && parsed.data.avatarUrl !== conv.avatarUrl) {
      const sysMsg = await insertSystemMessage(
        conversationId,
        currentUserId,
        `@${actor?.username || "yönetici"} grup fotoğrafını güncelledi`
      );
      broadcastToUsers(memberIds, "message:created", { conversationId, message: sysMsg });
    }

    broadcastToUsers(memberIds, "conversation:updated", { conversationId });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[Messages] PATCH /conversations/:id error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Grup güncellenemedi." } });
  }
});

// POST /conversations/:id/members — Add members to a group (Admin only)
messagesRouter.post("/conversations/:id/members", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz sohbet." } });
    }

    const parsed = addMembersSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Geçersiz üye listesi." },
      });
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conv || !conv.isGroup) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Grup bulunamadı." } });
    }

    const existingMembers = await db
      .select({ userId: conversationMembers.userId, role: conversationMembers.role })
      .from(conversationMembers)
      .where(eq(conversationMembers.conversationId, conversationId));

    const callerMember = existingMembers.find((m: any) => m.userId === currentUserId);
    if (!callerMember || callerMember.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Yalnızca grup yöneticileri yeni üye ekleyebilir." },
      });
    }

    const existingSet = new Set(existingMembers.map((m: any) => m.userId));
    const newMemberIds = Array.from(
      new Set(parsed.data.memberIds.filter((uid) => !existingSet.has(uid)))
    );

    if (newMemberIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Seçilen kullanıcılar zaten grupta." },
      });
    }

    if (existingMembers.length + newMemberIds.length > MAX_GROUP_MEMBERS) {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: `Grup kapasitesi en fazla ${MAX_GROUP_MEMBERS} kişidir.` },
      });
    }

    const [actor] = await db
      .select({
        id: users.id,
        username: users.username,
        isActive: users.isActive,
        isMinor: users.isMinor,
        ageVerificationStatus: users.ageVerificationStatus,
      })
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1);

    if (!actor) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yetkisiz." } });
    }

    const validation = await validateTargetUsersForGroup(actor, newMemberIds);
    if (!validation.ok) {
      return res.status(validation.status).json({
        success: false,
        error: { code: validation.code, message: validation.message },
      });
    }

    await db.insert(conversationMembers).values(
      newMemberIds.map((uid) => ({
        conversationId,
        userId: uid,
        role: "MEMBER",
        lastReadAt: null as Date | null,
      }))
    );

    const addedNames = validation.users.map((u) => `@${u.username}`).join(", ");
    const sysMsg = await insertSystemMessage(
      conversationId,
      currentUserId,
      `@${actor.username}, ${addedNames} ${validation.users.length > 1 ? "kişilerini" : "kişisini"} gruba ekledi`
    );

    const allIds = [...existingMembers.map((m: any) => m.userId), ...newMemberIds];
    broadcastToUsers(newMemberIds, "conversation:created", {
      conversationId,
      isGroup: true,
      name: conv.name,
    });
    broadcastToUsers(allIds, "conversation:updated", { conversationId });
    broadcastToUsers(allIds, "message:created", { conversationId, message: sysMsg });

    res.status(201).json({ success: true, data: { addedCount: newMemberIds.length } });
  } catch (error) {
    console.error("[Messages] POST /conversations/:id/members error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Üye eklenemedi." } });
  }
});

// DELETE /conversations/:id/members/:userId — Leave group (self) or remove member (Admin)
messagesRouter.delete("/conversations/:id/members/:userId", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    const targetUserId = parseInt(req.params.userId as string, 10);

    if (!Number.isInteger(conversationId) || !Number.isInteger(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." } });
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conv || !conv.isGroup) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Grup bulunamadı." } });
    }

    const members = await db
      .select({
        userId: conversationMembers.userId,
        role: conversationMembers.role,
        joinedAt: conversationMembers.joinedAt,
      })
      .from(conversationMembers)
      .where(eq(conversationMembers.conversationId, conversationId))
      .orderBy(asc(conversationMembers.joinedAt));

    const callerMember = members.find((m: any) => m.userId === currentUserId);
    const targetMember = members.find((m: any) => m.userId === targetUserId);

    if (!callerMember || !targetMember) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Üyelik bulunamadı." } });
    }

    const isSelfLeave = currentUserId === targetUserId;
    if (!isSelfLeave && callerMember.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Üye çıkarma yetkiniz bulunmuyor." },
      });
    }

    await db
      .delete(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, targetUserId)
        )
      );

    const remaining = members.filter((m: any) => m.userId !== targetUserId);
    const remainingIds = remaining.map((m: any) => m.userId);

    // If no members remain, delete the empty group
    if (remaining.length === 0) {
      await db.delete(conversations).where(eq(conversations.id, conversationId));
      broadcastToUsers([targetUserId], "conversation:removed", { conversationId });
      return res.json({ success: true, data: { deletedConversation: true } });
    }

    // Auto-promote earliest member if the last admin left
    const hasRemainingAdmin = remaining.some((m: any) => m.role === "ADMIN");
    if (!hasRemainingAdmin && remaining[0]) {
      await db
        .update(conversationMembers)
        .set({ role: "ADMIN" })
        .where(
          and(
            eq(conversationMembers.conversationId, conversationId),
            eq(conversationMembers.userId, remaining[0].userId)
          )
        );
    }

    const actor = await getUserBrief(currentUserId);
    const target = await getUserBrief(targetUserId);
    const text = isSelfLeave
      ? `@${target?.username || "kullanıcı"} gruptan ayrıldı`
      : `@${actor?.username || "yönetici"}, @${target?.username || "kullanıcı"} kişisini gruptan çıkardı`;

    const sysMsg = await insertSystemMessage(conversationId, currentUserId, text);

    broadcastToUsers([targetUserId], "conversation:removed", { conversationId });
    broadcastToUsers(remainingIds, "conversation:updated", { conversationId });
    broadcastToUsers(remainingIds, "message:created", { conversationId, message: sysMsg });

    res.json({ success: true, data: { removedUserId: targetUserId } });
  } catch (error) {
    console.error("[Messages] DELETE /conversations/:id/members/:userId error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "İşlem tamamlanamadı." } });
  }
});

// PATCH /conversations/:id/members/:userId/role — Promote or demote a member (Admin only)
messagesRouter.patch("/conversations/:id/members/:userId/role", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    const targetUserId = parseInt(req.params.userId as string, 10);

    if (!Number.isInteger(conversationId) || !Number.isInteger(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz parametre." } });
    }

    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz rol." } });
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conv || !conv.isGroup) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Grup bulunamadı." } });
    }

    const members = await db
      .select({ userId: conversationMembers.userId, role: conversationMembers.role })
      .from(conversationMembers)
      .where(eq(conversationMembers.conversationId, conversationId));

    const callerMember = members.find((m: any) => m.userId === currentUserId);
    const targetMember = members.find((m: any) => m.userId === targetUserId);

    if (!callerMember || callerMember.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Yalnızca yöneticiler rol değiştirebilir." },
      });
    }

    if (!targetMember) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Üye bulunamadı." } });
    }

    const adminCount = members.filter((m: any) => m.role === "ADMIN").length;
    if (targetMember.role === "ADMIN" && parsed.data.role === "MEMBER" && adminCount <= 1) {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Grupta en az bir yönetici bulunmalıdır." },
      });
    }

    await db
      .update(conversationMembers)
      .set({ role: parsed.data.role })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, targetUserId)
        )
      );

    const target = await getUserBrief(targetUserId);
    const sysMsg = await insertSystemMessage(
      conversationId,
      currentUserId,
      parsed.data.role === "ADMIN"
        ? `@${target?.username || "kullanıcı"} artık grup yöneticisi`
        : `@${target?.username || "kullanıcı"} yöneticilikten alındı`
    );

    const memberIds = members.map((m: any) => m.userId);
    broadcastToUsers(memberIds, "conversation:updated", { conversationId });
    broadcastToUsers(memberIds, "message:created", { conversationId, message: sysMsg });

    res.json({ success: true, data: { userId: targetUserId, role: parsed.data.role } });
  } catch (error) {
    console.error("[Messages] PATCH role error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Rol güncellenemedi." } });
  }
});

// GET /conversations/:id/messages
messagesRouter.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz sohbet." } });
    }

    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 30 };
    const offset = (page - 1) * limit;

    const membership = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      )
      .limit(1);
    if (membership.length === 0) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
    }

    const msgs = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        content: messages.content,
        mediaUrl: messages.mediaUrl,
        messageType: messages.messageType,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          isVerified: users.isVerified,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(limit)
      .offset(offset);

    res.json({ success: true, data: msgs });
  } catch (error) {
    console.error("[Messages] GET messages error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// POST /conversations/:id/messages
messagesRouter.post("/conversations/:id/messages", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz sohbet." } });
    }

    const parsed = createMessageSchema.safeParse(req.body);
    const trimmedContent = parsed.success ? parsed.data.content?.trim() || "" : "";
    const trimmedMedia = parsed.success ? parsed.data.mediaUrl?.trim() || "" : "";

    if (!parsed.success || (!trimmedContent && !trimmedMedia)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: !parsed.success
            ? parsed.error.issues[0]?.message || "Geçersiz mesaj."
            : "Mesaj içeriği veya görsel gerekli.",
        },
      });
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conv) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Sohbet bulunamadı." } });
    }

    const membership = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      )
      .limit(1);
    if (membership.length === 0) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
    }

    // Sender status & Child Protection check
    const [senderUser] = await db
      .select({
        id: users.id,
        username: users.username,
        isVerified: users.isVerified,
        isActive: users.isActive,
        isMinor: users.isMinor,
        ageVerificationStatus: users.ageVerificationStatus,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, currentUserId))
      .limit(1);

    if (!senderUser || !senderUser.isActive || senderUser.ageVerificationStatus === "REJECTED_UNDERAGE") {
      return res.status(403).json({
        success: false,
        error: {
          code: "CHILD_PROTECTION_RESTRICTION",
          message: "Hesabınız askıya alınmıştır veya 15 yaş altı kısıtlamasına tabidir.",
        },
      });
    }

    const otherMembers = await db
      .select({
        id: users.id,
        isActive: users.isActive,
        isMinor: users.isMinor,
        ageVerificationStatus: users.ageVerificationStatus,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          not(eq(conversationMembers.userId, currentUserId))
        )
      );

    // For 1v1 chats, enforce strict recipient checks (active, block, adult-to-minor mutual follow)
    if (!conv.isGroup) {
      for (const other of otherMembers as any[]) {
        if (!other.isActive || other.ageVerificationStatus === "REJECTED_UNDERAGE") {
          return res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Kullanıcı hesabı aktif değildir." },
          });
        }

        const isBlocked = await db
          .select()
          .from(blocks)
          .where(
            or(
              and(eq(blocks.blockerId, currentUserId), eq(blocks.blockedId, other.id)),
              and(eq(blocks.blockerId, other.id), eq(blocks.blockedId, currentUserId))
            )
          )
          .limit(1);

        if (isBlocked.length > 0) {
          return res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Engellenmiş kullanıcıya mesaj gönderilemez." },
          });
        }

        if (!senderUser.isMinor && other.isMinor) {
          const minorFollowsAdult = await db
            .select()
            .from(follows)
            .where(
              and(
                eq(follows.followerId, other.id),
                eq(follows.followingId, currentUserId),
                eq(follows.status, "accepted")
              )
            )
            .limit(1);
          const adultFollowsMinor = await db
            .select()
            .from(follows)
            .where(
              and(
                eq(follows.followerId, currentUserId),
                eq(follows.followingId, other.id),
                eq(follows.status, "accepted")
              )
            )
            .limit(1);

          if (minorFollowsAdult.length === 0 || adultFollowsMinor.length === 0) {
            return res.status(403).json({
              success: false,
              error: {
                code: "CHILD_PROTECTION_RESTRICTION",
                message:
                  "10 Ekim 2026 Yönetmeliği uyarınca 15-18 yaş arası çocuk kullanıcıyla karşılıklı onaylı takipleşme olmadan mesajlaşılamaz.",
              },
            });
          }
        }
      }
    }

    const now = new Date();
    const [msg] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: currentUserId,
        content: trimmedContent || null,
        mediaUrl: trimmedMedia || null,
        messageType: "TEXT",
        isRead: false,
        createdAt: now,
      })
      .returning();

    await db
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    // Mark sender's own lastReadAt so sender never sees their own message as unread
    await db
      .update(conversationMembers)
      .set({ lastReadAt: now })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      );

    const populatedMsg = {
      id: msg.id,
      conversationId: msg.conversationId,
      content: msg.content,
      mediaUrl: msg.mediaUrl,
      messageType: msg.messageType || "TEXT",
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      sender: {
        id: senderUser.id,
        username: senderUser.username,
        displayName: senderUser.displayName,
        avatarUrl: senderUser.avatarUrl,
        isVerified: Boolean(senderUser.isVerified),
      },
    };

    // Real-time WebSocket broadcast to all active conversation members
    const activeRecipientIds = otherMembers
      .filter((m: any) => m.isActive && m.ageVerificationStatus !== "REJECTED_UNDERAGE")
      .map((m: any) => m.id);

    broadcastToUsers([currentUserId, ...activeRecipientIds], "message:created", {
      conversationId,
      message: populatedMsg,
    });

    // Fire-and-forget direct/group message email notifications (skip online users to reduce noise)
    if (activeRecipientIds.length > 0) {
      setImmediate(async () => {
        try {
          const blockedSet = new Set(await getBlockedIds(currentUserId));
          const displayLabel = conv.isGroup && conv.name
            ? `${senderUser.displayName || senderUser.username} (${conv.name})`
            : senderUser.displayName || senderUser.username;

          for (const recipientId of activeRecipientIds) {
            if (blockedSet.has(recipientId)) continue;
            if (isUserOnline(recipientId)) continue;

            const recipient = await getEmailRecipientIfAllowed(recipientId, "messages");
            if (!recipient) continue;

            await sendNewMessageEmail({
              recipientId,
              to: recipient.email,
              recipientName: recipient.displayName,
              senderName: displayLabel,
              senderUsername: senderUser.username,
              messagePreview: trimmedContent || null,
              hasMedia: Boolean(trimmedMedia),
              conversationId,
            });
          }
        } catch (err) {
          console.warn("[Messages] Yeni mesaj e-postası gönderilemedi:", err);
        }
      });
    }

    res.status(201).json({ success: true, data: populatedMsg });
  } catch (error) {
    console.error("[Messages] POST message error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// PATCH /conversations/:id/read
messagesRouter.patch("/conversations/:id/read", requireAuth, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const conversationId = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz sohbet." } });
    }

    const membership = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      )
      .limit(1);
    if (membership.length === 0) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } });
    }

    const now = new Date();

    // Update caller's per-member lastReadAt
    await db
      .update(conversationMembers)
      .set({ lastReadAt: now })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      );

    // Update message-level isRead for 1v1 read checkmarks
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          not(eq(messages.senderId, currentUserId)),
          eq(messages.isRead, false)
        )
      );

    const memberIds = await getMemberIds(conversationId);
    broadcastToUsers(
      memberIds,
      "conversation:read",
      { conversationId, readerId: currentUserId, readAt: now.toISOString() },
      currentUserId
    );

    res.json({ success: true, data: { message: "Okundu olarak işaretlendi." } });
  } catch (error) {
    console.error("[Messages] PATCH read error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});
