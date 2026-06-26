import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['GET', '/api/v1/eye/pixel/instance/frame-1', null],
  ['GET', '/api/v1/eye/pixel/instance/frame-1/raw', null],
  ['GET', '/api/v1/eye/pixel/colormap/fundus', null],
  ['POST', '/api/v1/eye/pixel/mpr', { studyId: 'STU001', axis: 'axial', seriesIds: ['f1','f2','f3'] }],
  ['POST', '/api/v1/eye/pixel/volume-render', { studyId: 'STU001', transferFunction: 'mip' }],
  ['POST', '/api/v1/eye/pixel/detect-artifact', { instanceId: 'frame-1' }],
  ['GET', '/api/v1/eye/pixel/histogram/frame-1', null],
  ['POST', '/api/v1/eye/pixel/sharpness', { instanceId: 'frame-1' }],
];

let passC = 0, failC = 0;
for (const [m, u, b2] of apis) {
  const r = await p.evaluate(async ({ m, u, b2 }) => {
    const opts = { method: m, headers: { 'Content-Type': 'application/json' } };
    if (b2) opts.body = JSON.stringify(b2);
    const res = await fetch(u, opts);
    const text = await res.text();
    return { status: res.status, has: text.includes('"success":true') };
  }, { m, u, b2 });
  if (r.status === 200 && r.has) { passC++; console.log('[PASS]', m, u); }
  else { failC++; console.log('[FAIL]', m, u, r.status); }
}
console.log('\nResult: ' + passC + '/' + (passC + failC));
await b.close();
