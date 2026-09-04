const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// Replace flex-wrap with min-w-0 on the header
content = content.replace(
  /<div className="flex items-center gap-2 overflow-hidden flex-wrap sm:flex-nowrap">/,
  '<div className="flex items-center gap-2 min-w-0 sm:flex-nowrap">'
);

// Add min-w-0 to the author block
content = content.replace(
  /className="flex items-center gap-1\.5 truncate group\/author"/,
  'className="flex items-center gap-1.5 min-w-0 truncate group/author"'
);

fs.writeFileSync('src/components/PostCard.tsx', content);
console.log('Patched PostCard Layout');
