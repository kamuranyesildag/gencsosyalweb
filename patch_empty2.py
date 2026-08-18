import re

with open("src/components/ui/EmptyState.tsx", "r") as f:
    content = f.read()

content = content.replace('p-8 sm:p-12', 'p-6 sm:p-12')
content = content.replace('w-14 h-14 sm:w-16 sm:h-16', 'w-12 h-12 sm:w-16 sm:h-16')
content = content.replace('text-base sm:text-lg font-bold', 'text-base sm:text-lg font-bold')
content = content.replace('w-7 h-7', 'w-6 h-6 sm:w-7 sm:h-7')
content = content.replace('mb-6', 'mb-4 sm:mb-6')

with open("src/components/ui/EmptyState.tsx", "w") as f:
    f.write(content)

