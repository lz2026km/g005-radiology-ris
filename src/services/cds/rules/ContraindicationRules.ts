/**
 * G005 RIS v3.0.6.6 - CDS Contraindication Rules
 *
 * 40 点 - 52 条禁忌症规则评估引擎
 */
import type {
  CdsAlert,
  CdsAlertSeverity,
  CdsTriggerContext,
  ContraindicationRule,
  ContraCondition,
} from '../../../types/cds';
import { CONTRAINDICATIONS } from '../../../data/cds/contraindications';

const SEVERITY_MAP: Record<ContraindicationRule['severity'], CdsAlertSeverity> = {
  absolute: 'fatal',
  relative: 'high',
  conditional: 'warning',
  caution: 'notice',
};

const FIELD_VALUE_GETTERS: Record<string, (ctx: CdsTriggerContext) => unknown> = {
  'egfr': (ctx) => ctx.patient?.egfr,
  'pregnancyWeeks': (ctx) => ctx.patient?.pregnancyWeeks,
  'allergyHistory.iodinated': (ctx) => ctx.patient?.contrastAllergy,
  'allergyHistory.gadolinium': (ctx) => ctx.patient?.allergies?.find((a) => /钆|gadolinium/i.test(a)),
  'allergyHistory.gadolinium_count': (ctx) => (ctx.patient?.allergies ?? []).filter((a) => /钆|gadolinium/i.test(a)).length,
  'allergyHistory.shellfish': (ctx) => ctx.patient?.shellfishAllergy,
  'allergyHistory.ironOxide': (ctx) => ctx.patient?.allergies?.find((a) => /铁|iron/i.test(a)),
  'allergyHistory.drug': (ctx) => ctx.patient?.allergies?.length,
  'asthmaHistory': (ctx) => ctx.patient?.asthmaHistory,
  'heartFailure': (ctx) => ctx.patient?.heartFailure,
  'aki': (ctx) => ctx.patient?.diagnoses?.includes('aki'),
  'dialysis': (ctx) => ctx.patient?.diagnoses?.includes('dialysis'),
  'lactation': (ctx) => ctx.patient?.diagnoses?.includes('lactation'),
  'diabetesMellitus': (ctx) => ctx.patient?.diabetesMellitus,
  'renalFailure': (ctx) => ctx.patient?.renalFailure,
  'pacemaker': (ctx) => ctx.patient?.pacemaker,
  'icd': (ctx) => ctx.patient?.diagnoses?.includes('icd_implanted'),
  'aneurysmClip': (ctx) => ctx.patient?.aneurysmClip,
  'cochlearImplant': (ctx) => ctx.patient?.cochlearImplant,
  'metallicForeignBody.eye': (ctx) => ctx.patient?.metallicForeignBody,
  'vascularClip': (ctx) => ctx.patient?.diagnoses?.includes('vascular_clip'),
  'pump': (ctx) => ctx.patient?.diagnoses?.includes('drug_pump'),
  'claustrophobia': (ctx) => ctx.patient?.claustrophobia,
  'cooperation': (ctx) => ctx.patient?.diagnoses?.includes('uncooperative'),
  'contrastName': (ctx) => ctx.exam?.contrastName,
  'modality': (ctx) => ctx.exam?.modality,
  'age': (ctx) => ctx.patient?.age,
  'ageMonths': (ctx) => (ctx.patient?.age ?? 0) * 12,
  'hydration': (ctx) => ctx.patient?.diagnoses?.includes('dehydrated'),
  'history': (ctx) => ctx.patient?.diagnoses,
  'tattoo.large': (ctx) => ctx.patient?.diagnoses?.includes('large_tattoo'),
  'implant.conditional': (ctx) => ctx.patient?.diagnoses?.includes('implant_unverified'),
  'implant.orthopedic': (ctx) => ctx.patient?.diagnoses?.includes('titanium_implant'),
  'medications': (ctx) => ctx.patient?.medications,
  'diagnoses': (ctx) => ctx.patient?.diagnoses,
  'radioiodine_planned.within_months': (ctx) => ctx.patient?.diagnoses?.includes('radioiodine_planned') ? 1 : 99,
  'radionuclide_therapy.days_ago': (ctx) => ctx.patient?.diagnoses?.includes('radionuclide_therapy_recent') ? 30 : 999,
  'ctCount30d': (ctx) => ctx.metadata?.['ctCount30d'] as number,
  'ctPhases': (ctx) => ctx.metadata?.['ctPhases'] as number,
  'ct_repeat.bodyPart.hours': (ctx) => ctx.metadata?.['ct_repeat_hours'] as number,
  'last_barium.days_ago': (ctx) => ctx.metadata?.['last_barium_days'] as number,
};

