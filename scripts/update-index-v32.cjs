const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
c = c.replace(/v3\.0\.6\.8-31[^\n]*/g, 'v3.0.6.8-32 - 后端补充: 411 → 350+ 端点, 主数据池接入, IndexedDB 持久化');
c = c.replace(/console\.error\('\[v3\.0\.6\.8-31\]/g, "console.error('[v3.0.6.8-32]");
c = c.replace(/window\.__appVersion = 'v3\.0\.6\.8-31'/g, "window.__appVersion = 'v3.0.6.8-32'");
c = c.replace(/v3\.0\.6\.8-25[^\n]*/g, 'v3.0.6.8-32: 后端增强 - 接入主数据池 + IndexedDB 持久化');
fs.writeFileSync('index.html', c);
console.log('updated');
