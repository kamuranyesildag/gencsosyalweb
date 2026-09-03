const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /if \(user\.role !== 'admin' && user\.role !== 'superadmin'\)/,
  'if (user.role !== "admin" && user.role !== "superadmin" && user.role !== "ADMIN" && user.role !== "SUPERADMIN")'
);

fs.writeFileSync(path, content);
console.log('App.tsx patched.');
