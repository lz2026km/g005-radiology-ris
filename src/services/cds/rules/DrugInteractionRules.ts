/**
 * G005 RIS v3.0.6.6 - CDS Drug Interaction Rules
 *
 * 40 点 - 32 条药物交互规则评估
 */
import type {
  CdsAlert,
  CdsTriggerContext,
  DrugInteraction,
  InteractionSeverity,
} from '../../../types/cds';
import { DRUG_INTERACTIONS } from '../../../data/cds/drugInteractions';

const SEVERITY_MAP: Record<InteractionSeverity, CdsAlert['severity']> = {
  contraindicated: 'fatal',
  major: 'high',
  moderate: 'warning',
  minor: 'info',
};

export class DrugInteractionRules {
  private interactions: DrugInteraction[] = DRUG_INTERACTIONS;

  getInteractions(): DrugInteraction[] {
    return this.interactions;
  }

  getByDrug(drug: string): DrugInteraction[] {
    const q = drug.toLowerCase();
    return this.interactions.filter(
      (i) => i.drugA.toLowerCase().includes(q) || i.drugB.toLowerCase().includes(q) || (i.drugC ?? '').toLowerCase().includes(q),
    );
  }

  getBySeverity(severity: InteractionSeverity): DrugInteraction[] {
    return this.interactions.filter((i) => i.severity === severity);
  }

  search(query: string): DrugInteraction[] {
    const q = query.toLowerCase();
    return this.interactions.filter(
      (i) =>
        i.drugA.toLowerCase().includes(q) ||
        i.drugB.toLowerCase().includes(q) ||
        i.mechanism.toLowerCase().includes(q) ||
        i.clinicalEffect.toLowerCase().includes(q) ||
        (i.id ?? '').toLowerCase().includes(q),
    );
  }

  evaluate(context: CdsTriggerContext): CdsAlert[] {
    const patientMeds = context.patient?.medications ?? [];
    const contrastName = context.exam?.contrastName;
    if (patientMeds.length === 0 && !contrastName) return [];
    const out: CdsAlert[] = [];
    for (const di of this.interactions) {
      const matched = this.matchInteraction(di, patientMeds, contrastName);
      if (!matched) continue;
      out.push(this.toAlert(di, context, matched));
    }
    return out;
  }

  evaluateDrugPair(drugA: string, drugB: string, context: CdsTriggerContext): CdsAlert | null {
    const found = this.interactions.find(
      (i) => (i.drugA === drugA && i.drugB === drugB) || (i.drugA === drugB && i.drugB === drugA),
    );
    if (!found) return null;
    return this.toAlert(found, context, [drugA, drugB]);
  }

  private matchInteraction(di: DrugInteraction, meds: string[], contrastName?: string): string[] | null {
    const matched: string[] = [];
    const medLower = meds.map((m) => m.toLowerCase());
    if (contrastName) {
      const cLow = contrastName.toLowerCase();
      if (di.drugB.toLowerCase().includes(cLow) || cLow.includes(di.drugB.toLowerCase())) matched.push(contrastName);
      if (di.drugA.toLowerCase().includes(cLow) || cLow.includes(di.drugA.toLowerCase())) matched.push(contrastName);
    }
    for (const m of meds) {
      const mLow = m.toLowerCase();
      if (di.drugA.toLowerCase().includes(mLow) || mLow.includes(di.drugA.toLowerCase())) {
        if (!matched.includes(m)) matched.push(m);
      }
      if (di.drugB.toLowerCase().includes(mLow) || mLow.includes(di.drugB.toLowerCase())) {
        if (!matched.includes(m)) matched.push(m);
      }
    }
    return matched.length >= 2 ? matched : null;
  }

  private toAlert(di: DrugInteraction, context: CdsTriggerContext, matched: string[]): CdsAlert {
    const severity = SEVERITY_MAP[di.severity];
    const blocking = di.severity === 'contraindicated';
    return {
      id: 'alert-' + Date.now().toString(36) + '-' + di.id,
      ruleId: di.id,
      ruleName: di.drugA + ' × ' + di.drugB,
      category: 'drug_interaction',
      severity,
      status: 'active',
      title: di.drugA + ' 与 ' + di.drugB + ' 存在 ' + this.severityLabel(di.severity),
      message: di.clinicalEffect + ' | 机制: ' + di.mechanism,
      patientId: context.patient?.id,
      patientName: context.patient?.name,
      examId: context.exam?.id,
      triggeredAt: new Date().toISOString(),
      blocking,
      source: 'rule',
      recommendations: [di.recommendation, ...(di.alternatives ?? [])],
      references: di.references,
      evidence: [
        { type: 'medication', label: di.drugA, value: matched[0] ?? di.drugA },
        { type: 'medication', label: di.drugB, value: matched[1] ?? di.drugB },
        { type: 'reference', label: '证据等级', value: di.evidenceLevel },
      ],
      metadata: {
        severity: di.severity,
        documentation: di.documentation,
        evidenceLevel: di.evidenceLevel,
        onsetTime: di.onsetTime,
        monitoring: di.monitoring,
        management: di.management,
      },
    };
  }

  private severityLabel(s: InteractionSeverity): string {
    return s === 'contraindicated' ? '禁忌联用' : s === 'major' ? '严重交互' : s === 'moderate' ? '中度交互' : '轻度交互';
  }

  getTotal(): number {
    return this.interactions.length;
  }
}

let _instance: DrugInteractionRules | null = null;
export function getDrugInteractionRules(): DrugInteractionRules {
  if (!_instance) _instance = new DrugInteractionRules();
  return _instance;
}
