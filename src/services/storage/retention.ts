import type { RetentionPolicy, RetentionRule } from './types';

const policies: RetentionPolicy[] = [
  {
    id: 'ret-1', name: 'CT/MR retention', enabled: true, priority: 100,
    rules: [{ field: 'modality', operator: 'equals', value: 'CT', action: 'archive', actionAfterDays: 365 }],
  },
  {
    id: 'ret-2', name: 'XR auto-delete after 3 years', enabled: true, priority: 80,
    rules: [{ field: 'modality', operator: 'equals', value: 'DR', action: 'delete', actionAfterDays: 1095 }],
  },
  {
    id: 'ret-3', name: 'Old studies archive', enabled: true, priority: 50,
    rules: [{ field: 'studyDate', operator: 'olderThan', value: 730, action: 'archive', actionAfterDays: 0 }],
  },
];

export function getRetentionPolicies(): RetentionPolicy[] {
  return policies;
}

export function addRetentionPolicy(policy: RetentionPolicy): void {
  policies.push(policy);
}

export function updateRetentionPolicy(id: string, updates: Partial<RetentionPolicy>): RetentionPolicy | null {
  const idx = policies.findIndex(p => p.id === id);
  if (idx < 0) return null;
  policies[idx] = { ...policies[idx], ...updates };
  return policies[idx];
}

export function deleteRetentionPolicy(id: string): boolean {
  const idx = policies.findIndex(p => p.id === id);
  if (idx < 0) return false;
  policies.splice(idx, 1);
  return true;
}

export function evaluateRetentionRules(study: { modality?: string; studyDate?: string; patientAge?: number }): RetentionRule[] {
  const matchedRules: RetentionRule[] = [];
  for (const policy of policies) {
    if (!policy.enabled) continue;
    for (const rule of policy.rules) {
      let matches = false;
      switch (rule.field) {
        case 'modality': matches = study.modality === rule.value; break;
        case 'studyDate': {
          if (study.studyDate) {
            const daysSince = Math.floor((Date.now() - new Date(study.studyDate).getTime()) / 86400000);
            matches = daysSince > Number(rule.value);
          }
          break;
        }
      }
      if (matches) matchedRules.push(rule);
    }
  }
  return matchedRules;
}
