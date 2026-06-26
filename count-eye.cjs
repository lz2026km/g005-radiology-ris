// 实际数 eyeHandlers 数组长度
const path = require('path');
const fs = require('fs');
const content = fs.readFileSync('E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/eyeHandlers.ts', 'utf8');
// 数 export const eyeHandlers = [ ... ]; 块
const match = content.match(/export const eyeHandlers = \[([\s\S]*?)\];/);
if (match) {
  const block = match[1];
  // 数 http. 出现次数 (包括在 flatMap 中的)
  const httpCount = (block.match(/http\.(get|post|put|delete)\(/g) || []).length;
  console.log('eyeHandlers 中 http. 总数:', httpCount);
  console.log('分模块:');
  // 各 module 名
  const modules = ['eyeRisModule', 'eyePacsModule', 'eyeEmrModule', 'eyeAiModule', 'eyeReportModule', 'eyeKpiModule', 'eyeSubspecialtyModule', 'eyePatientJourneyModule', 'eyeRbacModule'];
  for (const m of modules) {
    const re = new RegExp(`const ${m} = \\[([\\s\\S]*?)\\];`, 'g');
    const m1 = re.exec(content);
    if (m1) {
      const c = (m1[1].match(/http\.(get|post|put|delete)\(/g) || []).length;
      console.log(`  ${m}: ${c}`);
    }
  }
}
