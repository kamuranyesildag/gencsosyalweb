const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/MobileBottomNav.tsx', 'utf8');

content = content.replace(
  'onClick={() => setShowCreate(true)}',
  'onClick={() => { if (!isAuthenticated) openModal(); else setShowCreate(true); }}'
);

content = content.replace(
  'to="/notifications"',
  'to="/notifications"\n           onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); openModal(); } }}'
);

content = content.replace(
  'onClick={() => setShowMore(true)}',
  'onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); openModal(); } else setShowMore(true); }}'
);

fs.writeFileSync('src/components/navigation/MobileBottomNav.tsx', content);
