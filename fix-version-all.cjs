// 替换所有 v3.0.6.8-32 -> v3.0.6.8-33
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;
  c = c.replace(/3\.0\.6\.8-32/g, '3.0.6.8-33');
  fs.writeFileSync(f, c, 'utf8');
  console.log(f, ':', before === c ? 'NO CHANGE' : 'CHANGED');
}
