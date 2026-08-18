import re

with open("src/pages/Feed.tsx", "r") as f:
    content = f.read()

target = "<CreatePost onPostCreated={addItem} />"
replacement = """<CreatePost onPostCreated={(item) => {
        addItem(item);
        window.dispatchEvent(new Event("refreshOnboarding"));
      }} />"""

content = content.replace(target, replacement)

with open("src/pages/Feed.tsx", "w") as f:
    f.write(content)
