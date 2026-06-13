import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

export function appointmentRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/', (req: Request, res: Response) => {
    const { status, page = '1', pageSize = '50' } = req.query as Record<string, string>;
    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params: unknown[] = [];
    if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY scheduled_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  });
  router.get('/:id', (req: Request, res: Response) => {
    const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: row });
  });
  router.post('/', (req: Request, res: Response) => {
    const id = `APT-${uuid().slice(0, 8)}`;
    const b = req.body;
    db.prepare('INSERT INTO appointments (id, patient_id, patient_name, modality, body_part, scheduled_at, status, doctor_id, room_id, priority) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(id, b.patientId, b.patientName, b.modality, b.bodyPart, b.scheduledAt, 'pending', b.doctorId, b.roomId, b.priority || 'normal');
    const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: row });
  });
  router.put('/:id/cancel', (req: Request, res: Response) => {
    db.prepare("UPDATE appointments SET status='cancelled', updated_at=datetime('now') WHERE id=?").run(req.params.id);
    const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: row });
  });
  return router;
}
