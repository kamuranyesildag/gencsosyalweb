const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/AppHeader.tsx', 'utf8');

const isProfileLine = "const isMessagesActive = location.pathname === '/messages';";
const profileCheck = "  const isProfileActive = location.pathname.startsWith('/profile');\n";

if (!content.includes('isProfileActive')) {
  content = content.replace(isProfileLine, isProfileLine + '\n' + profileCheck);
}

content = content.replace(
  /<header className="sticky top-0 left-0 right-0 z-40 bg-white\/95 dark:bg-slate-950\/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800\/80 h-14 md:h-\[60px\] flex items-center justify-center transition-colors">/,
  '<header className={`sticky top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800/80 h-14 md:h-[60px] flex items-center justify-center transition-colors ${isProfileActive ? "hidden md:flex" : "flex"}`}>'
);

fs.writeFileSync('src/components/navigation/AppHeader.tsx', content);
console.log('Patched AppHeader');
