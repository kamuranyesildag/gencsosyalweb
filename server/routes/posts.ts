import { Router } from "express";
import { db } from "../../src/db/index.js";
import type { DbTransaction } from "../../src/db/index.js";
import { posts, postMedia, likes, comments, bookmarks, users, profiles, reposts, postCollaborators, communityMembers, communities, pollOptions, pollVotes, notifications } from "../../src/db/schema.js";
import { eq, and, sql, or, inArray } from "drizzle-orm";
import { extractHashtags, normalizeHashtag } from "../utils/hashtags.js";
import { extractMentions } from "../utils/mentions.js";
import { hashtags, postHashtags, postMentions, commentMentions, follows } from "../../src/db/schema.js";
import { requireAuth, requireAuthContext, optionalAuthContext, optionalAuth } from "../middleware/auth.js";
import { populatePostStats } from "../utils/postStats.js";
import { createPostSchema, createCommentSchema } from "../validators/api.js";
import { moderateContent } from "../services/moderation/index.js";
import { moderationLogs } from "../../src/db/schema.js";
import { notify } from "../utils/notifications.js";
import { getBlockedIds } from "../utils/blocks.js";
import { verifyPostAccess } from "../utils/visibility.js";
import { standardLimiter, strictLimiter } from "../middleware/rateLimiter.js";
import fs from "fs";
import path from "path";

export const postsRouter = Router();

