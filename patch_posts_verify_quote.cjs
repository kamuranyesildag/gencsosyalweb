const fs = require('fs');
const path = 'server/routes/posts.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /if \(parsed\.data\.quotedPostId\)/;
const verifyCode = `
    if (parsed.data.quotedPostId) {
      if (!(await verifyPostAccess(parsed.data.quotedPostId, currentUserId))) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Bu içeriği alıntılamaya yetkiniz yok." } });
      }
    }
`;

if (!code.includes('Bu içeriği alıntılamaya yetkiniz yok.')) {
  code = code.replace(
    'const result = await db.transaction(async (tx: DbTransaction) => {',
    verifyCode + '\n    const result = await db.transaction(async (tx: DbTransaction) => {'
  );
  fs.writeFileSync(path, code);
}
