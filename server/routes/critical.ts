import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import { mapCriticalValueRow } from '../utils/dtoMapper.js';

export function criticalRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/', (req: Request, res: Response) => {
    const rows = db.prepare('SELECT * FROM critical_values ORDER BY created_at DESC LIMIT 100').all();
    res.json({ success: true, data: rows.map(mapCriticalValueRow) });
  });
  router.get('/:id', (req: Request, res: Response) => {
    const row = db.prepare('SELECT * FROM critical_values WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: mapCriticalValueRow(row as Record<string, unknown>) });
  });
  router.post('/', (req: Request, res: Response) => {
    const id = `CV-${uuid().slice(0, 8)}`;
    const b = req.body;
    db.prepare('INSERT INTO critical_values (id, exam_id, patient_name, finding, severity, status, triggered_at, doctor_id) VALUES (?,?,?,?,?,?,?,?)')
      .run(id, b.examId, b.patientName, b.finding, b.severity || 'high', 'pending', new Date().toISOString(), b.doctorId);
    const row = db.prepare('SELECT * FROM critical_values WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: mapCriticalValueRow(row as Record<string, unknown>) });
  });
  router.put('/:id/acknowledge', (req: Request, res: Response) => {
    const now = new Date().toISOString();
    db.prepare("UPDATE critical_values SET status='acknowledged', acknowledged_at=?, updated_at=datetime('now') WHERE id=?").run(now, req.params.id);
    const row = db.prepare('SELECT * FROM critical_values WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: mapCriticalValueRow(row as Record<string, unknown>) });
  });
  router.put('/:id/resolve', (req: Request, res: Response) => {
    const now = new Date().toISOString();
    db.prepare("UPDATE critical_values SET status='resolved', resolved_at=?, updated_at=datetime('now') WHERE id=?").run(now, req.params.id);
    const row = db.prepare('SELECT * FROM critical_values WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: mapCriticalValueRow(row as Record<string, unknown>) });
  });
  return router;
}
