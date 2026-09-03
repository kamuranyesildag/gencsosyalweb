const fs = require('fs');
const path = 'src/pages/PostDetail.tsx';
let content = fs.readFileSync(path, 'utf8');

// Loading state wrapper
content = content.replace(
  /<div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200 dark:border-slate-800\/80 min-h-screen bg-white dark:bg-slate-950 p-6 space-y-4">/g,
  '<div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen bg-transparent p-6 space-y-4">'
);

// Main wrapper
content = content.replace(
  /<div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200 dark:border-slate-800\/80 min-h-screen bg-white dark:bg-slate-950 pb-20 md:pb-0">/g,
  '<div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen bg-transparent pb-20 md:pb-0">'
);

// Detail header
content = content.replace(
  /<header className="sticky top-14 md:top-\[60px\] z-30 bg-white\/95 dark:bg-slate-950\/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800\/80 p-4 flex items-center gap-4">/g,
  '<header className="sticky top-14 md:top-[60px] z-30 bg-[#f8fafc]/90 dark:bg-[#030712]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 p-4 flex items-center gap-4">'
);

// Main post content wrapper (not PostCard, the expanded post in detail)
// First let's find the expanded post wrapper
content = content.replace(
  /<div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800\/80 relative">/g,
  '<div className="p-4 sm:p-6 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-[24px] shadow-sm mb-4 mx-2 sm:mx-4 mt-4 relative">'
);

// Comment input wrapper
content = content.replace(
  /<div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800\/80 bg-white dark:bg-slate-950 relative">/g,
  '<div className="p-4 sm:p-5 mb-4 mx-2 sm:mx-4 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-[24px] shadow-sm relative">'
);

fs.writeFileSync(path, content);
console.log('PostDetail.tsx patched.');
