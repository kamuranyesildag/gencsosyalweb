import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { db } from "../../src/db/index.js";
import { users, profiles, posts, communities, projects, hashtags, postMedia } from "../../src/db/schema.js";
import { eq, and, desc, gt, isNull } from "drizzle-orm";
import type { ViteDevServer } from "vite";

let indexHtmlCache = "";

function getIndexHtml(isProd: boolean): string {
  const distPath = path.join(process.cwd(), "dist", "index.html");
  const rootPath = path.join(process.cwd(), "index.html");

  try {
    if (isProd && fs.existsSync(distPath)) {
      if (indexHtmlCache) return indexHtmlCache;
      indexHtmlCache = fs.readFileSync(distPath, "utf-8");
      return indexHtmlCache;
    } else if (fs.existsSync(rootPath)) {
      return fs.readFileSync(rootPath, "utf-8");
    }
  } catch (err) {
    console.error("Error reading index.html template:", err);
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

function linkifyHashtags(text: string, domain: string): string {
  if (!text) return "";
  const escaped = escapeHtml(text);
  return escaped.replace(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g, (match, tag) => {
    return `<a href="${domain}/hashtags/${encodeURIComponent(tag)}" style="color:#2563eb;text-decoration:none;font-weight:600;">#${tag}</a>`;
  });
}

export function createSeoMiddleware(vite?: ViteDevServer) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only process GET requests for HTML documents
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/")) return next();
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|json|woff2?|map|txt|xml|webmanifest)$/i)) return next();

    const isProd = process.env.NODE_ENV === "production";
    const template = getIndexHtml(isProd);
    if (!template) {
      return next();
    }

    // Canonical production domain: https://gencsosyal.com
    const domain = "https://gencsosyal.com";
    
    // Clean canonical path without trailing slash (except root) and strictly without query parameters
    const cleanPath = req.path.length > 1 && req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;
    const canonicalUrl = `${domain}${cleanPath}`;

    let title = "Genç Sosyal — Genç Üretici Platformu";
    let description = "Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini, topluluklarını ve fikirlerini paylaştığı yeni nesil sosyal platform.";
    const keywords = "genç sosyal, gençlik platformu, sosyal medya, yazılımcı gençlik, açık kaynak projeler, teknoloji topluluğu, genç geliştiriciler, portföy paylaşımı, yazılım projeleri, dijital topluluk, kodlama";
    let imageUrl = `${domain}/icon-512.png`;
    let ogType = "website";
    let shouldNoIndex = false;
    let isNotFound = false;
    let semanticBody = "";

    const jsonLd: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Genç Sosyal",
        "url": domain,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${domain}/explore?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Genç Sosyal",
        "url": domain,
        "logo": `${domain}/icon-512.png`,
        "description": "Genç üretici, geliştirici ve tasarımcı topluluk platformu."
      }
    ];

    try {
      const postMatch = cleanPath.match(/^\/post\/(\d+)$/);
      const profileMatch = cleanPath.match(/^\/profile\/([a-zA-Z0-9_]{3,30})$/);
      const communityMatch = cleanPath.match(/^\/communities\/([a-zA-Z0-9_-]+)$/);
      const projectMatch = cleanPath.match(/^\/projects\/(\d+)$/);
      const hashtagMatch = cleanPath.match(/^\/(?:hashtag|hashtags)\/([a-zA-Z0-9_\u00C0-\u017F]+)$/);

      if (postMatch) {
        const postId = parseInt(postMatch[1], 10);
        const postRecord = await db
          .select({
            id: posts.id,
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
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(eq(posts.id, postId))
          .limit(1);

        if (
          postRecord.length === 0 ||
          postRecord[0].visibility !== "PUBLIC" ||
          postRecord[0].moderationStatus !== "APPROVED" ||
          !postRecord[0].userIsActive
        ) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Gönderi Bulunamadı | Genç Sosyal";
          description = "Görüntülemek istediğiniz gönderi mevcut değil, silinmiş veya gizli olabilir.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">Gönderi Bulunamadı</h1>
              <p style="color:#64748b;margin-bottom:24px;">Aradığınız gönderi silinmiş, gizlenmiş veya henüz onaylanmamış olabilir.</p>
              <p><a href="${domain}/" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Genç Sosyal Ana Sayfasına Dön</a></p>
            </main>
          `;
        } else {
          const p = postRecord[0];
          const authorName = p.displayName || p.username;
          if (!p.allowSearchEngineIndexing || p.userIsPrivate) {
            shouldNoIndex = true;
          }

          title = `${authorName} tarafından paylaşılan gönderi | Genç Sosyal`;
          description = p.content
            ? p.content.slice(0, 155) + (p.content.length > 155 ? "..." : "")
            : `${authorName} tarafından Genç Sosyal'de paylaşılan gönderiye göz atın.`;
          
          const mediaRows = await db
            .select({ url: postMedia.mediaUrl })
            .from(postMedia)
            .where(eq(postMedia.postId, postId))
            .limit(1);

          if (mediaRows.length > 0 && mediaRows[0].url) {
            imageUrl = mediaRows[0].url.startsWith("http") ? mediaRows[0].url : `${domain}${mediaRows[0].url}`;
          } else if (p.avatarUrl) {
            imageUrl = p.avatarUrl.startsWith("http") ? p.avatarUrl : `${domain}${p.avatarUrl}`;
          }
          ogType = "article";

          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "SocialMediaPosting",
            "headline": title,
            "articleBody": p.content || "",
            "datePublished": p.createdAt?.toISOString(),
            "url": canonicalUrl,
            "image": imageUrl,
            "author": {
              "@type": "Person",
              "name": authorName,
              "url": `${domain}/profile/${p.username}`,
              "image": p.avatarUrl || `${domain}/icon-512.png`
            },
            "publisher": {
              "@type": "Organization",
              "name": "Genç Sosyal",
              "url": domain,
              "logo": `${domain}/icon-512.png`
            }
          });

          semanticBody = `
            <article itemscope itemtype="https://schema.org/SocialMediaPosting" style="max-width:680px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div>
                  <h1 style="font-size:18px;font-weight:700;margin:0;">
                    <a href="${domain}/profile/${escapeHtml(p.username)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(authorName)}</a>
                  </h1>
                  <p style="margin:2px 0 0 0;font-size:14px;color:#64748b;">
                    <a href="${domain}/profile/${escapeHtml(p.username)}" style="color:#64748b;text-decoration:none;">@${escapeHtml(p.username)}</a> · 
                    <time datetime="${p.createdAt?.toISOString()}">${new Date(p.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                  </p>
                </div>
              </header>
              <section style="font-size:17px;margin:20px 0;line-height:1.6;white-space:pre-wrap;">${linkifyHashtags(p.content || "", domain)}</section>
              <footer style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;color:#64748b;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <a href="${domain}/" style="color:#2563eb;text-decoration:none;font-weight:600;">Genç Sosyal</a> · 
                  <a href="${domain}/explore" style="color:#2563eb;text-decoration:none;font-weight:600;">Keşfet</a>
                </div>
                <span>Genç Üretici Platformu</span>
              </footer>
            </article>
          `;
        }
      } else if (profileMatch) {
        const username = profileMatch[1];
        const userRecord = await db
          .select({
            id: users.id,
            username: users.username,
            isActive: users.isActive,
            displayName: profiles.displayName,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl,
            isPrivate: profiles.isPrivate,
            allowSearchEngineIndexing: profiles.allowSearchEngineIndexing
          })
          .from(users)
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(eq(users.username, username))
          .limit(1);

        if (userRecord.length === 0 || !userRecord[0].isActive) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Kullanıcı Bulunamadı | Genç Sosyal";
          description = "Aradığınız kullanıcı profili mevcut değil veya silinmiş.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">Kullanıcı Bulunamadı</h1>
              <p style="color:#64748b;margin-bottom:24px;">Aradığınız kullanıcı profili mevcut değil veya silinmiş olabilir.</p>
              <p><a href="${domain}/" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Genç Sosyal Ana Sayfasına Dön</a></p>
            </main>
          `;
        } else {
          const u = userRecord[0];
          const name = u.displayName || u.username;
          if (!u.allowSearchEngineIndexing || u.isPrivate) {
            shouldNoIndex = true;
          }

          title = `${name} (@${u.username}) | Genç Sosyal`;
          description = u.bio
            ? u.bio.slice(0, 155) + (u.bio.length > 155 ? "..." : "")
            : `${name} (@${u.username}) profilini Genç Sosyal'de inceleyin. Projeleri, gönderileri ve paylaşımlarını keşfedin.`;
          
          if (u.avatarUrl) {
            imageUrl = u.avatarUrl.startsWith("http") ? u.avatarUrl : `${domain}${u.avatarUrl}`;
          }
          ogType = "profile";

          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "url": canonicalUrl,
            "mainEntity": {
              "@type": "Person",
              "name": name,
              "alternateName": u.username,
              "description": description,
              "image": imageUrl,
              "url": canonicalUrl
            }
          });

          // Fetch user's latest public posts for internal linking
          const userPosts = await db
            .select({
              id: posts.id,
              content: posts.content,
              createdAt: posts.createdAt
            })
            .from(posts)
            .where(
              and(
                eq(posts.userId, u.id),
                eq(posts.visibility, "PUBLIC"),
                eq(posts.moderationStatus, "APPROVED"),
                isNull(posts.communityId)
              )
            )
            .orderBy(desc(posts.createdAt))
            .limit(5);

          // Fetch user's projects for internal linking safely
          let userProjects: any[] = [];
          try {
            userProjects = await db
              .select({
                id: projects.id,
                title: projects.title,
                category: projects.category
              })
              .from(projects)
              .where(eq(projects.userId, u.id))
              .orderBy(desc(projects.createdAt))
              .limit(5);
          } catch (upErr) {
            console.warn("Could not fetch user projects for SEO:", upErr);
          }

          let postsListHtml = "";
          if (userPosts.length > 0) {
            postsListHtml = `
              <section style="margin-top:24px;">
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Gönderiler</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${userPosts.map((post: any) => `
                    <li style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
                      <a href="${domain}/post/${post.id}" style="color:#0f172a;text-decoration:none;font-weight:500;">
                        ${escapeHtml(post.content?.slice(0, 100) || "Gönderi")}
                      </a>
                    </li>
                  `).join("")}
                </ul>
              </section>
            `;
          }

          let projectsListHtml = "";
          if (userProjects.length > 0) {
            projectsListHtml = `
              <section style="margin-top:24px;">
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Projeler</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${userProjects.map((proj: any) => `
                    <li style="padding:8px 0;">
                      <a href="${domain}/projects/${proj.id}" style="color:#2563eb;text-decoration:none;font-weight:600;">
                        ${escapeHtml(proj.title)}
                      </a>
                      <span style="font-size:13px;color:#64748b;margin-left:8px;">(${escapeHtml(proj.category)})</span>
                    </li>
                  `).join("")}
                </ul>
              </section>
            `;
          }

          semanticBody = `
            <main itemscope itemtype="https://schema.org/Person" style="max-width:680px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:20px;">
                <h1 itemprop="name" style="font-size:24px;font-weight:800;margin:0 0 4px 0;">${escapeHtml(name)}</h1>
                <p style="font-size:15px;color:#64748b;margin:0 0 12px 0;">@${escapeHtml(u.username)}</p>
                <p itemprop="description" style="font-size:16px;color:#334155;margin:0;">${escapeHtml(u.bio || "Genç Sosyal üreticisi.")}</p>
              </header>
              ${projectsListHtml}
              ${postsListHtml}
              <nav style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
                <a href="${domain}/" style="color:#2563eb;text-decoration:none;font-weight:600;">Genç Sosyal</a> · 
                <a href="${domain}/explore" style="color:#2563eb;text-decoration:none;font-weight:600;">Keşfet</a> · 
                <a href="${domain}/projects" style="color:#2563eb;text-decoration:none;font-weight:600;">Projeler</a> · 
                <a href="${domain}/communities" style="color:#2563eb;text-decoration:none;font-weight:600;">Topluluklar</a>
              </nav>
            </main>
          `;
        }
      } else if (projectMatch) {
        const projectId = parseInt(projectMatch[1], 10);
        const projectRecord = await db
          .select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            detailedDescription: projects.detailedDescription,
            category: projects.category,
            status: projects.status,
            projectUrl: projects.projectUrl,
            githubUrl: projects.githubUrl,
            imageUrl: projects.imageUrl,
            tags: projects.tags,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
            authorUsername: users.username,
            authorDisplayName: profiles.displayName,
            authorIsActive: users.isActive,
            allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
            userIsPrivate: profiles.isPrivate
          })
          .from(projects)
          .innerJoin(users, eq(projects.userId, users.id))
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(eq(projects.id, projectId))
          .limit(1);

        if (projectRecord.length === 0 || !projectRecord[0].authorIsActive) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Proje Bulunamadı | Genç Sosyal";
          description = "Aradığınız proje yayından kaldırılmış veya silinmiş olabilir.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">Proje Bulunamadı</h1>
              <p style="color:#64748b;margin-bottom:24px;">Aradığınız proje yayından kaldırılmış veya silinmiş olabilir.</p>
              <p><a href="${domain}/projects" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Tüm Projeleri Keşfet</a></p>
            </main>
          `;
        } else {
          const prj = projectRecord[0];
          const creatorName = prj.authorDisplayName || prj.authorUsername;
          if (!prj.allowSearchEngineIndexing || prj.userIsPrivate) {
            shouldNoIndex = true;
          }

          title = `${prj.title} | Genç Sosyal`;
          description = prj.description
            ? prj.description.slice(0, 155) + (prj.description.length > 155 ? "..." : "")
            : "Genç Sosyal'de geliştirilen yenilikçi projeyi inceleyin.";
          
          if (prj.imageUrl) {
            imageUrl = prj.imageUrl.startsWith("http") ? prj.imageUrl : `${domain}${prj.imageUrl}`;
          }

          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": prj.title,
            "headline": title,
            "description": description,
            "applicationCategory": prj.category || "DeveloperApplication",
            "url": canonicalUrl,
            "image": imageUrl,
            "author": {
              "@type": "Person",
              "name": creatorName,
              "url": `${domain}/profile/${prj.authorUsername}`
            }
          });

          semanticBody = `
            <article style="max-width:720px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
                <h1 style="font-size:26px;font-weight:800;margin:0 0 8px 0;">${escapeHtml(prj.title)}</h1>
                <p style="font-size:15px;color:#64748b;margin:0;">
                  Geliştirici: <a href="${domain}/profile/${escapeHtml(prj.authorUsername)}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(creatorName)} (@${escapeHtml(prj.authorUsername)})</a> · 
                  Kategori: <strong>${escapeHtml(prj.category)}</strong>
                </p>
              </header>
              <section style="margin:20px 0;font-size:16px;color:#334155;">
                <p style="font-size:17px;font-weight:500;color:#0f172a;">${escapeHtml(prj.description || "")}</p>
                ${prj.detailedDescription ? `<div style="margin-top:16px;white-space:pre-wrap;">${escapeHtml(prj.detailedDescription)}</div>` : ""}
              </section>
              <footer style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
                <p><a href="${domain}/projects" style="color:#2563eb;font-weight:600;text-decoration:none;">← Genç Sosyal Projelerine Dön</a> · <a href="${domain}/explore" style="color:#2563eb;font-weight:600;text-decoration:none;">Keşfet</a></p>
              </footer>
            </article>
          `;
        }
      } else if (communityMatch) {
        const communitySlug = communityMatch[1];
        const commRecord = await db
          .select({
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
            description: communities.description,
            avatarUrl: communities.avatarUrl,
            coverUrl: communities.coverUrl,
            createdAt: communities.createdAt,
            ownerUsername: users.username,
            ownerDisplayName: profiles.displayName
          })
          .from(communities)
          .innerJoin(users, eq(communities.ownerId, users.id))
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(and(eq(communities.slug, communitySlug), isNull(communities.deletedAt)))
          .limit(1);

        if (commRecord.length === 0) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Topluluk Bulunamadı | Genç Sosyal";
          description = "Aradığınız topluluk mevcut değil veya silinmiş.";
          semanticBody = `
            <main style="max-width:680px;margin:50px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#0f172a;">Topluluk Bulunamadı</h1>
              <p style="color:#64748b;margin-bottom:24px;">Aradığınız topluluk mevcut değil veya kaldırılmış olabilir.</p>
              <p><a href="${domain}/communities" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Tüm Toplulukları Keşfet</a></p>
            </main>
          `;
        } else {
          const c = commRecord[0];
          title = `${c.name} | Genç Sosyal`;
          description = c.description
            ? c.description.slice(0, 155) + (c.description.length > 155 ? "..." : "")
            : `${c.name} topluluğuna katılın ve tartışmalara dahil olun.`;
          
          if (c.avatarUrl) {
            imageUrl = c.avatarUrl.startsWith("http") ? c.avatarUrl : `${domain}${c.avatarUrl}`;
          }

          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "Community",
            "name": c.name,
            "description": description,
            "url": canonicalUrl,
            "image": imageUrl
          });

          semanticBody = `
            <main style="max-width:720px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
                <h1 style="font-size:26px;font-weight:800;margin:0 0 8px 0;">${escapeHtml(c.name)}</h1>
                <p style="font-size:16px;color:#334155;margin:0 0 8px 0;">${escapeHtml(c.description || "Genç Sosyal topluluğu.")}</p>
                <p style="font-size:14px;color:#64748b;margin:0;">
                  Kurucu: <a href="${domain}/profile/${escapeHtml(c.ownerUsername)}" style="color:#2563eb;text-decoration:none;font-weight:600;">@${escapeHtml(c.ownerUsername)}</a>
                </p>
              </header>
              <nav style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
                <a href="${domain}/communities" style="color:#2563eb;font-weight:600;text-decoration:none;">← Tüm Topluluklar</a> · 
                <a href="${domain}/explore" style="color:#2563eb;font-weight:600;text-decoration:none;">Keşfet</a> · 
                <a href="${domain}/" style="color:#2563eb;font-weight:600;text-decoration:none;">Ana Sayfa</a>
              </nav>
            </main>
          `;
        }
      } else if (hashtagMatch) {
        const tagName = decodeURIComponent(hashtagMatch[1]);
        title = `#${tagName} | Genç Sosyal`;
        description = `#${tagName} etiketi altındaki popüler gönderileri, projeleri ve genç yazılımcı tartışmalarını keşfedin.`;

        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": title,
          "description": description,
          "url": canonicalUrl
        });

        semanticBody = `
          <main style="max-width:680px;margin:30px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
              <h1 style="font-size:26px;font-weight:800;margin:0 0 8px 0;color:#2563eb;">#${escapeHtml(tagName)}</h1>
              <p style="font-size:16px;color:#64748b;margin:0;">${escapeHtml(description)}</p>
            </header>
            <nav style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;">
              <a href="${domain}/explore" style="color:#2563eb;font-weight:600;text-decoration:none;">Keşfet</a> · 
              <a href="${domain}/projects" style="color:#2563eb;font-weight:600;text-decoration:none;">Projeler</a> · 
              <a href="${domain}/" style="color:#2563eb;font-weight:600;text-decoration:none;">Ana Sayfa</a>
            </nav>
          </main>
        `;
      } else if (cleanPath === "/" || cleanPath === "/home") {
        title = "Genç Sosyal — Genç Üretici Platformu";
        description = "Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini, topluluklarını ve fikirlerini paylaştığı yeni nesil sosyal platform.";
        
        // Fetch featured public projects for homepage internal links safely
        let homeProjects: any[] = [];
        try {
          homeProjects = await db
            .select({
              id: projects.id,
              title: projects.title,
              category: projects.category
            })
            .from(projects)
            .orderBy(desc(projects.createdAt))
            .limit(3);
        } catch (pErr) {
          console.warn("Could not fetch home projects for SEO:", pErr);
        }

        // Fetch active communities for homepage internal links safely
        let homeCommunities: any[] = [];
        try {
          homeCommunities = await db
            .select({
              slug: communities.slug,
              name: communities.name
            })
            .from(communities)
            .where(and(isNull(communities.deletedAt), eq(communities.isPrivate, false)))
            .limit(3);
        } catch (cErr) {
          console.warn("Could not fetch home communities for SEO:", cErr);
        }

        semanticBody = `
          <main style="max-width:800px;margin:40px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="text-align:center;margin-bottom:36px;">
              <h1 style="font-size:32px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;margin-bottom:12px;">Genç Sosyal — Genç Üretici Platformu</h1>
              <p style="font-size:18px;color:#475569;max-width:600px;margin:0 auto 20px auto;">Gençlerin projelerini, topluluklarını ve üretimlerini özgürce paylaştığı, açık kaynak ve teknoloji odaklı yeni nesil sosyal platform.</p>
              <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                <a href="${domain}/explore" style="padding:10px 20px;background:#2563eb;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">Keşfetmeye Başla</a>
                <a href="${domain}/projects" style="padding:10px 20px;background:#f1f5f9;color:#0f172a;border-radius:12px;text-decoration:none;font-weight:700;">Projeleri Gör</a>
              </div>
            </header>
            
            ${homeProjects.length > 0 ? `
              <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:24px;">
                <h2 style="font-size:20px;font-weight:700;margin-bottom:16px;">Öne Çıkan Projeler</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${homeProjects.map((hp: any) => `
                    <li style="padding:10px 0;">
                      <a href="${domain}/projects/${hp.id}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(hp.title)}</a>
                      <span style="color:#64748b;font-size:14px;margin-left:8px;">(${escapeHtml(hp.category)})</span>
                    </li>
                  `).join("")}
                </ul>
              </section>
            ` : ""}

            ${homeCommunities.length > 0 ? `
              <section style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:24px;">
                <h2 style="font-size:20px;font-weight:700;margin-bottom:16px;">Popüler Topluluklar</h2>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${homeCommunities.map((hc: any) => `
                    <li style="padding:10px 0;">
                      <a href="${domain}/communities/${encodeURIComponent(hc.slug)}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(hc.name)}</a>
                    </li>
                  `).join("")}
                </ul>
              </section>
            ` : ""}

            <footer style="margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0;display:flex;justify-content:center;gap:16px;font-size:14px;color:#64748b;flex-wrap:wrap;">
              <a href="${domain}/explore" style="color:#64748b;text-decoration:none;">Keşfet</a>
              <a href="${domain}/projects" style="color:#64748b;text-decoration:none;">Projeler</a>
              <a href="${domain}/communities" style="color:#64748b;text-decoration:none;">Topluluklar</a>
              <a href="${domain}/sitemap" style="color:#64748b;text-decoration:none;">Site Haritası</a>
              <a href="${domain}/privacy" style="color:#64748b;text-decoration:none;">Gizlilik İlkeleri</a>
              <a href="${domain}/terms" style="color:#64748b;text-decoration:none;">Kullanım Şartları</a>
            </footer>
          </main>
        `;
      } else if (cleanPath === "/explore") {
        title = "Keşfet | Genç Sosyal";
        description = "Genç Sosyal'de popüler etiketleri, öne çıkan üreticileri ve trend tartışmaları keşfedin.";
        
        // Search queries should be noindex
        if (req.query.q) {
          shouldNoIndex = true;
          title = `"${escapeHtml(String(req.query.q))}" için Arama Sonuçları | Genç Sosyal`;
        }
      } else if (cleanPath === "/projects") {
        title = "Projeler | Genç Sosyal";
        description = "Genç yazılımcı ve üreticilerin hayata geçirdiği projeleri inceleyin, geri bildirimde bulunun ve destek olun.";
      } else if (cleanPath === "/communities") {
        title = "Topluluklar | Genç Sosyal";
        description = "İlgi alanlarınıza uygun genç teknoloji ve üretim topluluklarına katılın.";
      } else if (cleanPath === "/privacy") {
        title = "Gizlilik İlkeleri | Genç Sosyal";
        description = "Genç Sosyal kullanıcı gizliliği ve veri güvenliği politikası.";
      } else if (cleanPath === "/terms") {
        title = "Kullanım Şartları | Genç Sosyal";
        description = "Genç Sosyal platform kullanım şartları ve kuralları.";
      } else if (cleanPath === "/sitemap") {
        title = "Site Haritası | Genç Sosyal";
        description = "Genç Sosyal platformundaki tüm açık ve indekslenebilir sayfalara, projelere ve topluluklara hızlı erişim.";
        semanticBody = `
          <main style="max-width:800px;margin:40px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="margin-bottom:28px;">
              <h1 style="font-size:28px;font-weight:800;">Genç Sosyal Site Haritası</h1>
              <p style="color:#64748b;">Genç üreticilerin açık içeriklerine ve bölümlerine hızlı dizin.</p>
            </header>
            <nav style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;">
              <div>
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Ana Sayfalar</h2>
                <ul style="list-style:none;padding:0;margin:0;line-height:2;">
                  <li><a href="${domain}/" style="color:#2563eb;text-decoration:none;">Ana Sayfa</a></li>
                  <li><a href="${domain}/explore" style="color:#2563eb;text-decoration:none;">Keşfet</a></li>
                  <li><a href="${domain}/projects" style="color:#2563eb;text-decoration:none;">Projeler</a></li>
                  <li><a href="${domain}/communities" style="color:#2563eb;text-decoration:none;">Topluluklar</a></li>
                  <li><a href="${domain}/sitemap.xml" style="color:#2563eb;text-decoration:none;">XML Sitemap</a></li>
                </ul>
              </div>
              <div>
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Yasal & Güvenlik</h2>
                <ul style="list-style:none;padding:0;margin:0;line-height:2;">
                  <li><a href="${domain}/privacy" style="color:#2563eb;text-decoration:none;">Gizlilik İlkeleri</a></li>
                  <li><a href="${domain}/terms" style="color:#2563eb;text-decoration:none;">Kullanım Şartları</a></li>
                </ul>
              </div>
            </nav>
          </main>
        `;
      }

      // Explicitly enforce noindex on private and auth routes
      const privateRoutes = [
        "/messages", "/settings", "/admin", "/notifications", 
        "/bookmarks", "/onboarding", "/create", "/login", 
        "/register", "/forgot-password", "/reset-password", "/verify-email",
        "/account-suspended", "/support"
      ];
      if (privateRoutes.some(r => cleanPath.startsWith(r))) {
        shouldNoIndex = true;
      }

      const safeTitle = escapeHtml(title);
      const safeDescription = escapeHtml(description);
      const safeKeywords = escapeHtml(keywords);
      const safeImageUrl = escapeHtml(imageUrl);
      const safeCanonicalUrl = escapeHtml(canonicalUrl);

      const robotsContent = shouldNoIndex ? "noindex, nofollow" : "index, follow";

      const headMetadata = `
      <title>${safeTitle}</title>
      <meta name="description" content="${safeDescription}" />
      <meta name="keywords" content="${safeKeywords}" />
      <meta name="robots" content="${robotsContent}" />
      <link rel="canonical" href="${safeCanonicalUrl}" />
      <meta property="og:type" content="${ogType}" />
      <meta property="og:url" content="${safeCanonicalUrl}" />
      <meta property="og:title" content="${safeTitle}" />
      <meta property="og:description" content="${safeDescription}" />
      <meta property="og:image" content="${safeImageUrl}" />
      <meta property="og:site_name" content="Genç Sosyal" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="${safeCanonicalUrl}" />
      <meta property="twitter:title" content="${safeTitle}" />
      <meta property="twitter:description" content="${safeDescription}" />
      <meta property="twitter:image" content="${safeImageUrl}" />
      <script type="application/ld+json">
        ${JSON.stringify(jsonLd)}
      </script>
      `;

      // Replace old tags in template
      let finalHtml = template;
      finalHtml = finalHtml.replace(/<title>.*?<\/title>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="keywords"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="robots"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+property="og:.*?"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+property="twitter:.*?"\s+content=".*?"\s*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

      finalHtml = finalHtml.replace("</head>", `${headMetadata}</head>`);

      // Inject semantic prerender content inside root for search engine crawlers
      if (semanticBody) {
        finalHtml = finalHtml.replace(
          '<div id="root">',
          `<div id="root">${semanticBody}`
        );
      }

      // If in development mode and Vite dev server is available, apply Vite's HTML transform
      if (vite) {
        try {
          finalHtml = await vite.transformIndexHtml(req.originalUrl, finalHtml);
        } catch (vErr) {
          console.error("Vite transformIndexHtml error:", vErr);
        }
      }

      const statusCode = isNotFound ? 404 : 200;
      res.status(statusCode).send(finalHtml);
    } catch (error) {
      console.error("SEO Middleware error:", error);
      res.status(200).send(template);
    }
  };
}
