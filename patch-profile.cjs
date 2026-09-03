const fs = require('fs');
const path = 'src/pages/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace verification bottom sheet import with verified badge
content = content.replace(
  /import \{ VerificationBottomSheet \} from "\.\.\/components\/VerificationBottomSheet";/,
  'import { VerifiedBadge } from "../components/VerifiedBadge";'
);

// We have two places in Profile.tsx
// 1:
// {profile.isVerified && (
//   <button
//     type="button"
//     onClick={() => setShowVerification(true)}
//     aria-label="Doğrulanmış Rozet"
//     className="shrink-0 inline-flex items-center"
//   >
//     <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-slate-100 fill-slate-100 shrink-0" />
//   </button>
// )}

content = content.replace(
  /\{profile\.isVerified && \(\s*<button[^>]*>\s*<CheckCircle2[^>]*>\s*<\/button>\s*\)\}/g,
  '{profile.isVerified && <VerifiedBadge iconClassName="w-5 h-5" />}'
);

// 2:
// {profile.isVerified && (
//   <button
//     type="button"
//     onClick={() => setShowVerification(true)}
//     aria-label="Doğrulanmış Hesap"
//     className="inline-flex items-center focus:outline-none"
//   >
//     <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-slate-100 fill-slate-100 shrink-0" />
//   </button>
// )}
content = content.replace(
  /\{profile\.isVerified && \(\s*<button[^>]*>\s*<CheckCircle2[^>]*>\s*<\/button>\s*\)\}/g,
  '{profile.isVerified && <VerifiedBadge iconClassName="w-5 h-5" />}'
);

// Remove the old VerificationBottomSheet rendering
content = content.replace(
  /\s*<VerificationBottomSheet\s+isOpen=\{showVerification\}\s+onClose=\{.*?\}\s+\/>/g,
  ''
);

fs.writeFileSync(path, content);
