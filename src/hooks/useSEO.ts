import { useEffect } from "react";

interface SEOProps {
  allowIndexing?: boolean;
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export function useSEO({
  allowIndexing = true,
  title,
  description,
  keywords,
  canonicalPath,
  ogImage,
  jsonLd,
}: SEOProps = {}) {
  useEffect(() => {
    // 1. Robots indexing meta tag
    const robotsContent = allowIndexing ? "index, follow" : "noindex, nofollow";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", robotsContent);

    // 2. Canonical URL & Social URLs (Always use production domain https://gencsosyal.com)
    const productionDomain = "https://gencsosyal.com";
    const rawPath = canonicalPath || (typeof window !== "undefined" ? window.location.pathname : "/");
    // Strip query parameters and hashes from canonical
    const cleanPath = rawPath.split("?")[0].split("#")[0];
    // Normalize trailing slash: root '/' stays '/', subpaths '/explore/' becomes '/explore'
    const normalizedPath = cleanPath.length > 1 && cleanPath.endsWith("/") ? cleanPath.slice(0, -1) : cleanPath;
    const fullCanonicalUrl = `${productionDomain}${normalizedPath || "/"}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", fullCanonicalUrl);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", fullCanonicalUrl);

    let twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (!twitterUrl) {
      twitterUrl = document.createElement("meta");
      twitterUrl.setAttribute("property", "twitter:url");
      document.head.appendChild(twitterUrl);
    }
    twitterUrl.setAttribute("content", fullCanonicalUrl);

    // 3. Title, Description & Keywords
    const originalTitle = document.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    const originalDesc = metaDesc.getAttribute("content");

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    const originalKeywords = metaKeywords ? metaKeywords.getAttribute("content") : null;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    const originalOgTitle = ogTitle.getAttribute("content");

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    const originalOgDesc = ogDesc.getAttribute("content");

    let ogImg = document.querySelector('meta[property="og:image"]');
    if (!ogImg) {
      ogImg = document.createElement("meta");
      ogImg.setAttribute("property", "og:image");
      document.head.appendChild(ogImg);
    }

    let twitterImg = document.querySelector('meta[property="twitter:image"]');
    if (!twitterImg) {
      twitterImg = document.createElement("meta");
      twitterImg.setAttribute("property", "twitter:image");
      document.head.appendChild(twitterImg);
    }

    let twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement("meta");
      twitterTitle.setAttribute("property", "twitter:title");
      document.head.appendChild(twitterTitle);
    }

    let twitterDesc = document.querySelector('meta[property="twitter:description"]');
    if (!twitterDesc) {
      twitterDesc = document.createElement("meta");
      twitterDesc.setAttribute("property", "twitter:description");
      document.head.appendChild(twitterDesc);
    }

    if (title) {
      document.title = title;
      ogTitle.setAttribute("content", title);
      twitterTitle.setAttribute("content", title);
    }
    if (description) {
      metaDesc.setAttribute("content", description);
      ogDesc.setAttribute("content", description);
      twitterDesc.setAttribute("content", description);
    }
    if (keywords) {
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }
    if (ogImage) {
      const validOgImage = ogImage.startsWith("http") ? ogImage : `${productionDomain}${ogImage}`;
      ogImg.setAttribute("content", validOgImage);
      twitterImg.setAttribute("content", validOgImage);
    }

    // 4. Dynamic JSON-LD structured data
    let jsonLdScript = document.getElementById("client-dynamic-jsonld") as HTMLScriptElement | null;
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
      // Restore on unmount
      if (metaRobots) metaRobots.setAttribute("content", "index, follow");
      if (title) {
        document.title = originalTitle;
        if (ogTitle && originalOgTitle !== null) ogTitle.setAttribute("content", originalOgTitle);
      }
      if (description) {
        if (metaDesc && originalDesc !== null) metaDesc.setAttribute("content", originalDesc);
        if (ogDesc && originalOgDesc !== null) ogDesc.setAttribute("content", originalOgDesc);
      }
      if (keywords && metaKeywords && originalKeywords !== null) {
        metaKeywords.setAttribute("content", originalKeywords);
      }
    };
  }, [allowIndexing, title, description, keywords, canonicalPath, ogImage, jsonLd]);
}
