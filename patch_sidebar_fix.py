import re

with open("src/components/navigation/DesktopSidebar.tsx", "r") as f:
    content = f.read()

if "import { Home, Compass, Bell, Plus, User" not in content:
    content = content.replace("import { Home, Compass, Bell, User", "import { Home, Compass, Bell, Plus, User")

if "import { Plus" not in content:
    content = content.replace("import { Home,", "import { Home, Plus,")

with open("src/components/navigation/DesktopSidebar.tsx", "w") as f:
    f.write(content)
