import type { PatientRecord, MatchCandidate, MatchResult } from './types';
import { calculateMatchScore, findMatches } from './matching';

export interface DuplicateGroup {
  groupId: string;
  records: PatientRecord[];
  primaryRecord: PatientRecord;
  matchScores: Array<{ recordId: string; score: number }>;
  status: 'open' | 'resolved' | 'reviewed';
}

let groupCounter = 0;
const duplicateGroups: DuplicateGroup[] = [];

export function detectDuplicates(records: PatientRecord[], threshold: number = 80): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    if (processed.has(records[i].id)) continue;
    const group: PatientRecord[] = [records[i]];
    const scores: Array<{ recordId: string; score: number }> = [];

    for (let j = i + 1; j < records.length; j++) {
      if (processed.has(records[j].id)) continue;
      const score = calculateMatchScore(records[i], records[j]);
      if (score >= threshold) {
        group.push(records[j]);
        scores.push({ recordId: records[j].id, score });
        processed.add(records[j].id);
      }
    }
    processed.add(records[i].id);
    if (group.length > 1) {
      groupCounter++;
      groups.push({
        groupId: `dup-group-${groupCounter}`,
        records: group,
        primaryRecord: group[0],
        matchScores: scores,
        status: 'open',
      });
    }
  }
  duplicateGroups.push(...groups);
  return groups;
}

export function getDuplicateGroups(status?: DuplicateGroup['status']): DuplicateGroup[] {
  return status ? duplicateGroups.filter(g => g.status === status) : [...duplicateGroups];
}

export function resolveDuplicateGroup(groupId: string, survivorId: string): boolean {
  const group = duplicateGroups.find(g => g.groupId === groupId);
  if (!group) return false;
  group.status = 'resolved';
  group.primaryRecord = group.records.find(r => r.id === survivorId) || group.primaryRecord;
  return true;
}

export function blockDuplicates(records: PatientRecord[], blockingKeys: string[] = ['name', 'dateOfBirth']): Map<string, PatientRecord[]> {
  const blocks = new Map<string, PatientRecord[]>();
  for (const record of records) {
    const key = blockingKeys.map(k => {
      const val = record[k as keyof PatientRecord];
      return val ? String(val).toLowerCase().replace(/\s/g, '') : '';
    }).join('|');
    if (!blocks.has(key)) blocks.set(key, []);
    blocks.get(key)!.push(record);
  }
  return blocks;
}
