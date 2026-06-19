// 模拟用户点击 sidebar 项触发懒加载
import WebSocket from 'ws';
import http from 'node:http';

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

const tab = targets.find(t => t.url.includes('g005-radiology-ris/?v=') && !t.url.includes('test.html'));
console.log(`Using tab: ${tab.url}`);
console.log(`WS: ${tab.webSocketDebuggerUrl}`);

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
await send('Runtime.enable');

const allReqs = [];
const failedReqs = [];
const logs = [];

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
    if (m.method === 'Runtime.consoleAPICalled') {
      const args = m.params.args.map(a => a.value !== undefined ? JSON.stringify(a.value) : (a.description || '?')).join(' ');
      logs.push(`[${m.params.type}] ${args.substring(0, 200)}`);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const exc = m.params.exceptionDetails;
      logs.push(`[EXCEPTION] ${exc.text}: ${exc.exception?.description || ''}`);
    }
  } catch (e) {}
});

// 重新加载主页
console.log('\n=== Step 1: Reload main page ===');
await send('Page.reload', { ignoreCache: true });
await new Promise(r => setTimeout(r, 8000));

// 检查初始状态
const initialState = await send('Runtime.evaluate', {
  expression: `({
    rootChildren: document.getElementById('root').children.length,
    rootHTML: document.getElementById('root').innerHTML.substring(0, 500),
    sidebarLinks: Array.from(document.querySelectorAll('a[href]')).slice(0, 10).map(a => ({text: a.textContent?.trim(), href: a.getAttribute('href')}))
  })`,
  returnByValue: true
});
console.log('Initial state:', JSON.stringify(initialState.result.value, null, 2));

// 检查 sidebar 是否有链接
console.log('\n=== Step 2: Click sidebar link to /reports/v3-write ===');

// 尝试通过 React Router navigation
const navResult = await send('Runtime.evaluate', {
  expression: `(() => {
    // Try React Router navigate via history
    try {
      const links = document.querySelectorAll('a[href*="/reports"]');
      if (links.length > 0) {
        links[0].click();
        return { clicked: links[0].textContent, total: links.length };
      }
      return { error: 'No links found', totalLinks: document.querySelectorAll('a').length };
    } catch (e) {
      return { error: e.message };
    }
  })()`,
  returnByValue: true
});
console.log('Click result:', JSON.stringify(navResult.result.value));

await new Promise(r => setTimeout(r, 3000));

// 再次检查状态
const afterClick = await send('Runtime.evaluate', {
  expression: `({
    url: location.href,
    rootHTML: document.getElementById('root').innerHTML.substring(0, 500),
    hasError: document.getElementById('root').innerHTML.includes('启动失败') || document.getElementById('root').innerHTML.includes('错误')
  })`,
  returnByValue: true
});
console.log('After click state:', JSON.stringify(afterClick.result.value, null, 2));

console.log('\n=== FAILED NETWORK REQUESTS ===');
if (failedReqs.length > 0) {
  failedReqs.forEach(r => console.log(`  ${r.status} ${r.url}`));
} else {
  console.log('  (none)');
}

console.log('\n=== CONSOLE LOGS ===');
logs.slice(-20).forEach(l => console.log(l));

console.log('\n=== ALL LAZY CHUNK REQUESTS ===');
allReqs.filter(u => u.includes('Page') || u.includes('Form') || u.includes('Dialog') || u.includes('Modal')).forEach(u => console.log(`  ${u}`));

ws.close();