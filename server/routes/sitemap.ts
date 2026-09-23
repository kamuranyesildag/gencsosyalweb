import { Router } from "express";
import { db } from "../../src/db/index.js";
import { profiles, users, posts, communities, projects, hashtags } from "../../src/db/schema.js";
import { eq, and, isNull, desc, gt } from "drizzle-orm";

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const rawDomain = process.env.APP_URL || process.env.VITE_PUBLIC_URL || "https://gencsosyal.com";
    const domain = rawDomain.replace(/\/+$/, "");
    const today = new Date().toISOString().split("T")[0];
    
    // Profiles: Only active users who allow search engine indexing and whose profile is NOT private
    const publicProfiles = await db
      .select({ 
        username: users.username,
        updatedAt: users.updatedAt
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          eq(users.isActive, true),
          eq(profiles.allowSearchEngineIndexing, true),
          eq(profiles.isPrivate, false)
        )
      )
      .limit(5000);

    // Posts: Only public, approved posts from active, public, index-allowed authors
    const publicPosts = await db
      .select({ 
        id: posts.id,
        updatedAt: posts.updatedAt
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(posts.visibility, "PUBLIC"),
          eq(posts.moderationStatus, "APPROVED"),
          isNull(posts.communityId),
          eq(users.isActive, true),
          eq(profiles.allowSearchEngineIndexing, true),
          eq(profiles.isPrivate, false)
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(5000);

    // Communities
    const publicCommunities = await db
      .select({ 
        slug: communities.slug,
        updatedAt: communities.updatedAt
      })
      .from(communities)
      .limit(1000);

    // Projects
    const publicProjects = await db
      .select({ 
        id: projects.id,
        updatedAt: projects.updatedAt
      })
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(1000);

    // Hashtags (Only hashtags with positive usage count)
    const publicHashtags = await db
      .select({ 
        name: hashtags.name,
        createdAt: hashtags.createdAt
      })
      .from(hashtags)
      .where(gt(hashtags.usageCount, 0))
      .orderBy(desc(hashtags.usageCount))
      .limit(1000);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const statics = [
      { path: "", priority: "1.0", changefreq: "daily" },
      { path: "/explore", priority: "0.9", changefreq: "hourly" },
      { path: "/projects", priority: "0.8", changefreq: "daily" },
      { path: "/communities", priority: "0.8", changefreq: "daily" },
      { path: "/privacy", priority: "0.3", changefreq: "monthly" },
      { path: "/terms", priority: "0.3", changefreq: "monthly" },
    ];

    statics.forEach((s) => {
      xml += `  <url>\n    <loc>${domain}${s.path || "/"}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${s.changefreq}</changefreq>\n    <priority>${s.priority}</priority>\n  </url>\n`;
    });

    // Profile pages
    publicProfiles.forEach((p: any) => {
      const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today;
      xml += `  <url>\n    <loc>${domain}/profile/${encodeURIComponent(p.username)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Post pages
    publicPosts.forEach((p: any) => {
      const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today;
      xml += `  <url>\n    <loc>${domain}/post/${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Community pages
    publicCommunities.forEach((c: any) => {
      const lastmod = c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : today;
      xml += `  <url>\n    <loc>${domain}/communities/${encodeURIComponent(c.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Project pages
    publicProjects.forEach((p: any) => {
      const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today;
      xml += `  <url>\n    <loc>${domain}/projects/${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Hashtag pages (Plural '/hashtags/' matching actual frontend router)
    publicHashtags.forEach((h: any) => {
      const lastmod = h.createdAt ? new Date(h.createdAt).toISOString().split("T")[0] : today;
      xml += `  <url>\n    <loc>${domain}/hashtags/${encodeURIComponent(h.name)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).end();
  }
});
