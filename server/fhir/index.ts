import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';

export function fhirRouter(db: Database.Database): Router {
  const router = Router();

  router.get('/metadata', (_req: Request, res: Response) => {
    res.json({
      resourceType: 'CapabilityStatement',
      id: 'g005-fhir-server',
      status: 'active',
      date: new Date().toISOString(),
      publisher: 'G005 RIS',
      kind: 'instance',
      software: { name: 'G005 RIS FHIR Server', version: '3.0.2.23' },
      fhirVersion: '4.0.1',
      format: ['application/fhir+json'],
      rest: [{
        mode: 'server',
        security: {
          service: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/restful-security-service', code: 'SMART-on-FHIR' }] }],
          extension: [{ url: 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris', extension: [{ url: 'token', valueUri: '/auth/token' }, { url: 'authorize', valueUri: '/auth/authorize' }] }]
        },
        resource: [
          { type: 'Patient', profile: ['http://hl7.org/fhir/StructureDefinition/Patient'], interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }, { code: 'update' }] },
          { type: 'Observation', profile: ['http://hl7.org/fhir/StructureDefinition/Observation'], interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }] },
          { type: 'DiagnosticReport', profile: ['http://hl7.org/fhir/StructureDefinition/DiagnosticReport'], interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }, { code: 'update' }] },
          { type: 'ImagingStudy', profile: ['http://hl7.org/fhir/StructureDefinition/ImagingStudy'], interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }] },
          { type: 'ServiceRequest', profile: ['http://hl7.org/fhir/StructureDefinition/ServiceRequest'], interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }, { code: 'update' }] },
          { type: 'Practitioner', profile: ['http://hl7.org/fhir/StructureDefinition/Practitioner'], interaction: [{ code: 'read' }, { code: 'search-type' }] },
          { type: 'Organization', profile: ['http://hl7.org/fhir/StructureDefinition/Organization'], interaction: [{ code: 'read' }, { code: 'search-type' }] },
          { type: 'Endpoint', profile: ['http://hl7.org/fhir/StructureDefinition/Endpoint'], interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }] },
          { type: 'Subscription', profile: ['http://hl7.org/fhir/StructureDefinition/Subscription'], interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }, { code: 'delete' }] }
        ],
        operation: [
          { name: 'batch', definition: { reference: 'http://hl7.org/fhir/OperationDefinition/bundle-batch' } },
          { name: 'transaction', definition: { reference: 'http://hl7.org/fhir/OperationDefinition/bundle-transaction' } }
        ]
      }]
    });
  });

  router.post('/', (req: Request, res: Response) => {
    const bundle = req.body;
    if (bundle.resourceType !== 'Bundle') return res.status(400).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Expected Bundle resource' }] });
    const type = bundle.type === 'transaction' ? 'transaction-response' : 'batch-response';
    const entries = (bundle.entry || []).map((entry: any) => ({
      resource: entry.resource,
      response: { status: '200 OK', outcome: { resourceType: 'OperationOutcome', issue: [{ severity: 'information', code: 'success', diagnostics: `${entry.resource?.resourceType || 'unknown'} processed` }] } }
    }));
    res.json({ resourceType: 'Bundle', id: `batch-${Date.now()}`, type, entry: entries });
  });

  router.get('/Patient', (req: Request, res: Response) => searchResource(db, 'patients', 'Patient', req, res));
  router.get('/Patient/:id', (req: Request, res: Response) => readResource(db, 'patients', 'Patient', req, res));
  router.post('/Patient', (req: Request, res: Response) => createResource(db, 'patients', 'Patient', req, res, 'patient', { identifier: 'identifier', name: 'name', gender: 'gender', birthDate: 'birthDate' }));
  router.put('/Patient/:id', (req: Request, res: Response) => updateResource(db, 'patients', 'Patient', req, res));
  router.delete('/Patient/:id', (req: Request, res: Response) => deleteResource(db, 'patients', req, res));

  router.get('/Observation', (req: Request, res: Response) => searchResource(db, 'reports', 'Observation', req, res));
  router.get('/Observation/:id', (req: Request, res: Response) => readResource(db, 'reports', 'Observation', req, res));
  router.post('/Observation', (req: Request, res: Response) => createResource(db, 'reports', 'Observation', req, res, 'observation', { status: 'status', code: 'code', value: 'valueString' }));
  router.delete('/Observation/:id', (req: Request, res: Response) => deleteResource(db, 'reports', req, res));

  router.get('/DiagnosticReport', (req: Request, res: Response) => searchResource(db, 'reports', 'DiagnosticReport', req, res));
  router.get('/DiagnosticReport/:id', (req: Request, res: Response) => readResource(db, 'reports', 'DiagnosticReport', req, res));
  router.post('/DiagnosticReport', (req: Request, res: Response) => createResource(db, 'reports', 'DiagnosticReport', req, res, 'diagnostic-report', { status: 'status', code: 'code', conclusion: 'conclusion' }));
  router.put('/DiagnosticReport/:id', (req: Request, res: Response) => updateResource(db, 'reports', 'DiagnosticReport', req, res));
  router.delete('/DiagnosticReport/:id', (req: Request, res: Response) => deleteResource(db, 'reports', req, res));

  router.get('/ImagingStudy', (req: Request, res: Response) => searchResource(db, 'exams', 'ImagingStudy', req, res));
  router.get('/ImagingStudy/:id', (req: Request, res: Response) => readResource(db, 'exams', 'ImagingStudy', req, res));
  router.post('/ImagingStudy', (req: Request, res: Response) => createResource(db, 'exams', 'ImagingStudy', req, res, 'imaging-study', { started: 'started', numberOfSeries: 'numberOfSeries' }));
  router.delete('/ImagingStudy/:id', (req: Request, res: Response) => deleteResource(db, 'exams', req, res));

  router.get('/ServiceRequest', (req: Request, res: Response) => searchResource(db, 'exams', 'ServiceRequest', req, res));
  router.get('/ServiceRequest/:id', (req: Request, res: Response) => readResource(db, 'exams', 'ServiceRequest', req, res));
  router.post('/ServiceRequest', (req: Request, res: Response) => createResource(db, 'exams', 'ServiceRequest', req, res, 'service-request', { status: 'status', intent: 'intent', code: 'code' }));
  router.put('/ServiceRequest/:id', (req: Request, res: Response) => updateResource(db, 'exams', 'ServiceRequest', req, res));
  router.delete('/ServiceRequest/:id', (req: Request, res: Response) => deleteResource(db, 'exams', req, res));

  router.get('/Practitioner', (req: Request, res: Response) => searchResource(db, 'users', 'Practitioner', req, res, ['name']));
  router.get('/Practitioner/:id', (req: Request, res: Response) => readResource(db, 'users', 'Practitioner', req, res));

  router.get('/Organization', (req: Request, res: Response) => searchResource(db, 'users', 'Organization', req, res, ['name']));
  router.get('/Organization/:id', (req: Request, res: Response) => readResource(db, 'users', 'Organization', req, res));

  router.get('/Endpoint', (req: Request, res: Response) => searchResource(db, 'devices', 'Endpoint', req, res));
  router.get('/Endpoint/:id', (req: Request, res: Response) => readResource(db, 'devices', 'Endpoint', req, res));
  router.post('/Endpoint', (req: Request, res: Response) => createResource(db, 'devices', 'Endpoint', req, res, 'endpoint', { status: 'status', connectionType: 'connectionType', address: 'address' }));
  router.delete('/Endpoint/:id', (req: Request, res: Response) => deleteResource(db, 'devices', req, res));

  // TODO v3.0.4: 完整实现 Subscription REST-hook / websocket 推送 + R4 Notification 资源
  // 当前返回空 Bundle,CapabilityStatement 中已声明 read/search-type/create/delete
  router.get('/Subscription', (_req: Request, res: Response) => {
    res.set('Content-Type', 'application/fhir+json').json(fhirBundle([], 'searchset'));
  });

  return router;
}

