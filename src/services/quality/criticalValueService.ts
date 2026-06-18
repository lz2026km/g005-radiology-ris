/**
 * G005 RIS v3.0.5.1 - R3.CRITICAL 危急值服务 (Mock)
 */
import {
  CRITICAL_LEVELS,
  CRITICAL_RULES,
  CRITICAL_EVENTS,
  CRITICAL_ESCALATION_RULES,
  CRITICAL_KPI,
} from '../../data/criticalValueMock';
import type {
  CriticalRule,
  CriticalEvent,
  CriticalLevelConfig,
  CriticalKPI,
  CriticalEscalationRule,
  CriticalLevel,
  NotificationChannel,
  CriticalStatus,
} from '../../types/R3/R3.CRITICAL';

const LATENCY_MIN = 200;
const LATENCY_MAX = 1500;
const randomLatency = () => Math.floor(Math.random() * (LATENCY_MAX - LATENCY_MIN)) + LATENCY_MIN;
const wait = (ms?: number) => new Promise<void>((r) => setTimeout(r, ms ?? randomLatency()));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const inMemoryEvents: CriticalEvent[] = clone(CRITICAL_EVENTS);
const inMemoryRules: CriticalRule[] = clone(CRITICAL_RULES);

export const criticalValueService = {
  async listLevels(): Promise<CriticalLevelConfig[]> {
    await wait();
    return clone(CRITICAL_LEVELS);
  },

  async getLevel(level: CriticalLevel): Promise<CriticalLevelConfig | null> {
    await wait();
    return clone(CRITICAL_LEVELS.find((l) => l.level === level) ?? null);
  },

  async listRules(filter?: { category?: string; modality?: string; isActive?: boolean }): Promise<CriticalRule[]> {
    await wait();
    let list = inMemoryRules.slice();
    if (filter?.category) list = list.filter((r) => r.category === filter.category);
    if (filter?.modality) list = list.filter((r) => r.modality.includes(filter.modality!));
    if (filter?.isActive !== undefined) list = list.filter((r) => r.isActive === filter.isActive);
    return list;
  },

  async getRule(id: string): Promise<CriticalRule | null> {
    await wait();
    return clone(inMemoryRules.find((r) => r.id === id) ?? null);
  },

  async updateRule(id: string, patch: Partial<CriticalRule>): Promise<CriticalRule> {
    await wait();
    const r = inMemoryRules.find((x) => x.id === id);
    if (!r) throw new Error('Rule not found');
    Object.assign(r, patch, { updatedAt: new Date().toISOString() });
    return clone(r);
  },

  async toggleRule(id: string, isActive: boolean): Promise<CriticalRule> {
    await wait();
    return this.updateRule(id, { isActive });
  },

  async listEvents(filter?: { status?: CriticalStatus; level?: CriticalLevel; dateFrom?: string; dateTo?: string }): Promise<CriticalEvent[]> {
    await wait();
    let list = inMemoryEvents.slice();
    if (filter?.status) list = list.filter((e) => e.status === filter.status);
    if (filter?.level) list = list.filter((e) => e.level === filter.level);
    return list;
  },

  async getEvent(id: string): Promise<CriticalEvent | null> {
    await wait();
    return clone(inMemoryEvents.find((e) => e.id === id) ?? null);
  },

  async reportEvent(event: Omit<CriticalEvent, 'id' | 'reportedAt' | 'status' | 'channels' | 'sop' | 'auditChain' | 'hash' | 'escalationLevel'>): Promise<CriticalEvent> {
    await wait(800);
    const e: CriticalEvent = {
      ...event,
      id: 'ce-' + Date.now(),
      reportedAt: new Date().toISOString(),
      status: 'pending',
      channels: [],
      sop: [
        { step: 1, title: '发现危急值', description: '影像检查发现危急值征象', action: '立即记录', deadlineMinutes: 1 },
        { step: 2, title: '复核确认', description: '上级医生复核危急值', action: '双人复核', deadlineMinutes: 5 },
        { step: 3, title: '通知临床', description: '电话/短信通知主管医生', action: '多渠道通知', deadlineMinutes: 10 },
        { step: 4, title: '记录确认', description: '记录接收医生与时间', action: '记录系统', deadlineMinutes: 10 },
        { step: 5, title: '持续追踪', description: '追踪临床处理情况', action: '持续追踪', deadlineMinutes: 30 },
        { step: 6, title: '闭环归档', description: '归档危急值处理记录', action: '闭环归档', deadlineMinutes: 60 },
      ],
      auditChain: [],
      hash: 'cv-' + Date.now(),
      escalationLevel: 0,
    };
    inMemoryEvents.unshift(e);
    return clone(e);
  },

  async notifyEvent(eventId: string, channels: NotificationChannel[], recipientId: string, recipientName: string): Promise<CriticalEvent> {
    await wait();
    const e = inMemoryEvents.find((x) => x.id === eventId);
    if (!e) throw new Error('Event not found');
    e.receivingDoctorId = recipientId;
    e.receivingDoctorName = recipientName;
    e.receivingTime = new Date().toISOString();
    e.channels = [...e.channels, ...channels];
    e.status = 'notified';
    for (const ch of channels) {
      e.channelAttempts.push({ channel: ch, attemptedAt: new Date().toISOString(), success: true, recipientId });
    }
    return clone(e);
  },

  async acknowledgeEvent(eventId: string, userId: string, userName: string): Promise<CriticalEvent> {
    await wait();
    const e = inMemoryEvents.find((x) => x.id === eventId);
    if (!e) throw new Error('Event not found');
    e.acknowledgedById = userId;
    e.acknowledgedByName = userName;
    e.acknowledgedTime = new Date().toISOString();
    e.responseTimeMinutes = Math.round((Date.now() - new Date(e.reportedAt).getTime()) / 60000);
    e.onTimeNotification = (e.responseTimeMinutes ?? 0) <= 10;
    e.status = 'acknowledged';
    return clone(e);
  },

  async resolveEvent(eventId: string): Promise<CriticalEvent> {
    await wait();
    const e = inMemoryEvents.find((x) => x.id === eventId);
    if (!e) throw new Error('Event not found');
    e.resolvedTime = new Date().toISOString();
    e.status = 'resolved';
    return clone(e);
  },

  async escalateEvent(eventId: string, toId: string, toName: string, reason: string): Promise<CriticalEvent> {
    await wait(500);
    if (!reason || reason.length < 5) throw new Error('升级原因不能少于 5 字符');
    const e = inMemoryEvents.find((x) => x.id === eventId);
    if (!e) throw new Error('Event not found');
    e.escalatedAt = new Date().toISOString();
    e.escalatedToId = toId;
    e.escalatedToName = toName;
    e.escalationReason = reason;
    e.escalationLevel += 1;
    e.status = 'escalated';
    return clone(e);
  },

  async listEscalationRules(): Promise<CriticalEscalationRule[]> {
    await wait();
    return clone(CRITICAL_ESCALATION_RULES);
  },

  async updateEscalationRule(id: string, patch: Partial<CriticalEscalationRule>): Promise<CriticalEscalationRule> {
    await wait();
    const r = CRITICAL_ESCALATION_RULES.find((x) => x.id === id);
    if (!r) throw new Error('Rule not found');
    Object.assign(r, patch);
    return clone(r);
  },

  async getKPI(): Promise<CriticalKPI> {
    await wait();
    return clone(CRITICAL_KPI);
  },

  async dualReview(eventId: string, reviewerId: string, reviewerName: string, isSecond: boolean): Promise<CriticalEvent> {
    await wait();
    const e = inMemoryEvents.find((x) => x.id === eventId);
    if (!e) throw new Error('Event not found');
    if (!e.dualReview) e.dualReview = {};
    if (!isSecond) {
      e.dualReview.firstReviewerId = reviewerId;
      e.dualReview.firstReviewerName = reviewerName;
      e.dualReview.firstReviewAt = new Date().toISOString();
    } else {
      e.dualReview.secondReviewerId = reviewerId;
      e.dualReview.secondReviewerName = reviewerName;
      e.dualReview.secondReviewAt = new Date().toISOString();
    }
    return clone(e);
  },

  async exportEvents(format: 'excel' | 'pdf', filter?: { status?: CriticalStatus }): Promise<{ data: string; mime: string; filename: string }> {
    await wait(1500);
    const list = filter?.status ? inMemoryEvents.filter((e) => e.status === filter.status) : inMemoryEvents;
    return {
      data: format === 'excel' ? JSON.stringify(list, null, 2) : 'Mock PDF content',
      mime: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
      filename: 'critical-events.' + format,
    };
  },
};

export type CriticalValueService = typeof criticalValueService;
export default criticalValueService;
