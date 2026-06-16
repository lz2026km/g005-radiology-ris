export interface MpiDashboardData {
  totalPatients: number;
  duplicateGroups: number;
  pendingLinks: number;
  activeLinks: number;
  activeConsents: number;
  totalConsents: number;
  recentMatches: number;
  crossSiteSearches: number;
  byIdentityDomain: Record<string, number>;
}

export function getMpiDashboardData(): MpiDashboardData {
  return {
    totalPatients: 0,
    duplicateGroups: 0,
    pendingLinks: 0,
    activeLinks: 0,
    activeConsents: 0,
    totalConsents: 0,
    recentMatches: 0,
    crossSiteSearches: 0,
    byIdentityDomain: {},
  };
}
