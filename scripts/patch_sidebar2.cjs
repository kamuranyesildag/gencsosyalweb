const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/DesktopSidebar.tsx', 'utf8');

content = content.replace(
  'const { user, logout, isAuthenticated } = useAuthStore();',
  'const { user, isAuthenticated } = useAuthStore();'
);
content = content.replace(
  'import { Home, Search, Bell, Mail, Bookmark, Users, Settings, LogOut, Hexagon, ShieldAlert, Rocket } from "lucide-react";',
  'import { Home, Search, Bell, Mail, Bookmark, Users, Settings, Hexagon, ShieldAlert, Rocket } from "lucide-react";'
);

fs.writeFileSync('src/components/navigation/DesktopSidebar.tsx', content);
