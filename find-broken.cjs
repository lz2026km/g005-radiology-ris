// 查找并修复乱码
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');
for (let i = 772; i < 778; i++) {
  if (lines[i].includes('杩')) {
    console.log('Line', i+1, 'before:', JSON.stringify(lines[i]).slice(0,80));
  }
}
