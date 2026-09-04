const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<VerifiedBadge iconClassName="w-4 h-4" \/>/g,
  '<VerifiedBadge iconClassName="w-4 h-4" targetUser={{ username: post.user.username, isVerified: !!post.user.isVerified }} />'
);

content = content.replace(
  /<VerifiedBadge size="sm" \/>/g,
  '<VerifiedBadge iconClassName="w-4 h-4" targetUser={{ username: post.user.username, isVerified: !!post.user.isVerified }} />'
);

fs.writeFileSync(path, content);
console.log("Patched PostCard");
