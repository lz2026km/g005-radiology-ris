import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newContext().then(c => c.newPage());
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.waitForTimeout(2000);
const tests = ['/api/v1/sign/reports/RPT-001/sign', '/api/v1/sign/start', '/api/v1/amend/AMEND-001', '/api/v1/amend?id=AMEND-001'];
for (const u of tests) {
  const r = await p.evaluate(async (url) => {
    const res = await fetch(url);
    return { status: res.status, text: (await res.text()).slice(0, 120) };
  }, u);
  console.log(u, r.status, ':', r.text);
}
await b.close();
