// ============================================================
// 本地 Chrome 完整测试脚本 v3.0.6.8-11
// 测试所有关键页面是否正常加载
// ============================================================
import http from 'node:http';
import WebSocket from 'ws';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const CDP = 'http://127.0.0.1:9222';

function httpJSON(path) {
  return new Promise((resolve, reject) => {
    http.get(CDP + path, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function newTab(url) {
  return new Promise((resolve, reject) => {
    http.request({
      host: '127.0.0.1',
      port: 9222,
      path: `/json/new?${encodeURIComponent(url)}`,
      method: 'PUT',
    }, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
      res.on('error', reject);
    }).end();
  });
}

async function closeTab(id) {
  return httpJSON(`/json/close/${id}`);
}

async function evalPage(ws, expr) {
  const id = Math.floor(Math.random() * 100000);
  return new Promise((resolve, reject) => {
    const handler = (data) => {
      try {
        const m = JSON.parse(data.toString());
        if (m.id === id) {
          ws.off('message', handler);
          if (m.error) reject(new Error(m.error.message));
          else resolve(m.result.value);
        }
      } catch {}
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
  });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// 测试单个页面
async function testPage(name, url, session) {
  const tab = await newTab(url);
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.once('open', r));

  const send = (expr) => evalPage(ws, expr);
  await send('void 0');
  await send('Runtime.enable');

  // 收集网络请求
  const failures = [];
  ws.on('message', (data) => {
    try {
      const m = JSON.parse(data.toString());
      if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) {
        failures.push(`${m.params.response.status} ${m.params.response.url.split('/g005-radiology-ris/').pop()}`);
      }
    } catch {}
  });

  // 等待加载
  await wait(8000);

  const state = await send(`({
    url: location.href,
    title: document.title,
    bodyText: document.body.innerText.substring(0, 300),
    rootLen: document.getElementById('root').innerHTML.length,
    forms: document.querySelectorAll('form').length,
    inputs: document.querySelectorAll('input,select,textarea').length,
    buttons: document.querySelectorAll('button, .ant-btn').length,
    tables: document.querySelectorAll('table, .ant-table, [class*="ant-table"]').length,
    totalEls: document.querySelectorAll('*').length,
    hasError: document.body.innerText.includes('错误') || document.body.innerText.includes('Error')
  })`);

  // 成功标准: 不是空页面、没报错
  const ok = state && !state.hasError && state.totalEls > 20 && state.bodyText.length > 5;

  console.log(`\n[${ok ? '✅' : '❌'}] ${name}`);
  console.log(`     URL: ${state?.url || 'N/A'}`);
  console.log(`     页面: ${(state?.bodyText || '(空)').replace(/\n/g, ' | ').substring(0, 120)}`);
  console.log(`     DOM: ${state?.totalEls} 元素, ${state?.rootLen} 字符, 按钮:${state?.buttons}, 表单:${state?.forms}, 输入:${state?.inputs}, 表格:${state?.tables}`);
  if (failures.length) {
    console.log(`     网络错误: ${failures.length}`);
    failures.slice(0, 3).forEach(f => console.log(`       ${f}`));
  }

  ws.close();
  await closeTab(tab.id);
  return { ok, state };
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  console.log('==========================================');
  console.log('  RIS 本地 Chrome 完整测试 v3.0.6.8-11');
  console.log('==========================================\n');

  // 1. 先关闭旧的 tabs
  const all = await httpJSON('/json');
  for (const t of all.filter(x => x.type === 'page' && x.url !== 'about:blank')) {
    try { await closeTab(t.id); } catch {}
  }
  await wait(1000);

  // 2. 验证服务器
  try {
    const r = await new Promise((resolve, reject) => {
      http.get(BASE + '/', (res) => {
        let d = '';
        res.on('data', c => (d += c));
        res.on('end', () => resolve(d));
      });
    });
    console.log(`📡 服务器: ${BASE}/ 正常`);
  } catch (e) {
    console.log(`❌ 服务器无法连接: ${e.message}`);
    console.log('请先启动: node local-server.mjs');
    process.exit(1);
  }

  // 3. 测试公共页面（无需登录）
  console.log('\n──────────────────────────────────────────');
  console.log('  第一阶段: 公共页面测试（无需登录）');
  console.log('──────────────────────────────────────────');

  const publicPages = [
    ['登录页', '/login'],
    ['测试页', '/test.html'],
    ['根路径', '/'],
  ];

  for (const [name, path] of publicPages) {
    await testPage(name, BASE + path);
  }

  // 4. 设置登录状态后测试内部页面
  console.log('\n──────────────────────────────────────────');
  console.log('  第二阶段: 登录页面测试');
  console.log('──────────────────────────────────────────');

  // 打开登录页，注入 localStorage
  const loginTab = await newTab(BASE + '/login');
  const ws = new WebSocket(loginTab.webSocketDebuggerUrl);
  await new Promise((r) => ws.once('open', r));
  await evalPage(ws, 'void 0');
  await evalPage(ws, 'Runtime.enable');
  await wait(3000);

  // 注入用户信息
  const loginResult = await evalPage(ws, `(() => {
    try {
      localStorage.setItem('ris_current_user', JSON.stringify({
        id: 'demo-admin',
        name: '系统管理员',
        role: '管理员',
        department: '放射科',
        username: 'admin',
        title: '管理员 (admin)'
      }));
      return 'localStorage set OK';
    } catch(e) {
      return 'localStorage error: ' + e.message;
    }
  })()`);
  console.log(`登录注入: ${loginResult}`);

  // 跳转到首页
  await evalPage(ws, `window.location.href = '${BASE}/'`);
  await wait(10000);

  // 检查是否登录成功（sidebar 出现）
  const afterLogin = await evalPage(ws, `({
    url: location.href,
    bodyText: document.body.innerText.substring(0, 200),
    sidebarEls: document.querySelectorAll('[class*="sidebar"], aside, nav').length,
    buttons: document.querySelectorAll('button').length,
    links: document.querySelectorAll('a[href]').length,
    totalEls: document.querySelectorAll('*').length
  })`);
  console.log(`登录后: URL=${afterLogin?.url}, totalEls=${afterLogin?.totalEls}, sidebar=${afterLogin?.sidebarEls}, btns=${afterLogin?.buttons}`);
  ws.close();

  const isLoggedIn = afterLogin && afterLogin.totalEls > 50;

  if (isLoggedIn) {
    console.log('✅ 登录成功，开始测试内部页面');

    // 5. 测试 5 个关键页面
    console.log('\n──────────────────────────────────────────');
    console.log('  第三阶段: 5 个关键页面测试');
    console.log('──────────────────────────────────────────');

    const criticalPages = [
      ['报告书写 V3', '/reports/v3-write'],
      ['报告导出', '/report-export'],
      ['不良事件', '/safety/adverse-events'],
      ['风险管理', '/safety/risk-management'],
      ['区域报告', '/regional-report'],
    ];

    for (const [name, path] of criticalPages) {
      await testPage(name, BASE + path);
    }

    // 6. 测试更多关键页面
    console.log('\n──────────────────────────────────────────');
    console.log('  第四阶段: 其他关键页面测试');
    console.log('──────────────────────────────────────────');

    const otherPages = [
      ['工作台', '/worklist'],
      ['检查记录', '/exams'],
      ['患者管理', '/patients'],
      ['预约管理', '/appointments'],
      ['报告审查', '/reports/review'],
      ['签署报告', '/cosign'],
      ['质量评分', '/qc'],
      ['危急值', '/critical-value'],
      ['质量控制', '/quality-control'],
      ['统计报告', '/statistics'],
      ['首页概览', '/'],
    ];

    for (const [name, path] of otherPages) {
      await testPage(name, BASE + path);
    }
  } else {
    console.log('❌ 登录失败，尝试直接测试页面（可能被重定向到登录）');
  }

  // 7. 汇总报告
  console.log('\n==========================================');
  console.log('  测试完成');
  console.log('==========================================');

  process.exit(0);
}

main().catch((e) => {
  console.error('\n❌ 测试脚本崩溃:', e.message);
  console.error(e.stack?.substring(0, 500));
  process.exit(1);
});
