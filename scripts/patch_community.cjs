const fs = require('fs');
let content = fs.readFileSync('src/pages/CommunityDetail.tsx', 'utf8');

if (!content.includes('useAuthModalStore')) {
  content = content.replace(
    'import { useAuthStore } from "../context/useAuth";',
    'import { useAuthStore } from "../context/useAuth";\nimport { useAuthModalStore } from "../context/useAuthModal";'
  );
  
  content = content.replace(
    'const { user } = useAuthStore();',
    'const { user, isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();'
  );
  
  content = content.replace(
    'const handleJoin = async () => {',
    'const handleJoin = async () => {\n    if (!isAuthenticated) return openModal();'
  );
}

fs.writeFileSync('src/pages/CommunityDetail.tsx', content);
