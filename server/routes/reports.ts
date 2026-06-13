import { Router, type Request, type Response } from 'express';
import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import { mapReportRow } from '../utils/dtoMapper.js';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  '待分配': ['已分配', '已驳回'],
  '已分配': ['书写中', '已驳回'],
  '书写中': ['已提交', '已驳回'],
  '已提交': ['初审中', '已驳回'],
  '初审中': ['初审通过', '已驳回'],
  '初审通过': ['终审中', '已驳回'],
  '终审中': ['已审核', '已驳回'],
  '已审核': ['签发中', '已驳回'],
  '签发中': ['已签发'],
  '已签发': ['已发布', '修订中'],
  '已发布': ['修订中'],
  '修订中': ['已修订'],
  '已修订': ['已发布'],
  '已驳回': ['书写中', '修订中'],
};

export function reportRouter(db: Database.Database): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const { status, modality, search, page = '1', pageSize = '50' } = req.query as Record<string, string>;
    let sql = 'SELECT * FROM reports WHERE 1=1';
    const params: unknown[] = [];
    if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
    if (modality && modality !== 'all') { sql += ' AND modality = ?'; params.push(modality); }
    if (search) { sql += ' AND (patient_name LIKE ? OR report_id LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (Number(page) - 1) * Number(pageSize);
    params.push(Number(pageSize), offset);
    const rows = db.prepare(sql).all(...params).map(mapReportRow);
    res.json({ success: true, data: rows });
  });

  router.get('/stats', (_req: Request, res: Response) => {
    const byStatus = db.prepare('SELECT status, COUNT(*) as cnt FROM reports GROUP BY status').all();
    const total = db.prepare('SELECT COUNT(*) as cnt FROM reports').get() as { cnt: number };
    res.json({ success: true, data: { total: total.cnt, byStatus } });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const row = db.prepare('SELECT * FROM reports WHERE id = ? OR report_id = ?').get(req.params.id, req.params.id);
    if (!row) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '报告不存在' } });
    res.json({ success: true, data: mapReportRow(row as Record<string, unknown>) });
  });

  router.post('/', (req: Request, res: Response) => {
    const id = `RPT-${uuid().slice(0, 8)}`;
    const b = req.body;
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO reports (id, report_id, exam_id, patient_id, patient_name, modality, body_part, status, doctor_id, doctor_name, created_time, updated_time, report_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, b.reportId || id, b.examId, b.patientId, b.patientName, b.modality, b.bodyPart, '待分配', b.doctorId, b.doctorName, now, now, b.reportSource || 'manual');
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: mapReportRow(row as Record<string, unknown>) });
  });

  router.put('/:id', (req: Request, res: Response) => {
    const b = req.body;
    const existing = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    const now = new Date().toISOString();
    db.prepare(`UPDATE reports SET findings=?, diagnosis=?, impression=?, conclusion=?, recommendation=?, clinical_history=?, technique=?, comparison=?, doctor_id=?, doctor_name=?, quality_score=?, updated_time=? WHERE id=?`)
      .run(b.findings ?? existing.findings, b.diagnosis ?? existing.diagnosis, b.impression ?? existing.impression,
        b.conclusion ?? existing.conclusion, b.recommendation ?? existing.recommendation,
        b.clinicalHistory ?? existing.clinical_history, b.technique ?? existing.technique,
        b.comparison ?? existing.comparison, b.doctorId ?? existing.doctor_id, b.doctorName ?? existing.doctor_name,
        b.qualityScore ?? existing.quality_score, now, req.params.id);
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: mapReportRow(row as Record<string, unknown>) });
  });

  // 状态流转 — 14 态机守卫
  function transitionReport(id: string, toStatus: string, field: string, value: string, res: Response) {
    const existing = db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    const allowed = ALLOWED_TRANSITIONS[existing.status as string] || [];
    if (!allowed.includes(toStatus)) {
      return res.status(400).json({ success: false, error: { code: 'ILLEGAL_TRANSITION', message: `不允许从 ${existing.status} 转换为 ${toStatus}` } });
    }
    const now = new Date().toISOString();
    let extraSql = '';
    if (field) extraSql = `, ${field}=?`;
    db.prepare(`UPDATE reports SET status=?, updated_time=?${extraSql} WHERE id=?`).run(toStatus, now, value || null, id);
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    res.json({ success: true, data: mapReportRow(row as Record<string, unknown>) });
  }

  router.post('/:id/submit', (req: Request, res: Response) => transitionReport(req.params.id, '已提交', 'updated_time', '', res));
  router.post('/:id/assign', (req: Request, res: Response) => {
    const { doctorId, doctorName } = req.body;
    db.prepare('UPDATE reports SET doctor_id=?, doctor_name=? WHERE id=?').run(doctorId, doctorName, req.params.id);
    transitionReport(req.params.id, '已分配', '', '', res);
  });
  router.post('/:id/review', (req: Request, res: Response) => {
    const { suggestion, score, type } = req.body;
    if (type === 'initial') {
      const now = new Date().toISOString();
      db.prepare('UPDATE reports SET initial_audit_doctor_id=?, initial_audit_doctor_name=?, initial_audit_time=?, initial_audit_suggestion=?, initial_audit_score=? WHERE id=?')
        .run(req.body.doctorId, req.body.doctorName, now, suggestion, score, req.params.id);
      transitionReport(req.params.id, '初审通过', '', '', res);
    } else {
      const now = new Date().toISOString();
      db.prepare('UPDATE reports SET final_audit_doctor_id=?, final_audit_doctor_name=?, final_audit_time=?, final_audit_suggestion=?, final_audit_score=? WHERE id=?')
        .run(req.body.doctorId, req.body.doctorName, now, suggestion, score, req.params.id);
      transitionReport(req.params.id, '已审核', '', '', res);
    }
  });
  router.post('/:id/sign', (req: Request, res: Response) => {
    const code = `V${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();
    db.prepare('UPDATE reports SET signed_time=?, report_verification_code=?, status=?, updated_time=? WHERE id=?')
      .run(now, code, '已签发', now, req.params.id);
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: mapReportRow(row as Record<string, unknown>) });
  });
  router.post('/:id/publish', (req: Request, res: Response) => {
    const now = new Date().toISOString();
    db.prepare('UPDATE reports SET published_time=?, published_by=?, status=?, updated_time=? WHERE id=?')
      .run(now, req.body.publishedBy || 'system', '已发布', now, req.params.id);
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: mapReportRow(row as Record<string, unknown>) });
  });
  router.post('/:id/reject', (req: Request, res: Response) => transitionReport(req.params.id, '已驳回', '', '', res));
  router.post('/:id/revise', (req: Request, res: Response) => transitionReport(req.params.id, '修订中', '', '', res));

  return router;
}
