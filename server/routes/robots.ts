import { Router } from "express";

export const robotsRouter = Router();

robotsRouter.get("/robots.txt", (req, res) => {
  const domain = (process.env.CANONICAL_DOMAIN || "https://gencsosyal.com").replace(/\/+$/, "");

  const content = `# Robots.txt for Genç Sosyal (${domain})
User-agent: *
Allow: /
Allow: /explore
Allow: /projects
Allow: /communities
Allow: /teams
Allow: /teknofest
Allow: /quiz
Allow: /youth-league
Allow: /hashtags/
Allow: /profile/
Allow: /post/
Allow: /welcome
Allow: /sitemap
Allow: /privacy
Allow: /terms
Allow: /kvkk

# Private, authenticated, and dynamic query endpoints
Disallow: /api/
Disallow: /admin
Disallow: /settings
Disallow: /messages
Disallow: /notifications
Disallow: /bookmarks
Disallow: /onboarding
Disallow: /create
Disallow: /profile/customize
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /account-suspended
Disallow: /support/
Disallow: /quiz/room/
Disallow: /youth-league/match/
Disallow: /*?q=

Sitemap: ${domain}/sitemap.xml
`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.status(200).send(content);
});
