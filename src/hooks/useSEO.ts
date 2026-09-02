import { useEffect } from "react";

interface SEOProps {
  allowIndexing?: boolean;
  title?: string;
  description?: string;
}

export function useSEO({ allowIndexing = true, title, description }: SEOProps = {}) {
  useEffect(() => {
    // 1. Robots indexing
    const robotsContent = allowIndexing ? "index, follow" : "noindex, nofollow";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", robotsContent);

    // Backup originals for cleanup
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute("content") : null;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitle ? ogTitle.getAttribute("content") : null;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const originalOgDesc = ogDesc ? ogDesc.getAttribute("content") : null;

    // 2. Title & Description
    if (title) {
      document.title = title;
      if (ogTitle) ogTitle.setAttribute("content", title);
    }
    if (description) {
      if (metaDesc) metaDesc.setAttribute("content", description);
      if (ogDesc) ogDesc.setAttribute("content", description);
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
  }, [allowIndexing, title, description]);
}
