import type { OfflineMetrics } from './types';

const STORAGE_QUOTA_BYTES = 100 * 1024 * 1024;
const WARNING_THRESHOLD = 0.8;

export const offlineQuota = {
  async getUsage(): Promise<{ usedBytes: number; quotaBytes: number; percentUsed: number }> {
    const { offlineCache } = await import('./cache');
    const { offlineQueue } = await import('./queue');
    const cacheSize = await offlineCache.getSize();
    const queueSize = (await offlineQueue.list()).reduce((s, i) => s + new Blob([JSON.stringify(i)]).size, 0);
    const usedBytes = cacheSize + queueSize;
    return { usedBytes, quotaBytes: STORAGE_QUOTA_BYTES, percentUsed: usedBytes / STORAGE_QUOTA_BYTES };
  },

  async isOverQuota(): Promise<boolean> {
    const { percentUsed } = await this.getUsage();
    return percentUsed >= 1;
  },

  async isNearQuota(): Promise<boolean> {
    const { percentUsed } = await this.getUsage();
    return percentUsed >= WARNING_THRESHOLD;
  },

  async evictToFit(bytesNeeded: number): Promise<boolean> {
    const { usedBytes } = await this.getUsage();
    if (usedBytes + bytesNeeded <= STORAGE_QUOTA_BYTES) return true;
    const { offlineCache } = await import('./cache');
    await offlineCache.evictExpired();
    const { usedBytes: afterEvict } = await this.getUsage();
    return afterEvict + bytesNeeded <= STORAGE_QUOTA_BYTES;
  },

  getQuotaBytes(): number {
    return STORAGE_QUOTA_BYTES;
  },
};
