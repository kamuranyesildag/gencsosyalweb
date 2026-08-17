const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

const target = `  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { user: currentUser } = useAuthStore();`;

content = content.replace("const { user: currentUser } = useAuthStore();\n  const { user: currentUser, isAuthenticated } = useAuthStore();", "const { user: currentUser, isAuthenticated } = useAuthStore();");

content = content.replace(
  "  const { user: currentUser, isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();\n  const { user: currentUser } = useAuthStore();",
  "  const { user: currentUser, isAuthenticated } = useAuthStore();\n  const { openModal } = useAuthModalStore();"
);

// If there are still duplicates...
const regex = /const \{ user: currentUser \} = useAuthStore\(\);/g;
const matches = content.match(regex);
if (matches && matches.length > 0) {
    content = content.replace(regex, "");
}

fs.writeFileSync('src/components/PostCard.tsx', content);
