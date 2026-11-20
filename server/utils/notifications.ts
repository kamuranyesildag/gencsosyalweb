import { db } from "../../src/db/index.js";
import {
  notifications,
  notificationPreferences,
  users,
  profiles,
  posts,
  comments,
  projects,
} from "../../src/db/schema.js";
import { eq } from "drizzle-orm";
import {
  sendSocialNotificationEmail,
  checkSocialEmailThrottle,
} from "./mailer.js";

const resolveThrottleCategory = (type: string): { key: string; cooldownMs: number } => {
  if (type.includes("like") || type.includes("reaction")) {
    return { key: "likes", cooldownMs: 5 * 60 * 1000 };
  }
  if (type.includes("comment") || type.includes("reply")) {
    return { key: "comments", cooldownMs: 2 * 60 * 1000 };
  }
  if (type.includes("mention")) {
    return { key: "mentions", cooldownMs: 60 * 1000 };
  }
  if (type.includes("follow")) {
    return { key: "follows", cooldownMs: 2 * 60 * 1000 };
  }
  if (type.includes("repost")) {
    return { key: "repost", cooldownMs: 3 * 60 * 1000 };
  }
  return { key: type, cooldownMs: 60 * 1000 };
};

const dispatchSocialNotificationEmail = async (
  actorId: number,
  recipientId: number,
  type: string,
  postId?: number,
  commentId?: number,
  projectId?: number
) => {
  try {
    const throttle = resolveThrottleCategory(type);
    if (checkSocialEmailThrottle(recipientId, throttle.key, throttle.cooldownMs)) {
      return;
    }

    const [[recipient], [actor]] = await Promise.all([
      db
        .select({
          email: users.email,
          username: users.username,
          isActive: users.isActive,
          displayName: profiles.displayName,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.id, recipientId))
        .limit(1),
      db
        .select({
          username: users.username,
          displayName: profiles.displayName,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.id, actorId))
        .limit(1),
    ]);

    if (!recipient?.email || !recipient.isActive || !actor) {
      return;
    }

    let snippet: string | undefined;
    let ctaPath: string | undefined;

    if (commentId) {
      const [commentRow] = await db
        .select({ content: comments.content, postId: comments.postId })
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);
      if (commentRow?.content) {
        snippet = commentRow.content;
      }
      if (commentRow?.postId || postId) {
        ctaPath = `/post/${commentRow?.postId || postId}`;
      }
    } else if (postId) {
      const [postRow] = await db
        .select({ content: posts.content })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);
      if (postRow?.content) {
        snippet = postRow.content;
      }
      ctaPath = `/post/${postId}`;
    } else if (projectId) {
      const [projectRow] = await db
        .select({ title: projects.title, description: projects.description })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);
      if (projectRow) {
        snippet = projectRow.title + (projectRow.description ? ` — ${projectRow.description}` : "");
      }
      ctaPath = "/notifications";
    } else if (type.includes("follow")) {
      ctaPath = type === "follow_request" ? "/notifications" : `/profile/${encodeURIComponent(actor.username)}`;
    }

    await sendSocialNotificationEmail({
      to: recipient.email,
      recipientName: recipient.displayName || recipient.username,
      type,
      actorName: actor.displayName || actor.username,
      actorUsername: actor.username,
      snippet,
      ctaPath,
    });
  } catch (err) {
    console.warn("[Notification Email] E-posta bildirimi gönderilemedi:", err);
  }
};

export async function notify(
  actorId: number,
  recipientId: number,
  type: string,
  postId?: number,
  commentId?: number,
  projectId?: number,
  tx?: any
) {
  if (actorId === recipientId) return;

  try {
    const execDb = tx || db;
    const prefs = await execDb
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, recipientId))
      .limit(1);

    // Default values if preference not found
    const pref =
      prefs.length > 0
        ? prefs[0]
        : {
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
    if (type.includes("like") || type.includes("reaction")) {
      if (!pref.likes) return;
    } else if (type.includes("comment") || type.includes("reply")) {
      if (!pref.comments) return;
    } else if (type.includes("mention")) {
      if (!pref.mentions) return;
    } else if (type.includes("follow")) {
      if (!pref.follows) return;
    } else if (type.includes("message")) {
      if (!pref.messages) return;
    }

    await execDb.insert(notifications).values({ actorId, recipientId, type, postId, commentId, projectId });

    // Fire-and-forget preference-aware notification email (runs outside active transaction)
    if (pref.emailEnabled) {
      setImmediate(() => {
        dispatchSocialNotificationEmail(actorId, recipientId, type, postId, commentId, projectId).catch(
          (err) => console.warn("[Notification Email] Async error:", err)
        );
      });
    }
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}
