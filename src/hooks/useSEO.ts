import { useEffect } from "react";

interface SEOProps {
  /**
   * - `true`: explicitly allow indexing (`index, follow, max-image-preview:large, ...`)
   * - `false`: explicitly block indexing (`noindex, nofollow`)
   * - `undefined`: preserve current/server-rendered robots tag (prevents race-condition noindex while async data loads)
   */
  allowIndexing?: boolean;
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const INDEX_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

function upsertMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export function useSEO({
  allowIndexing,
  title,
  description,
  keywords,
  canonicalPath,
  ogImage,
  jsonLd,
}: SEOProps = {}) {
  useEffect(() => {
    // 1. Robots indexing meta tag — only mutate when explicitly true or false
    if (allowIndexing !== undefined) {
      upsertMeta("name", "robots", allowIndexing ? INDEX_ROBOTS : "noindex, nofollow");
    }

    // 2. Canonical URL & Social URLs
    const productionDomain = "https://gencsosyal.com";
    const rawPath =
      canonicalPath ||
      (typeof window !== "undefined" ? window.location.pathname : "/");
    const cleanPath = rawPath.split("?")[0].split("#")[0];
    const normalizedPath =
      cleanPath.length > 1 && cleanPath.endsWith("/")
        ? cleanPath.slice(0, -1)
        : cleanPath;
    const fullCanonicalUrl = `${productionDomain}${normalizedPath || "/"}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", fullCanonicalUrl);

    document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.setAttribute("href", fullCanonicalUrl));

    upsertMeta("property", "og:url", fullCanonicalUrl);
    upsertMeta("name", "twitter:url", fullCanonicalUrl);

    // 3. Title, Description, Keywords & Social Cards
    if (title) {
      document.title = title;
      upsertMeta("property", "og:title", title);
      upsertMeta("name", "twitter:title", title);
    }

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    if (keywords) {
      upsertMeta("name", "keywords", keywords);
    }

    if (ogImage) {
      const validOgImage = ogImage.startsWith("http")
        ? ogImage
        : `${productionDomain}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`;
      upsertMeta("property", "og:image", validOgImage);
      upsertMeta("name", "twitter:image", validOgImage);
    }

    // 4. Dynamic JSON-LD structured data
    let jsonLdScript = document.getElementById(
      "client-dynamic-jsonld"
    ) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.id = "client-dynamic-jsonld";
        jsonLdScript.type = "application/ld+json";
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }

    return () => {
      // On leaving an explicitly noindex page, reset to indexable so next route doesn't inherit noindex
      if (allowIndexing === false) {
        upsertMeta("name", "robots", INDEX_ROBOTS);
      }
    };
  }, [allowIndexing, title, description, keywords, canonicalPath, ogImage, jsonLd]);
}
