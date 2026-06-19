// Wait 20s for login page to fully render
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
await send('Page.enable');

// Wait 25s for full render
console.log('Waiting 25s for full login page render...');
await new Promise(r => setTimeout(r, 25000));

const state = await send('Runtime.evaluate', {
  expression: `(() => ({
    url: location.href,
    rootText: document.getElementById('root').innerText.substring(0, 500),
    rootHTMLLength: document.getElementById('root').innerHTML.length,
    hasForms: document.querySelectorAll('form').length,
    hasInputs: document.querySelectorAll('input').length,
    hasSelects: document.querySelectorAll('select').length,
    hasButtons: document.querySelectorAll('button').length,
    visibleText: document.body.innerText.substring(0, 500),
    title: document.title
  }))()`,
  returnByValue: true
});
console.log('\n=== LOGIN PAGE STATE AFTER 25s ===');
console.log(JSON.stringify(state.result.value, null, 2));

ws.close();