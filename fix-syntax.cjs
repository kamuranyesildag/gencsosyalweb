const fs = require('fs');
const pathAuth = 'server/routes/auth.ts';
let authContent = fs.readFileSync(pathAuth, 'utf8');

// I will clean up the trailing syntax error at the bottom of the file
const badCode = `        if (user[0].username === 'gencsosyal' || user[0].email === 'imranyesildag123@gmail.com') {      await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, userId));      return res.json({ success: true, message: "You are now an admin. Please re-login to update your token." });    }        res.status(403).json({ success: false, message: "Not eligible" });  } catch (err) {    console.error(err);    res.status(500).json({ success: false, message: "Server error" });  }});`;

if (authContent.includes(badCode)) {
  authContent = authContent.replace(badCode, '');
  fs.writeFileSync(pathAuth, authContent);
  console.log('Fixed auth syntax error');
} else {
  // if exactly that string didn't match, let's just find the last 15 lines and clean it
  const lines = authContent.split('\n');
  const validLines = lines.slice(0, lines.findIndex(l => l.includes('Oturum kapatılamadı.')) + 4);
  fs.writeFileSync(pathAuth, validLines.join('\n'));
  console.log('Fixed auth syntax by line trimming');
}

