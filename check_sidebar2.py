import re
with open('src/routes/sidebarConfig.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find section labels
sections = re.findall(r"section: '([^']+)'", content)
print(f'Sidebar sections: {len(sections)}')
for s in sections:
    print(f'  {s}')

# Find all paths with labelKeys
items = re.findall(r"\{ path: '([^']+)',[^}]+labelKey: '([^']+)'", content)
print(f'\nSidebar items: {len(items)}')
for path, label in items:
    print(f'  {path} -> {label}')
