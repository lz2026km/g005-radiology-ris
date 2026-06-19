/**
 * G005 RIS v3.0.6.6 - CDS Hooks Engine
 *
 * 60 点 - 中央事件总线,协调 5 个规则模块 + AlertCenter
 * 事件类型 13 种 × 钩子 pre/post/validate 三阶段
 */
import type {
  CdsAlert,
  CdsAlertCategory,
  CdsAlertSeverity,
  CdsEngineConfig,
  CdsEngineEvent,
  CdsEngineListener,
  CdsEventType,
  CdsHook,
  CdsHookResult,
  CdsHookPhase,
  CdsTriggerContext,
} from '../../../types/cds';
import { ContraindicationRules } from '../rules/ContraindicationRules';
import { DrugInteractionRules } from '../rules/DrugInteractionRules';
import { DoseCheckRules } from '../rules/DoseCheckRules';
import { AllergyCheck } from '../rules/AllergyCheck';
import { AlertCenter } from '../alerts/AlertCenter';
import { ClinicalPathway } from '../pathway/ClinicalPathway';
import { ProtocolSelector } from '../protocols/ProtocolSelector';
import { ClinicalGuidelines } from '../guidelines/ClinicalGuidelines';
import { ACRSelectIntegration } from '../acrSelect/ACRSelectIntegration';

const DEFAULT_CONFIG: CdsEngineConfig = {
  enabled: true,
  hooksEnabled: true,
  allergyCheckEnabled: true,
  contraindicationCheckEnabled: true,
  drugInteractionCheckEnabled: true,
  doseCheckEnabled: true,
  acrSelectEnabled: true,
  guidelineEnabled: true,
  pathwayEnabled: true,
  protocolEnabled: true,
  blockingForCritical: true,
  blockingForFatal: true,
  maxAlertsPerContext: 50,
  showInReport: true,
  showInOrder: true,
  showInSchedule: true,
  snoozeMinutes: 15,
  escalationMinutes: 30,
  version: 'cds-engine-3.0.6.6',
  lastSyncedAt: new Date().toISOString(),
};

