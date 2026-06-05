// ============================================================
// G005 放射RIS系统 v2.0.0 - Dexie 持久化层
// Phase R8 W6-D: IndexedDB 模拟后端 (替代 localStorage)
// ============================================================

import Dexie, { type Table } from 'dexie';
import type { RadiologyReport } from '../types';

export interface ReportRow {
  id: string;
  patientId: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  status: string;
  doctorId: string;
  doctorName: string;
  priority: string;
  content: string;
  plainText: string;
  structuredValues: Record<string, any>;
  measurements: any[];
  isCritical: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  signedBy?: string;
  reviewedBy?: string;
  qualityScore?: number;
  qualityGrade?: string;
}

export interface PatientRow {
  id: string;
  mrn: string;
  name: string;
  pinyin: string;
  gender: 'M' | 'F' | 'O';
  birthDate: string;
  age: number;
  phone?: string;
  idCard?: string;
  createdAt: string;
}

export interface AuditLogRow {
  id?: number;
  ts: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  hash: string;
  prevHash: string;
}

export interface PhraseRow {
  id: string;
  title: string;
  content: string;
  category: string;
  modality?: string;
  bodyPart?: string;
  usageCount: number;
  rating: number;
  tags?: string[];
  author: string;
  createdAt: string;
}

export interface TemplateRow {
  id: string;
  name: string;
  modality: string;
  bodyPart: string;
  fields: any[];
  isShared: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageAnnotationRow {
  id: string;
  reportId: string;
  seriesId: string;
  sliceIndex: number;
  x: number;
  y: number;
  w?: number;
  h?: number;
  type: 'arrow' | 'text' | 'roi' | 'caliper' | 'angle';
  label: string;
  value?: string;
  unit?: string;
  createdAt: string;
  createdBy: string;
}

class G005Database extends Dexie {
  reports!: Table<ReportRow, string>;
  patients!: Table<PatientRow, string>;
  auditLogs!: Table<AuditLogRow, number>;
  phrases!: Table<PhraseRow, string>;
  templates!: Table<TemplateRow, string>;
  annotations!: Table<ImageAnnotationRow, string>;

  constructor() {
    super('G005RISDatabase');
    this.version(1).stores({
      reports: 'id, patientId, patientName, status, modality, bodyPart, doctorId, createdAt, updatedAt, isCritical, isDraft',
      patients: 'id, mrn, name, pinyin, createdAt',
      auditLogs: '++id, ts, userId, action, entityType, entityId',
      phrases: 'id, category, modality, bodyPart, usageCount, rating',
      templates: 'id, modality, bodyPart, isShared, authorId',
      annotations: 'id, reportId, seriesId, sliceIndex, createdAt',
    });
  }
}

export const db = new G005Database();

// ============================================================
// Reports CRUD
// ============================================================
export const reportsRepo = {
  async list(filter?: Partial<ReportRow>): Promise<ReportRow[]> {
    let q = db.reports.orderBy('updatedAt').reverse();
    const all = await q.toArray();
    if (!filter) return all;
    return all.filter(r => {
      return Object.entries(filter).every(([k, v]) => r[k as keyof ReportRow] === v);
    });
  },
  async get(id: string): Promise<ReportRow | undefined> {
    return db.reports.get(id);
  },
  async upsert(report: ReportRow): Promise<void> {
    await db.reports.put({ ...report, updatedAt: new Date().toISOString() });
  },
  async delete(id: string): Promise<void> {
    await db.reports.delete(id);
  },
  async byStatus(status: string): Promise<ReportRow[]> {
    return db.reports.where('status').equals(status).toArray();
  },
  async byDoctor(doctorId: string): Promise<ReportRow[]> {
    return db.reports.where('doctorId').equals(doctorId).toArray();
  },
  async critical(): Promise<ReportRow[]> {
    return db.reports.where('isCritical').equals(1 as any).toArray();
  },
  async pending(): Promise<ReportRow[]> {
    return db.reports.filter(r => ['已分配', '书写中', '已提交', '初审中', '终审中'].includes(r.status)).toArray();
  },
};

// ============================================================
// Patients CRUD
// ============================================================
export const patientsRepo = {
  async list(): Promise<PatientRow[]> {
    return db.patients.orderBy('createdAt').reverse().toArray();
  },
  async get(id: string): Promise<PatientRow | undefined> {
    return db.patients.get(id);
  },
  async byMRN(mrn: string): Promise<PatientRow | undefined> {
    return db.patients.where('mrn').equals(mrn).first();
  },
  async upsert(patient: PatientRow): Promise<void> {
    await db.patients.put(patient);
  },
  async search(query: string): Promise<PatientRow[]> {
    const q = query.toLowerCase();
    const all = await db.patients.toArray();
    return all.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.pinyin.toLowerCase().includes(q) ||
      p.mrn.includes(q) ||
      (p.idCard && p.idCard.includes(q))
    );
  },
};

