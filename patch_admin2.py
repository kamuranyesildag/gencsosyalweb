import re

with open("server/routes/admin.ts", "r") as f:
    content = f.read()

content = content.replace("adminRouter.get(\"/moderation/queue\", requireAuth, requireAdmin, async (req, res) => {", "adminRouter.get(\"/moderation/queue\", async (req, res) => {")
content = content.replace("adminRouter.post(\"/moderation/:id/action\", requireAuth, requireAdmin, async (req, res) => {", "adminRouter.post(\"/moderation/:id/action\", async (req, res) => {")

with open("server/routes/admin.ts", "w") as f:
    f.write(content)
