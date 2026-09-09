const fs = require('fs');
const path = 'src/pages/CreatePostPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '<CreatePost',
  '<CreatePost\n            quoteId={quoteId ? parseInt(quoteId) : undefined}'
);

fs.writeFileSync(path, code);
