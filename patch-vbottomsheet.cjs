const fs = require('fs');
const path = 'src/components/VerificationBottomSheet.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add createPortal to imports
if (!content.includes('createPortal')) {
  content = content.replace(
    /import React, \{ useState, useEffect \} from "react";/,
    'import React, { useState, useEffect } from "react";\nimport { createPortal } from "react-dom";'
  );
}

// 2. Add targetUser prop
content = content.replace(
  /interface VerificationBottomSheetProps \{/,
  'interface VerificationBottomSheetProps {\n  targetUser?: { username: string; isVerified: boolean };'
);

content = content.replace(
  /export function VerificationBottomSheet\(\{ isOpen, onClose \}: VerificationBottomSheetProps\) \{/,
  'export function VerificationBottomSheet({ isOpen, onClose, targetUser }: VerificationBottomSheetProps) {'
);

// 3. Fix the render logic to account for targetUser
const renderLogic = `
  useEffect(() => {
    if (isOpen) {
      if (targetUser && targetUser.username !== user?.username) {
        // If we are looking at someone else's badge, don't fetch OUR status
        setStatus(targetUser.isVerified ? "approved" : "none");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      fetchApi("/verification/me")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data && json.data.length > 0) {
            setStatus(json.data[0].status);
          } else {
            setStatus(user?.isVerified ? "approved" : "none");
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, targetUser, user]);
`;

content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(isOpen\) \{\n[\s\S]*?\}\n\s*\}, \[isOpen\]\);/,
  renderLogic
);

// Fix the text wrap issue in the approved state
content = content.replace(
  /<p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-\[280px\]">\n\s*Bu hesap Genç Sosyal tarafından onaylanmıştır. Tanınmış bir kişi veya markayı temsil eder.\n\s*<\/p>/g,
  '<p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-[280px] text-center whitespace-normal">\n            Bu hesap Genç Sosyal tarafından onaylanmıştır. Tanınmış bir kişi veya markayı temsil eder.\n          </p>'
);

// 4. Wrap with createPortal and fix z-index issues
content = content.replace(
  /<AnimatePresence>\n\s*\{isOpen && \(/,
  '{typeof document !== "undefined" && createPortal(\n    <AnimatePresence>\n      {isOpen && ('
);

content = content.replace(
  /<\/AnimatePresence>\n\s*\);/,
  '</AnimatePresence>,\n    document.body\n  );\n'
);

fs.writeFileSync(path, content);
console.log('Patched VerificationBottomSheet');
