// =============================================================
//  G005 RIS - 深度动态测试 v2 (直接 goto)
// =============================================================
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const SHOT_DIR = 'test-screenshots/deep';
const REPORT_DIR = 'test-reports';
fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

const PAGES = [
  ['首页','/'],['登录','/login'],['工作台','/worklist'],['检查记录','/exams'],['患者管理','/patients'],
  ['随访','/follow-up'],['自助签到','/kiosk/check-in'],['院长驾驶舱','/director-dashboard'],
  ['报告书写','/write-report'],['报告列表','/reports'],['报告书写V3','/reports/v3-write'],
  ['报告审查','/report-review'],['报告导出','/report-export'],['报告送达','/report-delivery'],
  ['报告修订历史','/report-revisions'],['报告互审/会签','/cosign'],['发布管理','/publish'],
  ['协作','/collaboration'],
  ['危急值','/critical-value'],['危急值中心','/critical-value-center'],['危急值规则','/critical-value-rule'],
  ['危急值统计','/critical-value-stats'],['缺陷管理','/defect-management'],
  ['质量控制','/quality-control'],['审查中心','/review-center'],['评分规则','/report-score-rule'],
  ['缺陷库','/report-defect-library'],['特殊评估','/special-assessment'],['部门质量','/quality/department'],['质控','/qc'],
  ['CDS管理','/cds/management'],['CDS统计','/cds/statistics'],
  ['AI质控','/ai-qc'],['AI结构化报告','/ai-structured-report'],['AI报告草稿','/ai-report-draft'],
  ['AI助手','/ai-assist'],['AI医疗器械','/ai-medical-device'],
  ['DICOM查看器','/dicom-viewer'],['VNA仪表盘','/vna-dashboard'],['剂量追踪','/dose-track'],['打印管理','/print-management'],
  ['患者门户','/patient-portal'],['患者自助','/patient/self-service'],['患者服务管理','/patient/service-management'],
  ['患者报告门户','/patient-report-portal'],['患者教育','/education/patient-education'],['肿瘤筛查','/cancer-screen'],
  ['排班','/schedule'],['预约管理','/appointment-management'],['排队叫号','/queue-call'],
  ['工作流设计','/workflow-designer'],['路由规则','/routing-rules'],
  ['区域影像','/regional-imaging'],['区域报告','/regional-report'],['医联体','/hie/medical-alliance'],
  ['国家报告','/national-report'],['数据上报中心','/data-report-center'],['医保审核','/insurance-audit'],['临床数据','/clinical-data'],
  ['典型病例','/typical-cases'],['征象库','/finding-library'],['术语库','/term-library'],
  ['模板管理','/template-management'],['模板设计','/template-designer'],['模板继承','/template-inheritance'],
  ['模板分类','/template-category'],['术语同义词图','/term-synonym-graph'],['报告短语库','/report-phrase-bank'],
  ['企业搜索','/enterprise-search'],['科研','/research'],
  ['用户管理','/user-management'],['数据字典','/dictionary'],['操作日志','/operation-log'],['通知中心','/notification-center'],
  ['业务连续性','/business-continuity'],['多院区','/multi-site'],['云存储','/cloud-storage'],
  ['科室财务','/finance/department'],['患者财务','/finance/patient'],
  ['设备全生命周期','/equipment-lifecycle'],['设备管理','/devices'],['设备故障','/device-fault'],['设备效率','/equipment-efficiency'],
  ['物资管理','/materials'],['对比剂不良反应','/contrast/adverse-reactions'],['对比剂注射站','/contrast/injection-workstation'],
  ['对比剂库存','/contrast/inventory'],['对比剂质量合规','/contrast/quality-compliance'],
  ['移动患者端','/mobile/patient'],['移动医生端','/mobile/doctor'],['移动护士端','/mobile/nurse'],['移动技师端','/mobile/tech'],
  ['不良事件','/safety/adverse-events'],['持续质量改进','/safety/cqi'],['患者安全目标','/safety/patient-safety-goals'],
  ['放射安全','/safety/radiation-safety'],['RCA分析','/safety/rca-analysis'],['风险管理','/safety/risk-management'],
  ['收费项目','/charge-items'],['应收账款','/accounts-receivable'],
  ['心电数据库','/cardiac/database'],['心电运营','/cardiac/operations'],['心电质控','/cardiac/qc'],
  ['统计','/statistics'],['科室仪表盘','/department-dashboard'],['运营中心','/operations-center'],
  ['成本分析','/cost-analysis'],['工作负荷热力图','/workload-heatmap'],['SLA策略','/sla-policy'],['绿色IT','/green-it'],
  ['关键词检查','/keyword-check'],['CA签名','/ca-signature'],['区块链存证','/blockchain-proof'],
  ['报告搜索','/report-search'],['报告KPI','/report-kpi-dashboard'],['报告时效','/report-timeliness'],
  ['诊断准确率','/diagnosis-accuracy'],['医生工作量','/doctor-workload'],
  ['乳腺运营','/mammo/operations'],['乳腺质量','/mammo/quality'],
  ['运营设备','/ops/devices'],['运营人力','/ops/hr'],['运营仪表盘','/ops/dashboard'],
  ['核医学统计','/nuclear-stats'],['DICOM打印','/system/dicom-print'],
  ['收入分析','/revenue-analysis'],['成本核算','/cost-accounting'],['财务报表','/financial-reports'],
];

