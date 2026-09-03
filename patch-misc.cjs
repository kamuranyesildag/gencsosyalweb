const fs = require('fs');

const updateFile = (path, oldRegex, newStr, imports) => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    if (!content.includes('import { VerifiedBadge }')) {
      content = imports + content;
    }
    content = content.replace(oldRegex, newStr);
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
  }
}

// UserMenu.tsx
updateFile(
  'src/components/navigation/UserMenu.tsx',
  /\{user\.isVerified && \(\s*<CheckCircle2[^>]+>\s*\)\}/g,
  '{user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} />}',
  'import { VerifiedBadge } from "../VerifiedBadge";\n'
);

// MoreMenu.tsx
updateFile(
  'src/components/navigation/MoreMenu.tsx',
  /\{user\?\.isVerified && \(\s*<CheckCircle2[^>]+>\s*\)\}/g,
  '{user?.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} />}',
  'import { VerifiedBadge } from "../VerifiedBadge";\n'
);

// NewMessageDialog.tsx
updateFile(
  'src/components/NewMessageDialog.tsx',
  /\{user\.isVerified && \(\s*<CheckCircle2[^>]+>\s*\)\}/g,
  '{user.isVerified && <VerifiedBadge iconClassName="w-3.5 h-3.5" withModal={false} />}',
  'import { VerifiedBadge } from "./VerifiedBadge";\n'
);

// SettingsVerification.tsx
// Let's replace the one in the 1. Verified State:
updateFile(
  'src/components/SettingsVerification.tsx',
  /<CheckCircle2 className="w-8 h-8 fill-slate-600\/10" \/>/,
  '<VerifiedBadge iconClassName="w-8 h-8" withModal={false} />',
  'import { VerifiedBadge } from "./VerifiedBadge";\n'
);

// CreatePost.tsx
updateFile(
  'src/components/CreatePost.tsx',
  /\{user\.isVerified && <BadgeCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" \/>\}/g,
  '{user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} />}',
  'import { VerifiedBadge } from "./VerifiedBadge";\n'
);

