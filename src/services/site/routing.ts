import type { SiteExamRoute } from './types';

const examRoutes: SiteExamRoute[] = [];

export function createExamRoute(route: Omit<SiteExamRoute, 'id'>): SiteExamRoute {
  const newRoute: SiteExamRoute = {
    ...route,
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  examRoutes.push(newRoute);
  return newRoute;
}

export function updateExamRoute(id: string, updates: Partial<SiteExamRoute>): SiteExamRoute | null {
  const idx = examRoutes.findIndex(r => r.id === id);
  if (idx < 0) return null;
  examRoutes[idx] = { ...examRoutes[idx], ...updates };
  return examRoutes[idx];
}

export function deleteExamRoute(id: string): boolean {
  const idx = examRoutes.findIndex(r => r.id === id);
  if (idx < 0) return false;
  examRoutes.splice(idx, 1);
  return true;
}

export function getExamRoutes(sourceSiteId?: string): SiteExamRoute[] {
  return sourceSiteId ? examRoutes.filter(r => r.sourceSiteId === sourceSiteId) : [...examRoutes];
}

export function findMatchingRoute(modality: string, bodyPart: string, sourceSiteId: string): SiteExamRoute | null {
  const candidates = examRoutes
    .filter(r => r.enabled && r.sourceSiteId === sourceSiteId)
    .filter(r => !r.modalityFilter || r.modalityFilter.length === 0 || r.modalityFilter.includes(modality))
    .filter(r => !r.bodyPartFilter || r.bodyPartFilter.length === 0 || r.bodyPartFilter.includes(bodyPart))
    .sort((a, b) => b.priority - a.priority);
  return candidates[0] || null;
}

export async function routeExamToSite(examId: string, targetSiteId: string): Promise<{ success: boolean; message: string }> {
  console.log(`[Site Routing] Routing exam ${examId} to site ${targetSiteId}`);
  return { success: true, message: `Exam ${examId} routed to ${targetSiteId}` };
}
