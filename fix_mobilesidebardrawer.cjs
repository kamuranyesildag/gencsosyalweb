const fs = require('fs');

let content = fs.readFileSync('src/components/navigation/MobileSidebarDrawer.tsx', 'utf8');

// The backdrop is fine with opacity: 0 -> 1 -> 0
// But the drawer content needs an update to its transition
content = content.replace(/transition={{ type: 'spring', damping: 28, stiffness: 240 }}/g, "transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}");

fs.writeFileSync('src/components/navigation/MobileSidebarDrawer.tsx', content);
