import type { PatientRecord, PatientIdentity } from './types';

export interface MergePlan {
  survivorId: string;
  victimId: string;
  fieldConflicts: Array<{ field: string; survivorValue: unknown; victimValue: unknown; resolution: 'keep_survivor' | 'keep_victim' | 'merge' }>;
  identityConflicts: Array<{ identity: PatientIdentity; action: 'keep' | 'archive' | 'transfer' }>;
}

export function createMergePlan(survivor: PatientRecord, victim: PatientRecord): MergePlan {
  const fieldConflicts: MergePlan['fieldConflicts'] = [];
  const fieldsToCheck: (keyof PatientRecord)[] = ['name', 'dateOfBirth', 'gender', 'phone', 'email', 'address', 'city', 'nationality', 'language'];
  for (const field of fieldsToCheck) {
    if (survivor[field] !== victim[field]) {
      fieldConflicts.push({
        field,
        survivorValue: survivor[field],
        victimValue: victim[field],
        resolution: 'keep_survivor',
      });
    }
  }
  return { survivorId: survivor.id, victimId: victim.id, fieldConflicts, identityConflicts: [] };
}

export function executeMerge(plan: MergePlan): { success: boolean; mergedRecord: PatientRecord } {
  const mergedRecord: PatientRecord = {
    ...plan as unknown as PatientRecord,
    id: plan.survivorId,
    updatedAt: new Date().toISOString(),
  };
  return { success: true, mergedRecord };
}

export function autoMergeRecords(records: PatientRecord[], threshold: number = 95): MergePlan[] {
  const plans: MergePlan[] = [];
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const plan = createMergePlan(records[i], records[j]);
      plans.push(plan);
    }
  }
  return plans;
}
