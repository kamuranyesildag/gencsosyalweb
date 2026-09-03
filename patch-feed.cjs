const fs = require('fs');
const path = 'src/pages/Feed.tsx';
let content = fs.readFileSync(path, 'utf8');

// Change Feed container to remove border-x and add soft UI spacing
content = content.replace(
  /<div className="w-full md:max-w-\[600px\] lg:max-w-\[640px\] border-x border-slate-100 dark:border-slate-800\/80 min-h-screen">/g,
  '<div className="w-full md:max-w-[600px] lg:max-w-[640px] min-h-screen pt-2 sm:pt-4">'
);

// Update Feed layout for CreatePost wrapper to have mx-2 or mx-4
content = content.replace(
  /<div className="border-b border-slate-100 dark:border-slate-800\/80 bg-white dark:bg-slate-950 transition-colors">/g,
  '<div className="mx-2 sm:mx-4 mb-4 transition-colors">'
);

// We need to check if there are other border-b things
// Replace <div className="md:hidden px-4 py-4"> to match the background of the create post placeholder
content = content.replace(
  /<div className="md:hidden px-4 py-4">/g,
  '<div className="md:hidden py-4">'
);

// Replace the feed bg
content = content.replace(
  /<div className="flex flex-col h-full w-full min-h-screen bg-white dark:bg-slate-950 transition-colors">/g,
  '<div className="flex flex-col h-full w-full min-h-screen bg-[#f8fafc] dark:bg-[#030712] transition-colors">'
);
content = content.replace(
  /<header className="sticky top-14 md:top-\[60px\] z-30 bg-white\/95 dark:bg-slate-950\/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800\/80 flex items-center justify-between px-2 sm:px-4 transition-colors">/g,
  '<header className="sticky top-14 md:top-[60px] z-30 bg-[#f8fafc]/90 dark:bg-[#030712]/90 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-2 sm:px-4 transition-colors">'
);

fs.writeFileSync(path, content);
console.log('Feed.tsx patched.');
