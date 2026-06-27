// v3.0.6.8-48 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-47/g, '3.0.6.8-48');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-47/g, '3.0\.6\.8-48');
i = i.replace(
  'v3.0.6.8-48 · PR3 通知 + 模板 + 词典 (unread/markRead + 模板管理 + 字典维护) — 12 client + 20 端点',
  'v3.0.6.8-48 · PR4 初核 + 终核 + 复审 (approve/reject/override/score/assign) — 15 client + 41 端点'
);
i = i.replace(
  'v3.0.6.8-48 · PR3 Notification + Template + Dictionary (unread/markRead + template mgmt + dictionary mgmt) — 12 client + 20 endpoints',
  'v3.0.6.8-48 · PR4 Initial/Final Check + Review (approve/reject/override/score/assign) — 15 client + 41 endpoints'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v48');
