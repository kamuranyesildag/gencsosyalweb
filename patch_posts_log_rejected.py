import re

with open("server/routes/posts.ts", "r") as f:
    content = f.read()

target = """    if (modStatus === 'REJECTED') {
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı." }});
    }"""

replacement = """    if (modStatus === 'REJECTED') {
      // Log the rejected attempt
      await db.insert(moderationLogs).values({
         entityType: 'POST',
         entityId: -1, // No post created
         userId: currentUserId,
         status: 'RESOLVED',
         actionTaken: 'REJECTED',
         riskLevel: modResult.riskLevel,
         category: modResult.category,
         reason: modResult.reason || null
      });
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı." }});
    }"""

content = content.replace(target, replacement)

target2 = """    if (modStatus === 'REJECTED') {
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı." }});
    }"""

replacement2 = """    if (modStatus === 'REJECTED') {
      await db.insert(moderationLogs).values({
         entityType: 'COMMENT',
         entityId: -1, 
         userId: currentUserId,
         status: 'RESOLVED',
         actionTaken: 'REJECTED',
         riskLevel: modResult.riskLevel,
         category: modResult.category,
         reason: modResult.reason || null
      });
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı." }});
    }"""

# Actually, I'll use index to replace the first and second occurrences correctly.
parts = content.split("if (modStatus === 'REJECTED') {\n      return res.status(403).json({ success: false, error: { code: \"POLICY_VIOLATION\", message: \"Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı.\" }});\n    }")

if len(parts) == 3:
    content = parts[0] + replacement.replace("await db", "await db") + parts[1] + replacement2.replace("await db", "await db") + parts[2]
    with open("server/routes/posts.ts", "w") as f:
        f.write(content)
