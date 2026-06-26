// 修复中文 escape
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/test-v40-e2e.mjs';
let c = fs.readFileSync(f, 'utf8');
// 系统管理员 -> 简化为 SYSTEM
c = c.replace('系统管理员', 'SysAdmin');
c = c.replace('信息科', 'ITDept');
c = c.replace('管理员', 'Admin');
fs.writeFileSync(f, c, 'utf8');
console.log('Fixed Chinese escapes');
