/** A13 - Playwright 动态审核：模拟用户点击找出崩溃/死按钮
 *  v3.0.6.8-23a 升级 - 测试 111 页面
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const NAV_TIMEOUT = 12000;
const WAIT_AFTER_NAV = 2500;

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const results = [];

// 登录
await page.goto(BASE + '/', { waitUntil: 'load', timeout: NAV_TIMEOUT }).catch(() => {});
await page.waitForTimeout(3000);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
  }));
});
await page.reload({ waitUntil: 'load', timeout: NAV_TIMEOUT }).catch(() => {});
await page.waitForTimeout(4000);

page.on('pageerror', (e) => {
  const last = results[results.length - 1];
  if (last) last.errs.push(`pageerror: ${(e.message || String(e)).substring(0, 350)}`);
});
page.on('console', (m) => {
  if (m.type() === 'error' &&
      !m.text().includes('404') &&
      !m.text().includes('favicon') &&
      !m.text().includes('Failed to load resource')) {
    const last = results[results.length - 1];
    if (last) last.errs.push(`console.error: ${m.text().substring(0, 350)}`);
  } else if (m.type() === 'warning') {
    const last = results[results.length - 1];
    if (last && last.errs.length < 8) last.warns.push(`console.warn: ${m.text().substring(0, 200)}`);
  }
});

// 111 测试页面（按用户列表归类）
const ALL_PAGES = [
  // 首页/登录
  '/',
  '/login',

  // 19 眼科
  '/eye',
  '/eye/pacs',
  '/eye/pacs/fundus',
  '/eye/pacs/oct',
  '/eye/pacs/oct-a',
  '/eye/pacs/visual-field',
  '/eye/pacs/topography',
  '/eye/pacs/ffa',
  '/eye/pacs/compare',
  '/eye/pacs/montage',
  '/eye/pacs/viewer',
  '/eye/ris',
  '/eye/ris/iol-calculator',
  '/eye/ris/va',
  '/eye/ris/iop',
  '/eye/emr',
  '/eye/ai',

  // 50 业务页
  '/worklist',
  '/write-report',
  '/reports/v3-write',
  '/report-review',
  '/critical-value',
  '/quality-control',
  '/follow-up',
  '/queue-call',
  '/operation-log',
  '/equipment-efficiency',
  '/devices',
  '/device-fault',
  '/schedule',
  '/appointment-management',
  '/dictionary',
  '/enterprise-search',
  '/insurance-audit',
  '/dicom-viewer',
  '/dose-track',
  '/print-management',
  '/vna-dashboard',
  '/workflow-designer',
  '/routing-rules',
  '/sla-policy',
  '/workload-heatmap',
  '/report-revisions',
  '/report-export',
  '/report-delivery',
  '/cosign',
  '/typical-cases',
  '/finding-library',
  '/term-library',
  '/template-management',
  '/template-designer',
  '/template-inheritance',
  '/template-category',
  '/statistics',
  '/department-dashboard',
  '/operations-center',
  '/cost-analysis',
  '/user-management',
  '/notification-center',
  '/finance/department',
  '/finance/patient',
  '/equipment-lifecycle',
  '/mammo/operations',
  '/mammo/quality',
  '/director-dashboard',
  '/cds/management',
  '/cds/statistics',

  // 30 系统/安全/医联体/科研
  '/safety/adverse-events',
  '/safety/cqi',
  '/safety/patient-safety-goals',
  '/safety/radiation-safety',
  '/safety/rca-analysis',
  '/safety/risk-management',
  '/contrast/adverse-reactions',
  '/contrast/injection-workstation',
  '/contrast/inventory',
  '/contrast/quality-compliance',
  '/mobile/patient',
  '/mobile/doctor',
  '/mobile/nurse',
  '/mobile/tech',
  '/patient-portal',
  '/patient-report-portal',
  '/education/patient-education',
  '/cancer-screen',
  '/kiosk/check-in',
  '/regional-imaging',
  '/regional-report',
  '/hie/medical-alliance',
  '/national-report',
  '/data-report-center',
  '/research',
  '/clinical-data',

  // 25 质控/危急值/AI/报告/修订
  '/review-center',
  '/report-score-rule',
  '/report-defect-library',
  '/defect-management',
  '/special-assessment',
  '/ai-qc',
  '/ai-structured-report',
  '/ai-report-draft',
  '/ai-assist',
  '/ai-medical-device',
  '/report-phrase-bank',
  '/term-synonym-graph',
  '/critical-value-center',
  '/critical-value-rule',
  '/critical-value-stats',
];

// 去重保序
const seen = new Set();
const PAGES = ALL_PAGES.filter(p => {
  if (seen.has(p)) return false;
  seen.add(p);
  return true;
});

console.log(`# A13 动态审核开始\n测试页数: ${PAGES.length}\n`);

for (const path of PAGES) {
  const entry = { path, len: 0, errs: [], warns: [], btnClick: false, inputTest: false, crash: false };
  results.push(entry);
  try {
    // 先回到首页以清掉 SPA 状态
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: NAV_TIMEOUT }).catch(() => {});
    await page.waitForTimeout(400);
    // SPA 路由跳转
    await page.evaluate((u) => {
      window.history.pushState({}, '', u);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, BASE + path).catch(() => {});
    await page.waitForTimeout(WAIT_AFTER_NAV);

    const body = (await page.locator('body').textContent().catch(() => '')) || '';
    entry.len = body.length;
    entry.crash = body.includes('不是有效的') ||
                  body.includes('意外错误') ||
                  body.includes('ErrorBoundary caught') ||
                  body.includes('Cannot read') ||
                  (body.length < 100);

    // 点击第一个非禁用按钮 (跳过纯链接)
    try {
      const btn = page.locator('button:not([disabled])').first();
      if (await btn.count() > 0) {
        const beforeErrs = entry.errs.length;
        await btn.click({ timeout: 1500, force: true }).catch(() => {});
        await page.waitForTimeout(700);
        entry.btnClick = true;
        if (entry.errs.length > beforeErrs) {
          entry.btnErr = entry.errs[beforeErrs];
        }
      }
    } catch {}

    // 在第一个 input/textarea 输入字符
    try {
      const inp = page.locator('input:not([disabled]):not([type=hidden]), textarea:not([disabled])').first();
      if (await inp.count() > 0) {
        const beforeErrs = entry.errs.length;
        await inp.fill('test123', { timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(500);
        entry.inputTest = true;
        if (entry.errs.length > beforeErrs) {
          entry.inputErr = entry.errs[beforeErrs];
        }
      }
    } catch {}

    const errCount = entry.errs.length;
    const status = entry.crash || errCount > 0 ? '❌' : '✅';
    console.log(`${status} ${path.padEnd(42)} len=${String(entry.len).padStart(5)} errs=${errCount} btn=${entry.btnClick ? 'Y' : '-'} inp=${entry.inputTest ? 'Y' : '-'}`);
    if (errCount > 0) {
      const unique = [...new Set(entry.errs)];
      unique.slice(0, 2).forEach(e => console.log(`     ↳ ${e.substring(0, 180)}`));
    }
  } catch (e) {
    entry.errs.push(`navig: ${(e.message || String(e)).substring(0, 200)}`);
    console.log(`⚠️  ${path.padEnd(42)} 导航失败: ${(e.message || '').substring(0, 80)}`);
  }
}

await browser.close();

// ====== 汇总统计 ======
const ok = results.filter(r => !r.crash && r.errs.length === 0).length;
const crash = results.filter(r => r.crash).length;
const withErr = results.filter(r => r.errs.length > 0).length;
const totalErrs = results.reduce((s, r) => s + r.errs.length, 0);

console.log(`\n=== 汇总 ===`);
console.log(`总页面: ${results.length}`);
console.log(`✅ 正常: ${ok}`);
console.log(`❌ 异常: ${withErr}`);
console.log(`💥 崩溃: ${crash}`);
console.log(`错误总数: ${totalErrs}`);

// 保存结果
const output = {
  timestamp: new Date().toISOString(),
  summary: { total: results.length, ok, withErr, crash, totalErrs },
  pages: results.map(r => ({
    path: r.path,
    len: r.len,
    crash: r.crash,
    errs: r.errs,
    warns: r.warns,
    btnClick: r.btnClick,
    inputTest: r.inputTest,
    btnErr: r.btnErr,
    inputErr: r.inputErr,
  })),
};
fs.writeFileSync('a13-test-results.json', JSON.stringify(output, null, 2));
console.log('\n详细结果已写入 a13-test-results.json');