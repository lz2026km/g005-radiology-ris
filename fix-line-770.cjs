// 完整重写 line 770-777
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');
// 替换 770-777 (8 行)
const replacement = [
  '    }',
  '    return HttpResponse.json({ success: true, data: {',
  '      total: all.length,',
  "      inUse: byStatus['运行中'] || 0,",
  "      idle: byStatus['空闲'] || 0,",
  "      maintenance: byStatus['维护中'] || 0,",
  "      broken: byStatus['故障'] || 0,",
  '      byStatus, byModality, byGrade,',
];
lines.splice(770, 8, ...replacement);
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('Lines 770-777 replaced');
