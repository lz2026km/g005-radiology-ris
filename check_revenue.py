import json
with open('src/i18n/locales/zh_CN.json', 'r', encoding='utf-8') as f:
    cn = json.load(f)
key = 'nav.revenue'
val = cn.get(key)
print(f'Flat {key}: {val}')
if not val:
    print('MISSING! Adding...')
    cn[key] = '\u8425\u6536\u7ba1\u7406'
    with open('src/i18n/locales/zh_CN.json', 'w', encoding='utf-8') as f:
        json.dump(cn, f, ensure_ascii=False, indent=2)
    print('Added.')
