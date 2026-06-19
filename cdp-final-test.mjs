// 启动 Chrome 打开 v3.0.6.8-8 并捕获所有 console + 网络
import http from 'node:http';
import WebSocket from 'ws';

async function getNewTab(url) {
  return new Promise((resolve, reject) => {
    http.request({
      host: '127.0.0.1', port: 9222, path: `/json/new?${encodeURIComponent(url)}`, method: 'PUT'
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).end();
  });
}

// 用现有 Chrome 实例
const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

console.log(`Found ${targets.length} tabs`);

// 关闭所有 tabs 然后开新 tab
for (const t of targets.filter(t => t.type === 'page')) {
  try {
    await new Promise((r, j) => {
      http.request({
        host: '127.0.0.1', port: 9222, path: `/json/close/${t.id}`, method: 'GET'
      }, (res) => { res.on('data', () => {}); res.on('end', r); }).end();
    });
  } catch {}
}

await new Promise(r => setTimeout(r, 1000));

// 开新 tab 加载 v3.0.6.8-8
const newTab = await getNewTab('https://lz2026km.github.io/g005-radiology-ris/?v=3.0.6.8-8&fresh=2');
console.log(`\nOpened tab: ${newTab.url}`);
console.log(`WS: ${newTab.webSocketDebuggerUrl}`);

const ws = new WebSocket(newTab.webSocketDebuggerUrl);
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
await send('Log.enable');

const logs = [];
const errors = [];
const reqs = [];

ws.on('message', (data) => {
  try {
    const m = JSON.parse(data.toString());
    if (m.method === 'Runtime.consoleAPICalled') {
      const args = m.params.args.map(a => {
        if (a.value !== undefined) return JSON.stringify(a.value);
        if (a.description) return a.description;
        return '?';
      }).join(' ');
      logs.push(`[${m.params.type}] ${args}`);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const exc = m.params.exceptionDetails;
      const stack = exc.stackTrace?.callFrames?.slice(0, 3).map(f => `    at ${f.functionName || '<anon>'} (${f.url}:${f.lineNumber}:${f.columnNumber})`).join('\n');
      errors.push(`${exc.text}\n${exc.exception?.description || ''}\n${stack || ''}`);
    } else if (m.method === 'Log.entryAdded') {
      const e = m.params.entry;
      if (e.level === 'error' || e.level === 'warning') {
        logs.push(`[log.${e.level}] ${e.text}`);
      }
    } else if (m.method === 'Network.responseReceived') {
      if (m.params.response.status >= 400) {
        reqs.push(`${m.params.response.status} ${m.params.response.url}`);
      }
    }
  } catch (e) {}
});

console.log('\n=== Waiting 15s for page to load and render ===');
await new Promise(r => setTimeout(r, 15000));

// 最终状态
const final = await send('Runtime.evaluate', {
  expression: `({
    url: location.href,
    bodyText: document.body.innerText.substring(0, 1000),
    rootChildren: document.getElementById('root').children.length,
    hasFiber: !!document.querySelector('#root > div:not([id]):not(noscript):not([id*="loading"])'),
    reactElements: document.querySelectorAll('[class*="ant"], button, .ant-menu, .ant-layout').length,
    appVersion: window.__appVersion,
    errorCount: window.__errors?.length || 0
  })`,
  returnByValue: true
});

console.log('\n=== FINAL STATE ===');
console.log(JSON.stringify(final.result.value, null, 2));

console.log(`\n=== EXCEPTIONS (${errors.length}) ===`);
errors.forEach(e => console.log(e));

console.log(`\n=== CONSOLE LOGS (${logs.length}) ===`);
logs.forEach(l => console.log(l));

console.log(`\n=== FAILED REQUESTS (${reqs.length}) ===`);
reqs.forEach(r => console.log(`  ${r}`));

ws.close();