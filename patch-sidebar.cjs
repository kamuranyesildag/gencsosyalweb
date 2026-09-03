const fs = require('fs');
const path = 'src/components/navigation/RightSidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /bg-white dark:bg-slate-900 rounded-2xl/g,
  'bg-white dark:bg-slate-900/50 rounded-3xl'
);
content = content.replace(
  /border-slate-100 dark:border-slate-800/g,
  'border-slate-200/50 dark:border-slate-800/50'
);

fs.writeFileSync(path, content);
console.log('RightSidebar patched.');
