import { Router, type Request, type Response } from 'express';

const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>G005 RIS Developer Portal</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f1a;color:#e0e0e0;padding:40px;max-width:960px;margin:auto}h1{font-size:2rem;margin-bottom:8px;color:#fff}p{color:#999;margin-bottom:32px}.card{background:#1a1a2e;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #2a2a3e}.card h3{color:#7c7cff;margin-bottom:8px}.card p{color:#aaa;margin-bottom:12px;font-size:14px}.btn{display:inline-block;padding:8px 20px;background:#7c7cff;color:#fff;border-radius:6px;text-decoration:none;font-size:14px}.btn:hover{background:#6a6ae6}.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:4px;background:#2a2a4e;color:#aaa}pre{background:#0a0a14;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;margin-top:12px;color:#7c7cff}.method{font-weight:bold;color:#7c7cff}</style></head>
<body>
<h1>G005 RIS Developer Portal</h1>
<p>RESTful API · FHIR R4 · HL7 v2 · DICOMweb · CDS Hooks</p>
<div class="card"><h3>Getting Started</h3><p>Obtain an API key via POST /openapi/keys. Include it in the X-API-Key header.</p><pre>curl -X POST /openapi/keys -H "Content-Type: application/json" -d '{"name":"My App","scopes":["read","write"]}'</pre></div>
<div class="card"><h3>Quick Links</h3><p><span class="tag">FHIR</span><span class="method">GET</span> <code>/fhir/metadata</code> — CapabilityStatement<br><span class="tag">FHIR</span><span class="method">GET</span> <code>/fhir/Patient</code> — Patient search<br><span class="tag">HL7</span><span class="method">POST</span> <code>/hl7/v2/message</code> — Send HL7 message<br><span class="tag">DICOM</span><span class="method">GET</span> <code>/dicom/studies</code> — QIDO-RS query<br><span class="tag">CDS</span><span class="method">GET</span> <code>/cds-services</code> — CDS service discovery<br><span class="tag">API</span><span class="method">GET</span> <code>/openapi/spec</code> — OpenAPI spec</p></div>
<div class="card"><h3>API Playground</h3><p>Try the API with the interactive playground.</p><a class="btn" href="/openapi/playground">Open Playground</a></div>
<div class="card"><h3>Rate Limits</h3><p>Default: 100 requests/minute per API key. Custom limits available on request.</p></div>
<div class="card"><h3>Webhook Events</h3><p><code>exam.created</code> <code>exam.updated</code> <code>report.published</code> <code>critical.alert</code> <code>hl7.message</code></p></div>
</body></html>`;

export function consoleRouter(): Router {
  const router = Router();

  router.get('/openapi/console', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/html').send(html);
  });

  router.get('/openapi/playground', (req: Request, res: Response) => {
    const endpoint = (req.query.endpoint as string) || '/fhir/metadata';
    const playgroundHtml = html.replace('Open Playground', `Testing: ${endpoint}`).replace('</body>', `<pre>// API Playground\n// Endpoint: ${endpoint}\n// Response will appear here\nfetch('${endpoint}').then(r => r.json()).then(console.log)</pre></body>`);
    res.set('Content-Type', 'text/html').send(playgroundHtml);
  });

  return router;
}
