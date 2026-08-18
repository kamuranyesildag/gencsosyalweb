import re

with open("src/components/StarterQuestsCard.tsx", "r") as f:
    content = f.read()

# Make card more compact
content = content.replace('p-5 sm:p-6', 'p-4 sm:p-6')
content = content.replace('mb-5', 'mb-4 sm:mb-5')
content = content.replace('text-[18px] sm:text-[20px] font-black', 'text-[16px] sm:text-[20px] font-black')
content = content.replace('text-[13px] sm:text-[14px] text-slate-500', 'text-[12px] sm:text-[14px] text-slate-500')
content = content.replace('gap-3 sm:gap-4', 'gap-2.5 sm:gap-4')
content = content.replace('text-[14px] sm:text-[15px] font-bold', 'text-[13px] sm:text-[15px] font-bold')

with open("src/components/StarterQuestsCard.tsx", "w") as f:
    f.write(content)

