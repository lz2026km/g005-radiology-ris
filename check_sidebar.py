import re
with open('src/routes/sidebarConfig.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
count = content.count('writeReport')
print(f'Total writeReport occurrences: {count}')
if count == 0:
    print('writeReport is NOT in sidebarConfig!')
    # Check what report writing paths exist
    paths = re.findall(r"path: '([^']+)'", content)
    for p in sorted(paths):
        if 'report' in p.lower() or 'write' in p.lower() or 'draft' in p.lower():
            print(f'  related path: {p}')
