const fs = require('fs');
const path = 'src/components/FeedSuggestedUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="w-full bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800\/80 py-6 my-2 relative overflow-hidden">/g,
  '<div className="w-full bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-3xl shadow-sm py-6 my-4 mx-2 sm:mx-4 relative overflow-hidden max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)]">'
);

fs.writeFileSync(path, content);
console.log('FeedSuggestedUsers patched.');
