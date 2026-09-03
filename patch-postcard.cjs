const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const isVideo = mediaUrl\.match\(.*?\);\n/g,
  ''
);

fs.writeFileSync(path, content);
