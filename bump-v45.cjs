// v3.0.6.8-45 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-44/g, '3.0.6.8-45');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-44/g, '3.0.6.8-45');
i = i.replace(
  'v3.0.6.8-45 · 眼科 PR11: 视光中心闭环 (OK 镜/离焦镜/近视防控 + 5 年追踪) — 对标 视光中心',
  'v3.0.6.8-45 · PR1 报告流程核心 (submit/review/sign/reject/revise + cosign/diff/auditTrail) — 8 端点'
);
i = i.replace(
  'v3.0.6.8-45 · Eye PR11: Optometry Closed-Loop (OK lens / defocus / myopia control + 5yr tracking) — Optometry chain benchmark',
  'v3.0.6.8-45 · PR1 Report Workflow Core (submit/review/sign/reject/revise + cosign/diff/auditTrail) — 8 endpoints'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v45');
