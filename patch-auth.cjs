const fs = require('fs');
const path = 'server/routes/auth.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const \[createdUser\] = await tx\.insert\(users\)\.values\(\{/g,
  `const isSpecialAdmin = username === 'gencsosyal' || email === 'imranyesildag123@gmail.com';\n      const [createdUser] = await tx.insert(users).values({\n        role: isSpecialAdmin ? 'ADMIN' : 'USER',`
);

fs.writeFileSync(path, content);
console.log('auth.ts patched.');
