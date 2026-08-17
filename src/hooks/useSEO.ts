import { useEffect } from "react";

export function useSEO(allowIndexing: boolean) {
  useEffect(() => {
    // Determine the robots meta tag value based on indexing preference
    const robotsContent = allowIndexing ? "index, follow" : "noindex, nofollow";
    
    // Check if a meta tag for robots already exists
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    
    metaRobots.setAttribute("content", robotsContent);

    return () => {
      // Optional cleanup if needed (e.g. restoring default to index, follow)
      // But typically we just let the next page render handle its SEO
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute("content", "index, follow");
      }
    };
  }, [allowIndexing]);
}
