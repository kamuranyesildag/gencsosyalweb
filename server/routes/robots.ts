import { Router } from "express";

export const robotsRouter = Router();

robotsRouter.get("/robots.txt", (req, res) => {
  const rawDomain = process.env.APP_URL || process.env.VITE_PUBLIC_URL || "https://gencsosyal.com";
  const domain = rawDomain.replace(/\/+$/, "");
  
  const content = `User-agent: *
Disallow: /api/
Disallow: /admin
Disallow: /settings
Disallow: /messages
Disallow: /notifications
Disallow: /bookmarks
Disallow: /onboarding
Disallow: /create
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Allow: /

Sitemap: ${domain}/sitemap.xml
`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.send(content);
});
