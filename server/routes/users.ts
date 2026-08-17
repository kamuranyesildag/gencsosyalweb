import argon2 from "argon2";
import { refreshTokens } from "../../src/db/schema.js";
import { changePasswordSchema, changeEmailSchema, deleteAccountSchema } from "../validators/api.js";
import { sendSecurityAlertEmail, sendVerificationEmail } from "../utils/mailer.js";
import { generateEmailToken } from "../utils/jwt.js";
import { Router } from "express";
import { db } from "../../src/db/index.js";
import { users, profiles, follows, blocks } from "../../src/db/schema.js";
import { eq, and, or, sql, inArray } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { getBlockedIds } from "../utils/blocks.js";
import { authRateLimiter } from "../middleware/rate-limit.js";
import { updateProfileSchema } from "../validators/api.js";
import { moderateContent } from "../services/moderation/index.js";
import { moderationLogs } from "../../src/db/schema.js";

export const usersRouter = Router();

usersRouter.get("/:username", optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.userId || -1;

    const userRecords = await db.select({
      id: users.id,
      username: users.username,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      coverUrl: profiles.coverUrl,
      location: profiles.location,
      website: profiles.website,
      isPrivate: profiles.isPrivate,
      allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
      messagePreference: profiles.messagePreference,
      mentionPreference: profiles.mentionPreference,
      defaultPostVisibility: profiles.defaultPostVisibility
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.username, username as string))
    .limit(1);

    if (userRecords.length === 0) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." }});
      return;
    }

    const targetUser = userRecords[0];

    // Check if blocked
    const blockRecord = await db.select().from(blocks).where(
      or(
        and(eq(blocks.blockerId, currentUserId), eq(blocks.blockedId, targetUser.id)),
        and(eq(blocks.blockerId, targetUser.id), eq(blocks.blockedId, currentUserId))
      )
    ).limit(1);

    if (blockRecord.length > 0) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." }});
      return;
    }

    // Follow stats
    const followerCountRes = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followingId, targetUser.id));
    const followingCountRes = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followerId, targetUser.id));
    const isFollowingRes = await db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUser.id))).limit(1);

    const responseData: any = {
      ...targetUser,
      followersCount: followerCountRes[0].count,
      followingCount: followingCountRes[0].count,
      isFollowing: isFollowingRes.length > 0,
      notificationPreference: isFollowingRes.length > 0 ? isFollowingRes[0].notificationPreference : null,
    };

    // Mutual Followers
    responseData.mutualFollowers = [];
    responseData.mutualFollowersCount = 0;

    if (currentUserId !== targetUser.id) {
      const myFollowing = await db.select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, currentUserId));
      
      const myFollowingIds = myFollowing.map(f => f.followingId);

      if (myFollowingIds.length > 0) {
        const mutuals = await db.select({
          id: users.id,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
          displayName: profiles.displayName
        })
        .from(follows)
        .innerJoin(users, eq(users.id, follows.followerId))
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(
          and(
            eq(follows.followingId, targetUser.id),
            inArray(follows.followerId, myFollowingIds)
          )
        )
        .limit(3);

        const mutualsCountRes = await db.select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(
            and(
              eq(follows.followingId, targetUser.id),
              inArray(follows.followerId, myFollowingIds)
            )
          );

        responseData.mutualFollowers = mutuals;
        responseData.mutualFollowersCount = mutualsCountRes[0].count;
      }
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

usersRouter.patch("/me", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const parsed = updateProfileSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
      return;
    }

    if (parsed.data.bio) {
      const modResult = await moderateContent(parsed.data.bio);
      if (modResult.riskLevel === 'HIGH_RISK') {
        await db.insert(moderationLogs).values({
           entityType: 'PROFILE',
           entityId: currentUserId,
           userId: currentUserId,
           status: 'RESOLVED',
           actionTaken: 'REJECTED',
           riskLevel: modResult.riskLevel,
           category: modResult.category,
           reason: modResult.reason || null
        });
        res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Biyografiniz topluluk kurallarına aykırı." }});
        return;
      }
    }

    await db.update(profiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(profiles.userId, currentUserId));

    res.json({ success: true, data: { message: "Profil güncellendi." }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});


