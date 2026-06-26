// v3.0.6.8-35 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-34/g, '3.0.6.8-35');
  c = c.replace(/3\.0\.6\.8-33/g, '3.0.6.8-35');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-34/g, '3.0.6.8-35');
i = i.replace(/3\.0\.6\.8-33/g, '3.0.6.8-35');
i = i.replace(
  'v3.0.6.8-35 · 眼科 PR1: 真实 DICOM 渲染 (cornerstone3D 8 模态 + 标注 + DICOM-SR TID 1500) — 对标 ZEISS FORUM / HEYEX 2',
  'v3.0.6.8-35 · 眼科 PR2: 报告 AI 辅助 (10 病种 STT + NLP 提取 + AI 续写 + 多轮改写) — 对标 Nuance PowerScribe / Medisoft'
);
i = i.replace(
  'v3.0.6.8-35 · Eye PR1: Real DICOM Rendering (cornerstone3D 8 modalities + annotations + DICOM-SR TID 1500) — ZEISS FORUM / HEYEX 2 benchmark',
  'v3.0.6.8-35 · Eye PR2: Report AI Assistant (10 disease STT + NLP extraction + AI continuation + multi-turn rewrite) — Nuance PowerScribe / Medisoft benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v35');
