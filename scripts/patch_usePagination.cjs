const fs = require('fs');
let content = fs.readFileSync('src/hooks/usePagination.ts', 'utf8');

content = content.replace(
  'url.searchParams.set("limit", limit.toString());',
  'url.searchParams.set("limit", limit.toString());\n      if (!isInitial && meta?.nextCursor) {\n        url.searchParams.set("cursor", meta.nextCursor);\n      }'
);

// We need to use a ref for the latest meta to avoid dependency issues if we just rely on `meta` from closure.
// But we can just use functional state. Wait, fetchPage dependencies don't include meta!
fs.writeFileSync('src/hooks/usePagination.ts', content);
