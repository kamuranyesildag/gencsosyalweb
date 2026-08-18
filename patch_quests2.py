import re

with open("src/components/StarterQuestsCard.tsx", "r") as f:
    content = f.read()

if "import { useNavigate }" not in content:
    content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { useNavigate } from "react-router";')

if "const navigate = useNavigate();" not in content:
    content = content.replace("export function StarterQuestsCard() {", "export function StarterQuestsCard() {\n  const navigate = useNavigate();")

with open("src/components/StarterQuestsCard.tsx", "w") as f:
    f.write(content)
