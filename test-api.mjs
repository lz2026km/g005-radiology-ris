import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'networkidle' });
await page.evaluate((u) => localStorage.setItem('ris_current_user', u), USER);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
// 调 API
const r1 = await page.evaluate(async () => {
  const r = await fetch('/api/v1/patients/P000001');
  return { status: r.status, body: await r.text() };
});
console.log('GET /patients/P000001:', r1.status, r1.body.slice(0, 300));
const r2 = await page.evaluate(async () => {
  const r = await fetch('/api/v1/stats/daily');
  return { status: r.status, body: await r.text() };
});
console.log('GET /stats/daily:', r2.status, r2.body.slice(0, 300));
const r3 = await page.evaluate(async () => {
  const r = await fetch('/api/v1/consultations?pageSize=2');
  return { status: r.status, body: await r.text() };
});
console.log('GET /consultations:', r3.status, r3.body.slice(0, 300));
await browser.close();
