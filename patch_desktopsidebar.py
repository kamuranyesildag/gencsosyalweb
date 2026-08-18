import re

with open("src/components/navigation/DesktopSidebar.tsx", "r") as f:
    content = f.read()

if "useNavigate" not in content:
    content = content.replace("useLocation } from 'react-router';", "useLocation, useNavigate } from 'react-router';")
if "const navigate = useNavigate();" not in content:
    content = content.replace("const location = useLocation();", "const location = useLocation();\n  const navigate = useNavigate();")

if "Plus" not in content:
    content = content.replace("import { Home,", "import { Home, Plus,")

new_create_btn = """        {/* Create Post Nav Item */}
        <div className="w-full mt-2 mb-2">
          <div className="xl:hidden w-full flex justify-center">
            <button
              onClick={() => {
                if (!isAuthenticated) openModal();
                else navigate('/create');
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/40"
              aria-label="Gönderi Oluştur"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
          <div className="hidden xl:block w-full px-1">
            <button
              onClick={() => {
                if (!isAuthenticated) openModal();
                else navigate('/create');
              }}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/40 text-[15px] font-bold tracking-wide"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Gönderi Oluştur
            </button>
          </div>
        </div>

        {/* Profile Nav Item */}"""

content = content.replace("{/* Profile Nav Item */}", new_create_btn)

with open("src/components/navigation/DesktopSidebar.tsx", "w") as f:
    f.write(content)
