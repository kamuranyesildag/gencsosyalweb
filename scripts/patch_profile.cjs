const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(
  'import { useAuthStore } from "../context/useAuth";',
  'import { useAuthStore } from "../context/useAuth";\nimport { useAuthModalStore } from "../context/useAuthModal";'
);

content = content.replace(
  'const { user } = useAuthStore();',
  'const { user, isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();'
);

content = content.replace(
  'const handleFollow = async () => {\n    if (!profile) return;',
  'const handleFollow = async () => {\n    if (!isAuthenticated) return openModal();\n    if (!profile) return;'
);

// handleMessage might be an onClick directly
content = content.replace(
  '<button className="p-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors">',
  '<button onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); openModal(); } }} className="p-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors">'
);

fs.writeFileSync('src/pages/Profile.tsx', content);
