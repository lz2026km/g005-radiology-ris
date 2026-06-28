const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-54/g, '3.0.6.8-55');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-54/g, '3.0.6.8-55');
i = i.replace(
  'v3.0.6.8-55 · 口腔 PACS 升级: 侧栏导航 + 影像列表 + 查看器 (CBCT/全景/根尖/口扫) — 对标 Sidexis/Romexis',
  'v3.0.6.8-55 · 口腔 PR2: 牙位关联 + 口扫 3D (Three.js) + 全景标注 — 对标 3Shape TRIOS'
);
i = i.replace(
  'v3.0.6.8-55 · Dental PACS Upgrade: sidebar nav + study list + viewer (CBCT/Panoramic/Periapical/Scan) — Sidexis/Romexis benchmark',
  'v3.0.6.8-55 · Dental PR2: Tooth linking + Scan 3D (Three.js) + Panoramic annotation — 3Shape TRIOS benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v55');
