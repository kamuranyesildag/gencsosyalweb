import re

with open("src/context/useAuth.ts", "r") as f:
    content = f.read()

target = """  avatarUrl?: string | null;
}"""

replacement = """  avatarUrl?: string | null;
  onboardingCompleted?: boolean;
}"""

content = content.replace(target, replacement)
with open("src/context/useAuth.ts", "w") as f:
    f.write(content)
