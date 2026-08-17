const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(
  'const { user: currentUser } = useAuthStore();',
  'const { user: currentUser, isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();'
);

fs.writeFileSync('src/pages/Profile.tsx', content);
