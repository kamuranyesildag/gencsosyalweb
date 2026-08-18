import re

with open("src/components/navigation/DesktopSidebar.tsx", "r") as f:
    content = f.read()

content = content.replace("Home,", "Home,\n  Plus,")

with open("src/components/navigation/DesktopSidebar.tsx", "w") as f:
    f.write(content)
