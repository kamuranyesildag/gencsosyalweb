import { db } from "../../src/db/index.js";
import { notifications } from "../../src/db/schema.js";

export async function notify(actorId: number, recipientId: number, type: string, postId?: number, commentId?: number, projectId?: number) {
  if (actorId === recipientId) return;
  try {
    await db.insert(notifications).values({ actorId, recipientId, type, postId, commentId, projectId });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}
