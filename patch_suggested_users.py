import re

with open("src/components/SuggestedUsers.tsx", "r") as f:
    content = f.read()

# Make card more compact
content = content.replace('p-5', 'p-4 sm:p-5')
content = content.replace('text-[18px] font-black', 'text-[16px] sm:text-[18px] font-black')
content = content.replace('text-[13px] text-slate-500 mb-5', 'text-[12px] sm:text-[13px] text-slate-500 mb-4 sm:mb-5')
content = content.replace('gap-4', 'gap-3 sm:gap-4')
content = content.replace('size="md"', 'size="sm"') # avatar
content = content.replace('text-[15px] font-bold', 'text-[14px] sm:text-[15px] font-bold')

with open("src/components/SuggestedUsers.tsx", "w") as f:
    f.write(content)

