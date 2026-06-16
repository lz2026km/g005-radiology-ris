import type { CacheEntry, OfflineEntityType } from './types';

const CACHE_DB = 'g005-offline-cache';
const CACHE_STORE = 'cache';
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_SIZE = 50 * 1024 * 1024;

function openDb(): Promise<IDBRequest<IDBDatabase>> {
  const req = indexedDB.open(CACHE_DB, 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains(CACHE_STORE)) {
      db.createObjectStore(CACHE_STORE, { keyPath: 'id' });
    }
  };
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req);
    req.onerror = () => reject(req.error);
  });
}

export const offlineCache = {
  async set<T>(entityType: OfflineEntityType, id: string, data: T, ttlMs: number = DEFAULT_TTL_MS): Promise<CacheEntry<T>> {
    const entry: CacheEntry<T> = {
      id: `${entityType}:${id}`,
      entityType,
      data,
      version: Date.now(),
      lastSyncedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      sizeBytes: new Blob([JSON.stringify(data)]).size,
    };
    const db = await openDb();
    const tx = db.result.transaction(CACHE_STORE, 'readwrite');
    tx.objectStore(CACHE_STORE).put(entry);
    return entry;
  },

  async get<T>(entityType: OfflineEntityType, id: string): Promise<T | null> {
    const db = await openDb();
    const tx = db.result.transaction(CACHE_STORE, 'readonly');
    const store = tx.objectStore(CACHE_STORE);
    return new Promise((resolve, reject) => {
      const req = store.get(`${entityType}:${id}`);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry<T> | undefined;
        if (!entry) return resolve(null);
        if (Date.now() > new Date(entry.expiresAt).getTime()) {
          this.remove(entityType, id);
          return resolve(null);
        }
        resolve(entry.data);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async remove(entityType: OfflineEntityType, id: string): Promise<void> {
    const db = await openDb();
    const tx = db.result.transaction(CACHE_STORE, 'readwrite');
    tx.objectStore(CACHE_STORE).delete(`${entityType}:${id}`);
  },

  async clear(): Promise<void> {
    const db = await openDb();
    const tx = db.result.transaction(CACHE_STORE, 'readwrite');
    tx.objectStore(CACHE_STORE).clear();
  },

  async evictExpired(): Promise<number> {
    const db = await openDb();
    const tx = db.result.transaction(CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CACHE_STORE);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        let count = 0;
        const entries = req.result as CacheEntry[];
        for (const entry of entries) {
          if (Date.now() > new Date(entry.expiresAt).getTime()) {
            store.delete(entry.id);
            count++;
          }
        }
        resolve(count);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async getSize(): Promise<number> {
    const db = await openDb();
    const tx = db.result.transaction(CACHE_STORE, 'readonly');
    const store = tx.objectStore(CACHE_STORE);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const entries = req.result as CacheEntry[];
        resolve(entries.reduce((sum, e) => sum + (e.sizeBytes || 0), 0));
      };
      req.onerror = () => reject(req.error);
    });
  },
};
