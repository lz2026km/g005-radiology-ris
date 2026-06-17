import json, re, os

with open('src/routes/sidebarConfig.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

used_keys = set(re.findall(r"labelKey: '([^']+)'", content))
print('Total labelKeys used:', len(used_keys))

nav_keys = sorted([k for k in used_keys if k.startswith('nav.')])
print('nav.* keys:', len(nav_keys))

with open('src/i18n/locales/zh_CN.json', 'r', encoding='utf-8') as f:
    cn = json.load(f)
with open('src/i18n/locales/en_US.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

missing_cn = [k for k in nav_keys if k not in cn]
missing_en = [k for k in nav_keys if k not in en]

if missing_cn:
    print(f'\nMISSING from zh_CN.json ({len(missing_cn)}):')
    for k in missing_cn:
        print(f'  {k}')
else:
    print('\nAll nav.* keys present in zh_CN.json')

if missing_en:
    print(f'\nMISSING from en_US.json ({len(missing_en)}):')
    for k in missing_en:
        print(f'  {k}')
else:
    print('All nav.* keys present in en_US.json')

# Check per-namespace files
for lng in ['zh-CN', 'en-US']:
    nf = f'src/i18n/locales/{lng}/nav.json'
    if os.path.exists(nf):
        with open(nf, 'r', encoding='utf-8') as f:
            nav = json.load(f)
        missing = [k.replace('nav.', '') for k in nav_keys if k.replace('nav.', '') not in nav]
        if missing:
            print(f'\nMISSING from {lng}/nav.json ({len(missing)}):')
            for k in missing[:5]:
                print(f'  nav.{k}')
            if len(missing) > 5:
                print(f'  ... and {len(missing)-5} more')
        else:
            print(f'All nav keys present in {lng}/nav.json')
