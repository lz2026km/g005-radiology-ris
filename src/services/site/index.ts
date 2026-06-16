export type {
  SiteInfo, SiteCapability, SiteConfig, SiteHealth,
  SiteSyncJob, SiteExamRoute,
} from './types';

export { registerSite, unregisterSite, getSite, getSiteByCode, getAllSites, updateSiteHeartbeat, hasCapability, findSitesByCapability, getSiteCount } from './registry';
export { createExamRoute, updateExamRoute, deleteExamRoute, getExamRoutes, findMatchingRoute, routeExamToSite } from './routing';
export { createSyncJob, executeSyncJob, getSyncJobs, cancelSyncJob, crossSiteShareReport, crossSiteAccessImage } from './sync';
export { setSiteConfig, getSiteConfig, getAllSiteConfigs, deleteSiteConfig, getSiteStorageQuota } from './config';
export { getSiteDashboardData, getSiteHealth } from './dashboard';
export type { SiteDashboardData } from './dashboard';
