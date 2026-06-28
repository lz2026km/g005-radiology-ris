const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
  await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
  await p.waitForTimeout(2500);
  const endpoints = [
    ['GET', '/api/v1/dental/studies?pageSize=3'],
    ['POST', '/api/v1/dental/studies', { patientName: 'Test', modality: 'CBCT' }],
    ['GET', '/api/v1/dental/cbct/list'],
    ['GET', '/api/v1/dental/cbct/STU100000/nerve-canal'],
    ['GET', '/api/v1/dental/cbct/STU100000/bone-density'],
    ['GET', '/api/v1/dental/cbct/STU100000/measure'],
    ['GET', '/api/v1/dental/panoramic/list'],
    ['GET', '/api/v1/dental/periapical/list'],
    ['GET', '/api/v1/dental/scan/list'],
    ['GET', '/api/v1/dental/bitewing/list'],
    ['GET', '/api/v1/dental/studies/STU100000/mpr'],
    ['GET', '/api/v1/dental/studies/STU100000/3d-model'],
    ['GET', '/api/v1/dental/studies/STU100000/segments'],
    ['POST', '/api/v1/dental/studies/STU100000/segment', { model: 'tooth' }],
    ['POST', '/api/v1/dental/ai/caries-onimage', { imageBase64: 'mock' }],
  ];
  let pass = 0, fail = 0;
  for (const [method, url, body] of endpoints) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    try {
      const r = await p.evaluate(async ({ url, opts }) => {
        const res = await fetch(url, opts);
        const text = await res.text();
        return { status: res.status, ok: text.includes('"success":true') || text.includes('"data"') };
      }, { url, opts });
      if ((r.status === 200 || r.status === 201) && r.ok) { pass++; }
      else { fail++; console.log('FAIL', method, url, r.status); }
    } catch(e) { fail++; console.log('ERR', method, url, e.message.slice(0,100)); }
  }
  console.log(`Dental: ${pass}/${pass+fail}`);
  await b.close();
})();
