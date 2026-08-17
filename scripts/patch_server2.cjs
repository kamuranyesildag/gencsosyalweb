const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  '// --- API Routes End ---',
  '// --- API Routes End ---\n\n  const { seoMiddleware } = await import("./server/middleware/seo.js");\n  app.use(seoMiddleware);'
);

fs.writeFileSync('server.ts', content);
