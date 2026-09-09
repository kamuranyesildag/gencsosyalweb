const fs = require('fs');
let content = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');

// Update pb-[calc(68px+var(--sab,0px))] md:pb-10 
// to pb-[calc(90px+env(safe-area-inset-bottom,0px))] md:pb-10
content = content.replace(/pb-\[calc\(68px\+var\(--sab,0px\)\)\]/g, 'pb-[calc(90px+env(safe-area-inset-bottom,0px))]');
fs.writeFileSync('src/layouts/AppLayout.tsx', content);
