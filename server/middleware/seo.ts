import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { db } from "../../src/db/index.js";
import { users, profiles, posts, communities } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";

const BOT_USER_AGENTS = [
  "twitterbot", "facebookexternalhit", "whatsapp", "telegrambot", 
  "linkedinbot", "slackbot", "vkshare", "skypeuripreview", 
  "discordbot", "bingbot", "yandexbot", "googlebot", "applebot"
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

export const seoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";
  
  if (!isBot(userAgent)) {
    return next();
  }

  try {
    let title = "Genç Sosyal";
    let description = "Gençlerin buluşma noktası: Genç Sosyal.";
    let imageUrl = "https://gencsosyal.com/default-og.png"; // Replace with your actual default OG image
    let url = "https://gencsosyal.com" + req.originalUrl;

    const postMatch = req.path.match(/^\/post\/(\d+)$/);
    const profileMatch = req.path.match(/^\/([a-zA-Z0-9_]{3,30})$/);
    const communityMatch = req.path.match(/^\/community\/(\d+)$/);

    if (postMatch) {
      const postId = parseInt(postMatch[1]);
      const postRecord = await db.select({
        content: posts.content,
      postType: posts.postType,
      contentWarning: posts.contentWarning,
        displayName: profiles.displayName,
        username: users.username
      }).from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(posts.id, postId)).limit(1);

      if (postRecord.length > 0) {
        const p = postRecord[0];
        title = `${p.displayName} (@${p.username}) - Genç Sosyal`;
        description = p.content ? (p.content.substring(0, 150) + (p.content.length > 150 ? "..." : "")) : "Gönderiye göz at.";
      }
    } else if (communityMatch) {
      const communityId = parseInt(communityMatch[1]);
      const commRecord = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
      if (commRecord.length > 0) {
        const c = commRecord[0];
        title = `${c.name} - Genç Sosyal Topluluğu`;
        description = c.description ? c.description.substring(0, 150) : "Bu topluluğa katıl ve tartışmalara başla.";
        if (c.avatarUrl) imageUrl = c.avatarUrl;
      }
    } else if (profileMatch && !["login", "register", "explore", "messages", "notifications", "settings", "feed", "admin"].includes(profileMatch[1].toLowerCase())) {
      const username = profileMatch[1];
      const userRecord = await db.select({
        displayName: profiles.displayName,
        bio: profiles.bio,
        avatarUrl: profiles.avatarUrl
      }).from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.username, username)).limit(1);

      if (userRecord.length > 0) {
        const u = userRecord[0];
        title = `${u.displayName} (@${username}) - Genç Sosyal`;
        description = u.bio ? u.bio.substring(0, 150) : `${u.displayName} profilini Genç Sosyal'de incele.`;
        if (u.avatarUrl) imageUrl = u.avatarUrl;
      }
    } else {
      return next();
    }

    // Return the HTML with dynamically injected meta tags
    const html = `
      <!doctype html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>
          <meta name="description" content="${description}" />
          
          <!-- Open Graph -->
          <meta property="og:type" content="website" />
          <meta property="og:url" content="${url}" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${imageUrl}" />
          
          <!-- Twitter -->
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="${url}" />
          <meta property="twitter:title" content="${title}" />
          <meta property="twitter:description" content="${description}" />
          <meta property="twitter:image" content="${imageUrl}" />
        </head>
        <body>
          <p>${description}</p>
        </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error("SEO Middleware error:", error);
    next();
  }
};
