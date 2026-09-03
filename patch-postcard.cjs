const fs = require('fs');

const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /"group flex flex-col sm:flex-row gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800\/80 bg-white dark:bg-slate-950 hover:bg-slate-50\/50 dark:hover:bg-slate-900\/40 cursor-pointer transition-colors duration-150"/g,
  '"group flex flex-col sm:flex-row gap-3 p-4 sm:p-5 mb-3 mx-2 sm:mx-4 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-2xl sm:rounded-[24px] shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-300"'
);

// Update Like/Comment buttons to be more "soft" (pill shape, subtle background)
content = content.replace(
  /className="flex items-center gap-1\.5 px-1 py-1 text-slate-500/g,
  'className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
);

// Share and View buttons
content = content.replace(
  /className="flex items-center gap-1\.5 px-1 py-1 ml-auto text-slate-500/g,
  'className="flex items-center gap-1.5 px-3 py-1.5 ml-auto rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
);

content = content.replace(
  /className="flex items-center gap-1\.5 px-1 py-1 hover:text-indigo-500 text-slate-500/g,
  'className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500 text-slate-500'
);

fs.writeFileSync(path, content);
console.log('PostCard.tsx patched.');
