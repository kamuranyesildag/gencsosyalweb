const fs = require('fs');
const path = 'src/components/ui/IconButton.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("import { motion, type HTMLMotionProps } from 'motion/react';", "");
code = code.replace(/<motion\.button/g, "<button");
code = code.replace(/<\/motion\.button>/g, "</button>");
code = code.replace(/whileTap=\{isDisabled \? undefined : \{ scale: 0\.96 \}\}/g, "");
code = code.replace(/\{...\(props as HTMLMotionProps<'button'>\)\}/g, "{...props}");
code = code.replace(
  "'inline-flex items-center justify-center shrink-0 select-none relative cursor-pointer transition-colors duration-150',",
  "'inline-flex items-center justify-center shrink-0 select-none relative cursor-pointer transition-all active:scale-[0.97] duration-150',"
);

fs.writeFileSync(path, code);
