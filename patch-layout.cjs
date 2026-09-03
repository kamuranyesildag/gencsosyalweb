const fs = require('fs');
const path = 'src/layouts/AppLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// The main layout background wrapper
content = content.replace(
  /<div className="min-h-screen bg-white dark:bg-slate-950/g,
  '<div className="min-h-screen bg-[#f8fafc] dark:bg-[#030712]'
);

// Left Sidebar
content = content.replace(
  /border-r border-slate-100 dark:border-slate-800\/80 bg-white dark:bg-slate-950/g,
  'border-r border-slate-200/50 dark:border-slate-800/50 bg-[#f8fafc] dark:bg-[#030712]'
);

// Main Content Area
content = content.replace(
  /main className="flex-1 min-w-0 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800\/80/g,
  'main className="flex-1 min-w-0 bg-[#f8fafc] dark:bg-[#030712] border-r border-slate-200/50 dark:border-slate-800/50'
);

// Right Sidebar
content = content.replace(
  /aside className="hidden lg:block w-80 sticky top-14 md:top-16 h-\[calc\(100vh-3\.5rem\)\] md:h-\[calc\(100vh-4rem\)\] p-5 shrink-0 bg-white dark:bg-slate-950/g,
  'aside className="hidden lg:block w-80 sticky top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] p-5 shrink-0 bg-[#f8fafc] dark:bg-[#030712]'
);

fs.writeFileSync(path, content);
console.log('AppLayout.tsx patched.');