const DEFAULT_HOOKS: CdsHook[] = [
  { id: 'hk-001', name: '检查前适宜性评估', description: '检查开立时评估适应症与禁忌', eventType: 'order.create', phase: 'pre', ruleIds: ['contra-*', 'acr-*'], priority: 100, enabled: true, blocking: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-002', name: '检查前过敏检查', description: '检查前过敏史与对比剂交叉', eventType: 'order.create', phase: 'pre', ruleIds: ['allergy-*'], priority: 95, enabled: true, blocking: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-003', name: '检查前药物交互', description: '检查前评估造影剂与患者药物交互', eventType: 'order.create', phase: 'pre', ruleIds: ['drug-*'], priority: 90, enabled: true, blocking: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-004', name: '检查前协议推荐', description: '根据患者情况推荐协议', eventType: 'order.create', phase: 'pre', ruleIds: ['protocol-*'], priority: 80, enabled: true, blocking: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-005', name: '检查前路径激活', description: '根据诊断激活临床路径', eventType: 'order.create', phase: 'pre', ruleIds: ['pathway-*'], priority: 70, enabled: true, blocking: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-006', name: '注射前剂量预估', description: '注射对比剂前预估肾毒性风险', eventType: 'contrast.inject', phase: 'validate', ruleIds: ['contra-egfr-*', 'drug-metformin-*'], priority: 100, enabled: true, blocking: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-007', name: '检查后剂量记录', description: '记录 CT 剂量并触发剂量检查', eventType: 'dose.record', phase: 'post', ruleIds: ['dose-*'], priority: 100, enabled: true, blocking: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-008', name: '报告提交完整性', description: '报告提交时完整性检查', eventType: 'report.submit', phase: 'validate', ruleIds: ['completeness-*'], priority: 90, enabled: true, blocking: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-009', name: '危急值触发', description: '危急值自动触发通报', eventType: 'critical.detect', phase: 'post', ruleIds: ['critical-*'], priority: 100, enabled: true, blocking: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'hk-010', name: '协议选择推荐', description: '技师选择协议时推荐', eventType: 'protocol.select', phase: 'pre', ruleIds: ['protocol-recommend-*'], priority: 85, enabled: true, blocking: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export class CdsEngine {
  private config: CdsEngineConfig = { ...DEFAULT_CONFIG };
  private hooks: CdsHook[] = [...DEFAULT_HOOKS];
  private listeners: Set<CdsEngineListener> = new Set();
  private alertCenter: AlertCenter;
  private contraRules: ContraindicationRules;
  private drugRules: DrugInteractionRules;
  private doseRules: DoseCheckRules;
  private allergyRules: AllergyCheck;
  private pathway: ClinicalPathway;
  private protocolSelector: ProtocolSelector;
  private guidelines: ClinicalGuidelines;
  private acrSelect: ACRSelectIntegration;
  private history: { eventType: CdsEventType; timestamp: string; durationMs: number; alertCount: number }[] = [];

  constructor(deps?: {
    alertCenter?: AlertCenter;
    contra?: ContraindicationRules;
    drug?: DrugInteractionRules;
    dose?: DoseCheckRules;
    allergy?: AllergyCheck;
    pathway?: ClinicalPathway;
    protocolSelector?: ProtocolSelector;
    guidelines?: ClinicalGuidelines;
    acrSelect?: ACRSelectIntegration;
  }) {
    this.alertCenter = deps?.alertCenter ?? new AlertCenter();
    this.contraRules = deps?.contra ?? new ContraindicationRules();
    this.drugRules = deps?.drug ?? new DrugInteractionRules();
    this.doseRules = deps?.dose ?? new DoseCheckRules();
    this.allergyRules = deps?.allergy ?? new AllergyCheck();
    this.pathway = deps?.pathway ?? new ClinicalPathway();
    this.protocolSelector = deps?.protocolSelector ?? new ProtocolSelector();
    this.guidelines = deps?.guidelines ?? new ClinicalGuidelines();
    this.acrSelect = deps?.acrSelect ?? new ACRSelectIntegration();
  }

  getConfig(): CdsEngineConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<CdsEngineConfig>): CdsEngineConfig {
    this.config = { ...this.config, ...partial, lastSyncedAt: new Date().toISOString() };
    this.emit({ type: 'engine.error', timestamp: new Date().toISOString(), payload: { action: 'config-update', config: this.config } });
    return { ...this.config };
  }

  getHooks(eventType?: CdsEventType, phase?: CdsHookPhase): CdsHook[] {
    let list = this.hooks.slice();
    if (eventType) list = list.filter((h) => h.eventType === eventType);
    if (phase) list = list.filter((h) => h.phase === phase);
    return list.sort((a, b) => b.priority - a.priority);
  }

  addHook(hook: Omit<CdsHook, 'id' | 'createdAt' | 'updatedAt'>): CdsHook {
    const now = new Date().toISOString();
    const fullHook: CdsHook = { ...hook, id: 'hk-' + Date.now(), createdAt: now, updatedAt: now };
    this.hooks.push(fullHook);
    return fullHook;
  }

  toggleHook(hookId: string, enabled: boolean): CdsHook | null {
    const hook = this.hooks.find((h) => h.id === hookId);
    if (!hook) return null;
    hook.enabled = enabled;
    hook.updatedAt = new Date().toISOString();
    return hook;
  }

  removeHook(hookId: string): boolean {
    const idx = this.hooks.findIndex((h) => h.id === hookId);
    if (idx < 0) return false;
    this.hooks.splice(idx, 1);
    return true;
  }

  subscribe(listener: CdsEngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: CdsEngineEvent): void {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        // 忽略监听器异常
      }
    }
  }

  async trigger(eventType: CdsEventType, context: Partial<CdsTriggerContext> = {}): Promise<CdsHookResult> {
    const start = Date.now();
    const fullContext: CdsTriggerContext = {
      eventType,
      timestamp: new Date().toISOString(),
      ...context,
    };
    const result: CdsHookResult = {
      ok: true,
      blocked: false,
      alerts: [],
      durationMs: 0,
      executedRules: [],
    };
    if (!this.config.enabled || !this.config.hooksEnabled) {
      result.durationMs = Date.now() - start;
      return result;
    }
    const hooks = this.getHooks(eventType);
    for (const hook of hooks) {
      if (!hook.enabled) continue;
      const hookAlerts = await this.runHook(hook, fullContext);
      result.alerts.push(...hookAlerts);
      result.executedRules.push(hook.id);
      if (hook.blocking && hookAlerts.some((a) => (a.severity === 'fatal' && this.config.blockingForFatal) || (a.severity === 'critical' && this.config.blockingForCritical))) {
        result.blocked = true;
      }
    }
    if (result.alerts.length > this.config.maxAlertsPerContext) {
      result.alerts = result.alerts.slice(0, this.config.maxAlertsPerContext);
    }
    for (const alert of result.alerts) {
      this.alertCenter.addAlert(alert);
    }
    result.durationMs = Date.now() - start;
    this.history.push({ eventType, timestamp: fullContext.timestamp, durationMs: result.durationMs, alertCount: result.alerts.length });
    this.emit({ type: 'trigger', timestamp: fullContext.timestamp, payload: { eventType, alertCount: result.alerts.length, blocked: result.blocked } });
    if (result.alerts.length > 0) this.emit({ type: 'alert.created', timestamp: new Date().toISOString(), payload: result.alerts });
    return result;
  }

  private async runHook(hook: CdsHook, context: CdsTriggerContext): Promise<CdsAlert[]> {
    const alerts: CdsAlert[] = [];
    if (hook.eventType === 'order.create' || hook.eventType === 'exam.schedule') {
      alerts.push(...this.contraRules.evaluate(context));
      alerts.push(...this.allergyRules.evaluate(context));
      alerts.push(...this.drugRules.evaluate(context));
    }
    if (hook.eventType === 'contrast.inject') {
      alerts.push(...this.contraRules.evaluate(context));
    }
    if (hook.eventType === 'dose.record' && context.doseRecord) {
      alerts.push(...this.doseRules.evaluate(context.doseRecord));
    }
    if (hook.eventType === 'report.submit' && context.report) {
      const complAlerts = this.completenessCheck(context.report);
      alerts.push(...complAlerts);
    }
    if (hook.eventType === 'pathway.activate' && context.pathway) {
      const pathwayAlerts = this.pathway.checkDeviation(context.pathway);
      alerts.push(...pathwayAlerts);
    }
    return alerts;
  }

  private completenessCheck(report: NonNullable<CdsTriggerContext['report']>): CdsAlert[] {
    const out: CdsAlert[] = [];
    if (report.findings.length < 80) {
      out.push({
        id: 'alert-' + Date.now() + '-compl-1',
        ruleId: 'compl-001',
        ruleName: '所见描述过短',
        category: 'completeness',
        severity: 'warning',
        status: 'active',
        title: '所见描述过短',
        message: '检查所见应包含部位/形态/大小/密度/信号/增强等关键要素,当前长度 ' + report.findings.length + ' 字符',
        reportId: report.id,
        triggeredAt: new Date().toISOString(),
        blocking: false,
        source: 'engine',
        recommendations: ['补充所见描述至 80 字符以上', '使用结构化模板'],
      });
    }
    if (report.impression.length < 30) {
      out.push({
        id: 'alert-' + Date.now() + '-compl-2',
        ruleId: 'compl-002',
        ruleName: '诊断印象过短',
        category: 'completeness',
        severity: 'warning',
        status: 'active',
        title: '诊断印象过短',
        message: '诊断印象应包含主要诊断和次要诊断,当前长度 ' + report.impression.length + ' 字符',
        reportId: report.id,
        triggeredAt: new Date().toISOString(),
        blocking: false,
        source: 'engine',
        recommendations: ['补充主要诊断和次要诊断'],
      });
    }
    if (!report.recommendation || report.recommendation.length < 10) {
      out.push({
        id: 'alert-' + Date.now() + '-compl-3',
        ruleId: 'compl-003',
        ruleName: '缺少随访建议',
        category: 'completeness',
        severity: 'notice',
        status: 'active',
        title: '缺少随访/复查建议',
        message: '建议在报告中包含随访或复查建议',
        reportId: report.id,
        triggeredAt: new Date().toISOString(),
        blocking: false,
        source: 'engine',
        recommendations: ['添加随访时间', '添加复查项目'],
      });
    }
    return out;
  }

  getAlerts(context: Partial<CdsTriggerContext>): CdsAlert[] {
    return this.alertCenter.query({
      patientId: context.patient?.id,
      examId: context.exam?.id,
      reportId: context.report?.id,
      status: 'active',
    });
  }

  dismissAlert(id: string, by: string, reason?: string): CdsAlert | null {
    return this.alertCenter.dismiss(id, by, reason);
  }

  acknowledgeAlert(id: string, by: string): CdsAlert | null {
    return this.alertCenter.acknowledge(id, by);
  }

  overrideAlert(id: string, by: string, reason: string): CdsAlert | null {
    return this.alertCenter.override(id, by, reason);
  }

  getAlertCenter(): AlertCenter {
    return this.alertCenter;
  }

  getContraindicationRules(): ContraindicationRules {
    return this.contraRules;
  }

  getDrugInteractionRules(): DrugInteractionRules {
    return this.drugRules;
  }

  getDoseCheckRules(): DoseCheckRules {
    return this.doseRules;
  }

  getAllergyCheck(): AllergyCheck {
    return this.allergyRules;
  }

  getPathwayEngine(): ClinicalPathway {
    return this.pathway;
  }

  getProtocolSelector(): ProtocolSelector {
    return this.protocolSelector;
  }

  getGuidelineEngine(): ClinicalGuidelines {
    return this.guidelines;
  }

  getAcrSelect(): ACRSelectIntegration {
    return this.acrSelect;
  }

  getHistory(limit = 100): { eventType: CdsEventType; timestamp: string; durationMs: number; alertCount: number }[] {
    return this.history.slice(-limit).reverse();
  }

  getStatistics(periodDays = 30): {
    totalTriggers: number;
    totalAlerts: number;
    averageDurationMs: number;
    blockedCount: number;
    categoryBreakdown: Record<CdsAlertCategory, number>;
    severityBreakdown: Record<CdsAlertSeverity, number>;
  } {
    const list = this.history.slice(-periodDays * 50);
    const totalTriggers = list.length;
    const totalAlerts = list.reduce((a, h) => a + h.alertCount, 0);
    const averageDurationMs = list.length > 0 ? Math.round(list.reduce((a, h) => a + h.durationMs, 0) / list.length) : 0;
    const allAlerts = this.alertCenter.getAll();
    const categoryBreakdown: Record<string, number> = {};
    const severityBreakdown: Record<string, number> = {};
    for (const a of allAlerts) {
      categoryBreakdown[a.category] = (categoryBreakdown[a.category] ?? 0) + 1;
      severityBreakdown[a.severity] = (severityBreakdown[a.severity] ?? 0) + 1;
    }
    const blockedCount = this.history.filter((h) => h.alertCount > 0).length;
    return {
      totalTriggers,
      totalAlerts,
      averageDurationMs,
      blockedCount,
      categoryBreakdown: categoryBreakdown as Record<CdsAlertCategory, number>,
      severityBreakdown: severityBreakdown as Record<CdsAlertSeverity, number>,
    };
  }
}

let _instance: CdsEngine | null = null;
export function getCdsEngine(): CdsEngine {
  if (!_instance) _instance = new CdsEngine();
  return _instance;
}

export function resetCdsEngine(): void {
  _instance = null;
}
