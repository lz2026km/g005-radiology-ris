export type VnaAuditAction =
  | 'store' | 'query' | 'retrieve' | 'delete' | 'move' | 'copy'
  | 'anonymize' | 'compress' | 'migrate' | 'routing_rule_change'
  | 'ae_title_change' | 'config_change' | 'health_check';

export interface VnaAuditEntry {
  id: string;
  timestamp: string;
  action: VnaAuditAction;
  actor: string;
  studyUid?: string;
  seriesUid?: string;
  instanceUid?: string;
  details?: Record<string, unknown>;
  result: 'success' | 'failure';
  errorMessage?: string;
}

const auditLog: VnaAuditEntry[] = [];
const MAX_LOG_SIZE = 10000;

export function logVnaAudit(entry: Omit<VnaAuditEntry, 'id' | 'timestamp'>): VnaAuditEntry {
  const full: VnaAuditEntry = {
    ...entry,
    id: `vna-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.unshift(full);
  if (auditLog.length > MAX_LOG_SIZE) auditLog.length = MAX_LOG_SIZE;
  return full;
}

export function queryVnaAuditLog(filter?: { action?: VnaAuditAction; actor?: string; from?: string; to?: string; limit?: number; offset?: number }): { entries: VnaAuditEntry[]; total: number } {
  let filtered = [...auditLog];
  if (filter?.action) filtered = filtered.filter(e => e.action === filter.action);
  if (filter?.actor) filtered = filtered.filter(e => e.actor.includes(filter.actor!));
  if (filter?.from) filtered = filtered.filter(e => e.timestamp >= filter.from!);
  if (filter?.to) filtered = filtered.filter(e => e.timestamp <= filter.to!);
  const total = filtered.length;
  const offset = filter?.offset || 0;
  const limit = filter?.limit || 50;
  return { entries: filtered.slice(offset, offset + limit), total };
}
