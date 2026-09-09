const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/MobileBottomNav.tsx', 'utf8');

content = content.replace("bottom: 'max(16px, env(safe-area-inset-bottom))',", "bottom: 'calc(16px + env(safe-area-inset-bottom))',");

fs.writeFileSync('src/components/navigation/MobileBottomNav.tsx', content);
