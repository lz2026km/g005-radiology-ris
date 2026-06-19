// 直接在 Chrome 中测试 - 不用 SW 直接访问测试页面
import http from 'node:http';
import WebSocket from 'ws';
import { execSync } from 'node:child_process';

// 先获取现有 tab
const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

// 找测试页面 tab (没 SW)
const testTab = targets.find(t => t.url.includes('test.html'));
const mainTab = targets.find(t => t.url.includes('g005-radiology-ris') && !t.url.includes('test.html') && !t.url.includes('sw.js'));

console.log(`Found ${targets.length} targets`);
console.log(`Test tab: ${testTab?.url || 'NONE'}`);
console.log(`Main tab: ${mainTab?.url || 'NONE'}`);

// 打开一个新的 tab 访问测试页面
const newTab = await new Promise((resolve, reject) => {
  http.request({
    host: '127.0.0.1', port: 9222, path: '/json/new?https%3A%2F%2Flz2026km.github.io%2Fg005-radiology-ris%2Ftest.html',
    method: 'PUT'
  }, (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  }).end();
});

console.log(`\nNew tab opened: ${newTab.url}`);
console.log(`WS: ${newTab.webSocketDebuggerUrl}`);

// 连接到新 tab 并捕获所有输出
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
await send('Log.enable');
await send('Page.enable');

const events = [];
ws.on('message', (data) => {
  try {
    const m = JSON.parse(data.toString());
    if (m.method === 'Runtime.consoleAPICalled') {
      const args = m.params.args.map(a => {
        if (a.value !== undefined) return JSON.stringify(a.value);
        if (a.description) return a.description;
        return '?';
      }).join(' ');
      events.push(`[${m.params.type}] ${args}`);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const exc = m.params.exceptionDetails;
      events.push(`[EXCEPTION] ${exc.text}: ${exc.exception?.description || ''}`);
    } else if (m.method === 'Log.entryAdded') {
      events.push(`[log.${m.params.entry.level}] ${m.params.entry.text}`);
    }
  } catch (e) {}
});

// 等待页面加载
await new Promise((r) => setTimeout(r, 8000));

console.log('\n=== TEST PAGE CONSOLE OUTPUT ===');
events.forEach(e => console.log(e));

// 抓 DOM
const dom = await send('Runtime.evaluate', {
  expression: 'document.body.innerText',
  returnByValue: true
});
console.log('\n=== TEST PAGE BODY TEXT ===');
console.log(dom.result.value);

ws.close();