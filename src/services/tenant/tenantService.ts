export interface Tenant {
  id: string;
  name: string;
  domain: string;
  theme: 'light' | 'dark';
  locale: string;
  features: string[];
  maxUsers: number;
  storageLimit: number;
  active: boolean;
}

const TENANTS: Tenant[] = [
  { id: 'default', name: '汉东省人民医院', domain: 'hospital-a', theme: 'light', locale: 'zh-CN', features: ['*'], maxUsers: 500, storageLimit: 10240, active: true },
  { id: 'tenant-b', name: '江南省中医院', domain: 'hospital-b', theme: 'light', locale: 'zh-CN', features: ['reports', 'worklist', 'patients'], maxUsers: 200, storageLimit: 5120, active: true },
  { id: 'tenant-c', name: '北方医学中心', domain: 'hospital-c', theme: 'dark', locale: 'en-US', features: ['reports', 'worklist'], maxUsers: 100, storageLimit: 2048, active: false },
];

const STORAGE_KEY = 'g005.tenant.id';

export function getCurrentTenant(): Tenant {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = TENANTS.find(t => t.id === stored);
      if (found && found.active) return found;
    }
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const byDomain = TENANTS.find(t => t.domain === hostname && t.active);
    if (byDomain) return byDomain;
  } catch {
  }
  return TENANTS[0]!;
}

export function switchTenant(tenantId: string): void {
  const tenant = TENANTS.find(t => t.id === tenantId);
  if (tenant && tenant.active) {
    try { localStorage.setItem(STORAGE_KEY, tenant.id); } catch { }
  }
}

export function listTenants(): Tenant[] {
  return TENANTS;
}
