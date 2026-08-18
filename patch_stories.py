import re

with open("src/components/StoriesBar.tsx", "r") as f:
    content = f.read()

# Compact the story bar padding
content = content.replace('className="bg-white border-b border-slate-100 py-4 px-4 sm:px-6 relative overflow-hidden"', 'className="bg-white border-b border-slate-100 py-3 md:py-4 px-4 sm:px-6 relative overflow-hidden"')

# Reduce avatar size on mobile
content = content.replace('className="w-[72px] sm:w-[80px]"', 'className="w-[60px] md:w-[72px] sm:w-[80px]"')
content = content.replace('w-[72px] h-[72px] sm:w-[80px] sm:h-[80px]', 'w-[60px] h-[60px] md:w-[72px] md:h-[72px] sm:w-[80px] sm:h-[80px]')
content = content.replace('w-[66px] h-[66px] sm:w-[74px] sm:h-[74px]', 'w-[56px] h-[56px] md:w-[66px] md:h-[66px] sm:w-[74px] sm:h-[74px]')
content = content.replace('w-6 h-6 sm:w-7 sm:h-7', 'w-5 h-5 md:w-6 md:h-6 sm:w-7 sm:h-7') # Plus icon size
content = content.replace('bottom-1 right-1 sm:bottom-0 sm:right-0', 'bottom-0 right-0 md:bottom-1 md:right-1')

# Reduce text sizes
content = content.replace('text-[13px] sm:text-[14px]', 'text-[12px] md:text-[13px] sm:text-[14px]')
content = content.replace('text-[14px] sm:text-[15px]', 'text-[13px] md:text-[14px] sm:text-[15px]')

# Compact empty state
content = content.replace('py-4 sm:py-5 px-5', 'py-3 px-4 md:py-4 md:px-5')
content = content.replace('w-6 h-6 text-indigo-500 mb-1.5', 'w-5 h-5 md:w-6 md:h-6 text-indigo-500 mb-1.5')

with open("src/components/StoriesBar.tsx", "w") as f:
    f.write(content)
