// 强制修复 - 用字节级替换
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/test-v40-e2e.mjs';
let c = fs.readFileSync(f, 'utf8');
// 替换 corrupt 部分 - 整个 setItem 行
const oldLine = "await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理�?,role:'管理�?,department:'信息�?})));";
console.log('Looking for line length:', oldLine.length);
const newLine = "await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'Admin',department:'IT'})));";
if (c.includes(oldLine)) {
  c = c.replace(oldLine, newLine);
  fs.writeFileSync(f, c, 'utf8');
  console.log('Replaced');
} else {
  console.log('Not found, trying alt approach');
  // 找包含 setItem 行
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setItem') && lines[i].includes('A001')) {
      console.log('Found line', i, ':', lines[i].slice(0, 100));
      lines[i] = newLine;
    }
  }
  fs.writeFileSync(f, lines.join('\n'), 'utf8');
  console.log('Alt replaced');
}
