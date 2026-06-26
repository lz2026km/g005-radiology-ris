// v3.0.6.8-37 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-36/g, '3.0.6.8-37');
  c = c.replace(/3\.0\.6\.8-35/g, '3.0.6.8-37');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-36/g, '3.0.6.8-37');
i = i.replace(/3\.0\.6\.8-35/g, '3.0.6.8-37');
i = i.replace(
  'v3.0.6.8-37 · 眼科 PR3: IOL 规划 (Barrett II / Kane / Hill-RBF 真实常数 + Toric 散光 + 术后预测) — 对标 ZEISS IOLMaster 700',
  'v3.0.6.8-37 · 眼科 PR4: 8 亚专科纵深 (5 专科量表 + 接触镜 + 低视力) — 对标 Medisoft mediSIGHT'
);
i = i.replace(
  'v3.0.6.8-37 · Eye PR3: IOL Planning (Barrett II / Kane / Hill-RBF real constants + Toric + postop prediction) — ZEISS IOLMaster 700 benchmark',
  'v3.0.6.8-37 · Eye PR4: 8 subspecialty depth (5 specialty scales + contact lens + low vision) — Medisoft mediSIGHT benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v37');
