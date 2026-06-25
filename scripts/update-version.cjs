const fs = require('fs');
const path = 'package.json';
let c = fs.readFileSync(path, 'utf8');
c = c.replace(/"version": "3.0.6.8-30"/g, '"version": "3.0.6.8-32"');
c = c.replace(/v3\.0\.6\.8-30[^\n]*/, 'v3.0.6.8-32 - 后端补充: 411 → 350-400 端点, 100% 主数据池覆盖, IndexedDB 持久化, RBAC + 限流 + 审计');
fs.writeFileSync(path, c);
console.log('done');
