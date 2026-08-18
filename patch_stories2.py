import re

with open("src/components/StoriesBar.tsx", "r") as f:
    content = f.read()

content = content.replace('w-14 h-14 sm:w-15 sm:h-15', 'w-[52px] h-[52px] md:w-14 md:h-14 sm:w-15 sm:h-15')
content = content.replace('w-[60px] md:w-[72px] sm:w-[80px]', 'w-[56px] md:w-[72px] sm:w-[80px]')

with open("src/components/StoriesBar.tsx", "w") as f:
    f.write(content)
