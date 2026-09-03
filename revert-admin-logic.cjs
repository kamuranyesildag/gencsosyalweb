const fs = require('fs');
const pathAuth = 'server/routes/auth.ts';
let authContent = fs.readFileSync(pathAuth, 'utf8');

// Remove the make-me-admin route block completely
authContent = authContent.replace(/authRouter\.get\("\/make-me-admin".*?\}\);\n/s, '');

// Also remove the auto-admin code in the registration flow inside auth.ts
authContent = authContent.replace(
  /const isSpecialAdmin = username === 'gencsosyal' \|\| email === 'imranyesildag123@gmail\.com';\n\s*const \[createdUser\] = await tx\.insert\(users\)\.values\(\{\n\s*role: isSpecialAdmin \? 'ADMIN' : 'USER',/s,
  'const [createdUser] = await tx.insert(users).values({\n'
);

fs.writeFileSync(pathAuth, authContent);

const pathInit = 'src/hooks/useAuthInit.ts';
let initContent = fs.readFileSync(pathInit, 'utf8');
const initRegex = /const userData = meData\.data;\s*\/\/ Auto admin logic.*?setAuth\(userData, token\);\s*return;/s;
initContent = initContent.replace(initRegex, 'setAuth(meData.data, token);\n                return;');
fs.writeFileSync(pathInit, initContent);

const pathLogin = 'src/pages/Login.tsx';
let loginContent = fs.readFileSync(pathLogin, 'utf8');
const loginRegex = /let finalUser = meData\.data;\s*if \(finalUser.*?\}\s*useAuthStore\.getState\(\)\.setAuth\(finalUser, token\);/s;
loginContent = loginContent.replace(loginRegex, 'useAuthStore.getState().setAuth(meData.data, token);');
fs.writeFileSync(pathLogin, loginContent);

console.log('Reverted all auto-admin logic securely.');
