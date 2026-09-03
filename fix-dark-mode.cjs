const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const stringLiteralRegex = /(['"`])(.*?)\1/gs;
      
      let modified = false;
      const newContent = content.replace(stringLiteralRegex, (match, quote, innerString) => {
        // Exclude import paths and other non-tailwind strings
        if (!innerString.includes('/') && innerString.length > 2 && innerString.match(/\b(bg|text|border|flex|grid|p-[0-9]|w-|h-|absolute|relative)\b/)) {
          let newStr = innerString;
          
          if (newStr.match(/\bbg-white\b/) && !newStr.match(/\bdark:bg-/)) {
            newStr = newStr.replace(/\bbg-white\b/g, 'bg-white dark:bg-slate-950');
          }
          if (newStr.match(/\btext-slate-[89]00\b/) && !newStr.match(/\bdark:text-/)) {
            newStr = newStr.replace(/\btext-slate-[89]00\b/g, '$& dark:text-slate-100');
          }
          if (newStr.match(/\btext-slate-[56]00\b/) && !newStr.match(/\bdark:text-/)) {
            newStr = newStr.replace(/\btext-slate-[56]00\b/g, '$& dark:text-slate-400');
          }
          if (newStr.match(/\bborder-slate-[12]00\b/) && !newStr.match(/\bdark:border-/)) {
            newStr = newStr.replace(/\bborder-slate-[12]00\b/g, '$& dark:border-slate-800');
          }
          if (newStr.match(/\bbg-slate-(50|100)\b/) && !newStr.match(/\bdark:bg-/)) {
            newStr = newStr.replace(/\bbg-slate-(50|100)\b/g, '$& dark:bg-slate-900');
          }
          
          if (newStr !== innerString) {
            modified = true;
            return quote + newStr + quote;
          }
        }
        return match;
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done replacing!');
