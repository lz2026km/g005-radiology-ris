/**
 * 眼科模块 - 深度点击测试 v8
 * 单 context + 单 page + pushState SPA 内导航
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5200/g005-radiology-ris';
const SHOT_DIR = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\test-screenshots\\deep';
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const PAGES = [
  { id: '01-eye',           name: '工作台',       path: '/eye' },
  { id: '02-pacs-list',     name: '影像中心',     path: '/eye/pacs' },
  { id: '03-pacs-viewer',   name: '查看器',       path: '/eye/pacs/viewer?studyId=es-001' },
  { id: '04-fundus',        name: '眼底彩照',     path: '/eye/pacs/fundus' },
  { id: '05-oct',           name: 'OCT',         path: '/eye/pacs/oct' },
  { id: '06-oct-a',         name: 'OCT-A',       path: '/eye/pacs/oct-a' },
  { id: '07-visual-field',  name: '视野',         path: '/eye/pacs/visual-field' },
  { id: '08-topography',    name: '角膜地形',     path: '/eye/pacs/topography' },
  { id: '09-ffa',           name: 'FFA',         path: '/eye/pacs/ffa' },
  { id: '10-compare',       name: '图像对比',     path: '/eye/pacs/compare' },
  { id: '11-montage',       name: '拼图',         path: '/eye/pacs/montage' },
  { id: '12-ris',           name: 'RIS流程',     path: '/eye/ris' },
  { id: '13-report-write',  name: '报告书写',     path: '/eye/report-write' },
  { id: '14-iol-calc',      name: 'IOL 计算器',  path: '/eye/ris/iol-calculator' },
  { id: '15-va',            name: '视力检查',     path: '/eye/ris/va' },
  { id: '16-iop',           name: '眼压测量',     path: '/eye/ris/iop' },
  { id: '17-emr',           name: '眼科 EMR',     path: '/eye/emr' },
  { id: '18-ai',            name: 'AI 辅助',     path: '/eye/ai' },
  { id: '19-kpi',           name: '质控看板',     path: '/eye/kpi-dashboard' },
];

const ERROR_PATTERNS = [
  /暂无数据/, /暂无记录/, /暂无内容/, /无数据/, /空数据/, /没有数据/,
  /加载失败/, /加载错误/, /请求失败/, /出错了/, /系统异常/,
  /\bundefined\b/, /\bNaN\b/, /Invalid Date/,
];

const CONSOLE_FILTER = (text) => {
  return !text.includes('mockServiceWorker')
    && !text.includes('favicon')
    && !text.includes('source map')
    && !text.includes('hot-update')
    && !text.includes('[MSW]')
    && !text.includes('404 (Not Found)');
};

console.log('========================================');
console.log('  G005 眼科模块 - 深度点击测试 v8');
console.log('========================================');
console.log('  目标: ' + BASE);
console.log('  页面数: ' + PAGES.length);
console.log('  截图: ' + SHOT_DIR);
console.log('========================================\n');

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
      phone: '13800000000', username: 'admin',
    }));
  } catch (e) {}
});

const page = await ctx.newPage();

const globalErrors = [];
page.on('pageerror', (e) => {
  if (!e.message.includes('favicon')) globalErrors.push({ type: 'pageerror', msg: e.message });
});
page.on('console', (m) => {
  if (m.type() === 'error' && CONSOLE_FILTER(m.text())) {
    globalErrors.push({ type: 'console', msg: m.text() });
  }
});
page.on('requestfailed', (req) => {
  const url = req.url();
  if (!url.includes('favicon') && !url.includes('sourceMap') && !url.includes('hot-update')) {
    globalErrors.push({ type: 'requestfailed', msg: (req.failure() && req.failure().errorText || '?') + ' ' + url.split('/').pop() });
  }
});
page.on('response', (res) => {
  if (res.status() >= 400 && !res.url().includes('favicon')) {
    globalErrors.push({ type: 'http', msg: res.status() + ' ' + res.url().split('/').pop() });
  }
});

const results = [];

// 预热: 直接访问 /eye
console.log('[*] 预热: 访问 /eye');
await page.goto(BASE + '/eye', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(8000);
const warm = await page.evaluate(() => ({
  href: location.href,
  bodyLen: (document.body.innerText || '').length,
  hasUser: !!localStorage.getItem('ris_current_user'),
}));
console.log('    URL: ' + warm.href + ', body=' + warm.bodyLen + 'ch, hasUser=' + warm.hasUser + '\n');

// 逐页测试 - 使用 pushState 在 SPA 内导航
for (const pg of PAGES) {
  console.log('\n[' + pg.id + '] ' + pg.name + '  (' + pg.path + ')');
  const startErrors = globalErrors.length;
  const shotPath = path.join(SHOT_DIR, pg.id + '.png');

  try {
    const t0 = Date.now();
    // 使用 pushState + popstate 触发 React Router
    const navOk = await page.evaluate((fullPath) => { try { window.history.pushState({}, '', fullPath); window.dispatchEvent(new PopStateEvent('popstate')); return location.pathname; } catch (e) { return null; } }, BASE + pg.path);
    await page.waitForTimeout(5000);
    const ms = Date.now() - t0;

    const data = await page.evaluate(() => {
      const body = document.body;
      const text = body ? (body.innerText || '') : '';
      const all = document.querySelectorAll('*');
      const buttons = Array.from(document.querySelectorAll('button'));
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      const tables = Array.from(document.querySelectorAll('table'));
      const links = Array.from(document.querySelectorAll('a'));
      const imgs = Array.from(document.querySelectorAll('img'));
      const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
      return {
        bodyLen: text.length,
        bodyHead: text.substring(0, 300).replace(/\s+/g, ' ').trim(),
        bodyTail: text.substring(Math.max(0, text.length - 200)).replace(/\s+/g, ' ').trim(),
        elCount: all.length,
        btnCount: buttons.length,
        btnDisabled: buttons.filter((b) => b.disabled).length,
        inputCount: inputs.length,
        tableCount: tables.length,
        tableRows: tables.map((t) => t.querySelectorAll('tr').length),
        linkCount: links.length,
        imgCount: imgs.length,
        cardCount: cards.length,
        title: document.title,
        url: location.href,
        onLogin: location.href.includes('/login'),
        hasUser: !!localStorage.getItem('ris_current_user'),
      };
    });

    await page.screenshot({ path: shotPath, fullPage: false });

    const errHits = [];
    if (data.bodyLen < 10000 && data.bodyLen > 0) {
      const fullText = await page.locator('body').textContent();
      for (const re of ERROR_PATTERNS) {
        if (re.test(fullText)) errHits.push(re.source);
      }
    }

    let status = 'OK';
    const reasons = [];
    if (data.onLogin) { status = '重定向到 /login'; reasons.push('被 RequireAuth 拦截'); }
    else if (data.bodyLen < 200) { status = '空白'; reasons.push('body=' + data.bodyLen + 'ch'); }
    else if (data.bodyLen < 1000) { status = '内容偏少'; reasons.push('body=' + data.bodyLen + 'ch'); }
    if (data.bodyHead.includes('403') || data.bodyHead.includes('无权访问')) {
      status = '403'; reasons.push('无权访问');
    }
    if (data.bodyHead.includes('did you mean') || data.bodyHead.includes('public base URL')) {
      status = '404 fallback'; reasons.push('命中 404.html / 路由错误');
    }
    if (errHits.length > 0) {
      reasons.push('空/错文本: ' + errHits.slice(0, 3).join('|'));
    }
    const errType = globalErrors.slice(startErrors).filter((e) => e.type === 'pageerror' || e.type === 'http');
    if (errType.length > 0) {
      reasons.push('错误 ' + errType.length + ' 条');
    }

    // 按钮点击测试
    const clickResults = [];
    if (data.btnCount > 0 && data.btnCount <= 100 && !data.onLogin && status !== '404 fallback') {
      const btnHandles = await page.$$('button:not([disabled])');
      const beforeClickUrl = page.url();
      let clickedCount = 0;
      let noRespCount = 0;
      for (let i = 0; i < Math.min(10, btnHandles.length); i++) {
        const bt = btnHandles[i];
        const txt = (await bt.textContent() || '').trim();
        if (!txt || txt.length > 30) continue;
        try {
          const clickBefore = await page.evaluate(() => ({
            url: location.href,
            modalCount: document.querySelectorAll('.ant-modal, [class*="modal"], [class*="Modal"], [role="dialog"]').length,
            text: (document.body.innerText || '').length,
          }));
          await bt.click({ force: true, timeout: 2000 });
          await page.waitForTimeout(700);
          const clickAfter = await page.evaluate(() => ({
            url: location.href,
            modalCount: document.querySelectorAll('.ant-modal, [class*="modal"], [class*="Modal"], [role="dialog"]').length,
            text: (document.body.innerText || '').length,
          }));
          const changed = (clickBefore.url !== clickAfter.url)
            || (clickBefore.modalCount !== clickAfter.modalCount)
            || Math.abs(clickBefore.text - clickAfter.text) > 50;
          clickedCount++;
          if (!changed) noRespCount++;
          clickResults.push({ text: txt.substring(0, 20), changed, modal: clickAfter.modalCount });
        } catch (e) {
          clickResults.push({ text: txt.substring(0, 20), error: e.message.substring(0, 50) });
        }
      }
      await page.evaluate(() => {
        document.querySelectorAll('.ant-modal-close, [class*="close"], [aria-label="Close"]').forEach((e) => e.click());
      });

      reasons.push('点击 ' + clickedCount + '/' + Math.min(10, btnHandles.length) + ' 按钮, 无响应 ' + noRespCount);
    }

    const sym = status === 'OK' ? 'OK ' : (status === '空白' || status === '内容偏少' ? '!! ' : '?  ');
    console.log('  ' + sym + '状态=' + status + ', 耗时=' + ms + 'ms, 元素=' + data.elCount + ', body=' + data.bodyLen + 'ch');
    console.log('     按钮=' + data.btnCount + '(禁用' + data.btnDisabled + '), 表格=' + data.tableCount + ', 输入=' + data.inputCount + ', 链接=' + data.linkCount + ', 卡片=' + data.cardCount);
    console.log('     截图: ' + shotPath);
    if (data.tableCount > 0) {
      console.log('     表格行数: ' + data.tableRows.join(', '));
    }
    if (data.bodyHead) {
      console.log('     首屏: ' + data.bodyHead.substring(0, 120) + '...');
    }
    if (data.bodyTail && data.bodyHead) {
      console.log('     尾部: ...' + data.bodyTail.substring(Math.max(0, data.bodyTail.length - 120)));
    }
    if (reasons.length > 0) {
      console.log('     [提示] ' + reasons.join('; '));
    }
    if (clickResults.length > 0) {
      const noResp = clickResults.filter((c) => c.changed === false);
      if (noResp.length > 0) {
        console.log('     [无响应按钮 ' + noResp.length + '/' + clickResults.length + ']:');
        noResp.slice(0, 5).forEach((c) => console.log('       - "' + c.text + '"'));
      }
    }

    results.push({
      id: pg.id, name: pg.name, path: pg.path, status,
      bodyLen: data.bodyLen, elCount: data.elCount,
      btnCount: data.btnCount, btnDisabled: data.btnDisabled,
      inputCount: data.inputCount, tableCount: data.tableCount, tableRows: data.tableRows,
      linkCount: data.linkCount, cardCount: data.cardCount,
      errHits, clickResults,
      errors: globalErrors.slice(startErrors),
      screenshot: shotPath,
      ms,
      finalUrl: data.url,
    });
  } catch (e) {
    console.log('  ? 异常: ' + e.message.substring(0, 200));
    results.push({
      id: pg.id, name: pg.name, path: pg.path, status: 'EXCEPTION',
      error: e.message, screenshot: shotPath,
      errors: globalErrors.slice(startErrors),
    });
  }
}

await browser.close();

// =================== 汇总 ===================
console.log('\n\n========================================');
console.log('  测试结果汇总');
console.log('========================================\n');

const ok = results.filter((r) => r.status === 'OK');
const blank = results.filter((r) => r.status === '空白' || r.status === '内容偏少');
const errs = results.filter((r) => r.status === 'EXCEPTION' || r.status === '403' || r.status === '404 fallback' || r.status.startsWith('重定向'));

console.log('[概况] 总 ' + results.length + ' 页, OK=' + ok.length + ', 异常=' + errs.length + ', 内容偏少=' + blank.length + '\n');

console.log('--- 页面状态 ---');
results.forEach((r) => {
  const sym = r.status === 'OK' ? '[OK ]' : (r.status === '空白' || r.status === '内容偏少' ? '[!  ]' : '[ERR]');
  const tableInfo = r.tableCount !== undefined ? ' 表格=' + r.tableCount + (r.tableCount > 0 ? '(行' + (r.tableRows || []).join(',') + ')' : '') : '';
  const btnInfo = r.btnCount !== undefined ? ' 按钮=' + r.btnCount : '';
  const errCount = (r.errors || []).length;
  const finalUrl = r.finalUrl ? ' url=' + (r.finalUrl.replace(BASE, '') || '/') : '';
  console.log('  ' + sym + ' ' + r.id.padEnd(18) + ' ' + r.name.padEnd(10) + ' body=' + String(r.bodyLen || 0).padStart(5) + 'ch 元素=' + String(r.elCount || 0).padStart(4) + btnInfo + tableInfo + ' 错误=' + errCount + finalUrl);
});

console.log('\n--- 空表 / 仅表头 ---');
const emptyTables = results.filter((r) => r.tableCount > 0 && (r.tableRows || []).every((rows) => rows <= 1));
if (emptyTables.length === 0) {
  console.log('  (无)');
} else {
  emptyTables.forEach((r) => {
    console.log('  [' + r.id + '] ' + r.name + ' - ' + r.tableCount + ' 个表,行数:' + (r.tableRows || []).join(','));
  });
}

console.log('\n--- 空状态文本 (无数据/暂无数据/未找到 等) ---');
const emptyTextResults = [];
for (const r of results) {
  if (r.status === 'EXCEPTION') continue;
  for (const h of (r.errHits || [])) {
    emptyTextResults.push({ id: r.id, name: r.name, pattern: h });
  }
}
if (emptyTextResults.length === 0) {
  console.log('  (无)');
} else {
  emptyTextResults.forEach((e) => console.log('  [' + e.id + '] ' + e.name + ': ' + e.pattern));
}

console.log('\n--- 无响应按钮 ---');
const noRespButtons = [];
for (const r of results) {
  if (!r.clickResults) continue;
  const noResp = r.clickResults.filter((c) => c.changed === false);
  noResp.forEach((c) => noRespButtons.push({ id: r.id, name: r.name, btn: c.text }));
}
if (noRespButtons.length === 0) {
  console.log('  (无 - 所有点击的按钮都有响应)');
} else {
  console.log('  共 ' + noRespButtons.length + ' 个:');
  noRespButtons.forEach((b) => console.log('    [' + b.id + '] ' + b.name + ': "' + b.btn + '"'));
}

console.log('\n--- 全部 console / pageerror 错误 (去重) ---');
const allErrs = [];
for (const r of results) {
  for (const e of (r.errors || [])) {
    allErrs.push('[' + r.id + '] [' + e.type + '] ' + e.msg);
  }
}
const uniqueErrs = [...new Set(allErrs)];
if (uniqueErrs.length === 0) {
  console.log('  (无错误)');
} else {
  console.log('  唯一错误 ' + uniqueErrs.length + ' 条:');
  uniqueErrs.slice(0, 40).forEach((e) => console.log('    ' + e.substring(0, 220)));
  if (uniqueErrs.length > 40) console.log('    ... 共 ' + uniqueErrs.length + ' 条, 已截断');
}

console.log('\n--- 截图清单 ---');
results.forEach((r) => console.log('  ' + r.id + '.png -> ' + r.screenshot));

const reportPath = path.join(SHOT_DIR, 'report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
console.log('\n[JSON 报告] ' + reportPath);
