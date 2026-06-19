// 检查 login 页面
import http from 'node:http';
import WebSocket from 'ws';

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

const tab = targets.find(t => t.url.includes('login'));
console.log(`Tab: ${tab.url}`);

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
await new Promise(r => setTimeout(r, 3000));

const final = await send('Runtime.evaluate', {
  expression: `(() => {
    return {
      url: location.href,
      rootHTML: document.getElementById('root').innerHTML.substring(0, 3000),
      bodyText: document.body.innerText.substring(0, 500),
      hasAntdClass: !!document.querySelector('[class*="ant"]'),
      allClasses: Array.from(new Set(Array.from(document.querySelectorAll('*')).map(e => e.className).filter(c => c).slice(0, 20))),
      totalElements: document.querySelectorAll('*').length,
      rootHasChildren: document.getElementById('root').children.length
    };
  })()`,
  returnByValue: true
});
console.log('\n=== LOGIN PAGE STATE ===');
console.log(JSON.stringify(final.result.value, null, 2));

ws.close();