function fhirId(id: string): string { return `urn:uuid:${id}`; }

function fhirBundle(entries: unknown[], type = 'searchset'): Record<string, unknown> {
  return {
    resourceType: 'Bundle',
    id: `bundle-${Date.now()}`,
    type,
    total: entries.length,
    entry: entries.map(e => ({ resource: e }))
  };
}

function fhirError(status: number, diagnostics: string): Record<string, unknown> {
  return {
    resourceType: 'OperationOutcome',
    issue: [{ severity: status >= 500 ? 'error' : 'warning', code: 'processing', diagnostics }]
  };
}

function mapRowToFhir(table: string, row: Record<string, unknown>, resourceType: string): Record<string, unknown> {
  return { resourceType, id: String(row.id || ''), meta: { versionId: '1', lastUpdated: String(row.updated_at || row.updatedTime || new Date().toISOString()) }, ...row };
}

function searchResource(db: Database.Database, table: string, resourceType: string, req: Request, res: Response, searchFields?: string[]): void {
  const { _id, _count = '50', _offset = '0', _sort, patient, identifier, status } = req.query as Record<string, string>;
  let sql = `SELECT * FROM ${table} WHERE 1=1`;
  const params: unknown[] = [];
  if (_id) { sql += ' AND id = ?'; params.push(_id); }
  if (patient) { sql += ' AND (patient_id = ? OR patient_name LIKE ?)'; params.push(patient, `%${patient}%`); }
  if (identifier) { sql += ' AND (id = ? OR exam_id = ? OR report_id = ?)'; params.push(identifier, identifier, identifier); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (searchFields) {
    for (const field of searchFields) {
      if (req.query[field]) { sql += ` AND ${field} LIKE ?`; params.push(`%${req.query[field]}%`); }
    }
  }
  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(_count), Number(_offset));
  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  const resources = rows.map(r => mapRowToFhir(table, r, resourceType));
  res.set('Content-Type', 'application/fhir+json').json(fhirBundle(resources));
}

