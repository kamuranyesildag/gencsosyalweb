const fs = require('fs');
const path = 'src/components/VerificationBottomSheet.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /return \(\n\s*\{typeof document !== "undefined" && createPortal\(/,
  'return typeof document !== "undefined" ? createPortal('
);

content = content.replace(
  /<\/AnimatePresence>,\n\s*document\.body\n\s*\);\n\s*\}/,
  '</AnimatePresence>,\n    document.body\n  ) : null;\n}'
);

fs.writeFileSync(path, content);
