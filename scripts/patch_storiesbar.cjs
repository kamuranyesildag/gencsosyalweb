const fs = require('fs');
let content = fs.readFileSync('src/components/StoriesBar.tsx', 'utf8');

if (!content.includes('useAuthModalStore')) {
  content = content.replace(
    "import { useAuthStore } from '../context/useAuth';",
    "import { useAuthStore } from '../context/useAuth';\nimport { useAuthModalStore } from '../context/useAuthModal';"
  );
  
  content = content.replace(
    "const { user: currentUser } = useAuthStore();",
    "const { user: currentUser, isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();"
  );
  
  content = content.replace(
    "onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}",
    "onClick={(e) => { e.stopPropagation(); if (!isAuthenticated) return openModal(); fileInputRef.current?.click(); }}"
  );

  content = content.replace(
    `            onClick={() => {
              if (currentUserHasStory) {
                const idx = usersWithStories.findIndex(u => u.userId === currentUser?.id);
                setViewerIndex(idx);
              } else {
                fileInputRef.current?.click();
              }
            }}`,
    `            onClick={() => {
              if (currentUserHasStory) {
                const idx = usersWithStories.findIndex(u => u.userId === currentUser?.id);
                setViewerIndex(idx);
              } else {
                if (!isAuthenticated) return openModal();
                fileInputRef.current?.click();
              }
            }}`
  );
}

fs.writeFileSync('src/components/StoriesBar.tsx', content);
