// v3.0.6.8-53 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-52/g, '3.0.6.8-53');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-52/g, '3.0.6.8-53');
i = i.replace(
  'v3.0.6.8-53 · 眼科 PR5-7: AI 模型 12 + 影像 QC AI + 多模态融合 (4 路 Late Fusion) — 对标 Airdoc/HEYEX 2/Zeiss',
  'v3.0.6.8-53 · 口腔专科 Day 1: PACS (CBCT/全景/根尖/口扫 24 端点) — 对标 3Shape/Sirona/Planmeca'
);
i = i.replace(
  'v3.0.6.8-53 · Eye PR5-7: AI models 12 + Imaging QC AI + Multimodal Fusion (4-way Late Fusion) — Airdoc/HEYEX 2/Zeiss benchmark',
  'v3.0.6.8-53 · Dental PACS Day 1 (CBCT/Panoramic/Periapical/Scan 24 endpoints) — 3Shape/Sirona/Planmeca benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v53');
