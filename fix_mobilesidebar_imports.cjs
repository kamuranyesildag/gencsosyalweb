const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/MobileSidebar.tsx', 'utf8');

content = content.replace(/import { Mail, Bell,/g, 'import {');
content = content.replace(/import {  Home,/g, 'import { Mail, Bell, Home,');

fs.writeFileSync('src/components/navigation/MobileSidebar.tsx', content);
