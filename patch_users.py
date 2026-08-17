import re

with open("server/routes/users.ts", "r") as f:
    content = f.read()

import_target = "import { updateProfileSchema } from \"../validators/api.js\";"
import_replacement = "import { updateProfileSchema } from \"../validators/api.js\";\nimport { moderateContent } from \"../services/moderation/index.js\";\nimport { moderationLogs } from \"../../src/db/schema.js\";"
if "moderateContent" not in content:
    content = content.replace(import_target, import_replacement)

target = """    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
      return;
    }"""

replacement = """    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri." }});
      return;
    }

    if (parsed.data.bio) {
      const modResult = await moderateContent(parsed.data.bio);
      if (modResult.riskLevel === 'HIGH_RISK') {
        await db.insert(moderationLogs).values({
           entityType: 'PROFILE',
           entityId: currentUserId,
           userId: currentUserId,
           status: 'RESOLVED',
           actionTaken: 'REJECTED',
           riskLevel: modResult.riskLevel,
           category: modResult.category,
           reason: modResult.reason || null
        });
        res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Biyografiniz topluluk kurallarına aykırı." }});
        return;
      }
    }"""

content = content.replace(target, replacement)

with open("server/routes/users.ts", "w") as f:
    f.write(content)
