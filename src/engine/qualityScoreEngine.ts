// ============================================================
// G005 放射RIS系统 v2.0.0 - 质控评分引擎
// Phase R8 W5-D: 5 维评分 + 甲/乙/丙级自动判定
// ============================================================

export interface QualityScoreInput {
  reportId: string;
  hasFindings: boolean;          // 是否有所见
  hasImpression: boolean;         // 是否有印象
  findingsLength: number;         // 所见字数
  impressionLength: number;       // 印象字数
  hasMeasurement: boolean;        // 是否有测量
  hasPriorCompare: boolean;       // 是否有历史对比
  hasCriticalValue: boolean;      // 是否有危急值
  hasImageAnnotation: boolean;    // 是否有图像标注
  signedBy: string;               // 签发医生
  reviewedBy?: string;             // 审核医生
  modifiedAfterSign: boolean;     // 签发后修改
}

export interface QualityScoreResult {
  total: number;
  grade: '甲' | '乙' | '丙';
  dimensions: {
    completeness: { score: number; weight: number; issues: string[] };
    accuracy: { score: number; weight: number; issues: string[] };
    standard: { score: number; weight: number; issues: string[] };
    timeliness: { score: number; weight: number; issues: string[] };
    clinicalValue: { score: number; weight: number; issues: string[] };
  };
  overallIssues: string[];
}

export function scoreQuality(input: QualityScoreInput): QualityScoreResult {
  const issues: string[] = [];

  // 1. 完整性 (25%)
  let completeness = 100;
  const cIssues: string[] = [];
  if (!input.hasFindings) { completeness -= 30; cIssues.push('未见描述缺失'); }
  if (!input.hasImpression) { completeness -= 30; cIssues.push('未见印象'); }
  if (input.findingsLength < 50) { completeness -= 15; cIssues.push('所见描述过短（<50字）'); }
  if (input.impressionLength < 20) { completeness -= 15; cIssues.push('印象描述过短（<20字）'); }
  completeness = Math.max(0, completeness);

  // 2. 准确性 (25%)
  let accuracy = 100;
  const aIssues: string[] = [];
  if (input.hasCriticalValue && !input.reviewedBy) { accuracy -= 20; aIssues.push('危急值未由上级审核'); }
  if (input.modifiedAfterSign) { accuracy -= 30; aIssues.push('签发后修改（应使用加签而非修改）'); }
  accuracy = Math.max(0, accuracy);

  // 3. 规范性 (20%)
  let standard = 100;
  const sIssues: string[] = [];
  if (!input.hasMeasurement) { standard -= 20; sIssues.push('缺少测量值（重要病变应有大小）'); }
  if (!input.hasImageAnnotation) { standard -= 10; sIssues.push('关键图像未标注'); }
  standard = Math.max(0, standard);

  // 4. 及时性 (15%)
  let timeliness = 100;
  const tIssues: string[] = [];
  // 由调用方传入时间差 - 简化处理
  if (input.hasCriticalValue) { timeliness = Math.min(timeliness, 95); }
  timeliness = Math.max(0, timeliness);

  // 5. 临床决策价值 (15%)
  let clinicalValue = 100;
  const cvIssues: string[] = [];
  if (!input.hasPriorCompare) { clinicalValue -= 30; cvIssues.push('无历史对比'); }
  clinicalValue = Math.max(0, clinicalValue);

  // 加权总分
  const total = Math.round(
    completeness * 0.25 +
    accuracy * 0.25 +
    standard * 0.20 +
    timeliness * 0.15 +
    clinicalValue * 0.15
  );

  // 等级判定 (WS/T 500-2016)
  let grade: '甲' | '乙' | '丙' = '丙';
  if (total >= 90) grade = '甲';
  else if (total >= 75) grade = '乙';
  else grade = '丙';

  if (total < 90) issues.push(`总分 ${total} 低于甲级标准（90分）`);
  if (completeness < 80) issues.push('完整性不足');
  if (accuracy < 80) issues.push('准确性不足');

  return {
    total,
    grade,
    dimensions: {
      completeness: { score: completeness, weight: 0.25, issues: cIssues },
      accuracy: { score: accuracy, weight: 0.25, issues: aIssues },
      standard: { score: standard, weight: 0.20, issues: sIssues },
      timeliness: { score: timeliness, weight: 0.15, issues: tIssues },
      clinicalValue: { score: clinicalValue, weight: 0.15, issues: cvIssues },
    },
    overallIssues: issues,
  };
}

export const QUALITY_GRADE_THRESHOLDS = {
  甲: { min: 90, color: '#10b981', desc: '优秀' },
  乙: { min: 75, color: '#f59e0b', desc: '合格' },
  丙: { min: 0,  color: '#ef4444', desc: '不合格' },
} as const;
