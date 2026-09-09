const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('Image as ImageIcon')) {
  code = code.replace(
    'import {',
    'import { Image as ImageIcon,'
  );
  fs.writeFileSync(path, code);
}
