import type { VnaHealthStatus } from './types';

let startTime = Date.now();

export async function vnaHealthCheck(): Promise<VnaHealthStatus> {
  const { vnaStore } = await import('./store');
  const health = await vnaStore.healthCheck();
  const { getVnaMetrics } = await import('./metrics');
  const metrics = getVnaMetrics();

  return {
    status: health.ok ? 'healthy' : 'unhealthy',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    studiesCount: health.studyCount,
    seriesCount: 0,
    instancesCount: metrics.instancesStored,
    totalSizeBytes: metrics.storageBytesWritten,
    storageTierDistribution: { hot: 0, cool: 0, cold: 0, glacier: 0 },
    modalitiesCount: {},
    activeAssociations: metrics.activeScpConnections + metrics.activeScuConnections,
    version: 'v3.0.3.30',
  };
}

export async function retryFailedInstances(): Promise<number> {
  return 0;
}
