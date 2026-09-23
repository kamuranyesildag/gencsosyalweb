import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { db } from "../../src/db/index.js";
import { users, profiles, posts, communities, projects } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";

// In-memory cache for the index.html template
let indexHtmlCache = "";

function getIndexHtml(isProd: boolean): string {
  if (indexHtmlCache) return indexHtmlCache;
  try {
    const filePath = isProd ? path.join(process.cwd(), "dist", "index.html") : path.join(process.cwd(), "index.html");
    if (fs.existsSync(filePath)) {
      indexHtmlCache = fs.readFileSync(filePath, "utf-8");
      return indexHtmlCache;
    }
  } catch (err) {
    console.error("Error reading index.html:", err);
  }
  return "";
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const seoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Only intercept GET requests that look like HTML navigation (not assets, not API)
  if (req.method !== 'GET') return next();
  if (req.path.startsWith("/api/")) return next();
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|json|woff2?|map|txt|xml|webmanifest)$/i)) return next();

  const isProd = process.env.NODE_ENV === "production";
  
  // In development, let Vite handle index.html generation. We'll only inject in production.
  // Actually, Vite injects into index.html using transformIndexHtml. 
  // For simplicity, we'll only do server-side injection in production.
  if (!isProd) {
    return next();
  }

  let template = getIndexHtml(true);
  if (!template) {
    return next(); // Fallback if template is missing
  }

  try {
    const rawDomain = process.env.APP_URL || process.env.VITE_PUBLIC_URL || "https://gencsosyal.com";
    const domain = rawDomain.replace(/\/+$/, "");
    let title = "Genç Sosyal | Türkiye'nin Gençler İçin Sosyal Medya Platformu";
    let description = "Gençlerin buluşma noktası: Genç Sosyal. Fikirlerini paylaş, topluluklara katıl ve projelere destek ol.";
    let keywords = "genç sosyal, gençlik platformu, sosyal medya, yazılımcı gençlik, açık kaynak projeler, teknoloji topluluğu, genç geliştiriciler, öğrenci projeleri, portföy paylaşımı, yazılım projeleri, türk sosyal medya, dijital topluluk, kodlama";
    let imageUrl = `${domain}/icon-512.png`;
    let url = domain + req.path;
    let shouldNoIndex = false;
    let isNotFound = false;
    
    // Default JSON-LD
    const jsonLd: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Genç Sosyal",
        "url": domain,
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Genç Sosyal",
        "url": domain,
        "logo": `${domain}/icon-512.png`
      }
    ];

    const postMatch = req.path.match(/^\/post\/(\d+)$/);
    const profileMatch = req.path.match(/^\/profile\/([a-zA-Z0-9_]{3,30})$/);
    const communityMatch = req.path.match(/^\/communities\/([a-zA-Z0-9_-]+)$/);
    const projectMatch = req.path.match(/^\/projects\/(\d+)$/);
    const hashtagMatch = req.path.match(/^\/hashtags\/([a-zA-Z0-9_\u00C0-\u017F]+)$/);

    if (postMatch) {
      const postId = parseInt(postMatch[1]);
      const postRecord = await db.select({
        content: posts.content,
        postType: posts.postType,
        visibility: posts.visibility,
        moderationStatus: posts.moderationStatus,
        createdAt: posts.createdAt,
        displayName: profiles.displayName,
        username: users.username,
        avatarUrl: profiles.avatarUrl,
        userIsActive: users.isActive,
        allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
        userIsPrivate: profiles.isPrivate
      }).from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(posts.id, postId)).limit(1);

      if (postRecord.length === 0 || postRecord[0].visibility !== 'PUBLIC' || postRecord[0].moderationStatus !== 'APPROVED' || !postRecord[0].userIsActive) {
        // Post not found, deleted or private -> Return 404 + noindex to prevent Soft 404
        isNotFound = true;
        shouldNoIndex = true;
        title = "Gönderi Bulunamadı | Genç Sosyal";
        description = "Aradığınız gönderi silinmiş veya gizli olabilir.";
      } else {
        const p = postRecord[0];
        if (!p.allowSearchEngineIndexing || p.userIsPrivate) {
          shouldNoIndex = true;
        }
        title = `${p.displayName || p.username}'nin Gönderisi | Genç Sosyal`;
        description = p.content ? (p.content.substring(0, 150) + (p.content.length > 150 ? "..." : "")) : "Gönderiye göz at.";
        
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "SocialMediaPosting",
          "author": {
            "@type": "Person",
            "name": p.displayName || p.username,
            "url": `${domain}/profile/${p.username}`,
            "image": p.avatarUrl || `${domain}/default-avatar.png`
          },
          "datePublished": p.createdAt?.toISOString(),
          "headline": title,
          "text": description,
          "url": url
        });
      }
    } else if (communityMatch) {
      const communitySlug = communityMatch[1];
      const commRecord = await db.select().from(communities).where(eq(communities.slug, communitySlug)).limit(1);
      
      if (commRecord.length === 0) {
        isNotFound = true;
        shouldNoIndex = true;
        title = "Topluluk Bulunamadı | Genç Sosyal";
        description = "Aradığınız topluluk mevcut değil.";
      } else {
        const c = commRecord[0];
        title = `${c.name} | Genç Sosyal Topluluğu`;
        description = c.description ? c.description.substring(0, 150) : "Bu topluluğa katıl ve tartışmalara başla.";
        if (c.avatarUrl) imageUrl = c.avatarUrl;
        
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": title,
          "description": description,
          "url": url
        });
      }
    } else if (profileMatch) {
      const username = profileMatch[1];
      const userRecord = await db.select({
        isActive: users.isActive,
        displayName: profiles.displayName,
        bio: profiles.bio,
        avatarUrl: profiles.avatarUrl,
        isPrivate: profiles.isPrivate,
        allowSearchEngineIndexing: profiles.allowSearchEngineIndexing
      }).from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.username, username)).limit(1);
        
      if (userRecord.length === 0 || !userRecord[0].isActive) {
        isNotFound = true;
        shouldNoIndex = true;
        title = "Kullanıcı Bulunamadı | Genç Sosyal";
        description = "Aradığınız profil mevcut değil veya silinmiş.";
      } else {
        const u = userRecord[0];
        if (!u.allowSearchEngineIndexing || u.isPrivate) {
          shouldNoIndex = true;
        }
        title = `${u.displayName || username} (@${username}) | Genç Sosyal`;
        description = u.bio ? u.bio.substring(0, 150) : `${u.displayName || username} profilini Genç Sosyal'de incele.`;
        if (u.avatarUrl) imageUrl = u.avatarUrl;
        
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": u.displayName || username,
            "alternateName": username,
            "description": description,
            "image": imageUrl
          }
        });
      }
    } else if (projectMatch) {
      const projectId = parseInt(projectMatch[1]);
      const projectRecord = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      
      if (projectRecord.length === 0) {
        isNotFound = true;
        shouldNoIndex = true;
        title = "Proje Bulunamadı | Genç Sosyal";
        description = "Aradığınız proje silinmiş veya yayından kaldırılmış olabilir.";
      } else {
        const p = projectRecord[0];
        title = `${p.title} | Genç Sosyal Projeleri`;
        description = p.description ? p.description.substring(0, 150) : "Genç Sosyal'de geliştirilen yenilikçi proje.";
        if (p.imageUrl) imageUrl = p.imageUrl;
        
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "Project",
          "name": title,
          "description": description,
          "url": url
        });
      }
    } else if (hashtagMatch) {
      const tagName = decodeURIComponent(hashtagMatch[1]);
      title = `#${tagName} — Trend Gönderiler ve Tartışmalar | Genç Sosyal`;
      description = `#${tagName} etiketi altındaki en son paylaşımları, projeleri ve genç yazılımcı tartışmalarını keşfedin.`;
      url = `${domain}/hashtags/${encodeURIComponent(tagName)}`;
      
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": url
      });
    }

    // Add private routes noindex
    const privateRoutes = [
      '/messages', '/settings', '/admin', '/notifications', 
      '/bookmarks', '/onboarding', '/create', '/login', 
      '/register', '/forgot-password', '/reset-password', '/verify-email'
    ];
    if (privateRoutes.some(r => req.path.startsWith(r))) {
      shouldNoIndex = true;
    }

    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeKeywords = escapeHtml(keywords);
    const safeImageUrl = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(url);

    const robotsTag = shouldNoIndex 
      ? '<meta name="robots" content="noindex, nofollow" />' 
      : '<meta name="robots" content="index, follow" />';

    // Build the replacement meta tags
    const metaTags = `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <meta name="keywords" content="${safeKeywords}" />
    ${robotsTag}
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:site_name" content="Genç Sosyal" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${safeUrl}" />
    <meta property="twitter:title" content="${safeTitle}" />
    <meta property="twitter:description" content="${safeDescription}" />
    <meta property="twitter:image" content="${safeImageUrl}" />
    <script type="application/ld+json">
      ${JSON.stringify(jsonLd)}
    </script>
    `;

    // Strip old OG tags, description, keywords, canonical and title
    let finalHtml = template.replace(/<title>.*?<\/title>/g, '');
    finalHtml = finalHtml.replace(/<meta name="description" content=".*?" \/>/g, '');
    finalHtml = finalHtml.replace(/<meta name="keywords" content=".*?" \/>/g, '');
    finalHtml = finalHtml.replace(/<link rel="canonical" href=".*?" \/>/g, '');
    finalHtml = finalHtml.replace(/<!-- Open Graph.*?-->[\s\S]*?<meta property="og:image".*?\/>/g, '');
    finalHtml = finalHtml.replace(/<!-- Twitter.*?-->[\s\S]*?<meta property="twitter:image".*?\/>/g, '');
    
    finalHtml = finalHtml.replace('</head>', `${metaTags}</head>`);

    const statusCode = isNotFound ? 404 : 200;
    res.status(statusCode).send(finalHtml);
  } catch (error) {
    console.error("SEO Middleware error:", error);
    // CRITICAL: NEVER return 500 error to search engine crawlers on SEO parsing errors
    if (template) {
      return res.status(200).send(template);
    }
    return next();
  }
};
