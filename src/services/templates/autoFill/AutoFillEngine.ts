/**
 * G005 RIS v3.0.6.5 - 自动填充引擎
 * 80 升级点 - 报告字段智能建议(EMR/历史/AI/模板)
 * 方法:suggestField, getContext, applySuggestion, scoreConfidence
 */
import type {
  AutoFillContext, AutoFillSource, AutoFillSuggestion, PriorStudySummary,
} from '@/types/templates/calculations';

// ============================================================
// 模拟 EMR / 既往 / AI 数据源(实际生产对接 HIS/EMR API)
// ============================================================
const MOCK_EMR: Record<string, Record<string, unknown>> = {
  'patient-allergy': { penicillin: '皮疹', iopamidol: '荨麻疹' },
  'patient-medication': { metformin: '500mg bid', aspirin: '100mg qd' },
  'patient-diagnosis': { E11: '2 型糖尿病', I10: '原发性高血压' },
  'patient-lab': { HbA1c: 7.2, eGFR: 78, K: 4.1, Cr: 0.92 },
};

const MOCK_PRIOR_STUDIES: PriorStudySummary[] = [
  {
    studyId: 'S2026-001',
    studyDate: '2025-12-15',
    modality: 'CT',
    bodyPart: 'CHEST',
    findings: '右肺上叶见 8mm 实性结节,边缘光整。',
    impression: '右肺上叶微小结节,Lung-RADS 3 类。',
    measurements: { 'lesion1Long': 8, 'lesion1Short': 7 },
  },
  {
    studyId: 'S2025-118',
    studyDate: '2025-08-10',
    modality: 'CT',
    bodyPart: 'CHEST',
    findings: '右肺上叶见 5mm 实性结节。',
    impression: '右肺上叶微小结节,建议随访。',
    measurements: { 'lesion1Long': 5, 'lesion1Short': 4 },
  },
];

const MOCK_AI_PREDICTIONS: Record<string, { value: unknown; confidence: number }> = {
  lungRadsCategory: { value: '4A', confidence: 0.78 },
  overallScore: { value: 4, confidence: 0.82 },
  biradsCategory: { value: '4A', confidence: 0.74 },
};

// ============================================================
// AutoFillEngine
// ============================================================
export class AutoFillEngine {
  private static instance: AutoFillEngine;
  static getInstance(): AutoFillEngine {
    if (!AutoFillEngine.instance) AutoFillEngine.instance = new AutoFillEngine();
    return AutoFillEngine.instance;
  }

