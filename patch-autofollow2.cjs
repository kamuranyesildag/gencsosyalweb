const fs = require('fs');
const path = 'server/routes/admin.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const \{ systemSettings \} = await import\("\.\.\/\.\.\/src\/db\/schema\.js"\);\n/g,
  ''
);

fs.writeFileSync(path, content);
