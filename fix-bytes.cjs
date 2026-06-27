// Byte-level 修复 line 773 的乱码
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts';
const buf = fs.readFileSync(f);
let c = buf.toString('utf8');

// 修复运行中 (3 chars = 9 bytes)
c = c.replace(/byStatus\['杩愯??涓?\]/g, "byStatus['运行中']");
// 修复空闲
c = c.replace(/byStatus\['寰呮満'\]/g, "byStatus['空闲']");
// 修复维护中
c = c.replace(/byStatus\['缁存姢涓?\]/g, "byStatus['维护中']");
// 修复故障
c = c.replace(/byStatus\['鏁呴殰'\]/g, "byStatus['故障']");

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed line 773');
