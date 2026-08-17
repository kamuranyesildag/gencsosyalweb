with open("server/routes/admin.ts", "r") as f:
    content = f.read()

content = content.replace('requireRole(["admin"])', 'requireRole("ADMIN")')
content = content.replace('details: { action: "Updated SMTP settings" }', 'metadata: { action: "Updated SMTP settings" }')

with open("server/routes/admin.ts", "w") as f:
    f.write(content)

with open("server/routes/auth.ts", "r") as f:
    content = f.read()

content = content.replace('parseInt(req.params.id);', 'parseInt(req.params.id as string);')

with open("server/routes/auth.ts", "w") as f:
    f.write(content)

