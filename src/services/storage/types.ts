export type StorageProvider = 's3' | 'azure' | 'glacier' | 'local';
export type StorageTier = 'hot' | 'cool' | 'cold' | 'glacier';
export type StorageClass = 'STANDARD' | 'INFREQUENT_ACCESS' | 'ARCHIVE' | 'DEEP_ARCHIVE';
export type EncryptionAlgorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'SM4';

export interface StorageObject {
  key: string;
  bucket: string;
  provider: StorageProvider;
  tier: StorageTier;
  sizeBytes: number;
  hash: string;
  encryptionAlgorithm?: EncryptionAlgorithm;
  compressed: boolean;
  compressionType?: string;
  contentType: string;
  metadata: Record<string, string>;
  createdAt: string;
  lastAccessedAt: string;
  retentionExpiry?: string;
  region?: string;
  versionId?: string;
}

export interface StorageProviderConfig {
  provider: StorageProvider;
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  defaultStorageClass: StorageClass;
  multipartThreshold: number;
  maxRetries: number;
  timeoutMs: number;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  description?: string;
  rules: RetentionRule[];
  priority: number;
  enabled: boolean;
}

export interface RetentionRule {
  field: 'modality' | 'studyDate' | 'patientAge' | 'studyDescription' | 'institution';
  operator: 'olderThan' | 'equals' | 'contains';
  value: string | number;
  action: 'archive' | 'delete' | 'notify';
  actionAfterDays: number;
}

export interface LifecycleRule {
  id: string;
  name: string;
  enabled: boolean;
  transitions: Array<{
    fromTier: StorageTier;
    toTier: StorageTier;
    afterDays: number;
  }>;
  filter?: {
    modality?: string[];
    prefix?: string;
    tag?: string;
  };
}

export interface StorageMetrics {
  totalObjects: number;
  totalSizeBytes: number;
  byProvider: Record<StorageProvider, { objects: number; sizeBytes: number }>;
  byTier: Record<StorageTier, { objects: number; sizeBytes: number }>;
  objectsAdded24h: number;
  objectsDeleted24h: number;
  bytesRead24h: number;
  bytesWritten24h: number;
  averageReadLatencyMs: number;
  averageWriteLatencyMs: number;
  errorRate: number;
  timestamp: string;
}
