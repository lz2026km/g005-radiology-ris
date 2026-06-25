// [v3.0.6.8-32] In-memory Store + IndexedDB 持久化
// 支持 CRUD 操作, 写入自动持久到 IDB, 启动时从 IDB 恢复
import Dexie, { type EntityTable } from 'dexie';
import {
  PATIENT_MASTER, DEVICE_MASTER, DOCTOR_MASTER, EXAM_ITEM_MASTER,
} from '../../data/master';
import {
  EXAM_REPORT_PRE, DOCTOR_PERFORMANCE_PRE, DAILY_KPI_PRE,
  CRITICAL_EVENTS_PRE, COSIGN_TASKS_PRE, QUALITY_SCORE_PRE,
} from '../../data/_generators';

// ==================== IndexedDB Schema (Dexie) ====================
class RISBackendDB extends Dexie {
  patients!: EntityTable<{ id: string; data: unknown }, 'id'>;
  devices!: EntityTable<{ id: string; data: unknown }, 'id'>;
  doctors!: EntityTable<{ id: string; data: unknown }, 'id'>;
  examItems!: EntityTable<{ id: string; data: unknown }, 'id'>;
  exams!: EntityTable<{ id: string; data: unknown }, 'id'>;
  reports!: EntityTable<{ id: string; data: unknown }, 'id'>;
  criticalEvents!: EntityTable<{ id: string; data: unknown }, 'id'>;
  cosignTasks!: EntityTable<{ id: string; data: unknown }, 'id'>;
  qualityScores!: EntityTable<{ id: string; data: unknown }, 'id'>;
  doctorPerformance!: EntityTable<{ id: string; data: unknown }, 'id'>;
  dailyKpi!: EntityTable<{ id: string; data: unknown }, 'id'>;
  // 审计日志
  auditLog!: EntityTable<{ id: string; data: unknown }, 'id'>;

  constructor() {
    super('RISBackendDB');
    this.version(1).stores({
      patients: 'id',
      devices: 'id',
      doctors: 'id',
      examItems: 'id',
      exams: 'id',
      reports: 'id',
      criticalEvents: 'id',
      cosignTasks: 'id',
      qualityScores: 'id',
      doctorPerformance: 'id',
      dailyKpi: 'id',
      auditLog: 'id, timestamp',
    });
  }
}

// ==================== 检测 IndexedDB 可用性 ====================
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

const USE_IDB = isIndexedDBAvailable();

let db: RISBackendDB | null = null;
if (USE_IDB) {
  try {
    db = new RISBackendDB();
  } catch (e) {
    console.warn('[RIS Backend] IndexedDB 初始化失败, 降级到纯内存:', e);
    db = null;
  }
}

// ==================== In-memory 缓存 ====================
const memoryStore: Map<string, Map<string, unknown>> = new Map();

const COLLECTIONS = [
  'patients', 'devices', 'doctors', 'examItems',
  'exams', 'reports', 'criticalEvents', 'cosignTasks',
  'qualityScores', 'doctorPerformance', 'dailyKpi',
] as const;
type Collection = typeof COLLECTIONS[number];

function getCollection(name: Collection): Map<string, unknown> {
  let col = memoryStore.get(name);
  if (!col) {
    col = new Map();
    memoryStore.set(name, col);
  }
  return col;
}

let initialized = false;
let initPromise: Promise<void> | null = null;

// ==================== 初始化 ====================
export async function initStore(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 加载主数据池到内存 (只读基线)
    PATIENT_MASTER.forEach(p => getCollection('patients').set(p.id, p));
    DEVICE_MASTER.forEach(d => getCollection('devices').set(d.id, d));
    DOCTOR_MASTER.forEach(d => getCollection('doctors').set(d.id, d));
    EXAM_ITEM_MASTER.forEach(e => getCollection('examItems').set(e.code, e));

    // 加载生成器预生成数据
    EXAM_REPORT_PRE.forEach(e => getCollection('exams').set(e.reportId, e));
    QUALITY_SCORE_PRE.forEach(q => getCollection('qualityScores').set(q.id, q));
    CRITICAL_EVENTS_PRE.forEach(c => getCollection('criticalEvents').set(c.id, c));
    COSIGN_TASKS_PRE.forEach(c => getCollection('cosignTasks').set(c.id, c));
    DOCTOR_PERFORMANCE_PRE.forEach(d => getCollection('doctorPerformance').set(d.id, d));
    DAILY_KPI_PRE.forEach(d => getCollection('dailyKpi').set(d.date, d));

    // 从 IDB 恢复用户修改 (覆盖基线)
    if (db) {
      try {
        for (const coll of COLLECTIONS) {
          const tbl = (db as any)[coll];
          if (!tbl) continue;
          const records = await tbl.toArray();
          records.forEach((r: { id: string; data: unknown }) => {
            getCollection(coll).set(r.id, r.data);
          });
        }
        console.info('[RIS Backend] IndexedDB 持久化数据已加载');
      } catch (e) {
        console.warn('[RIS Backend] IDB 读取失败, 用基线数据:', e);
      }
    }

    initialized = true;
  })();

  return initPromise;
}

