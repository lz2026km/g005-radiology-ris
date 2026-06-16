import type { SiteHealth, SiteInfo } from './types';

export interface SiteDashboardData {
  totalSites: number;
  activeSites: number;
  offlineSites: number;
  totalStorageQuota: number;
  totalStorageUsed: number;
  siteHealthList: SiteHealth[];
  modalityDistribution: Record<string, number>;
  recentSyncJobs: number;
  pendingRoutes: number;
}

export function getSiteDashboardData(): SiteDashboardData {
  return {
    totalSites: 0,
    activeSites: 0,
    offlineSites: 0,
    totalStorageQuota: 0,
    totalStorageUsed: 0,
    siteHealthList: [],
    modalityDistribution: {},
    recentSyncJobs: 0,
    pendingRoutes: 0,
  };
}

export function getSiteHealth(site: SiteInfo): SiteHealth {
  return {
    siteId: site.id,
    siteName: site.name,
    status: site.status,
    uptime: 86400,
    lastHeartbeat: site.lastHeartbeat || new Date().toISOString(),
    storageUsagePercent: site.storageQuotaBytes > 0 ? (site.storageUsedBytes / site.storageQuotaBytes) * 100 : 0,
    activeExams: 0,
    activeConnections: 0,
    errorRate: 0,
    avgResponseTimeMs: 0,
    modalityStatus: {},
    servicesHealth: {},
  };
}