// ============================================================
// Audit Logs (blockchain-like chain)
// ============================================================
export const auditRepo = {
  async append(log: Omit<AuditLogRow, 'id' | 'hash' | 'prevHash'>): Promise<void> {
    const last = await db.auditLogs.orderBy('id').reverse().first();
    const prevHash = last?.hash || '0'.repeat(64);
    const ts = log.ts || new Date().toISOString();
    const hashInput = `${ts}|${log.userId}|${log.action}|${log.entityType}|${log.entityId}|${prevHash}`;
    const hash = await sha256(hashInput);
    await db.auditLogs.add({ ...log, ts, prevHash, hash });
  },
  async list(limit = 100): Promise<AuditLogRow[]> {
    return db.auditLogs.orderBy('id').reverse().limit(limit).toArray();
  },
  async verifyChain(): Promise<{ valid: boolean; brokenAt?: number }> {
    const logs = await db.auditLogs.orderBy('id').toArray();
    for (let i = 0; i < logs.length; i++) {
      if (i === 0) continue;
      if (logs[i].prevHash !== logs[i - 1].hash) {
        return { valid: false, brokenAt: logs[i].id };
      }
    }
    return { valid: true };
  },
};

// ============================================================
// Phrases / Templates
// ============================================================
export const phrasesRepo = {
  async list(): Promise<PhraseRow[]> {
    return db.phrases.toArray();
  },
  async upsert(phrase: PhraseRow): Promise<void> {
    await db.phrases.put(phrase);
  },
  async incrementUsage(id: string): Promise<void> {
    const p = await db.phrases.get(id);
    if (p) await db.phrases.put({ ...p, usageCount: p.usageCount + 1 });
  },
};

export const templatesRepo = {
  async list(): Promise<TemplateRow[]> {
    return db.templates.toArray();
  },
  async upsert(t: TemplateRow): Promise<void> {
    await db.templates.put({ ...t, updatedAt: new Date().toISOString() });
  },
};

// ============================================================
// Image Annotations
// ============================================================
export const annotationsRepo = {
  async listByReport(reportId: string): Promise<ImageAnnotationRow[]> {
    return db.annotations.where('reportId').equals(reportId).toArray();
  },
  async create(ann: ImageAnnotationRow): Promise<void> {
    await db.annotations.put(ann);
  },
  async delete(id: string): Promise<void> {
    await db.annotations.delete(id);
  },
};

// ============================================================
// Utilities
// ============================================================
async function sha256(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const enc = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback (no crypto.subtle) - simple hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// 数据库版本管理
export async function getDbStats() {
  const [reports, patients, auditLogs, phrases, templates, annotations] = await Promise.all([
    db.reports.count(),
    db.patients.count(),
    db.auditLogs.count(),
    db.phrases.count(),
    db.templates.count(),
    db.annotations.count(),
  ]);
  return { reports, patients, auditLogs, phrases, templates, annotations };
}

export async function exportAll(): Promise<string> {
  return JSON.stringify({
    reports: await db.reports.toArray(),
    patients: await db.patients.toArray(),
    auditLogs: await db.auditLogs.toArray(),
    phrases: await db.phrases.toArray(),
    templates: await db.templates.toArray(),
    annotations: await db.annotations.toArray(),
  }, null, 2);
}

export async function importAll(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction('rw', [db.reports, db.patients, db.auditLogs, db.phrases, db.templates, db.annotations], async () => {
    if (data.reports) await db.reports.bulkPut(data.reports);
    if (data.patients) await db.patients.bulkPut(data.patients);
    if (data.auditLogs) await db.auditLogs.bulkPut(data.auditLogs);
    if (data.phrases) await db.phrases.bulkPut(data.phrases);
    if (data.templates) await db.templates.bulkPut(data.templates);
    if (data.annotations) await db.annotations.bulkPut(data.annotations);
  });
}

export async function clearAll(): Promise<void> {
  await db.transaction('rw', [db.reports, db.patients, db.auditLogs, db.phrases, db.templates, db.annotations], async () => {
    await db.reports.clear();
    await db.patients.clear();
    await db.auditLogs.clear();
    await db.phrases.clear();
    await db.templates.clear();
    await db.annotations.clear();
  });
}
