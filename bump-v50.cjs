// v3.0.6.8-50 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-49/g, '3.0.6.8-50');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-49/g, '3.0\.6\.8-50');
i = i.replace(
  'v3.0.6.8-50 · PR5 CA 签名 + 修订 (证书/吊销/时间戳/区块链 + 修订流程) — 15 client + 77 端点',
  'v3.0.6.8-50 · PR6 v3 报告全栈 (40 client + 194 端点: 写作/分发/集成/AI/质控/PACS/Analytics)'
);
i = i.replace(
  'v3.0.6.8-50 · PR5 CA Sign + Amend (certificate/revoke/timestamp/blockchain + amend flow) — 15 client + 77 endpoints',
  'v3.0.6.8-50 · PR6 v3 Report Full Stack (40 client + 194 endpoints: writing/dist/integration/AI/QC/PACS/Analytics)'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v50');