function evaluateCondition(cond: ContraCondition, ctx: CdsTriggerContext): boolean {
  const getter = FIELD_VALUE_GETTERS[cond.field];
  if (!getter) return false;
  const val = getter(ctx);
  switch (cond.operator) {
    case 'eq': return val === cond.value;
    case 'ne': return val !== cond.value;
    case 'gt': return typeof val === 'number' && typeof cond.value === 'number' && val > cond.value;
    case 'gte': return typeof val === 'number' && typeof cond.value === 'number' && val >= cond.value;
    case 'lt': return typeof val === 'number' && typeof cond.value === 'number' && val < cond.value;
    case 'lte': return typeof val === 'number' && typeof cond.value === 'number' && val <= cond.value;
    case 'in': return Array.isArray(cond.value) && (cond.value as unknown[]).includes(val);
    case 'nin': return Array.isArray(cond.value) && !(cond.value as unknown[]).includes(val);
    case 'exists': return val !== undefined && val !== null;
    case 'contains': {
      if (Array.isArray(val)) return val.includes(cond.value as string);
      if (typeof val === 'string') return val.includes(cond.value as string);
      return false;
    }
    default:
      return false;
  }
}

export class ContraindicationRules {
  private rules: ContraindicationRule[] = CONTRAINDICATIONS;

  getRules(): ContraindicationRule[] {
    return this.rules;
  }

  getRulesByAgent(agent: string): ContraindicationRule[] {
    return this.rules.filter((r) => r.agent === agent);
  }

  getRulesByType(type: ContraindicationRule['type']): ContraindicationRule[] {
    return this.rules.filter((r) => r.type === type);
  }

  searchRules(query: string): ContraindicationRule[] {
    const q = query.toLowerCase();
    return this.rules.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.nameEn.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.id ?? '').toLowerCase().includes(q),
    );
  }

  evaluate(context: CdsTriggerContext): CdsAlert[] {
    const out: CdsAlert[] = [];
    const exam = context.exam;
    if (!exam) return out;
    for (const rule of this.rules) {
      if (!this.applies(rule, exam)) continue;
      const matched = rule.conditions.every((c) => evaluateCondition(c, context));
      if (!matched) continue;
      out.push(this.toAlert(rule, context));
    }
    return out;
  }

  evaluateSingle(ruleId: string, context: CdsTriggerContext): CdsAlert | null {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (!rule) return null;
    const matched = rule.conditions.every((c) => evaluateCondition(c, context));
    if (!matched) return null;
    return this.toAlert(rule, context);
  }

  private applies(rule: ContraindicationRule, exam: NonNullable<CdsTriggerContext['exam']>): boolean {
    if (rule.modality && rule.modality !== exam.modality) return false;
    if (rule.agent === 'iodinated' && !exam.contrastPlanned) return false;
    if (rule.agent === 'gadolinium' && !exam.contrastPlanned) return false;
    return true;
  }

  private toAlert(rule: ContraindicationRule, context: CdsTriggerContext): CdsAlert {
    const severity = SEVERITY_MAP[rule.type];
    const blocking = rule.type === 'absolute';
    return {
      id: 'alert-' + Date.now().toString(36) + '-' + rule.id,
      ruleId: rule.id,
      ruleName: rule.name,
      category: 'contraindication',
      severity,
      status: 'active',
      title: rule.name,
      message: rule.description + ' | 建议: ' + rule.action,
      patientId: context.patient?.id,
      patientName: context.patient?.name,
      examId: context.exam?.id,
      triggeredAt: new Date().toISOString(),
      blocking,
      source: 'rule',
      recommendations: [rule.action, ...(rule.alternatives ?? [])],
      references: rule.references?.map((r) => ({ source: 'Guideline', title: r })),
      evidence: rule.conditions.map((c) => ({
        type: 'history',
        label: c.field,
        value: String(c.value),
        flag: 'normal',
      })),
      metadata: { agent: rule.agent, type: rule.type, evidenceLevel: rule.evidenceLevel, population: rule.population },
    };
  }

  getTotalRules(): number {
    return this.rules.length;
  }
}

let _instance: ContraindicationRules | null = null;
export function getContraindicationRules(): ContraindicationRules {
  if (!_instance) _instance = new ContraindicationRules();
  return _instance;
}
