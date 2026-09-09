import { db } from "../../src/db/index.js";
import { posts, follows, profiles } from "../../src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { getBlockedIds } from "./blocks.js";

export async function verifyPostAccess(postId: number, currentUserId: number | null | undefined): Promise<boolean> {
  const postRecord = await db.select({
    userId: posts.userId,
    visibility: posts.visibility
  }).from(posts).where(eq(posts.id, postId)).limit(1);

  if (postRecord.length === 0) return false;

  const post = postRecord[0];
  if (post.userId === currentUserId) return true;

  const blockedIds = currentUserId ? await getBlockedIds(currentUserId) : [];
  if (blockedIds.includes(post.userId)) return false;

  if (post.visibility === 'PRIVATE') return false;

  // Check profile privacy
  const profileRecord = await db.select({ isPrivate: profiles.isPrivate }).from(profiles).where(eq(profiles.userId, post.userId)).limit(1);
  const isPrivateProfile = profileRecord.length > 0 ? profileRecord[0].isPrivate : false;

  if (post.visibility === 'FOLLOWERS' || isPrivateProfile) {
    if (!currentUserId) return false;
    const follow = await db.select().from(follows).where(
      and(
        eq(follows.followerId, currentUserId), 
        eq(follows.followingId, post.userId),
        eq(follows.status, 'accepted')
      )
    ).limit(1);
    
    if (follow.length === 0) return false;
  }

  return true;
}
