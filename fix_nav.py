import json, os

# Read per-namespace nav files
for lng, locale_key in [('zh-CN', 'zh_CN'), ('en-US', 'en_US')]:
    nav_file = f'src/i18n/locales/{lng}/nav.json'
    flat_file = f'src/i18n/locales/{locale_key}.json'
    
    with open(nav_file, 'r', encoding='utf-8') as f:
        nav = json.load(f)
    
    with open(flat_file, 'r', encoding='utf-8') as f:
        flat = json.load(f)
    
    # Add all nav.* entries to flat file
    for k, v in nav.items():
        flat[f'nav.{k}'] = v
    
    with open(flat_file, 'w', encoding='utf-8') as f:
        json.dump(flat, f, ensure_ascii=False, indent=2)
    
    nav_count = sum(1 for k in flat if k.startswith('nav.'))
    print(f'{locale_key}.json: now has {len(flat)} total keys, {nav_count} nav.* keys')

print('\nDone. All nav keys restored to flat JSON files.')
