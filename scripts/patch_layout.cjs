const fs = require('fs');
let content = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');

if (!content.includes('AppHeader')) {
  content = content.replace(
    'import { DesktopSidebar } from "../components/navigation/DesktopSidebar";',
    'import { AppHeader } from "../components/navigation/AppHeader";\nimport { DesktopSidebar } from "../components/navigation/DesktopSidebar";'
  );

  content = content.replace(
    '<div className="min-h-screen bg-white md:bg-gray-50 flex justify-center text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">',
    '<div className="min-h-screen bg-white md:bg-gray-50 flex justify-center text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pt-16">\n      <AppHeader />'
  );
  
  content = content.replace(
    'sticky top-0 h-screen border-r border-gray-100 bg-white',
    'sticky top-16 h-[calc(100vh-4rem)] border-r border-gray-100 bg-white'
  );
  
  content = content.replace(
    'min-h-screen shadow-sm',
    'min-h-[calc(100vh-4rem)] shadow-sm'
  );
  
  content = content.replace(
    'sticky top-0 h-screen p-6 shrink-0 bg-white',
    'sticky top-16 h-[calc(100vh-4rem)] p-6 shrink-0 bg-white overflow-y-auto'
  );
}

fs.writeFileSync('src/layouts/AppLayout.tsx', content);
