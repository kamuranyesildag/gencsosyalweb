import re

with open("src/pages/Feed.tsx", "r") as f:
    content = f.read()

# Make the tab segment smaller
content = content.replace('px-5 py-2 rounded-xl text-xs sm:text-sm', 'px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl text-[13px] md:text-sm')
content = content.replace('min-h-[38px]', 'min-h-[36px] md:min-h-[38px]')

with open("src/pages/Feed.tsx", "w") as f:
    f.write(content)
