const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
  await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
  await p.waitForTimeout(2500);
  const tests = [
    ['GET', '/api/v1/dental/studies?pageSize=3'],
    ['GET', '/api/v1/dental/chart/P100000'],
    ['GET', '/api/v1/dental/ai/models'],
    ['GET', '/api/v1/dental/numbering-systems'],
    ['POST', '/api/v1/dental/ai/caries-detection', { imageBase64: 'mock' }],
    ['POST', '/api/v1/dental/ai/periapical-grading', { imageBase64: 'mock' }],
    ['POST', '/api/v1/dental/ai/bone-loss', { imageBase64: 'mock' }],
    ['POST', '/api/v1/dental/ai/root-canal-detection', { imageBase64: 'mock' }],
    ['POST', '/api/v1/dental/ai/oral-cavity-screening', { imageBase64: 'mock' }],
    ['PUT', '/api/v1/dental/chart/P100000/teeth/16', { status: 'Restored' }],
  ];
  let pass = 0, fail = 0;
  for (const [method, url, body] of tests) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    try {
      const r = await p.evaluate(async ({ url, opts }) => {
        const res = await fetch(url, opts);
        const text = await res.text();
        return { status: res.status, ok: text.includes('"success":true') || text.includes('"data"') };
      }, { url, opts });
      if ((r.status === 200 || r.status === 201) && r.ok) { pass++; }
      else { fail++; }
    } catch { fail++; }
  }
  console.log(`Day2 dental: ${pass}/${pass+fail}`);
  await b.close();
})();
