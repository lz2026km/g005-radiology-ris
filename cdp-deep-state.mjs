// 深入检查主页 React 渲染状态
import WebSocket from 'ws';
import http from 'node:http';

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

const tab = targets.find(t => t.url.includes('g005-radiology-ris') && !t.url.includes('test.html') && !t.url.includes('sw.js'));
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
await send('Log.enable');

// 重新加载并捕获所有
const allLogs = [];
const exceptions = [];
ws.on('message', (data) => {
  try {
    const m = JSON.parse(data.toString());
    if (m.method === 'Runtime.consoleAPICalled') {
      const args = m.params.args.map(a => {
        if (a.value !== undefined) return JSON.stringify(a.value);
        if (a.preview?.description) return a.preview.description;
        if (a.description) return a.description;
        return '?';
      }).join(' ');
      allLogs.push(`[${m.params.type}] ${args}`);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const exc = m.params.exceptionDetails;
      const stack = exc.stackTrace?.callFrames?.slice(0, 3).map(f =>
        `  at ${f.functionName || '<anon>'} (${f.url}:${f.lineNumber}:${f.columnNumber})`
      ).join('\n') || '';
      exceptions.push(`${exc.text}\n${exc.exception?.description || ''}\n${stack}`);
    } else if (m.method === 'Log.entryAdded') {
      const e = m.params.entry;
      allLogs.push(`[log.${e.level}] ${e.text} | ${e.url || ''}:${e.lineNumber || ''}`);
    }
  } catch (e) {}
});

// 完全重新加载
console.log('Reloading...');
await send('Page.reload', { ignoreCache: true });
await new Promise(r => setTimeout(r, 15000));

console.log(`\n=== EXCEPTIONS (${exceptions.length}) ===`);
exceptions.forEach(e => console.log(e));

console.log(`\n=== CONSOLE LOGS (${allLogs.length}) ===`);
allLogs.forEach(l => console.log(l));

// 最后一次状态
const final = await send('Runtime.evaluate', {
  expression: `({
    rootInnerHTML: document.getElementById('root').innerHTML.substring(0, 1500),
    bodyClasses: document.body.className,
    scriptsLoaded: Array.from(document.scripts).length,
    hasReact: typeof window.React,
    hasReactDOM: typeof window.ReactDOM,
    hasFiber: !!document.querySelector('[data-reactroot], #root > div'),
    bodyHeight: document.body.scrollHeight,
    errorContainer: document.getElementById('root').dataset.errorRendered || 'none',
    appVersion: window.__appVersion,
    errorCount: window.__errors?.length || 0,
    firstError: window.__errors?.[0]
  })`,
  returnByValue: true
});
console.log('\n=== FINAL PAGE STATE ===');
console.log(JSON.stringify(final.result.value, null, 2));

ws.close();