const fs = require('fs');
const path = 'src/components/CreatePost.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure CreatePost has mx-2 sm:mx-4
content = content.replace(
  /<div className="bg-white dark:bg-slate-950 rounded-\[24px\] shadow-sm border border-slate-200 dark:border-slate-800\/60 overflow-hidden mb-6 transition-all duration-300 hover:shadow-md hover:border-slate-300\/60">/g,
  '<div className="bg-white dark:bg-[#111827] rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden mb-4 mx-2 sm:mx-4 transition-all duration-300 hover:shadow-md hover:border-slate-300/60">'
);

fs.writeFileSync(path, content);
console.log('CreatePost patched.');
