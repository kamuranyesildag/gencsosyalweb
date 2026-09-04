const fs = require('fs');
const path = 'src/pages/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<VerifiedBadge iconClassName="w-5 h-5" \/>/g,
  '<VerifiedBadge iconClassName="w-5 h-5" targetUser={{ username: profile.username, isVerified: !!profile.isVerified }} />'
);

content = content.replace(
  /<VerifiedBadge iconClassName="w-4 h-4" withModal=\{false\} \/>/g,
  '<VerifiedBadge iconClassName="w-4 h-4" withModal={false} targetUser={{ username: user.username, isVerified: !!user.isVerified }} />'
);

fs.writeFileSync(path, content);
console.log("Patched Profile");
