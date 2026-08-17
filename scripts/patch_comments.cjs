const fs = require('fs');
let content = fs.readFileSync('server/routes/comments.ts', 'utf8');

// Add lt and cursor
content = content.replace(
  'import { eq, desc } from "drizzle-orm";',
  'import { eq, desc, lt, or, and } from "drizzle-orm";\nimport { decodeCursor, encodeCursor } from "../utils/cursor.js";'
);

// Pagination schema parse
content = content.replace(
  'const parsed = paginationSchema.safeParse(req.query);\n    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };\n    const offset = (page - 1) * limit;',
  `const parsed = paginationSchema.safeParse(req.query);\n    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };\n    const offset = (page - 1) * limit;\n    let cursorCondition = undefined;\n    if (cursor) {\n      const decoded = decodeCursor(cursor);\n      if (decoded) {\n        cursorCondition = or(lt(comments.createdAt, decoded.createdAt), and(eq(comments.createdAt, decoded.createdAt), lt(comments.id, decoded.id)));\n      }\n    }`
);

// Add cursorCondition
content = content.replace(
  '.where(eq(comments.postId, postId))',
  '.where(and(eq(comments.postId, postId), cursorCondition ? cursorCondition : undefined))'
);

content = content.replace(
  '.orderBy(desc(comments.createdAt))',
  '.orderBy(desc(comments.createdAt), desc(comments.id))'
);

content = content.replace(
  'res.json({ success: true, data: list });',
  `let nextCursor = undefined;\n    if (list.length === limit) {\n      const last = list[list.length - 1];\n      nextCursor = encodeCursor(last.createdAt, last.id);\n    }\n    res.json({ success: true, data: list, meta: { nextCursor } });`
);

fs.writeFileSync('server/routes/comments.ts', content);
