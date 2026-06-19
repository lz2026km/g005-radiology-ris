// 检查 login 页面更多细节
import http from 'node:http';
import WebSocket from 'ws';

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

const tab = targets.find(t => t.url.includes('login'));
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

// Wait longer for login to fully render
console.log('Waiting 8s for login...');
await new Promise(r => setTimeout(r, 8000));

// Take screenshot of the rendered state
const state = await send('Runtime.evaluate', {
  expression: `(() => {
    const root = document.getElementById('root');
    return {
      url: location.href,
      rootInnerText: root.innerText,
      rootHTMLLength: root.innerHTML.length,
      hasForms: !!document.querySelector('form'),
      hasInputs: document.querySelectorAll('input').length,
      hasButtons: document.querySelectorAll('button').length,
      formElements: Array.from(document.querySelectorAll('form, input, button, label, .ant-form')).length,
      title: document.title
    };
  })()`,
  returnByValue: true
});

console.log('\n=== LOGIN PAGE DETAILED STATE ===');
console.log(JSON.stringify(state.result.value, null, 2));

ws.close();