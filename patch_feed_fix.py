import re

with open("src/pages/Feed.tsx", "r") as f:
    content = f.read()

if "import { useNavigate }" not in content:
    content = content.replace('import { BrowserRouter, Routes, Route, Navigate } from "react-router";', 'import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";')
    content = content.replace('import { Navigate } from "react-router";', 'import { Navigate, useNavigate } from "react-router";')
    
    if "import { useNavigate }" not in content:
        content = "import { useNavigate } from 'react-router';\n" + content

with open("src/pages/Feed.tsx", "w") as f:
    f.write(content)
