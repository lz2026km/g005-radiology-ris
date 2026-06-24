// 交互深度测试 - 每个页面内主要交互元素点击验证
// 不只是页面加载，还要测试按钮点击/Tab切换/Modal打开/筛选交互

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris/';
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
const SCREENSHOT_DIR = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\screenshots-interact';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const CSP_NOISE = ['frame-ancestors', 'X-Frame-Options', 'Content Security Policy', 'may only be set via'];
const isNoise = (msg) => CSP_NOISE.some(k => msg.includes(k));

// 危险按钮文本 (不点击,避免破坏性操作)
const DANGEROUS_PATTERNS = [
  /删除/i, /清空.*数据/i, /重置.*系统/i, /注销/i, /退出登录/i,
  /彻底删除/i, /批量删除/i, /删除所有/i,
];

// 148 sidebar + 11 extra
const SIDEBAR_PATHS = [
  '/', '/worklist', '/exams', '/patients', '/appointments',
];

const isDangerous = (text) => DANGEROUS_PATTERNS.some(p => p.test(text));

async function interactOnPage(page, path) {
  const issues = [];
  const interactions = [];

  const onPageError = (err) => issues.push({ type: 'pageerror', msg: err.message || String(err) });
  const onConsole = (msg) => {
    const text = msg.text();
    if (isNoise(text)) return;
    if (msg.type() === 'error') issues.push({ type: 'console.error', msg: text.slice(0, 150) });
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);

  try {
    // 1. 点击侧栏链接
    const link = await page.$(`aside a[href="${path}"]`);
    if (link) {
      await link.click();
      // 等 loading spinner 消失 (最多 5s)
      try {
        await page.waitForSelector('[role="status"][aria-busy="true"]', { state: 'detached', timeout: 5000 });
      } catch (_) { /* timeout OK */ }
      await page.waitForTimeout(800);
    }

    // 2. 收集所有可交互元素 (限 8 个以控制时间)
    const targets = await page.evaluate(() => {
      const main = document.querySelector('#main-content, main');
      if (!main) return [];
      const out = [];

      // 2a. Tabs (antd tab 标题)
      const tabs = main.querySelectorAll('.ant-tabs-tab, [role="tab"]');
      tabs.forEach((el, i) => {
        if (i < 2) {
          const text = el.textContent?.trim().slice(0, 30) || '';
          if (text && text.length > 0) out.push({ type: 'tab', text, idx: i });
        }
      });

      // 2b. 安全按钮 (排除危险)
      const btns = main.querySelectorAll('button, .ant-btn');
      const seen = new Set();
      btns.forEach((el, i) => {
        if (out.length >= 8) return;
        const text = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20);
        if (!text || seen.has(text)) return;
        if (text.length === 0) return;
        seen.add(text);
        // 跳过危险按钮
        if (text.match(/删除|清空|重置|注销|退出|彻底|批量删除|全部删除/)) return;
        if (text.length > 1) out.push({ type: 'button', text, idx: i });
      });

      return out.slice(0, 8);
    });

    // 3. 依次点击
    for (const t of targets) {
      if (t.type === 'tab') {
        try {
          const tabs = await page.$$('.ant-tabs-tab, [role="tab"]');
          if (tabs[t.idx]) {
            await tabs[t.idx].click();
            await page.waitForTimeout(300);
            interactions.push({ type: 'tab', text: t.text, status: 'clicked' });
          }
        } catch (e) {
          issues.push({ type: 'interact.tab', target: t.text, msg: e.message });
        }
      } else if (t.type === 'button') {
        try {
          const handles = await page.$$('#main-content button, #main-content .ant-btn');
          if (handles[t.idx]) {
            await handles[t.idx].click();
            await page.waitForTimeout(300);
            interactions.push({ type: 'button', text: t.text, status: 'clicked' });
          }
        } catch (e) {
          issues.push({ type: 'interact.button', target: t.text, msg: e.message.slice(0, 100) });
        }
      }
    }

    // 4. 最终 DOM 检查
    const finalCheck = await page.evaluate(() => {
      const main = document.querySelector('#main-content');
      return { hasContent: (main?.textContent?.trim()?.length || 0) > 50 };
    });

    if (!finalCheck.hasContent) {
      issues.push({ type: 'empty', msg: 'main content empty after interactions' });
    }
  } catch (e) {
    issues.push({ type: 'script', msg: e.message });
  }

  page.off('pageerror', onPageError);
  page.off('console', onConsole);

  return { interactions, issues };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate((u) => localStorage.setItem('ris_current_user', u), USER);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log(`Total paths: ${SIDEBAR_PATHS.length}`);

  const allResults = [];
  let totalInteractions = 0;
  let totalErrors = 0;

  for (let i = 0; i < SIDEBAR_PATHS.length; i++) {
    const path = SIDEBAR_PATHS[i];
    const r = await interactOnPage(page, path);
    totalInteractions += r.interactions.length;
    totalErrors += r.issues.length;
    const status = r.issues.length === 0 ? '✓' : '✗';
    process.stdout.write(`[${i + 1}/${SIDEBAR_PATHS.length}] ${status} ${path}  interact=${r.interactions.length}  errors=${r.issues.length}\n`);
    if (r.issues.length > 0) {
      allResults.push({ path, ...r });
    }
  }

  await browser.close();

  console.log(`\n=== 交互深度测试结果 ===`);
  console.log(`Pages tested: ${SIDEBAR_PATHS.length}`);
  console.log(`Total interactions: ${totalInteractions}`);
  console.log(`Pages with errors: ${allResults.length}`);
  console.log(`Total errors: ${totalErrors}`);

  if (allResults.length > 0) {
    console.log(`\n=== 错误页面 ===`);
    for (const r of allResults) {
      console.log(`\n--- ${r.path} (${r.issues.length} errors, ${r.interactions.length} interactions) ---`);
      for (const issue of r.issues.slice(0, 5)) {
        console.log(`  [${issue.type}] ${issue.msg?.slice(0, 120) || ''}`);
      }
    }
  }

  writeFileSync('E:\\opencode work\\FS\\G005-RISv-3.0.0\\interact-audit.json', JSON.stringify(allResults, null, 2));
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });