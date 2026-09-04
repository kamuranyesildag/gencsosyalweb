const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// 1. Profile Header
content = content.replace(
  /<header className="sticky top-0 md:top-\[60px\] z-20 bg-white dark:bg-slate-950\/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800\/90 px-4 py-2.5 flex items-center justify-between">/,
  '<header className="sticky top-0 md:top-[60px] z-20 bg-white/95 dark:bg-[#030712]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/90 h-[56px] md:h-[60px] px-4 flex items-center justify-between transition-colors">'
);

// 2. Profile Tabs
content = content.replace(
  /<div\s*className="sticky top-\[108px\] z-10 bg-white dark:bg-slate-950\/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-2"\s*role="tablist"\s*aria-label="Profil Sekmeleri"\s*>/,
  '<div\n        className="sticky top-[56px] md:top-[120px] z-10 bg-white/95 dark:bg-[#030712]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-2 sm:px-4 transition-colors"\n        role="tablist"\n        aria-label="Profil Sekmeleri"\n      >'
);

// 3. Tab active indicator color
content = content.replace(
  /className="absolute bottom-0 inset-x-4 h-0\.5 bg-slate-900 rounded-full"/g,
  'className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[3px] bg-indigo-600 dark:bg-indigo-500 rounded-t-full"'
);

// 4. Tab text active colors
content = content.replace(
  /text-slate-900 dark:text-slate-100"/g,
  'text-indigo-600 dark:text-indigo-400"'
);

fs.writeFileSync('src/pages/Profile.tsx', content);
console.log('Patched sticky and tabs');
