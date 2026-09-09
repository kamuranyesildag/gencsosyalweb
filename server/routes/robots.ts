import { Router } from "express";

export const robotsRouter = Router();

robotsRouter.get("/robots.txt", (req, res) => {
  const domain = process.env.VITE_PUBLIC_URL || process.env.APP_URL || "https://gencsosyal.com";
  
  const content = `User-agent: *
Disallow: /messages
Disallow: /settings
Disallow: /admin
Disallow: /api/
Disallow: /notifications
Disallow: /bookmarks
Disallow: /search
Disallow: /onboarding
Allow: /

Sitemap: ${domain}/sitemap.xml
`;

  res.header("Content-Type", "text/plain");
  res.send(content);
});
