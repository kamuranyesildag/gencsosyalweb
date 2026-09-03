const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /import \{ VerificationBottomSheet \} from "\.\/VerificationBottomSheet";\n/,
  ''
);

if (!content.includes('import { VerifiedBadge }')) {
  content = content.replace(
    /import \{ Link, useNavigate \} from "react-router";\n/,
    'import { Link, useNavigate } from "react-router";\nimport { VerifiedBadge } from "./VerifiedBadge";\n'
  );
}

// In PostCard, it's used as:
// {post.user?.isVerified && (
//   <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-indigo-400 fill-slate-500/10 shrink-0" />
// )}

content = content.replace(
  /\{post\.user\?\.isVerified && \(\s*<CheckCircle2[^>]+>\s*\)\}/g,
  '{post.user?.isVerified && <VerifiedBadge iconClassName="w-4 h-4" />}'
);

// Remove the old VerificationBottomSheet rendering from PostCard since VerifiedBadge handles it
content = content.replace(
  /\s*<VerificationBottomSheet isOpen=\{showVerification\} onClose=\{.*?\} \/>/g,
  ''
);

fs.writeFileSync(path, content);
