const fs = require('fs');

let content = fs.readFileSync('src/components/navigation/MobileSidebar.tsx', 'utf8');

const newNavItems = `  const navItems = [
    { name: 'Ana Sayfa', path: '/home', icon: Home, protected: false },
    { name: 'Keşfet', path: '/explore', icon: Compass, protected: false },
    { name: 'Mesajlar', path: '/messages', icon: Mail, protected: true },
    { name: 'Bildirimler', path: '/notifications', icon: Bell, protected: true },
    { name: 'Projeler', path: '/projects', icon: Rocket, protected: false },
    { name: 'Topluluklar', path: '/communities', icon: Users, protected: false },
    { name: 'Yer İşaretleri', path: '/bookmarks', icon: Bookmark, protected: true },
  ];`;

content = content.replace(/const navItems = \[[\s\S]*?\];/, newNavItems);

// Add missing imports
if (!content.includes('Mail,')) {
    content = content.replace('Home,', 'Home,\n  Mail,\n  Bell,');
}

fs.writeFileSync('src/components/navigation/MobileSidebar.tsx', content);
