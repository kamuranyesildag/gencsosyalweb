const fs = require('fs');
let content = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');

content = content.replace(
  '    </div>\n  );\n}',
  '      <LoginBottomSheet />\n    </div>\n  );\n}'
);

fs.writeFileSync('src/layouts/AppLayout.tsx', content);
