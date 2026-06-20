// 完整测试: 登录 + 测试所有关键页面
import http from 'node:http';
import WebSocket from 'ws';

const BASE = 'http://127.0.0.1:5192/g005-radiology-ris';

async function openTab(url) {
  return new Promise((resolve, reject) => {
    http.request({ host: '127.0.0.1', port: 9222, path: `/json/new?${encodeURIComponent(url)}`, method: 'PUT' },
      (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); }
    ).end();
  });
}

function createSession(tab) {
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  return new Promise((resolve) => {
    ws.once('open', () => {
      let cmdId = 0;
      const send = (method, params) => new Promise((r, j) => {
        const id = ++cmdId;
        const handler = (data) => {
          const m = JSON.parse(data.toString());
          if (m.id === id) { ws.off('message', handler); if (m.error) j(new Error(m.error.message)); else r(m.result); }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
      resolve({ ws, send });
    });
  });
}

async function evalInPage(session, expr) {
  const r = await session.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result.value;
}

async function waitMs(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testPage(url, label, session) {
  console.log(`\n=== 测试: ${label} ===`);
  console.log(`URL: ${url}`);
  
  const tab = await openTab(url);
  const s = await createSession(tab);
  await s.send('Runtime.enable');
  await s.send('Network.enable');
  await s.send('Log.enable');

  const logs = [];
  const failures = [];
  s.ws.on('message', (data) => {
    try {
      const m = JSON.parse(data.toString());
      if (m.method === 'Network.responseReceived' && m.params.response.status >= 400)
        failures.push(`${m.params.response.status} ${m.params.response.url.split('/g005-radiology-ris/').pop()}`);
      if (m.method === 'Runtime.consoleAPICalled') {
        const args = m.params.args.map(a => a.value !== undefined ? a.value : (a.description || '?')).join(' ').substring(0, 200);
        logs.push(`[${m.params.type}] ${args}`);
      }
      if (m.method === 'Runtime.exceptionThrown') {
        const exc = m.params.exceptionDetails;
        logs.push(`[EXCEPTION] ${exc.text}: ${exc.exception?.description?.substring(0, 200) || ''}`);
      }
    } catch (e) {}
  });

  await waitMs(12000);

  // 获取页面状态
  const state = await evalInPage(s, `(() => ({
    url: location.href,
    rootLength: document.getElementById('root').innerHTML.length,
    bodyText: document.body.innerText.substring(0, 300),
    hasForms: document.querySelectorAll('form').length,
    hasInputs: document.querySelectorAll('input,select').length,
    hasButtons: document.querySelectorAll('button').length,
    hasLoading: document.body.innerText.includes('加载'),
    hasError: document.body.innerText.includes('���') || document.body.innerText.includes('错误'),
    pageTitle: document.title
  }))()`);

  s.ws.close();

  console.log(`Result: "${(state?.bodyText || '(empty)').substring(0, 100)}..."`);
  console.log(`Forms: ${state.hasForms}, Inputs: ${state.hasInputs}, Buttons: ${state.hasButtons}`);

  const ok = !state.hasLoading && !state.hasError && (state.hasForms > 0 || state.hasButtons > 4 || state.hasInputs > 0 || state.rootLength > 2000);
  if (failures.length > 0) {
    console.log(`⚠️  ${failures.length} failed requests:`);
    failures.slice(0, 5).forEach(f => console.log(`  ${f}`));
  }
  console.log(`${ok ? '✅ PASS' : '❌ FAIL'}`);

  return { ok, state, failures, logs, session: s };
}

async function main() {
  // Step 1: 打开登录页并登录
  console.log('\n========== 第一步: 测试登录页 ==========');
  const loginResult = await testPage(`${BASE}/login`, '登录页');
  
  if (loginResult.ok) {
    console.log('\n✅ 登录页渲染成功 - 尝试自动登录');
    // 选择第一个选项并点击提交
    try {
      const loginTab = await openTab(`${BASE}/login?auto`);  // 重试登录
      const s2 = await createSession(loginTab);
      await s2.send('Runtime.enable');
      await waitMs(8000);
      
      // 尝试自动登录: 点击登录按钮
      const clickResult = await evalInPage(s2, `(() => {
        const btn = document.querySelector('button[type="submit"], button, .ant-btn');
        if (btn) { btn.click(); return 'clicked button: ' + btn.textContent; }
        return 'no button found';
      })()`);
      console.log(`登录尝试: ${clickResult}`);
      await waitMs(5000);
      
      const afterLogin = await evalInPage(s2, `(() => ({
        url: location.href,
        bodyText: document.body.innerText.substring(0, 500),
        hasSidebar: document.querySelectorAll('aside, nav, .ant-layout-sider').length > 0
      }))()`);
      console.log(`登录后状态: URL=${afterLogin.url}, hasSidebar=${afterLogin.hasSidebar}, text="${afterLogin.bodyText.substring(0, 100)}"`);
      
      // Step 2: 测试 5 个目标页面
      if (afterLogin.hasSidebar) {
        console.log('\n========== 第二步: 测试 5 个目标页面 ==========');
        const pages = [
          { path: '/reports/v3-write', name: '报告书写 V3' },
          { path: '/report-export', name: '报告导出' },
          { path: '/safety/adverse-events', name: '不良事件' },
          { path: '/safety/risk-management', name: '风险管理' },
          { path: '/regional-report', name: '区域报告' }
        ];
        
        for (const p of pages) {
          await waitMs(2000);
          const navResult = await evalInPage(s2, `(() => {
            window.history.pushState({}, '', '${p.path}');
            window.dispatchEvent(new PopStateEvent('popstate'));
            return 'navigated to ${p.path}';
          })()`);
          await waitMs(12000);
          
          const pageState = await evalInPage(s2, `(() => ({
            url: location.href,
            rootHTMLlen: document.getElementById('root').innerHTML.length,
            bodyText: document.body.innerText.substring(0, 200),
            hasError: document.body.innerText.includes('���') || document.body.innerText.includes('Error'),
            forms: document.querySelectorAll('form').length,
            buttons: document.querySelectorAll('button').length,
            tables: document.querySelectorAll('table, .ant-table').length,
          }))()`);
          
          console.log(`\n${p.name}:`);
          console.log(`  URL: ${pageState.url}`);
          console.log(`  Root: ${pageState.rootHTMLlen} chars, Buttons: ${pageState.buttons}, Forms: ${pageState.forms}, Tables: ${pageState.tables}`);
          console.log(`  Text: "${pageState.bodyText.substring(0, 100)}"`);
          console.log(`${pageState.hasError ? '❌ FAIL' : '✅ PASS'}`);
        }
      }
      
      s2.ws.close();
    } catch(e) { console.error('Error during test:', e.message); }
  } else {
    console.log('❌ 登录页失败，检查错误日志');
  }

  console.log('\n========== 测试完成 ==========');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });