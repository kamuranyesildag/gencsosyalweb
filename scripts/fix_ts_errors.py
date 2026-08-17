import sys

def replace_in_file(filename, old, new):
    with open(filename, "r") as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filename, "w") as f:
        f.write(content)

# 1. admin.ts
replace_in_file("server/routes/admin.ts", 
    "updatedBy: req.user!.id", 
    "updatedBy: req.user!.userId"
)
replace_in_file("server/routes/admin.ts", 
    "adminUserId: req.user!.id", 
    "adminUserId: req.user!.userId"
)
replace_in_file("server/routes/admin.ts", 
    "targetId: 0,", 
    "targetId: '0',"
)

# 2. auth.ts
replace_in_file("server/routes/auth.ts", 
    "req.user!.id", 
    "req.user!.userId"
)

# 3. SettingsSecurity.tsx
with open("src/components/settings/SettingsSecurity.tsx", "r") as f:
    content = f.read()

# Fix loadSessions
old_load = """      const res = await fetchApi("/auth/sessions");
      if (res.data) setSessions(res.data);"""
new_load = """      const res = await fetchApi("/api/v1/auth/sessions");
      const json = await res.json();
      if (json.data) setSessions(json.data);"""
content = content.replace(old_load, new_load)

# Fix password
old_pwd = """      const res = await fetchApi("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.success) {"""
new_pwd = """      const res = await fetchApi("/api/v1/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const json = await res.json();
      if (json.success) {"""
content = content.replace(old_pwd, new_pwd)
content = content.replace('showMsg(res.error?.message || "Hata", "error");', 'showMsg(json.error?.message || "Hata", "error");')

# Fix fetchApi for revokes
content = content.replace('await fetchApi(`/auth/sessions/${id}`', 'await fetchApi(`/api/v1/auth/sessions/${id}`')
content = content.replace('await fetchApi(`/auth/sessions/others`', 'await fetchApi(`/api/v1/auth/sessions/others`')


with open("src/components/settings/SettingsSecurity.tsx", "w") as f:
    f.write(content)

# 4. Admin.tsx
with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

old_smtp_load = """      const res = await fetchApi("/api/v1/admin/smtp");
      if (res.data) setSmtpConfig({ ...res.data, pass: "" });"""
new_smtp_load = """      const res = await fetchApi("/api/v1/admin/smtp");
      const json = await res.json();
      if (json.data) setSmtpConfig({ ...json.data, pass: "" });"""
content = content.replace(old_smtp_load, new_smtp_load)

old_smtp_save = """      await fetchApi("/api/v1/admin/smtp", { method: "PUT", body: JSON.stringify(payload) });"""
new_smtp_save = """      await fetchApi("/api/v1/admin/smtp", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });"""
content = content.replace(old_smtp_save, new_smtp_save)

old_smtp_test = """      await fetchApi("/api/v1/admin/smtp/test", { method: "POST", body: JSON.stringify({ email: testEmail }) });"""
new_smtp_test = """      await fetchApi("/api/v1/admin/smtp/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: testEmail }) });"""
content = content.replace(old_smtp_test, new_smtp_test)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

