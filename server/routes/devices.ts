import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import { mapDeviceRow } from '../utils/dtoMapper.js';

export function deviceRouter(db: Database.Database): Router {
  const router = Router();
  router.get('/', (_req: Request, res: Response) => {
    const rows = db.prepare('SELECT * FROM devices').all();
    res.json({ success: true, data: rows.map(mapDeviceRow) });
  });
  router.get('/stats/today', (_req: Request, res: Response) => {
    const totalDevices = (db.prepare('SELECT COUNT(*) as cnt FROM devices').get() as { cnt: number }).cnt;
    const inUse = (db.prepare("SELECT COUNT(*) as cnt FROM devices WHERE status='使用中'").get() as { cnt: number }).cnt;
    const idle = (db.prepare("SELECT COUNT(*) as cnt FROM devices WHERE status='空闲'").get() as { cnt: number }).cnt;
    const maintenance = (db.prepare("SELECT COUNT(*) as cnt FROM devices WHERE status='维护中' OR status='维修中'").get() as { cnt: number }).cnt;
    res.json({ success: true, data: { totalDevices, inUse, idle, maintenance } });
  });
  router.get('/schedule', (_req: Request, res: Response) => res.json({ success: true, data: [] }));
  return router;
}
