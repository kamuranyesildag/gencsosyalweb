const fs = require('fs');

function addPortal(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('createPortal')) {
    console.log(filePath + ' already has portal');
    return;
  }
  
  // Add import
  if (content.includes('react-dom')) {
    if (!content.includes('createPortal')) {
      content = content.replace(/import \{([^}]+)\} from 'react-dom';/, 'import { $1, createPortal } from "react-dom";');
    }
  } else {
    content = content.replace(
      /import React(.*?)from ['"]react['"];/,
      'import React$1from "react";\nimport { createPortal } from "react-dom";'
    );
  }
  
  // Ensure we match the main return AnimatePresence
  // The structure usually is: return ( <AnimatePresence> {isOpen && ( ... )} </AnimatePresence> );
  const match = content.match(/return \(\s*<AnimatePresence[\s\S]*?<\/AnimatePresence>\s*\);/);
  if (match) {
    let replaced = match[0].replace(
      /return \(\s*(<AnimatePresence[\s\S]*?<\/AnimatePresence>)\s*\);/,
      'return typeof document !== "undefined" ? createPortal(\n    $1,\n    document.body\n  ) : null;'
    );
    content = content.replace(match[0], replaced);
    fs.writeFileSync(filePath, content);
    console.log('Patched ' + filePath);
  } else {
    // maybe it returns AnimatePresence without parenthesis?
    const match2 = content.match(/return\s*<AnimatePresence[\s\S]*?<\/AnimatePresence>\s*;/);
    if (match2) {
      let replaced = match2[0].replace(
        /return\s*(<AnimatePresence[\s\S]*?<\/AnimatePresence>)\s*;/,
        'return typeof document !== "undefined" ? createPortal(\n    $1,\n    document.body\n  ) : null;'
      );
      content = content.replace(match2[0], replaced);
      fs.writeFileSync(filePath, content);
      console.log('Patched ' + filePath);
    } else {
      console.log('Could not find AnimatePresence return in ' + filePath);
    }
  }
}

const files = [
  'src/components/auth/LoginBottomSheet.tsx',
  'src/components/ProfileShareSheet.tsx',
  'src/components/navigation/CreateMenu.tsx',
  'src/components/navigation/MobileSidebarDrawer.tsx',
  'src/components/ReportDialog.tsx',
  'src/components/NewMessageDialog.tsx',
  'src/components/OnboardingModal.tsx'
];

files.forEach(addPortal);

