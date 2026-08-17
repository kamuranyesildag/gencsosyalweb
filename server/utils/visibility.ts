import { db } from "../../src/db/index.js";
import { posts, follows } from "../../src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { getBlockedIds } from "./blocks.js";

export async function verifyPostAccess(postId: number, currentUserId: number): Promise<boolean> {
  const postRecord = await db.select({
    userId: posts.userId,
    visibility: posts.visibility
  }).from(posts).where(eq(posts.id, postId)).limit(1);

  if (postRecord.length === 0) return false; // Not found implies no access to interact
  
  const post = postRecord[0];
  
  if (post.userId === currentUserId) return true;

  const blockedIds = await getBlockedIds(currentUserId);
  if (blockedIds.includes(post.userId)) return false;

  if (post.visibility === 'PRIVATE') return false;

  if (post.visibility === 'FOLLOWERS') {
    const follow = await db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, post.userId))).limit(1);
    if (follow.length === 0) return false;
  }

  return true;
}
