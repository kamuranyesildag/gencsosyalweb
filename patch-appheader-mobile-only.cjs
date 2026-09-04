const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/AppHeader.tsx', 'utf8');

content = content.replace(
  /\$\{isProfileActive \? "hidden" : "flex"\}/,
  '${isProfileActive ? "hidden md:flex" : "flex"}'
);

fs.writeFileSync('src/components/navigation/AppHeader.tsx', content);
console.log('Restored AppHeader to hidden md:flex');
