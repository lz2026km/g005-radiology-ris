const fs = require('fs');
let c = fs.readFileSync('E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts', 'utf8');
const lines = c.split('\n');
lines[772] = "      inUse: byStatus['\u8fd0\u884c\u4e2d'] || 0,";
lines[773] = "      idle: byStatus['\u7a7a\u95f2'] || 0,";
lines[774] = "      maintenance: byStatus['\u7ef4\u62a4\u4e2d'] || 0,";
lines[775] = "      broken: byStatus['\u6545\u969c'] || 0,";
fs.writeFileSync('E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts', lines.join('\n'), 'utf8');
console.log('Fixed lines 773-776');
