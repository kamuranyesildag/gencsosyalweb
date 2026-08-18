with open("server/routes/auth.ts", "r") as f:
    content = f.read()

target = """      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
    })"""
replacement = """      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      onboardingCompleted: profiles.onboardingCompleted,
    })"""

content = content.replace(target, replacement)
with open("server/routes/auth.ts", "w") as f:
    f.write(content)
