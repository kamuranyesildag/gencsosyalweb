import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

# Add import
import_target = "import { AdminReports } from '../components/admin/AdminReports';"
import_replacement = "import { AdminReports } from '../components/admin/AdminReports';\nimport { AdminModeration } from '../components/admin/AdminModeration';"
content = content.replace(import_target, import_replacement)

# Add type
type_target = "| 'reports'"
type_replacement = "| 'reports'\n   | 'moderation'"
content = content.replace(type_target, type_replacement)

# Add tab
tab_target = "{ id: 'reports', label: 'Moderasyon & Raporlar', shortLabel: 'Raporlar', icon: <AlertTriangle className=\"w-4 h-4\" /> },"
tab_replacement = "{ id: 'moderation', label: 'Otomatik Moderasyon', shortLabel: 'Mod', icon: <ShieldAlert className=\"w-4 h-4\" /> },\n    { id: 'reports', label: 'Kullanıcı Şikayetleri', shortLabel: 'Şikayet', icon: <AlertTriangle className=\"w-4 h-4\" /> },"
content = content.replace(tab_target, tab_replacement)

# Add render
render_target = "{activeTab === 'reports' && <AdminReports />}"
render_replacement = "{activeTab === 'reports' && <AdminReports />}\n            {activeTab === 'moderation' && <AdminModeration />}"
content = content.replace(render_target, render_replacement)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)