// Endpoint: PUT /users/me/password
usersRouter.put("/me/password", requireAuth, authRateLimiter, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const parsed = changePasswordSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    }

    const { currentPassword, newPassword } = parsed.data;

    const userRecord = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);
    if (userRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." }});

    const isPasswordValid = await argon2.verify(userRecord[0].passwordHash, currentPassword);
    if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Mevcut şifre hatalı." }});

    const newHash = await argon2.hash(newPassword);
    await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, currentUserId));

    sendSecurityAlertEmail(userRecord[0].email, userRecord[0].username, "Şifre Değişikliği", new Date().toLocaleString('tr-TR')).catch(console.error);

    res.json({ success: true, data: { message: "Şifre başarıyla güncellendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// Endpoint: PUT /users/me/email
usersRouter.put("/me/email", requireAuth, authRateLimiter, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const parsed = changeEmailSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    }

    const { email, password } = parsed.data;

    const userRecord = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);
    const isPasswordValid = await argon2.verify(userRecord[0].passwordHash, password);
    if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Şifre hatalı." }});

    const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail.length > 0 && existingEmail[0].id !== currentUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu e-posta adresi zaten kullanılıyor." }});
    }

    await db.update(users).set({ email, emailVerified: false, updatedAt: new Date() }).where(eq(users.id, currentUserId));
    
    // Generate new email token and send
    const emailToken = generateEmailToken(currentUserId, "verify_email");
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    sendVerificationEmail(email, userRecord[0].username, `${frontendUrl}/verify-email?token=${emailToken}`).catch(console.error);

    res.json({ success: true, data: { message: "E-posta başarıyla güncellendi. Lütfen yeni adresinizi doğrulayın." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// Endpoint: GET /users/me/sessions
usersRouter.get("/me/sessions", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const sessions = await db.select({
      id: refreshTokens.id,
      createdAt: refreshTokens.createdAt,
      expiresAt: refreshTokens.expiresAt,
      revokedAt: refreshTokens.revokedAt
    }).from(refreshTokens).where(eq(refreshTokens.userId, currentUserId));

    res.json({ success: true, data: sessions.filter(s => !s.revokedAt && new Date(s.expiresAt) > new Date()) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// Endpoint: DELETE /users/me/sessions/:id
usersRouter.delete("/me/sessions/:id", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const sessionId = parseInt(req.params.id as string);
    if (isNaN(sessionId)) { return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz ID." }}); }
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(and(eq(refreshTokens.id, sessionId), eq(refreshTokens.userId, currentUserId)));
    res.json({ success: true, data: { message: "Oturum sonlandırıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// Endpoint: POST /users/me/delete
usersRouter.post("/me/delete", requireAuth, authRateLimiter, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const parsed = deleteAccountSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    }

    const { password } = parsed.data;
    const userRecord = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);
    
    const isPasswordValid = await argon2.verify(userRecord[0].passwordHash, password);
    if (!isPasswordValid) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Şifre hatalı." }});

    await db.delete(users).where(eq(users.id, currentUserId));
    
    res.clearCookie("refreshToken");
    res.json({ success: true, data: { message: "Hesabınız başarıyla silindi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});


// Block user
usersRouter.post("/:id/block", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = req.user!.userId;
    
    if (isNaN(targetUserId) || targetUserId === currentUserId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz kullanıcı." }});
    }

    // Insert block
    await db.insert(blocks).values({
      blockerId: currentUserId,
      blockedId: targetUserId
    }).onConflictDoNothing();

    // Remove any follows in both directions
    await db.delete(follows).where(
      or(
        and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)),
        and(eq(follows.followerId, targetUserId), eq(follows.followingId, currentUserId))
      )
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// Unblock user
usersRouter.delete("/:id/block", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = req.user!.userId;
    
    if (isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz kullanıcı." }});
    }

    await db.delete(blocks).where(
      and(eq(blocks.blockerId, currentUserId), eq(blocks.blockedId, targetUserId))
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});


usersRouter.put("/:id/follow-preference", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = req.user!.userId;
    const { preference } = req.body;
    
    if (isNaN(targetUserId) || !['none', 'standard', 'all'].includes(preference)) {
      return res.status(400).json({ success: false, error: { message: "Geçersiz istek." }});
    }

    const result = await db.update(follows)
      .set({ notificationPreference: preference })
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)));
      
    if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: { message: "Kullanıcı takip edilmiyor." }});
    }
    
    res.json({ success: true, message: "Bildirim tercihi güncellendi." });
  } catch (error) {
    console.error("Follow preference error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." }});
  }
});
