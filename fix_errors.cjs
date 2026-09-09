const fs = require('fs');

// Fix PostCard.tsx
let postCard = fs.readFileSync('src/components/PostCard.tsx', 'utf8');
if (!postCard.includes('createPortal')) {
    postCard = "import { createPortal } from 'react-dom';\n" + postCard;
}
if (!postCard.includes('ImageIcon')) {
    postCard = postCard.replace("import {", "import { ImageIcon,");
}
fs.writeFileSync('src/components/PostCard.tsx', postCard);

// Fix motion.ts
let motion = fs.readFileSync('src/lib/motion.ts', 'utf8');
motion = motion.replace(/\[0.2, 0, 0, 1\]/g, '[0.2, 0, 0, 1] as any');
motion = motion.replace(/\[0.2, 0, 0, 1\] as any as any/g, '[0.2, 0, 0, 1] as any'); // clean up just in case
motion = motion.replace(/\[0.3, 0, 0.8, 0.15\]/g, '[0.3, 0, 0.8, 0.15] as any');
motion = motion.replace(/\[0.05, 0.7, 0.1, 1\]/g, '[0.05, 0.7, 0.1, 1] as any');
motion = motion.replace(/\[0.4, 0, 0.2, 1\]/g, '[0.4, 0, 0.2, 1] as any');
motion = motion.replace(/\[0.16, 1, 0.3, 1\]/g, '[0.16, 1, 0.3, 1] as any');
fs.writeFileSync('src/lib/motion.ts', motion);
