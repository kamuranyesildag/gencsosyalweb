const fs = require('fs');
const path = 'src/pages/Feed.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="md:hidden py-4">/g,
  '<div className="md:hidden py-4 mx-2">'
);

fs.writeFileSync(path, content);
console.log('Feed.tsx patched 3.');
