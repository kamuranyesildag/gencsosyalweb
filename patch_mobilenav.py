import re

with open("src/components/navigation/MobileBottomNav.tsx", "r") as f:
    content = f.read()

if "useNavigate" not in content:
    content = content.replace("useLocation } from 'react-router';", "useLocation, useNavigate } from 'react-router';")

if "const navigate = useNavigate();" not in content:
    content = content.replace("const location = useLocation();", "const location = useLocation();\n  const navigate = useNavigate();")

content = content.replace("else setShowCreate(true);", "else navigate('/create');")

with open("src/components/navigation/MobileBottomNav.tsx", "w") as f:
    f.write(content)
