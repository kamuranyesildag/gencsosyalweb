const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      
      // Fix full page wrappers
      const wrapperRegex = /border-x border-slate-[12]00 dark:border-slate-800\/80 min-h-screen bg-white dark:bg-slate-950/g;
      if (content.match(wrapperRegex)) {
        content = content.replace(wrapperRegex, 'min-h-screen bg-transparent');
        modified = true;
      }
      
      const wrapperRegex2 = /border-x border-slate-[12]00 dark:border-slate-800\/80/g;
      if (content.match(wrapperRegex2)) {
        content = content.replace(wrapperRegex2, '');
        modified = true;
      }

      // Fix sticky headers
      const headerRegex = /bg-white\/95 dark:bg-slate-950\/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800\/80/g;
      if (content.match(headerRegex)) {
        content = content.replace(headerRegex, 'bg-[#f8fafc]/90 dark:bg-[#030712]/90 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'pages'));
console.log('Pages patched.');
