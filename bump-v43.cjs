// v3.0.6.8-43 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-42/g, '3.0.6.8-43');
  c = c.replace(/3\.0\.6\.8-32/g, '3.0.6.8-43');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-42/g, '3.0.6.8-43');
i = i.replace(/3\.0\.6\.8-32/g, '3.0.6.8-43');
i = i.replace(
  'v3.0.6.8-43 · 眼科 PR9: 教学病例库 (DICOM 标注 + SR 导出 + 科研脱敏) — 对标 Heidelberg 病例库',
  'v3.0.6.8-43 · 眼科 PR10: 真实 DICOM 像素渲染 (Canvas + WebGL + 直方图 + 锐度 + MPR) — 对标 ZEISS FORUM / HEYEX 2'
);
i = i.replace(
  'v3.0.6.8-43 · Eye PR9: Case Library (DICOM annotation + SR export + research de-id) — Heidelberg library benchmark',
  'v3.0.6.8-43 · Eye PR10: Real DICOM Pixel Rendering (Canvas + WebGL + histogram + sharpness + MPR) — ZEISS FORUM / HEYEX 2 benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v43');
