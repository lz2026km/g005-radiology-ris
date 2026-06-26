// v3.0.6.8-36 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-35/g, '3.0.6.8-36');
  c = c.replace(/3\.0\.6\.8-34/g, '3.0.6.8-36');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-35/g, '3.0.6.8-36');
i = i.replace(/3\.0\.6\.8-34/g, '3.0.6.8-36');
i = i.replace(
  'v3.0.6.8-36 · 眼科 PR2: 报告 AI 辅助 (10 病种 STT + NLP 提取 + AI 续写 + 多轮改写) — 对标 Nuance PowerScribe / Medisoft',
  'v3.0.6.8-36 · 眼科 PR3: IOL 规划 (Barrett II / Kane / Hill-RBF 真实常数 + Toric 散光 + 术后预测) — 对标 ZEISS IOLMaster 700'
);
i = i.replace(
  'v3.0.6.8-36 · Eye PR2: Report AI Assistant (10 disease STT + NLP extraction + AI continuation + multi-turn rewrite) — Nuance PowerScribe / Medisoft benchmark',
  'v3.0.6.8-36 · Eye PR3: IOL Planning (Barrett II / Kane / Hill-RBF real constants + Toric + postop prediction) — ZEISS IOLMaster 700 benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v36');
