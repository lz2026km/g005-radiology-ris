// 真实点击测试 - 导航 + 点击按钮 + 验证
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

class Tester {
  constructor() {
    this.results = [];
    this.allErrors = [];
  }

  async setupContext(browser) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      serviceWorkers: 'allow',
    });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('ris_current_user', JSON.stringify({
          id: 'demo-admin', name: '系统管理员', role: '管理员', department: '放射科', username: 'admin',
          title: '管理员', loginTime: Date.now(),
        }));
      } catch (e) { /* ignore: SPA 跳转中间状态可能 about:blank */ }
    });
    return ctx;
  }

  async test(browser, name, path) {
    const ctx = await this.setupContext(browser);
    const page = await ctx.newPage();
    const errors = [];
    const failedReqs = [];

    page.on('pageerror', (e) => {
      if (!e.message.includes('image') && !e.message.includes('favicon')) {
        errors.push(`PAGE: ${e.message.substring(0, 120)}`);
      }
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const t = msg.text();
        if (!t.includes('mockServiceWorker') && !t.includes('source map') && !t.includes('favicon')) {
          errors.push(`CONSOLE: ${t.substring(0, 150)}`);
        }
      }
    });
    page.on('requestfailed', (req) => {
      const url = req.url();
      if (!url.includes('favicon') && !url.includes('sourceMap') && !url.includes('hot-update')) {
        failedReqs.push(`REQ: ${req.failure().errorText} ${url.split('/').pop().substring(0, 50)}`);
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        failedReqs.push(`RES: ${res.status()} ${res.url().split('/').pop().substring(0, 50)}`);
      }
    });

    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // 等待 MSW 启动 + React 渲染
      await wait(12000);

      // 1. 验证页面基本渲染
      const baseState = await page.evaluate(() => {
        const root = document.getElementById('root');
        const text = (document.body.innerText || '').toLowerCase();
        return {
          url: location.href,
          title: document.title,
          totalEls: document.querySelectorAll('*').length,
          rootLen: root ? root.innerHTML.length : 0,
          bodyText: (document.body.innerText || '').substring(0, 250),
          hasLogin: text.includes('登录') || text.includes('login'),
          hasError: text.includes('出错了') || text.includes('系统异常') || text.includes('error'),
          hasCritical: text.includes('critical') || text.includes('severe'),
          hasHome: text.includes('首页') || text.includes('工作台'),
        };
      });

      // 2. 点击所有可点击的按钮 (前 20 个)
      const buttons = await page.$$('button:not([disabled])');
      const clickedTexts = [];
      for (let i = 0; i < Math.min(20, buttons.length); i++) {
        try {
          const text = (await buttons[i].textContent() || '').trim();
          if (text.length > 0 && text.length < 50) {
            await buttons[i].click({ timeout: 2000, force: true });
            clickedTexts.push(text.substring(0, 30));
            await wait(500);
          }
        } catch (e) {
          // 忽略点击错误 (被遮挡等)
        }
      }

      // 3. 点击导航菜单 (如果存在)
      const navLinks = await page.$$('a[href^="/"]');
      for (let i = 0; i < Math.min(10, navLinks.length); i++) {
        try {
          const href = await navLinks[i].getAttribute('href');
          if (href && !href.includes('#') && href !== path) {
            await navLinks[i].click({ timeout: 2000, force: true });
            await wait(800);
          }
        } catch (e) {}
      }

      const ok = !baseState.hasError && errors.length === 0 && failedReqs.length === 0;
      const status = baseState.totalEls < 10 ? '❌' : (ok ? '✅' : '⚠️');

      console.log(`${status} ${name} (${path})`);
      console.log(`   元素: ${baseState.totalEls} / 文本: ${baseState.bodyText.length} 字符`);
      console.log(`   点击: ${clickedTexts.length} 个按钮 (${clickedTexts.slice(0, 5).join(', ')}${clickedTexts.length > 5 ? '...' : ''})`);
      if (baseState.bodyText) {
        console.log(`   内容: ${baseState.bodyText.replace(/\n+/g, ' ').substring(0, 150)}`);
      }
      if (errors.length > 0) {
        console.log(`   ⚠ ${errors.length} 错误:`);
        [...new Set(errors)].slice(0, 3).forEach(e => console.log(`     - ${e}`));
      }
      if (failedReqs.length > 0) {
        console.log(`   ⚠ ${failedReqs.length} 失败请求:`);
        [...new Set(failedReqs)].slice(0, 3).forEach(f => console.log(`     - ${f}`));
      }
      console.log();

      const result = { name, path, ok, errors: [...new Set(errors)], failedReqs: [...new Set(failedReqs)] };
      this.results.push(result);
      this.allErrors.push(...result.errors, ...result.failedReqs.map(f => `[${name}] ${f}`));
    } catch (e) {
      console.log(`❌ ${name} (${path}) - 导航失败: ${e.message.substring(0, 100)}`);
      this.results.push({ name, path, ok: false, errors: [`导航失败: ${e.message}`], failedReqs: [] });
    } finally {
      await page.close().catch(() => {});
      await ctx.close().catch(() => {});
    }
  }

  async run() {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const pages = [
      // 5 个关键页面
      ['报告书写 V3', '/reports/v3-write'],
      ['报告导出', '/report-export'],
      ['不良事件', '/safety/adverse-events'],
      ['风险管理', '/safety/risk-management'],
      ['区域报告', '/regional-report'],
      // 其他关键页面
      ['工作台', '/worklist'],
      ['检查记录', '/exams'],
      ['患者管理', '/patients'],
      ['报告审查', '/reports/review'],
      ['质量评分', '/qc'],
      ['危急值', '/critical-value'],
      ['首页 Dashboard', '/dashboard'],
      // 重要业务页面
      ['设备管理', '/devices'],
      ['预约管理', '/appointments'],
      ['DICOM 查看', '/dicom-viewer'],
      ['质控管理', '/quality-control'],
      ['知识库', '/knowledge'],
      ['统计分析', '/statistics'],
      ['部门运营', '/department-ops'],
      ['关键绩效', '/kpi'],
    ];

    for (const [name, path] of pages) {
      try {
        await this.test(browser, name, path);
      } catch (e) {
        console.log(`❌ ${name} 测试异常: ${e.message}`);
      }
    }

    await browser.close();

    // 汇总
    console.log('\n========================================');
    console.log('  完整点击测试结果汇总');
    console.log('========================================');
    const ok = this.results.filter(r => r.ok).length;
    const fail = this.results.filter(r => !r.ok);
    console.log(`✅ 完全无错: ${ok}/${this.results.length}`);
    if (fail.length > 0) {
      console.log(`⚠️ 有问题: ${fail.length}`);
      fail.forEach(r => {
        console.log(`   - ${r.name} (${r.path}): ${r.errors.length} 错误, ${r.failedReqs.length} 失败请求`);
      });
    }

    if (this.allErrors.length > 0) {
      const uniqueErrors = [...new Set(this.allErrors)];
      console.log(`\n📋 唯一错误 (${uniqueErrors.length}):`);
      uniqueErrors.slice(0, 15).forEach(e => console.log(`   - ${e}`));
    }
  }
}

new Tester().run().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
