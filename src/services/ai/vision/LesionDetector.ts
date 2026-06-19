/**
 * G005 放射RIS系统 v3.0.6.5 - 病灶检测服务 (全 mock)
 * A5-AI-ORCH / 100 点
 *
 * 5 类病灶：nodule / mass / calcification / hemorrhage / fracture
 * 输出 bbox + 置信度 + DICOM SR reference
 */

import type {
  AIStudyDetection,
  AIDetectedFinding,
  AIAlgorithm,
} from '../../../types/ai/orchestrator';
import { AI_MARKETPLACE_ALGORITHMS } from '../../../data/aiMarketplace';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const MOCK_LESION_TEMPLATES: Record<string, Omit<AIDetectedFinding, 'id' | 'bbox' | 'confidence'>[]> = {
  nodule: [
    { type: 'nodule', label: '磨玻璃结节 GGN', location: '右肺上叶尖后段', diameterMm: 8.2, measurements: [{ type: 'length', value: 8.2, unit: 'mm' }, { type: 'density', value: -620, unit: 'HU' }] },
    { type: 'nodule', label: '实性结节', location: '左肺下叶背段', diameterMm: 5.4, measurements: [{ type: 'length', value: 5.4, unit: 'mm' }, { type: 'density', value: 35, unit: 'HU' }] },
  ],
  mass: [
    { type: 'mass', label: '肿块', location: '右肺上叶前段', diameterMm: 32, measurements: [{ type: 'length', value: 32, unit: 'mm' }, { type: 'volume', value: 18.6, unit: 'mL' }] },
  ],
  calcification: [
    { type: 'calcification', label: '簇状钙化', location: '左乳外上象限', diameterMm: 12, measurements: [{ type: 'length', value: 12, unit: 'mm' }] },
  ],
  hemorrhage: [
    { type: 'hemorrhage', label: '脑内血肿', location: '右侧基底节区', diameterMm: 22, measurements: [{ type: 'length', value: 22, unit: 'mm' }, { type: 'volume', value: 8.5, unit: 'mL' }] },
  ],
  fracture: [
    { type: 'fracture', label: '肋骨骨折', location: '右侧第6肋', diameterMm: 0, measurements: [{ type: 'length', value: 5, unit: 'mm' }] },
  ],
  consolidation: [
    { type: 'consolidation', label: '实变影', location: '右肺中叶', diameterMm: 45, measurements: [{ type: 'area', value: 18.2, unit: 'cm²' }] },
  ],
  effusion: [
    { type: 'effusion', label: '胸腔积液', location: '右侧胸腔', diameterMm: 0, measurements: [{ type: 'volume', value: 480, unit: 'mL' }] },
  ],
  infarct: [
    { type: 'infarct', label: '急性脑梗死', location: '左侧颞叶', diameterMm: 18, measurements: [{ type: 'area', value: 4.5, unit: 'cm²' }] },
  ],
};

const SR_CONCEPT_CODES: Record<string, { code: string; scheme: string }> = {
  nodule: { code: 'RID4658', scheme: 'RadLex' },
  mass: { code: 'RID3874', scheme: 'RadLex' },
  calcification: { code: 'RID5193', scheme: 'RadLex' },
  hemorrhage: { code: 'RID4995', scheme: 'RadLex' },
  fracture: { code: 'RID5260', scheme: 'RadLex' },
  consolidation: { code: 'RID5707', scheme: 'RadLex' },
  effusion: { code: 'RID5664', scheme: 'RadLex' },
  infarct: { code: 'RID4657', scheme: 'RadLex' },
};

export interface DetectParams {
  studyId: string;
  modality: string;
  bodyPart: string;
  algorithmId?: string;
  sopInstanceUid?: string;
  seriesNumber?: number;
  instanceNumber?: number;
}

export class LesionDetector {
  private algorithms: AIAlgorithm[];

  constructor(algorithms: AIAlgorithm[] = AI_MARKETPLACE_ALGORITHMS) {
    this.algorithms = algorithms;
  }

  getDetectionAlgorithms(modality: string, bodyPart: string): AIAlgorithm[] {
    return this.algorithms.filter(
      (a) => a.type === 'detection' && a.modality.includes(modality) && a.bodyParts.some((b) => bodyPart.includes(b) || b.includes(bodyPart)),
    );
  }