  /**
   * 字段级建议
   */
  suggestField(fieldKey: string, ctx: AutoFillContext): AutoFillSuggestion[] {
    const suggestions: AutoFillSuggestion[] = [];
    const current = ctx.values[fieldKey];

    // 1. 既往研究
    if (this.isMeasurementField(fieldKey)) {
      const prior = this.matchPriorMeasurement(ctx, fieldKey);
      if (prior) suggestions.push(prior);
    }

    // 2. 既往报告文本
    if (this.isTextField(fieldKey) && ctx.fieldKeys.includes(fieldKey)) {
      const textSuggestion = this.suggestFromPriorText(ctx, fieldKey);
      if (textSuggestion) suggestions.push(textSuggestion);
    }

    // 3. EMR 上下文
    const emrSuggestion = this.suggestFromEmr(fieldKey, current, ctx);
    if (emrSuggestion) suggestions.push(emrSuggestion);

    // 4. AI 预测
    const ai = MOCK_AI_PREDICTIONS[fieldKey];
    if (ai) {
      suggestions.push({
        id: `ai-${fieldKey}`,
        fieldKey,
        fieldLabel: fieldKey,
        currentValue: current,
        suggestedValue: ai.value,
        confidence: ai.confidence,
        source: 'ai-prediction',
        rationale: '基于深度学习模型 + 类似病例库预测',
        evidence: `AI 模型版本 v3.2 (n=8421)`,
        requiresApproval: ai.confidence < 0.9,
        createdAt: new Date().toISOString(),
      });
    }

    // 5. 协议默认值(protocol)
    if (current === undefined || current === null || current === '') {
      suggestions.push({
        id: `proto-${fieldKey}`,
        fieldKey,
        fieldLabel: fieldKey,
        currentValue: current,
        suggestedValue: this.getProtocolDefault(ctx, fieldKey),
        confidence: 0.55,
        source: 'protocol',
        rationale: '匹配检查协议默认值',
        requiresApproval: true,
        createdAt: new Date().toISOString(),
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 上下文(既往/EMR/AI 摘要)
   */
  getContext(reportId: string): {
    reportId: string;
    priors: PriorStudySummary[];
    emr: { allergies: unknown; medications: unknown; diagnoses: unknown; labs: unknown };
    aiSummary: { predictedCategory: string; confidence: number; model: string };
  } {
    return {
      reportId,
      priors: MOCK_PRIOR_STUDIES,
      emr: {
        allergies: MOCK_EMR['patient-allergy'],
        medications: MOCK_EMR['patient-medication'],
        diagnoses: MOCK_EMR['patient-diagnosis'],
        labs: MOCK_EMR['patient-lab'],
      },
      aiSummary: {
        predictedCategory: 'Lung-RADS 4A',
        confidence: 0.78,
        model: 'RadsNet v3.2',
      },
    };
  }

  /**
   * 建议应用(返回建议值,不直接修改 report)
   */
  applySuggestion(suggestion: AutoFillSuggestion): { ok: boolean; value: unknown; warnings: string[] } {
    const warnings: string[] = [];
    if (suggestion.requiresApproval) warnings.push('需要上级医生审核');
    if (suggestion.confidence < 0.5) warnings.push('置信度较低(< 50%),建议人工确认');
    return { ok: true, value: suggestion.suggestedValue, warnings };
  }

  /**
   * 批量建议
   */
  suggestAll(ctx: AutoFillContext): AutoFillSuggestion[] {
    const all: AutoFillSuggestion[] = [];
    for (const fk of ctx.fieldKeys) {
      all.push(...this.suggestField(fk, ctx));
    }
    return all;
  }

  /**
   * 综合信心度评分
   */
  scoreConfidence(suggestion: AutoFillSuggestion): number {
    const sourceBase: Record<AutoFillSource, number> = {
      'prior-report': 0.9,
      'emr-allergy': 0.95,
      'emr-medication': 0.85,
      'emr-diagnosis': 0.85,
      'emr-lab': 0.88,
      'order': 0.7,
      'patient-demographics': 0.95,
      'study-history': 0.6,
      'similar-case': 0.5,
      'protocol': 0.55,
      'ai-prediction': 0.78,
    };
    const base = sourceBase[suggestion.source] ?? 0.5;
    return Math.min(1, base * (0.7 + suggestion.confidence * 0.3));
  }

  // ---------- 私有方法 ----------
  private isMeasurementField(k: string): boolean {
    return /mm|cm|size|long|short|diameter|Length|Size/i.test(k);
  }

  private isTextField(k: string): boolean {
    return /finding|impression|description|narrative|summary|note/i.test(k);
  }

  private matchPriorMeasurement(ctx: AutoFillContext, fieldKey: string): AutoFillSuggestion | null {
    const prior = MOCK_PRIOR_STUDIES[0];
    if (!prior) return null;
    const v = prior.measurements[fieldKey];
    if (v === undefined) return null;
    return {
      id: `prior-${fieldKey}`,
      fieldKey,
      fieldLabel: fieldKey,
      currentValue: ctx.values[fieldKey],
      suggestedValue: v,
      confidence: 0.9,
      source: 'prior-report',
      sourceRef: prior.studyId,
      rationale: `来自 ${prior.studyDate} 的同字段测量值`,
      evidence: `${prior.studyId} - ${prior.findings}`,
      requiresApproval: false,
      createdAt: new Date().toISOString(),
    };
  }

  private suggestFromPriorText(ctx: AutoFillContext, fieldKey: string): AutoFillSuggestion | null {
    const prior = MOCK_PRIOR_STUDIES[0];
    if (!prior) return null;
    const k = fieldKey.toLowerCase();
    if (k.includes('finding')) {
      return {
        id: `prior-txt-${fieldKey}`,
        fieldKey,
        fieldLabel: fieldKey,
        currentValue: ctx.values[fieldKey],
        suggestedValue: prior.findings,
        confidence: 0.65,
        source: 'prior-report',
        sourceRef: prior.studyId,
        rationale: '引用既往发现文本,请确认后修改',
        requiresApproval: true,
        createdAt: new Date().toISOString(),
      };
    }
    if (k.includes('impression')) {
      return {
        id: `prior-txt-${fieldKey}`,
        fieldKey,
        fieldLabel: fieldKey,
        currentValue: ctx.values[fieldKey],
        suggestedValue: prior.impression,
        confidence: 0.65,
        source: 'prior-report',
        sourceRef: prior.studyId,
        rationale: '引用既往印象,请确认',
        requiresApproval: true,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }

  private suggestFromEmr(fieldKey: string, current: unknown, ctx: AutoFillContext): AutoFillSuggestion | null {
    const k = fieldKey.toLowerCase();
    if (k.includes('clinical') || k.includes('history') || k.includes('present')) {
      return {
        id: `emr-${fieldKey}`,
        fieldKey,
        fieldLabel: fieldKey,
        currentValue: current,
        suggestedValue: '患者既往糖尿病、高血压,规律服药,血糖控制可。',
        confidence: 0.7,
        source: 'emr-diagnosis',
        rationale: '来自 EMR 既往诊断摘要',
        evidence: 'E11 / I10',
        requiresApproval: true,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }

  private getProtocolDefault(ctx: AutoFillContext, fieldKey: string): unknown {
    const k = fieldKey.toLowerCase();
    if (k.includes('count') || k.includes('number')) return 0;
    if (k.includes('date')) return new Date().toISOString().slice(0, 10);
    if (k.includes('assessor') || k.includes('doctor')) return ctx.reportId.startsWith('R') ? '陈医师' : '';
    return '';
  }
}

export const autoFillEngine = AutoFillEngine.getInstance();
