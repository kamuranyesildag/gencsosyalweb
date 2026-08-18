import re

with open("src/layouts/AppLayout.tsx", "r") as f:
    content = f.read()

# Make bottom nav safe-area friendly and compact
content = content.replace('className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe"', 'className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]"')
content = content.replace('pb-16', 'pb-14') # pb-safe is handled above, but main container padding should be reduced
content = content.replace('pb-[72px]', 'pb-[64px]')

with open("src/layouts/AppLayout.tsx", "w") as f:
    f.write(content)

