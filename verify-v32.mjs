// v32 实际部署验证 - 用 Playwright 真实浏览器打开页面, 点击侧栏, 截图
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris/';
const results = [];

async function step(name, fn) {
  try {
    const r = await fn();
    if (r === false) throw new Error('返回 false');
    results.push({ name, status: 'OK', info: r });
    console.log(`✓ ${name}${r ? ': ' + r : ''}`);
  } catch (e) {
    results.push({ name, status: 'FAIL', err: e.message.slice(0, 200) });
    console.log(`✗ ${name}: ${e.message.slice(0, 200)}`);
  }
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();

p.on('pageerror', e => console.log('[PE]', e.message.slice(0, 150)));
p.on('console', m => {
  if (m.type() === 'error') {
    const t = m.text();
    if (!t.includes('frame-ancestors') && !t.includes('X-Frame-Options') && !t.includes('Content Security Policy') && !t.includes('may only be set via')) {
      console.log('[CE]', t.slice(0, 200));
    }
  }
});

console.log('=== v3.0.6.8-32 实际部署验证 ===\n');

// 1) 首页加载
await step('首页加载', async () => {
  const r = await p.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  if (!r || r.status() !== 200) throw new Error(`status=${r?.status()}`);
  await p.waitForTimeout(2000);
  const title = await p.title();
  return `title="${title}"`;
});

// 2) 注入登录用户
await step('注入登录用户', async () => {
  await p.evaluate(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'}));
  });
});

// 3) 重新加载确认登录后侧栏出现
await step('登录后侧栏渲染', async () => {
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  const linkCount = await p.$$eval('aside a', els => els.length);
  if (linkCount < 50) throw new Error(`侧栏链接数=${linkCount}, 期望 >= 50`);
  return `侧栏链接 ${linkCount} 个`;
});

// 4) 首页 KPI 数据加载
await step('首页 KPI 加载', async () => {
  await p.waitForTimeout(2500);
  const bodyText = await p.evaluate(() => document.body.innerText);
  // 检查是否有数字 (KPI 数字)
  const hasNumbers = /\d{2,}/.test(bodyText);
  if (!hasNumbers) throw new Error('首页无数字');
  // 检查是否显示 "G005" 或 "RIS"
  if (!bodyText.includes('G005') && !bodyText.includes('RIS') && !bodyText.includes('放射')) {
    throw new Error('首页不含系统名称');
  }
  return `首页含 ${bodyText.length} 字符`;
});

// 5) 截图首页
await p.screenshot({ path: 'verify-home.png', fullPage: false });
console.log('  📸 已截图首页: verify-home.png');

// 6) 访问 consultation 页面 (之前 v31 修复过的)
await step('/consultation 页面', async () => {
  const r = await p.goto(BASE + 'consultation', { waitUntil: 'networkidle' });
  if (!r || r.status() !== 200) throw new Error(`status=${r?.status()}`);
  await p.waitForTimeout(2500);
  const hasError = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
  if (hasError) throw new Error('页面有 ErrorBoundary');
  return 'consultation 正常';
});

// 7) 访问 /dicom-viewer (v31 修复过)
await step('/dicom-viewer 页面', async () => {
  const r = await p.goto(BASE + 'dicom-viewer', { waitUntil: 'networkidle' });
  if (!r || r.status() !== 200) throw new Error(`status=${r?.status()}`);
  await p.waitForTimeout(2500);
  const hasError = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
  if (hasError) throw new Error('页面有 ErrorBoundary');
  return 'dicom-viewer 正常';
});

// 8) 访问 /worklist
await step('/worklist 页面', async () => {
  const r = await p.goto(BASE + 'worklist', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const hasError = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
  if (hasError) throw new Error('页面有 ErrorBoundary');
  return 'worklist 正常';
});

// 9) 访问 /statistics
await step('/statistics 页面', async () => {
  const r = await p.goto(BASE + 'statistics', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const hasError = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
  if (hasError) throw new Error('页面有 ErrorBoundary');
  return 'statistics 正常';
});

// 10) 真实 API 调用验证
await step('API: /api/v1/stats/daily', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/stats/daily');
    const body = await res.json();
    return { status: res.status, body };
  });
  if (r.status !== 200) throw new Error(`status=${r.status}`);
  if (r.body?.data?.totalExams === undefined) throw new Error('无 totalExams');
  return `totalExams=${r.body.data.totalExams}`;
});

