// ============================================================
// G005 放射RIS系统 v2.1.0 - 报告查询服务
// Phase R12 W10: Dexie 集成 + 过滤/分页/统计
// ============================================================

import type { Table } from 'dexie';
import Dexie from 'dexie';
import { generateReports, summarizeReports, type SeedReport } from '../data/reportSeed';

export interface ReportQuery {
  text?: string;                          // 全文模糊
  status?: SeedReport['status'] | SeedReport['status'][];
  modality?: SeedReport['modality'] | SeedReport['modality'][];
  priority?: SeedReport['priority'] | SeedReport['priority'][];
  doctorId?: string;
  isCritical?: boolean;
  isDraft?: boolean;
  patientId?: string;
  startDate?: string;                     // ISO >= 
  endDate?: string;                       // ISO <=
}

export interface PageOptions {
  page?: number;                          // 1-based
  pageSize?: number;                      // default 20
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'qualityScore' | 'patientName';
  sortDir?: 'asc' | 'desc';
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const SEED_KEY = 'g005.reports.seeded.v1';

let _reports: SeedReport[] | null = null;
let _db: Dexie | null = null;

function getDb(): Dexie {
  if (_db) return _db;
  _db = new Dexie('g005-radiology-ris-reports');
  _db.version(1).stores({
    reports: 'id, patientId, modality, status, priority, doctorId, createdAt, updatedAt, isCritical, isDraft',
  });
  return _db;
}

export async function tableReports(): Promise<Table<SeedReport, string>> {
  return getDb().table<SeedReport, string>('reports');
}

export async function ensureSeed(count = 500): Promise<number> {
  const t = await tableReports();
  const existing = await t.count();
  if (existing >= count) return existing;
  const seed = generateReports(count);
  await t.bulkPut(seed);
  try { localStorage.setItem(SEED_KEY, new Date().toISOString()); } catch { /* ignore */ }
  return seed.length;
}

export async function resetSeed(count = 500): Promise<number> {
  const t = await tableReports();
  await t.clear();
  return ensureSeed(count);
}

export async function listReports(): Promise<SeedReport[]> {
  return Array.from(await (await tableReports()).toArray());
}

const PRIORITY_WEIGHT: Record<SeedReport['priority'], number> = {
  critical: 4, stat: 3, urgent: 2, routine: 1,
};

function matchReport(r: SeedReport, q: ReportQuery): boolean {
  if (q.text) {
    const t = q.text.toLowerCase();
    const hay = (r.patientName + r.id + r.bodyPart + r.findings + r.impression + r.clinicalHistory).toLowerCase();
    if (!hay.includes(t)) return false;
  }
  if (q.status) {
    const set = Array.isArray(q.status) ? q.status : [q.status];
    if (!set.includes(r.status)) return false;
  }
  if (q.modality) {
    const set = Array.isArray(q.modality) ? q.modality : [q.modality];
    if (!set.includes(r.modality)) return false;
  }
  if (q.priority) {
    const set = Array.isArray(q.priority) ? q.priority : [q.priority];
    if (!set.includes(r.priority)) return false;
  }
  if (q.doctorId && r.doctorId !== q.doctorId) return false;
  if (q.isCritical !== undefined && r.isCritical !== q.isCritical) return false;
  if (q.isDraft !== undefined && r.isDraft !== q.isDraft) return false;
  if (q.patientId && r.patientId !== q.patientId) return false;
  if (q.startDate && r.createdAt < q.startDate) return false;
  if (q.endDate && r.createdAt > q.endDate) return false;
  return true;
}

export async function queryReports(q: ReportQuery, opts: PageOptions = {}): Promise<PageResult<SeedReport>> {
  const t = await tableReports();
  const all = await t.toArray();
  const filtered = all.filter(r => matchReport(r, q));
  const sortBy = opts.sortBy ?? 'createdAt';
  const sortDir = opts.sortDir ?? 'desc';
  filtered.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'createdAt': cmp = a.createdAt.localeCompare(b.createdAt); break;
      case 'updatedAt': cmp = a.updatedAt.localeCompare(b.updatedAt); break;
      case 'priority': cmp = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]; break;
      case 'qualityScore': cmp = a.qualityScore - b.qualityScore; break;
      case 'patientName': cmp = a.patientName.localeCompare(b.patientName); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.max(1, Math.min(200, opts.pageSize ?? 20));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages,
  };
}

export async function getReportById(id: string): Promise<SeedReport | undefined> {
  return (await tableReports()).get(id);
}

export async function updateReport(id: string, patch: Partial<SeedReport>): Promise<SeedReport | undefined> {
  const t = await tableReports();
  const cur = await t.get(id);
  if (!cur) return undefined;
  const next: SeedReport = { ...cur, ...patch, id: cur.id, updatedAt: new Date().toISOString() };
  await t.put(next);
  return next;
}

export async function deleteReport(id: string): Promise<void> {
  await (await tableReports()).delete(id);
}

export async function reportStats() {
  const all = await listReports();
  return summarizeReports(all);
}

export function getInMemoryReports(): SeedReport[] {
  if (!_reports) _reports = generateReports(500);
  return _reports;
}
