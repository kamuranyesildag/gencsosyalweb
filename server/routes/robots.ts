import { Router } from "express";

export const robotsRouter = Router();

robotsRouter.get("/robots.txt", (req, res) => {
  const domain = "https://gencsosyal.com";
  
  const content = `# Robots.txt for Genç Sosyal (https://gencsosyal.com)
User-agent: *
Disallow: /api/
Disallow: /admin
Disallow: /admin/
Disallow: /settings
Disallow: /settings/
Disallow: /messages
Disallow: /messages/
Disallow: /notifications
Disallow: /notifications/
Disallow: /bookmarks
Disallow: /bookmarks/
Disallow: /onboarding
Disallow: /onboarding/
Disallow: /create
Disallow: /create/
Disallow: /login
Disallow: /login/
Disallow: /register
Disallow: /register/
Disallow: /forgot-password
Disallow: /forgot-password/
Disallow: /reset-password
Disallow: /reset-password/
Disallow: /verify-email
Disallow: /verify-email/
Disallow: /account-suspended
Disallow: /account-suspended/
Disallow: /support/
Allow: /

Sitemap: ${domain}/sitemap.xml
Host: gencsosyal.com
`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.send(content);
});
