import type { StorageTier } from './types';

export interface TierConfig {
  tier: StorageTier;
  label: string;
  storageClass: string;
  costPerGbMo: number;
  retrievalTime: string;
  minRetentionDays: number;
  maxTransferSizeBytes: number;
}

export const TIER_CONFIGS: Record<StorageTier, TierConfig> = {
  hot: { tier: 'hot', label: 'Hot (SSD)', storageClass: 'STANDARD', costPerGbMo: 0.023, retrievalTime: 'instant', minRetentionDays: 0, maxTransferSizeBytes: 5 * 1024 ** 4 },
  cool: { tier: 'cool', label: 'Cool (HDD)', storageClass: 'INFREQUENT_ACCESS', costPerGbMo: 0.01, retrievalTime: 'instant', minRetentionDays: 30, maxTransferSizeBytes: 5 * 1024 ** 4 },
  cold: { tier: 'cold', label: 'Cold (Archive)', storageClass: 'ARCHIVE', costPerGbMo: 0.004, retrievalTime: '1-5 min', minRetentionDays: 90, maxTransferSizeBytes: 5 * 1024 ** 4 },
  glacier: { tier: 'glacier', label: 'Glacier (Deep Archive)', storageClass: 'DEEP_ARCHIVE', costPerGbMo: 0.00099, retrievalTime: '12-48 hours', minRetentionDays: 180, maxTransferSizeBytes: 5 * 1024 ** 4 },
};

export function getTierConfig(tier: StorageTier): TierConfig {
  return TIER_CONFIGS[tier];
}

export function calculateTierCost(sizeBytes: number, tier: StorageTier, months: number): number {
  const config = TIER_CONFIGS[tier];
  const gb = sizeBytes / (1024 ** 3);
  return gb * config.costPerGbMo * months;
}

export function suggestTier(totalSizeBytes: number, lastAccessDays: number, modality?: string): StorageTier {
  if (lastAccessDays <= 30) return 'hot';
  if (lastAccessDays <= 90) return 'cool';
  if (lastAccessDays <= 365) return 'cold';
  return 'glacier';
}
