import re

with open("src/components/PostCard.tsx", "r") as f:
    content = f.read()

# Make outer padding more compact on mobile
content = content.replace('p-4 sm:p-5 flex gap-3', 'p-3.5 sm:p-5 flex gap-3')

# Reduce username and display name font size on mobile
content = content.replace('text-[15px] sm:text-[16px] font-bold', 'text-[14px] sm:text-[16px] font-bold')
content = content.replace('text-[13px] sm:text-[14px] text-slate-500', 'text-[12px] sm:text-[14px] text-slate-500')

# Content text smaller on mobile
content = content.replace('text-[15px] sm:text-[16px] leading-relaxed', 'text-[14px] sm:text-[16px] leading-relaxed')

# Reduce icon sizes
content = content.replace('w-[18px] h-[18px]', 'w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]')
content = content.replace('w-4 h-4', 'w-3.5 h-3.5 sm:w-4 sm:h-4')

with open("src/components/PostCard.tsx", "w") as f:
    f.write(content)