// ==================== 同步初始化 (用于同步代码路径) ====================
export function ensureInitialized(): void {
  if (initialized) return;
  // 同步模式: 直接加载基线数据, 不等待 IDB
  PATIENT_MASTER.forEach(p => getCollection('patients').set(p.id, p));
  DEVICE_MASTER.forEach(d => getCollection('devices').set(d.id, d));
  DOCTOR_MASTER.forEach(d => getCollection('doctors').set(d.id, d));
  EXAM_ITEM_MASTER.forEach(e => getCollection('examItems').set(e.code, e));
  EXAM_REPORT_PRE.forEach(e => getCollection('exams').set(e.reportId, e));
  QUALITY_SCORE_PRE.forEach(q => getCollection('qualityScores').set(q.id, q));
  CRITICAL_EVENTS_PRE.forEach(c => getCollection('criticalEvents').set(c.id, c));
  COSIGN_TASKS_PRE.forEach(c => getCollection('cosignTasks').set(c.id, c));
  DOCTOR_PERFORMANCE_PRE.forEach(d => getCollection('doctorPerformance').set(d.id, d));
  DAILY_KPI_PRE.forEach(d => getCollection('dailyKpi').set(d.date, d));
  initialized = true;
}

// ==================== CRUD 操作 ====================
export function list<T = unknown>(collection: Collection): T[] {
  ensureInitialized();
  const col = getCollection(collection);
  return Array.from(col.values()) as T[];
}

export function get<T = unknown>(collection: Collection, id: string): T | undefined {
  ensureInitialized();
  return getCollection(collection).get(id) as T | undefined;
}

export function findOne<T = unknown>(collection: Collection, predicate: (item: T) => boolean): T | undefined {
  ensureInitialized();
  const col = getCollection(collection);
  for (const item of col.values()) {
    if (predicate(item as T)) return item as T;
  }
  return undefined;
}

export function findMany<T = unknown>(collection: Collection, predicate: (item: T) => boolean): T[] {
  ensureInitialized();
  const col = getCollection(collection);
  const result: T[] = [];
  for (const item of col.values()) {
    if (predicate(item as T)) result.push(item as T);
  }
  return result;
}

export function create<T extends { id: string }>(collection: Collection, item: T): T {
  ensureInitialized();
  getCollection(collection).set(item.id, item);
  persistAsync(collection, item.id, item);
  return item;
}

export function update<T extends { id: string }>(collection: Collection, id: string, updates: Partial<T>): T | undefined {
  ensureInitialized();
  const col = getCollection(collection);
  const existing = col.get(id) as T | undefined;
  if (!existing) return undefined;
  const updated = { ...existing, ...updates, id } as T;
  col.set(id, updated);
  persistAsync(collection, id, updated);
  return updated;
}

export function remove(collection: Collection, id: string): boolean {
  ensureInitialized();
  const col = getCollection(collection);
  const existed = col.delete(id);
  if (existed && db) {
    try {
      const tbl = (db as any)[collection];
      if (tbl) tbl.delete(id);
    } catch {}
  }
  return existed;
}

export function clear(collection: Collection): void {
  ensureInitialized();
  getCollection(collection).clear();
  if (db) {
    try {
      const tbl = (db as any)[collection];
      if (tbl) tbl.clear();
    } catch {}
  }
}

// ==================== 持久化 (异步, 不阻塞返回) ====================
function persistAsync(collection: Collection, id: string, data: unknown): void {
  if (!db) return;
  const tbl = (db as any)[collection];
  if (!tbl) return;
  tbl.put({ id, data }).catch((e: Error) => {
    console.warn(`[RIS Backend] IDB 写入失败 ${collection}/${id}:`, e.message);
  });
}

// ==================== 审计日志 ====================
export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'read' | 'status_change';
  resource: string;
  resourceId: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}

export function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const full: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  if (db) {
    try {
      db.auditLog.put({ id: full.id, data: full });
    } catch {}
  }
  // 内存中也保留最近 1000 条
  if (!memoryStore.has('auditLog')) memoryStore.set('auditLog', new Map());
  const auditMap = memoryStore.get('auditLog')!;
  auditMap.set(full.id, full);
  if (auditMap.size > 1000) {
    const oldest = Array.from(auditMap.keys()).slice(0, auditMap.size - 1000);
    oldest.forEach(k => auditMap.delete(k));
  }
}

export function listAudit(limit = 100): AuditEntry[] {
  ensureInitialized();
  const col = memoryStore.get('auditLog');
  if (!col) return [];
  return Array.from(col.values())
    .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit) as AuditEntry[];
}

// ==================== 状态查询 ====================
export function stats() {
  const result: Record<string, number> = {};
  for (const coll of COLLECTIONS) {
    result[coll] = getCollection(coll).size;
  }
  result['auditLog'] = memoryStore.get('auditLog')?.size || 0;
  return result;
}

export function isUsingIndexedDB(): boolean {
  return USE_IDB && db !== null;
}

// ==================== 重置 (测试用) ====================
export async function resetStore(): Promise<void> {
  if (db) {
    for (const coll of [...COLLECTIONS, 'auditLog' as Collection]) {
      const tbl = (db as any)[coll];
      if (tbl) await tbl.clear();
    }
  }
  memoryStore.clear();
  initialized = false;
  initPromise = null;
  await initStore();
}
