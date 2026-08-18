import re

with open("server.ts", "r") as f:
    content = f.read()

import_target = "import { adminRouter } from \"./server/routes/admin.js\";"
import_replacement = """import { adminRouter } from "./server/routes/admin.js";
import { onboardingRouter } from "./server/routes/onboarding.js";"""

content = content.replace(import_target, import_replacement)

app_use_target = "app.use(\"/api/admin\", adminRouter);"
app_use_replacement = """app.use("/api/admin", adminRouter);
app.use("/api/onboarding", onboardingRouter);"""

content = content.replace(app_use_target, app_use_replacement)

with open("server.ts", "w") as f:
    f.write(content)
