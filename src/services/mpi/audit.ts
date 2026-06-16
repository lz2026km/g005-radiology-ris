export type MpiAuditAction =
  | 'patient_search' | 'patient_match' | 'link_created' | 'link_approved' | 'link_rejected'
  | 'merge_executed' | 'duplicate_detected' | 'duplicate_resolved'
  | 'consent_granted' | 'consent_withdrawn' | 'consent_expired'
  | 'cross_site_search' | 'demographics_update' | 'identity_added';

export interface MpiAuditEntry {
  id: string;
  timestamp: string;
  action: MpiAuditAction;
  patientId?: string;
  actor?: string;
  details?: Record<string, unknown>;
  result: 'success' | 'failure';
}

const mpiAuditLog: MpiAuditEntry[] = [];

export function logMpiAudit(entry: Omit<MpiAuditEntry, 'id' | 'timestamp'>): MpiAuditEntry {
  const full: MpiAuditEntry = {
    ...entry,
    id: `mpi-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  mpiAuditLog.unshift(full);
  return full;
}

export function queryMpiAuditLog(filter?: { action?: MpiAuditAction; patientId?: string; from?: string; to?: string; limit?: number; offset?: number }): { entries: MpiAuditEntry[]; total: number } {
  let filtered = [...mpiAuditLog];
  if (filter?.action) filtered = filtered.filter(e => e.action === filter.action);
  if (filter?.patientId) filtered = filtered.filter(e => e.patientId === filter.patientId);
  if (filter?.from) filtered = filtered.filter(e => e.timestamp >= filter.from!);
  if (filter?.to) filtered = filtered.filter(e => e.timestamp <= filter.to!);
  const total = filtered.length;
  const offset = filter?.offset || 0;
  const limit = filter?.limit || 50;
  return { entries: filtered.slice(offset, offset + limit), total };
}