async function domHash(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main') || document.getElementById('root') || document.body;
    const txt = (main.innerText || '').replace(/\s+/g, ' ').slice(0, 2000);
    const btns = document.querySelectorAll('button').length;
    const tables = document.querySelectorAll('table tbody tr').length;
    const empties = document.querySelectorAll('.ant-empty, [class*="empty"]').length;
    return { hash: txt.length + ':' + btns + ':' + tables + ':' + empties, btns, tables, empties };
  });
}

async function testOne(browser, name, urlPath, idx) {
  const safeName = name.replace(/[\\/:*?"<>|\s]/g, '_');
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: 'allow',
  });

  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
      username: 'admin', title: '管理员', loginTime: Date.now(),
    }));
  });

  const page = await ctx.newPage();
  const errors = [];
  const failedRequests = [];

  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message.substring(0, 200)}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('mockServiceWorker') || text.includes('source map') || text.includes('favicon') || text.includes('Failed to load resource')) return;
      errors.push(`CONSOLE: ${text.substring(0, 200)}`);
    }
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.includes('favicon') || url.includes('manifest') || url.includes('sourceMap') || url.includes('sockjs') || url.includes('.hot-update')) return;
    failedRequests.push(`REQFAIL ${req.failure()?.errorText}: ${url.substring(0, 150)}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon') && !res.url().includes('manifest') && !res.url().includes('sockjs') && !res.url().includes('.hot-update')) {
      failedRequests.push(`HTTP ${res.status()}: ${res.url().substring(0, 150)}`);
    }
  });

  let navError = null;
  try {
    // 直接 goto, addInitScript 已经注入 localStorage
    await page.goto(BASE + urlPath, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // 等 MSW + React 渲染 + 懒加载
    await wait(8000);
  } catch (e) {
    navError = e.message.substring(0, 200);
  }

  const state = await page.evaluate(() => {
    const root = document.getElementById('root');
    const txt = (document.body.innerText || '').replace(/\s+/g, ' ').trim();
    return {
      url: location.href,
      pathname: location.pathname,
      title: document.title,
      bodyText: txt.substring(0, 400),
      bodyLen: txt.length,
      rootLen: root ? root.innerHTML.length : 0,
      totalEls: document.querySelectorAll('*').length,
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input,select,textarea').length,
      buttons: document.querySelectorAll('button').length,
      tables: document.querySelectorAll('table').length,
      tableRows: document.querySelectorAll('table tbody tr').length,
      antyEls: document.querySelectorAll('[class*="ant-"]').length,
      hasLogin: !!document.querySelector('[class*="login"]') || txt.includes('登录'),
      is404: !!document.querySelector('.ant-result-404'),
      is500: !!document.querySelector('.ant-result-500'),
      hasEmpty: document.querySelectorAll('.ant-empty, [class*="-empty"]').length > 0,
      emptyCount: document.querySelectorAll('.ant-empty, [class*="-empty"]').length,
      hasSpinner: !!document.querySelector('.ant-spin, [class*="-spin"]'),
      hasErrorText: txt.includes('出错了') || txt.includes('TypeError') || txt.includes('ReferenceError'),
      isBlank: txt.length < 10,
    };
  }).catch((e) => ({ error: e.message }));

  // 死按钮检测
  const deadButtons = [];
  try {
    const buttons = await page.$$('button:not([disabled])');
    for (let i = 0; i < Math.min(buttons.length, 6); i++) {
      const btn = buttons[i];
      const txt = (await btn.textContent() || '').trim().substring(0, 30);
      if (txt === '' || txt.includes('关闭') || txt.includes('Cancel')) continue;
      const before = await domHash(page);
      try {
        await btn.click({ timeout: 1500, force: true });
        await wait(600);
        const after = await domHash(page);
        if (before.hash === after.hash) {
          deadButtons.push({ text: txt, idx: i });
        }
      } catch (e) {}
    }
  } catch (e) {}

  const shotPath = path.join(SHOT_DIR, `${String(idx).padStart(3, '0')}-${safeName}.png`);
  await page.screenshot({ path: shotPath, fullPage: false }).catch(() => {});

  let status = 'OK';
  let issues = [];
  if (navError) { status = 'NAV_ERR'; issues.push(`导航失败: ${navError}`); }
  else if (state.error) { status = 'EVAL_ERR'; issues.push(`评估失败: ${state.error}`); }
  else if (state.is404) { status = '404'; issues.push('跳转到 404'); }
  else if (state.is500) { status = '500'; issues.push('跳转到 500'); }
  else if (state.isBlank) { status = 'BLANK'; issues.push(`空白 (文本 ${state.bodyLen} 字符)`); }
  else if (state.bodyLen < 50) { status = 'NEAR_BLANK'; issues.push(`内容极少 (${state.bodyLen} 字符): ${state.bodyText}`); }
  else if (state.hasErrorText) { status = 'ERROR_TEXT'; issues.push('页面含错误文本'); }
  else if (state.tableRows === 0 && state.tables > 0) { status = 'EMPTY_TABLE'; issues.push(`表格无数据`); }
  else if (state.hasSpinner && state.bodyLen < 100) { status = 'LOADING'; issues.push(`页面卡在加载状态`); }
  if (deadButtons.length >= 2 && status === 'OK') status = 'DEAD_BTN';
  else if (deadButtons.length > 0 && status === 'OK') status = 'OK_DEAD_BTN';

  await page.close();
  await ctx.close();

  return {
    idx, name, urlPath, status, issues,
    state: state.error ? null : {
      url: state.url, pathname: state.pathname, bodyLen: state.bodyLen,
      buttons: state.buttons, inputs: state.inputs, tables: state.tables,
      tableRows: state.tableRows, hasEmpty: state.hasEmpty, emptyCount: state.emptyCount,
      hasSpinner: state.hasSpinner, antyEls: state.antyEls, sample: state.bodyText,
    },
    errors, failedRequests, deadButtons, shotPath,
  };
}

async function main() {
  console.log('=========================================');
  console.log(`  G005 RIS 深度测试 v2 - ${PAGES.length} 页面`);
  console.log('  Playwright headless Chrome 1440x900');
  console.log('=========================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      headless: true, channel: 'chrome',
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
    console.log('使用 Chrome 浏览器\n');
  } catch (e) {
    console.log('channel=chrome 启动失败, 用 chromium headless shell');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
  }

  const results = [];
  const t0 = Date.now();

  for (let i = 0; i < PAGES.length; i++) {
    const [name, p] = PAGES[i];
    const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
    process.stdout.write(`[${String(i + 1).padStart(3, '0')}/${PAGES.length}] ${name.padEnd(16)} ${p.padEnd(40)} `);
    try {
      const r = await testOne(browser, name, p, i + 1);
      results.push(r);
      const icon = (r.status === 'OK' || r.status === 'OK_DEAD_BTN') ? 'OK' : 'XX';
      console.log(`[${icon}] ${r.status.padEnd(14)} btns=${r.state?.buttons || 0} rows=${r.state?.tableRows || 0} empty=${r.state?.emptyCount || 0} dead=${r.deadButtons.length} err=${r.errors.length} (${elapsed}s)`);
    } catch (e) {
      console.log(`CRASH: ${e.message.substring(0, 100)}`);
      results.push({ idx: i + 1, name, urlPath: p, status: 'CRASH', issues: [e.message], errors: [], failedRequests: [], deadButtons: [] });
    }
  }

  await browser.close();

  console.log('\n=========================================');
  console.log('  测试完成 - 汇总报告');
  console.log('=========================================\n');

  const total = results.length;
  const ok = results.filter(r => r.status === 'OK' || r.status === 'OK_DEAD_BTN').length;
  const fail = total - ok;
  const stats = {};
  results.forEach(r => { stats[r.status] = (stats[r.status] || 0) + 1; });
  console.log('总页面数:', total);
  console.log('通过:', ok, `(${(ok / total * 100).toFixed(1)}%)`);
  console.log('失败:', fail);
  console.log('状态分布:');
  Object.entries(stats).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  const failedPages = results.filter(r => !['OK', 'OK_DEAD_BTN'].includes(r.status));
  if (failedPages.length > 0) {
    console.log(`\n========== 失败页面详情 (${failedPages.length}) ==========`);
    failedPages.forEach(r => {
      console.log(`\n[${r.idx}] ${r.name} (${r.urlPath}) -> ${r.status}`);
      r.issues.forEach(i => console.log(`   - ${i}`));
      if (r.state?.sample) console.log(`   样本: ${r.state.sample.substring(0, 120)}`);
      if (r.errors.length > 0) {
        console.log(`   错误 (${r.errors.length}):`);
        r.errors.slice(0, 3).forEach(e => console.log(`     * ${e.substring(0, 180)}`));
      }
      if (r.deadButtons.length > 0) {
        console.log(`   死按钮 (${r.deadButtons.length}):`);
        r.deadButtons.forEach(b => console.log(`     - "${b.text}"`));
      }
    });
  }

  const allDeadBtns = results.flatMap(r => r.deadButtons.map(b => ({ page: r.name, path: r.urlPath, ...b })));
  if (allDeadBtns.length > 0) {
    console.log(`\n========== 死按钮汇总 (${allDeadBtns.length}) ==========`);
    allDeadBtns.forEach(b => console.log(`  ${b.page} (${b.path}) :: "${b.text}"`));
  }

  const allErrors = new Set();
  results.forEach(r => r.errors.forEach(e => allErrors.add(e)));
  if (allErrors.size > 0) {
    console.log(`\n========== Console/Page 错误汇总 (${allErrors.size} 条) ==========`);
    [...allErrors].slice(0, 30).forEach(e => console.log(`  - ${e.substring(0, 200)}`));
  }

  const allFailedReqs = new Map();
  results.forEach(r => r.failedRequests.forEach(f => allFailedReqs.set(f, (allFailedReqs.get(f) || 0) + 1)));
  if (allFailedReqs.size > 0) {
    console.log(`\n========== 失败请求汇总 (${allFailedReqs.size}) ==========`);
    [...allFailedReqs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([f, c]) => console.log(`  [${c}x] ${f.substring(0, 200)}`));
  }

  const emptyPages = results.filter(r => r.state?.hasEmpty || (r.state?.tables > 0 && r.state?.tableRows === 0));
  if (emptyPages.length > 0) {
    console.log(`\n========== 空表/空列表页面 (${emptyPages.length}) ==========`);
    emptyPages.forEach(r => console.log(`  ${r.name} (${r.urlPath}) :: empty=${r.state.emptyCount}, tables=${r.state.tables}, rows=${r.state.tableRows}`));
  }

  fs.writeFileSync(path.join(REPORT_DIR, 'deep-test-report.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, 'dead-buttons.json'), JSON.stringify(allDeadBtns, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, 'errors.json'), JSON.stringify([...allErrors], null, 2));
  console.log(`\n详细报告: ${REPORT_DIR}/`);
  console.log(`截图: ${SHOT_DIR}/ (${fs.readdirSync(SHOT_DIR).length} 张)`);
}

main().catch(e => { console.error('崩溃:', e.message); console.error(e.stack); process.exit(1); });
