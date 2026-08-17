import os
import re

toast_import_pattern = re.compile(r'import\s+\{.*toast.*\}\s+from\s+["\'].*Toast["\'];?')

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'alert(' not in content and 'window.alert(' not in content:
        return

    # Calculate relative path to src/components/ui/Toast
    depth = filepath.count('/') - 1 # e.g. src/pages/PostDetail.tsx -> depth 1 -> ../
    if depth < 0: depth = 0
    rel_prefix = '../' * depth if depth > 0 else './'
    toast_import = f'import {{ toast }} from "{rel_prefix}components/ui/Toast";\n'

    # Add import if not present
    if not toast_import_pattern.search(content):
        # find the last import and insert after it
        lines = content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import_idx = i
        
        if last_import_idx != -1:
            lines.insert(last_import_idx + 1, toast_import.strip())
            content = '\n'.join(lines)
        else:
            content = toast_import + content

    # Replace simple cases
    # For error cases:
    content = re.sub(r'(window\.)?alert\((.*?error.*?)\)', r'toast.error(\2)', content, flags=re.IGNORECASE)
    content = re.sub(r'(window\.)?alert\((.*?"(?i:hata|hata oluştu|başarısız|kullanıcı bulunamadı|silinemedi).*?)\)', r'toast.error(\2)', content)
    
    # For success cases
    content = re.sub(r'(window\.)?alert\((.*?"(?i:başarılı|gönderildi|oluşturuldu|kopyalandı).*?)\)', r'toast.success(\2)', content)

    # Any remaining alerts default to error if it looks like catch blocks, or warning, let's just make them error or info.
    # We can inspect the rest manually or just use toast.error as a fallback since most alerts are in catch blocks.
    content = re.sub(r'(window\.)?alert\(', r'toast.error(', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Replacement complete.")
