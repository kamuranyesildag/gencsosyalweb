import { useEffect } from "react";

interface SEOProps {
  allowIndexing?: boolean;
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
}

export function useSEO({
  allowIndexing = true,
  title,
  description,
  canonicalPath,
  ogImage,
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

    // 2. Canonical URL & Social URLs
    const rawOrigin = typeof window !== "undefined" ? window.location.origin : "https://gencsosyal.com";
    const pathname = canonicalPath || (typeof window !== "undefined" ? window.location.pathname : "/");
    // Normalize trailing slash: root '/' stays '/', subpaths '/explore/' becomes '/explore'
    const normalizedPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const fullCanonicalUrl = `${rawOrigin}${normalizedPath}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", fullCanonicalUrl);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", fullCanonicalUrl);
    let twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute("content", fullCanonicalUrl);

    // 3. Title & Description
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute("content") : null;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle ? ogTitle.getAttribute("content") : null;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const originalOgDesc = ogDesc ? ogDesc.getAttribute("content") : null;
    const ogImg = document.querySelector('meta[property="og:image"]');
    const twitterImg = document.querySelector('meta[property="twitter:image"]');

    if (title) {
      document.title = title;
      if (ogTitle) ogTitle.setAttribute("content", title);
      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute("content", title);
    }
    if (description) {
      if (metaDesc) metaDesc.setAttribute("content", description);
      if (ogDesc) ogDesc.setAttribute("content", description);
      const twitterDesc = document.querySelector('meta[property="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute("content", description);
    }
    if (ogImage) {
      if (ogImg) ogImg.setAttribute("content", ogImage);
      if (twitterImg) twitterImg.setAttribute("content", ogImage);
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
    };
  }, [allowIndexing, title, description, canonicalPath, ogImage]);
}
