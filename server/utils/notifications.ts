import { db } from "../../src/db/index.js";
import { notifications, notificationPreferences } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";

export async function notify(actorId: number, recipientId: number, type: string, postId?: number, commentId?: number, projectId?: number, tx?: any) {
  if (actorId === recipientId) return;

  try {
    const execDb = tx || db;
    const prefs = await execDb.select().from(notificationPreferences).where(eq(notificationPreferences.userId, recipientId)).limit(1);
    
    // Default values if preference not found
    const pref = prefs.length > 0 ? prefs[0] : {
      pushEnabled: true,
      emailEnabled: true,
      likes: true,
      comments: true,
      mentions: true,
      follows: true,
      messages: true,
      newsletters: false,
    };

    // Check specific type
    if (type.includes('like') || type.includes('reaction')) {
      if (!pref.likes) return;
    } else if (type.includes('comment') || type.includes('reply')) {
      if (!pref.comments) return;
    } else if (type.includes('mention')) {
      if (!pref.mentions) return;
    } else if (type.includes('follow')) {
      if (!pref.follows) return;
    } else if (type.includes('message')) {
      if (!pref.messages) return;
    }
    
    await execDb.insert(notifications).values({ actorId, recipientId, type, postId, commentId, projectId });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}
