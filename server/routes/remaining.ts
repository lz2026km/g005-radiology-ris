import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

export function deliveryRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/', (_req: Request, res: Response) => {
    const rows = db.prepare('SELECT * FROM delivery_records ORDER BY created_at DESC').all();
    res.json({ success: true, data: rows });
  });
  router.post('/', (req: Request, res: Response) => {
    const id = `DEL-${uuid().slice(0, 8)}`;
    db.prepare('INSERT INTO delivery_records (id, report_id, channel, recipient, status) VALUES (?,?,?,?,?)')
      .run(id, req.body.reportId, req.body.channel, req.body.recipient, 'pending');
    res.status(201).json({ success: true, data: { id, status: 'pending' } });
  });
  return router;
}

export function queueRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/', (_req: Request, res: Response) => {
    const rows = db.prepare('SELECT * FROM queue_calls ORDER BY created_at ASC').all();
    res.json({ success: true, data: rows });
  });
  router.post('/:id/call', (req: Request, res: Response) => {
    db.prepare("UPDATE queue_calls SET status='called', called_at=datetime('now') WHERE id=?").run(req.params.id);
    const row = db.prepare('SELECT * FROM queue_calls WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: row });
  });
  return router;
}

export function patientRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/', (req: Request, res: Response) => {
    const { search } = req.query as Record<string, string>;
    let sql = 'SELECT * FROM patients';
    const params: unknown[] = [];
    if (search) { sql += ' WHERE name LIKE ? OR id LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  });
  router.get('/:id', (req: Request, res: Response) => {
    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: row });
  });
  return router;
}

export function userRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/', (_req: Request, res: Response) => {
    const rows = db.prepare('SELECT id, name, username, role, department, title, phone FROM users').all();
    res.json({ success: true, data: rows });
  });
  return router;
}

export function statsRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/daily', (_req: Request, res: Response) => {
    const totalExams = (db.prepare('SELECT COUNT(*) as cnt FROM exams').get() as { cnt: number }).cnt;
    const completedExams = (db.prepare("SELECT COUNT(*) as cnt FROM exams WHERE status='已报告' OR status='已发布'").get() as { cnt: number }).cnt;
    const pendingReports = (db.prepare("SELECT COUNT(*) as cnt FROM reports WHERE status NOT IN ('已发布','已归档')").get() as { cnt: number }).cnt;
    const criticalValues = (db.prepare("SELECT COUNT(*) as cnt FROM critical_values WHERE status!='resolved'").get() as { cnt: number }).cnt;
    res.json({ success: true, data: { totalExams, completedExams, pendingReports, criticalValues } });
  });
  router.get('/weekly', (_req: Request, res: Response) => {
    res.json({ success: true, data: { totalExams: 0, daily: [] } });
  });
  router.get('/workload', (_req: Request, res: Response) => res.json({ success: true, data: [] }));
  router.get('/quality', (_req: Request, res: Response) => {
    res.json({ success: true, data: { averageScore: 85, byDoctor: [], byModality: [] } });
  });
  return router;
}
