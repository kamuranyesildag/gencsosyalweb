const fs = require('fs');

let postCard = fs.readFileSync('src/components/PostCard.tsx', 'utf8');
postCard = postCard.replace('ShieldAlert,', 'Image as ImageIcon, ShieldAlert,');
fs.writeFileSync('src/components/PostCard.tsx', postCard);
