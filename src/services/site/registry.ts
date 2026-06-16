import type { SiteInfo, SiteCapability } from './types';

const sites: Map<string, SiteInfo> = new Map();

export function registerSite(info: Omit<SiteInfo, 'id' | 'createdAt' | 'updatedAt' | 'lastHeartbeat'>): SiteInfo {
  const site: SiteInfo = {
    ...info,
    id: `site-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sites.set(site.id, site);
  return site;
}

export function unregisterSite(siteId: string): boolean {
  const site = sites.get(siteId);
  if (!site) return false;
  site.status = 'inactive';
  site.updatedAt = new Date().toISOString();
  return true;
}

export function getSite(siteId: string): SiteInfo | undefined {
  return sites.get(siteId);
}

export function getSiteByCode(code: string): SiteInfo | undefined {
  return Array.from(sites.values()).find(s => s.code === code);
}

export function getAllSites(status?: SiteInfo['status']): SiteInfo[] {
  const all = Array.from(sites.values());
  return status ? all.filter(s => s.status === status) : all;
}

export function updateSiteHeartbeat(siteId: string): boolean {
  const site = sites.get(siteId);
  if (!site) return false;
  site.lastHeartbeat = new Date().toISOString();
  site.updatedAt = new Date().toISOString();
  return true;
}

export function hasCapability(siteId: string, capability: SiteCapability): boolean {
  const site = sites.get(siteId);
  return site?.capabilities.includes(capability) ?? false;
}

export function findSitesByCapability(capability: SiteCapability): SiteInfo[] {
  return Array.from(sites.values()).filter(s => s.capabilities.includes(capability) && s.status === 'active');
}

export function getSiteCount(): number {
  return sites.size;
}
