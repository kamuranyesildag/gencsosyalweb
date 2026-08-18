import re

with open("src/components/StarterQuestsCard.tsx", "r") as f:
    content = f.read()

if "window.scrollTo({ top: 0, behavior: 'smooth' })" in content:
    content = content.replace("window.scrollTo({ top: 0, behavior: 'smooth' })", "navigate('/create')")

with open("src/components/StarterQuestsCard.tsx", "w") as f:
    f.write(content)
