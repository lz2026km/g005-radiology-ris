import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['POST', '/api/v1/eye/pacs/viewport/init', { studyId: 'STU001', modality: 'fundus', imageIds: ['f1','f2','f3'] }],
  ['GET', '/api/v1/eye/pacs/viewport/preset/fundus', null],
  ['GET', '/api/v1/eye/pacs/viewport/preset/oct', null],
  ['GET', '/api/v1/eye/pacs/viewport/preset/ffa', null],
  ['GET', '/api/v1/eye/pacs/viewport/preset/visualfield', null],
  ['GET', '/api/v1/eye/pacs/viewport/preset/topography', null],
  ['POST', '/api/v1/eye/pacs/measurement', { studyId: 'STU001', measurementType: 'Length', value: 3.45, unit: 'mm', coordinates: [[100,200],[300,400]], text: '视盘到黄斑' }],
  ['GET', '/api/v1/eye/pacs/measurement/STU001', null],
  ['POST', '/api/v1/eye/pacs/measurement/export-sr', { studyId: 'STU001', measurements: [{ measurementType: 'Length', value: 3.45, unit: 'mm' }] }],
  ['POST', '/api/v1/eye/pacs/windowing/preset', { studyId: 'STU001', preset: '视盘', modality: 'fundus' }],
  ['POST', '/api/v1/eye/pacs/annotation', { studyId: 'STU001', annotationType: 'TextMarker', text: '视盘中心', coordinates: [[150, 150]], color: '#ff4d4f' }],
  ['GET', '/api/v1/eye/pacs/annotation/STU001', null],
  ['POST', '/api/v1/eye/pacs/frame/load', { studyId: 'STU001', frameIndex: 5, totalFrames: 30 }],
];

let pass = 0, fail = 0;
for (const [method, url, body] of apis) {
  const r = await p.evaluate(async ({ method, url, body }) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    return { status: res.status, hasSuccess: text.includes('"success":true'), sample: text.slice(0, 200) };
  }, { method, url, body });
  const ok = r.status === 200 || r.status === 201;
  if (ok && r.hasSuccess) { pass++; }
  else { fail++; console.log(`✗ ${method} ${url}: status=${r.status}`); }
}
console.log(`\n=== ${pass}/${pass + fail} 通过 ===`);
await b.close();
