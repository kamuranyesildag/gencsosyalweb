const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// 1. Cover Image
const oldCover = `<div className="relative h-28 sm:h-40 md:h-48 bg-gradient-to-tr from-slate-500 via-slate-600 to-violet-700 w-full overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>`;
const newCover = `{/* COVER IMAGE */}
      <div className="relative h-32 sm:h-44 md:h-52 bg-slate-200 dark:bg-slate-800 w-full overflow-hidden shrink-0 group">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Kapak" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-500 via-slate-600 to-violet-700">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
      </div>`;
content = content.replace(oldCover, newCover);

// 2. Avatar
content = content.replace(
  /ring-2 ring-slate-100/g,
  'ring-4 ring-white dark:ring-[#030712] bg-white dark:bg-[#030712]'
);

// 3. Edit Profile button
content = content.replace(
  /className="rounded-full px-5 font-bold border-slate-200 dark:border-slate-800\/90 hover:bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"/,
  'className="rounded-full px-5 font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm transition-all"'
);

// 4. Meta Info Tags
const oldMeta = `<div className="flex flex-wrap gap-x-4 gap-y-2 mt-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">`;
const newMeta = `<div className="flex flex-wrap gap-2.5 mt-4 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium">`;
content = content.replace(oldMeta, newMeta);

// Change the items inside meta to pills
content = content.replace(
  /<div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">/g,
  '<div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">'
);
content = content.replace(
  /<div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">/g,
  '<div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">'
);
content = content.replace(
  /<div className="flex items-center gap-1.5">/g, // for website
  '<div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">'
);

// 5. Follower Stats spacing
content = content.replace(
  /<div className="flex items-center gap-5 mt-4 text-sm select-none">/g,
  '<div className="flex items-center gap-6 mt-5 text-sm select-none">'
);

fs.writeFileSync('src/pages/Profile.tsx', content);
console.log('Patched Profile UI');
