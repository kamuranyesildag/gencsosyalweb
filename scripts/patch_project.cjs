const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

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
    'const handleToggleLike = async () => {',
    'const handleToggleLike = async () => {\n    if (!isAuthenticated) return openModal();'
  );
  
  content = content.replace(
    'const handleAddComment = async (e: React.FormEvent) => {',
    'const handleAddComment = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!isAuthenticated) return openModal();'
  );
}

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);
