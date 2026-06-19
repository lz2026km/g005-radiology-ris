// CDP test script - 通过 Chrome DevTools Protocol 捕获部署站点的真实错误
import http from 'node:http';
import WebSocket from 'ws';

const CDP_HOST = '127.0.0.1';
const CDP_PORT = 9222;

async function getTargets() {
  return new Promise((resolve, reject) => {
    http.get(`http://${CDP_HOST}:${CDP_PORT}/json`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    });
  });
}

function sendCDP(ws, method, params = {}, id) {
  return new Promise((resolve, reject) => {
    const msg = JSON.stringify({ id, method, params });
    const handler = (data) => {
      const m = JSON.parse(data.toString());
      if (m.id === id) {
        ws.off('message', handler);
        if (m.error) reject(new Error(m.error.message));
        else resolve(m.result);
      }
    };
    ws.on('message', handler);
    ws.send(msg);
  });
}

async function capturePage(tabUrl) {
  console.log(`\n=== Connecting to ${tabUrl} ===`);
  const ws = new WebSocket(tabUrl);
  await new Promise((resolve) => ws.once('open', resolve));

  let cmdId = 0;
  const send = (method, params) => sendCDP(ws, method, params, ++cmdId);

  // 启用必要的域
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');
  await send('Page.enable');

  // 收集 console.log
  const logs = [];
  ws.on('message', (data) => {
    try {
      const m = JSON.parse(data.toString());
      if (m.method === 'Runtime.consoleAPICalled') {
        const args = m.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        logs.push(`[${m.params.type}] ${args}`);
      } else if (m.method === 'Runtime.exceptionThrown') {
        logs.push(`[EXCEPTION] ${m.params.exceptionDetails.text} - ${m.params.exceptionDetails.exception?.description || ''}`);
      } else if (m.method === 'Log.entryAdded') {
        logs.push(`[${m.params.entry.level}] ${m.params.entry.text}`);
      } else if (m.method === 'Network.responseReceived') {
        const resp = m.params.response;
        if (resp.status >= 400) {
          logs.push(`[NETWORK ${resp.status}] ${resp.url}`);
        }
      }
    } catch (e) {}
  });

  // 等待页面加载
  await new Promise((r) => setTimeout(r, 10000));

  // 获取完整 DOM
  const domResult = await send('Runtime.evaluate', {
    expression: 'document.documentElement.outerHTML',
    returnByValue: true
  });
  const dom = domResult.result.value || '';
  console.log(`\n=== DOM Length: ${dom.length} chars ===`);
  console.log(`\n=== DOM (first 5000 chars) ===`);
  console.log(dom.substring(0, 5000));

  // 提取关键信息
  const titleMatch = dom.match(/<title>([^<]+)<\/title>/);
  console.log(`\n=== Title: ${titleMatch?.[1] || 'NOT FOUND'} ===`);

  const bodyText = dom.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`\n=== Body text (first 1500 chars) ===`);
  console.log(bodyText.substring(0, 1500));

  console.log(`\n=== Console logs collected (${logs.length} entries) ===`);
  for (const log of logs) console.log(log);

  // 检查错误
  const errorEl = dom.match(/<pre[^>]*style="color:red[^"]*"[^>]*>([\s\S]*?)<\/pre>/);
  if (errorEl) {
    console.log(`\n=== ERROR UI SHOWN ===\n${errorEl[1].substring(0, 2000)}`);
  }

  const hasReact = dom.includes('class=') || dom.includes('sidebar') || dom.includes('menu') || dom.includes('工作台') || dom.includes('app');
  const stillLoading = dom.includes('加载中') && !dom.includes('工作台') && !dom.includes('登录');
  console.log(`\n=== DIAGNOSIS ===`);
  console.log(`Has React-rendered content: ${hasReact ? '✅ YES' : '❌ NO'}`);
  console.log(`Still showing loading spinner: ${stillLoading ? '⚠️ YES' : '✅ NO'}`);
  console.log(`Total script tags: ${(dom.match(/<script/g) || []).length}`);

  // 检查 window.__errors
  const errorsResult = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({__errors: window.__errors, __appVersion: window.__appVersion, errorRendered: document.getElementById("root")?.dataset?.errorRendered, rootChildren: document.getElementById("root")?.children?.length})',
    returnByValue: true
  });
  console.log(`\n=== window.__errors / app version ===`);
  console.log(errorsResult.result.value || '(empty)');

  ws.close();
}

const targets = await getTargets();
const mainPage = targets.find(t => t.url.includes('g005-radiology-ris') && !t.url.includes('sw.js'));
console.log(`Found ${targets.length} targets`);
targets.forEach(t => console.log(`  - ${t.type}: ${t.title} (${t.url})`));

if (mainPage) {
  await capturePage(mainPage.webSocketDebuggerUrl);
} else {
  console.log('No main page tab found');
}