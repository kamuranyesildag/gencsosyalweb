const fs = require('fs');
let content = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');

// Remove LoginBottomSheet from RightSidebar
content = content.replace(
  '      <LoginBottomSheet />\n    </div>\n  );\n}',
  '    </div>\n  );\n}'
);

// Add LoginBottomSheet to AppLayout just before the closing tag of the main container
content = content.replace(
  '    </div>\n  );\n}',
  '      <LoginBottomSheet />\n    </div>\n  );\n}'
);

fs.writeFileSync('src/layouts/AppLayout.tsx', content);
