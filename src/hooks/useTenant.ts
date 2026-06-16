import { getCurrentTenant } from '../services/tenant/tenantService';

export function useTenant() {
  const tenant = getCurrentTenant();
  return {
    tenant,
    isMultiTenant: true,
    features: tenant.features,
    hasFeature: (f: string) => tenant.features.includes('*') || tenant.features.includes(f),
  };
}
