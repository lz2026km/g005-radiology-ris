// 修复 line 773-777 的损坏字符串
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');
// 修复 line 773-777 (0-indexed: 772-776)
for (let i = 772; i <= 776; i++) {
  lines[i] = lines[i]
    .replace("byStatus['杩愯??涓?']", "byStatus['运行中']")
    .replace("byStatus['寰呮満']", "byStatus['空闲']")
    .replace("byStatus['缁存姢涓?']", "byStatus['维护中']")
    .replace("byStatus['鏁呴殰']", "byStatus['故障']");
}
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('Fixed lines 773-777');
