// v3.0.6.8-38,39,40 合并升级 (PR 5+6+7)
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-37/g, '3.0.6.8-40');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-37/g, '3.0.6.8-40');
i = i.replace(
  'v3.0.6.8-40 · 眼科 PR4: 8 亚专科纵深 (5 专科量表 + 接触镜 + 低视力) — 对标 Medisoft mediSIGHT',
  'v3.0.6.8-40 · 眼科 PR5-7: AI 模型 12 + 影像 QC AI + 多模态融合 (4 路 Late Fusion) — 对标 Airdoc/HEYEX 2/Zeiss'
);
i = i.replace(
  'v3.0.6.8-40 · Eye PR4: 8 subspecialty depth (5 specialty scales + contact lens + low vision) — Medisoft mediSIGHT benchmark',
  'v3.0.6.8-40 · Eye PR5-7: AI models 12 + Imaging QC AI + Multimodal Fusion (4-way Late Fusion) — Airdoc/HEYEX 2/Zeiss benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v40');
