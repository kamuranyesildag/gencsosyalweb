const fs = require('fs');

// Fix server/routes/userPosts.ts
let userPosts = fs.readFileSync('server/routes/userPosts.ts', 'utf8');
if (!userPosts.includes("import { sql } from 'drizzle-orm';")) {
  userPosts = "import { sql } from 'drizzle-orm';\n" + userPosts;
  fs.writeFileSync('server/routes/userPosts.ts', userPosts);
}

// Fix src/components/PostCard.tsx
let postCard = fs.readFileSync('src/components/PostCard.tsx', 'utf8');
postCard = postCard.replace(/import \{.*?Image.*?\} from "react-dom";/g, ''); // Or whatever imports Image
postCard = postCard.replace(/align="start"/g, 'align="left"');
fs.writeFileSync('src/components/PostCard.tsx', postCard);

// Fix src/lib/motion.ts
let motionFile = fs.readFileSync('src/lib/motion.ts', 'utf8');
// Fix easing tuples - Type 'number[]' needs to be 'as any' or properly typed in framer motion?
// Actually in framer motion bezier curves are tuples like [number, number, number, number] but TS sometimes complains if not 'as const' or 'as any' or if we use standard Transition.
// We can just cast it as any or change number[] to [number, number, number, number]

// Wait, the error is: Type 'number[]' is not assignable to type 'Easing'.
// If we change it to 'cubic-bezier...' it's not accepted maybe? Easing accepts an array of 4 numbers, but we just need to cast 'as any' or use as const.
motionFile = motionFile.replace(/const easings = \{/g, 'const easings: Record<string, any> = {');
fs.writeFileSync('src/lib/motion.ts', motionFile);

