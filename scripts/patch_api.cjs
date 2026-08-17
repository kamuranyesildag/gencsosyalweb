const fs = require('fs');
let content = fs.readFileSync('server/validators/api.ts', 'utf8');

content = content.replace(
  'limit: z.coerce.number().min(1).max(50).default(20),',
  'limit: z.coerce.number().min(1).max(50).default(20),\n  cursor: z.string().optional(),'
);

fs.writeFileSync('server/validators/api.ts', content);
