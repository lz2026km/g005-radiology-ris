import type { SiteConfig } from './types';

const siteConfigs: Map<string, SiteConfig> = new Map();

export function setSiteConfig(siteId: string, key: string, value: string, category: SiteConfig['category'] = 'general', isEncrypted: boolean = false): SiteConfig {
  const existingKey = `${siteId}:${key}`;
  const config: SiteConfig = {
    id: existingKey,
    siteId,
    key,
    value: isEncrypted ? btoa(value) : value,
    category,
    isEncrypted,
    updatedAt: new Date().toISOString(),
  };
  siteConfigs.set(existingKey, config);
  return config;
}

export function getSiteConfig(siteId: string, key: string): string | undefined {
  const config = siteConfigs.get(`${siteId}:${key}`);
  if (!config) return undefined;
  return config.isEncrypted ? atob(config.value) : config.value;
}

export function getAllSiteConfigs(siteId: string, category?: SiteConfig['category']): SiteConfig[] {
  const configs = Array.from(siteConfigs.values()).filter(c => c.siteId === siteId);
  return category ? configs.filter(c => c.category === category) : configs;
}

export function deleteSiteConfig(siteId: string, key: string): boolean {
  return siteConfigs.delete(`${siteId}:${key}`);
}

export function getSiteStorageQuota(siteId: string): { quotaBytes: number; usedBytes: number } {
  return { quotaBytes: 107374182400, usedBytes: 53687091200 };
}