  async detect(params: DetectParams): Promise<AIStudyDetection> {
    const start = Date.now();
    await delay(400 + Math.random() * 600);

    const algo = this.resolveAlgorithm(params);
    const findings: AIDetectedFinding[] = [];
    const lesionTypes = (algo?.tags ?? []).filter((t) => t in MOCK_LESION_TEMPLATES);
    const targetTypes = lesionTypes.length > 0 ? lesionTypes : this.guessLesionTypes(params);

    for (const t of targetTypes.slice(0, 3)) {
      const templates = MOCK_LESION_TEMPLATES[t];
      if (!templates) continue;
      for (const tpl of templates) {
        if (Math.random() < 0.6) {
          const concept = SR_CONCEPT_CODES[tpl.type] ?? { code: 'RID0', scheme: 'RadLex' };
          findings.push({
            ...tpl,
            id: uuid('f'),
            bbox: {
              x: 100 + Math.random() * 300,
              y: 100 + Math.random() * 300,
              width: 30 + Math.random() * 80,
              height: 30 + Math.random() * 80,
            },
            confidence: 0.7 + Math.random() * 0.28,
            sopInstanceUid: params.sopInstanceUid ?? `sop-${uuid('s')}`,
            seriesNumber: params.seriesNumber ?? 1,
            instanceNumber: params.instanceNumber ?? Math.floor(Math.random() * 200) + 1,
            srReference: { srUid: `sr-${uuid('sr')}`, conceptCode: concept.code, codingScheme: concept.scheme },
          });
        }
      }
    }

    if (findings.length === 0) {
      findings.push(this.synthesizeFinding(params));
    }

    return {
      id: uuid('det'),
      studyId: params.studyId,
      algorithmId: algo?.id ?? 'algo-report-draft',
      algorithmName: algo?.name ?? 'Generic Detector',
      modality: params.modality,
      bodyPart: params.bodyPart,
      findings,
      totalFindings: findings.length,
      reviewed: false,
      generatedAt: new Date().toISOString(),
      processingMs: Date.now() - start,
    };
  }

  async detectAndGroup(params: DetectParams): Promise<Record<string, AIDetectedFinding[]>> {
    const det = await this.detect(params);
    const grouped: Record<string, AIDetectedFinding[]> = {};
    for (const f of det.findings) {
      grouped[f.type] = grouped[f.type] ?? [];
      grouped[f.type]!.push(f);
    }
    return grouped;
  }

  async getTopFinding(params: DetectParams): Promise<AIDetectedFinding | null> {
    const det = await this.detect(params);
    if (det.findings.length === 0) return null;
    return det.findings.reduce((a, b) => (a.confidence > b.confidence ? a : b));
  }

  private resolveAlgorithm(params: DetectParams): AIAlgorithm | null {
    if (params.algorithmId) return this.algorithms.find((a) => a.id === params.algorithmId) ?? null;
    const candidates = this.getDetectionAlgorithms(params.modality, params.bodyPart);
    return candidates[0] ?? null;
  }

  private guessLesionTypes(params: DetectParams): string[] {
    if (params.modality === 'CT' && /肺|胸|chest/i.test(params.bodyPart)) return ['nodule', 'consolidation', 'effusion'];
    if (params.modality === 'CT' && /头|脑|brain/i.test(params.bodyPart)) return ['hemorrhage', 'infarct'];
    if (params.modality === 'MR' && /头|脑|brain/i.test(params.bodyPart)) return ['infarct', 'hemorrhage'];
    if (params.modality === 'CT' && /骨|rib|spine/i.test(params.bodyPart)) return ['fracture'];
    if (/mammo|breast|mg|dbt/i.test(params.modality + params.bodyPart)) return ['calcification', 'mass'];
    return ['nodule'];
  }

  private synthesizeFinding(params: DetectParams): AIDetectedFinding {
    const t = this.guessLesionTypes(params)[0] ?? 'nodule';
    const concept = SR_CONCEPT_CODES[t] ?? { code: 'RID0', scheme: 'RadLex' };
    return {
      id: uuid('f'),
      type: t as AIDetectedFinding['type'],
      label: '自动检出',
      location: params.bodyPart,
      bbox: { x: 150, y: 150, width: 60, height: 60 },
      confidence: 0.6 + Math.random() * 0.2,
      diameterMm: 5 + Math.random() * 20,
      sopInstanceUid: params.sopInstanceUid ?? `sop-${uuid('s')}`,
      seriesNumber: params.seriesNumber ?? 1,
      instanceNumber: params.instanceNumber ?? 1,
      srReference: { srUid: `sr-${uuid('sr')}`, conceptCode: concept.code, codingScheme: concept.scheme },
    };
  }
}

export const lesionDetector = new LesionDetector();
