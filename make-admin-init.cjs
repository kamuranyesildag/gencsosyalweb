const fs = require('fs');
const path = 'src/hooks/useAuthInit.ts';
let content = fs.readFileSync(path, 'utf8');

const insertLogic = `
            const token = refreshData.data.accessToken;
            const userData = refreshData.data.user;
            
            // Auto admin logic
            if (userData && (userData.username === 'gencsosyal' || userData.email === 'imranyesildag123@gmail.com') && userData.role !== 'ADMIN') {
               try {
                 const res = await fetch("/api/v1/auth/make-me-admin", {
                   headers: { "Authorization": \`Bearer \${token}\` }
                 });
                 if (res.ok) {
                   userData.role = 'ADMIN';
                 }
               } catch (e) {}
            }
            
            setAuth(userData, token);
`;
content = content.replace(/const token = refreshData\.data\.accessToken;\s*setAuth\(refreshData\.data\.user, token\);/, insertLogic);
fs.writeFileSync(path, content);
console.log('useAuthInit.ts patched');
