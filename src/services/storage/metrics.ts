import type { StorageMetrics, StorageProvider, StorageTier } from './types';

const metricsState: StorageMetrics = {
  totalObjects: 0, totalSizeBytes: 0,
  byProvider: { s3: { objects: 0, sizeBytes: 0 }, azure: { objects: 0, sizeBytes: 0 }, glacier: { objects: 0, sizeBytes: 0 }, local: { objects: 0, sizeBytes: 0 } },
  byTier: { hot: { objects: 0, sizeBytes: 0 }, cool: { objects: 0, sizeBytes: 0 }, cold: { objects: 0, sizeBytes: 0 }, glacier: { objects: 0, sizeBytes: 0 } },
  objectsAdded24h: 0, objectsDeleted24h: 0,
  bytesRead24h: 0, bytesWritten24h: 0,
  averageReadLatencyMs: 0, averageWriteLatencyMs: 0,
  errorRate: 0, timestamp: new Date().toISOString(),
};

export function recordStorageOperation(type: 'read' | 'write' | 'delete', provider: StorageProvider, tier: StorageTier, sizeBytes: number, latencyMs: number): void {
  if (type === 'write') {
    metricsState.totalObjects++;
    metricsState.totalSizeBytes += sizeBytes;
    metricsState.objectsAdded24h++;
    metricsState.bytesWritten24h += sizeBytes;
    metricsState.byProvider[provider].objects++;
    metricsState.byProvider[provider].sizeBytes += sizeBytes;
    metricsState.byTier[tier].objects++;
    metricsState.byTier[tier].sizeBytes += sizeBytes;
  } else if (type === 'read') {
    metricsState.bytesRead24h += sizeBytes;
  } else if (type === 'delete') {
    metricsState.totalObjects = Math.max(0, metricsState.totalObjects - 1);
    metricsState.objectsDeleted24h++;
    metricsState.byProvider[provider].objects = Math.max(0, metricsState.byProvider[provider].objects - 1);
    metricsState.byTier[tier].objects = Math.max(0, metricsState.byTier[tier].objects - 1);
  }
  metricsState.averageReadLatencyMs = metricsState.averageReadLatencyMs * 0.95 + latencyMs * 0.05;
  metricsState.averageWriteLatencyMs = metricsState.averageWriteLatencyMs * 0.95 + latencyMs * 0.05;
  metricsState.timestamp = new Date().toISOString();
}

export function getStorageMetrics(): StorageMetrics {
  return { ...metricsState };
}

export function resetStorageMetrics(): void {
  metricsState.totalObjects = 0; metricsState.totalSizeBytes = 0;
  metricsState.objectsAdded24h = 0; metricsState.objectsDeleted24h = 0;
  metricsState.bytesRead24h = 0; metricsState.bytesWritten24h = 0;
  metricsState.averageReadLatencyMs = 0; metricsState.averageWriteLatencyMs = 0;
  metricsState.errorRate = 0;
  for (const p of ['s3', 'azure', 'glacier', 'local'] as StorageProvider[]) {
    metricsState.byProvider[p] = { objects: 0, sizeBytes: 0 };
  }
  for (const t of ['hot', 'cool', 'cold', 'glacier'] as StorageTier[]) {
    metricsState.byTier[t] = { objects: 0, sizeBytes: 0 };
  }
  metricsState.timestamp = new Date().toISOString();
}
