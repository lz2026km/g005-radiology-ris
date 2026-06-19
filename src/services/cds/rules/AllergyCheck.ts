/**
 * G005 RIS v3.0.6.6 - CDS Allergy Check
 *
 * 30 点 - 患者过敏检查 + 交叉反应 + 预处理建议
 */
import type {
  AllergyCheckResult,
  AllergySeverity,
  AllergyType,
  CdsAlert,
  CdsTriggerContext,
  PatientAllergy,
} from '../../../types/cds';

const SEVERITY_TO_ALERT: Record<AllergySeverity, CdsAlert['severity']> = {
  mild: 'notice',
  moderate: 'warning',
  severe: 'high',
  life_threatening: 'fatal',
};

const RISK_TO_ALERT: Record<AllergyCheckResult['riskLevel'], CdsAlert['severity']> = {
  none: 'info',
  low: 'notice',
  moderate: 'warning',
  high: 'high',
  absolute: 'fatal',
};

const CROSS_REACTIVITY: Record<string, { agents: string[]; label: string }[]> = {
  碘: [
    { agents: ['碘海醇', '碘克沙醇', '碘帕醇', '碘普罗胺', '碘美普尔'], label: '碘对比剂类' },
  ],
  iodine: [
    { agents: ['iohexol', 'iodixanol', 'iopamidol', 'iopromide'], label: 'Iodinated contrast' },
  ],
  钆: [
    { agents: ['钆喷酸葡胺', '钆布醇', '钆特醇', '钆塞酸二钠', '钆贝酸二葡甲胺'], label: '钆对比剂类' },
  ],
  gadolinium: [
    { agents: ['gadopentetate', 'gadobutrol', 'gadoteridol', 'gadoxetate', 'gadobenate'], label: 'GBCA' },
  ],
  海鲜: [
    { agents: ['碘'], label: '海鲜-碘(实际无显著交叉)' },
  ],
  shellfish: [
    { agents: ['iodine'], label: 'Shellfish-iodine (no significant cross-reactivity)' },
  ],
  latex: [
    { agents: ['乳胶手套', '乳胶导尿管'], label: '乳胶制品' },
  ],
};

const PREMEDICATION_REGIMENS: { severity: AllergySeverity; drugs: string[]; timing: string }[] = [
  { severity: 'mild', drugs: ['苯海拉明 25-50mg po'], timing: '检查前 1h' },
  { severity: 'moderate', drugs: ['泼尼松 50mg po', '苯海拉明 50mg po'], timing: '检查前 13h/7h/1h' },
  { severity: 'severe', drugs: ['泼尼松 50mg po', '苯海拉明 50mg iv', '雷尼替丁 50mg iv'], timing: '检查前 13h/7h/1h' },
  { severity: 'life_threatening', drugs: ['泼尼松 50mg po', '苯海拉明 50mg iv', '雷尼替丁 50mg iv', '备肾上腺素'], timing: '检查前 13h/7h/1h + 抢救准备' },
];

export class AllergyCheck {
  private patientAllergies: PatientAllergy[] = [];

  registerPatientAllergy(allergy: PatientAllergy): PatientAllergy {
    this.patientAllergies.push(allergy);
    return allergy;
  }

  getPatientAllergies(patientId: string): PatientAllergy[] {
    return this.patientAllergies.filter((a) => a.patientId === patientId);
  }

  evaluate(context: CdsTriggerContext): CdsAlert[] {
    const patient = context.patient;
    if (!patient) return [];
    const contrastName = context.exam?.contrastName ?? '';
    if (!contrastName && !patient.allergies?.length) return [];
    const out: CdsAlert[] = [];
    const allergies = patient.allergies ?? [];
    for (const allergen of allergies) {
      const check = this.checkAllergen(allergen, contrastName);
      if (check.riskLevel !== 'none' && check.riskLevel !== 'low') {
        out.push(this.toAlert(check, context, allergen));
      }
    }
    if (contrastName) {
      const directCheck = this.checkAllergen(contrastName, contrastName);
      if (directCheck.riskLevel !== 'none') {
        out.push(this.toAlert(directCheck, context, contrastName));
      }
    }
    return out;
  }

