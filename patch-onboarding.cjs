const fs = require('fs');
let content = fs.readFileSync('src/components/OnboardingModal.tsx', 'utf8');

if (!content.includes('createPortal')) {
  content = content.replace(
    /import React, \{ useState, useEffect \} from "react";/,
    'import React, { useState, useEffect } from "react";\nimport { createPortal } from "react-dom";'
  );

  content = content.replace(
    /return \(\n\s*<div className="fixed inset-0 z-50/,
    'return typeof document !== "undefined" ? createPortal(\n    <div className="fixed inset-0 z-[10000]'
  );

  content = content.replace(
    /<\/div>\n\s*\);\n\}/,
    '</div>,\n    document.body\n  ) : null;\n}'
  );

  fs.writeFileSync('src/components/OnboardingModal.tsx', content);
  console.log('Patched OnboardingModal');
}
