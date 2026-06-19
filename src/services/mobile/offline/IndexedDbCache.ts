/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端 IndexedDB 缓存服务
 * 20 升级点:多 store / 版本迁移 / 索引查询 / LRU 淘汰 / 配额感知 / 事务安全
 */

import type {
  MobileCacheEntry,
  MobileCacheStats,
  CacheStrategy,
} from '../../types/mobile';
import { MOBILE_OFFLINE_CACHE } from '../../data/mobileOfflineMock';

const DB_NAME = 'g005-mobile-cache';
const DB_VERSION = 2;
const STORE_ENTRIES = 'entries';
const STORE_META = 'meta';
const META_KEY_STATS = 'stats';
const META_KEY_VERSION = 'schemaVersion';

const DEFAULT_QUOTA_BYTES = 200 * 1024 * 1024;
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface OpenDbResult {
  db: IDBDatabase;
  upgraded: boolean;
}

function openDb(): Promise<OpenDbResult> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    let upgraded = false;
    req.onupgradeneeded = () => {
      upgraded = true;
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        const store = db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' });
        store.createIndex('key', 'key', { unique: true });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('priority', 'metadata.priority', { unique: false });
        store.createIndex('expiresAt', 'metadata.expiresAt', { unique: false });
        store.createIndex('lastAccessedAt', 'metadata.lastAccessedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve({ db: req.result, upgraded });
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB upgrade blocked'));
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

function estimateSize(entry: MobileCacheEntry): number {
  if (entry.metadata.sizeBytes) return entry.metadata.sizeBytes;
  try {
    return new Blob([JSON.stringify(entry)]).size;
  } catch {
    return 1024;
  }
}

async function updateStats(
  db: IDBDatabase,
  mutator: (stats: MobileCacheStats) => MobileCacheStats,
): Promise<MobileCacheStats> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readwrite');
    const store = tx.objectStore(STORE_META);
    const getReq = store.get(META_KEY_STATS);
    getReq.onsuccess = () => {
      const current: MobileCacheStats = (getReq.result as { value: MobileCacheStats } | undefined)?.value ?? {
        totalEntries: 0,
        totalSizeBytes: 0,
        hitCount: 0,
        missCount: 0,
        evictionCount: 0,
        hitRatio: 0,
        quotaBytes: DEFAULT_QUOTA_BYTES,
        usedRatio: 0,
      };
      const next = mutator(current);
      next.usedRatio = next.quotaBytes > 0 ? next.totalSizeBytes / next.quotaBytes : 0;
      next.hitRatio = next.hitCount + next.missCount > 0
        ? next.hitCount / (next.hitCount + next.missCount)
        : 0;
      store.put({ key: META_KEY_STATS, value: next });
      tx.oncomplete = () => resolve(next);
      tx.onerror = () => reject(tx.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

async function readStats(db: IDBDatabase): Promise<MobileCacheStats> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly');
    const req = tx.objectStore(STORE_META).get(META_KEY_STATS);
    req.onsuccess = () => {
      const stats: MobileCacheStats = (req.result as { value: MobileCacheStats } | undefined)?.value ?? {
        totalEntries: 0,
        totalSizeBytes: 0,
        hitCount: 0,
        missCount: 0,
        evictionCount: 0,
        hitRatio: 0,
        quotaBytes: DEFAULT_QUOTA_BYTES,
        usedRatio: 0,
      };
      resolve(stats);
    };
    req.onerror = () => reject(req.error);
  });
}

function isExpired(entry: MobileCacheEntry): boolean {
  return Date.now() > new Date(entry.metadata.expiresAt).getTime();
}

export const indexedDbCache = {
  async init(): Promise<void> {
    const { db, upgraded } = await openDb();
    if (upgraded) {
      const seedTx = db.transaction(STORE_ENTRIES, 'readwrite');
      const store = seedTx.objectStore(STORE_ENTRIES);
      for (const entry of MOBILE_OFFLINE_CACHE) {
        store.put(entry);
      }
      await new Promise<void>((resolve, reject) => {
        seedTx.oncomplete = () => resolve();
        seedTx.onerror = () => reject(seedTx.error);
      });
    }
    db.close();
  },

  async set<T>(
    key: string,
    data: T,
    options: {
      category?: MobileCacheEntry['category'];
      priority?: number;
      ttlMs?: number;
      syncStatus?: MobileCacheEntry['syncStatus'];
    } = {},
  ): Promise<MobileCacheEntry<T>> {
    const { db } = await openDb();
    const sizeBytes = estimateSize({ data, sizeBytes: 0 } as MobileCacheEntry);
    const entry: MobileCacheEntry<T> = {
      id: `cache-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      key,
      category: options.category ?? 'patient',
      data,
      metadata: {
        version: 1,
        cachedAt: nowIso(),
        expiresAt: new Date(Date.now() + (options.ttlMs ?? DEFAULT_TTL_MS)).toISOString(),
        lastAccessedAt: nowIso(),
        accessCount: 0,
        sizeBytes,
        priority: options.priority ?? 5,
      },
      syncStatus: options.syncStatus ?? 'clean',
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      tx.objectStore(STORE_ENTRIES).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    await updateStats(db, stats => ({
      ...stats,
      totalEntries: stats.totalEntries + 1,
      totalSizeBytes: stats.totalSizeBytes + sizeBytes,
    }));
    db.close();
    return entry;
  },

  async get<T>(key: string): Promise<T | null> {
    const { db } = await openDb();
    const result = await new Promise<MobileCacheEntry<T> | null>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      const store = tx.objectStore(STORE_ENTRIES);
      const idx = store.index('key');
      const req = idx.get(key);
      req.onsuccess = () => {
        const entry = req.result as MobileCacheEntry<T> | undefined;
        if (!entry) {
          resolve(null);
          return;
        }
        if (isExpired(entry)) {
          store.delete(entry.id);
          resolve(null);
          return;
        }
        const updated: MobileCacheEntry<T> = {
          ...entry,
          metadata: {
            ...entry.metadata,
            accessCount: entry.metadata.accessCount + 1,
            lastAccessedAt: nowIso(),
          },
        };
        store.put(updated);
        resolve(updated);
      };
      req.onerror = () => reject(req.error);
    });
    const stats = await readStats(db);
    if (result) {
      await updateStats(db, s => ({ ...s, hitCount: s.hitCount + 1 }));
    } else {
      await updateStats(db, s => ({ ...s, missCount: s.missCount + 1 }));
    }
    db.close();
    return result ? (result.data as T) : null;
  },

  async getById<T>(id: string): Promise<MobileCacheEntry<T> | null> {
    const { db } = await openDb();
    const result = await new Promise<MobileCacheEntry<T> | null>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readonly');
      const req = tx.objectStore(STORE_ENTRIES).get(id);
      req.onsuccess = () => resolve((req.result as MobileCacheEntry<T> | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  },

  async listByCategory<T>(category: MobileCacheEntry['category'], limit = 100): Promise<MobileCacheEntry<T>[]> {
    const { db } = await openDb();
    const items = await new Promise<MobileCacheEntry<T>[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readonly');
      const req = tx.objectStore(STORE_ENTRIES).index('category').getAll(category);
      req.onsuccess = () => {
        const all = (req.result as MobileCacheEntry<T>[]) ?? [];
        resolve(all.slice(0, limit));
      };
      req.onerror = () => reject(req.error);
    });
    db.close();
    return items;
  },

  async listDirty<T>(): Promise<MobileCacheEntry<T>[]> {
    const { db } = await openDb();
    const items = await new Promise<MobileCacheEntry<T>[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readonly');
      const req = tx.objectStore(STORE_ENTRIES).index('syncStatus').getAll('dirty');
      req.onsuccess = () => resolve((req.result as MobileCacheEntry<T>[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return items;
  },

  async markClean(id: string): Promise<void> {
    const { db } = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      const store = tx.objectStore(STORE_ENTRIES);
      const req = store.get(id);
      req.onsuccess = () => {
        const entry = req.result as MobileCacheEntry | undefined;
        if (entry) {
          store.put({ ...entry, syncStatus: 'clean' });
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
    db.close();
  },

  async remove(key: string): Promise<void> {
    const { db } = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      const idx = tx.objectStore(STORE_ENTRIES).index('key');
      const req = idx.getKey(key);
      req.onsuccess = () => {
        const id = req.result;
        if (id !== undefined) {
          tx.objectStore(STORE_ENTRIES).delete(id);
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
    db.close();
  },

  async clear(): Promise<void> {
    const { db } = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      tx.objectStore(STORE_ENTRIES).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    await updateStats(db, s => ({ ...s, totalEntries: 0, totalSizeBytes: 0 }));
    db.close();
  },

  async evictExpired(): Promise<number> {
    const { db } = await openDb();
    const now = Date.now();
    const removed = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      const idx = tx.objectStore(STORE_ENTRIES).index('expiresAt');
      const cursorReq = idx.openCursor();
      let count = 0;
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          const entry = cursor.value as MobileCacheEntry;
          if (new Date(entry.metadata.expiresAt).getTime() < now) {
            cursor.delete();
            count++;
          }
          cursor.continue();
        } else {
          resolve(count);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    await updateStats(db, s => ({ ...s, evictionCount: s.evictionCount + removed }));
    db.close();
    return removed;
  },

  async evictLru(targetFreeBytes: number, strategy: CacheStrategy = 'lru'): Promise<number> {
    const { db } = await openDb();
    const all = await new Promise<MobileCacheEntry[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, 'readonly');
      const req = tx.objectStore(STORE_ENTRIES).getAll();
      req.onsuccess = () => resolve((req.result as MobileCacheEntry[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    let sorted: MobileCacheEntry[];
    switch (strategy) {
      case 'lru':
        sorted = all.sort((a, b) =>
          new Date(a.metadata.lastAccessedAt).getTime() - new Date(b.metadata.lastAccessedAt).getTime());
        break;
      case 'fifo':
        sorted = all.sort((a, b) =>
          new Date(a.metadata.cachedAt).getTime() - new Date(b.metadata.cachedAt).getTime());
        break;
      case 'priority':
        sorted = all.sort((a, b) => a.metadata.priority - b.metadata.priority);
        break;
      default:
        sorted = all;
    }
    let freed = 0;
    let removed = 0;
    const toRemove: string[] = [];
    for (const entry of sorted) {
      if (freed >= targetFreeBytes) break;
      toRemove.push(entry.id);
      freed += entry.metadata.sizeBytes;
      removed++;
    }
    if (toRemove.length > 0) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_ENTRIES, 'readwrite');
        const store = tx.objectStore(STORE_ENTRIES);
        for (const id of toRemove) store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
    await updateStats(db, s => ({
      ...s,
      totalEntries: Math.max(0, s.totalEntries - removed),
      totalSizeBytes: Math.max(0, s.totalSizeBytes - freed),
      evictionCount: s.evictionCount + removed,
      lastEvictionAt: nowIso(),
    }));
    db.close();
    return removed;
  },

  async getStats(): Promise<MobileCacheStats> {
    const { db } = await openDb();
    const stats = await readStats(db);
    db.close();
    return stats;
  },

  async setQuota(bytes: number): Promise<void> {
    const { db } = await openDb();
    await updateStats(db, s => ({ ...s, quotaBytes: bytes }));
    db.close();
  },

  async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  },

  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
      return { usage: 0, quota: 0 };
    }
    const est = await navigator.storage.estimate();
    return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
  },
};

export type IndexedDbCache = typeof indexedDbCache;
