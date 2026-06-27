import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['POST', '/api/v1/eye/optometry/screening', { patientId: 'P000099', age: 10, parentRefraction: { reSphere: -4, leSphere: -3.5 } }],
  ['GET', '/api/v1/eye/optometry/refraction-curve/P000099', null],
  ['POST', '/api/v1/eye/optometry/ok-trial', { patientId: 'P000099', trialLensId: 'TRIAL-A1', fluoresceinPattern: 'bulls-eye' }],
  ['POST', '/api/v1/eye/optometry/ortho-k-order', { patientId: 'P000099', design: { baseCurve: 7.8, brand: 'Euclid' }, prescriptionId: 'PRES001' }],
  ['POST', '/api/v1/eye/optometry/defocus-order', { patientId: 'P000099', frameSelection: 'Ray-Ban', lensType: 'DIMS' }],
  ['POST', '/api/v1/eye/optometry/followup', { patientId: 'P000099', visitType: '1w', visionUCVA: { od: '1.0', os: '1.0' }, cornealHealth: 'normal' }],
  ['GET', '/api/v1/eye/optometry/stats', null],
  ['GET', '/api/v1/eye/optometry/order-status/OKO001', null],
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
