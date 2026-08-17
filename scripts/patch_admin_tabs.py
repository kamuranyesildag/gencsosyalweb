import sys

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

# 1. Update AdminTab
old_tab = 'type AdminTab = "stats" | "users" | "verifications" | "reports" | "smtp";'
new_tab = 'type AdminTab = "stats" | "users" | "verifications" | "reports" | "smtp" | "official";'
content = content.replace(old_tab, new_tab)

# 2. Add Import
if "AdminOfficialAccounts" not in content:
    content = 'import { AdminOfficialAccounts } from "../components/admin/AdminOfficialAccounts";\n' + content

# 3. Add Button
old_btn = '          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "users" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>Kullanıcılar</button>'
new_btn = '          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "users" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>Kullanıcılar</button>\n          <button onClick={() => setActiveTab("official")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "official" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>Resmi Hesaplar</button>'
content = content.replace(old_btn, new_btn)

# 4. Add Tab Content
old_content = '        {/* Users Tab */}'
new_content = '        {activeTab === "official" && <AdminOfficialAccounts />}\n\n        {/* Users Tab */}'
content = content.replace(old_content, new_content)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

