import type { LifecycleRule, StorageTier, StorageObject } from './types';

const lifecycleRules: LifecycleRule[] = [
  { id: 'lc-1', name: 'CT studies: hot→cool after 30d', enabled: true, transitions: [{ fromTier: 'hot', toTier: 'cool', afterDays: 30 }], filter: { modality: ['CT'] } },
  { id: 'lc-2', name: 'All studies: cool→cold after 365d', enabled: true, transitions: [{ fromTier: 'cool', toTier: 'cold', afterDays: 365 }] },
  { id: 'lc-3', name: 'Old studies: cold→glacier after 1095d', enabled: false, transitions: [{ fromTier: 'cold', toTier: 'glacier', afterDays: 1095 }] },
];

export function getLifecycleRules(): LifecycleRule[] {
  return lifecycleRules;
}

export function addLifecycleRule(rule: LifecycleRule): void {
  lifecycleRules.push(rule);
}

export function updateLifecycleRule(id: string, updates: Partial<LifecycleRule>): LifecycleRule | null {
  const idx = lifecycleRules.findIndex(r => r.id === id);
  if (idx < 0) return null;
  lifecycleRules[idx] = { ...lifecycleRules[idx], ...updates };
  return lifecycleRules[idx];
}

export function deleteLifecycleRule(id: string): boolean {
  const idx = lifecycleRules.findIndex(r => r.id === id);
  if (idx < 0) return false;
  lifecycleRules.splice(idx, 1);
  return true;
}

export function determineTargetTier(object: StorageObject): StorageTier {
  const now = Date.now();
  const ageDays = (now - new Date(object.createdAt).getTime()) / 86400000;
  for (const rule of lifecycleRules) {
    if (!rule.enabled) continue;
    for (const transition of rule.transitions) {
      if (object.tier !== transition.fromTier) continue;
      if (ageDays >= transition.afterDays) {
        if (rule.filter?.modality && !rule.filter.modality.some(m => object.key.includes(m))) continue;
        return transition.toTier;
      }
    }
  }
  return object.tier;
}
