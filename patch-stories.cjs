const fs = require('fs');
const path = 'src/components/StoriesBar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800\/90 py-3 px-3 sm:px-4 overflow-hidden relative select-none"/g,
  'className="w-full max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] mx-2 sm:mx-4 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-[24px] shadow-sm py-4 px-3 sm:px-4 mt-4 mb-2 overflow-hidden relative select-none"'
);

fs.writeFileSync(path, content);
console.log('StoriesBar patched.');
