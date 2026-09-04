const fs = require('fs');
const path = 'src/components/VerifiedBadge.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update props
content = content.replace(
  /withModal\?: boolean;\n\}/,
  'withModal?: boolean;\n  targetUser?: { username: string; isVerified: boolean };\n}'
);

// Update function signature
content = content.replace(
  /withModal = true\n\}: VerifiedBadgeProps\)/,
  'withModal = true,\n   targetUser\n}: VerifiedBadgeProps)'
);

// Update VerificationBottomSheet props
content = content.replace(
  /<VerificationBottomSheet\s*\n\s*isOpen=\{showModal\}\s*\n\s*onClose=\{\(\) => setShowModal\(false\)\}\s*\n\s*\/>/,
  '<VerificationBottomSheet \n           isOpen={showModal} \n           onClose={() => setShowModal(false)}\n           targetUser={targetUser}\n         />'
);

fs.writeFileSync(path, content);
console.log('Patched VerifiedBadge');
