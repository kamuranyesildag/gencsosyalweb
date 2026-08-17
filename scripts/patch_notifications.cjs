const fs = require('fs');
let content = fs.readFileSync('server/routes/notifications.ts', 'utf8');

// Add lt and cursor
content = content.replace(
  'import { eq, desc, and } from "drizzle-orm";',
  'import { eq, desc, and, lt, or } from "drizzle-orm";\nimport { decodeCursor, encodeCursor } from "../utils/cursor.js";'
);

content = content.replace(
  'const parsed = paginationSchema.safeParse(req.query);\n    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };\n    const offset = (page - 1) * limit;',
  `const parsed = paginationSchema.safeParse(req.query);\n    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };\n    const offset = (page - 1) * limit;\n    let cursorCondition = undefined;\n    if (cursor) {\n      const decoded = decodeCursor(cursor);\n      if (decoded) {\n        cursorCondition = or(lt(notifications.createdAt, decoded.createdAt), and(eq(notifications.createdAt, decoded.createdAt), lt(notifications.id, decoded.id)));\n      }\n    }`
);

content = content.replace(
  '.where(eq(notifications.recipientId, currentUserId))',
  '.where(and(eq(notifications.recipientId, currentUserId), cursorCondition ? cursorCondition : undefined))'
);

content = content.replace(
  '.orderBy(desc(notifications.createdAt))',
  '.orderBy(desc(notifications.createdAt), desc(notifications.id))'
);

content = content.replace(
  'res.json({ success: true, data: list });',
  `let nextCursor = undefined;\n    if (list.length === limit) {\n      const last = list[list.length - 1];\n      nextCursor = encodeCursor(last.createdAt, last.id);\n    }\n    res.json({ success: true, data: list, meta: { nextCursor } });`
);

fs.writeFileSync('server/routes/notifications.ts', content);
