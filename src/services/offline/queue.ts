import type { OfflineQueueItem, OfflineOperation, OfflineEntityType, SyncPriority, SyncStatus } from './types';

const DB_NAME = 'g005-offline-queue';
const STORE_NAME = 'queue';

function openDb(): Promise<IDBRequest<IDBDatabase>> {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req);
    req.onerror = () => reject(req.error);
  });
}

export const offlineQueue = {
  async enqueue(operation: Omit<OfflineQueueItem, 'id' | 'status' | 'retryCount' | 'maxRetries' | 'createdAt'>): Promise<OfflineQueueItem> {
    const item: OfflineQueueItem = {
      ...operation,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending',
      retryCount: 0,
      maxRetries: 5,
      createdAt: new Date().toISOString(),
    };
    const db = await openDb();
    const tx = db.result.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(item);
    return item;
  },

  async list(status?: SyncStatus): Promise<OfflineQueueItem[]> {
    const db = await openDb();
    const tx = db.result.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        let items = req.result || [];
        if (status) items = items.filter(i => i.status === status);
        resolve(items.sort((a, b) => {
          const priorityOrder: Record<SyncPriority, number> = { critical: 0, high: 1, normal: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }));
      };
      req.onerror = () => reject(req.error);
    });
  },

  async update(id: string, updates: Partial<OfflineQueueItem>): Promise<void> {
    const db = await openDb();
    const tx = db.result.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing = await new Promise<OfflineQueueItem | undefined>((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (existing) {
      store.put({ ...existing, ...updates, lastAttemptAt: new Date().toISOString() });
    }
  },

  async remove(id: string): Promise<void> {
    const db = await openDb();
    const tx = db.result.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  },

  async clear(): Promise<void> {
    const db = await openDb();
    const tx = db.result.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  },

  async count(status?: SyncStatus): Promise<number> {
    const items = await this.list(status);
    return items.length;
  },
};
