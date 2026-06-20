// 本测试: 登录 + 测试所有关键页面 (预览服务器端口 5193)
import http from 'node:http';
import WebSocket from 'ws';

const BASE = 'http://127.0.0.1:5193/g005-radiology-ris';

function openTab(url) {
  return new Promise((r, j) => {
    http.request({ host: '127.0.0.1', port: 9222, path: `/json/new?${encodeURIComponent(url)}`, method: 'PUT' },
      (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d))); }
    ).on('error', j).end();
  });
}

async function main() {
  let cmdId = 10;
  function createSession(tab) {
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    return new Promise((resolve) => {
      ws.once('open', () => {
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

  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const evalPage = async (s, expr, delay = 0) => {
    if (delay) await wait(delay);
    try {
      const r = await s.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return r.result.value;
    } catch (e) {
      return { error: e.message };
    }
  };

  // Step 1: 打开登录页
  console.log('=== 打开登录页 ===');
  const tab = await openTab(`${BASE}/login`);
  console.log('URL:', tab.url);
  const s = await createSession(tab);
  await s.send('Runtime.enable');
  await s.send('Network.enable');
  
  const failures = [];
  s.ws.on('message', (data) => {
    try {
      const m = JSON.parse(data.toString());
      if (m.method === 'Network.responseReceived' && m.params.response.status >= 400)
        failures.push(`${m.params.response.status} ${m.params.response.url.split('/g005-radiology-ris/').pop()}`);
    } catch(e) {}
  });

  // 等待 10s 加载
  await wait(10000);
  
  // 检查登录页
  let state = await evalPage(s, `({
    url: location.href,
    bodyText: document.body.innerText.substring(0, 300),
    forms: document.querySelectorAll('form').length,
    inputs: document.querySelectorAll('input,select').length,
    buttons: document.querySelectorAll('button').length
  })`);
  console.log('登录页:', JSON.stringify(state));
  
  if (state?.forms > 0 || state?.inputs > 0) {
    console.log('✅ 登录页有表单 - 尝试提交');
    
    // 用 localStorage 设置用户模拟登录
    await evalPage(s, `({success: (() => {
      localStorage.setItem('ris_current_user', JSON.stringify({
        id: 'demo-admin', name: '系统管理员', role: '管理员',
        department: '放射科', username: 'admin', title: '管理员 (admin)'
      }));
      window.location.href = '${BASE}/';
      return 'login done, redirecting';
    })()})`);
    
    await wait(6000);
    
    state = await evalPage(s, `({
      url: location.href,
      bodyText: document.body.innerText.substring(0, 500),
      hasSidebar: document.querySelectorAll('aside, nav, [class*="sidebar"], [class*="ant-layout-sider"]').length > 0,
      buttons: document.querySelectorAll('button').length,
      links: document.querySelectorAll('a[href], [class*="menu-item"], nav > div > div').length
    })`);
    console.log('登录后:', state?.bodyText?.substring(0, 120));
    console.log('hasSidebar:', state?.hasSidebar, 'butons:', state?.buttons);
    
    if (state?.hasSidebar) {
      // 测试 5 个关键页面
      const pages = [
        { path: '/reports/v3-write', name: '报告书写 V3' },
        { path: '/report-export', name: '报告导出' },
        { path: '/safety/adverse-events', name: '不良事件' },
        { path: '/safety/risk-management', name: '风险管理' },
        { path: '/regional-report', name: '区域报告' }
      ];
      
      for (const p of pages) {
        console.log(`\n=== ${p.name} (${p.path}) ===`);
        await evalPage(s, `window.history.pushState({},'', '${p.path}'); window.dispatchEvent(new PopStateEvent('popstate')); void 0`, 200);
        await wait(12000);
        
        state = await evalPage(s, `({
          url: location.href,
          bodyText: document.body.innerText.substring(0, 300),
          rootHTMLlen: document.getElementById('root').innerHTML.length,
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input, select, textarea').length,
          tables: document.querySelectorAll('table, .ant-table, [class*="ant-table"]').length,
          errorShown: document.body.innerText.length < 5
        })`);
        
        const ok = !state?.errorShown && (state?.rootHTMLlen > 2000 || state?.buttons > 3 || state?.inputs > 0 || state?.tables > 0);
        console.log(`  ${ok ? '✅' : '❌'} Text: "${(state?.bodyText || '').substring(0, 80)}"`);
        console.log(`  Root: ${state?.rootHTMLlen}c Btns:${state?.buttons} Inp:${state?.inputs} Tbl:${state?.tables}`);
      }
    } else {
      console.log('❌ 没有 sidebar');
    }
  } else {
    console.log('❌ 登录页无表单');
  }
  
  if (failures.length) {
    console.log(`\n=== 404s (${failures.length}) ===`);
    failures.slice(0, 10).forEach(f => console.log(f));
  }
  
  s.ws.close();
  console.log('\n=== 完成 ===');
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });