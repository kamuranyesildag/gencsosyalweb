const fs = require('fs');
const path = 'src/pages/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{user\.isVerified && \(\s*<CheckCircle2[^>]+>\s*\)\}/g,
  '{user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} />}'
);

fs.writeFileSync(path, content);
