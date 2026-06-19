// 测试所有 5 个目标页面是否正常加载
import http from 'node:http';
import WebSocket from 'ws';

const PAGES = [
  '/reports/v3-write',
  '/report-export',
  '/safety/adverse-events',
  '/safety/risk-management',
  '/regional-report'
];

async function openTab(url) {
  return new Promise((resolve, reject) => {
    http.request({
      host: '127.0.0.1', port: 9222, path: `/json/new?${encodeURIComponent(url)}`, method: 'PUT'
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).end();
  });
}

const results = {};

for (const path of PAGES) {
  const url = `https://lz2026km.github.io/g005-radiology-ris${path}?v=3.0.6.8-10`;
  console.log(`\n=== Testing ${path} ===`);

  const tab = await openTab(url);
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.once('open', r));

  let cmdId = 0;
  const send = (method, params) => new Promise((resolve, reject) => {
    const id = ++cmdId;
    const handler = (data) => {
      const m = JSON.parse(data.toString());
      if (m.id === id) {
        ws.off('message', handler);
        if (m.error) reject(new Error(m.error.message));
        else resolve(m.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Runtime.enable');
  await send('Network.enable');

  const reqs = [];
  const failures = [];
  ws.on('message', (data) => {
    try {
      const m = JSON.parse(data.toString());
      if (m.method === 'Network.responseReceived') {
        const r = m.params.response;
        if (r.status >= 400) failures.push(`${r.status} ${r.url}`);
        reqs.push(`${r.status} ${r.url.split('/').pop()}`);
      }
    } catch (e) {}
  });

  await new Promise(r => setTimeout(r, 15000));

  const state = await send('Runtime.evaluate', {
    expression: `(() => ({
      url: location.href,
      rootHTMLLength: document.getElementById('root').innerHTML.length,
      rootText: document.getElementById('root').innerText.substring(0, 300),
      hasLoading: document.body.innerText.includes('加载'),
      hasError: document.body.innerText.includes('启动失败') || document.body.innerText.includes('错误'),
      title: document.title,
      totalRequests: ${reqs.length}
    }))()`,
    returnByValue: true
  });

  results[path] = state.result.value;
  console.log(`  URL: ${state.result.value.url}`);
  console.log(`  Root HTML length: ${state.result.value.rootHTMLLength}`);
  console.log(`  Root text preview: ${state.result.value.rootText.substring(0, 200)}`);
  console.log(`  Has loading spinner: ${state.result.value.hasLoading}`);
  console.log(`  Has error UI: ${state.result.value.hasError}`);
  console.log(`  Failed requests: ${failures.length}`);
  failures.slice(0, 3).forEach(f => console.log(`    ${f}`));

  ws.close();
  await new Promise(r => setTimeout(r, 1000));
}

console.log('\n=== SUMMARY ===');
for (const [path, r] of Object.entries(results)) {
  console.log(`${path}: HTML=${r.rootHTMLLength} hasLoading=${r.hasLoading} hasError=${r.hasError}`);
}