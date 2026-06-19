/**
 * G005 RIS v3.0.6.6 - CDS Alert Center
 *
 * 30 点 - 中央告警管理:增/查/改/状态/操作日志/统计
 */
import type {
  CdsAlert,
  CdsAlertAction,
  CdsAlertActionLog,
  CdsAlertCategory,
  CdsAlertSeverity,
  CdsAlertStatus,
  CdsStatistics,
} from '../../../types/cds';

export interface AlertQuery {
  patientId?: string;
  examId?: string;
  reportId?: string;
  ruleId?: string;
  category?: CdsAlertCategory;
  severity?: CdsAlertSeverity;
  status?: CdsAlertStatus | CdsAlertStatus[];
  source?: CdsAlert['source'];
  fromDate?: string;
  toDate?: string;
  blocking?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'triggeredAt' | 'severity' | 'status';
  sortDir?: 'asc' | 'desc';
}

export interface AlertMutationResult {
  alert: CdsAlert | null;
  log: CdsAlertActionLog;
  ok: boolean;
  error?: string;
}

const ALERT_STATUS_FLOW: Record<CdsAlertStatus, CdsAlertStatus[]> = {
  active: ['acknowledged', 'dismissed', 'snoozed', 'overridden', 'escalated', 'resolved'],
  acknowledged: ['dismissed', 'overridden', 'resolved', 'escalated'],
  dismissed: ['active'],
  snoozed: ['active', 'dismissed', 'overridden'],
  escalated: ['acknowledged', 'overridden', 'resolved'],
  overridden: ['active'],
  resolved: ['active'],
};

export class AlertCenter {
  private alerts: Map<string, CdsAlert> = new Map();
  private logs: CdsAlertActionLog[] = [];
  private idCounter = 0;

  private nextId(): string {
    this.idCounter += 1;
    return 'alert-' + Date.now().toString(36) + '-' + this.idCounter.toString(36);
  }

  addAlert(alert: CdsAlert): CdsAlert {
    const full: CdsAlert = {
      ...alert,
      id: alert.id ?? this.nextId(),
      status: alert.status ?? 'active',
      triggeredAt: alert.triggeredAt ?? new Date().toISOString(),
    };
    this.alerts.set(full.id, full);
    return full;
  }

  addAlerts(alerts: CdsAlert[]): CdsAlert[] {
    return alerts.map((a) => this.addAlert(a));
  }

  getById(id: string): CdsAlert | null {
    return this.alerts.get(id) ?? null;
  }

  remove(id: string): boolean {
    return this.alerts.delete(id);
  }

