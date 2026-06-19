/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端离线同步引擎
 * 30 升级点:本地保存 / 冲突检测 / 字段级合并 / 重试退避 / 批量同步 / 进度回调
 */

import type {
  OfflineEditPayload,
  SyncBatchResult,
  SyncItemResult,
  MobileConflict,
  ConflictResolutionStrategy,
} from '../../types/mobile';
import { indexedDbCache } from './IndexedDbCache';

const QUEUE_DB = 'g005-mobile-sync';
const QUEUE_STORE = 'queue';
const CONFLICT_STORE = 'conflicts';

const MAX_RETRY = 5;
const BASE_BACKOFF_MS = 800;

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(QUEUE_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('capturedAt', 'capturedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(CONFLICT_STORE)) {
        db.createObjectStore(CONFLICT_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function nextRetryDelay(attempts: number): number {
  return Math.min(BASE_BACKOFF_MS * Math.pow(2, attempts), 60_000);
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function diffFields(local: Record<string, unknown>, server: Record<string, unknown>): Array<{ field: string; local: unknown; server: unknown }> {
  const diffs: Array<{ field: string; local: unknown; server: unknown }> = [];
  const keys = new Set([...Object.keys(local), ...Object.keys(server)]);
  for (const k of keys) {
    if (k === 'id' || k === 'updatedAt' || k === 'version') continue;
    if (JSON.stringify(local[k]) !== JSON.stringify(server[k])) {
      diffs.push({ field: k, local: local[k], server: server[k] });
    }
  }
  return diffs;
}

function mergeFieldLevel(local: Record<string, unknown>, server: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...server };
  for (const [k, v] of Object.entries(local)) {
    if (!(k in server) || server[k] === null || server[k] === undefined || server[k] === '') {
      merged[k] = v;
    }
  }
  return merged;
}

function priorityWeight(p: OfflineEditPayload['priority']): number {
  return p === 'critical' ? 0 : p === 'high' ? 1 : p === 'normal' ? 2 : 3;
}

async function enqueueItem(item: OfflineEditPayload): Promise<void> {
  const db = await openQueueDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const record = {
      ...item,
      id: generateId('sync'),
      status: 'pending' as const,
      attempts: 0,
      enqueuedAt: new Date().toISOString(),
    };
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function updateItem(id: string, updates: Record<string, unknown>): Promise<void> {
  const db = await openQueueDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const req = store.get(id);
    req.onsuccess = () => {
      const existing = req.result;
      if (existing) store.put({ ...existing, ...updates });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function recordConflict(conflict: MobileConflict): Promise<void> {
  const db = await openQueueDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CONFLICT_STORE, 'readwrite');
    tx.objectStore(CONFLICT_STORE).put(conflict);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getServerSnapshot(entityType: string, entityId: string): Promise<Record<string, unknown> | null> {
  try {
    const cached = await indexedDbCache.get<Record<string, unknown>>(`server:${entityType}:${entityId}`);
    return cached;
  } catch {
    return null;
  }
}

async function simulateRemotePush(item: OfflineEditPayload): Promise<{
  status: 'ok' | 'conflict' | 'server-error';
  serverItem?: Record<string, unknown>;
  serverVersion?: number;
  error?: string;
}> {
  const server = await getServerSnapshot(item.entityType, item.entityId);
  if (item.operation === 'create') {
    if (server) {
      return { status: 'conflict', serverItem: server, serverVersion: Number(server['version'] ?? 0) };
    }
    return { status: 'ok', serverVersion: 1 };
  }
  if (item.operation === 'delete') {
    if (!server) return { status: 'ok' };
    return { status: 'ok' };
  }
  if (!server) {
    return { status: 'ok', serverVersion: 1 };
  }
  const serverVersion = Number(server['version'] ?? 0);
  const baseVersion = item.baseVersion ?? 0;
  if (baseVersion !== serverVersion) {
    return { status: 'conflict', serverItem: server, serverVersion };
  }
  return { status: 'ok', serverVersion: serverVersion + 1 };
}

export interface SyncProgressEvent {
  completed: number;
  total: number;
  currentItem: string;
  currentStatus: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
}

export type SyncProgressListener = (event: SyncProgressEvent) => void;

class OfflineSyncEngine {
  private listeners: Set<SyncProgressListener> = new Set();
  private inflight = false;
  private lastBatch: SyncBatchResult | null = null;

  onProgress(listener: SyncProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: SyncProgressEvent): void {
    for (const fn of this.listeners) {
      try {
        fn(event);
      } catch {
        // swallow listener errors so sync is not disrupted
      }
    }
  }

  async saveLocal<T extends Record<string, unknown>>(data: OfflineEditPayload<T>): Promise<{
    id: string;
    cached: boolean;
    queued: boolean;
  }> {
    await indexedDbCache.set(`local:${data.entityType}:${data.entityId}`, data, {
      category: data.entityType === 'patient' ? 'patient'
        : data.entityType === 'report' ? 'report'
        : data.entityType === 'image' ? 'image'
        : 'worklist',
      priority: data.priority === 'critical' ? 10 : data.priority === 'high' ? 7 : 4,
      syncStatus: 'dirty',
    });
    await enqueueItem(data as OfflineEditPayload);
    return { id: data.entityId, cached: true, queued: true };
  }

  async listQueue(status?: 'pending' | 'syncing' | 'failed' | 'conflict'): Promise<OfflineEditPayload[]> {
    const db = await openQueueDb();
    const items = await new Promise<OfflineEditPayload[]>((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const req = status ? store.index('status').getAll(status) : store.getAll();
      req.onsuccess = () => resolve((req.result as OfflineEditPayload[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return items.sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
  }

  async getQueueCount(): Promise<number> {
    const items = await this.listQueue('pending');
    return items.length;
  }

  async sync(options: { force?: boolean; entityTypes?: string[] } = {}): Promise<SyncBatchResult> {
    if (this.inflight && !options.force) {
      return this.lastBatch ?? this.emptyBatch();
    }
    this.inflight = true;
    const startedAt = new Date().toISOString();
    const items = await this.listQueue('pending');
    const filtered = options.entityTypes
      ? items.filter(i => options.entityTypes!.includes(i.entityType))
      : items;
    const result: SyncBatchResult = {
      totalItems: filtered.length,
      successCount: 0,
      failureCount: 0,
      conflictCount: 0,
      skippedCount: 0,
      durationMs: 0,
      startedAt,
      finishedAt: startedAt,
      items: [],
    };
    const t0 = performance.now();
    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i]!;
      this.emit({
        completed: i,
        total: filtered.length,
        currentItem: item.entityId,
        currentStatus: 'syncing',
      });
      await updateItem(item.id ?? '', { status: 'syncing' });
      const remote = await simulateRemotePush(item);
      if (remote.status === 'ok') {
        await updateItem(item.id ?? '', { status: 'synced', syncedAt: new Date().toISOString() });
        await indexedDbCache.markClean(`local:${item.entityType}:${item.entityId}`).catch(() => undefined);
        result.items.push({
          itemId: item.id ?? '',
          entityType: item.entityType,
          entityId: item.entityId,
          status: 'synced',
          serverVersion: remote.serverVersion,
          attempts: 1,
        });
        result.successCount++;
      } else if (remote.status === 'conflict' && remote.serverItem) {
        const localData = item.data as Record<string, unknown>;
        const diffs = diffFields(localData, remote.serverItem);
        for (const diff of diffs) {
          const conflict: MobileConflict = {
            id: generateId('cf'),
            entityType: item.entityType,
            entityId: item.entityId,
            field: diff.field,
            localValue: diff.local,
            serverValue: diff.server,
            localTimestamp: item.capturedAt,
            serverTimestamp: new Date().toISOString(),
            localUserId: item.userId,
            serverUserId: String(remote.serverItem['lastModifiedBy'] ?? 'unknown'),
          };
          await recordConflict(conflict);
        }
        await updateItem(item.id ?? '', { status: 'conflict' });
        result.items.push({
          itemId: item.id ?? '',
          entityType: item.entityType,
          entityId: item.entityId,
          status: 'conflict',
          attempts: 1,
        });
        result.conflictCount++;
      } else {
        const attempts = Number((item as unknown as { attempts?: number }).attempts ?? 0) + 1;
        if (attempts >= MAX_RETRY) {
          await updateItem(item.id ?? '', { status: 'failed', attempts, error: remote.error });
          result.items.push({
            itemId: item.id ?? '',
            entityType: item.entityType,
            entityId: item.entityId,
            status: 'failed',
            errorMessage: remote.error,
            attempts,
          });
          result.failureCount++;
        } else {
          await updateItem(item.id ?? '', { status: 'pending', attempts });
          await new Promise(r => setTimeout(r, nextRetryDelay(attempts)));
          result.items.push({
            itemId: item.id ?? '',
            entityType: item.entityType,
            entityId: item.entityId,
            status: 'skipped',
            attempts,
          });
          result.skippedCount++;
        }
      }
      this.emit({
        completed: i + 1,
        total: filtered.length,
        currentItem: item.entityId,
        currentStatus: 'synced',
      });
    }
    result.durationMs = Math.round(performance.now() - t0);
    result.finishedAt = new Date().toISOString();
    this.lastBatch = result;
    this.inflight = false;
    return result;
  }

  async getConflicts(): Promise<MobileConflict[]> {
    const db = await openQueueDb();
    const items = await new Promise<MobileConflict[]>((resolve, reject) => {
      const tx = db.transaction(CONFLICT_STORE, 'readonly');
      const req = tx.objectStore(CONFLICT_STORE).getAll();
      req.onsuccess = () => resolve((req.result as MobileConflict[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return items;
  }

  async resolveConflict(
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    resolver: string,
  ): Promise<boolean> {
    const db = await openQueueDb();
    const conflict = await new Promise<MobileConflict | null>((resolve, reject) => {
      const tx = db.transaction(CONFLICT_STORE, 'readwrite');
      const req = tx.objectStore(CONFLICT_STORE).get(conflictId);
      req.onsuccess = () => {
        const c = req.result as MobileConflict | undefined;
        resolve(c ?? null);
      };
      req.onerror = () => reject(req.error);
    });
    if (!conflict) {
      db.close();
      return false;
    }
    let mergedValue: unknown;
    switch (strategy) {
      case 'local-wins':
        mergedValue = conflict.localValue;
        break;
      case 'server-wins':
        mergedValue = conflict.serverValue;
        break;
      case 'timestamp-newest':
        mergedValue = new Date(conflict.localTimestamp).getTime() >
          new Date(conflict.serverTimestamp).getTime()
          ? conflict.localValue
          : conflict.serverValue;
        break;
      case 'merge':
        if (typeof conflict.localValue === 'string' && typeof conflict.serverValue === 'string') {
          mergedValue = `${conflict.localValue} / ${conflict.serverValue}`;
        } else if (Array.isArray(conflict.localValue) && Array.isArray(conflict.serverValue)) {
          mergedValue = Array.from(new Set([...conflict.localValue, ...conflict.serverValue]));
        } else {
          mergedValue = mergeFieldLevel(
            { v: conflict.localValue },
            { v: conflict.serverValue },
          )['v'];
        }
        break;
      case 'field-level':
      case 'manual':
        mergedValue = conflict.localValue;
        break;
      default:
        mergedValue = conflict.serverValue;
    }
    const updated: MobileConflict = {
      ...conflict,
      resolution: strategy,
      mergedValue,
      resolvedAt: new Date().toISOString(),
      resolvedBy: resolver,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CONFLICT_STORE, 'readwrite');
      tx.objectStore(CONFLICT_STORE).put(updated);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return true;
  }

  async clearSynced(): Promise<number> {
    const db = await openQueueDb();
    const count = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const idx = store.index('status');
      const req = idx.openCursor();
      let removed = 0;
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          if (cursor.value['status'] === 'synced') {
            cursor.delete();
            removed++;
          }
          cursor.continue();
        } else {
          resolve(removed);
        }
      };
      req.onerror = () => reject(req.error);
    });
    db.close();
    return count;
  }

  async retryFailed(): Promise<number> {
    const items = await this.listQueue('failed');
    const db = await openQueueDb();
    let count = 0;
    for (const item of items) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        const req = store.get(item.id);
        req.onsuccess = () => {
          const existing = req.result;
          if (existing) {
            store.put({ ...existing, status: 'pending', attempts: 0 });
            count++;
          }
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    }
    db.close();
    return count;
  }

  getLastBatch(): SyncBatchResult | null {
    return this.lastBatch;
  }

  private emptyBatch(): SyncBatchResult {
    const now = new Date().toISOString();
    return {
      totalItems: 0,
      successCount: 0,
      failureCount: 0,
      conflictCount: 0,
      skippedCount: 0,
      durationMs: 0,
      startedAt: now,
      finishedAt: now,
      items: [],
    };
  }
}

export const offlineSync = new OfflineSyncEngine();
export type { SyncItemResult };
export const OfflineSync = offlineSync;