function readResource(db: Database.Database, table: string, resourceType: string, req: Request, res: Response): void {
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) { res.status(404).set('Content-Type', 'application/fhir+json').json(fhirError(404, `${resourceType} not found`)); return; }
  res.set('Content-Type', 'application/fhir+json').json(mapRowToFhir(table, row, resourceType));
}

function createResource(db: Database.Database, table: string, resourceType: string, req: Request, res: Response, resourcePrefix: string, fieldMap: Record<string, string>): void {
  const body = req.body;
  const id = `${resourcePrefix}-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const keys = Object.keys(fieldMap);
  const values = keys.map(k => body[k] || null);
  const placeholders = keys.map(() => '?').join(', ');
  db.prepare(`INSERT INTO ${table} (id, ${keys.join(', ')}, created_at, updated_at) VALUES (?, ${placeholders}, ?, ?)`).run(id, ...values, now, now);
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as Record<string, unknown>;
  res.status(201).set('Content-Type', 'application/fhir+json').json(mapRowToFhir(table, row, resourceType));
}

function updateResource(db: Database.Database, table: string, resourceType: string, req: Request, res: Response): void {
  const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id) as Record<string, unknown> | undefined;
  if (!existing) { res.status(404).set('Content-Type', 'application/fhir+json').json(fhirError(404, `${resourceType} not found`)); return; }
  const body = req.body;
  const now = new Date().toISOString();
  const setClauses = Object.keys(body).filter(k => k !== 'id' && k !== 'resourceType' && k !== 'meta').map(k => `${k}=?`).join(', ');
  const values = Object.keys(body).filter(k => k !== 'id' && k !== 'resourceType' && k !== 'meta').map(k => body[k]);
  if (setClauses) db.prepare(`UPDATE ${table} SET ${setClauses}, updated_at=? WHERE id=?`).run(...values, now, req.params.id);
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id) as Record<string, unknown>;
  res.set('Content-Type', 'application/fhir+json').json(mapRowToFhir(table, row, resourceType));
}

function deleteResource(db: Database.Database, table: string, req: Request, res: Response): void {
  const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(req.params.id);
  if (!existing) { res.status(404).set('Content-Type', 'application/fhir+json').json(fhirError(404, 'Resource not found')); return; }
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
  res.status(204).send();
}
