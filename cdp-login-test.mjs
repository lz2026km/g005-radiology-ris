// 模拟登录 + 导航到 ReportWritePage
import http from 'node:http';
import WebSocket from 'ws';

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

const tab = targets.find(t => t.url.includes('login') || t.url.includes('g005-radiology-ris/?v='));
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
await send('Network.enable');

// Wait for login page to fully render
console.log('Waiting for login...');
await new Promise(r => setTimeout(r, 10000));

// Try to fill login form and submit
console.log('\n=== Attempting login...');
const loginResult = await send('Runtime.evaluate', {
  expression: `(() => {
    const inputs = document.querySelectorAll('input');
    const forms = document.querySelectorAll('form');
    return {
      inputCount: inputs.length,
      inputTypes: Array.from(inputs).map(i => i.type || i.placeholder || ''),
      formCount: forms.length,
      placeholder: inputs[0]?.placeholder,
      bodyHTML: document.body.innerHTML.substring(0, 2000)
    };
  })()`,
  returnByValue: true
});

console.log('Login form state:', JSON.stringify(loginResult.result.value, null, 2));

// Try to directly navigate via React Router using history.pushState
console.log('\n=== Navigating to /reports/v3-write via React Router ===');
const navResult = await send('Runtime.evaluate', {
  expression: `(() => {
    // Try React Router internal navigation
    try {
      // Method 1: window.history.pushState + dispatchEvent
      window.history.pushState({}, '', '/reports/v3-write');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return { method: 'popstate', url: location.href };
    } catch (e) {
      return { error: e.message };
    }
  })()`,
  returnByValue: true
});

console.log('Navigation result:', JSON.stringify(navResult.result.value, null, 2));

// Wait for nav + lazy load
console.log('Waiting 10s for lazy chunk + render...');
await new Promise(r => setTimeout(r, 10000));

const final = await send('Runtime.evaluate', {
  expression: `(() => ({
    url: location.href,
    rootText: document.getElementById('root').innerText.substring(0, 500),
    rootHTMLLength: document.getElementById('root').innerHTML.length,
    hasError: document.body.innerText.includes('启动失败') || document.body.innerText.includes('错误'),
    hasButtons: document.querySelectorAll('button').length,
    hasInputs: document.querySelectorAll('input').length
  }))()`,
  returnByValue: true
});
console.log('\n=== AFTER NAVIGATION ===');
console.log(JSON.stringify(final.result.value, null, 2));

ws.close();