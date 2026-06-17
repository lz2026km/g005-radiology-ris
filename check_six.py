import json, re, os

keys = ['revenue', 'chargeItems', 'accountsReceivable', 'revenueAnalysis', 'costAccounting', 'financialReports']
flat_names = ['nav.' + k for k in keys]

# 1. Check flat zh_CN.json
with open('src/i18n/locales/zh_CN.json', 'r', encoding='utf-8') as f:
    cn = json.load(f)
print('=== zh_CN.json (flat) ===')
for k in flat_names:
    print(f'  {k}: {cn.get(k, "MISSING")!r}')

# 2. Check per-namespace zh-CN/nav.json
with open('src/i18n/locales/zh-CN/nav.json', 'r', encoding='utf-8') as f:
    nav_cn = json.load(f)
print('\n=== zh-CN/nav.json (per-ns) ===')
for k in keys:
    print(f'  nav.{k}: {nav_cn.get(k, "MISSING")!r}')

# 3. Check en locale
with open('src/i18n/locales/en_US.json', 'r', encoding='utf-8') as f:
    en = json.load(f)
print('\n=== en_US.json (flat) ===')
for k in flat_names:
    print(f'  {k}: {en.get(k, "MISSING")!r}')

# 4. Check sidebar section definition
with open('src/routes/sidebarConfig.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
# Find the revenue section
start = content.find("section: 'nav.revenue'")
if start >= 0:
    end = content.find(']', start + 50) + 2
    print('\n=== Sidebar revenue section ===')
    print(content[start:end])

# 5. Check how sections are rendered in AppLayout
with open('src/layouts/AppLayout.tsx', 'r', encoding='utf-8') as f:
    app = f.read()
# Find how section label is rendered
if 'nav.revenue' in app:
    print('\nnav.revenue referenced in AppLayout.tsx')
else:
    print('\nnav.revenue NOT found in AppLayout.tsx - might use Layout.tsx')
    
# 6. Check Layout.tsx for section rendering
with open('src/components/layout/Layout.tsx', 'r', encoding='utf-8') as f:
    layout = f.read()
if 'nav.revenue' in layout:
    print('nav.revenue referenced in Layout.tsx')
else:
    print('nav.revenue NOT found in Layout.tsx')
    
# Check how sidebar sections are rendered - look for t() or section usage
t_calls = re.findall(r"t\(['\"]?(nav\.[^'\"]+)['\"]?\)", layout)
print(f'\nt() calls for nav keys in Layout.tsx: {len(t_calls)}')
for tc in t_calls:
    print(f'  {tc}')
