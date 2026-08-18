import re

with open("src/components/navigation/AppHeader.tsx", "r") as f:
    content = f.read()

# Make header smaller on mobile: h-14 (56px) instead of h-16 (64px)
content = content.replace('h-16 flex items-center justify-center', 'h-14 md:h-16 flex items-center justify-center')
# Make logo smaller on mobile
content = content.replace('w-9 h-9 sm:w-10 sm:h-10 rounded-xl', 'w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-xl')
content = content.replace('w-5 h-5 sm:w-6 sm:h-6', 'w-4 h-4 md:w-6 md:h-6')
content = content.replace('text-lg sm:text-xl font-black', 'text-base md:text-xl font-black')

with open("src/components/navigation/AppHeader.tsx", "w") as f:
    f.write(content)
