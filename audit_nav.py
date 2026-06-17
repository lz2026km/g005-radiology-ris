import json, re, os

# 1. Get ALL nav labelKeys from sidebarConfig
with open('src/routes/sidebarConfig.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
nav_keys = set(re.findall(r"labelKey: '([^']+)'", content))
print(f'Sidebar labelKeys total: {len(nav_keys)}')

# 2. Check zh_CN.json (flat)
with open('src/i18n/locales/zh_CN.json', 'r', encoding='utf-8') as f:
    cn = json.load(f)
missing = [k for k in sorted(nav_keys) if k not in cn]
if missing:
    print(f'MISSING from zh_CN.json ({len(missing)}):')
    for k in missing:
        print(f'  {k}')
else:
    print('ALL sidebar keys present in zh_CN.json')

# 3. Check per-namespace nav.json
with open('src/i18n/locales/zh-CN/nav.json', 'r', encoding='utf-8') as f:
    nav = json.load(f)
ns_keys = [k.replace('nav.', '') for k in nav_keys]
missing_ns = [k for k in ns_keys if k not in nav]
if missing_ns:
    print(f'MISSING from zh-CN/nav.json ({len(missing_ns)}):')
    for k in missing_ns[:20]:
        print(f'  nav.{k}')
else:
    print('ALL sidebar keys present in zh-CN/nav.json')
print(f'Per-ns nav.json has {len(nav)} keys')

# 4. Check section keys specifically
sections = re.findall(r"section: '([^']+)'", content)
print(f'\nSection keys ({len(sections)}):')
section_missing = [s for s in sections if s not in cn]
if section_missing:
    print(f'  Missing from flat: {section_missing}')
else:
    print('  All section keys present in flat zh_CN.json')

# 5. Verify writeReport is in sidebar
if 'writeReport' in content:
    print('\nwriteReport IS in sidebarConfig')
else:
    print('\nwriteReport IS NOT in sidebarConfig!')

# 6. Show all section keys
for s in sections:
    val = cn.get(s, 'MISSING')
    print(f'  Section {s}: {val}')
