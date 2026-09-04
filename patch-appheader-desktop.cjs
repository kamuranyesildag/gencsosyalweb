const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/AppHeader.tsx', 'utf8');

content = content.replace(
  /\$\{isProfileActive \? "hidden md:flex" : "flex"\}/,
  '${isProfileActive ? "hidden" : "flex"}'
);

fs.writeFileSync('src/components/navigation/AppHeader.tsx', content);
console.log('Patched AppHeader for Desktop too');
