import type { ClinicalGuideline, CdsAlert, CdsTriggerContext } from '../../../types/cds';
import { CLINICAL_GUIDELINES } from '../../../data/cds/guidelines';

export class ClinicalGuidelines {
  private guidelines: ClinicalGuideline[] = CLINICAL_GUIDELINES;

  getAll(): ClinicalGuideline[] {
    return this.guidelines;
  }

  getById(id: string): ClinicalGuideline | null {
    return this.guidelines.find((g) => g.id === id) ?? null;
  }

  getByCategory(category: string): ClinicalGuideline[] {
    return this.guidelines.filter((g) => g.category === category);
  }

  getByModality(modality: string): ClinicalGuideline[] {
    return this.guidelines.filter((g) => g.modality === modality);
  }

  getByBodyPart(bodyPart: string): ClinicalGuideline[] {
    return this.guidelines.filter((g) => g.bodyPart === bodyPart);
  }

  search(query: string): ClinicalGuideline[] {
    const q = query.toLowerCase();
    return this.guidelines.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.shortName.toLowerCase().includes(q) ||
        g.condition?.toLowerCase().includes(q) ||
        g.organization.toLowerCase().includes(q),
    );
  }

  getRecommendations(context: CdsTriggerContext): CdsAlert[] {
    const out: CdsAlert[] = [];
    const exam = context.exam;
    if (!exam) return out;
    const matched = this.guidelines.filter(
      (g) => (!g.modality || g.modality === exam.modality) && (!g.bodyPart || g.bodyPart === exam.bodyPart),
    );
    for (const g of matched) {
      out.push({
        id: 'alert-' + Date.now().toString(36) + '-guide-' + g.id,
        ruleId: g.id,
        ruleName: g.shortName,
        category: 'guideline_recommendation',
        severity: g.evidenceLevel === 'A' ? 'warning' : 'notice',
        status: 'active',
        title: g.shortName,
        message: g.abstract,
        patientId: context.patient?.id,
        examId: context.exam?.id,
        triggeredAt: new Date().toISOString(),
        blocking: false,
        source: 'guideline',
        recommendations: g.recommendations.map((r) => r.text),
        evidence: g.keyPoints.map((kp) => ({ type: 'reference', label: kp.text, value: kp.level, flag: 'normal' })),
        references: g.references.map((r) => ({ source: g.organization, title: r })),
        metadata: { category: g.category, evidenceLevel: g.evidenceLevel, publicationYear: g.publicationYear },
      });
    }
    return out;
  }

  getCount(): number {
    return this.guidelines.length;
  }
}

let _instance: ClinicalGuidelines | null = null;
export function getClinicalGuidelines(): ClinicalGuidelines {
  if (!_instance) _instance = new ClinicalGuidelines();
  return _instance;
}
