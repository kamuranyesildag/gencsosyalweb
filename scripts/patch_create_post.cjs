const fs = require('fs');
let content = fs.readFileSync('src/components/CreatePost.tsx', 'utf8');

content = content.replace(
  'onChange={(e) => setContent(e.target.value)}',
  'onClick={() => { if (!isAuthenticated) openModal(); }}\n            onChange={(e) => setContent(e.target.value)}'
);

fs.writeFileSync('src/components/CreatePost.tsx', content);
