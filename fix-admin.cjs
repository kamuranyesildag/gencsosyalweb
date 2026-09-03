const fs = require('fs');
const path = 'server/routes/auth.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const userId = req\.user\?\.id;\n\s*if \(\!userId\) return res\.status\(401\)\.json\(\{ success: false, message: "Unauthorized" \}\);/g,
  `const userId = requireAuthContext(req);`
);

fs.writeFileSync(path, content);
console.log('auth.ts fixed.');
