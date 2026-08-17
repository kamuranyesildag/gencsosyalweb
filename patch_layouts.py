import re

# Patch BaseLayout.tsx
with open("src/layouts/BaseLayout.tsx", "r") as f:
    content = f.read()

if "PageTransition" not in content:
    content = content.replace("import { LoginBottomSheet } from '../components/auth/LoginBottomSheet';", "import { LoginBottomSheet } from '../components/auth/LoginBottomSheet';\nimport { PageTransition } from '../components/ui/PageTransition';")
    content = content.replace("<Outlet />", "<PageTransition><Outlet /></PageTransition>")
    
    with open("src/layouts/BaseLayout.tsx", "w") as f:
        f.write(content)

# Patch AppLayout.tsx
with open("src/layouts/AppLayout.tsx", "r") as f:
    content = f.read()

if "PageTransition" not in content:
    content = content.replace("import { LoadingState } from \"../components/ui/LoadingState\";", "import { LoadingState } from \"../components/ui/LoadingState\";\nimport { PageTransition } from \"../components/ui/PageTransition\";")
    content = content.replace("<Outlet />", "<PageTransition><Outlet /></PageTransition>")
    
    with open("src/layouts/AppLayout.tsx", "w") as f:
        f.write(content)

