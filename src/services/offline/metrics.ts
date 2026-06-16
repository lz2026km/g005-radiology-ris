import type { OfflineMetrics } from './types';

const metricsState: OfflineMetrics = {
  queueSize: 0, cacheSize: 0, cacheCount: 0,
  totalSyncs: 0, successfulSyncs: 0, failedSyncs: 0,
  conflictsCount: 0, pendingConflicts: 0,
  isOnline: navigator.onLine,
  storageUsedBytes: 0, storageQuotaBytes: 100 * 1024 * 1024,
};

export function recordSyncResult(success: boolean): void {
  metricsState.totalSyncs++;
  if (success) metricsState.successfulSyncs++;
  else metricsState.failedSyncs++;
  metricsState.isOnline = navigator.onLine;
}

export function updateOfflineMetrics(partial: Partial<OfflineMetrics>): void {
  Object.assign(metricsState, partial);
  metricsState.isOnline = navigator.onLine;
}

export function getOfflineMetrics(): OfflineMetrics {
  return { ...metricsState };
}

export function resetOfflineMetrics(): void {
  metricsState.totalSyncs = 0;
  metricsState.successfulSyncs = 0;
  metricsState.failedSyncs = 0;
  metricsState.conflictsCount = 0;
  metricsState.pendingConflicts = 0;
}
