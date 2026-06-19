// Deep CDP inspection - 深入检查 React 渲染状态
import WebSocket from 'ws';

async function deepInspect() {
  const wsUrl = 'ws://127.0.0.1:9222/devtools/page/3AEFBABF5FCA8229913F10148174E8EC';
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.once('open', r));

  let cmdId = 0;
  const send = (method, params) => new Promise((resolve, reject) => {
    const id = ++cmdId;
    const handler = (data) => {
      const m = JSON.parse(data.toString());
      if (m.id === id) {
        ws.off('message', handler);
        if (m.error) reject(new Error(m.error.message));
        else resolve(m.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Runtime.enable');

  // 1. 检查 root 元素的完整 HTML
  const rootHTML = await send('Runtime.evaluate', {
    expression: `(() => {
      const r = document.getElementById('root');
      return {
        outerHTML: r.outerHTML.substring(0, 5000),
        children: r.children.length,
        hasLoading: r.innerHTML.includes('加载中'),
        hasError: r.innerHTML.includes('启动失败') || r.innerHTML.includes('Promise 错误'),
        errorRendered: r.dataset.errorRendered,
        bodyClasses: document.body.className,
        scripts: Array.from(document.scripts).map(s => s.src || '[inline]').slice(0, 10)
      };
    })()`,
    returnByValue: true
  });
  console.log('\n=== ROOT ELEMENT ANALYSIS ===');
  const root = rootHTML.result.value;
  console.log('Children:', root.children);
  console.log('Has loading spinner:', root.hasLoading);
  console.log('Has error UI:', root.hasError);
  console.log('Scripts loaded:', root.scripts);
  console.log('\n=== ROOT INNER HTML (first 3000 chars) ===');
  console.log(root.outerHTML.substring(0, 3000));

  // 2. 检查 React 是否已加载
  const reactCheck = await send('Runtime.evaluate', {
    expression: `(() => ({
      hasReact: typeof window.React !== 'undefined',
      hasReactDOM: typeof window.ReactDOM !== 'undefined',
      hasFiber: typeof window.React !== 'undefined' && !!document.querySelector('[data-reactroot], #root > *'),
      rootFirstChild: document.getElementById('root').firstElementChild?.tagName,
      rootFirstChildId: document.getElementById('root').firstElementChild?.id,
      rootFirstChildClass: document.getElementById('root').firstElementChild?.className,
      bodyHeight: document.body.scrollHeight
    }))()`,
    returnByValue: true
  });
  console.log('\n=== REACT INSTALLATION CHECK ===');
  console.log(JSON.stringify(reactCheck.result.value, null, 2));

  // 3. 检查所有网络请求失败
  console.log('\n=== FETCHING ALL NETWORK REQUESTS ===');
  // 通过 Performance API
  const perf = await send('Runtime.evaluate', {
    expression: `(() => {
      const entries = performance.getEntriesByType('resource');
      return entries.filter(e => e.name.includes('g005-radiology')).map(e => ({
        url: e.name,
        duration: Math.round(e.duration),
        status: e.responseStatus || 'unknown',
        size: e.transferSize || 0,
        type: e.initiatorType
      }));
    })()`,
    returnByValue: true
  });
  console.log(JSON.stringify(perf.result.value, null, 2));

  // 4. 触发一个点击事件测试导航
  console.log('\n=== TESTING INTERACTION ===');
  const interactionResult = await send('Runtime.evaluate', {
    expression: `(() => {
      // 找有没有按钮
      const buttons = document.querySelectorAll('button');
      const links = document.querySelectorAll('a[href]');
      return {
        buttonCount: buttons.length,
        linkCount: links.length,
        firstButtonText: buttons[0]?.textContent?.substring(0, 50),
        firstLinkHref: links[0]?.href
      };
    })()`,
    returnByValue: true
  });
  console.log(JSON.stringify(interactionResult.result.value, null, 2));

  ws.close();
}

deepInspect().catch(console.error);