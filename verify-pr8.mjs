import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['POST', '/api/v1/eye/tele/session', { patientId: 'P000001', studyId: 'STU001', participants: ['D001', 'D002'], mode: 'video' }],
  ['GET', '/api/v1/eye/tele/turn', null],
  ['POST', '/api/v1/eye/tele/stream', { studyId: 'STU001', targetHospital: 'PUMC', protocol: 'dicom-tls' }],
  ['POST', '/api/v1/eye/tele/consult', { sessionId: 'SES001', specialistId: 'D005', question: 'test' }],
  ['POST', '/api/v1/eye/tele/answer', { consultId: 'CON001', opinion: 'No DR', recommendation: 'Follow up 6M' }],
  ['POST', '/api/v1/eye/optometry/refraction', { patientId: 'P000001', reSphere: -2.5, reCylinder: -0.75, reAxis: 180, leSphere: -2.75, leCylinder: -1.0, leAxis: 175, prescriptionType: '眼镜' }],
  ['POST', '/api/v1/eye/optometry/ok-lens', { patientId: 'P000001', k1: 43, k2: 43.5, kAxis: 180, targetReduction: 3 }],
  ['GET', '/api/v1/eye/optometry/vision-record/P000001', null],
  ['POST', '/api/v1/eye/optometry/order', { patientId: 'P000001', frame: 'Ray-Ban', lens: 'Essilor' }],
  ['GET', '/api/v1/eye/optometry/order/ORD001', null],
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
