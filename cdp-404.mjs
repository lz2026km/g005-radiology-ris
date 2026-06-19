// 捕获所有失败的 404 网络请求
import WebSocket from 'ws';
import http from 'node:http';

const targets = await new Promise((resolve, reject) => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
  });
});

const mainTab = targets.find(t => t.url.includes('test.html'));
console.log(`Using tab: ${mainTab.url}`);
console.log(`WS: ${mainTab.webSocketDebuggerUrl}`);

const ws = new WebSocket(mainTab.webSocketDebuggerUrl);
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

const failed = [];
const all404s = [];

ws.on('message', (data) => {
  try {
    const m = JSON.parse(data.toString());
    if (m.method === 'Network.responseReceived') {
      if (m.params.response.status >= 400) {
        all404s.push({
          url: m.params.response.url,
          status: m.params.response.status,
          type: m.params.type
        });
      }
    }
    if (m.method === 'Network.loadingFailed') {
      failed.push({
        error: m.params.errorText,
        type: m.params.type,
        requestId: m.params.requestId
      });
    }
  } catch (e) {}
});

// 重新加载页面
await send('Page.reload', { ignoreCache: true });
await new Promise((r) => setTimeout(r, 10000));

console.log('\n=== ALL 4xx/5xx RESPONSES ===');
all404s.forEach(r => console.log(`  ${r.status} ${r.url} (type: ${r.type})`));

console.log('\n=== ALL LOADING FAILED ===');
failed.forEach(r => console.log(`  ${r.error} (type: ${r.type})`));

// 直接测试 GitHub Pages 上的资源
console.log('\n=== Testing individual resources ===');
const urls = [
  'https://lz2026km.github.io/g005-radiology-ris/',
  'https://lz2026km.github.io/g005-radiology-ris/assets/index-fnN0_WUz.js',
  'https://lz2026km.github.io/g005-radiology-ris/sw.js',
  'https://lz2026km.github.io/g005-radiology-ris/mockServiceWorker.js',
  'https://lz2026km.github.io/g005-radiology-ris/registerSW.js',
  'https://lz2026km.github.io/g005-radiology-ris/manifest.webmanifest',
  'https://lz2026km.github.io/g005-radiology-ris/assets/ReportWritePage-C_kK32J9.js',
  'https://lz2026km.github.io/g005-radiology-ris/assets/ReportExportPage-BlsxIu8H.js',
  'https://lz2026km.github.io/g005-radiology-ris/assets/AdverseEventPage-B3fedLKS.js',
  'https://lz2026km.github.io/g005-radiology-ris/assets/RiskManagementPage-BCoN-OpF.js',
  'https://lz2026km.github.io/g005-radiology-ris/assets/RegionalReportPage-DH2baoSM.js'
];

for (const url of urls) {
  const r = await send('Runtime.evaluate', {
    expression: `fetch('${url}').then(r => r.status).catch(e => 'ERR: ' + e.message)`,
    returnByValue: true,
    awaitPromise: true
  });
  console.log(`  ${r.result.value}  ${url}`);
}

ws.close();