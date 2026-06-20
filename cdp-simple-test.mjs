// 简化测试: 固定用单一 tab 逐步操作
import http from 'node:http';
import WebSocket from 'ws';

function openTab(url) {
  return new Promise((r, j) => {
    http.request({ host: '127.0.0.1', port: 9222, path: `/json/new?${encodeURIComponent(url)}`, method: 'PUT' },
      (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d))); }
    ).on('error', j).end();
  });
}

function sendCDP(ws, id, method, params) {
  return new Promise((resolve, reject) => {
    const handler = (data) => {
      const m = JSON.parse(data.toString());
      if (m.id === id) { ws.off('message', handler); if (m.error) reject(new Error(m.error.message)); else resolve(m.result); }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalPage(ws, expr, waitTime) {
  await new Promise(r => setTimeout(r, waitTime || 0));
  const result = await sendCDP(ws, 9999, 'Runtime.evaluate', { expression: `(() => { try { return (${expr}) } catch(e) { return {error: e.message} } })()`, returnByValue: true, awaitPromise: true });
  return result.result.value;
}

async function main() {
  // 打开登录页
  console.log('=== 打开登录页 ===');
  const tab = await openTab('http://127.0.0.1:5192/g005-radiology-ris/login?t=' + Date.now());
  console.log('Tab:', tab.url);
  
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.once('open', r));
  await sendCDP(ws, 1, 'Runtime.enable');
  await sendCDP(ws, 2, 'Network.enable');
  
  const failures = [];
  ws.on('message', (data) => {
    try {
      const m = JSON.parse(data.toString());
      if (m.method === 'Network.responseReceived' && m.params.response.status >= 400)
        failures.push(`${m.params.response.status} ${m.params.response.url}`);
    } catch(e) {}
  });

  // 等待加载
  await new Promise(r => setTimeout(r, 8000));
  
  // 检查登录页
  let state = await evalPage(ws, `{
    url: location.href,
    bodyText: document.body.innerText.substring(0, 300),
    forms: document.querySelectorAll('form').length,
    inputs: document.querySelectorAll('input,select').length,
    buttons: document.querySelectorAll('button').length
  }`);
  console.log('登录页:', JSON.stringify(state));
  
  if (state?.forms > 0 || state?.inputs > 0) {
    console.log('✅ 登录页渲染成功 - 有表单');
    
    // 尝试选择角色并提交
    console.log('\n=== 提交登录表单 ===');
    const clickResult = await evalPage(ws, `{
      // 找登录按钮并点击
      const btn = document.querySelector('button[type="submit"], button');
      if (btn) { btn.click(); return 'clicked: ' + (btn.textContent || ''); }
      // 试试直接提交
      const form = document.querySelector('form');
      if (form) { form.requestSubmit(); return 'submitted form'; }
      return 'no button or form found';
    }`, 1000);
    console.log('提交结果:', clickResult);
    
    // 等待登录完成和路由跳转
    await new Promise(r => setTimeout(r, 6000));
    
    state = await evalPage(ws, `{
      url: location.href,
      bodyText: document.body.innerText.substring(0, 300),
      hasSidebar: document.querySelectorAll('aside, nav, [class*="sidebar"]').length > 0,
      navItems: Array.from(document.querySelectorAll('[class*="menu-item"], nav > div > div')).length,
      buttons: document.querySelectorAll('button').length
    }`);
    console.log('登录后:', JSON.stringify(state));
    
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
        console.log(`\n=== 导航到: ${p.name} (${p.path}) ===`);
        
        // 点击 sidebar 中的链接
        const navResult = await evalPage(ws, `{
          // 先尝试通过 React Router navigate
          window.history.pushState({}, '', '${p.path}');
          window.dispatchEvent(new PopStateEvent('popstate'));
          return { navigated: true, to: '${p.path}' };
        }`, 500);
        
        // 等待懒加载完成
        await new Promise(r => setTimeout(r, 12000));
        
        state = await evalPage(ws, `{
          url: location.href,
          bodyText: document.body.innerText.substring(0, 300),
          rootHTMLlen: document.getElementById('root').innerHTML.length,
          buttons: document.querySelectorAll('button').length,
          tables: document.querySelectorAll('table, .ant-table, [class*="ant-table"]').length,
          inputs: document.querySelectorAll('input, select, textarea').length,
          isSpinner: document.body.innerText.length < 5
        }`);
        
        console.log(`  URL: ${state?.url}`);
        console.log(`  Text: "${(state?.bodyText || '(none)').substring(0, 120)}"`);
        console.log(`  Root: ${state?.rootHTMLlen} chars, Btns: ${state?.buttons}, Inputs: ${state?.inputs}, Tables: ${state?.tables}`);
        const ok = !state?.isSpinner && (state?.rootHTMLlen > 2000 || state?.buttons > 3 || state?.inputs > 0 || state?.tables > 0);
        console.log(`${ok ? '✅ PASS' : '❌ FAIL'}`);
      }
    } else {
      console.log('❌ 没有渲染 sidebar，登录可能未成功');
    }
  } else {
    console.log('❌ 登录页没有渲染表单');
  }
  
  if (failures.length > 0) {
    console.log(`\n=== 失败的网络请求 (${failures.length}) ===`);
    failures.forEach(f => console.log(`  ${f}`));
  }
  
  ws.close();
  console.log('\n=== 测试完成 ===');
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });