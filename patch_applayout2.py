import re

with open("src/layouts/AppLayout.tsx", "r") as f:
    content = f.read()

content = content.replace('pb-20 md:pb-8', 'pb-[72px] md:pb-8')

with open("src/layouts/AppLayout.tsx", "w") as f:
    f.write(content)

