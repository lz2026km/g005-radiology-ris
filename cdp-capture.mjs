// 深度诊断 - 捕获所有 console + Runtime.exception + Page.frameStoppedLoading
import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/3AEFBABF5FCA8229913F10148174E8EC');

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

// 重新加载页面并捕获所有输出
console.log('\n=== Reloading page and capturing ALL events ===\n');

const allEvents = [];
ws.on('message', (data) => {
  try {
    const m = JSON.parse(data.toString());
    if (m.method === 'Runtime.consoleAPICalled') {
      const args = m.params.args.map((a) => {
        if (a.value !== undefined) return JSON.stringify(a.value);
        if (a.description) return a.description;
        return '?';
      }).join(' ');
      allEvents.push(`[console.${m.params.type}] ${args}`);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const exc = m.params.exceptionDetails;
      allEvents.push(`[EXCEPTION] ${exc.text}: ${exc.exception?.description || exc.exception?.value || '(no detail)'}`);
      if (exc.stackTrace?.callFrames) {
        exc.stackTrace.callFrames.slice(0, 5).forEach(f => {
          allEvents.push(`    at ${f.functionName || '<anon>'} (${f.url}:${f.lineNumber}:${f.columnNumber})`);
        });
      }
    } else if (m.method === 'Log.entryAdded') {
      allEvents.push(`[log.${m.params.entry.level}] ${m.params.entry.text}`);
    } else if (m.method === 'Page.frameStoppedLoading') {
      allEvents.push(`[frame.stopped] ${m.params.frameId}`);
    } else if (m.method === 'Page.loadEventFired') {
      allEvents.push(`[Page.loadEventFired]`);
    } else if (m.method === 'Page.javascriptDialogOpening') {
      allEvents.push(`[dialog] ${m.params.type}: ${m.params.message}`);
    }
  } catch (e) {}
});

// 重新加载
await send('Page.reload', { ignoreCache: true });
await new Promise((r) => setTimeout(r, 15000));

console.log(`=== Captured ${allEvents.length} events ===\n`);

const interesting = allEvents.filter(e =>
  e.includes('ERROR') || e.includes('error') || e.includes('Error') ||
  e.includes('Failed') || e.includes('failed') ||
  e.includes('EXCEPTION') || e.includes('log.error') ||
  e.includes('unhandledrejection') || e.includes('warning') ||
  e.includes('404') || e.includes('❌') || e.includes('⚠')
);
console.log(`=== Errors/Warnings (${interesting.length}) ===`);
interesting.forEach(e => console.log(e));

console.log('\n=== ALL console.info events (last 30) ===');
const infoEvents = allEvents.filter(e => e.includes('console.info') || e.includes('console.log'));
infoEvents.slice(-30).forEach(e => console.log(e));

// 最后一次诊断：检查 React 是否真的初始化了
console.log('\n=== FINAL DIAGNOSIS ===');
const finalCheck = await send('Runtime.evaluate', {
  expression: `(() => ({
    bodyHTML: document.body.innerHTML.substring(0, 800),
    rootHTML: document.getElementById('root').innerHTML.substring(0, 800),
    reactInWindow: typeof window.React,
    hasAnyReactAttr: !!document.querySelector('[data-reactroot]'),
    errorDisplay: window.__errors?.length || 0,
    firstError: window.__errors?.[0]
  }))()`,
  returnByValue: true
});
console.log(JSON.stringify(finalCheck.result.value, null, 2));

ws.close();