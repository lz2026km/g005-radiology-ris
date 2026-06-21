import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync('test-reports/deep-test-report.json', 'utf-8'));

const stats = {};
r.forEach(x => { stats[x.status] = (stats[x.status] || 0) + 1; });
console.log('Total:', r.length);
console.log('Stats:', JSON.stringify(stats));
console.log();
console.log('=== Failed pages (DEAD_BTN) ===');
r.filter(x => x.status === 'DEAD_BTN').forEach(x => {
  console.log('[' + x.idx + '] ' + x.name + ' (' + x.urlPath + ')');
  console.log('   Dead(' + x.deadButtons.length + '): ' + x.deadButtons.map(b => '"' + b.text + '"').join(', '));
});
console.log();
console.log('=== Pages with errors ===');
r.filter(x => x.errors.length > 0).forEach(x => {
  console.log('[' + x.idx + '] ' + x.name + ' (' + x.urlPath + ') - ' + x.errors.length + ' errors');
  const uniq = [...new Set(x.errors.map(e => e.substring(0, 120)))];
  uniq.forEach(e => console.log('   * ' + e));
});
