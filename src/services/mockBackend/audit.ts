// [v3.0.6.8-32] 审计日志层
// 所有 mutating 操作自动记录 (operator/action/entity/before/after)
import { logAudit, listAudit, AuditEntry } from './store';

// ==================== 上下文 ====================
export interface AuditContext {
  userId: string;
  userName: string;
  ip?: string;
  userAgent?: string;
}

let currentContext: AuditContext | null = null;

export function setAuditContext(ctx: AuditContext | null): void {
  currentContext = ctx;
}

export function getAuditContext(): AuditContext {
  return currentContext || {
    userId: 'system',
    userName: '系统',
  };
}

// ==================== 审计记录函数 ====================
export interface AuditCreateParams<T> {
  resource: string;
  after: T;
}

export function auditCreate<T>(resource: string, after: T, ctx?: AuditContext): void {
  const c = ctx || getAuditContext();
  logAudit({
    userId: c.userId,
    userName: c.userName,
    ip: c.ip,
    action: 'create',
    resource,
    resourceId: (after as any).id || 'unknown',
    after,
  });
}

export interface AuditUpdateParams<T> {
  resource: string;
  before: T | undefined;
  after: T;
}

export function auditUpdate<T>(resource: string, before: T | undefined, after: T, ctx?: AuditContext): void {
  const c = ctx || getAuditContext();
  logAudit({
    userId: c.userId,
    userName: c.userName,
    ip: c.ip,
    action: 'update',
    resource,
    resourceId: (after as any).id || 'unknown',
    before,
    after,
  });
}

export interface AuditDeleteParams {
  resource: string;
  resourceId: string;
  before?: unknown;
}

export function auditDelete(params: AuditDeleteParams, ctx?: AuditContext): void {
  const c = ctx || getAuditContext();
  logAudit({
    userId: c.userId,
    userName: c.userName,
    ip: c.ip,
    action: 'delete',
    resource: params.resource,
    resourceId: params.resourceId,
    before: params.before,
  });
}

export function auditStatusChange<T>(
  resource: string,
  entity: T,
  fromState: string,
  toState: string,
  reason?: string,
  ctx?: AuditContext,
): void {
  const c = ctx || getAuditContext();
  logAudit({
    userId: c.userId,
    userName: c.userName,
    ip: c.ip,
    action: 'status_change',
    resource,
    resourceId: (entity as any).id || 'unknown',
    before: { status: fromState },
    after: { status: toState, reason },
  });
}

export function auditRead(resource: string, resourceId: string, ctx?: AuditContext): void {
  const c = ctx || getAuditContext();
  logAudit({
    userId: c.userId,
    userName: c.userName,
    ip: c.ip,
    action: 'read',
    resource,
    resourceId,
  });
}

// ==================== 查询 ====================
export { listAudit };

export function queryAudit(filter: {
  resource?: string;
  resourceId?: string;
  action?: AuditEntry['action'];
  userId?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): AuditEntry[] {
  let result = listAudit(10000);
  if (filter.resource) result = result.filter(e => e.resource === filter.resource);
  if (filter.resourceId) result = result.filter(e => e.resourceId === filter.resourceId);
  if (filter.action) result = result.filter(e => e.action === filter.action);
  if (filter.userId) result = result.filter(e => e.userId === filter.userId);
  if (filter.startTime) result = result.filter(e => e.timestamp >= filter.startTime!);
  if (filter.endTime) result = result.filter(e => e.timestamp <= filter.endTime!);
  if (filter.limit) result = result.slice(0, filter.limit);
  return result;
}

// ==================== 审计统计 ====================
export function auditStats(): {
  total: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
} {
  const all = listAudit(10000);
  const byAction: Record<string, number> = {};
  const byResource: Record<string, number> = {};
  for (const e of all) {
    byAction[e.action] = (byAction[e.action] || 0) + 1;
    byResource[e.resource] = (byResource[e.resource] || 0) + 1;
  }
  return { total: all.length, byAction, byResource };
}
