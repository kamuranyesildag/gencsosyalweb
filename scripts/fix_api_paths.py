import sys

def replace_in_file(filename, old, new):
    with open(filename, "r") as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filename, "w") as f:
        f.write(content)

replace_in_file("src/components/settings/SettingsSecurity.tsx", "/api/v1/auth/sessions", "/auth/sessions")
replace_in_file("src/components/settings/SettingsSecurity.tsx", "/api/v1/users/me/password", "/users/me/password")
replace_in_file("src/pages/Admin.tsx", "/api/v1/admin/smtp", "/admin/smtp")