  checkAllergen(allergen: string, contrastName: string): AllergyCheckResult {
    const result: AllergyCheckResult = {
      patientId: '',
      agent: contrastName || allergen,
      agentType: 'drug',
      severity: 'none',
      riskLevel: 'none',
      recommendation: '可使用',
    };
    if (!contrastName) return result;
    const allergenLow = allergen.toLowerCase();
    const contrastLow = contrastName.toLowerCase();
    if (contrastLow.includes(allergenLow) || allergenLow.includes(contrastLow)) {
      result.riskLevel = 'absolute';
      result.severity = 'fatal';
      result.recommendation = '禁用 ' + contrastName + ',存在直接过敏史';
      result.requiresSkinTest = true;
      result.alternatives = this.findAlternatives(allergen);
      return result;
    }
    const crossGroups = CROSS_REACTIVITY[allergen] ?? CROSS_REACTIVITY[allergenLow];
    if (crossGroups) {
      for (const group of crossGroups) {
        if (group.agents.some((a) => contrastLow.includes(a.toLowerCase()) || a.toLowerCase().includes(contrastLow))) {
          result.crossReactiveAgents = group.agents;
          if (group.label.includes('实际无显著')) {
            result.riskLevel = 'low';
            result.severity = 'info';
            result.recommendation = '可正常使用(无显著交叉反应)';
          } else {
            result.riskLevel = 'high';
            result.severity = 'high';
            result.recommendation = '高交叉风险,建议换用其他类型或预处理';
            result.requiresSkinTest = true;
            result.premedication = this.recommendPremedication('severe').drugs;
          }
          return result;
        }
      }
    }
    if (this.sharesClass(allergen, contrastName)) {
      result.riskLevel = 'moderate';
      result.severity = 'warning';
      result.recommendation = '同类药物,可能存在交叉,建议预处理';
      result.premedication = this.recommendPremedication('moderate').drugs;
    }
    return result;
  }

  private sharesClass(a: string, b: string): boolean {
    const aLow = a.toLowerCase();
    const bLow = b.toLowerCase();
    if ((aLow.includes('penicillin') || aLow.includes('青霉素')) && (bLow.includes('penicillin') || bLow.includes('青霉素'))) return true;
    if ((aLow.includes('cephalosporin') || aLow.includes('头孢')) && (bLow.includes('cephalosporin') || bLow.includes('头孢'))) return true;
    if ((aLow.includes('sulfa') || aLow.includes('磺胺')) && (bLow.includes('sulfa') || bLow.includes('磺胺'))) return true;
    return false;
  }

  private findAlternatives(_allergen: string): string[] {
    return ['更换其他类型对比剂', '改用 MR 平扫', '改用 US', '无对比剂 CTA'];
  }

  recommendPremedication(severity: AllergySeverity): { drugs: string[]; timing: string } {
    return PREMEDICATION_REGIMENS.find((r) => r.severity === severity) ?? PREMEDICATION_REGIMENS[1]!;
  }

  private toAlert(check: AllergyCheckResult, context: CdsTriggerContext, allergen: string): CdsAlert {
    return {
      id: 'alert-' + Date.now().toString(36) + '-allergy-' + allergen,
      ruleId: 'allergy-' + allergen.toLowerCase().replace(/\s+/g, '-'),
      ruleName: '过敏风险: ' + allergen,
      category: 'allergy',
      severity: RISK_TO_ALERT[check.riskLevel],
      status: 'active',
      title: '患者对 ' + allergen + ' 存在过敏风险',
      message: check.recommendation + (check.crossReactiveAgents ? ' | 交叉反应: ' + check.crossReactiveAgents.join(', ') : ''),
      patientId: context.patient?.id,
      patientName: context.patient?.name,
      examId: context.exam?.id,
      triggeredAt: new Date().toISOString(),
      blocking: check.riskLevel === 'absolute',
      source: 'rule',
      recommendations: [check.recommendation, ...(check.premedication ? ['预处理: ' + check.premedication.join(' + ')] : []), ...(check.alternatives ?? [])],
      evidence: [
        { type: 'allergy', label: '过敏原', value: allergen, flag: 'high' },
        { type: 'allergy', label: '风险等级', value: check.riskLevel },
      ],
      metadata: { agent: check.agent, agentType: check.agentType, riskLevel: check.riskLevel, requiresSkinTest: check.requiresSkinTest },
    };
  }

  getAllergensCount(): number {
    return Array.from(new Set(this.patientAllergies.map((a) => a.allergen))).length;
  }

  static severityFromString(s: string): AllergySeverity {
    if (s === 'mild') return 'mild';
    if (s === 'moderate') return 'moderate';
    if (s === 'severe') return 'severe';
    if (s === 'life_threatening' || s === 'anaphylaxis') return 'life_threatening';
    return 'mild';
  }
}

let _instance: AllergyCheck | null = null;
export function getAllergyCheck(): AllergyCheck {
  if (!_instance) _instance = new AllergyCheck();
  return _instance;
}

export const ALLERGY_TYPES: AllergyType[] = ['drug', 'food', 'environmental', 'latex', 'contrast', 'shellfish', 'iodine', 'gadolinium', 'other'];
export const ALLERGY_SEVERITIES: AllergySeverity[] = ['mild', 'moderate', 'severe', 'life_threatening'];
