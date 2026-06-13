import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

export function printRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/queue', (_req: Request, res: Response) => {
    const rows = db.prepare('SELECT * FROM print_jobs ORDER BY created_at DESC').all();
    res.json({ success: true, data: rows });
  });
  router.post('/jobs', (req: Request, res: Response) => {
    const id = `PRT-${uuid().slice(0, 8)}`;
    db.prepare('INSERT INTO print_jobs (id, report_id, printer_id, film_size, copies, status) VALUES (?,?,?,?,?,?)')
      .run(id, req.body.reportId, req.body.printerId, req.body.filmSize, req.body.copies || 1, 'queued');
    const row = db.prepare('SELECT * FROM print_jobs WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: row });
  });
  router.get('/printers', (_req: Request, res: Response) => {
    res.json({ success: true, data: [{ id: 'p1', name: '胶片打印机 1', ip: '192.168.1.100', status: 'ready' }] });
  });
  return router;
}
