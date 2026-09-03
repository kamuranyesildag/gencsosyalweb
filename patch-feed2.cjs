const fs = require('fs');
const path = 'src/pages/Feed.tsx';
let content = fs.readFileSync(path, 'utf8');

// Change the wrapper of CreatePost to not have extra margin on desktop
content = content.replace(
  /<div className="mx-2 sm:mx-4 mb-4 transition-colors">/g,
  '<div className="mb-2 sm:mb-4 transition-colors">'
);

fs.writeFileSync(path, content);
console.log('Feed.tsx patched.');
