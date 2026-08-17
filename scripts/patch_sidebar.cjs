const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/DesktopSidebar.tsx', 'utf8');

// Remove the top Logo block
content = content.replace(
  /<NavLink to="\/home" className="flex items-center gap-3 px-4 py-3 mb-6 transition-transform hover:scale-105 origin-left">[\s\S]*?<\/NavLink>/,
  ''
);

// Remove the bottom user info block
content = content.replace(
  /{isAuthenticated && <div className="mt-auto hidden xl:flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">[\s\S]*?<\/button>\n      <\/div>}/,
  ''
);

// Remove the bottom logout mobile button
content = content.replace(
  /{isAuthenticated && <button[\s\S]*?className="xl:hidden flex items-center justify-center gap-4 px-4 py-4 rounded-2xl transition-colors text-lg text-gray-400 hover:bg-red-50 hover:text-red-600 mt-auto group"[\s\S]*?<\/button>}/,
  ''
);

fs.writeFileSync('src/components/navigation/DesktopSidebar.tsx', content);
