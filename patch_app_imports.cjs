const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importStr = `import { Settings } from "./pages/Settings";`;
content = content.replace(importStr, importStr + `\nimport NotFound from "./pages/NotFound";`);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx imports');
