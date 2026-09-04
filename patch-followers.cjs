const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const badFollower = '<div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">\n                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:text-slate-100 transition-colors truncate text-sm sm:text-base">';
const goodFollower = '<div className="flex items-center gap-1.5">\n                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:text-slate-100 transition-colors truncate text-sm sm:text-base">';

content = content.replace(badFollower, goodFollower);
content = content.replace(badFollower, goodFollower); // Replace twice if followers and following tabs have it? Wait, they share the same list renderer.

fs.writeFileSync('src/pages/Profile.tsx', content);
console.log('Fixed followers list wrapping');
