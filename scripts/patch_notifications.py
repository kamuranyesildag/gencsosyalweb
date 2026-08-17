import sys

with open("src/pages/Notifications.tsx", "r") as f:
    content = f.read()

# Add icon for post
old_icon = "      case 'repost': return <Repeat className=\"w-7 h-7 text-green-500 drop-shadow-sm\" />;"
new_icon = "      case 'repost': return <Repeat className=\"w-7 h-7 text-green-500 drop-shadow-sm\" />;\n      case 'post': return <Megaphone className=\"w-7 h-7 text-indigo-500 drop-shadow-sm\" />;"

if old_icon in content:
    content = content.replace(old_icon, new_icon)

# Add text for post
old_text = "                      {notif.type === 'repost' && 'gönderini yeniden paylaştı.'}"
new_text = "                      {notif.type === 'repost' && 'gönderini yeniden paylaştı.'}\n                      {notif.type === 'post' && 'yeni bir duyuru/gönderi paylaştı.'}"

if old_text in content:
    content = content.replace(old_text, new_text)

# We need to import Megaphone if it's not imported.
if "Megaphone" not in content:
    content = content.replace("Heart,", "Heart, Megaphone,")

with open("src/pages/Notifications.tsx", "w") as f:
    f.write(content)

