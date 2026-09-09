const fs = require('fs');

let motion = fs.readFileSync('src/lib/motion.ts', 'utf8');
motion = motion.replace('const easeIn = [0.32, 0, 0.67, 0];', 'const easeIn = [0.32, 0, 0.67, 0] as any;');
motion = motion.replace('const easeInOut = [0.65, 0, 0.35, 1];', 'const easeInOut = [0.65, 0, 0.35, 1] as any;');
fs.writeFileSync('src/lib/motion.ts', motion);
