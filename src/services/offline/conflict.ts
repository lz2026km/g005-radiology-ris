import type { ConflictRecord, OfflineQueueItem } from './types';

const conflictRecords: ConflictRecord[] = [];

export const conflictResolver = {
  async detectConflict(localItem: OfflineQueueItem, serverItem: Record<string, unknown>): Promise<ConflictRecord | null> {
    for (const [key, localValue] of Object.entries(localItem.data)) {
      if (key in serverItem && JSON.stringify(localValue) !== JSON.stringify(serverItem[key])) {
        const conflict: ConflictRecord = {
          id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          localItem,
          serverItem,
          field: key,
          localValue,
          serverValue: serverItem[key],
        };
        conflictRecords.push(conflict);
        return conflict;
      }
    }
    return null;
  },

  async autoResolve(localItem: OfflineQueueItem, serverItem: Record<string, unknown>): Promise<Record<string, unknown>> {
    const resolved = { ...serverItem };
    for (const [key, localValue] of Object.entries(localItem.data)) {
      if (key in serverItem && localItem.operation === 'update') {
        resolved[key] = localValue;
      }
    }
    return resolved;
  },

  async manualResolve(conflictId: string, resolution: 'keep_local' | 'keep_server' | 'merge'): Promise<boolean> {
    const conflict = conflictRecords.find(c => c.id === conflictId);
    if (!conflict) return false;
    conflict.resolution = resolution;
    conflict.resolvedAt = new Date().toISOString();
    return true;
  },

  getConflicts(resolved?: boolean): ConflictRecord[] {
    return resolved === undefined ? conflictRecords : conflictRecords.filter(c => resolved ? c.resolution : !c.resolution);
  },

  getConflictCount(): number {
    return conflictRecords.filter(c => !c.resolution).length;
  },

  clear(): void {
    conflictRecords.length = 0;
  },
};
