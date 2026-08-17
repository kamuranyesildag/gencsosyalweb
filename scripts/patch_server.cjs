const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  'async function startServer() {\n  const app = express();',
  `async function startServer() {\n  const isProd = process.env.NODE_ENV === "production";\n\n  if (isProd) {\n    const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET", "DATABASE_URL"];\n    const missingVars = requiredEnvVars.filter(v => !process.env[v]);\n    \n    if (missingVars.length > 0) {\n      console.error(\`FATAL ERROR: Missing required production environment variables: \${missingVars.join(", ")}\`);\n      process.exit(1);\n    }\n  }\n\n  const app = express();`
);
fs.writeFileSync('server.ts', content);
