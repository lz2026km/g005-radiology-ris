// ============================================================
// Playwright 完整浏览器测试 v3.0.6.8-11
// ============================================================
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function testPage(browser, name, path, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: 'allow',
  });

  if (opts.injectAuth) {
    // 预注入 localStorage + MSW 状态
    await ctx.addInitScript(() => {
      localStorage.setItem('ris_current_user', JSON.stringify({
        id: 'demo-admin',
        name: '系统管理员',
        role: '管理员',
        department: '放射科',
        username: 'admin',
        title: '管理员',
        loginTime: Date.now(),
      }));
      // 标记 MSW 已在该 context 启动
      window.__mswReady = false;
    });
  }

  const page = await ctx.newPage();
  const errors = [];
  const failedRequests = [];

  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // 忽略已知无害错误
      if (text.includes('mockServiceWorker') || text.includes('source map')) return;
      errors.push(text.substring(0, 150));
    }
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.includes('favicon') || url.includes('manifest') || url.includes('sourceMap')) return;
    failedRequests.push(`${req.failure().errorText}: ${url.split('/').pop().substring(0, 60)}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon') && !res.url().includes('manifest')) {
      failedRequests.push(`${res.status()}: ${res.url().split('/').pop().substring(0, 60)}`);
    }
  });

  try {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // 等待 MSW 启动 (Phase 1+2 约 13s) + React 渲染
    await wait(15000);
  } catch (e) {
    errors.push(`导航失败: ${e.message.substring(0, 100)}`);
  }

  const state = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      url: location.href,
      title: document.title,
      bodyText: (document.body.innerText || '').substring(0, 200),
      rootLen: root ? root.innerHTML.length : 0,
      rootContent: root ? root.innerText.substring(0, 200) : '',
      totalEls: document.querySelectorAll('*').length,
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input,select,textarea').length,
      buttons: document.querySelectorAll('button, [role="button"]').length,
      tables: document.querySelectorAll('table').length,
      antyEls: document.querySelectorAll('[class*="ant-"]').length,
      hasLogin: !!document.querySelector('[class*="login"]') || document.body.innerText.includes('登录'),
      hasError: !!document.querySelector('[class*="error"]') || document.body.innerText.includes('出错了') || document.body.innerText.includes('Error'),
    };
  }).catch((e) => ({ error: e.message }));

  // 截图
  const safeName = name.replace(/[\\/:*?"<>|]/g, '_');
  await page.screenshot({ path: `test-screenshots/${safeName}.png`, fullPage: false }).catch(() => {});

  await page.close();
  await ctx.close();

  const isOk = state && !state.error && state.totalEls > 20 && state.rootLen > 0 && !state.hasError;
  const status = isOk ? '✅' : (state.totalEls > 0 ? '⚠️' : '❌');

  console.log(`${status} ${name} [${path}]`);
  if (state) {
    console.log(`   URL: ${state.url.replace(BASE, '')}`);
    console.log(`   标题: ${state.title.substring(0, 50)}`);
    console.log(`   DOM: ${state.totalEls} 元素 / 文本: ${state.bodyText.length} 字符`);
    console.log(`   Antd组件: ${state.antyEls} / 表单: ${state.forms} / 按钮: ${state.buttons} / 输入: ${state.inputs} / 表格: ${state.tables}`);
    if (state.bodyText) {
      console.log(`   内容: ${state.bodyText.replace(/\n+/g, ' ').substring(0, 120)}`);
    }
  }
  if (errors.length > 0) {
    console.log(`   ⚠ 错误 (${errors.length}):`);
    errors.slice(0, 3).forEach(e => console.log(`     - ${e}`));
  }
  if (failedRequests.length > 0) {
    console.log(`   ⚠ 失败请求 (${failedRequests.length}):`);
    failedRequests.slice(0, 3).forEach(f => console.log(`     - ${f}`));
  }
  console.log();

  return { name, path, ok: isOk, state, errors, failedRequests };
}

async function main() {
  console.log('========================================');
  console.log('  RIS Playwright 完整测试 v3.0.6.8-11');
  console.log('========================================\n');

  // 准备截图目录
  const fs = await import('node:fs');
  fs.mkdirSync('test-screenshots', { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const results = [];

  // === 第一阶段: 公共页面（不需要登录）===
  console.log('────────── 公共页面 ──────────\n');
  results.push(await testPage(browser, '登录页', '/login'));
  results.push(await testPage(browser, '测试页', '/test.html'));
  results.push(await testPage(browser, '根路径', '/'));

  // === 第二阶段: 5 个关键页面（已认证）===
  console.log('\n────────── 5 个关键页面 ──────────\n');
  const criticalPages = [
    ['报告书写 V3', '/reports/v3-write'],
    ['报告导出', '/report-export'],
    ['不良事件', '/safety/adverse-events'],
    ['风险管理', '/safety/risk-management'],
    ['区域报告', '/regional-report'],
  ];
  for (const [name, path] of criticalPages) {
    results.push(await testPage(browser, name, path, { injectAuth: true }));
  }

  // === 第三阶段: 其他关键页面 ===
  console.log('\n────────── 其他关键页面 ──────────\n');
  const otherPages = [
    ['工作台', '/worklist'],
    ['检查记录', '/exams'],
    ['患者管理', '/patients'],
    ['报告审查', '/reports/review'],
    ['质量评分', '/qc'],
    ['危急值', '/critical-value'],
    ['首页 Dashboard', '/dashboard'],
  ];
  for (const [name, path] of otherPages) {
    results.push(await testPage(browser, name, path, { injectAuth: true }));
  }

  await browser.close();

  // 汇总
  console.log('\n========================================');
  console.log('  测试结果汇总');
  console.log('========================================');
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok);
  console.log(`✅ 通过: ${passed}/${results.length}`);
  if (failed.length > 0) {
    console.log(`❌ 失败: ${failed.length}`);
    failed.forEach(r => console.log(`   - ${r.name} (${r.path})`));
  }

  // 总结所有错误
  const allErrors = new Set();
  results.forEach(r => r.errors.forEach(e => allErrors.add(e)));
  if (allErrors.size > 0) {
    console.log(`\n📋 错误汇总 (${allErrors.size}):`);
    [...allErrors].slice(0, 10).forEach(e => console.log(`   - ${e}`));
  }

  // 总结所有失败请求
  const allFailedReqs = new Set();
  results.forEach(r => r.failedRequests.forEach(f => allFailedReqs.add(f)));
  if (allFailedReqs.size > 0) {
    console.log(`\n📋 失败请求汇总 (${allFailedReqs.size}):`);
    [...allFailedReqs].slice(0, 10).forEach(f => console.log(`   - ${f}`));
  }

  console.log('\n📸 截图保存在 test-screenshots/');
}

main().catch(e => {
  console.error(`\n❌ 崩溃: ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
