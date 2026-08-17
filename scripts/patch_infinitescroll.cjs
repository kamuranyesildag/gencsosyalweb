const fs = require('fs');
let content = fs.readFileSync('src/components/InfiniteScroll.tsx', 'utf8');

content = content.replace(
  'import React, { useEffect, useRef } from "react";',
  'import React, { useEffect, useRef } from "react";\nimport { useAuthStore } from "../context/useAuth";\nimport { useAuthModalStore } from "../context/useAuthModal";'
);

content = content.replace(
  'export function InfiniteScroll({ hasMore, isLoading, onLoadMore, children }: InfiniteScrollProps) {\n  const observerRef = useRef<HTMLDivElement>(null);',
  'export function InfiniteScroll({ hasMore, isLoading, onLoadMore, children }: InfiniteScrollProps) {\n  const observerRef = useRef<HTMLDivElement>(null);\n  const { isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();'
);

content = content.replace(
  'if (entries[0].isIntersecting && hasMore && !isLoading) {\n          onLoadMore();\n        }',
  'if (entries[0].isIntersecting && hasMore && !isLoading) {\n          if (!isAuthenticated) openModal();\n          else onLoadMore();\n        }'
);

fs.writeFileSync('src/components/InfiniteScroll.tsx', content);
