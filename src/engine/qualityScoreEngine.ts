/**
 * G005 放射RIS系统 v3.0.2.10 - 质控评分引擎（15维统一版）
 * 合并 qualityScoreEngine(5维) + ReportQualityScore(8维) 为统一系统
 */
export interface QualityScoreInput {
  reportId: string;
  // 内容完整度
  hasFindings: boolean;
  hasImpression: boolean;
  findingsLength: number;
  impressionLength: number;
  hasRecommendations: boolean;
  hasClinicalHistory: boolean;
  hasComparison: boolean;
  hasMethodology: boolean;
  // 结构化字段
  structuredFieldCount: number;
  structuredFieldCompleteRate: number;
  hasRadsCategory: boolean;
  hasMeasurement: boolean;
  hasImageAnnotation: boolean;
  measurementCount: number;
  // 术语规范
  termCount: number;
  termBlacklistHits: number;
  spellingErrorCount: number;
  // 准确性
  hasCriticalValue: boolean;
  reviewedBy?: string;
  modifiedAfterSign: boolean;
  // 逻辑一致性
  hasContradiction: boolean;
  hasLeftRightError: boolean;
  hasNegationError: boolean;
  // 时效性
  reportMinutes: number;
  slaMinutes: number;
  isOverdue: boolean;
  // 业务价值
  hasPriorCompare: boolean;
  hasClinicalQuestion: boolean;
  hasFollowupPlan: boolean;
  // 审核
  initialReviewed: boolean;
  finalReviewed: boolean;
  coSigned: boolean;
  published: boolean;
  guidelineAdherence: boolean;
  // 医生信息
  signedBy: string;
}

export interface DimensionScore {
  score: number;
  weight: number;
  maxScore: number;
  issues: string[];
}

export interface QualityScoreResult {
  total: number;
  grade: '甲' | '乙' | '丙' | '丁';
  gradeLabel: string;
  dimensions: {
    completeness: DimensionScore;
    structuredFields: DimensionScore;
    terminology: DimensionScore;
    accuracy: DimensionScore;
    logicConsistency: DimensionScore;
    timeliness: DimensionScore;
    clinicalValue: DimensionScore;
    reviewWorkflow: DimensionScore;
    radsScoring: DimensionScore;
    priorComparison: DimensionScore;
    measurement: DimensionScore;
    spelling: DimensionScore;
    guidelineAdherence: DimensionScore;
    recommendation: DimensionScore;
    criticalHandling: DimensionScore;
  };
  overallIssues: string[];
  strengths: string[];
}

