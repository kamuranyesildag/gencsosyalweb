const fs = require('fs');
let content = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');

// remove navigate
content = content.replace(
  'if (!isAuthenticated) return <Navigate to="/login" />;',
  ''
);

// add LoginBottomSheet
content = content.replace(
  'import { MobileBottomNav } from "../components/navigation/MobileBottomNav";',
  'import { MobileBottomNav } from "../components/navigation/MobileBottomNav";\nimport { LoginBottomSheet } from "../components/auth/LoginBottomSheet";'
);

content = content.replace(
  '</div>\n    </div>\n  );\n}',
  '</div>\n      <LoginBottomSheet />\n    </div>\n  );\n}'
);

fs.writeFileSync('src/layouts/AppLayout.tsx', content);
