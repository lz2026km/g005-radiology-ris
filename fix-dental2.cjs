const fs = require('fs');
const p = 'src/services/mockBackend/dentalHandlers.ts';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  "import { applyQuery } from './queryBuilder';",
  "import { parseQuery, applyQuery } from './queryBuilder';"
);
const oldStudyHandler = `http.get(\`\${DENTAL_API}/studies\`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = applyQuery(url);
    const all = list<any>('dental_studies').length > 0 ? list<any>('dental_studies') : MOCK_DENTAL_STUDIES;
    const result = applyQuery(MOCK_DENTAL_STUDIES, opts, ['patientName', 'indication', 'modality', 'region']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total, library: 'dental_imaging' } });
  }),`;
const newStudyHandler = `http.get(\`\${DENTAL_API}/studies\`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const result = applyQuery(MOCK_DENTAL_STUDIES, opts, ['patientName', 'indication', 'modality', 'region']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total, library: 'dental_imaging' } });
  }),`;
if (c.includes(oldStudyHandler)) {
  c = c.replace(oldStudyHandler, newStudyHandler);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed studies handler');
} else {
  console.log('Pattern not found');
}
