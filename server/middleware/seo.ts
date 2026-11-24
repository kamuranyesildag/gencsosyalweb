import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { db } from "../../src/db/index.js";
import {
  users,
  profiles,
  posts,
  communities,
  projects,
  hashtags,
  postMedia,
  postHashtags,
  teams,
} from "../../src/db/schema.js";
import { eq, and, desc, gt, isNull } from "drizzle-orm";
import type { ViteDevServer } from "vite";

const MAX_PG_INT = 2147483647;
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

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function parseSafePgInt(raw: string): number | null {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const num = Number(raw);
  if (!Number.isSafeInteger(num) || num <= 0 || num > MAX_PG_INT) return null;
  return num;
}

function toAbsoluteUrl(url: string | null | undefined, domain: string): string {
  if (!url) return `${domain}/icon-512.png`;
  const trimmed = url.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  if (trimmed.startsWith("/")) return `${domain}${trimmed}`;
  return `${domain}/icon-512.png`;
}

function linkifyHashtags(text: string, domain: string): string {
  if (!text) return "";
  const escaped = escapeHtml(text);
  return escaped.replace(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g, (_match, tag) => {
    return `<a href="${domain}/hashtags/${encodeURIComponent(tag)}" style="color:#2563eb;text-decoration:none;font-weight:600;">#${tag}</a>`;
  });
}

function buildFooterNav(domain: string): string {
  return `
    <footer style="margin-top:40px;padding-top:18px;border-top:1px solid #e2e8f0;display:flex;justify-content:center;gap:14px;font-size:14px;color:#475569;flex-wrap:wrap;">
      <a href="${domain}/" style="color:#2563eb;text-decoration:none;font-weight:600;">Ana Sayfa</a>
      <a href="${domain}/explore" style="color:#2563eb;text-decoration:none;font-weight:600;">Keşfet</a>
      <a href="${domain}/projects" style="color:#2563eb;text-decoration:none;font-weight:600;">Projeler</a>
      <a href="${domain}/communities" style="color:#2563eb;text-decoration:none;font-weight:600;">Topluluklar</a>
      <a href="${domain}/teams" style="color:#2563eb;text-decoration:none;font-weight:600;">Takımlar</a>
      <a href="${domain}/teknofest" style="color:#2563eb;text-decoration:none;font-weight:600;">TEKNOFEST</a>
      <a href="${domain}/quiz" style="color:#2563eb;text-decoration:none;font-weight:600;">Genç Quiz</a>
      <a href="${domain}/youth-league" style="color:#2563eb;text-decoration:none;font-weight:600;">Gençlik Ligi</a>
      <a href="${domain}/sitemap" style="color:#475569;text-decoration:none;">Site Haritası</a>
      <a href="${domain}/privacy" style="color:#475569;text-decoration:none;">Gizlilik</a>
      <a href="${domain}/terms" style="color:#475569;text-decoration:none;">Şartlar</a>
      <a href="${domain}/kvkk" style="color:#475569;text-decoration:none;">KVKK</a>
    </footer>
  `;
}

