const fs = require('fs');
const path = 'server.ts';
let content = fs.readFileSync(path, 'utf-8');

// Remove setupMode initialization block
const startStr = 'const isProd = process.env.NODE_ENV === "production";';
const endStr = 'const app = express();';
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + startStr + '\n  const app = express();' + content.slice(endIndex + endStr.length);
}

// Replace CORS block
content = content.replace(/let corsOrigin = process\.env\.CORS_ORIGIN \|\| process\.env\.FRONTEND_URL;\s*if \(isProd && !corsOrigin && !setupMode\) {\s*throw new Error\("FATAL: CORS_ORIGIN or FRONTEND_URL must be defined in production\."\);\s*}/g, 'let corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;');

// Replace API routing block
const apiStart = '  if (setupMode) {';
const apiEnd = '// --- API Routes End ---';
const apiStartIndex = content.indexOf(apiStart);
const apiEndIndex = content.indexOf(apiEnd);

if (apiStartIndex !== -1 && apiEndIndex !== -1) {
  let block = content.slice(apiStartIndex, apiEndIndex);
  block = block.replace(/if \(setupMode\) {[^}]*} else {/g, '');
  // remove the last closing brace
  const lastBrace = block.lastIndexOf('}');
  block = block.slice(0, lastBrace) + block.slice(lastBrace + 1);
  content = content.slice(0, apiStartIndex) + block + content.slice(apiEndIndex);
}

fs.writeFileSync(path, content);
