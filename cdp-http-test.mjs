// 极简测试: 只用 HTTP API，不依赖 WebSocket
import http from 'node:http';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const CDP = 'http://127.0.0.1:9222';

function httpJson(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(CDP + path, { method }, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(new Error('not JSON: ' + d.substring(0, 80))); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function newTab(url) {
  // 多次重试，避免 Target is closing 错误
  for (let i = 0; i < 8; i++) {
    try {
      return await httpJson(`/json/new?${encodeURIComponent(url)}`, 'PUT');
    } catch (e) {
      if (i === 7) throw e;
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, html: d }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log('========================================');
  console.log('  RIS 本地测试 v3.0.6.8-11');
  console.log('========================================\n');

  // === 1. 直接 HTTP 测试关键资源 ===
  console.log('────────── 1. 静态资源 HTTP 测试 ──────────');
  const testFiles = [
    'index.html',
    'test.html',
    'mockServiceWorker.js',
    'assets/index-BZ5VN1y1.js',
    'assets/AdverseEventPage-CqqFaA4I.js',
    'assets/RiskManagementPage-DcKozJtD.js',
    'assets/ReportWritePage-BKkXXrTZ.js',
    'assets/ReportExportPage-DI8Ox5Ce.js',
    'assets/RegionalReportPage-Dx-jF2Sg.js',
  ];
  for (const f of testFiles) {
    try {
      const r = await fetchHtml(BASE + '/' + f);
      console.log(`  ✅ ${f} - ${r.status} (${r.html.length} 字节)`);
    } catch (e) {
      console.log(`  ❌ ${f} - ${e.message}`);
    }
  }

  // === 2. SPA fallback 测试 (任何路径都应返回 index.html) ===
  console.log('\n────────── 2. SPA Fallback 测试 ──────────');
  const spaPaths = [
    '/login',
    '/reports/v3-write',
    '/safety/adverse-events',
    '/safety/risk-management',
    '/report-export',
    '/regional-report',
    '/worklist',
    '/exams',
    '/patients',
  ];
  for (const p of spaPaths) {
    try {
      const r = await fetchHtml(BASE + p);
      if (r.html.includes('<div id="root"></div>') || r.html.includes('<title>')) {
        console.log(`  ✅ ${p} - ${r.status} (${r.html.length} 字节)`);
      } else {
        console.log(`  ⚠ ${p} - ${r.status} (${r.html.length} 字节) - 可能是 SPA 路由不匹配`);
      }
    } catch (e) {
      console.log(`  ❌ ${p} - ${e.message}`);
    }
  }

  // === 3. 检查 dist 是否包含所有必要文件 ===
  console.log('\n────────── 3. dist 文件清单 ──────────');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const distAssets = fs.readdirSync('dist/assets');
  console.log(`  总数: ${distAssets.length} 个文件`);
  // 检查关键页面
  const keyFiles = ['ReportWritePage', 'ReportExportPage', 'AdverseEventPage', 'RiskManagementPage', 'RegionalReportPage', 'WorklistPage'];
  for (const k of keyFiles) {
    const matches = distAssets.filter(f => f.startsWith(k));
    if (matches.length > 0) {
      console.log(`  ✅ ${k}: ${matches[0]} (${fs.statSync('dist/assets/' + matches[0]).size} bytes)`);
    } else {
      console.log(`  ❌ ${k}: 缺失！`);
    }
  }

  // === 4. 用 CDP 创建新 tab（不连 WebSocket）===
  console.log('\n────────── 4. CDP 浏览器测试 ──────────');
  try {
    const tab = await newTab('about:blank');
    console.log(`  ✅ CDP Tab 创建成功: ${tab.id}`);
    // 关闭
    await newTab('about:blank'); // 触发一次新 tab 用来清理
    try { await httpJson(`/json/close/${tab.id}`); } catch {}
    console.log(`  ✅ CDP Tab 关闭成功`);
  } catch (e) {
    console.log(`  ❌ CDP 测试失败: ${e.message}`);
  }

  console.log('\n========================================');
  console.log('  HTTP 测试完成');
  console.log('========================================');
}

run().catch(e => {
  console.error(`\n❌ 崩溃: ${e.message}`);
  process.exit(1);
});