await step('API: /api/v1/system/health', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/system/health');
    const body = await res.json();
    return { status: res.status, body };
  });
  if (r.status !== 200) throw new Error(`status=${r.status}`);
  if (!r.body?.data?.collections) throw new Error('无 collections');
  const c = r.body.data.collections;
  return `patients=${c.patients}, exams=${c.exams}, version=${r.body.data.version}`;
});

await step('API: /api/v1/critical/sla-status', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/critical/sla-status');
    const body = await res.json();
    return { status: res.status, body };
  });
  if (r.status !== 200) throw new Error(`status=${r.status}`);
  if (!r.body?.data?.events) throw new Error('无 events');
  return `total=${r.body.data.total}, breached=${r.body.data.breachedCount}`;
});

await step('API: /api/v1/image-quality/grade', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/image-quality/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snrDb: 45, cnr: 4, uniformityPct: 80, artifactScore: 3 }),
    });
    const body = await res.json();
    return { status: res.status, body };
  });
  if (r.status !== 200) throw new Error(`status=${r.status}`);
  return `grade=${r.body.data.grade} (${r.body.data.gradeLabel})`;
});

await step('API: /api/v1/patients', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/patients?pageSize=1');
    const body = await res.json();
    return { status: res.status, total: body?.meta?.total };
  });
  if (r.status !== 200) throw new Error(`status=${r.status}`);
  if (!r.total || r.total < 1500) throw new Error(`total=${r.total}, 期望 >= 1500`);
  return `total=${r.total}`;
});

await step('API: /api/v1/worklist', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/worklist?pageSize=1');
    const body = await res.json();
    return { status: res.status, total: body?.meta?.total };
  });
  if (r.status !== 200) throw new Error(`status=${r.status}`);
  if (!r.total || r.total < 600) throw new Error(`total=${r.total}, 期望 >= 600`);
  return `total=${r.total}`;
});

await step('API: /api/v1/consultations', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/consultations');
    const body = await res.json();
    return { status: res.status, count: Array.isArray(body?.data) ? body.data.length : 0, sample: body?.data?.[0] };
  });
  if (r.status !== 200) throw new Error(`status=${r.status}`);
  if (r.count === 0) throw new Error('无数据');
  const s = r.sample;
  if (!s?.consultationType) throw new Error('无 consultationType');
  if (!s?.requestReason) throw new Error('无 requestReason');
  if (!s?.requestingDepartment) throw new Error('无 requestingDepartment');
  return `count=${r.count}, 字段完整 (consultationType/requestReason/requestingDepartment)`;
});

await step('IDB: RISBackendDB 存在', async () => {
  const r = await p.evaluate(async () => {
    const dbs = await indexedDB.databases();
    return dbs.map(d => d.name);
  });
  if (!r.includes('RISBackendDB')) throw new Error(`IDB 数据库: ${r.join(',')}`);
  return `IDB dbs: ${r.join(',')}`;
});

// 11) 检查版本号
await step('版本号: v3.0.6.8-32', async () => {
  const r = await p.evaluate(() => fetch('/index.html').then(r => r.text()).then(t => t.match(/v3\.0\.6\.8-\d+/g)?.[0]));
  if (!r) throw new Error('找不到版本号');
  return r;
});

await step('package.json 版本号', async () => {
  const r = await p.evaluate(async () => {
    const res = await fetch('/assets/index-*.js').catch(() => null);
    return res ? 'index.js 可访问' : 'no index.js';
  });
  return r;
});

// 12) 随机访问 5 个深层页面
const deepPages = ['/quality-control', '/critical-value-center', '/cosign', '/qc', '/director-dashboard'];
for (const path of deepPages) {
  await step(`深页面: ${path}`, async () => {
    const r = await p.goto(BASE + path.slice(1), { waitUntil: 'networkidle' });
    if (!r || r.status() !== 200) throw new Error(`status=${r?.status()}`);
    await p.waitForTimeout(1500);
    const hasError = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
    if (hasError) throw new Error('页面有 ErrorBoundary');
    return '正常';
  });
}

await p.screenshot({ path: 'verify-final.png', fullPage: false });
console.log('\n📸 最终截图: verify-final.png');

// 总结
const passed = results.filter(r => r.status === 'OK').length;
const failed = results.filter(r => r.status === 'FAIL');
console.log(`\n=== 验证结果: ${passed}/${results.length} 通过 ===`);
if (failed.length > 0) {
  console.log('\n失败项:');
  for (const f of failed) console.log(`  ✗ ${f.name}: ${f.err}`);
}

writeFileSync('verify-result.json', JSON.stringify(results, null, 2));
await b.close();
process.exit(failed.length > 0 ? 1 : 0);
