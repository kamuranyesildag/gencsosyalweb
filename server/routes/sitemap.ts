import { Router } from "express";
import { db } from "../../src/db/index.js";
import { profiles, users, posts, communities, projects, hashtags, teams } from "../../src/db/schema.js";
import { eq, and, isNull, desc, gt } from "drizzle-orm";

export const sitemapRouter = Router();

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(value?: Date | string | null, fallback?: string): string {
  const fb = fallback || new Date().toISOString().split("T")[0];
  if (!value) return fb;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? fb : d.toISOString().split("T")[0];
}

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  const domain = (process.env.CANONICAL_DOMAIN || "https://gencsosyal.com").replace(/\/+$/, "");
  const today = new Date().toISOString().split("T")[0];

  // Fault-tolerant dynamic queries: a transient failure in one table never causes HTTP 500
  let publicProfiles: Array<{ username: string; updatedAt: Date | null }> = [];
  let publicPosts: Array<{ id: number; updatedAt: Date | null }> = [];
  let publicCommunities: Array<{ slug: string; updatedAt: Date | null }> = [];
  let publicTeams: Array<{ slug: string; updatedAt: Date | null }> = [];
  let publicProjects: Array<{ id: number; updatedAt: Date | null }> = [];
  let publicHashtags: Array<{ name: string; createdAt: Date | null }> = [];

  try {
    publicProfiles = await db
      .select({
        username: users.username,
        updatedAt: users.updatedAt,
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
  } catch (err) {
    console.warn("[Sitemap] Profiles query skipped:", err);
  }

  try {
    publicPosts = await db
      .select({
        id: posts.id,
        updatedAt: posts.updatedAt,
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
  } catch (err) {
    console.warn("[Sitemap] Posts query skipped:", err);
  }

  try {
    publicCommunities = await db
      .select({
        slug: communities.slug,
        updatedAt: communities.updatedAt,
      })
      .from(communities)
      .where(and(isNull(communities.deletedAt), eq(communities.isPrivate, false)))
      .limit(1000);
  } catch (err) {
    console.warn("[Sitemap] Communities query skipped:", err);
  }

  try {
    publicTeams = await db
      .select({
        slug: teams.slug,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .where(and(isNull(teams.deletedAt), eq(teams.visibility, "PUBLIC")))
      .orderBy(desc(teams.updatedAt))
      .limit(1000);
  } catch (err) {
    console.warn("[Sitemap] Teams query skipped:", err);
  }

  try {
    publicProjects = await db
      .select({
        id: projects.id,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(users, eq(projects.userId, users.id))
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(users.isActive, true),
          eq(profiles.allowSearchEngineIndexing, true),
          eq(profiles.isPrivate, false)
        )
      )
      .orderBy(desc(projects.createdAt))
      .limit(1000);
  } catch (err) {
    console.warn("[Sitemap] Projects query skipped:", err);
  }

  try {
    publicHashtags = await db
      .select({
        name: hashtags.name,
        createdAt: hashtags.createdAt,
      })
      .from(hashtags)
      .where(gt(hashtags.usageCount, 0))
      .orderBy(desc(hashtags.usageCount))
      .limit(1000);
  } catch (err) {
    console.warn("[Sitemap] Hashtags query skipped:", err);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Only genuine, live, canonical 200-OK indexable static hubs (no dead /faq or /about links!)
  const statics = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/explore", priority: "0.9", changefreq: "hourly" },
    { path: "/projects", priority: "0.9", changefreq: "daily" },
    { path: "/communities", priority: "0.9", changefreq: "daily" },
    { path: "/teams", priority: "0.9", changefreq: "daily" },
    { path: "/teknofest", priority: "0.9", changefreq: "daily" },
    { path: "/quiz", priority: "0.8", changefreq: "daily" },
    { path: "/youth-league", priority: "0.8", changefreq: "daily" },
    { path: "/youth-league/leaderboard", priority: "0.7", changefreq: "daily" },
    { path: "/youth-league/archive", priority: "0.6", changefreq: "weekly" },
    { path: "/welcome", priority: "0.8", changefreq: "weekly" },
    { path: "/sitemap", priority: "0.5", changefreq: "weekly" },
    { path: "/privacy", priority: "0.4", changefreq: "monthly" },
    { path: "/terms", priority: "0.4", changefreq: "monthly" },
    { path: "/kvkk", priority: "0.4", changefreq: "monthly" },
  ];

  statics.forEach((s) => {
    xml += `  <url>\n    <loc>${escapeXml(`${domain}${s.path}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${s.changefreq}</changefreq>\n    <priority>${s.priority}</priority>\n  </url>\n`;
  });

  publicProfiles.forEach((p) => {
    if (!p.username) return;
    const lastmod = formatDate(p.updatedAt, today);
    const url = `${domain}/profile/${encodeURIComponent(p.username)}`;
    xml += `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  publicPosts.forEach((p) => {
    const lastmod = formatDate(p.updatedAt, today);
    const url = `${domain}/post/${p.id}`;
    xml += `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });

  publicCommunities.forEach((c) => {
    if (!c.slug) return;
    const lastmod = formatDate(c.updatedAt, today);
    const url = `${domain}/communities/${encodeURIComponent(c.slug)}`;
    xml += `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  publicTeams.forEach((t) => {
    if (!t.slug) return;
    const lastmod = formatDate(t.updatedAt, today);
    const url = `${domain}/teams/${encodeURIComponent(t.slug)}`;
    xml += `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  publicProjects.forEach((p) => {
    const lastmod = formatDate(p.updatedAt, today);
    const url = `${domain}/projects/${p.id}`;
    xml += `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  publicHashtags.forEach((h) => {
    if (!h.name) return;
    const lastmod = formatDate(h.createdAt, today);
    const url = `${domain}/hashtags/${encodeURIComponent(h.name)}`;
    xml += `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  });

  xml += `</urlset>\n`;

  res.header("Content-Type", "application/xml; charset=utf-8");
  res.header("Cache-Control", "public, max-age=1800, s-maxage=3600");
  res.status(200).send(xml);
});
