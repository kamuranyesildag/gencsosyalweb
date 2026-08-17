const fs = require('fs');
let content = fs.readFileSync('server/routes/auth.ts', 'utf8');

// Replace forgot password secret fallback
content = content.replaceAll(
  `const secret = (process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod") + user.passwordHash;`,
  `const baseSecret = process.env.JWT_SECRET;\n      if (process.env.NODE_ENV === "production" && !baseSecret) throw new Error("JWT_SECRET missing");\n      const secret = (baseSecret || "dev_secret_do_not_use_in_prod") + user.passwordHash;`
);

fs.writeFileSync('server/routes/auth.ts', content);