function makeBreadcrumb(domain: string, items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${domain}${item.url}`,
    })),
  };
}

export function createSeoMiddleware(vite?: ViteDevServer) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api/")) return next();
    if (
      req.path.match(
        /\.(js|css|png|jpg|jpeg|webp|gif|ico|svg|json|woff2?|ttf|map|txt|xml|webmanifest|mp4|webm)$/i
      )
    ) {
      return next();
    }

    const isProd = process.env.NODE_ENV === "production";
    const template = getIndexHtml(isProd);
    if (!template) {
      return next();
    }

    const domain = (process.env.CANONICAL_DOMAIN || "https://gencsosyal.com").replace(/\/+$/, "");
    const cleanPath =
      req.path.length > 1 && req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;

    let canonicalUrl = `${domain}${cleanPath === "/" ? "/" : cleanPath}`;
    let title = "Genç Sosyal — Genç Üretici ve Yazılımcı Platformu";
    let description =
      "Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini, takımlarını, topluluklarını ve fikirlerini paylaştığı yeni nesil sosyal platform.";
    const keywords =
      "genç sosyal, gençlik platformu, sosyal medya, yazılımcı gençlik, açık kaynak projeler, teknoloji topluluğu, genç geliştiriciler, teknofest takımları, dijital topluluk, kodlama";
    let imageUrl = `${domain}/icon-512.png`;
    let ogType = "website";
    let shouldNoIndex = false;
    let isNotFound = false;
    let routeMatched = false;
    let semanticBody = "";

    const jsonLd: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${domain}/#website`,
        name: "Genç Sosyal",
        alternateName: ["Genc Sosyal", "GencSosyal", "gencsosyal.com"],
        url: `${domain}/`,
        inLanguage: "tr-TR",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${domain}/explore?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${domain}/#organization`,
        name: "Genç Sosyal",
        url: `${domain}/`,
        logo: {
          "@type": "ImageObject",
          url: `${domain}/icon-512.png`,
          width: 512,
          height: 512,
        },
        description: "Türkiye'nin genç üretici, yazılımcı ve tasarımcı topluluk platformu.",
      },
    ];

    try {
      const postMatch = cleanPath.match(/^\/post\/(\d+)$/);
      const profileMatch = cleanPath.match(/^\/profile\/([a-zA-Z0-9_]{2,40})$/);
      const communityMatch = cleanPath.match(/^\/communities\/([a-zA-Z0-9_-]+)$/);
      const teamMatch = cleanPath.match(/^\/teams\/([a-zA-Z0-9_-]+)$/);
      const projectMatch = cleanPath.match(/^\/projects\/(\d+)$/);
      const hashtagMatch = cleanPath.match(/^\/hashtags\/([a-zA-Z0-9_%.\-\u00C0-\u017F]+)$/);

      // Private/authenticated routes — always HTTP 200 (client redirects/protects) with strict noindex
      const privatePrefixes = [
        "/messages",
        "/settings",
        "/admin",
        "/notifications",
        "/bookmarks",
        "/onboarding",
        "/create",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/account-suspended",
        "/support",
        "/profile/customize",
        "/quiz/room/",
        "/youth-league/match/",
      ];

      const isPrivateRoute = privatePrefixes.some(
        (prefix) => cleanPath === prefix || cleanPath.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`)
      );

      if (isPrivateRoute) {
        routeMatched = true;
        shouldNoIndex = true;
        if (cleanPath.startsWith("/login")) {
          title = "Giriş Yap | Genç Sosyal";
          description = "Genç Sosyal hesabınıza giriş yapın.";
        } else if (cleanPath.startsWith("/register")) {
          title = "Kayıt Ol | Genç Sosyal";
          description = "Genç Sosyal topluluğuna ücretsiz katılın.";
        } else if (cleanPath.startsWith("/messages")) {
          title = "Mesajlar | Genç Sosyal";
        } else if (cleanPath.startsWith("/settings")) {
          title = "Ayarlar | Genç Sosyal";
        } else if (cleanPath.startsWith("/notifications")) {
          title = "Bildirimler | Genç Sosyal";
        }
      } else if (postMatch) {
        routeMatched = true;
        const postId = parseSafePgInt(postMatch[1]);
        const postRecord = postId
          ? await db
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
                userIsPrivate: profiles.isPrivate,
              })
              .from(posts)
              .innerJoin(users, eq(posts.userId, users.id))
              .leftJoin(profiles, eq(users.id, profiles.userId))
              .where(eq(posts.id, postId))
              .limit(1)
          : [];

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
            <main style="max-width:680px;margin:48px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:800;margin-bottom:12px;color:#0f172a;">Gönderi Bulunamadı</h1>
              <p style="color:#64748b;margin-bottom:24px;">Aradığınız gönderi silinmiş, gizlenmiş veya henüz onaylanmamış olabilir.</p>
              ${buildFooterNav(domain)}
            </main>
          `;
        } else {
          const p = postRecord[0];
          const authorName = p.displayName || p.username;
          if (p.allowSearchEngineIndexing === false || p.userIsPrivate) {
            shouldNoIndex = true;
          }

          title = `${authorName} (@${p.username}) Gönderisi | Genç Sosyal`;
          description = p.content
            ? p.content.slice(0, 155) + (p.content.length > 155 ? "..." : "")
            : `${authorName} tarafından Genç Sosyal'de paylaşılan gönderiyi inceleyin.`;

          const mediaRows = await db
            .select({ url: postMedia.mediaUrl })
            .from(postMedia)
            .where(eq(postMedia.postId, p.id))
            .limit(1);

          if (mediaRows.length > 0 && mediaRows[0].url) {
            imageUrl = toAbsoluteUrl(mediaRows[0].url, domain);
          } else if (p.avatarUrl) {
            imageUrl = toAbsoluteUrl(p.avatarUrl, domain);
          }
          ogType = "article";

          jsonLd.push(
            makeBreadcrumb(domain, [
              { name: "Ana Sayfa", url: "/" },
              { name: authorName, url: `/profile/${encodeURIComponent(p.username)}` },
              { name: "Gönderi", url: `/post/${p.id}` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "SocialMediaPosting",
              headline: title,
              articleBody: p.content || "",
              datePublished: p.createdAt?.toISOString(),
              url: canonicalUrl,
              image: imageUrl,
              author: {
                "@type": "Person",
                name: authorName,
                url: `${domain}/profile/${encodeURIComponent(p.username)}`,
              },
              publisher: {
                "@type": "Organization",
                name: "Genç Sosyal",
                url: `${domain}/`,
                logo: `${domain}/icon-512.png`,
              },
            }
          );

          semanticBody = `
            <article style="max-width:680px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
              <header style="margin-bottom:16px;">
                <h1 style="font-size:20px;font-weight:800;margin:0;">
                  <a href="${domain}/profile/${encodeURIComponent(p.username)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(authorName)}</a>
                </h1>
                <p style="margin:4px 0 0 0;font-size:14px;color:#64748b;">
                  @${escapeHtml(p.username)} ·
                  <time datetime="${p.createdAt?.toISOString()}">${new Date(p.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</time>
                </p>
              </header>
              <section style="font-size:17px;margin:20px 0;white-space:pre-wrap;">${linkifyHashtags(p.content || "", domain)}</section>
              ${buildFooterNav(domain)}
            </article>
          `;
        }
      } else if (profileMatch) {
        routeMatched = true;
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
            allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
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
            <main style="max-width:680px;margin:48px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:800;margin-bottom:12px;color:#0f172a;">Kullanıcı Bulunamadı</h1>
              <p style="color:#64748b;margin-bottom:24px;">Aradığınız kullanıcı profili mevcut değil veya silinmiş olabilir.</p>
              ${buildFooterNav(domain)}
            </main>
          `;
        } else {
          const u = userRecord[0];
          const name = u.displayName || u.username;
          canonicalUrl = `${domain}/profile/${encodeURIComponent(u.username)}`;
          if (u.allowSearchEngineIndexing === false || u.isPrivate) {
            shouldNoIndex = true;
          }

          title = `${name} (@${u.username}) | Genç Sosyal`;
          description = u.bio
            ? u.bio.slice(0, 155) + (u.bio.length > 155 ? "..." : "")
            : `${name} (@${u.username}) profilini Genç Sosyal'de inceleyin. Projeleri, gönderileri ve topluluk paylaşımlarını keşfedin.`;

          imageUrl = toAbsoluteUrl(u.avatarUrl, domain);
          ogType = "profile";

          jsonLd.push(
            makeBreadcrumb(domain, [
              { name: "Ana Sayfa", url: "/" },
              { name: name, url: `/profile/${encodeURIComponent(u.username)}` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              url: canonicalUrl,
              mainEntity: {
                "@type": "Person",
                name,
                alternateName: `@${u.username}`,
                description,
                image: imageUrl,
                url: canonicalUrl,
              },
            }
          );

          const [userPosts, userProjects] = await Promise.all([
            db
              .select({ id: posts.id, content: posts.content, createdAt: posts.createdAt })
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
              .limit(6)
              .catch(() => []),
            db
              .select({ id: projects.id, title: projects.title, category: projects.category })
              .from(projects)
              .where(eq(projects.userId, u.id))
              .orderBy(desc(projects.createdAt))
              .limit(6)
              .catch(() => []),
          ]);

          semanticBody = `
            <main style="max-width:720px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:18px;">
                <h1 style="font-size:26px;font-weight:800;margin:0 0 4px 0;">${escapeHtml(name)}</h1>
                <p style="font-size:15px;color:#64748b;margin:0 0 10px 0;">@${escapeHtml(u.username)}</p>
                <p style="font-size:16px;color:#334155;margin:0;">${escapeHtml(u.bio || "Genç Sosyal üreticisi ve topluluk üyesi.")}</p>
              </header>
              ${
                userProjects.length > 0
                  ? `<section style="margin-top:24px;"><h2 style="font-size:18px;font-weight:700;margin-bottom:10px;">Projeler</h2><ul style="list-style:none;padding:0;margin:0;">${userProjects
                      .map(
                        (proj: any) =>
                          `<li style="padding:8px 0;"><a href="${domain}/projects/${proj.id}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(proj.title)}</a> <span style="color:#64748b;font-size:13px;">(${escapeHtml(proj.category)})</span></li>`
                      )
                      .join("")}</ul></section>`
                  : ""
              }
              ${
                userPosts.length > 0
                  ? `<section style="margin-top:24px;"><h2 style="font-size:18px;font-weight:700;margin-bottom:10px;">Son Gönderiler</h2><ul style="list-style:none;padding:0;margin:0;">${userPosts
                      .map(
                        (post: any) =>
                          `<li style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><a href="${domain}/post/${post.id}" style="color:#0f172a;text-decoration:none;">${escapeHtml((post.content || "Gönderi").slice(0, 140))}</a></li>`
                      )
                      .join("")}</ul></section>`
                  : ""
              }
              ${buildFooterNav(domain)}
            </main>
          `;
        }
      } else if (projectMatch) {
        routeMatched = true;
        const projectId = parseSafePgInt(projectMatch[1]);
        const projectRecord = projectId
          ? await db
              .select({
                id: projects.id,
                title: projects.title,
                description: projects.description,
                detailedDescription: projects.detailedDescription,
                category: projects.category,
                imageUrl: projects.imageUrl,
                createdAt: projects.createdAt,
                authorUsername: users.username,
                authorDisplayName: profiles.displayName,
                authorIsActive: users.isActive,
                allowSearchEngineIndexing: profiles.allowSearchEngineIndexing,
                userIsPrivate: profiles.isPrivate,
              })
              .from(projects)
              .innerJoin(users, eq(projects.userId, users.id))
              .leftJoin(profiles, eq(users.id, profiles.userId))
              .where(eq(projects.id, projectId))
              .limit(1)
          : [];

        if (projectRecord.length === 0 || !projectRecord[0].authorIsActive) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Proje Bulunamadı | Genç Sosyal";
          description = "Aradığınız proje yayından kaldırılmış veya silinmiş olabilir.";
          semanticBody = `
            <main style="max-width:680px;margin:48px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:800;margin-bottom:12px;">Proje Bulunamadı</h1>
              <p style="color:#64748b;">Aradığınız proje mevcut değil veya silinmiş olabilir.</p>
              ${buildFooterNav(domain)}
            </main>
          `;
        } else {
          const prj = projectRecord[0];
          const creatorName = prj.authorDisplayName || prj.authorUsername;
          if (prj.allowSearchEngineIndexing === false || prj.userIsPrivate) {
            shouldNoIndex = true;
          }

          title = `${prj.title} — Proje | Genç Sosyal`;
          description = prj.description
            ? prj.description.slice(0, 155) + (prj.description.length > 155 ? "..." : "")
            : "Genç Sosyal'de geliştirilen yenilikçi projeyi inceleyin.";
          imageUrl = toAbsoluteUrl(prj.imageUrl, domain);

          jsonLd.push(
            makeBreadcrumb(domain, [
              { name: "Ana Sayfa", url: "/" },
              { name: "Projeler", url: "/projects" },
              { name: prj.title, url: `/projects/${prj.id}` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: prj.title,
              description,
              applicationCategory: prj.category || "DeveloperApplication",
              operatingSystem: "All",
              url: canonicalUrl,
              image: imageUrl,
              author: {
                "@type": "Person",
                name: creatorName,
                url: `${domain}/profile/${encodeURIComponent(prj.authorUsername)}`,
              },
              offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
            }
          );

          semanticBody = `
            <article style="max-width:760px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
                <h1 style="font-size:28px;font-weight:800;margin:0 0 8px 0;">${escapeHtml(prj.title)}</h1>
                <p style="font-size:15px;color:#64748b;margin:0;">
                  Geliştirici: <a href="${domain}/profile/${encodeURIComponent(prj.authorUsername)}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(creatorName)}</a> · Kategori: <strong>${escapeHtml(prj.category)}</strong>
                </p>
              </header>
              <section style="font-size:16px;color:#334155;">
                <p style="font-size:17px;font-weight:500;color:#0f172a;">${escapeHtml(prj.description || "")}</p>
                ${prj.detailedDescription ? `<div style="margin-top:16px;white-space:pre-wrap;">${escapeHtml(prj.detailedDescription)}</div>` : ""}
              </section>
              ${buildFooterNav(domain)}
            </article>
          `;
        }
      } else if (communityMatch) {
        routeMatched = true;
        const communitySlug = communityMatch[1];
        const commRecord = await db
          .select({
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
            description: communities.description,
            avatarUrl: communities.avatarUrl,
            isPrivate: communities.isPrivate,
            ownerUsername: users.username,
          })
          .from(communities)
          .innerJoin(users, eq(communities.ownerId, users.id))
          .where(and(eq(communities.slug, communitySlug), isNull(communities.deletedAt)))
          .limit(1);

        if (commRecord.length === 0) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Topluluk Bulunamadı | Genç Sosyal";
          description = "Aradığınız topluluk mevcut değil veya silinmiş.";
          semanticBody = `
            <main style="max-width:680px;margin:48px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:800;margin-bottom:12px;">Topluluk Bulunamadı</h1>
              <p style="color:#64748b;">Aradığınız topluluk kaldırılmış olabilir.</p>
              ${buildFooterNav(domain)}
            </main>
          `;
        } else {
          const c = commRecord[0];
          if (c.isPrivate) shouldNoIndex = true;
          canonicalUrl = `${domain}/communities/${encodeURIComponent(c.slug)}`;
          title = `${c.name} — Topluluk | Genç Sosyal`;
          description = c.description
            ? c.description.slice(0, 155) + (c.description.length > 155 ? "..." : "")
            : `${c.name} topluluğuna katılın, tartışmalara dahil olun ve genç üreticilerle iş birliği yapın.`;
          imageUrl = toAbsoluteUrl(c.avatarUrl, domain);

          jsonLd.push(
            makeBreadcrumb(domain, [
              { name: "Ana Sayfa", url: "/" },
              { name: "Topluluklar", url: "/communities" },
              { name: c.name, url: `/communities/${encodeURIComponent(c.slug)}` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: c.name,
              description,
              url: canonicalUrl,
              image: imageUrl,
            }
          );

          semanticBody = `
            <main style="max-width:760px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:18px;">
                <h1 style="font-size:28px;font-weight:800;margin:0 0 8px 0;">${escapeHtml(c.name)}</h1>
                <p style="font-size:16px;color:#334155;margin:0 0 8px 0;">${escapeHtml(c.description || "Genç Sosyal teknoloji ve üretim topluluğu.")}</p>
                <p style="font-size:14px;color:#64748b;margin:0;">Kurucu: <a href="${domain}/profile/${encodeURIComponent(c.ownerUsername)}" style="color:#2563eb;text-decoration:none;font-weight:600;">@${escapeHtml(c.ownerUsername)}</a></p>
              </header>
              ${buildFooterNav(domain)}
            </main>
          `;
        }
      } else if (teamMatch) {
        routeMatched = true;
        const teamSlug = teamMatch[1];
        const teamRecord = await db
          .select({
            id: teams.id,
            name: teams.name,
            slug: teams.slug,
            description: teams.description,
            category: teams.category,
            visibility: teams.visibility,
            memberCount: teams.memberCount,
            maxMembers: teams.maxMembers,
            avatarUrl: teams.avatarUrl,
            ownerUsername: users.username,
          })
          .from(teams)
          .innerJoin(users, eq(teams.ownerId, users.id))
          .where(and(eq(teams.slug, teamSlug), isNull(teams.deletedAt)))
          .limit(1);

        if (teamRecord.length === 0) {
          isNotFound = true;
          shouldNoIndex = true;
          title = "Takım Bulunamadı | Genç Sosyal";
          description = "Aradığınız takım mevcut değil veya kaldırılmış olabilir.";
          semanticBody = `
            <main style="max-width:680px;margin:48px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
              <h1 style="font-size:24px;font-weight:800;margin-bottom:12px;">Takım Bulunamadı</h1>
              <p style="color:#64748b;">Aradığınız takım mevcut değil veya silinmiş olabilir.</p>
              ${buildFooterNav(domain)}
            </main>
          `;
        } else {
          const t = teamRecord[0];
          if (t.visibility !== "PUBLIC") shouldNoIndex = true;
          canonicalUrl = `${domain}/teams/${encodeURIComponent(t.slug)}`;
          title = `${t.name} — Takım | Genç Sosyal`;
          description = t.description
            ? t.description.slice(0, 155) + (t.description.length > 155 ? "..." : "")
            : `${t.name} takımını inceleyin, ekip arkadaşlarıyla tanışın ve birlikte proje geliştirin.`;
          imageUrl = toAbsoluteUrl(t.avatarUrl, domain);

          jsonLd.push(
            makeBreadcrumb(domain, [
              { name: "Ana Sayfa", url: "/" },
              { name: "Takımlar", url: "/teams" },
              { name: t.name, url: `/teams/${encodeURIComponent(t.slug)}` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: t.name,
              description,
              url: canonicalUrl,
              image: imageUrl,
            }
          );

          semanticBody = `
            <main style="max-width:760px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
              <header style="border-bottom:1px solid #e2e8f0;padding-bottom:18px;">
                <h1 style="font-size:28px;font-weight:800;margin:0 0 8px 0;">${escapeHtml(t.name)}</h1>
                <p style="font-size:14px;color:#64748b;margin:0 0 10px 0;">Kategori: <strong>${escapeHtml(t.category)}</strong> · ${t.memberCount}/${t.maxMembers} Üye · Kaptan: <a href="${domain}/profile/${encodeURIComponent(t.ownerUsername)}" style="color:#2563eb;text-decoration:none;font-weight:600;">@${escapeHtml(t.ownerUsername)}</a></p>
                <p style="font-size:16px;color:#334155;margin:0;">${escapeHtml(t.description)}</p>
              </header>
              ${buildFooterNav(domain)}
            </main>
          `;
        }
      } else if (hashtagMatch) {
        routeMatched = true;
        const tagName = decodeURIComponent(hashtagMatch[1]);
        canonicalUrl = `${domain}/hashtags/${encodeURIComponent(tagName)}`;
        title = `#${tagName} Paylaşımları | Genç Sosyal`;
        description = `#${tagName} etiketi altındaki en güncel gönderileri, projeleri ve genç geliştirici tartışmalarını keşfedin.`;

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "Keşfet", url: "/explore" },
            { name: `#${tagName}`, url: `/hashtags/${encodeURIComponent(tagName)}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: canonicalUrl,
          }
        );

        let tagPosts: any[] = [];
        try {
          const [tagRow] = await db
            .select({ id: hashtags.id })
            .from(hashtags)
            .where(eq(hashtags.name, tagName.toLowerCase()))
            .limit(1);

          if (tagRow) {
            tagPosts = await db
              .select({
                id: posts.id,
                content: posts.content,
                username: users.username,
              })
              .from(postHashtags)
              .innerJoin(posts, eq(postHashtags.postId, posts.id))
              .innerJoin(users, eq(posts.userId, users.id))
              .where(
                and(
                  eq(postHashtags.hashtagId, tagRow.id),
                  eq(posts.visibility, "PUBLIC"),
                  eq(posts.moderationStatus, "APPROVED"),
                  eq(users.isActive, true)
                )
              )
              .orderBy(desc(posts.createdAt))
              .limit(10);
          }
        } catch {
          // Non-fatal
        }

        semanticBody = `
          <main style="max-width:740px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;">
            <header style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
              <h1 style="font-size:28px;font-weight:800;margin:0 0 8px 0;color:#2563eb;">#${escapeHtml(tagName)}</h1>
              <p style="font-size:16px;color:#475569;margin:0;">${escapeHtml(description)}</p>
            </header>
            ${
              tagPosts.length > 0
                ? `<section><h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Etiketli Gönderiler</h2><ul style="list-style:none;padding:0;margin:0;">${tagPosts
                    .map(
                      (p: any) =>
                        `<li style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><a href="${domain}/post/${p.id}" style="color:#0f172a;text-decoration:none;font-weight:500;">${escapeHtml((p.content || "").slice(0, 150))}</a> <span style="color:#64748b;font-size:13px;">— @${escapeHtml(p.username)}</span></li>`
                    )
                    .join("")}</ul></section>`
                : ""
            }
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/") {
        routeMatched = true;
        canonicalUrl = `${domain}/`;
        title = "Genç Sosyal — Genç Üretici ve Yazılımcı Platformu";
        description =
          "Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini, takımlarını, topluluklarını ve fikirlerini paylaştığı yeni nesil sosyal platform.";

        const [homeProjects, homeCommunities, homeTeams, homePosts] = await Promise.all([
          db
            .select({ id: projects.id, title: projects.title, category: projects.category })
            .from(projects)
            .orderBy(desc(projects.createdAt))
            .limit(6)
            .catch(() => []),
          db
            .select({ slug: communities.slug, name: communities.name })
            .from(communities)
            .where(and(isNull(communities.deletedAt), eq(communities.isPrivate, false)))
            .limit(6)
            .catch(() => []),
          db
            .select({ slug: teams.slug, name: teams.name, category: teams.category })
            .from(teams)
            .where(and(isNull(teams.deletedAt), eq(teams.visibility, "PUBLIC")))
            .orderBy(desc(teams.updatedAt))
            .limit(6)
            .catch(() => []),
          db
            .select({ id: posts.id, content: posts.content, username: users.username })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .where(
              and(
                eq(posts.visibility, "PUBLIC"),
                eq(posts.moderationStatus, "APPROVED"),
                isNull(posts.communityId),
                eq(users.isActive, true)
              )
            )
            .orderBy(desc(posts.createdAt))
            .limit(6)
            .catch(() => []),
        ]);

        semanticBody = `
          <main style="max-width:860px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <header style="text-align:center;margin-bottom:32px;">
              <h1 style="font-size:32px;font-weight:900;letter-spacing:-0.4px;margin:0 0 12px 0;">Genç Sosyal — Genç Üretici ve Yazılımcı Platformu</h1>
              <p style="font-size:17px;color:#475569;max-width:640px;margin:0 auto 20px auto;">Türkiye'nin genç yazılımcıları, tasarımcıları ve öğrencileri için proje vitrini, takım kurma alanı, teknoloji toplulukları ve canlı bilgi yarışmaları.</p>
              <nav style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                <a href="${domain}/explore" style="padding:10px 18px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">Keşfet</a>
                <a href="${domain}/projects" style="padding:10px 18px;background:#f1f5f9;color:#0f172a;border-radius:10px;text-decoration:none;font-weight:700;">Projeler</a>
                <a href="${domain}/teams" style="padding:10px 18px;background:#f1f5f9;color:#0f172a;border-radius:10px;text-decoration:none;font-weight:700;">Takımlar</a>
                <a href="${domain}/communities" style="padding:10px 18px;background:#f1f5f9;color:#0f172a;border-radius:10px;text-decoration:none;font-weight:700;">Topluluklar</a>
              </nav>
            </header>
            ${
              homePosts.length > 0
                ? `<section style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:20px;"><h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Güncel Paylaşımlar</h2><ul style="list-style:none;padding:0;margin:0;">${homePosts
                    .map(
                      (p: any) =>
                        `<li style="padding:8px 0;"><a href="${domain}/post/${p.id}" style="color:#0f172a;text-decoration:none;">${escapeHtml((p.content || "Gönderi").slice(0, 140))}</a> <span style="color:#64748b;font-size:13px;">— @${escapeHtml(p.username)}</span></li>`
                    )
                    .join("")}</ul></section>`
                : ""
            }
            ${
              homeProjects.length > 0
                ? `<section style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:20px;"><h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Öne Çıkan Projeler</h2><ul style="list-style:none;padding:0;margin:0;">${homeProjects
                    .map(
                      (hp: any) =>
                        `<li style="padding:8px 0;"><a href="${domain}/projects/${hp.id}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(hp.title)}</a> <span style="color:#64748b;font-size:13px;">(${escapeHtml(hp.category)})</span></li>`
                    )
                    .join("")}</ul></section>`
                : ""
            }
            ${
              homeTeams.length > 0
                ? `<section style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:20px;"><h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Aktif Takımlar</h2><ul style="list-style:none;padding:0;margin:0;">${homeTeams
                    .map(
                      (ht: any) =>
                        `<li style="padding:8px 0;"><a href="${domain}/teams/${encodeURIComponent(ht.slug)}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(ht.name)}</a> <span style="color:#64748b;font-size:13px;">(${escapeHtml(ht.category)})</span></li>`
                    )
                    .join("")}</ul></section>`
                : ""
            }
            ${
              homeCommunities.length > 0
                ? `<section style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:20px;"><h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Popüler Topluluklar</h2><ul style="list-style:none;padding:0;margin:0;">${homeCommunities
                    .map(
                      (hc: any) =>
                        `<li style="padding:8px 0;"><a href="${domain}/communities/${encodeURIComponent(hc.slug)}" style="color:#2563eb;font-weight:600;text-decoration:none;">${escapeHtml(hc.name)}</a></li>`
                    )
                    .join("")}</ul></section>`
                : ""
            }
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/welcome") {
        routeMatched = true;
        canonicalUrl = `${domain}/welcome`;
        title = "Genç Sosyal'e Hoş Geldiniz — Genç Üretici ve Yazılımcı Ağı";
        description =
          "Genç Sosyal ile yazılım ve teknoloji projelerinizi paylaşın, yarışma takımları kurun, topluluklara katılın ve canlı quiz etkinliklerinde yer alın.";
        semanticBody = `
          <main style="max-width:840px;margin:36px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:32px;font-weight:900;margin-bottom:12px;">Genç Sosyal — Birlikte Üret, Paylaş, Yarış</h1>
            <p style="font-size:17px;color:#475569;">Genç üreticilerin, yazılımcıların, tasarımcıların ve öğrencilerin buluşma noktası. Projelerini sergile, takım arkadaşları bul, topluluklara katıl ve canlı bilgi yarışmalarında yerini al.</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/explore") {
        routeMatched = true;
        canonicalUrl = `${domain}/explore`;
        title = "Keşfet — Trend Projeler, Etiketler ve Topluluklar | Genç Sosyal";
        description =
          "Genç Sosyal Keşfet ile trend teknoloji projelerini, popüler yazılım etiketlerini, aktif toplulukları ve üretken genç geliştiricileri anında keşfedin.";

        if (req.query.q) {
          shouldNoIndex = true;
          title = `"${String(req.query.q).slice(0, 60)}" Arama Sonuçları | Genç Sosyal`;
        }

        const [topTags, recentPosts] = await Promise.all([
          db
            .select({ name: hashtags.name, usageCount: hashtags.usageCount })
            .from(hashtags)
            .where(gt(hashtags.usageCount, 0))
            .orderBy(desc(hashtags.usageCount))
            .limit(12)
            .catch(() => []),
          db
            .select({ id: posts.id, content: posts.content, username: users.username })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .where(
              and(
                eq(posts.visibility, "PUBLIC"),
                eq(posts.moderationStatus, "APPROVED"),
                eq(users.isActive, true)
              )
            )
            .orderBy(desc(posts.createdAt))
            .limit(10)
            .catch(() => []),
        ]);

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "Keşfet", url: "/explore" },
          ])
        );

        semanticBody = `
          <main style="max-width:840px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:900;margin:0 0 8px 0;">Keşfet — Trend Paylaşımlar ve Etiketler</h1>
            <p style="font-size:16px;color:#475569;margin:0 0 24px 0;">${escapeHtml(description)}</p>
            ${
              topTags.length > 0
                ? `<section style="margin-bottom:28px;"><h2 style="font-size:18px;font-weight:700;margin-bottom:10px;">Popüler Etiketler</h2><p>${topTags
                    .map(
                      (t: any) =>
                        `<a href="${domain}/hashtags/${encodeURIComponent(t.name)}" style="display:inline-block;margin:4px 8px 4px 0;color:#2563eb;font-weight:600;text-decoration:none;">#${escapeHtml(t.name)}</a>`
                    )
                    .join("")}</p></section>`
                : ""
            }
            ${
              recentPosts.length > 0
                ? `<section><h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Öne Çıkan Gönderiler</h2><ul style="list-style:none;padding:0;margin:0;">${recentPosts
                    .map(
                      (p: any) =>
                        `<li style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><a href="${domain}/post/${p.id}" style="color:#0f172a;text-decoration:none;">${escapeHtml((p.content || "Gönderi").slice(0, 150))}</a> <span style="color:#64748b;font-size:13px;">— @${escapeHtml(p.username)}</span></li>`
                    )
                    .join("")}</ul></section>`
                : ""
            }
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/projects") {
        routeMatched = true;
        title = "Projeler — Genç Üretici ve Yazılım Projeleri | Genç Sosyal";
        description =
          "Genç yazılımcı, tasarımcı ve mühendislerin geliştirdiği açık kaynak ve yenilikçi projeleri inceleyin, geri bildirim verin ve ortaklık kurun.";

        const list = await db
          .select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            category: projects.category,
          })
          .from(projects)
          .orderBy(desc(projects.createdAt))
          .limit(20)
          .catch(() => []);

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "Projeler", url: "/projects" },
          ])
        );

        semanticBody = `
          <main style="max-width:840px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:900;margin:0 0 8px 0;">Genç Sosyal Projeleri</h1>
            <p style="font-size:16px;color:#475569;margin:0 0 24px 0;">${escapeHtml(description)}</p>
            ${
              list.length > 0
                ? `<ul style="list-style:none;padding:0;margin:0;">${list
                    .map(
                      (p: any) =>
                        `<li style="padding:14px 0;border-bottom:1px solid #e2e8f0;"><h2 style="font-size:18px;font-weight:700;margin:0 0 4px 0;"><a href="${domain}/projects/${p.id}" style="color:#2563eb;text-decoration:none;">${escapeHtml(p.title)}</a></h2><p style="font-size:14px;color:#475569;margin:0;">${escapeHtml((p.description || "").slice(0, 180))}</p></li>`
                    )
                    .join("")}</ul>`
                : `<p style="color:#64748b;">Açık kaynak, yapay zeka, web, mobil ve robotik alanındaki projeler burada sergilenir.</p>`
            }
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/communities") {
        routeMatched = true;
        title = "Topluluklar — Teknoloji ve Üretim Grupları | Genç Sosyal";
        description =
          "Yazılım, yapay zeka, tasarım, robotik ve girişimcilik alanındaki genç topluluklara katılın; etkinlikler düzenleyin ve birlikte üretin.";

        const list = await db
          .select({
            slug: communities.slug,
            name: communities.name,
            description: communities.description,
          })
          .from(communities)
          .where(and(isNull(communities.deletedAt), eq(communities.isPrivate, false)))
          .orderBy(desc(communities.createdAt))
          .limit(20)
          .catch(() => []);

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "Topluluklar", url: "/communities" },
          ])
        );

        semanticBody = `
          <main style="max-width:840px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:900;margin:0 0 8px 0;">Genç Sosyal Toplulukları</h1>
            <p style="font-size:16px;color:#475569;margin:0 0 24px 0;">${escapeHtml(description)}</p>
            ${
              list.length > 0
                ? `<ul style="list-style:none;padding:0;margin:0;">${list
                    .map(
                      (c: any) =>
                        `<li style="padding:14px 0;border-bottom:1px solid #e2e8f0;"><h2 style="font-size:18px;font-weight:700;margin:0 0 4px 0;"><a href="${domain}/communities/${encodeURIComponent(c.slug)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(c.name)}</a></h2><p style="font-size:14px;color:#475569;margin:0;">${escapeHtml((c.description || "").slice(0, 180))}</p></li>`
                    )
                    .join("")}</ul>`
                : `<p style="color:#64748b;">İlgi alanlarınıza göre teknoloji, tasarım ve üniversite topluluklarını keşfedin.</p>`
            }
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/teams") {
        routeMatched = true;
        title = "Takımlar — TEKNOFEST ve Proje Takımı Kur | Genç Sosyal";
        description =
          "TEKNOFEST, yazılım, yapay zeka, robotik ve yarışmalar için kendi güvenli takımını kur veya açık takımlara katılıp ekip arkadaşları bul.";

        const list = await db
          .select({
            slug: teams.slug,
            name: teams.name,
            description: teams.description,
            category: teams.category,
            memberCount: teams.memberCount,
          })
          .from(teams)
          .where(and(isNull(teams.deletedAt), eq(teams.visibility, "PUBLIC")))
          .orderBy(desc(teams.updatedAt))
          .limit(20)
          .catch(() => []);

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "Takımlar", url: "/teams" },
          ])
        );

        semanticBody = `
          <main style="max-width:840px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:900;margin:0 0 8px 0;">Genç Sosyal Takımları</h1>
            <p style="font-size:16px;color:#475569;margin:0 0 24px 0;">${escapeHtml(description)}</p>
            ${
              list.length > 0
                ? `<ul style="list-style:none;padding:0;margin:0;">${list
                    .map(
                      (t: any) =>
                        `<li style="padding:14px 0;border-bottom:1px solid #e2e8f0;"><h2 style="font-size:18px;font-weight:700;margin:0 0 4px 0;"><a href="${domain}/teams/${encodeURIComponent(t.slug)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(t.name)}</a></h2><p style="font-size:13px;color:#64748b;margin:0 0 4px 0;">${escapeHtml(t.category)} · ${t.memberCount} üye</p><p style="font-size:14px;color:#475569;margin:0;">${escapeHtml((t.description || "").slice(0, 180))}</p></li>`
                    )
                    .join("")}</ul>`
                : `<p style="color:#64748b;">TEKNOFEST, hackathon ve açık kaynak projeleri için kendi takımınızı oluşturun veya açık takımlara başvurun.</p>`
            }
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/teknofest" || cleanPath.startsWith("/teknofest/")) {
        routeMatched = true;
        const teknofestSlug =
          cleanPath === "/teknofest" ? "2026" : cleanPath.replace("/teknofest/", "");
        title = `TEKNOFEST ${teknofestSlug} Köşesi — Fotoğraf ve Anı Arşivi | Genç Sosyal`;
        description = `TEKNOFEST ${teknofestSlug} festival fotoğrafları, genç üreticilerin yarışma projeleri, unutulmayan anıları ve gün gün festival zaman tüneli.`;
        ogType = "website";

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "TEKNOFEST Köşesi", url: "/teknofest" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Event",
            name: `TEKNOFEST ${teknofestSlug}`,
            description,
            startDate: "2026-09-30T09:00:00+03:00",
            endDate: "2026-10-04T19:00:00+03:00",
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: "Şanlıurfa GAP Havalimanı",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Şanlıurfa",
                addressCountry: "TR",
              },
            },
            organizer: { "@type": "Organization", name: "Genç Sosyal", url: `${domain}/` },
          }
        );

        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:30px;font-weight:900;margin:0 0 10px 0;">TEKNOFEST Köşesi — Bilim, Teknoloji ve Anılar</h1>
            <p style="font-size:17px;color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/quiz") {
        routeMatched = true;
        title = "Genç Quiz — Canlı Çok Oyunculu Bilgi Yarışması | Genç Sosyal";
        description =
          "Arkadaşlarınla veya toplulukla canlı bilgi yarışması odaları kur, oda kodunu paylaş, düellolara katıl ve genel kültürünü gerçek zamanlı test et.";

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "Genç Quiz", url: "/quiz" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: "Genç Quiz",
            description,
            url: `${domain}/quiz`,
            genre: ["Trivia", "Quiz", "Educational", "Multiplayer"],
            gamePlatform: ["Web Browser", "Mobile Web"],
          }
        );

        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:30px;font-weight:900;margin:0 0 10px 0;">Genç Quiz — Canlı Çok Oyunculu Bilgi Yarışması</h1>
            <p style="font-size:17px;color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/youth-league") {
        routeMatched = true;
        title = "19 Mayıs Gençlik Ligi — 1v1 Bilgi Arenası | Genç Sosyal";
        description =
          "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı özel 1v1 düelloları, dinamik liderlik sıralaması ve rozet ödüllü bilgi ligi.";

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "19 Mayıs Gençlik Ligi", url: "/youth-league" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Event",
            name: "19 Mayıs Gençlik Ligi",
            description,
            startDate: "2026-05-01T00:00:00+03:00",
            endDate: "2026-05-31T23:59:59+03:00",
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
            location: { "@type": "VirtualLocation", url: `${domain}/youth-league` },
            organizer: { "@type": "Organization", name: "Genç Sosyal", url: `${domain}/` },
          }
        );

        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:30px;font-weight:900;margin:0 0 10px 0;">19 Mayıs Gençlik Ligi</h1>
            <p style="font-size:17px;color:#475569;">${escapeHtml(description)}</p>
            <p><a href="${domain}/youth-league/leaderboard" style="color:#2563eb;font-weight:700;text-decoration:none;">Liderlik Tablosunu Gör</a> · <a href="${domain}/youth-league/archive" style="color:#2563eb;font-weight:700;text-decoration:none;">Sezon Arşivi</a></p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/youth-league/leaderboard") {
        routeMatched = true;
        title = "19 Mayıs Gençlik Ligi Liderlik Tablosu | Genç Sosyal";
        description =
          "19 Mayıs Gençlik Ligi en yüksek puanlı yarışmacıları, güncel şampiyonlar sıralaması ve kazanılan rozetler.";

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "19 Mayıs Gençlik Ligi", url: "/youth-league" },
            { name: "Liderlik Tablosu", url: "/youth-league/leaderboard" },
          ])
        );

        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:900;margin:0 0 10px 0;">19 Mayıs Gençlik Ligi Liderlik Tablosu</h1>
            <p style="font-size:16px;color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/youth-league/archive") {
        routeMatched = true;
        title = "19 Mayıs Gençlik Ligi Arşivi | Genç Sosyal";
        description =
          "Geçmiş 19 Mayıs Gençlik Ligi sezonları, şampiyonlar ve unutulmayan 1v1 bilgi düellosu istatistikleri.";

        jsonLd.push(
          makeBreadcrumb(domain, [
            { name: "Ana Sayfa", url: "/" },
            { name: "19 Mayıs Gençlik Ligi", url: "/youth-league" },
            { name: "Arşiv", url: "/youth-league/archive" },
          ])
        );

        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:900;margin:0 0 10px 0;">19 Mayıs Gençlik Ligi Sezon Arşivi</h1>
            <p style="font-size:16px;color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/privacy") {
        routeMatched = true;
        title = "Gizlilik Politikası ve Veri Güvenliği | Genç Sosyal";
        description =
          "Genç Sosyal kullanıcı gizliliği, kişisel verilerin korunması, çerez tercihleri ve platform bilgi güvenliği ilkeleri hakkında detaylı bilgilendirme.";
        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:800;">Gizlilik Politikası</h1>
            <p style="color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/terms") {
        routeMatched = true;
        title = "Kullanım Şartları ve Topluluk Kuralları | Genç Sosyal";
        description =
          "Genç Sosyal platformu üyelik sözleşmesi, kullanıcı hakları, güvenli topluluk kuralları ve hizmet şartları hakkında resmi bilgilendirme.";
        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:800;">Kullanım Şartları ve Topluluk Kuralları</h1>
            <p style="color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/kvkk") {
        routeMatched = true;
        title = "KVKK Aydınlatma Metni | Genç Sosyal";
        description =
          "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında Genç Sosyal kullanıcı verilerinin işlenmesi ve haklarınız hakkında aydınlatma metni.";
        semanticBody = `
          <main style="max-width:820px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:800;">KVKK Aydınlatma Metni</h1>
            <p style="color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      } else if (cleanPath === "/sitemap") {
        routeMatched = true;
        title = "Site Haritası — Tüm Sayfalar ve Dizin | Genç Sosyal";
        description =
          "Genç Sosyal platformundaki tüm açık projelere, takımlara, topluluklara, quiz etkinliklerine ve bilgi sayfalarına hızlı erişim dizini.";
        semanticBody = `
          <main style="max-width:840px;margin:32px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#0f172a;">
            <h1 style="font-size:28px;font-weight:800;">Genç Sosyal Site Haritası</h1>
            <p style="color:#475569;">${escapeHtml(description)}</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      }

      // Any unrecognized route -> real HTTP 404 + noindex (eliminates Soft-404s!)
      if (!routeMatched) {
        isNotFound = true;
        shouldNoIndex = true;
        title = "Sayfa Bulunamadı (404) | Genç Sosyal";
        description = "Aradığınız sayfa bulunamadı, silinmiş veya taşınmış olabilir.";
        semanticBody = `
          <main style="max-width:680px;margin:48px auto;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
            <h1 style="font-size:28px;font-weight:800;margin-bottom:10px;color:#0f172a;">404 — Sayfa Bulunamadı</h1>
            <p style="color:#64748b;margin-bottom:24px;">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            ${buildFooterNav(domain)}
          </main>
        `;
      }

      const safeTitle = escapeHtml(title);
      const safeDescription = escapeHtml(description);
      const safeKeywords = escapeHtml(keywords);
      const safeImageUrl = escapeHtml(imageUrl);
      const safeCanonicalUrl = escapeHtml(canonicalUrl);

      const robotsContent = shouldNoIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

      const headMetadata = `
      <title>${safeTitle}</title>
      <meta name="description" content="${safeDescription}" />
      <meta name="keywords" content="${safeKeywords}" />
      <meta name="robots" content="${robotsContent}" />
      <link rel="canonical" href="${safeCanonicalUrl}" />
      <link rel="alternate" hreflang="tr" href="${safeCanonicalUrl}" />
      <link rel="alternate" hreflang="x-default" href="${safeCanonicalUrl}" />
      <meta property="og:type" content="${ogType}" />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:url" content="${safeCanonicalUrl}" />
      <meta property="og:title" content="${safeTitle}" />
      <meta property="og:description" content="${safeDescription}" />
      <meta property="og:image" content="${safeImageUrl}" />
      <meta property="og:image:alt" content="${safeTitle}" />
      <meta property="og:site_name" content="Genç Sosyal" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="${safeCanonicalUrl}" />
      <meta name="twitter:title" content="${safeTitle}" />
      <meta name="twitter:description" content="${safeDescription}" />
      <meta name="twitter:image" content="${safeImageUrl}" />
      <script type="application/ld+json">${safeJsonLd(jsonLd)}</script>
      `;

      // Strip static tags from index.html template cleanly before injecting per-route metadata
      let finalHtml = template;
      finalHtml = finalHtml.replace(/<title>[\s\S]*?<\/title>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="description"[^>]*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="keywords"[^>]*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+name="robots"[^>]*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<link\s+rel="canonical"[^>]*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+property="og:[^"]*"[^>]*\/?>/gi, "");
      finalHtml = finalHtml.replace(/<meta\s+(?:property|name)="twitter:[^"]*"[^>]*\/?>/gi, "");
      finalHtml = finalHtml.replace(
        /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi,
        ""
      );

      finalHtml = finalHtml.replace("</head>", `${headMetadata}\n  </head>`);

      // Replace the blank initial-app-loader inside #root with rich semantic HTML for crawlers
      // (React's createRoot().render() smoothly replaces #root contents immediately on hydration)
      if (semanticBody) {
        finalHtml = finalHtml.replace(
          /<div id="root">[\s\S]*?<\/div>\s*(?=<script\b|<\/body>)/i,
          `<div id="root">${semanticBody}</div>\n    `
        );
      }

      if (vite) {
        try {
          finalHtml = await vite.transformIndexHtml(req.originalUrl, finalHtml);
        } catch (vErr) {
          console.error("Vite transformIndexHtml error:", vErr);
        }
      }

      const statusCode = isNotFound ? 404 : 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Robots-Tag", robotsContent);
      if (shouldNoIndex || isNotFound) {
        res.setHeader("Cache-Control", "no-store, max-age=0");
      } else {
        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
      }
      res.status(statusCode).send(finalHtml);
    } catch (error) {
      console.error("SEO Middleware error:", error);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(template);
    }
  };
}
