const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const PORT = parseInt(process.env.PORT || "3000", 10);\n  // Security and utilities middlewares\n  const isProd = process.env.NODE_ENV === "production";',
  'const PORT = parseInt(process.env.PORT || "3000", 10);\n  // Security and utilities middlewares'
);

fs.writeFileSync('server.ts', content);
