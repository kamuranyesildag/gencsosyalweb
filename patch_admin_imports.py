import re

with open("server/routes/admin.ts", "r") as f:
    content = f.read()

# Fix imports
import_target = 'import { users, profiles, verificationRequests, adminAuditLogs } from "../../src/db/schema.js";'
import_replacement = 'import { users, profiles, verificationRequests, adminAuditLogs, moderationLogs, posts, comments } from "../../src/db/schema.js";'
content = content.replace(import_target, import_replacement)

# Fix adminAuditLogs insert
old_insert = """      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        actionType: 'MODERATION_DECISION',
        entityType: 'MODERATION_LOG',
        entityId: logId,
        details: JSON.stringify({ action, entityType: log.entityType, entityId: log.entityId })
      });"""

new_insert = """      await tx.insert(adminAuditLogs).values({
        adminUserId: adminId,
        action: 'MODERATION_DECISION',
        targetType: 'MODERATION_LOG',
        targetId: logId.toString(),
        metadata: { action, entityType: log.entityType, entityId: log.entityId }
      });"""

content = content.replace(old_insert, new_insert)

with open("server/routes/admin.ts", "w") as f:
    f.write(content)