postsRouter.post("/:id/poll/vote", requireAuth, strictLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    const { optionId } = req.body;
    
    if (!optionId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "optionId gereklidir." } });
    }

    // Check if post is a poll
    const postRecord = await db.select({ postType: posts.postType }).from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (postRecord.length === 0 || postRecord[0].postType !== 'POLL') {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Anket bulunamadı." } });
    }

    // Check if option belongs to this poll
    const optionRecord = await db.select().from(pollOptions).where(and(eq(pollOptions.id, optionId), eq(pollOptions.postId, postId))).limit(1);
    if (optionRecord.length === 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz seçenek." } });
    }

    try {
      await db.insert(pollVotes).values({
        postId,
        optionId,
        userId: currentUserId
      });
      return res.json({ success: true, data: { message: "Oy kullanıldı." } });
    } catch (dbError: unknown) {
      if ((dbError as { code?: string }).code === '23505') { // Unique violation
        return res.status(400).json({ success: false, error: { code: "ALREADY_VOTED", message: "Bu ankette zaten oy kullandınız." } });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Poll vote error:", error);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// GET /posts/:id
postsRouter.get("/:id", optionalAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = optionalAuthContext(req);
    const blockedIds = await getBlockedIds(currentUserId);
    
    const postRecord = await db.select({
      id: posts.id,
      content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
      visibility: posts.visibility,
      createdAt: posts.createdAt,
      userId: posts.userId, // We need this to check owner
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        allowSearchEngineIndexing: profiles.allowSearchEngineIndexing
      }
    }).from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(
        eq(posts.id, postId),
        or(
          eq(posts.moderationStatus, 'APPROVED'),
          currentUserId ? eq(posts.userId, currentUserId) : sql`false`
        )
      ))
      .limit(1);
    
    if (postRecord.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    }
    
    const post = postRecord[0];

    if (!(await verifyPostAccess(postId, currentUserId))) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    }

    let pollData = undefined;
    if (post.postType === 'POLL') {
      const options = await db.select().from(pollOptions).where(eq(pollOptions.postId, postId)).orderBy(pollOptions.order);
      const votes = await db.select().from(pollVotes).where(eq(pollVotes.postId, postId));
      const totalVotes = votes.length;
      
      const enrichedOptions = options.map((opt: any) => {
        const optionVotes = votes.filter((v: any) => v.optionId === opt.id).length;
        const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
        return {
          ...opt,
          voteCount: optionVotes,
          percentage: Math.round(percentage)
        };
      });

      const userVote = currentUserId && currentUserId > 0 ? votes.find((v: any) => v.userId === currentUserId)?.optionId : null;

      pollData = {
        options: enrichedOptions,
        totalVotes,
        userVotedOptionId: userVote
      };
    }
    
    const media = await db.select().from(postMedia).where(eq(postMedia.postId, postId));
    const repostRecords = await db.select().from(reposts).where(eq(reposts.postId, postId));
    const repostCount = repostRecords.length;
    const isReposted = repostRecords.some((r: any) => r.userId === currentUserId);
    res.json({ success: true, data: { ...post, media, repostCount, isReposted, pollData }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// POST /posts
postsRouter.post("/", requireAuth, strictLimiter, async (req, res) => {
  try {
    const currentUserId = requireAuthContext(req);
    const parsed = createPostSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    }
    

    const { content, visibility, media, communityId } = parsed.data;
    
    // Check community authorization if communityId is provided
    if (communityId) {
      const communityRecord = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
      if (communityRecord.length === 0) {
        return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topluluk bulunamadı." }});
      }
      
      const memberRecord = await db.select().from(communityMembers).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, currentUserId))).limit(1);
      if (memberRecord.length === 0 && communityRecord[0].ownerId !== currentUserId) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu topluluğa gönderi paylaşmak için üye olmalısınız." }});
      }
    }
    
    let finalVisibility = visibility;
    if (!finalVisibility) {
       const p = await db.select({ defaultPostVisibility: profiles.defaultPostVisibility }).from(profiles).where(eq(profiles.userId, currentUserId)).limit(1);
       finalVisibility = p.length > 0 ? p[0].defaultPostVisibility as any : "PUBLIC";
    }

    const modResult = await moderateContent(content || "");
    const modStatus = modResult.riskLevel === 'HIGH_RISK' ? 'REJECTED' : (modResult.riskLevel === 'MEDIUM_RISK' ? 'PENDING' : 'APPROVED');

    let returnedError: any = null;

    const result = await db.transaction(async (tx: DbTransaction) => {
      const [newPost] = await tx.insert(posts).values({
        userId: currentUserId,
        content: content || null,
        visibility: finalVisibility as any,
        postType: parsed.data.postType,
        contentWarning: parsed.data.contentWarning || null,
        moderationStatus: modStatus
      }).returning();
      
      if (modStatus !== 'APPROVED') {
        await tx.insert(moderationLogs).values({
           entityType: 'POST',
           entityId: newPost.id,
           userId: currentUserId,
           status: modStatus === 'PENDING' ? 'PENDING' : 'RESOLVED',
           actionTaken: modStatus === 'REJECTED' ? 'REJECTED' : null,
           riskLevel: modResult.riskLevel,
           category: modResult.category,
           reason: modResult.reason || null
        });
      }

      if (modStatus === 'REJECTED') {
         returnedError = { code: "POLICY_VIOLATION", message: "İçeriğiniz topluluk kurallarına uygun olmadığı için yayınlanamadı." };
         return null;
      }
      
      if (parsed.data.postType === 'POLL' && parsed.data.pollOptions) {
         const optionsToInsert = parsed.data.pollOptions.map((text, i) => ({
             postId: newPost.id,
             text,
             order: i
         }));
         await tx.insert(pollOptions).values(optionsToInsert);
      }

      
      

      const extractedMentions = extractMentions(content);
      if (extractedMentions.length > 0) {
        // Find users by username and get their mention preferences
        const mentionedUsers = await tx.select({ 
          id: users.id, 
          username: users.username,
          mentionPreference: profiles.mentionPreference
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(inArray(users.username, extractedMentions));
        
        for (const mUser of mentionedUsers) {
          if (mUser.id !== currentUserId) {
            let canMention = true;
            if (mUser.mentionPreference === 'NONE') {
              canMention = false;
            } else if (mUser.mentionPreference === 'FOLLOWERS') {
              // Target user (mUser.id) must follow the actor (currentUserId)
              // This is the same logic as message preferences "FOLLOWERS"
              const isFollowedByTarget = await tx.select().from(follows).where(and(eq(follows.followerId, mUser.id), eq(follows.followingId, currentUserId))).limit(1);
              if (isFollowedByTarget.length === 0) {
                canMention = false;
              }
            }

            if (canMention) {
              await tx.insert(postMentions).values({
                postId: newPost.id,
                mentionedUserId: mUser.id,
                actorUserId: currentUserId
              }).onConflictDoNothing();
              
              // Send notification
              if (modStatus === 'APPROVED') {
                await notify(currentUserId, mUser.id, 'mention', newPost.id);
              }
            }
          }
        }
      }
      
      const extractedTags = extractHashtags(content);
      if (extractedTags.length > 0) {
        for (const tag of extractedTags) {
          const normalized = normalizeHashtag(tag);
          const [insertedTag] = await tx.insert(hashtags)
            .values({ name: tag, normalizedName: normalized, usageCount: 1 })
            .onConflictDoUpdate({
              target: hashtags.normalizedName,
              set: { usageCount: sql`${hashtags.usageCount} + 1` }
            }).returning();
          
          await tx.insert(postHashtags).values({
            postId: newPost.id,
            hashtagId: insertedTag.id
          }).onConflictDoNothing();
        }
      }
      
      if (media && media.length > 0) {
        await tx.insert(postMedia).values(
          media.map((m: any, i: number) => ({
            postId: newPost.id,
            mediaUrl: m.url,
            mediaType: m.type,
            sortOrder: i,
          }))
        );
      }

      let pPollOptions: any = undefined;
      if (parsed.data.postType === 'POLL' && parsed.data.pollOptions) {
        const optionsWithVotes = parsed.data.pollOptions.map((opt, i) => ({
           id: -i, // temp id for optimistic UI
           text: opt,
           order: i,
           voteCount: 0
        }));
        pPollOptions = {
          options: optionsWithVotes,
          totalVotes: 0,
          userVotedOptionId: null
        };
      }

      const postWithRelations = {
        ...newPost,
        pollData: pPollOptions,
        user: {
           id: requireAuthContext(req),
           username: req.user!.username
        },
        repostCount: 0,
        isReposted: false,
        likeCount: 0,
        isLiked: false,
        commentCount: 0,
        isSaved: false,
        media: media || []
      };
      
      return postWithRelations;
    });

    if (returnedError) {
      return res.status(403).json({ success: false, error: returnedError });
    }
    
    // Official Account Notifications
    (async () => {
      try {
        const { users, follows } = await import("../../src/db/schema.js");
        const { notify } = await import("../utils/notifications.js");
        
        const author = await db.select({ 
            isOfficialAccount: users.isOfficialAccount, 
            officialNotifyEnabled: users.officialNotifyEnabled 
        }).from(users).where(eq(users.id, currentUserId)).limit(1);
        
        if (author.length > 0 && author[0].isOfficialAccount && author[0].officialNotifyEnabled) {
            const followers = await db.select({ followerId: follows.followerId, preference: follows.notificationPreference })
              .from(follows)
              .where(eq(follows.followingId, currentUserId));
              
            // Batch insert notifications
            const { notifications } = await import("../../src/db/schema.js");
            const notifsToInsert = followers
                .filter((f: any) => f.preference !== 'none')
                .map((f: any) => ({
                    recipientId: f.followerId,
                    actorId: currentUserId,
                    type: 'post',
                    postId: result.id,
                    isRead: false
                }));
            if (notifsToInsert.length > 0) {
                // Insert in chunks of 1000 to avoid DB limits
                const chunkSize = 1000;
                for (let i = 0; i < notifsToInsert.length; i += chunkSize) {
                    await db.insert(notifications).values(notifsToInsert.slice(i, i + chunkSize)).onConflictDoNothing();
                }
            }
        }
      } catch (err) {
        console.error("Failed to generate official notifications:", err);
      }
    })();

    res.status(201).json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// DELETE /posts/:id

// Edit Post
postsRouter.patch("/:id", requireAuth, strictLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    const { content: postContent } = req.body;
    
    if (typeof postContent !== 'string') {
        return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz içerik." }});
    }
    
    const postRecord = await db.select().from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    

    
    if (postRecord[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz işlem." }});
    
    const modResult = await moderateContent(postContent);
    const modStatus = modResult.riskLevel === 'HIGH_RISK' ? 'REJECTED' : (modResult.riskLevel === 'MEDIUM_RISK' ? 'PENDING' : 'APPROVED');

    await db.update(posts)
      .set({ content: postContent, moderationStatus: modStatus, updatedAt: new Date() })
      .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
      
    if (modStatus !== 'APPROVED') {
      await db.insert(moderationLogs).values({
         entityType: 'POST',
         entityId: postId,
         userId: currentUserId,
         status: modStatus === 'PENDING' ? 'PENDING' : 'RESOLVED',
         actionTaken: modStatus === 'REJECTED' ? 'REJECTED' : null,
         riskLevel: modResult.riskLevel,
         category: modResult.category,
         reason: modResult.reason || null
      });
    }

    if (modStatus === 'REJECTED') {
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "İçeriğiniz topluluk kurallarına uygun olmadığı için güncellenemedi." }});
    }
      
    res.json({ success: true, data: { message: "Gönderi güncellendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

postsRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    
    const postRecord = await db.select().from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    if (postRecord[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz işlem." }});
    
    
    const postTags = await db.select().from(postHashtags).where(eq(postHashtags.postId, postId));
    if (postTags.length > 0) {
      const tagIds = postTags.map((pt: any) => pt.hashtagId);
      await db.update(hashtags)
        .set({ usageCount: sql`${hashtags.usageCount} - 1` })
        .where(inArray(hashtags.id, tagIds));
    }
    
    // Find media to delete files from disk
    const media = await db.select().from(postMedia).where(eq(postMedia.postId, postId));
    media.forEach((m: any) => {
      try {
        if (!m.mediaUrl || !m.mediaUrl.startsWith('/uploads/') || m.mediaUrl.includes('..')) {
          return;
        }
        const filePath = path.join(process.cwd(), m.mediaUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.error("File deletion failed:", e);
      }
    });

    await db.delete(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
    res.json({ success: true, data: { message: "Gönderi silindi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// POST /posts/:id/like
postsRouter.post("/:id/like", requireAuth, standardLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    
    const postRecord = await db.select().from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    
    
    
    let wasLiked = false;
    try {
      await db.transaction(async (tx: DbTransaction) => {
        const existing = await tx.select().from(likes).where(and(eq(likes.postId, postId), eq(likes.userId, currentUserId))).limit(1);
        if (existing.length === 0) {
          await tx.insert(likes).values({ postId, userId: currentUserId });
          await tx.update(posts)
            .set({ baseScore: sql`GREATEST(${posts.baseScore} + 1, 0)` })
            .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
          wasLiked = true;
        }
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== '23505') throw e;
    }
    
    if (wasLiked) {
      await notify(currentUserId, postRecord[0].userId, 'like', postId);
    }
    
    res.json({ success: true, data: { message: "Beğenildi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// DELETE /posts/:id/like
postsRouter.delete("/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    const postRecord = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    await db.transaction(async (tx: DbTransaction) => {
      const existing = await tx.select().from(likes).where(and(eq(likes.postId, postId), eq(likes.userId, currentUserId))).limit(1);
      if (existing.length > 0) {
        await tx.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, currentUserId)));
        if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
          await tx.update(posts)
            .set({ baseScore: sql`GREATEST(${posts.baseScore} - 1, 0)` })
            .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
        }
      }
    });
    res.json({ success: true, data: { message: "Beğeni kaldırıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// POST /posts/:id/comments
postsRouter.post("/:id/comments", requireAuth, strictLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    const parsed = createCommentSchema.safeParse(req.body);
    
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
    
    const postRecord = await db.select().from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    
    const modResult = await moderateContent(parsed.data.content);
    const modStatus = modResult.riskLevel === 'HIGH_RISK' ? 'REJECTED' : (modResult.riskLevel === 'MEDIUM_RISK' ? 'PENDING' : 'APPROVED');

    let returnedError: any = null;

    const comment = await db.transaction(async (tx: DbTransaction) => {
      const [newComment] = await tx.insert(comments).values({
        postId,
        userId: currentUserId,
        content: parsed.data.content,
        parentId: parsed.data.parentId,
        moderationStatus: modStatus
      }).returning();
      
      if (modStatus !== 'APPROVED') {
        await tx.insert(moderationLogs).values({
           entityType: 'COMMENT',
           entityId: newComment.id,
           userId: currentUserId,
           status: modStatus === 'PENDING' ? 'PENDING' : 'RESOLVED',
           actionTaken: modStatus === 'REJECTED' ? 'REJECTED' : null,
           riskLevel: modResult.riskLevel,
           category: modResult.category,
           reason: modResult.reason || null
        });
      }

      if (modStatus === 'REJECTED') {
         returnedError = { code: "POLICY_VIOLATION", message: "Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı." };
         return null;
      }
      
      
      const extractedMentions = extractMentions(parsed.data.content);
      if (extractedMentions.length > 0) {
        const mentionedUsers = await tx.select({ 
          id: users.id, 
          username: users.username,
          mentionPreference: profiles.mentionPreference
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(inArray(users.username, extractedMentions));
        
        for (const mUser of mentionedUsers) {
          if (mUser.id !== currentUserId) {
            let canMention = true;
            if (mUser.mentionPreference === 'NONE') {
              canMention = false;
            } else if (mUser.mentionPreference === 'FOLLOWERS') {
              const isFollowedByTarget = await tx.select().from(follows).where(and(eq(follows.followerId, mUser.id), eq(follows.followingId, currentUserId))).limit(1);
              if (isFollowedByTarget.length === 0) {
                canMention = false;
              }
            }

            if (canMention) {
              await tx.insert(commentMentions).values({
                commentId: newComment.id,
                mentionedUserId: mUser.id,
                actorUserId: currentUserId
              }).onConflictDoNothing();
              
              if (modStatus === 'APPROVED') {
                await notify(currentUserId, mUser.id, 'mention', postId, newComment.id);
              }
            }
          }
        }
      }
if (postRecord[0].userId !== currentUserId) {
        await tx.update(posts)
          .set({ baseScore: sql`GREATEST(${posts.baseScore} + 3, 0)` })
          .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
      }
        
      const userProfile = await tx.select({ username: users.username, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl }).from(users).leftJoin(profiles, eq(users.id, profiles.userId)).where(eq(users.id, currentUserId)).limit(1);
      return { ...newComment, user: userProfile[0] };
    });

    if (returnedError) {
       return res.status(403).json({ success: false, error: returnedError });
    }
    
    if (modStatus === 'APPROVED') {
      await notify(currentUserId, postRecord[0].userId, 'comment', postId, comment.id);
      if (parsed.data.parentId) {
        const parentRecord = await db.select().from(comments).where(eq(comments.id, parsed.data.parentId)).limit(1);
        if (parentRecord.length > 0) {
          await notify(currentUserId, parentRecord[0].userId, 'comment_reply', postId, comment.id);
        }
      }
    }
    
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// DELETE /comments/:id

// Edit Comment
postsRouter.patch("/comments/:id", requireAuth, strictLimiter, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    const { content: commentContent } = req.body;
    
    if (typeof commentContent !== 'string' || commentContent.trim().length === 0) {
        return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz yorum içeriği." }});
    }
    
    const c = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
    if (c.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Yorum bulunamadı." }});
    if (c[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." }});
    
    const modResult = await moderateContent(commentContent);
    const modStatus = modResult.riskLevel === 'HIGH_RISK' ? 'REJECTED' : (modResult.riskLevel === 'MEDIUM_RISK' ? 'PENDING' : 'APPROVED');

    await db.update(comments)
      .set({ content: commentContent, moderationStatus: modStatus, updatedAt: new Date() })
      .where(eq(comments.id, commentId));
      
    if (modStatus !== 'APPROVED') {
      await db.insert(moderationLogs).values({
         entityType: 'COMMENT',
         entityId: commentId,
         userId: currentUserId,
         status: modStatus === 'PENDING' ? 'PENDING' : 'RESOLVED',
         actionTaken: modStatus === 'REJECTED' ? 'REJECTED' : null,
         riskLevel: modResult.riskLevel,
         category: modResult.category,
         reason: modResult.reason || null
      });
    }

    if (modStatus === 'REJECTED') {
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "İçeriğiniz topluluk kurallarına uygun olmadığı için güncellenemedi." }});
    }
      
    res.json({ success: true, data: { message: "Yorum güncellendi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

postsRouter.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    
    const c = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
    if (c.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Yorum bulunamadı." }});
    if (c[0].userId !== currentUserId) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkisiz." }});
    
    const postRecord = await db.select().from(posts).where(eq(posts.id, c[0].postId)).limit(1);
    await db.transaction(async (tx: DbTransaction) => {
      await tx.delete(comments).where(eq(comments.id, commentId));
      if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
        await tx.update(posts)
          .set({ baseScore: sql`GREATEST(${posts.baseScore} - 3, 0)` })
          .where(eq(posts.id, c[0].postId));
      }
    });
    
    res.json({ success: true, data: { message: "Yorum silindi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// POST /posts/:id/bookmark
postsRouter.post("/:id/bookmark", requireAuth, standardLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    const postRecord = await db.select().from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});

    try {
      await db.transaction(async (tx: DbTransaction) => {
        const existing = await tx.select().from(bookmarks).where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, currentUserId))).limit(1);
        if (existing.length === 0) {
          await tx.insert(bookmarks).values({ postId, userId: currentUserId });
          
          if (postRecord[0].userId !== currentUserId) {
            await tx.update(posts)
              .set({ baseScore: sql`GREATEST(${posts.baseScore} + 4, 0)` })
              .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
          }
        }
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== '23505') throw e;
    }

    res.json({ success: true, data: { message: "Kaydedildi." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// DELETE /posts/:id/bookmark
postsRouter.delete("/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    
    const postRecord = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    await db.transaction(async (tx: DbTransaction) => {
      const existing = await tx.select().from(bookmarks).where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, currentUserId))).limit(1);
      if (existing.length > 0) {
        await tx.delete(bookmarks).where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, currentUserId)));
        if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
          await tx.update(posts)
            .set({ baseScore: sql`GREATEST(${posts.baseScore} - 4, 0)` })
            .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
        }
      }
    });

    res.json({ success: true, data: { message: "Kaydedilenlerden çıkarıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// POST /posts/:id/repost
postsRouter.post("/:id/repost", requireAuth, standardLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    
    const postRecord = await db.select().from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (postRecord.length === 0) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." }});
    
    
    
    let wasReposted = false;
    try {
      await db.transaction(async (tx: DbTransaction) => {
        const existing = await tx.select().from(reposts).where(and(eq(reposts.postId, postId), eq(reposts.userId, currentUserId))).limit(1);
        if (existing.length === 0) {
          await tx.insert(reposts).values({ postId, userId: currentUserId });
          await tx.update(posts)
            .set({ baseScore: sql`GREATEST(${posts.baseScore} + 4, 0)` })
            .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
          wasReposted = true;
        }
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== '23505') throw e;
    }
    
    if (wasReposted && postRecord[0].userId !== currentUserId) {
      await notify(currentUserId, postRecord[0].userId, 'repost', postId);
    }
    
    res.json({ success: true, data: { message: "Yeniden paylaşıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});

// DELETE /posts/:id/repost
postsRouter.delete("/:id/repost", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = requireAuthContext(req);
    if (!(await verifyPostAccess(postId, currentUserId))) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu gönderiye erişiminiz yok." }});
    
    const postRecord = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    await db.transaction(async (tx: DbTransaction) => {
      const existing = await tx.select().from(reposts).where(and(eq(reposts.postId, postId), eq(reposts.userId, currentUserId))).limit(1);
      if (existing.length > 0) {
        await tx.delete(reposts).where(and(eq(reposts.postId, postId), eq(reposts.userId, currentUserId)));
        if (postRecord.length > 0 && postRecord[0].userId !== currentUserId) {
          await tx.update(posts)
            .set({ baseScore: sql`GREATEST(${posts.baseScore} - 4, 0)` })
            .where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId))));
        }
      }
    });
    
    res.json({ success: true, data: { message: "Yeniden paylaşım kaldırıldı." }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." }});
  }
});


// POST /api/v1/posts/:id/collaborators
postsRouter.post("/:id/collaborators", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string, 10);
    const { targetUserId } = req.body;
    
    if (isNaN(postId) || typeof targetUserId !== 'number') {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz veriler." } });
      return;
    }
    
    const currentUserId = requireAuthContext(req);
    
    if (targetUserId === currentUserId) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Kendinizi ortak üretici olarak ekleyemezsiniz." } });
      return;
    }

    const post = await db.select({ userId: posts.userId }).from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (post.length === 0) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." } });
      return;
    }
    if (post[0].userId !== currentUserId) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu işlem için yetkiniz yok." } });
      return;
    }

    const target = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (target.length === 0) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." } });
      return;
    }

    const existing = await db.select().from(postCollaborators)
      .where(and(eq(postCollaborators.postId, postId), eq(postCollaborators.userId, targetUserId)))
      .limit(1);
      
    if (existing.length > 0) {
      if (existing[0].status === 'pending') {
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu kullanıcıya zaten davet gönderilmiş." } });
        return;
      } else if (existing[0].status === 'accepted') {
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Bu kullanıcı zaten ortak üretici." } });
        return;
      } else {
        await db.update(postCollaborators)
          .set({ status: 'pending', updatedAt: new Date() })
          .where(eq(postCollaborators.id, existing[0].id));
      }
    } else {
      await db.insert(postCollaborators).values({
        postId,
        userId: targetUserId,
        status: 'pending'
      });
    }

    await notify(currentUserId, targetUserId, 'post_collaborator_invite', postId);
    
    res.json({ success: true, message: "Davet gönderildi." });
  } catch (error) {
    console.error("Invite collaborator error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// DELETE /api/v1/posts/:id/collaborators/:userId
postsRouter.delete("/:id/collaborators/:userId", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string, 10);
    const targetUserId = parseInt(req.params.userId as string, 10);
    
    if (isNaN(postId) || isNaN(targetUserId)) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz ID." } });
      return;
    }
    
    const currentUserId = requireAuthContext(req);
    
    const post = await db.select({ userId: posts.userId }).from(posts).where(and(eq(posts.id, postId), or(eq(posts.moderationStatus, 'APPROVED'), eq(posts.userId, currentUserId)))).limit(1);
    if (post.length === 0) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Gönderi bulunamadı." } });
      return;
    }
    
    if (post[0].userId !== currentUserId && currentUserId !== targetUserId) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu işlem için yetkiniz yok." } });
      return;
    }

    await db.delete(postCollaborators)
      .where(and(eq(postCollaborators.postId, postId), eq(postCollaborators.userId, targetUserId)));
      
    res.json({ success: true, message: "Ortak üretici kaldırıldı." });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

// GET /api/v1/posts/:id/collaborators
postsRouter.get("/:id/collaborators", async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string, 10);
    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz ID." } });
      return;
    }
    
    const list = await db.select({
      userId: users.id,
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      status: postCollaborators.status,
    })
    .from(postCollaborators)
    .innerJoin(users, eq(postCollaborators.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(
      eq(postCollaborators.postId, postId),
      or(eq(postCollaborators.status, 'accepted'), eq(postCollaborators.status, 'pending'))
    ));
    
    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Get post collaborators error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});
