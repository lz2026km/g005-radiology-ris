const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
  const user = { id: 'A001', name: 'SysAdmin', role: '管理员', department: '信息科' };
  await p.evaluate(u => localStorage.setItem('ris_current_user', JSON.stringify(u)), user);
  await p.waitForTimeout(2500);
  const tests = ['/api/v1/dental/treatments?pageSize=3','/api/v1/dental/implant/plans','/api/v1/dental/ortho/plans','/api/v1/dental/recalls','/api/v1/dental/inventory','/api/v1/dental/stats','/api/v1/dental/consents','/api/v1/dental/tele/sessions','/api/v1/dental/treatments/types'];
  let pass = 0;
  for (const u of tests) {
    try {
      const r = await p.evaluate(async url => { const res = await fetch(url); const t = await res.text(); return { status: res.status, ok: t.includes('"success":true') || t.includes('"data"') }; }, u);
      if ((r.status === 200 || r.status === 201) && r.ok) pass++;
    } catch {}
  }
  console.log(`Dental all: ${pass}/${tests.length}`);
  await b.close();
})();
