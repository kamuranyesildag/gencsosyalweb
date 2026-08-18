import re

with open("src/components/navigation/MobileBottomNav.tsx", "r") as f:
    content = f.read()

# Make navigation height 14 (56px) instead of 16 (64px) 
# Also reduce icon sizes slightly to 20-24px
content = content.replace('h-16 px-2', 'h-14 px-1')
content = content.replace('w-12 h-12 rounded-2xl bg-gradient-to-tr', 'w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr')
content = content.replace('w-6 h-6 stroke-[2.5]', 'w-5 h-5 md:w-6 md:h-6 stroke-[2.5]')
content = content.replace('w-6 h-6 transition-transform', 'w-[22px] h-[22px] md:w-6 md:h-6 transition-transform')
content = content.replace('w-6 h-6 stroke-[1.8]', 'w-[22px] h-[22px] md:w-6 md:h-6 stroke-[1.8]')
content = content.replace('-mt-5', '-mt-4')

with open("src/components/navigation/MobileBottomNav.tsx", "w") as f:
    f.write(content)
