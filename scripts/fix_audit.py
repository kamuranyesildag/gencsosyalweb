import re

with open("server/routes/auth.ts", "r") as f:
    content = f.read()

content = content.replace("const { adminAuditLogs, recoveryCodes } = await import(\"../../src/db/schema.js\");", "const { securityAuditLogs, recoveryCodes } = await import(\"../../src/db/schema.js\");")
content = content.replace("await tx.insert(adminAuditLogs).values({", "await tx.insert(securityAuditLogs).values({")
content = content.replace("adminUserId: user.id,", "userId: user.id,")
content = content.replace("targetType: \"user\",\n        targetId: user.id.toString(),\n", "")

content = content.replace("adminUserId: userId,", "userId: userId,")
content = content.replace("targetType: \"user\",\n        targetId: userId.toString(),\n", "")


with open("server/routes/auth.ts", "w") as f:
    f.write(content)
