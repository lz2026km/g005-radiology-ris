// 最终验证 v3.0.6.8-9 - 检查所有 5 个目标页面
import http from 'node:http';
import WebSocket from 'ws';

async function openTab(url) {
  return new Promise((resolve, reject) => {
    http.request({
      host: '127.0.0.1', port: 9222, path: `/json/new?${encodeURIComponent(url)}`, method: 'PUT'
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).end();
  });
}

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

console.log(`Found ${targets.length} tabs`);

// Close old tabs
for (const t of targets.filter(t => t.type === 'page')) {
  try {
    await new Promise((r) => {
      http.request({ host: '127.0.0.1', port: 9222, path: `/json/close/${t.id}`, method: 'GET' },
        (res) => { res.on('data', () => {}); res.on('end', r); }).end();
    });
  } catch {}
}
await new Promise(r => setTimeout(r, 500));

// Test main page
console.log('\n=== Testing main page ===');
const tab = await openTab('https://lz2026km.github.io/g005-radiology-ris/?v=3.0.6.8-9');
console.log(`Opened: ${tab.url}`);

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

const logs = [];
const errors = [];
ws.on('message', (data) => {
  try {
    const m = JSON.parse(data.toString());
    if (m.method === 'Runtime.consoleAPICalled') {
      const args = m.params.args.map(a => a.value !== undefined ? JSON.stringify(a.value) : (a.description || '?')).join(' ');
      logs.push(`[${m.params.type}] ${args.substring(0, 250)}`);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const exc = m.params.exceptionDetails;
      errors.push(`${exc.text}: ${exc.exception?.description || ''}`);
    }
  } catch (e) {}
});

// 等待页面加载 + React 渲染
await new Promise(r => setTimeout(r, 15000));

// 获取最终状态
const final = await send('Runtime.evaluate', {
  expression: `(() => {
    const root = document.getElementById('root');
    return {
      url: location.href,
      rootChildren: root.children.length,
      bodyText: document.body.innerText.substring(0, 1500),
      hasReactUI: !!document.querySelector('.ant-layout, .ant-menu, button, [class*="ant"]'),
      antButtons: document.querySelectorAll('.ant-btn, button').length,
      antMenu: document.querySelectorAll('.ant-menu, [class*="menu"]').length,
      appVersion: window.__appVersion,
      errorCount: window.__errors?.length || 0,
      firstError: window.__errors?.[0]
    };
  })()`,
  returnByValue: true
});

console.log('\n=== FINAL STATE ===');
console.log(JSON.stringify(final.result.value, null, 2));

console.log('\n=== CONSOLE LOGS (relevant) ===');
logs.filter(l => !l.includes('Future Flag Warning') && !l.includes('MSW')).forEach(l => console.log(l));

if (errors.length > 0) {
  console.log('\n=== EXCEPTIONS ===');
  errors.forEach(e => console.log(e));
}

// 检查 sidebar 链接
console.log('\n=== Sidebar/links check ===');
const linksCheck = await send('Runtime.evaluate', {
  expression: `(() => {
    const allLinks = Array.from(document.querySelectorAll('a, [role="link"], [class*="menu-item"]'));
    return {
      totalLinks: allLinks.length,
      sampleTexts: allLinks.slice(0, 10).map(l => l.textContent?.trim()).filter(Boolean),
      sampleHrefs: allLinks.slice(0, 5).map(l => l.getAttribute('href')).filter(Boolean)
    };
  })()`,
  returnByValue: true
});
console.log(JSON.stringify(linksCheck.result.value, null, 2));

ws.close();