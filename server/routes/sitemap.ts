import { Router } from "express";
import { db } from "../../src/db/index.js";
import { profiles, users, posts, communities, projects, hashtags } from "../../src/db/schema.js";
import { eq, and, isNull, desc } from "drizzle-orm";

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const domain = process.env.VITE_PUBLIC_URL || process.env.APP_URL || "https://gencsosyal.com";
    
    // Profiles
    const publicProfiles = await db
      .select({ username: users.username })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.allowSearchEngineIndexing, true))
      .limit(5000);

    // Posts (Public, Approved, Not in community)
    const publicPosts = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(
          eq(posts.visibility, "PUBLIC"),
          eq(posts.moderationStatus, "APPROVED"),
          isNull(posts.communityId)
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(5000);

    // Communities
    const publicCommunities = await db
      .select({ slug: communities.slug })
      .from(communities)
      .limit(1000);

    // Projects
    const publicProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .limit(1000);

    // Hashtags
    const publicHashtags = await db
      .select({ name: hashtags.name })
      .from(hashtags)
      .orderBy(desc(hashtags.usageCount))
      .limit(1000);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const statics = ["/", "/explore", "/projects", "/communities"];
    statics.forEach((path) => {
      xml += `  <url>\n    <loc>${domain}${path}</loc>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    });

    // Profile pages
    publicProfiles.forEach((p: any) => {
      xml += `  <url>\n    <loc>${domain}/profile/${p.username}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Post pages
    publicPosts.forEach((p: any) => {
      xml += `  <url>\n    <loc>${domain}/post/${p.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Community pages
    publicCommunities.forEach((c: any) => {
      xml += `  <url>\n    <loc>${domain}/communities/${c.slug}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Project pages
    publicProjects.forEach((p: any) => {
      xml += `  <url>\n    <loc>${domain}/projects/${p.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Hashtag pages
    publicHashtags.forEach((h: any) => {
      xml += `  <url>\n    <loc>${domain}/hashtag/${encodeURIComponent(h.name)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).end();
  }
});
