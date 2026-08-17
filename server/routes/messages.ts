import { Router } from "express";
import { db } from "../../src/db/index.js";
import { conversations, conversationMembers, messages, users, profiles, follows } from "../../src/db/schema.js";
import { eq, and, desc, inArray, not, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { standardLimiter } from "../middleware/rateLimiter.js";
import { getBlockedIds } from "../utils/blocks.js";
import { paginationSchema } from "../validators/api.js";
import { z } from "zod";

export const messagesRouter = Router();

// GET /conversations
messagesRouter.get("/conversations", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const memberships = await db.select().from(conversationMembers).where(eq(conversationMembers.userId, currentUserId));
    const convIds = memberships.map(m => m.conversationId);
    
    if (convIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const convs = await db.select().from(conversations).where(inArray(conversations.id, convIds)).orderBy(desc(conversations.updatedAt)).limit(limit).offset(offset);
    
    // Attach other member and last message
    for (let c of convs) {
      const otherMembers = await db.select({
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(conversationMembers.conversationId, c.id), not(eq(conversationMembers.userId, currentUserId))))
      .limit(1);

      (c as any).otherUser = otherMembers.length > 0 ? otherMembers[0] : null;

      const lastMsgs = await db.select().from(messages).where(eq(messages.conversationId, c.id)).orderBy(desc(messages.createdAt)).limit(1);
      (c as any).lastMessage = lastMsgs.length > 0 ? lastMsgs[0] : null;

      const unread = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(and(
          eq(messages.conversationId, c.id),
          eq(messages.isRead, false),
          not(eq(messages.senderId, currentUserId))
        ));
      (c as any).unreadCount = unread.length > 0 ? Number(unread[0].count) : 0;
    }

    res.json({ success: true, data: convs });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// POST /conversations (create 1v1)
messagesRouter.post("/conversations", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const targetUserId = req.body.targetUserId;

    if (!targetUserId || targetUserId === currentUserId) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz." }});
    
    const blockedIds = await getBlockedIds(currentUserId);

    if (blockedIds.includes(targetUserId)) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Engelli kullanıcı." }});
    }
    
    // Privacy Preferences
    const targetProfile = await db.select({ messagePreference: profiles.messagePreference }).from(profiles).where(eq(profiles.userId, targetUserId)).limit(1);
    if (targetProfile.length > 0) {
      const pref = targetProfile[0].messagePreference;
      if (pref === 'NONE') {
         return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu kullanıcıya mesaj gönderilemiyor." }});
      } else if (pref === 'FOLLOWERS') {
         // Check if current user is followed by the target user? Wait. "Sadece takip ettiğim kişiler" means target user must follow current user.
         // Let's check if targetUserId follows currentUserId.
         const isFollowedByTarget = await db.select().from(follows).where(and(eq(follows.followerId, targetUserId), eq(follows.followingId, currentUserId))).limit(1);
         if (isFollowedByTarget.length === 0) {
           return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Kullanıcı sadece takip ettiği kişilerden mesaj kabul ediyor." }});
         }
      }
    }

    const userConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where(eq(conversationMembers.userId, currentUserId));

    const userConvIds = userConvs.map(c => c.convId);

    if (userConvIds.length > 0) {
      const targetConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where(and(eq(conversationMembers.userId, targetUserId), inArray(conversationMembers.conversationId, userConvIds))).limit(1);
      if (targetConvs.length > 0) {
        const [existing] = await db.select().from(conversations).where(eq(conversations.id, targetConvs[0].convId)).limit(1);
        return res.json({ success: true, data: existing });
      }
    }

    const [conv] = await db.insert(conversations).values({}).returning();
    await db.insert(conversationMembers).values([
      { conversationId: conv.id, userId: currentUserId },
      { conversationId: conv.id, userId: targetUserId }
    ]);
    
    res.status(201).json({ success: true, data: conv });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// GET /conversations/:id/messages
messagesRouter.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const conversationId = parseInt(req.params.id as string);
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const membership = await db.select().from(conversationMembers).where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, currentUserId))).limit(1);
    if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." }});

    const msgs = await db.select({
      id: messages.id,
      content: messages.content,
      mediaUrl: messages.mediaUrl,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      sender: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      }
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

    res.json({ success: true, data: msgs });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

const createMessageSchema = z.object({
  content: z.string().optional(),
  mediaUrl: z.string().optional()
});

// POST /conversations/:id/messages
messagesRouter.post("/conversations/:id/messages", requireAuth, standardLimiter, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const conversationId = parseInt(req.params.id as string);
    const parsed = createMessageSchema.safeParse(req.body);

    if (!parsed.success || (!parsed.data.content && !parsed.data.mediaUrl)) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Mesaj içeriği gerekli." }});
    }

    const membership = await db.select().from(conversationMembers).where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, currentUserId))).limit(1);
    if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." }});

    const [msg] = await db.insert(messages).values({
      conversationId,
      senderId: currentUserId,
      content: parsed.data.content || null,
      mediaUrl: parsed.data.mediaUrl || null
    }).returning();

    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));

    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// PATCH /conversations/:id/read
messagesRouter.patch("/conversations/:id/read", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const conversationId = parseInt(req.params.id as string);
    
    // Verify membership
    const membership = await db.select().from(conversationMembers).where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, currentUserId))).limit(1);
    if (membership.length === 0) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." }});
    
    // Update messages to read where sender is not current user
    await db.update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, conversationId),
        not(eq(messages.senderId, currentUserId)),
        eq(messages.isRead, false)
      ));
      
    res.json({ success: true, data: { message: "Okundu olarak işaretlendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});