  query(q: AlertQuery = {}): CdsAlert[] {
    let list = Array.from(this.alerts.values());
    if (q.patientId) list = list.filter((a) => a.patientId === q.patientId);
    if (q.examId) list = list.filter((a) => a.examId === q.examId);
    if (q.reportId) list = list.filter((a) => a.reportId === q.reportId);
    if (q.ruleId) list = list.filter((a) => a.ruleId === q.ruleId);
    if (q.category) list = list.filter((a) => a.category === q.category);
    if (q.severity) list = list.filter((a) => a.severity === q.severity);
    if (q.status) {
      const arr = Array.isArray(q.status) ? q.status : [q.status];
      list = list.filter((a) => arr.includes(a.status));
    }
    if (q.source) list = list.filter((a) => a.source === q.source);
    if (q.fromDate) list = list.filter((a) => a.triggeredAt >= q.fromDate!);
    if (q.toDate) list = list.filter((a) => a.triggeredAt <= q.toDate!);
    if (q.blocking !== undefined) list = list.filter((a) => a.blocking === q.blocking);
    const sortBy = q.sortBy ?? 'triggeredAt';
    const sortDir = q.sortDir ?? 'desc';
    list.sort((a, b) => {
      const va = a[sortBy] as string;
      const vb = b[sortBy] as string;
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    if (q.offset) list = list.slice(q.offset);
    if (q.limit) list = list.slice(0, q.limit);
    return list;
  }

  count(q: AlertQuery = {}): number {
    return this.query({ ...q, limit: undefined, offset: undefined }).length;
  }

  getAll(): CdsAlert[] {
    return Array.from(this.alerts.values());
  }

  acknowledge(id: string, by: string, reason?: string): CdsAlert | null {
    return this.transition(id, by, 'acknowledge', reason);
  }

  dismiss(id: string, by: string, reason?: string): CdsAlert | null {
    return this.transition(id, by, 'dismiss', reason);
  }

  override(id: string, by: string, reason: string): CdsAlert | null {
    return this.transition(id, by, 'override', reason);
  }

  snooze(id: string, by: string, untilIso: string, reason?: string): CdsAlert | null {
    const r = this.transition(id, by, 'snooze', reason);
    if (r) r.snoozedUntil = untilIso;
    return r;
  }

  escalate(id: string, by: string, to: string, reason?: string): CdsAlert | null {
    const r = this.transition(id, by, 'escalate', reason);
    if (r) {
      r.escalatedTo = to;
      r.escalatedAt = new Date().toISOString();
    }
    return r;
  }

  resolve(id: string, by: string, resolution: string): CdsAlert | null {
    const r = this.transition(id, by, 'modify', resolution);
    if (r) r.resolution = resolution;
    return r;
  }

  private transition(id: string, by: string, action: CdsAlertAction, reason?: string): CdsAlert | null {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    const targetStatus = this.mapActionToStatus(action);
    if (!targetStatus) return null;
    if (!ALERT_STATUS_FLOW[alert.status].includes(targetStatus)) {
      const log: CdsAlertActionLog = {
        id: 'log-' + Date.now() + Math.random().toString(36).slice(2, 6),
        alertId: id,
        action,
        performedBy: by,
        performedAt: new Date().toISOString(),
        reason,
        notes: 'Invalid state transition from ' + alert.status + ' to ' + targetStatus,
      };
      this.logs.push(log);
      return null;
    }
    const now = new Date().toISOString();
    alert.status = targetStatus;
    if (action === 'acknowledge') {
      alert.acknowledgedAt = now;
      alert.acknowledgedBy = by;
    } else if (action === 'dismiss') {
      alert.dismissedAt = now;
      alert.dismissedBy = by;
      alert.dismissReason = reason;
    } else if (action === 'override') {
      alert.overrideBy = by;
      alert.overrideReason = reason;
    }
    const log: CdsAlertActionLog = {
      id: 'log-' + Date.now() + Math.random().toString(36).slice(2, 6),
      alertId: id,
      action,
      performedBy: by,
      performedAt: now,
      reason,
    };
    this.logs.push(log);
    return alert;
  }

  private mapActionToStatus(action: CdsAlertAction): CdsAlertStatus | null {
    switch (action) {
      case 'acknowledge':
        return 'acknowledged';
      case 'dismiss':
        return 'dismissed';
      case 'override':
        return 'overridden';
      case 'snooze':
        return 'snoozed';
      case 'escalate':
        return 'escalated';
      case 'modify':
        return 'resolved';
      case 'accept':
        return 'resolved';
      default:
        return null;
    }
  }

  getLogs(alertId?: string): CdsAlertActionLog[] {
    return alertId ? this.logs.filter((l) => l.alertId === alertId) : this.logs.slice();
  }

  computeStatistics(periodDays = 30): CdsStatistics {
    const all = this.getAll();
    const from = new Date(Date.now() - periodDays * 86400000).toISOString();
    const list = all.filter((a) => a.triggeredAt >= from);
    const totalAlerts = list.length;
    const activeAlerts = list.filter((a) => a.status === 'active').length;
    const acknowledgedAlerts = list.filter((a) => a.status === 'acknowledged').length;
    const dismissedAlerts = list.filter((a) => a.status === 'dismissed').length;
    const overriddenAlerts = list.filter((a) => a.status === 'overridden').length;
    const escalatedAlerts = list.filter((a) => a.status === 'escalated').length;
    const resolved = list.filter((a) => a.status === 'resolved').length;
    const resolutionRate = totalAlerts > 0 ? resolved / totalAlerts : 0;
    const ackTimes = list.filter((a) => a.acknowledgedAt).map((a) => (new Date(a.acknowledgedAt!).getTime() - new Date(a.triggeredAt).getTime()) / 60000);
    const averageAcknowledgeMinutes = ackTimes.length > 0 ? Math.round(ackTimes.reduce((a, b) => a + b, 0) / ackTimes.length) : 0;
    const categoryBreakdown: Record<string, number> = {};
    const severityBreakdown: Record<string, number> = {};
    for (const a of list) {
      categoryBreakdown[a.category] = (categoryBreakdown[a.category] ?? 0) + 1;
      severityBreakdown[a.severity] = (severityBreakdown[a.severity] ?? 0) + 1;
    }
    const ruleAgg = new Map<string, { ruleId: string; ruleName: string; triggered: number; overridden: number }>();
    for (const a of list) {
      const e = ruleAgg.get(a.ruleId) ?? { ruleId: a.ruleId, ruleName: a.ruleName, triggered: 0, overridden: 0 };
      e.triggered += 1;
      if (a.status === 'overridden') e.overridden += 1;
      ruleAgg.set(a.ruleId, e);
    }
    const topRules = Array.from(ruleAgg.values()).sort((a, b) => b.triggered - a.triggered).slice(0, 10);
    const dailyMap = new Map<string, { triggered: number; resolved: number; overridden: number }>();
    for (const a of list) {
      const d = a.triggeredAt.slice(0, 10);
      const e = dailyMap.get(d) ?? { triggered: 0, resolved: 0, overridden: 0 };
      e.triggered += 1;
      if (a.status === 'resolved') e.resolved += 1;
      if (a.status === 'overridden') e.overridden += 1;
      dailyMap.set(d, e);
    }
    const dailyVolume = Array.from(dailyMap.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      totalAlerts,
      activeAlerts,
      acknowledgedAlerts,
      dismissedAlerts,
      overriddenAlerts,
      escalatedAlerts,
      resolutionRate,
      averageAcknowledgeMinutes,
      categoryBreakdown: categoryBreakdown as Record<CdsAlertCategory, number>,
      severityBreakdown: severityBreakdown as Record<CdsAlertSeverity, number>,
      topRules,
      dailyVolume,
      topUsers: [],
      period: { from, to: new Date().toISOString() },
    };
  }

  clear(): void {
    this.alerts.clear();
    this.logs = [];
    this.idCounter = 0;
  }
}

let _instance: AlertCenter | null = null;
export function getAlertCenter(): AlertCenter {
  if (!_instance) _instance = new AlertCenter();
  return _instance;
}
