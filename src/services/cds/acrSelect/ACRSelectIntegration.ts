import type { AcrSelectDocument, AcrSelectResponse, AcrSelectVariant, CdsTriggerContext } from '../../../types/cds';

const MOCK_DOCUMENTS: AcrSelectDocument[] = [
  { id: 'acr-001', title: 'ACR Appropriateness Criteria: Headache', variantCount: 6, variants: [
    { id: 'acr-v-001', examName: 'CT Head without IV Contrast', examCode: '70450', modality: 'CT', bodyPart: '头颅', rating: 'usually_appropriate', appropriatenessScore: 8, radiationLevel: 'medium', costLevel: 'low', contrast: 'without', comments: 'Initial imaging for non-acute headache', references: ['ACR AC Headache 2023'], category: 'CT' },
    { id: 'acr-v-002', examName: 'MRI Brain without IV Contrast', examCode: '70551', modality: 'MR', bodyPart: '头颅', rating: 'may_be_appropriate', appropriatenessScore: 5, radiationLevel: 'none', costLevel: 'medium', contrast: 'without', comments: 'When CT negative or equivocal', references: ['ACR AC Headache 2023'], category: 'MR' },
  ], lastUpdated: '2025-01-15', organization: 'ACR', version: '2023' },
  { id: 'acr-002', title: 'ACR Appropriateness Criteria: Chest Pain', variantCount: 8, variants: [
    { id: 'acr-v-003', examName: 'Chest X-ray', examCode: '71045', modality: 'CT', bodyPart: '胸部', rating: 'usually_appropriate', appropriatenessScore: 7, radiationLevel: 'low', costLevel: 'low', contrast: 'without', comments: 'Initial evaluation', references: ['ACR AC Chest Pain 2022'], category: 'XR' },
    { id: 'acr-v-004', examName: 'CT Coronary Angiography', examCode: '75574', modality: 'CT', bodyPart: '心脏', rating: 'usually_appropriate', appropriatenessScore: 8, radiationLevel: 'medium', costLevel: 'high', contrast: 'with_contrast', comments: 'For intermediate risk patients', references: ['ACR AC Chest Pain 2022'], category: 'CT' },
  ], lastUpdated: '2025-02-10', organization: 'ACR', version: '2022' },
  { id: 'acr-003', title: 'ACR Appropriateness Criteria: Acute Stroke', variantCount: 7, variants: [
    { id: 'acr-v-005', examName: 'CT Head without IV Contrast', examCode: '70450', modality: 'CT', bodyPart: '头颅', rating: 'usually_appropriate', appropriatenessScore: 9, radiationLevel: 'medium', costLevel: 'low', contrast: 'without', comments: 'First-line for acute stroke', references: ['ACR AC Stroke 2024'], category: 'CT' },
    { id: 'acr-v-006', examName: 'CT Perfusion', examCode: '0042T', modality: 'CT', bodyPart: '头颅', rating: 'does_not_apply', appropriatenessScore: 0, radiationLevel: 'medium', costLevel: 'medium', contrast: 'with_contrast', comments: 'For extended window patients', references: ['ACR AC Stroke 2024'], category: 'CT' },
  ], lastUpdated: '2025-03-01', organization: 'ACR', version: '2024' },
];

export class ACRSelectIntegration {
  private documents: AcrSelectDocument[] = MOCK_DOCUMENTS;

  getDocuments(): AcrSelectDocument[] {
    return this.documents;
  }

  getDocument(id: string): AcrSelectDocument | null {
    return this.documents.find((d) => d.id === id) ?? null;
  }

  search(query: string): AcrSelectDocument[] {
    const q = query.toLowerCase();
    return this.documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.variants.some((v) => v.examName.toLowerCase().includes(q)),
    );
  }

  findMatching(bodyPart: string, modality: string, indication: string): AcrSelectResponse {
    const matched: AcrSelectVariant[] = [];
    for (const doc of this.documents) {
      for (const v of doc.variants) {
        if (v.bodyPart === bodyPart || v.modality === modality) {
          matched.push(v);
        }
      }
    }
    const top = matched.filter((v) => v.rating === 'usually_appropriate').slice(0, 1);
    const alternatives = matched.filter((v) => v.rating !== 'usually_appropriate').slice(0, 5);
    return {
      matchedVariant: top[0],
      alternatives,
      indications: [indication],
      documentId: matched[0] ? this.documents.find((d) => d.variants.includes(matched[0]!))?.id : undefined,
      confidence: top.length > 0 ? 0.85 : 0.4,
    };
  }

  evaluate(context: CdsTriggerContext): AcrSelectResponse[] {
    const results: AcrSelectResponse[] = [];
    const exam = context.exam;
    if (!exam) return results;
    const indication = context.order?.indication ?? '';
    results.push(this.findMatching(exam.bodyPart, exam.modality, indication));
    return results;
  }

  getTotalDocuments(): number {
    return this.documents.length;
  }
}

let _instance: ACRSelectIntegration | null = null;
export function getAcrSelectIntegration(): ACRSelectIntegration {
  if (!_instance) _instance = new ACRSelectIntegration();
  return _instance;
}
