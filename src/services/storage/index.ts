export type {
  StorageProvider, StorageTier, StorageClass, EncryptionAlgorithm,
  StorageObject, StorageProviderConfig, RetentionPolicy, RetentionRule,
  LifecycleRule, StorageMetrics,
} from './types';

export { s3Adapter } from './s3Adapter';
export type { S3AdapterConfig } from './s3Adapter';
export { azureAdapter } from './azureAdapter';
export type { AzureAdapterConfig } from './azureAdapter';
export { glacierAdapter } from './glacierAdapter';
export type { GlacierAdapterConfig } from './glacierAdapter';
export { getRetentionPolicies, addRetentionPolicy, updateRetentionPolicy, deleteRetentionPolicy, evaluateRetentionRules } from './retention';
export { getLifecycleRules, addLifecycleRule, updateLifecycleRule, deleteLifecycleRule, determineTargetTier } from './lifecycle';
export { encrypt, decrypt, generateKey, generateIv, getAlgorithmConfig } from './encryption';
export { compressData, decompressData, getCompressionRatio } from './compression';
export type { StorageCompression } from './compression';
export { computeContentHash, isDuplicate, registerContent, getExistingKey, getDedupStats } from './dedup';
export { getTierConfig, calculateTierCost, suggestTier } from './tiering';
export type { TierConfig } from './tiering';
export { recordStorageOperation, getStorageMetrics, resetStorageMetrics } from './metrics';
