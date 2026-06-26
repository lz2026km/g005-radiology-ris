// v3.0.6.8-41 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-40/g, '3.0.6.8-41');
  c = c.replace(/3\.0\.6\.8-32/g, '3.0.6.8-41');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-40/g, '3.0.6.8-41');
i = i.replace(/3\.0\.6\.8-32/g, '3.0.6.8-41');
i = i.replace(
  'v3.0.6.8-41 · 眼科 PR5-7: AI 模型 12 + 影像 QC AI + 多模态融合 (4 路 Late Fusion) — 对标 Airdoc/HEYEX 2/Zeiss',
  'v3.0.6.8-41 · 眼科 PR8: 远程眼科 (WebRTC + 5G 边缘 + 视光中心 OK 镜) — 对标 Topcon Harmony/Biotronics3D'
);
i = i.replace(
  'v3.0.6.8-41 · Eye PR5-7: AI models 12 + Imaging QC AI + Multimodal Fusion (4-way Late Fusion) — Airdoc/HEYEX 2/Zeiss benchmark',
  'v3.0.6.8-41 · Eye PR8: Tele-ophthalmology (WebRTC + 5G edge + Optometry OK lens) — Topcon Harmony/Biotronics3D benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v41');
