import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const PATIENT_ID = 'P000001';
const DEVICE_ID = 'DEV-CT-001';
const apis = [
  // 患者 11 端点
  ['GET', '/api/v1/patients?pageSize=5', null],
  ['GET', '/api/v1/patients/' + PATIENT_ID, null],
  ['GET', '/api/v1/patients/' + PATIENT_ID + '/exams', null],
  ['GET', '/api/v1/patients/' + PATIENT_ID + '/reports', null],
  ['GET', '/api/v1/patients/' + PATIENT_ID + '/timeline', null],
  ['GET', '/api/v1/patients/stats', null],
  ['GET', '/api/v1/patients/by-modality/CT', null],
  ['GET', '/api/v1/patients/by-status/active', null],
  ['GET', '/api/v1/patients/export.csv', 'csv'],
  ['POST', '/api/v1/patients/bulk-import', { patients: [{ name: 'Test', gender: 'M', age: 30 }] }],
  ['POST', '/api/v1/patients', { name: 'Test Patient v46', gender: 'M', age: 25 }],
  ['PUT', '/api/v1/patients/' + PATIENT_ID, { diagnosis: 'test update v46' }],
  // 设备 11 端点
  ['GET', '/api/v1/devices', null],
  ['GET', '/api/v1/devices/' + DEVICE_ID, null],
  ['PUT', '/api/v1/devices/' + DEVICE_ID + '/status', { status: 'maintenance' }],
  ['GET', '/api/v1/devices/stats/today', null],
  ['GET', '/api/v1/devices/schedule', null],
  ['GET', '/api/v1/devices/stats', null],
  ['GET', '/api/v1/devices/by-modality/CT', null],
  ['GET', '/api/v1/devices/' + DEVICE_ID + '/maintenance-history', null],
  ['GET', '/api/v1/devices/workload?days=7', null],
  ['GET', '/api/v1/devices/' + DEVICE_ID + '/qrcode', null],
  ['POST', '/api/v1/devices/' + DEVICE_ID + '/maintenance', { reason: 'PR2 v46 trigger' }],
  ['POST', '/api/v1/devices', { code: 'NEW-001', name: '新设备 v46', modality: 'CT' }],
  ['PUT', '/api/v1/devices/' + DEVICE_ID, { name: 'GE Revolution CT (v46 updated)' }],
];

let passC = 0, failC = 0;
for (const [m, u, b2] of apis) {
  const isCsv = b2 === 'csv';
  const r = await p.evaluate(async ({ m, u, b2, isCsv }) => {
    const opts = { method: m, headers: { 'Content-Type': 'application/json' } };
    if (b2 && !isCsv) opts.body = JSON.stringify(b2);
    const res = await fetch(u, opts);
    const text = await res.text();
    return {
      status: res.status,
      has: isCsv ? text.startsWith('id,') : (text.includes('"success":true') || text.includes('"data"'))
    };
  }, { m, u, b2: isCsv ? null : b2, isCsv });
  if ((r.status === 200 || r.status === 201) && r.has) { passC++; }
  else { failC++; console.log('[FAIL]', m, u, r.status, r.has); }
}
console.log('Result: ' + passC + '/' + (passC + failC));
await b.close();
