const fs = require('fs');
const path = 'src/pages/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

// The HTML was slightly different or had multi-lines that my previous regex didn't catch properly because of `[^>]*` not matching across lines without `[\s\S]*`.
content = content.replace(
  /\{profile\.isVerified && \([\s\S]*?<CheckCircle2[\s\S]*?<\/button>\s*\)\}/g,
  '{profile.isVerified && <VerifiedBadge iconClassName="w-5 h-5" />}'
);

content = content.replace(
  /\{user\.isVerified && \([\s\S]*?<CheckCircle2[\s\S]*?<\/button>\s*\)\}/g,
  '{user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" />}'
);

fs.writeFileSync(path, content);
