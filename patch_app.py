import re

with open("src/App.tsx", "r") as f:
    content = f.read()

if "SplashScreen" not in content:
    content = content.replace("import { ConfirmDialogContainer } from \"./components/ui/ConfirmDialog\"; // for logged out", "import { ConfirmDialogContainer } from \"./components/ui/ConfirmDialog\"; // for logged out\nimport { SplashScreen } from \"./components/ui/SplashScreen\";")
    content = content.replace("<ErrorBoundary>", "<ErrorBoundary>\n        <SplashScreen onComplete={() => {}} />")
    
    with open("src/App.tsx", "w") as f:
        f.write(content)
