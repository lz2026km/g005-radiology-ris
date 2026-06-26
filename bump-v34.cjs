// v3.0.6.8-34 升级版本号
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;
  c = c.replace(/3\.0\.6\.8-33/g, '3.0.6.8-34');
  c = c.replace(/3\.0\.6\.8-32/g, '3.0.6.8-34');
  fs.writeFileSync(f, c, 'utf8');
  console.log(f, ':', before === c ? 'NO CHANGE' : 'CHANGED');
}
// appI18n.ts 版本说明升级
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-33/g, '3.0.6.8-34');
i = i.replace(/3\.0\.6\.8-32/g, '3.0.6.8-34');
i = i.replace(
  'v3.0.6.8-34 · 眼科专科增强 — 8 Module + 178 端点 + 28 集合 + 35 RBAC 资源点 (对标 Topcon Synergy + Medisoft mediSIGHT)',
  'v3.0.6.8-34 · 眼科 PR1: 真实 DICOM 渲染 (cornerstone3D 8 模态 + 标注 + DICOM-SR TID 1500) — 对标 ZEISS FORUM / HEYEX 2'
);
i = i.replace(
  'v3.0.6.8-34 · Eye Specialty Enhancement — 8 modules + 178 endpoints + 28 collections + 35 RBAC points (Topcon Synergy + Medisoft mediSIGHT benchmark)',
  'v3.0.6.8-34 · Eye PR1: Real DICOM Rendering (cornerstone3D 8 modalities + annotations + DICOM-SR TID 1500) — ZEISS FORUM / HEYEX 2 benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log(i18n, ': UPDATED');
