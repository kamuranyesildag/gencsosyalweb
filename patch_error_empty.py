import re

with open("src/components/ui/ErrorState.tsx", "r") as f:
    content = f.read()

content = content.replace('p-8 md:p-12', 'p-6 md:p-12')
content = content.replace('w-16 h-16', 'w-12 h-12 md:w-16 md:h-16')
content = content.replace('w-8 h-8', 'w-6 h-6 md:w-8 md:h-8')
content = content.replace('text-xl', 'text-lg md:text-xl')
content = content.replace('min-h-[400px]', 'min-h-[250px] md:min-h-[400px]')

with open("src/components/ui/ErrorState.tsx", "w") as f:
    f.write(content)

try:
    with open("src/components/ui/EmptyState.tsx", "r") as f:
        content = f.read()

    content = content.replace('p-8 md:p-12', 'p-6 md:p-12')
    content = content.replace('w-16 h-16', 'w-12 h-12 md:w-16 md:h-16')
    content = content.replace('text-xl md:text-2xl', 'text-lg md:text-2xl')
    content = content.replace('text-base md:text-lg', 'text-sm md:text-lg')
    content = content.replace('min-h-[400px]', 'min-h-[250px] md:min-h-[400px]')

    with open("src/components/ui/EmptyState.tsx", "w") as f:
        f.write(content)
except FileNotFoundError:
    pass
