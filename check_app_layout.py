import json

# Quick check: read the appI18n.ts to verify nav.revenue etc exist
with open('src/i18n/appI18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

keys = ['revenue','chargeItems','accountsReceivable','revenueAnalysis','costAccounting','financialReports']
for k in keys:
    search = "'nav." + k + "'"
    if search in content:
        idx = content.index(search)
        line_start = content.rfind('\n', 0, idx) + 1
        line_end = content.find('\n', idx)
        print('FOUND: ' + content[line_start:line_end].strip()[:120])
    else:
        print('MISSING from appI18n.ts: nav.' + k)

# Also check if AppLayout uses appI18n.t() or i18n.t()
with open('src/layouts/AppLayout.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Find the import for t()
t_imports = []
lines = app.split('\n')
for i, line in enumerate(lines):
    if 'import' in line and ('t' in line or 'i18n' in line or 'translate' in line):
        t_imports.append((i+1, line.strip()))
        
print('\nAppLayout t() imports:')
for ln, line in t_imports:
    print('  L' + str(ln) + ': ' + line)
