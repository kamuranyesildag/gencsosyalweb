import { db } from "./src/db/index.js";
import { likes } from "./src/db/schema.js";
import { sql, inArray } from "drizzle-orm";

async function run() {
  const postIds = [1, 2, 3];
  const currentUserId = 1;
  const likeStats = await db.select({
    postId: likes.postId,
    count: sql`count(*)`.mapWith(Number),
    isLiked: sql`MAX(CASE WHEN ${likes.userId} = ${currentUserId} THEN 1 ELSE 0 END)`.mapWith(Number)
  }).from(likes).where(inArray(likes.postId, postIds)).groupBy(likes.postId);
  console.log(likeStats);
}
