export type OfflineOperation = 'create' | 'update' | 'delete';
export type OfflineEntityType = 'patient' | 'exam' | 'report' | 'study' | 'template';
export type SyncPriority = 'critical' | 'high' | 'normal' | 'low';
export type SyncStatus = 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';

export interface OfflineQueueItem {
  id: string;
  operation: OfflineOperation;
  entityType: OfflineEntityType;
  entityId: string;
  data: Record<string, unknown>;
  priority: SyncPriority;
  status: SyncStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptAt?: string;
  error?: string;
}

export interface CacheEntry<T = unknown> {
  id: string;
  entityType: OfflineEntityType;
  data: T;
  version: number;
  lastSyncedAt: string;
  expiresAt: string;
  sizeBytes: number;
}

export interface ConflictRecord {
  id: string;
  localItem: OfflineQueueItem;
  serverItem: Record<string, unknown>;
  field: string;
  localValue: unknown;
  serverValue: unknown;
  resolution?: 'keep_local' | 'keep_server' | 'merge';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface OfflineMetrics {
  queueSize: number;
  cacheSize: number;
  cacheCount: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsCount: number;
  pendingConflicts: number;
  lastSyncAt?: string;
  isOnline: boolean;
  storageUsedBytes: number;
  storageQuotaBytes: number;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentItem?: string;
  status: SyncStatus;
}
