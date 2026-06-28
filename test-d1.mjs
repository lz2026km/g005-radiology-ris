const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
  await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'IT'})));
  await p.waitForTimeout(2500);
  const tests = [
    {m:'GET', u:'/api/v1/review/initial-check?pageSize=3'},
    {m:'GET', u:'/api/v1/review/initial-check/summary'},
    {m:'POST', u:'/api/v1/review/initial-check', b:{reportId:'RPT-001', checkItems:[{name:'desc',passed:true}], note:'D3 test'}},
    {m:'GET', u:'/api/v1/review/final-check?pageSize=3'},
    {m:'GET', u:'/api/v1/review/final-check/summary'},
  ];
  let pass = 0;
  for (const t of tests) {
    try {
      const r = await p.evaluate(async ({m,u,b2}) => {
        const opts = {method:m, headers:{'Content-Type':'application/json'}};
        if (b2) opts.body = JSON.stringify(b2);
        const res = await fetch(u, opts);
        const text = await res.text();
        return {status:res.status, ok:text.includes('"success":true') || text.includes('"data"')};
      }, {m:t.m, u:t.u, b2:t.b || null});
      if ((r.status === 200 || r.status === 201) && r.ok) pass++;
    } catch {}
  }
  console.log(pass + '/5');
  await b.close();
})();
