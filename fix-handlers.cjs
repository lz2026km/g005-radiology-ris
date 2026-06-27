// 修复 handlers.ts line 773 损坏的字符串
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts';
let c = fs.readFileSync(f, 'utf8');
// 修复 line 773 附近的乱码中文字符串
c = c.replace('byStatus[\'杩愯??涓?\']', "byStatus['运行中']");
c = c.replace('byStatus[\'寰呮満\']', "byStatus['空闲']");
c = c.replace('byStatus[\'缁存姢涓?\']', "byStatus['维护中']");
c = c.replace('byStatus[\'鏁呴殰\']', "byStatus['故障']");
fs.writeFileSync(f, c, 'utf8');
console.log('Fixed');
