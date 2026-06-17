import json, re
with open('src/routes/sidebarConfig.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
nav_keys = set(re.findall(r"labelKey: '([^']+)'", content))
with open('src/i18n/locales/zh_CN.json', 'r', encoding='utf-8') as f:
    cn = json.load(f)
missing = [k for k in sorted(nav_keys) if k not in cn]
if missing:
    print('STILL MISSING: ' + str(len(missing)) + ' keys')
    for k in missing:
        print('  ' + k)
else:
    print('ALL ' + str(len(nav_keys)) + ' sidebar keys present!')
if 'nav.writeReport' in cn:
    print('writeReport: ' + cn['nav.writeReport'])
else:
    print('writeReport MISSING!')
