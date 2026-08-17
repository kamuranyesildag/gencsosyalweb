const fs = require('fs');
let content = fs.readFileSync('src/pages/PostDetail.tsx', 'utf8');

content = content.replace(
  'import { useAuthStore } from "../context/useAuth";',
  'import { useAuthStore } from "../context/useAuth";\nimport { useAuthModalStore } from "../context/useAuthModal";'
);

content = content.replace(
  'const { user } = useAuthStore();',
  'const { user, isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();'
);

content = content.replace(
  'const handleComment = async () => {\n    if (!commentText.trim() || isSubmitting) return;',
  'const handleComment = async () => {\n    if (!isAuthenticated) return openModal();\n    if (!commentText.trim() || isSubmitting) return;'
);

content = content.replace(
  'onChange={(e) => setCommentText(e.target.value)}',
  'onClick={() => { if (!isAuthenticated) openModal(); }}\n                onChange={(e) => setCommentText(e.target.value)}'
);

fs.writeFileSync('src/pages/PostDetail.tsx', content);