export function scoreQuality(input: QualityScoreInput): QualityScoreResult {
  const issues: string[] = [];
  const strengths: string[] = [];
  const safe = (n: number, fb = 0) => (Number.isFinite(n) ? n : fb);

  const findingsLength = safe(input.findingsLength);
  const impressionLength = safe(input.impressionLength);
  const structuredFieldCount = safe(input.structuredFieldCount);
  const structuredFieldCompleteRate = safe(input.structuredFieldCompleteRate);
  const termCount = safe(input.termCount);
  const termBlacklistHits = safe(input.termBlacklistHits);
  const spellingErrorCount = safe(input.spellingErrorCount);
  const measurementCount = safe(input.measurementCount);
  const reportMinutes = safe(input.reportMinutes);
  const slaMinutes = safe(input.slaMinutes);

  const dims = [
    { name: 'completeness', value: 0, weight: 0.10 },
    { name: 'sf', value: 0, weight: 0.08 },
    { name: 'term', value: 0, weight: 0.08 },
    { name: 'accuracy', value: 0, weight: 0.08 },
    { name: 'logic', value: 0, weight: 0.07 },
    { name: 'timeliness', value: 0, weight: 0.07 },
    { name: 'cv', value: 0, weight: 0.07 },
    { name: 'rw', value: 0, weight: 0.07 },
    { name: 'rads', value: 0, weight: 0.07 },
    { name: 'pc', value: 0, weight: 0.05 },
    { name: 'meas', value: 0, weight: 0.08 },
    { name: 'spell', value: 0, weight: 0.05 },
    { name: 'guideline', value: 0, weight: 0.05 },
    { name: 'rec', value: 0, weight: 0.04 },
    { name: 'cvh', value: 0, weight: 0.04 },
  ];
  const totalWeight = dims.reduce((s, d) => s + d.value * d.weight, 0);
  if (!Number.isFinite(totalWeight)) throw new Error('Invalid quality input');

  // 1. 内容完整度 (10%)
  let completeness = 100;
  const cIssues: string[] = [];
  if (!input.hasFindings) { completeness -= 25; cIssues.push('未见描述缺失'); }
  if (!input.hasImpression) { completeness -= 25; cIssues.push('印象缺失'); }
  if (findingsLength < 50) { completeness -= 15; cIssues.push('所见描述过短(<50字)'); }
  if (impressionLength < 20) { completeness -= 15; cIssues.push('印象描述过短(<20字)'); }
  if (!input.hasRecommendations) { completeness -= 10; cIssues.push('建议缺失'); }
  if (!input.hasClinicalHistory) { completeness -= 5; cIssues.push('临床病史缺失'); }
  if (!input.hasComparison) { completeness -= 5; cIssues.push('无既往对比'); }
  completeness = Math.max(0, completeness);
  if (completeness >= 90) strengths.push('内容完整');

  // 2. 结构化字段完整度 (8%)
  let sf = structuredFieldCount > 0 ? Math.min(100, structuredFieldCompleteRate * 100) : 0;
  const sfIssues: string[] = [];
  if (sf < 50) sfIssues.push('结构化字段填充率低');
  if (structuredFieldCount === 0) sfIssues.push('未使用结构化字段');
  if (sf >= 80) strengths.push('结构化数据完整');

  // 3. 术语规范性 (8%)
  let term = 100;
  const tIssues: string[] = [];
  if (termCount < 3) { term -= 20; tIssues.push('术语使用不足'); }
  if (termBlacklistHits > 0) { term -= 30 * termBlacklistHits; tIssues.push(`存在 ${termBlacklistHits} 个黑名单术语`); }
  term = Math.max(0, term);
  if (term >= 90) strengths.push('术语规范');

  // 4. 准确性 (8%)
  let accuracy = 100;
  const aIssues: string[] = [];
  if (input.hasCriticalValue && !input.reviewedBy) { accuracy -= 30; aIssues.push('危急值未由上级审核'); }
  if (input.modifiedAfterSign) { accuracy -= 40; aIssues.push('签发后修改（应使用加签）'); }
  accuracy = Math.max(0, accuracy);

  // 5. 逻辑一致性 (7%)
  let logic = 100;
  const lIssues: string[] = [];
  if (input.hasContradiction) { logic -= 50; lIssues.push('报告存在前后矛盾'); }
  if (input.hasLeftRightError) { logic -= 40; lIssues.push('左右混淆'); }
  if (input.hasNegationError) { logic -= 30; lIssues.push('否定词使用不当'); }
  logic = Math.max(0, logic);
  if (logic >= 90) strengths.push('逻辑一致');

  // 6. 时效性 (7%)
  let timeliness = 100;
  const tiIssues: string[] = [];
  if (input.isOverdue) { timeliness = 40; tiIssues.push('超时完成'); }
  else if (slaMinutes > 0 && reportMinutes > slaMinutes) {
    timeliness = Math.max(60, 100 - (reportMinutes - slaMinutes) / slaMinutes * 40);
    tiIssues.push('接近超时');
  }
  timeliness = Math.max(0, timeliness);
  if (timeliness >= 90) strengths.push('时效性佳');

  // 7. 临床决策价值 (7%)
  let cv = 100;
  const cvIssues: string[] = [];
  if (!input.hasPriorCompare) { cv -= 25; cvIssues.push('无历史对比影响诊断参考'); }
  if (!input.hasClinicalQuestion) { cv -= 15; cvIssues.push('未回答临床问题'); }
  if (!input.hasFollowupPlan) { cv -= 15; cvIssues.push('无随访计划'); }
  cv = Math.max(0, cv);

  // 8. 审核工作流 (7%)
  let rw = 0;
  const rwIssues: string[] = [];
  if (input.initialReviewed) rw += 30;
  else rwIssues.push('初审未完成');
  if (input.finalReviewed) rw += 30;
  else rwIssues.push('终审未完成');
  if (input.coSigned) rw += 25;
  else rwIssues.push('CoSign双签未完成');
  if (input.published) rw += 15;
  rw = Math.min(100, rw);
  if (rw >= 80) strengths.push('审核流程完整');

  // 9. RADS评分 (7%)
  let rads = input.hasRadsCategory ? 100 : 20;
  const radsIssues: string[] = input.hasRadsCategory ? [] : ['未使用RADS评分'];
  if (input.hasRadsCategory) strengths.push('RADS评分完整');

  // 10. 历史对比 (5%)
  let pc = input.hasPriorCompare ? 100 : 30;
  const pcIssues: string[] = input.hasPriorCompare ? [] : ['无既往对比'];

  // 11. 测量完整性 (8%)
  let meas = input.hasMeasurement ? Math.min(100, measurementCount * 20) : 0;
  const measIssues: string[] = [];
  if (!input.hasMeasurement) measIssues.push('缺少测量值');
  else if (measurementCount < 3) measIssues.push('测量数量偏少');
  if (measurementCount >= 3) strengths.push('测量完整');

  // 12. 拼写/错别字 (5%)
  let spell = spellingErrorCount === 0 ? 100 : Math.max(0, 100 - spellingErrorCount * 20);
  const spellIssues: string[] = spellingErrorCount > 0 ? [`存在 ${spellingErrorCount} 个错别字`] : [];

  // 13. 指南遵循 (5%)
  let guideline = input.guidelineAdherence ? 100 : 60;
  const gIssues: string[] = input.guidelineAdherence ? [] : ['未完全遵循中华医学会放射学分会指南/WS/T 500-2016'];

  // 14. 建议完整性 (4%)
  let rec = input.hasRecommendations ? 100 : 40;
  const recIssues: string[] = input.hasRecommendations ? [] : ['无随访建议'];

  // 15. 危急值处理 (4%)
  let cvh = 100;
  const cvhIssues: string[] = [];
  if (input.hasCriticalValue && !input.finalReviewed) { cvh -= 40; cvhIssues.push('危急值需终审确认'); }

  // 加权总分
  const total = Math.round(
    completeness * 0.10 +
    sf * 0.08 +
    term * 0.08 +
    accuracy * 0.08 +
    logic * 0.07 +
    timeliness * 0.07 +
    cv * 0.07 +
    rw * 0.07 +
    rads * 0.07 +
    pc * 0.05 +
    meas * 0.08 +
    spell * 0.05 +
    guideline * 0.05 +
    rec * 0.04 +
    cvh * 0.04
  );

  // 等级判定
  let grade: '甲' | '乙' | '丙' | '丁' = '丁';
  let gradeLabel = '不合格';
  if (total >= 90) { grade = '甲'; gradeLabel = '优秀'; }
  else if (total >= 80) { grade = '乙'; gradeLabel = '良好'; }
  else if (total >= 65) { grade = '丙'; gradeLabel = '合格'; }
  else { grade = '丁'; gradeLabel = '不合格'; }

  if (total < 80) issues.push(`总分 ${total} 低于乙级标准（80分）`);
  if (completeness < 70) issues.push('内容完整度不足');
  if (accuracy < 70) issues.push('准确性不足');

  return {
    total, grade, gradeLabel,
    dimensions: {
      completeness: { score: completeness, weight: 0.10, maxScore: 100, issues: cIssues },
      structuredFields: { score: sf, weight: 0.08, maxScore: 100, issues: sfIssues },
      terminology: { score: term, weight: 0.08, maxScore: 100, issues: tIssues },
      accuracy: { score: accuracy, weight: 0.08, maxScore: 100, issues: aIssues },
      logicConsistency: { score: logic, weight: 0.07, maxScore: 100, issues: lIssues },
      timeliness: { score: timeliness, weight: 0.07, maxScore: 100, issues: tiIssues },
      clinicalValue: { score: cv, weight: 0.07, maxScore: 100, issues: cvIssues },
      reviewWorkflow: { score: rw, weight: 0.07, maxScore: 100, issues: rwIssues },
      radsScoring: { score: rads, weight: 0.07, maxScore: 100, issues: radsIssues },
      priorComparison: { score: pc, weight: 0.05, maxScore: 100, issues: pcIssues },
      measurement: { score: meas, weight: 0.08, maxScore: 100, issues: measIssues },
      spelling: { score: spell, weight: 0.05, maxScore: 100, issues: spellIssues },
      guidelineAdherence: { score: guideline, weight: 0.05, maxScore: 100, issues: gIssues },
      recommendation: { score: rec, weight: 0.04, maxScore: 100, issues: recIssues },
      criticalHandling: { score: cvh, weight: 0.04, maxScore: 100, issues: cvhIssues },
    },
    overallIssues: issues,
    strengths,
  };
}

export interface DefectItem {
  id: string;
  code: string;
  name: string;
  category: 'description' | 'terminology' | 'format' | 'logic' | 'critical' | 'completeness';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  examples: string[];
  solution: string;
}

export const QUALITY_GRADE_CONFIG = {
  甲: { min: 90, color: '#10b981', bg: '#d1fae5', desc: '优秀', action: '无需处理' },
  乙: { min: 80, color: '#3b82f6', bg: '#dbeafe', desc: '良好', action: '可发布' },
  丙: { min: 65, color: '#f59e0b', bg: '#fef3c7', desc: '合格', action: '建议改进' },
  丁: { min: 0, color: '#ef4444', bg: '#fee2e2', desc: '不合格', action: '需退修' },
} as const;
