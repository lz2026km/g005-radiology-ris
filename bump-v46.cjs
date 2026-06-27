// v3.0.6.8-46 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-45/g, '3.0.6.8-46');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-45/g, '3.0.6.8-46');
i = i.replace(
  'v3.0.6.8-46 · PR1 报告流程核心 (submit/review/sign/reject/revise + cosign/diff/auditTrail) — 8 端点',
  'v3.0.6.8-46 · PR2 患者 + 设备 CRUD (getById/exams/reports/timeline + create/update + 维护) — 22 client + 14 端点'
);
i = i.replace(
  'v3.0.6.8-46 · PR1 Report Workflow Core (submit/review/sign/reject/revise + cosign/diff/auditTrail) — 8 endpoints',
  'v3.0.6.8-46 · PR2 Patient + Device CRUD (getById/exams/reports/timeline + create/update + maintenance) — 22 client + 14 endpoints'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v46');
