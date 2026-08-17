const fs = require('fs');
let content = fs.readFileSync('server/routes/userPosts.ts', 'utf8');

// Replace imports to add lt
content = content.replace(
  'import { eq, desc, isNull, inArray, and, or } from "drizzle-orm";',
  'import { eq, desc, isNull, inArray, and, or, lt } from "drizzle-orm";\nimport { decodeCursor, encodeCursor } from "../utils/cursor.js";'
);

// Replace pagination schema parse
content = content.replace(
  'const parsed = paginationSchema.safeParse(req.query);\n    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };\n    const offset = (page - 1) * limit;',
  `const parsed = paginationSchema.safeParse(req.query);\n    const { page, limit, cursor } = parsed.success ? parsed.data : { page: 1, limit: 20, cursor: undefined };\n    const offset = (page - 1) * limit;\n    let cursorCondition = undefined;\n    if (cursor) {\n      const decoded = decodeCursor(cursor);\n      if (decoded) {\n        cursorCondition = or(lt(posts.createdAt, decoded.createdAt), and(eq(posts.createdAt, decoded.createdAt), lt(posts.id, decoded.id)));\n      }\n    }`
);

content = content.replace(
  '.where(and(eq(posts.userId, targetUserId), isNull(posts.communityId)))',
  '.where(and(eq(posts.userId, targetUserId), isNull(posts.communityId), cursorCondition ? cursorCondition : undefined))'
);

content = content.replace(
  '.orderBy(desc(posts.createdAt))',
  '.orderBy(desc(posts.createdAt), desc(posts.id))'
);

content = content.replace(
  'const formattedPosts = await populatePostStats(visiblePosts, currentUserId);\n    res.json({ success: true, data: formattedPosts });',
  `const formattedPosts = await populatePostStats(visiblePosts, currentUserId);\n    let nextCursor = undefined;\n    if (visiblePosts.length === limit) {\n      const last = visiblePosts[visiblePosts.length - 1];\n      nextCursor = encodeCursor(last.createdAt, last.id);\n    }\n    res.json({ success: true, data: formattedPosts, meta: { nextCursor } });`
);

fs.writeFileSync('server/routes/userPosts.ts', content);
