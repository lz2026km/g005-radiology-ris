// 直接读 line 773 byte 然后替换
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts';
const buf = fs.readFileSync(f);
const c = buf.toString('utf8');
const lines = c.split('\n');
const line = lines[772]; // 0-indexed = 773
console.log('Hex of broken part:');
// 找 杩 的位置
const idx = line.indexOf('杩');
console.log('Index of 杩:', idx);
if (idx >= 0) {
  console.log('Bytes around:', line.slice(idx, idx + 15).split('').map(c => c.charCodeAt(0).toString(16)).join(' '));
}
