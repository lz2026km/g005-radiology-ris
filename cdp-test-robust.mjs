// ============================================================
// 本地 Chrome 完整测试 - 鲁棒版
// ============================================================
import http from 'node:http';
import WebSocket from 'ws';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const CDP = 'http://127.0.0.1:9222';

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get(CDP + path, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          reject(new Error(`CDP parse error: ${d.substring(0, 80)}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function httpPut(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(CDP + path, { method: 'PUT' }, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(new Error(`PUT parse error: ${d.substring(0, 80)}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function newTab(url) {
  // 重试多次直到成功
  for (let i = 0; i < 5; i++) {
    try {
      return await httpPut(`/json/new?${encodeURIComponent(url)}`);
    } catch (e) {
      if (i < 4) await new Promise(r => setTimeout(r, 1000));
      else throw e;
    }
  }
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function testPage(name, url) {
  const tab = await newTab(url);
  let success = false;
  let state = null;
  let failures = [];

  try {
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r, rej) => {
      ws.once('open', r);
      ws.once('error', rej);
      setTimeout(() => rej(new Error('WS timeout')), 10000);
    });

    const evalPage = (expr) => {
      const id = Date.now() + Math.random() * 10000;
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('eval timeout')), 30000);
        const handler = (data) => {
          try {
            const m = JSON.parse(data.toString());
            if (m.id === id) {
              clearTimeout(t);
              ws.off('message', handler);
              if (m.error) reject(new Error(m.error.message));
              else if (m.result && m.result.value !== undefined) resolve(m.result.value);
              else reject(new Error('no result'));
            }
          } catch {}
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
      });
    };

    try { await evalPage('void 0'); } catch {}
    try { await evalPage('Network.enable'); } catch {}
    try { await evalPage('Runtime.enable'); } catch {}
    await wait(2000);

    // 收集失败请求
    ws.on('message', (data) => {
      try {
        const m = JSON.parse(data.toString());
        if (m.method === 'Network.responseReceived' && m.params.response.status >= 400)
          failures.push(`${m.params.response.status} ${m.params.response.url.split('/').pop().substring(0, 60)}`);
      } catch {}
    });

    // 等待页面加载
    await wait(10000);

    state = await evalPage(`({
      url: location.href,
      title: document.title,
      textLength: document.body.innerText.length,
      bodyText: document.body.innerText.substring(0, 200),
      rootLen: document.getElementById('root').innerHTML.length,
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input,select,textarea').length,
      buttons: document.querySelectorAll('button, [type="button"]').length,
      tables: document.querySelectorAll('table, [class*="ant-table"]').length,
      totalEls: document.querySelectorAll('*').length
    })`);

    success = state && state.totalEls > 10 && state.textLength > 0;
    ws.close();
  } catch (e) {
    console.log(`  ⚠ 连接错误: ${e.message}`);
  }

  // 关闭 tab
  try {
    await httpGet(`/json/close/${tab.id}`);
  } catch {}

  const okStr = (success && !name.includes('登录')) ? '✅' : (state?.totalEls > 0 ? '⚠' : '❌');
  console.log(`${okStr} ${name}`);
  if (state) {
    console.log(`    URL: ${(state.url || '').substring(0, 80)}`);
    console.log(`    内容: ${(state.bodyText || '').replace(/\n/g, ' ').substring(0, 100)}`);
    console.log(`    DOM: ${state.totalEls} 元素, ${state.rootLen} 字符, 按钮:${state.buttons}, 输入:${state.inputs}`);
  }
  if (failures.length > 0) {
    console.log(`    ⚠ ${failures.length} 个网络失败`);
    failures.slice(0, 3).forEach(f => console.log(`      ${f}`));
  }

  return { success, state, failures };
}

async function main() {
  console.log('========================================');
  console.log('  RIS 本地 Chrome 测试 v3.0.6.8-11');
  console.log('========================================\n');

  // 验证服务器
  try {
    await httpGet('/json/version');
    console.log('✅ Chrome CDP Ready\n');
  } catch {
    console.log('❌ Chrome CDP 不可用');
    process.exit(1);
  }

  // === 第一阶段: 公共页面 ===
  console.log('────────── 公共页面 ──────────');
  await testPage('登录页', BASE + '/login');
  await testPage('测试页', BASE + '/test.html');
  await testPage('根路径', BASE + '/');

  // === 设置登录 ===
  console.log('\n────────── 设置登录状态 ──────────');
  const loginTab = await newTab(BASE + '/login');
  try {
    const ws = new WebSocket(loginTab.webSocketDebuggerUrl);
    await new Promise((r, rej) => { ws.once('open', r); ws.once('error', rej); setTimeout(() => rej(new Error('ws timeout')), 10000); });
    const ep = (expr) => {
      const id = Date.now() + Math.random() * 10000;
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('timeout')), 15000);
        const handler = (data) => {
          try {
            const m = JSON.parse(data.toString());
            if (m.id === id) { clearTimeout(t); ws.off('message', handler); resolve(m.result?.value); }
          } catch {}
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
      });
    };
    await wait(3000);
    await ep('Runtime.enable');
    await ep(`(() => {
      localStorage.setItem('ris_current_user', JSON.stringify({ id:'demo-admin', name:'系统管理员', role:'管理员', department:'放射科', username:'admin', title:'管理员' }));
      return '登录注入完成';
    })()`);
    console.log('✅ localStorage 登录注入成功');
    ws.close();
    await httpGet(`/json/close/${loginTab.id}`);
  } catch (e) {
    console.log(`❌ 登录注入失败: ${e.message}`);
  }

  // === 第二阶段: 5 个关键页面 ===
  console.log('\n────────── 5 个关键页面 ──────────');
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

  // === 第三阶段: 其他页面 ===
  console.log('\n────────── 其他关键页面 ──────────');
  const otherPages = [
    ['工作台', '/worklist'],
    ['检查记录', '/exams'],
    ['患者管理', '/patients'],
    ['报告审查', '/reports/review'],
    ['质量评分', '/qc'],
    ['危急值', '/critical-value'],
    ['首页', '/'],
  ];
  for (const [name, path] of otherPages) {
    await testPage(name, BASE + path);
  }

  console.log('\n========================================');
  console.log('  测试完成');
  console.log('========================================');
}

main().catch(e => {
  console.error(`\n❌ 测试崩溃: ${e.message}`);
  process.exit(1);
});
