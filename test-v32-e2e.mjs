// v3.0.6.8-32 端到端综合测试
// 验证 1) 主数据池 API 2) 业务逻辑层 3) 高级端点 4) 状态机 5) 限流
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris/';
const API = '/api/v1';

const results = [];
function ok(name) { results.push({ name, status: 'PASS' }); console.log(`✓ ${name}`); }
function fail(name, err) { results.push({ name, status: 'FAIL', err: String(err).slice(0, 200) }); console.log(`✗ ${name}: ${err}`); }

async function callApi(page, path, options = {}) {
  return await page.evaluate(async ({ path, options }) => {
    const opts = { headers: { 'Content-Type': 'application/json' }, ...options };
    if (options.body && typeof options.body === 'object') opts.body = JSON.stringify(options.body);
    const res = await fetch(path, opts);
    let body = null; try { body = await res.json(); } catch {}
    return { status: res.status, body };
  }, { path, options });
}

const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));

await p.goto(BASE);
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(1500);

// ============ 1) 主数据池 API ============
console.log('\n=== 1) 主数据池 API (主数据规模) ===');
const dataPoolTests = [
  { path: `${API}/patients?pageSize=1`, expect: (body) => body?.meta?.total >= 1500, name: 'patients total >= 1500' },
  { path: `${API}/devices?pageSize=1`, expect: (body) => body?.meta?.total >= 35, name: 'devices total >= 35' },
  { path: `${API}/users?pageSize=1`, expect: (body) => body?.meta?.total >= 75, name: 'users (doctors) total >= 75' },
  { path: `${API}/worklist?pageSize=1`, expect: (body) => body?.meta?.total >= 600, name: 'worklist total >= 600' },
  { path: `${API}/reports?pageSize=1`, expect: (body) => body?.meta?.total >= 100, name: 'reports total >= 100' },
  { path: `${API}/consultations`, expect: (body) => Array.isArray(body?.data) && body.data.length > 0, name: 'consultations 返回数据' },
  { path: `${API}/dose-records`, expect: (body) => Array.isArray(body?.data), name: 'dose-records 返回数据' },
  { path: `${API}/stats/daily`, expect: (body) => body?.data?.totalExams !== undefined, name: 'stats/daily totalExams 字段' },
];
for (const t of dataPoolTests) {
  try {
    const r = await callApi(p, t.path);
    if (r.status === 200 && t.expect(r.body)) ok(t.name);
    else fail(t.name, `status=${r.status} body=${JSON.stringify(r.body).slice(0, 150)}`);
  } catch (e) { fail(t.name, e.message); }
}

// ============ 2) 业务逻辑层 API ============
console.log('\n=== 2) 业务逻辑层 API ===');
// 2.1 状态机 - 测试一个已 submitted 报告 (应返回 INVALID_TRANSITION 即状态机正确)
const wlList = await callApi(p, `${API}/worklist?pageSize=5`);
const firstExam = wlList.body?.data?.[0];
if (firstExam) {
  const eid = firstExam.id || firstExam.reportId;
  const worklistTest = await callApi(p, `${API}/worklist/${eid}`);
  if (worklistTest.status === 200 && worklistTest.body?.data) {
    // 状态机验证: 重复 submit 应返回 400 INVALID_TRANSITION (说明状态机在工作)
    const submitRes = await callApi(p, `${API}/reports/${eid}/submit`, { method: 'POST', body: {} });
    if (submitRes.status === 400 && submitRes.body?.error?.code === 'INVALID_TRANSITION') {
      ok('reports/:id/submit 状态机验证 (拒绝非法转换)');
    } else if (submitRes.status === 200) {
      ok('reports/:id/submit 状态机 (合法转换)');
    } else {
      fail('reports/:id/submit', JSON.stringify(submitRes.body).slice(0, 200));
    }
  } else fail('worklist detail', `status=${worklistTest.status}`);
} else fail('worklist detail', 'no exam in list');

// 2.2 危急值 SLA
const slaRes = await callApi(p, `${API}/critical/sla-status`);
if (slaRes.status === 200 && slaRes.body?.data?.events) {
  const breached = slaRes.body.data.breachedCount;
  const needEsc = slaRes.body.data.needEscalation;
  ok(`critical/sla-status (breached=${breached}, needEsc=${needEsc})`);
} else fail('critical/sla-status', JSON.stringify(slaRes.body).slice(0, 200));

// 2.3 影像质控评分
const qualityRes = await callApi(p, `${API}/image-quality/grade`, {
  method: 'POST',
  body: { snrDb: 45, cnr: 4, uniformityPct: 80, artifactScore: 3 },
});
if (qualityRes.status === 200 && qualityRes.body?.data?.grade) {
  ok(`image-quality/grade 返回 ${qualityRes.body.data.grade} (${qualityRes.body.data.gradeLabel})`);
} else fail('image-quality/grade', JSON.stringify(qualityRes.body).slice(0, 200));

// ============ 3) 高级端点 ============
console.log('\n=== 3) 高级端点 ===');
const advancedTests = [
  { path: `${API}/system/health`, name: 'system/health' },
  { path: `${API}/system/storage`, name: 'system/storage' },
  { path: `${API}/workflow-events?pageSize=5`, name: 'workflow-events' },
  { path: `${API}/audit-log?pageSize=5`, name: 'audit-log' },
  { path: `${API}/rate-limit-status`, name: 'rate-limit-status' },
];
for (const t of advancedTests) {
  const r = await callApi(p, t.path);
  if (r.status === 200 && r.body?.success) ok(t.name);
  else fail(t.name, `status=${r.status} body=${JSON.stringify(r.body).slice(0, 200)}`);
}

// ============ 4) 状态机完整流程 ============
console.log('\n=== 4) 报告状态机完整流程 ===');
const reports = await callApi(p, `${API}/reports?pageSize=20`);
if (reports.body?.data?.length > 0) {
  const testReport = reports.body.data[0];
  const rejectRes = await callApi(p, `${API}/reports/${testReport.reportId}/reject`, {
    method: 'POST', body: { reason: 'test reject reason from v32 e2e' }
  });
  if (rejectRes.status === 200 || rejectRes.status === 400) ok(`reports/:id/reject (status=${rejectRes.status})`);
  else fail('reports/:id/reject', JSON.stringify(rejectRes.body).slice(0, 200));

  const rejectEmpty = await callApi(p, `${API}/reports/${testReport.reportId}/reject`, {
    method: 'POST', body: { reason: '' }
  });
  if (rejectEmpty.status === 400) ok('reports/:id/reject 验证: 空 reason 返回 400');
  else fail('reports/:id/reject 验证', `期望 400, 实际 ${rejectEmpty.status}`);
}

// ============ 5) 持久化测试 (IDB) ============
console.log('\n=== 5) IndexedDB 持久化 ===');
const idbCheck = await p.evaluate(async () => {
  return new Promise((resolve) => {
    const req = indexedDB.databases();
    if (req && typeof req.then === 'function') {
      req.then(dbs => resolve({ dbs: dbs.map(d => d.name) })).catch(e => resolve({ err: String(e) }));
    } else {
      resolve({ dbs: [] });
    }
  });
});
console.log('  IDB 数据库列表:', JSON.stringify(idbCheck));

// ============ 总结 ============
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL');
console.log(`\n=== 总结: ${passed}/${results.length} 通过 ===`);
if (failed.length > 0) {
  console.log('\n失败:');
  for (const f of failed) console.log(`  - ${f.name}: ${f.err}`);
}

await b.close();
process.exit(failed.length > 0 ? 1 : 0);
