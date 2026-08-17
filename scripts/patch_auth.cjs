const fs = require('fs');
let content = fs.readFileSync('server/routes/auth.ts', 'utf8');

// Replace forgot password secret fallback
content = content.replace(
  `const secret = (process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod") + user.passwordHash;`,
  `if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");\n      const secret = (process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod") + user.passwordHash;`
);

fs.writeFileSync('server/routes/auth.ts', content);
