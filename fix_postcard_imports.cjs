const fs = require('fs');

let postCard = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// Undo the mess
postCard = postCard.replace(/import \{ Image as ImageIcon,/g, 'import {');
postCard = postCard.replace(/import \{ createPortal \} from "react-dom";\n/g, '');

// Prepend properly
postCard = 'import { createPortal } from "react-dom";\n' + postCard;
postCard = postCard.replace('import {  ShieldAlert,', 'import { Image as ImageIcon, ShieldAlert,');

fs.writeFileSync('src/components/PostCard.tsx', postCard);
