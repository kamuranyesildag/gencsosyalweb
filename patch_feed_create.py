import re

with open("src/pages/Feed.tsx", "r") as f:
    content = f.read()

# Add useNavigate and Avatar imports if not present
if "useNavigate" not in content:
    content = content.replace('import { BrowserRouter, Routes, Route, Navigate } from "react-router";', 'import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";')
    content = content.replace('import { Navigate } from "react-router";', 'import { Navigate, useNavigate } from "react-router";')

if "useNavigate" not in content:
    content = content.replace('from "react-router";', 'from "react-router";\nimport { useNavigate } from "react-router";')

if "Avatar" not in content:
    content = content.replace('import { Sparkles, Users, RefreshCw } from "lucide-react";', 'import { Sparkles, Users, RefreshCw } from "lucide-react";\nimport { Avatar } from "../components/ui/Avatar";')

# Inject useNavigate hook
if "const navigate = useNavigate();" not in content:
    content = content.replace('export function Feed() {', 'export function Feed() {\n  const navigate = useNavigate();')

old_create = """      {/* 3. Create Post Composer */}
      <CreatePost onPostCreated={(item) => {
        addItem(item);
        window.dispatchEvent(new Event("refreshOnboarding"));
      }} />"""

new_create = """      {/* 3. Create Post Trigger */}
      {isAuthenticated && (
        <div className="px-4 sm:px-6 py-4 mb-4 border-b border-slate-100 bg-white">
          <div 
            onClick={() => navigate("/create")}
            className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors p-3.5 rounded-full cursor-pointer border border-slate-200/60"
            role="button"
            tabIndex={0}
          >
            <Avatar url={useAuthStore.getState().user?.avatarUrl} name={useAuthStore.getState().user?.displayName || useAuthStore.getState().user?.username || "?"} size="sm" />
            <span className="text-slate-500 font-medium text-[15px]">Ne paylaşmak istiyorsun?</span>
          </div>
        </div>
      )}"""

content = content.replace(old_create, new_create)

with open("src/pages/Feed.tsx", "w") as f:
    f.write(content)
