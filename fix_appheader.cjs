const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/AppHeader.tsx', 'utf8');

// Fix large text
content = content.replace('text-lg font-bold tracking-tight', 'text-base font-bold tracking-tight');

// Fix background mismatch - make it #0D121D (surface color) or #070A10 (background color)
// I'll make it solid #070A10 in dark mode to blend with background, or #0D121D to be a surface. 
// Previously it was bg-white/95 dark:bg-[#070A10]/95. 
content = content.replace('bg-white/95 dark:bg-[#070A10]/95', 'bg-white dark:bg-[#070A10]');

// Also fix button sizes if they look too big. 
// "w-10 h-10" is standard, but maybe the icon is "w-5 h-5".
fs.writeFileSync('src/components/navigation/AppHeader.tsx', content);
