import re
with open('src/routes/routeTable.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
all_paths = re.findall(r"path: '([^']+)'", content)
print('Total routes:', len(all_paths))
for p in sorted(all_paths):
    if 'write' in p.lower() or 'draft' in p.lower():
        print(f'  route: {p}')
# Check for report-related pages
lazy_pages = re.findall(r"const (\w+) = lazy\(", content)
for name in sorted(lazy_pages):
    if 'report' in name.lower() or 'write' in name.lower() or 'draft' in name.lower():
        print(f'  lazy page: {name}')
print('---')
# Check for ReportWritePage or similar
for name in sorted(lazy_pages):
    if 'write' in name.lower() or 'draft' in name.lower():
        print(f'  all write/draft pages: {name}')
