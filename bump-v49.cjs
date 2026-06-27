// v3.0.6.8-49 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-48/g, '3.0.6.8-49');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-48/g, '3.0\.6\.8-49');
i = i.replace(
  'v3.0.6.8-49 · PR4 初核 + 终核 + 复审 (approve/reject/override/score/assign) — 15 client + 41 端点',
  'v3.0.6.8-49 · PR5 CA 签名 + 修订 (证书/吊销/时间戳/区块链 + 修订流程) — 15 client + 77 端点'
);
i = i.replace(
  'v3.0.6.8-49 · PR4 Initial/Final Check + Review (approve/reject/override/score/assign) — 15 client + 41 endpoints',
  'v3.0.6.8-49 · PR5 CA Sign + Amend (certificate/revoke/timestamp/blockchain + amend flow) — 15 client + 77 endpoints'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v49');
