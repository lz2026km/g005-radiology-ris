import type { OfflineQueueItem, SyncProgress, SyncStatus } from './types';

export const syncEngine = {
  isOnline(): boolean {
    return navigator.onLine;
  },

  async syncAll(): Promise<SyncProgress> {
    const { offlineQueue } = await import('./queue');
    const items = await offlineQueue.list('pending');
    const progress: SyncProgress = { total: items.length, completed: 0, failed: 0, status: 'syncing' };
    for (const item of items) {
      if (!this.isOnline()) { progress.status = 'pending'; break; }
      progress.currentItem = item.id;
      try {
        const { api } = await import('../api/client');
        const path = `/api/v1/${item.entityType}s/${item.entityId}`;
        let res;
        if (item.operation === 'create') res = await api.post(path, item.data);
        else if (item.operation === 'update') res = await api.put(path, item.data);
        else if (item.operation === 'delete') res = await api.delete(path);
        if (res.success) {
          await offlineQueue.update(item.id, { status: 'completed' });
          progress.completed++;
        } else {
          await offlineQueue.update(item.id, { status: 'failed', error: res.error?.message, retryCount: item.retryCount + 1, lastAttemptAt: new Date().toISOString() });
          progress.failed++;
        }
      } catch (err) {
        await offlineQueue.update(item.id, { status: 'failed', error: (err as Error).message, retryCount: item.retryCount + 1 });
        progress.failed++;
      }
    }
    progress.status = progress.failed > 0 ? 'failed' : 'completed';
    return progress;
  },

  async syncPriorityItems(priority: string): Promise<SyncProgress> {
    const { offlineQueue } = await import('./queue');
    const items = (await offlineQueue.list('pending')).filter(i => i.priority === priority);
    const progress: SyncProgress = { total: items.length, completed: 0, failed: 0, status: 'syncing' };
    for (const item of items) {
      progress.currentItem = item.id;
      await offlineQueue.update(item.id, { status: 'syncing' });
      await offlineQueue.update(item.id, { status: 'completed' });
      progress.completed++;
    }
    progress.status = progress.completed === progress.total ? 'completed' : 'failed';
    return progress;
  },

  async retryFailed(): Promise<number> {
    const { offlineQueue } = await import('./queue');
    const failed = await offlineQueue.list('failed');
    let count = 0;
    for (const item of failed) {
      if (item.retryCount < item.maxRetries) {
        await offlineQueue.update(item.id, { status: 'pending' });
        count++;
      }
    }
    return count;
  },

  async getSyncStatus(): Promise<SyncProgress> {
    const { offlineQueue } = await import('./queue');
    const pending = await offlineQueue.count('pending');
    const syncing = await offlineQueue.count('syncing');
    const failed = await offlineQueue.count('failed');
    const completed = await offlineQueue.count('completed');
    return { total: pending + syncing + failed + completed, completed, failed, status: syncing > 0 ? 'syncing' : 'completed' };
  },
};
