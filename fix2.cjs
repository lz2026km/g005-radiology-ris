const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/test-v40-e2e.mjs';
let c = fs.readFileSync(f, 'utf8');
c = c.replace('A001', 'A001');
c = c.replace("'系统管理�?'", "'SysAdmin'");
c = c.replace("'管理�?'", "'Admin'");
c = c.replace("'信息�?'", "'IT'");
fs.writeFileSync(f, c, 'utf8');
console.log('Done');
