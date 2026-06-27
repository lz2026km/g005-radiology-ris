// v3.0.6.8-44 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-43/g, '3.0.6.8-44');
  c = c.replace(/3\.0\.6\.8-32/g, '3.0.6.8-44');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-43/g, '3.0.6.8-44');
i = i.replace(/3\.0\.6\.8-32/g, '3.0.6.8-44');
i = i.replace(
  'v3.0.6.8-44 · 眼科 PR10: 真实 DICOM 像素渲染 (Canvas + WebGL + 直方图 + 锐度 + MPR) — 对标 ZEISS FORUM / HEYEX 2',
  'v3.0.6.8-44 · 眼科 PR11: 视光中心闭环 (OK 镜/离焦镜/近视防控 + 5 年追踪) — 对标 视光中心'
);
i = i.replace(
  'v3.0.6.8-44 · Eye PR10: Real DICOM Pixel Rendering (Canvas + WebGL + histogram + sharpness + MPR) — ZEISS FORUM / HEYEX 2 benchmark',
  'v3.0.6.8-44 · Eye PR11: Optometry Closed-Loop (OK lens / defocus / myopia control + 5yr tracking) — Optometry chain benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v44');
