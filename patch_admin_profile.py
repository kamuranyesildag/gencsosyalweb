import re

with open("src/components/admin/AdminModeration.tsx", "r") as f:
    content = f.read()

content = content.replace("entityType: 'POST' | 'COMMENT';", "entityType: 'POST' | 'COMMENT' | 'PROFILE';")
content = content.replace("log.entityType === 'POST' ? <FileText className=\"w-5 h-5\" /> : <MessageSquare className=\"w-5 h-5\" />", "log.entityType === 'POST' ? <FileText className=\"w-5 h-5\" /> : log.entityType === 'COMMENT' ? <MessageSquare className=\"w-5 h-5\" /> : <User className=\"w-5 h-5\" />")

with open("src/components/admin/AdminModeration.tsx", "w") as f:
    f.write(content)
