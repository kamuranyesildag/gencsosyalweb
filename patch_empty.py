import re

with open("src/components/ui/EmptyState.tsx", "r") as f:
    content = f.read()

content = content.replace('p-8 sm:p-12', 'p-6 sm:p-12')
content = content.replace('w-16 h-16', 'w-12 h-12 sm:w-16 sm:h-16')
content = content.replace('w-8 h-8', 'w-6 h-6 sm:w-8 sm:h-8')
content = content.replace('text-lg sm:text-xl', 'text-base sm:text-xl')
content = content.replace('min-h-[50vh]', 'min-h-[30vh] sm:min-h-[50vh]')

with open("src/components/ui/EmptyState.tsx", "w") as f:
    f.write(content)

with open("src/components/ui/ErrorState.tsx", "r") as f:
    content = f.read()

content = content.replace('p-8 sm:p-10', 'p-6 sm:p-10')
content = content.replace('w-14 h-14', 'w-12 h-12 sm:w-14 sm:h-14')
content = content.replace('w-7 h-7', 'w-6 h-6 sm:w-7 sm:h-7')
content = content.replace('min-h-[50vh]', 'min-h-[30vh] sm:min-h-[50vh]')

with open("src/components/ui/ErrorState.tsx", "w") as f:
    f.write(content)

