const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-53/g, '3.0.6.8-54');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-53/g, '3.0.6.8-54');
i = i.replace(
  'v3.0.6.8-54 · 口腔专科 Day 1: PACS (CBCT/全景/根尖/口扫 24 端点) — 对标 3Shape/Sirona/Planmeca',
  'v3.0.6.8-54 · 口腔 PACS 升级: 侧栏导航 + 影像列表 + 查看器 (CBCT/全景/根尖/口扫) — 对标 Sidexis/Romexis'
);
i = i.replace(
  'v3.0.6.8-54 · Dental PACS Day 1 (CBCT/Panoramic/Periapical/Scan 24 endpoints) — 3Shape/Sirona/Planmeca benchmark',
  'v3.0.6.8-54 · Dental PACS Upgrade: sidebar nav + study list + viewer (CBCT/Panoramic/Periapical/Scan) — Sidexis/Romexis benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v54');
