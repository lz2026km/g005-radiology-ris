// 修复 fail 变量名
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/test-v40-e2e.mjs';
let c = fs.readFileSync(f, 'utf8');
// 重命名函数和变量: fail -> failT
c = c.replace(/\bfail\(/g, 'failT(');
c = c.replace(/let pass = 0, fail = 0;/g, 'let passCount = 0, failCount = 0;');
c = c.replace(/let passCount = 0, failCount = 0;/g, 'let passC = 0, failC = 0;');
c = c.replace(/pass\+\+;/g, 'passC++;');
c = c.replace(/fail\+\+;/g, 'failC++;');
c = c.replace(/results\.filter\(r => r\.status === 'FAIL'\)/g, "results.filter(r => r.status === 'FAIL')");
c = c.replace(/failed: 30\)/g, 'failed: 30)');
c = c.replace(/failed:/g, 'failC:');
// 输出
c = c.replace(/\\$\\{failed: 30\\}/g, '${failC}');
fs.writeFileSync(f, c, 'utf8');
console.log('Fixed');
