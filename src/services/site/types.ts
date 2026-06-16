export interface SiteInfo {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  locale: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  siteType: 'main' | 'branch' | 'clinic' | 'mobile' | 'partner';
  parentSiteId?: string;
  capabilities: SiteCapability[];
  storageQuotaBytes: number;
  storageUsedBytes: number;
  maxConcurrentExams: number;
  supportedModalities: string[];
  aeTitles: string[];
  apiEndpoint?: string;
  dicomEndpoint?: string;
  publicKey?: string;
  configVersion: string;
  lastHeartbeat?: string;
  createdAt: string;
  updatedAt: string;
}

export type SiteCapability =
  | 'dicom_store' | 'dicom_query' | 'dicom_retrieve'
  | 'wado_rs' | 'wado_uri' | 'stow_rs'
  | 'mwl_scp' | 'mpps_scu'
  | 'report_share' | 'image_access'
  | 'patient_search' | 'exam_routing'
  | 'sync_push' | 'sync_pull'
  | 'audit_log' | 'backup';

export interface SiteConfig {
  id: string;
  siteId: string;
  key: string;
  value: string;
  description?: string;
  category: 'general' | 'storage' | 'network' | 'security' | 'sync' | 'routing' | 'display';
  isEncrypted: boolean;
  updatedAt: string;
}

export interface SiteHealth {
  siteId: string;
  siteName: string;
  status: SiteInfo['status'];
  uptime: number;
  lastHeartbeat: string;
  storageUsagePercent: number;
  activeExams: number;
  activeConnections: number;
  errorRate: number;
  avgResponseTimeMs: number;
  modalityStatus: Record<string, 'online' | 'offline' | 'degraded'>;
  servicesHealth: Record<string, boolean>;
  lastError?: string;
}

export interface SiteSyncJob {
  id: string;
  sourceSiteId: string;
  targetSiteId: string;
  syncType: 'full' | 'incremental' | 'delta';
  entityType: 'patient' | 'exam' | 'report' | 'study' | 'config' | 'all';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  itemsTotal: number;
  itemsSynced: number;
  bytesTransferred: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
}

export interface SiteExamRoute {
  id: string;
  name: string;
  enabled: boolean;
  sourceSiteId: string;
  targetSiteId: string;
  modalityFilter?: string[];
  bodyPartFilter?: string[];
  priority: number;
  autoRoute: boolean;
  notificationEmails?: string[];
}
