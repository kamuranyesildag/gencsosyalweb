import sys

with open("src/pages/Notifications.tsx", "r") as f:
    content = f.read()

content = content.replace("Bell,", "Bell, Megaphone,")

with open("src/pages/Notifications.tsx", "w") as f:
    f.write(content)
