import os
import re

confirm_import_pattern = re.compile(r'import\s+\{.*confirmDialog.*\}\s+from\s+["\'].*ConfirmDialog["\'];?')

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'confirm(' not in content and 'window.confirm(' not in content:
        return
        
    if 'const confirm =' in content:
        # Special case for Settings.tsx
        pass

    # Calculate relative path to src/components/ui/ConfirmDialog
    depth = filepath.count('/') - 1 # e.g. src/pages/PostDetail.tsx -> depth 1 -> ../
    if depth < 0: depth = 0
    rel_prefix = '../' * depth if depth > 0 else './'
    confirm_import = f'import {{ confirmDialog }} from "{rel_prefix}components/ui/ConfirmDialog";\n'

    # Add import if not present
    if not confirm_import_pattern.search(content):
        # find the last import and insert after it
        lines = content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import_idx = i
        
        if last_import_idx != -1:
            lines.insert(last_import_idx + 1, confirm_import.strip())
            content = '\n'.join(lines)
        else:
            content = confirm_import + content

    # Replace usages like `if (!confirm("...")) return;` or `if (!window.confirm("...")) return;`
    content = re.sub(r'if\s*\(!(?:window\.)?confirm\((.*?)\)\)\s*return;', r'if (!(await confirmDialog("Onay", \1))) return;', content)
    
    # Replace usages like `if (confirm("...")) {`
    content = re.sub(r'if\s*\((?:window\.)?confirm\((.*?)\)\)\s*\{', r'if (await confirmDialog("Onay", \1)) {', content)
    
    # Replace assignment like `const confirm = window.confirm("...");`
    content = re.sub(r'const\s+confirm\s*=\s*(?:window\.)?confirm\((.*?)\);', r'const confirmed = await confirmDialog("Onay", \1);', content)
    
    # In Settings.tsx, we need to change `if (!confirm) return;` to `if (!confirmed) return;`
    content = re.sub(r'if\s*\(!confirm\)\s*return;', r'if (!confirmed) return;', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Replacement complete.")
