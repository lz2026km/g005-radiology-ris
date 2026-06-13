import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

function transitionExam(db: Database.Database, id: string, toStatus: string, res: Response) {
  const validStates = ['已登记', '待检查', '检查中', '待报告', '已报告', '已发布', '已取消', '检查异常'];
  if (!validStates.includes(toStatus)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: `无效状态: ${toStatus}` } });
  }
  const existing = db.prepare('SELECT status FROM exams WHERE id = ?').get(id) as { status: string } | undefined;
  if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '检查不存在' } });
  const transitions: Record<string, string[]> = {
    '已登记': ['待检查', '已取消'],
    '待检查': ['检查中', '已取消'],
    '检查中': ['待报告', '检查异常'],
    '待报告': ['已报告'],
    '已报告': ['已发布'],
  };
  const allowed = transitions[existing.status] || [];
  if (!allowed.includes(toStatus)) {
    return res.status(400).json({ success: false, error: { code: 'ILLEGAL_TRANSITION', message: `不允许从 ${existing.status} 转换为 ${toStatus}` } });
  }
  db.prepare("UPDATE exams SET status = ?, updated_at = datetime('now') WHERE id = ?").run(toStatus, id);
  const row = db.prepare('SELECT * FROM exams WHERE id = ?').get(id);
  res.json({ success: true, data: row });
}

export function examRouter(db: Database.Database): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const { status, modality, priority, search, page = '1', pageSize = '50' } = req.query as Record<string, string>;
    let sql = 'SELECT * FROM exams WHERE 1=1';
    const params: unknown[] = [];
    if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
    if (modality && modality !== 'all') { sql += ' AND modality = ?'; params.push(modality); }
    if (priority && priority !== 'all') { sql += ' AND priority = ?'; params.push(priority); }
    if (search) { sql += ' AND (patient_name LIKE ? OR exam_id LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (Number(page) - 1) * Number(pageSize);
    params.push(Number(pageSize), offset);
    const rows = db.prepare(sql).all(...params);
    const total = db.prepare('SELECT COUNT(*) as cnt FROM exams').get() as { cnt: number };
    res.json({ success: true, data: rows, meta: { total: total.cnt, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total.cnt / Number(pageSize)) } });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const row = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '检查不存在' } });
    res.json({ success: true, data: row });
  });

  router.post('/', (req: Request, res: Response) => {
    const id = `EX-${uuid().slice(0, 8)}`;
    const b = req.body;
    db.prepare(`INSERT INTO exams (id, exam_id, patient_id, patient_name, gender, age, modality, body_part, status, priority, patient_type, scheduled_at, device_id, room_id, doctor_id, clinical_diagnosis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, b.examId || id, b.patientId, b.patientName, b.gender, b.age, b.modality, b.bodyPart, '已登记', b.priority || '普通', b.patientType || '门诊', b.scheduledAt, b.deviceId, b.roomId, b.doctorId, b.clinicalDiagnosis);
    const row = db.prepare('SELECT * FROM exams WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: row });
  });

  router.put('/:id', (req: Request, res: Response) => {
    const b = req.body;
    db.prepare("UPDATE exams SET patient_name=?, modality=?, body_part=?, status=?, priority=?, device_id=?, room_id=?, updated_at=datetime('now') WHERE id=?")
      .run(b.patientName, b.modality, b.bodyPart, b.status, b.priority, b.deviceId, b.roomId, req.params.id);
    const row = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: row });
  });

  // 状态流转快捷操作
  router.post('/:id/checkin', (req: Request, res: Response) => transitionExam(db, req.params.id, '待检查', res));
  router.post('/:id/start', (req: Request, res: Response) => transitionExam(db, req.params.id, '检查中', res));
  router.post('/:id/complete', (req: Request, res: Response) => transitionExam(db, req.params.id, '待报告', res));
  router.post('/:id/cancel', (req: Request, res: Response) => transitionExam(db, req.params.id, '已取消', res));

  return router;
}
