import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['POST', '/api/v1/eye/subspecialty/strabismus/synoptophore', { patientId: 'P000001', eye: 'OD', horizontalPrism: 10, verticalPrism: 0, torsion: 0 }],
  ['POST', '/api/v1/eye/subspecialty/strabismus/prism', { patientId: 'P000001', distance: 'near', horizontal: 15, vertical: 0 }],
  ['POST', '/api/v1/eye/subspecialty/neuro/color-vision', { patientId: 'P000001', test: 'ishihara', errors: 6, eye: 'OD' }],
  ['POST', '/api/v1/eye/subspecialty/neuro/pvep', { patientId: 'P000001', eye: 'OD', p100Latency: 130, p100Amplitude: 5.0 }],
  ['POST', '/api/v1/eye/subspecialty/oncology/exophthalmometry', { patientId: 'P000001', odValue: 18, osValue: 14, reference: 12 }],
  ['POST', '/api/v1/eye/subspecialty/cornea/pentacam', { patientId: 'P000001', eye: 'OD', kmax: 48, thinnestPachy: 460, pachyMin: 460, pachyMinX: 0, pachyMinY: -0.5 }],
  ['POST', '/api/v1/eye/subspecialty/cornea/bad', { patientId: 'P000001', eye: 'OD', badValue: 2.8 }],
  ['GET', '/api/v1/eye/contact-lens/inventory', null],
  ['POST', '/api/v1/eye/contact-lens/fitting', { patientId: 'P000001', lensType: 'RGP', brand: 'Bausch + Lomb', bc: 7.8, dia: 14, power: -3.0 }],
  ['POST', '/api/v1/eye/low-vision/prescription', { patientId: 'P000001', reDist: '0.1', reNear: '0.5', leDist: '0.08', leNear: '0.4', reDevice: '眼镜', leDevice: '眼镜', recommendation: '手持放大镜 4X' }],
];

let pass = 0, fail = 0;
for (const [method, url, body] of apis) {
  const r = await p.evaluate(async ({ method, url, body }) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    return { status: res.status, hasSuccess: text.includes('"success":true'), sample: text.slice(0, 100) };
  }, { method, url, body });
  const ok = r.status === 200 && r.hasSuccess;
  if (ok) { pass++; }
  else { fail++; console.log(`✗ ${method} ${url}: status=${r.status}`); }
}
console.log(`\n=== ${pass}/${pass + fail} 通过 ===`);
await b.close();
