import { Router } from "express";
import { db } from "../../src/db/index.js";
import { profiles, users } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const domain = "https://gencsosyal.com"; // Default for sitemap
    
    // Fetch public profiles that allow search engine indexing
    const publicProfiles = await db
      .select({ username: users.username })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.allowSearchEngineIndexing, true));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Profile pages
    publicProfiles.forEach((profile) => {
      xml += `  <url>\n    <loc>${domain}/profile/${profile.username}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).end();
  }
});
