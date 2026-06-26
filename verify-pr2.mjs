import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['GET', '/api/v1/eye/report/asr/vocab/dr', null],
  ['GET', '/api/v1/eye/report/asr/vocab/amd', null],
  ['GET', '/api/v1/eye/report/asr/vocab/glaucoma', null],
  ['GET', '/api/v1/eye/report/asr/vocab/cataract', null],
  ['GET', '/api/v1/eye/report/asr/vocab/keratoconus', null],
  ['POST', '/api/v1/eye/report/asr/feedback', { condition: 'dr', term: '微动脉瘤', correct: true, userId: 'A001' }],
  ['POST', '/api/v1/eye/report/nlp/extract', { text: '右眼糖尿病视网膜病变, NPDR III期, 黄斑水肿', condition: 'dr' }],
  ['GET', '/api/v1/eye/report/nlp/icd-map?q=糖尿病', null],
  ['GET', '/api/v1/eye/report/nlp/icd-map?q=青光眼', null],
  ['POST', '/api/v1/eye/report/ai/continue', { patientName: '张三', findings: '右眼视盘清,色淡红', modality: 'fundus', condition: 'dr' }],
  ['POST', '/api/v1/eye/report/ai/rewrite', { originalText: '原报告内容', instruction: '简化语言', style: 'concise' }],
  ['GET', '/api/v1/eye/report/ai/history', null],
  ['POST', '/api/v1/eye/report/ai/feedback', { reportId: 'RPT-001', aiText: 'AI 生成', rating: 5 }],
  ['GET', '/api/v1/eye/report/prompts/dr', null],
  ['GET', '/api/v1/eye/report/prompts/cataract', null],
  ['POST', '/api/v1/eye/report/voice/transcribe', { audio: 'mock-base64', language: 'zh-CN', condition: 'dr' }],
];

let pass = 0, fail = 0;
for (const [method, url, body] of apis) {
  const r = await p.evaluate(async ({ method, url, body }) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    return { status: res.status, hasSuccess: text.includes('"success":true'), sample: text.slice(0, 150) };
  }, { method, url, body });
  const ok = r.status === 200 && r.hasSuccess;
  if (ok) { pass++; }
  else { fail++; console.log(`✗ ${method} ${url}: status=${r.status} body=${r.sample}`); }
}
console.log(`\n=== ${pass}/${pass + fail} 通过 ===`);
await b.close();
