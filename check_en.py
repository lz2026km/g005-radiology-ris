import json
for fname in ['zh_CN.json', 'en_US.json']:
    with open(f'src/i18n/locales/{fname}', 'r', encoding='utf-8') as f:
        data = json.load(f)
    val = data.get('nav.revenue', 'MISSING')
    print(f'{fname} nav.revenue: {val}')
