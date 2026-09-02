import { db } from "../../src/db/index.js";
import { blocks } from "../../src/db/schema.js";
import { eq, or } from "drizzle-orm";

export async function getBlockedIds(userId: number): Promise<number[]> {
  const records = await db.select().from(blocks).where(or(eq(blocks.blockerId, userId), eq(blocks.blockedId, userId)));
  const ids = new Set<number>();
  records.forEach((r: any) => {
    if (r.blockerId !== userId) ids.add(r.blockerId);
    if (r.blockedId !== userId) ids.add(r.blockedId);
  });
  return Array.from(ids);
}
