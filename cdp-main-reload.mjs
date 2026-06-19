// 在 Chrome 中实际模拟用户点击 - 触发懒加载
import WebSocket from 'ws';
import http from 'node:http';

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

// 用 main page
const mainTab = targets.find(t => t.url.includes('g005-radiology-ris') && !t.url.includes('test.html') && !t.url.includes('sw.js'));
if (!mainTab) {
  // 打开新 tab
  const newTab = await new Promise((resolve, reject) => {
    http.request({
      host: '127.0.0.1', port: 9222,
      path: '/json/new?https%3A%2F%2Flz2026km.github.io%2Fg005-radiology-ris%2F%3Fv%3D3.0.6.8-7',
      method: 'PUT'
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).end();
  });
  console.log(`Opened new tab: ${newTab.url}`);
  // 等待
  await new Promise(r => setTimeout(r, 8000));
}

const finalTargets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

const tab = finalTargets.find(t => t.url.includes('g005-radiology-ris') && !t.url.includes('test.html') && !t.url.includes('sw.js'));
console.log(`Using tab: ${tab.url}`);

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

await send('Network.enable');
await send('Page.enable');

const allReqs = [];
const failedReqs = [];
ws.on('message', (data) => {
  try {
    const m = JSON.parse(data.toString());
    if (m.method === 'Network.requestWillBeSent') {
      allReqs.push(m.params.request.url);
    }
    if (m.method === 'Network.responseReceived') {
      if (m.params.response.status >= 400) {
        failedReqs.push({
          url: m.params.response.url,
          status: m.params.response.status
        });
      }
    }
  } catch (e) {}
});

// 强制重新加载页面
console.log('\n=== Reloading main page and capturing ALL network requests ===');
await send('Page.reload', { ignoreCache: true });
await new Promise(r => setTimeout(r, 8000));

console.log(`\nTotal requests: ${allReqs.length}`);
console.log(`Failed requests (4xx/5xx): ${failedReqs.length}`);
if (failedReqs.length > 0) {
  console.log('\n=== FAILED REQUESTS ===');
  failedReqs.forEach(r => console.log(`  ${r.status} ${r.url}`));
}

// 列出所有 assets/ 请求
console.log('\n=== Asset requests ===');
allReqs.filter(u => u.includes('assets/')).forEach(u => console.log(`  ${u}`));

// 检查页面最终状态
const final = await send('Runtime.evaluate', {
  expression: `(() => ({
    rootChildren: document.getElementById('root').children.length,
    bodyText: document.body.innerText.substring(0, 500),
    errors: window.__errors,
    hasReactRoot: !!document.querySelector('[data-reactroot], #root > div:not(noscript):not(script)')
  }))()`,
  returnByValue: true
});
console.log('\n=== FINAL STATE ===');
console.log(JSON.stringify(final.result.value, null, 2));

ws.close();