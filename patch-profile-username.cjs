const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const badPill = '<div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">\n            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">';
const goodTitle = '<div className="flex items-center gap-1.5">\n            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">';

content = content.replace(badPill, goodTitle);

fs.writeFileSync('src/pages/Profile.tsx', content);
console.log('Fixed username wrapping');
