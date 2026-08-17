const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(
  'const handleMessage = async () => {\n    if (!profile) return;',
  'const handleMessage = async () => {\n    if (!isAuthenticated) return openModal();\n    if (!profile) return;'
);

fs.writeFileSync('src/pages/Profile.tsx', content);
