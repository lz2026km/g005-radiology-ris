/**
 * G005 放射RIS系统 v3.0.5.1 - R3.WRITING 书写模块 Mock 数据
 * 150 升级点 mock:结构化字段 / 富文本 / AI 草稿 / 语音 / 影像锚定 / 短语库 / 模板
 */

import type {
  StructuredTemplate, StructuredFieldDefinition, StructuredFieldGroup,
  RecistTargetLesion, RecistResponse,
  BiradsAssessment, BiradsFinding, BiradsCategory,
  PiradsAssessment, PiradsScore,
  RichEditorDocument, RichEditorImage, RichEditorStyle,
  AiDraftResult, AiDraftRequest,
  VoiceDictationSession,
  ImageAnchor,
  Phrase, RadLexTerm,
  PriorReport, SimilarCase,
  ReportDraft,
  ReportTemplate, TemplateCategory,
  WritingMetrics, PreSubmitScore,
  MultiModalityPanel,
  KeywordHighlight,
  ReportWritingContext,
} from '@types/R3/R3.WRITING';

// ============================================================
// 1. RECIST 1.1 模板(40 fields)
// ============================================================
const recistGroups: StructuredFieldGroup[] = [
  { id: 'g1', label: '基线评估', labelEn: 'Baseline', order: 1, collapsible: false, defaultExpanded: true },
  { id: 'g2', label: '靶病灶', labelEn: 'Target Lesions', order: 2, collapsible: true, defaultExpanded: true },
  { id: 'g3', label: '非靶病灶', labelEn: 'Non-Target Lesions', order: 3, collapsible: true, defaultExpanded: true },
  { id: 'g4', label: '新发病灶', labelEn: 'New Lesions', order: 4, collapsible: true, defaultExpanded: true },
  { id: 'g5', label: '疗效评估', labelEn: 'Response Assessment', order: 5, collapsible: false, defaultExpanded: true },
];

const recistFields: StructuredFieldDefinition[] = [
  { id: 'f1', key: 'baselineDate', label: '基线测量日期', labelEn: 'Baseline Date', type: 'date', required: true, group: 'g1', order: 1, placeholder: 'YYYY-MM-DD', permissions: ['doctor:read', 'doctor:write'] },
  { id: 'f2', key: 'lesionCount', label: '靶病灶数量', labelEn: 'Target Lesion Count', type: 'number', required: true, group: 'g1', min: 1, max: 10, defaultValue: 5, order: 2 },
  { id: 'f3', key: 'measurementMethod', label: '测量方法', labelEn: 'Measurement Method', type: 'enum', required: true, group: 'g1', options: [
    { value: 'CT', label: 'CT', labelEn: 'CT', color: '#0891b2' },
    { value: 'MR', label: 'MR', labelEn: 'MR', color: '#7c3aed' },
    { value: 'PET', label: 'PET-CT', labelEn: 'PET-CT', color: '#dc2626' },
  ], defaultValue: 'CT', order: 3 },
  { id: 'f4', key: 'lesion1Site', label: '病灶 1 部位', labelEn: 'Lesion 1 Site', type: 'text', required: true, group: 'g2', order: 4, placeholder: '例:右肺上叶', dependsOn: { fieldKey: 'lesionCount', equals: 5 } },
  { id: 'f5', key: 'lesion1Long', label: '病灶 1 长径(mm)', labelEn: 'Lesion 1 Long Diameter', type: 'number', required: true, group: 'g2', min: 0, max: 500, unit: 'mm', unitOptions: ['mm', 'cm'], order: 5, referenceRange: { min: 0, max: 500, unit: 'mm' } },
  { id: 'f6', key: 'lesion1Short', label: '病灶 1 短径(mm)', labelEn: 'Lesion 1 Short Diameter', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', unitOptions: ['mm', 'cm'], order: 6 },
  { id: 'f7', key: 'lesion1Baseline', label: '病灶 1 基线(mm)', labelEn: 'Lesion 1 Baseline', type: 'number', required: true, group: 'g2', min: 0, max: 500, unit: 'mm', order: 7 },
  { id: 'f8', key: 'lesion2Site', label: '病灶 2 部位', labelEn: 'Lesion 2 Site', type: 'text', required: true, group: 'g2', order: 8 },
  { id: 'f9', key: 'lesion2Long', label: '病灶 2 长径(mm)', labelEn: 'Lesion 2 Long Diameter', type: 'number', required: true, group: 'g2', min: 0, max: 500, unit: 'mm', order: 9 },
  { id: 'f10', key: 'lesion2Short', label: '病灶 2 短径(mm)', labelEn: 'Lesion 2 Short Diameter', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 10 },
  { id: 'f11', key: 'lesion2Baseline', label: '病灶 2 基线(mm)', labelEn: 'Lesion 2 Baseline', type: 'number', required: true, group: 'g2', min: 0, max: 500, unit: 'mm', order: 11 },
  { id: 'f12', key: 'lesion3Site', label: '病灶 3 部位', labelEn: 'Lesion 3 Site', type: 'text', required: true, group: 'g2', order: 12 },
  { id: 'f13', key: 'lesion3Long', label: '病灶 3 长径(mm)', labelEn: 'Lesion 3 Long Diameter', type: 'number', required: true, group: 'g2', min: 0, max: 500, unit: 'mm', order: 13 },
  { id: 'f14', key: 'lesion3Short', label: '病灶 3 短径(mm)', labelEn: 'Lesion 3 Short Diameter', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 14 },
  { id: 'f15', key: 'lesion3Baseline', label: '病灶 3 基线(mm)', labelEn: 'Lesion 3 Baseline', type: 'number', required: true, group: 'g2', min: 0, max: 500, unit: 'mm', order: 15 },
  { id: 'f16', key: 'lesion4Site', label: '病灶 4 部位', labelEn: 'Lesion 4 Site', type: 'text', required: false, group: 'g2', order: 16 },
  { id: 'f17', key: 'lesion4Long', label: '病灶 4 长径(mm)', labelEn: 'Lesion 4 Long Diameter', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 17 },
  { id: 'f18', key: 'lesion4Short', label: '病灶 4 短径(mm)', labelEn: 'Lesion 4 Short Diameter', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 18 },
  { id: 'f19', key: 'lesion4Baseline', label: '病灶 4 基线(mm)', labelEn: 'Lesion 4 Baseline', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 19 },
  { id: 'f20', key: 'lesion5Site', label: '病灶 5 部位', labelEn: 'Lesion 5 Site', type: 'text', required: false, group: 'g2', order: 20 },
  { id: 'f21', key: 'lesion5Long', label: '病灶 5 长径(mm)', labelEn: 'Lesion 5 Long Diameter', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 21 },
  { id: 'f22', key: 'lesion5Short', label: '病灶 5 短径(mm)', labelEn: 'Lesion 5 Short Diameter', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 22 },
  { id: 'f23', key: 'lesion5Baseline', label: '病灶 5 基线(mm)', labelEn: 'Lesion 5 Baseline', type: 'number', required: false, group: 'g2', min: 0, max: 500, unit: 'mm', order: 23 },
  { id: 'f24', key: 'nonTargetLesions', label: '非靶病灶存在', labelEn: 'Non-Target Lesions Present', type: 'boolean', required: true, group: 'g3', defaultValue: false, order: 24 },
  { id: 'f25', key: 'nonTargetSites', label: '非靶病灶部位', labelEn: 'Non-Target Sites', type: 'multi-enum', required: false, group: 'g3', options: [
    { value: 'liver', label: '肝脏', labelEn: 'Liver' },
    { value: 'bone', label: '骨骼', labelEn: 'Bone' },
    { value: 'pleural', label: '胸膜', labelEn: 'Pleural' },
    { value: 'lymph', label: '淋巴结', labelEn: 'Lymph Node' },
    { value: 'adrenal', label: '肾上腺', labelEn: 'Adrenal' },
  ], order: 25, dependsOn: { fieldKey: 'nonTargetLesions', equals: true } },
  { id: 'f26', key: 'nonTargetProgression', label: '非靶病灶进展', labelEn: 'Non-Target Progression', type: 'boolean', required: false, group: 'g3', defaultValue: false, order: 26 },
  { id: 'f27', key: 'newLesion', label: '出现新发病灶', labelEn: 'New Lesion', type: 'boolean', required: true, group: 'g4', defaultValue: false, order: 27 },
  { id: 'f28', key: 'newLesionSites', label: '新发病灶部位', labelEn: 'New Lesion Sites', type: 'text', required: false, group: 'g4', order: 28, dependsOn: { fieldKey: 'newLesion', equals: true } },
  { id: 'f29', key: 'sumOfDiameters', label: '靶病灶直径总和(mm)', labelEn: 'Sum of Diameters', type: 'number', required: true, group: 'g5', min: 0, max: 2000, unit: 'mm', order: 29, formula: 'sum(lesion1Long+lesion2Long+lesion3Long+lesion4Long+lesion5Long)', locked: true },
  { id: 'f30', key: 'baselineSum', label: '基线直径总和(mm)', labelEn: 'Baseline Sum', type: 'number', required: true, group: 'g5', min: 0, max: 2000, unit: 'mm', order: 30, formula: 'sum(lesion1Baseline+lesion2Baseline+lesion3Baseline+lesion4Baseline+lesion5Baseline)', locked: true },
  { id: 'f31', key: 'percentChange', label: '变化百分比(%)', labelEn: 'Percent Change', type: 'number', required: true, group: 'g5', min: -100, max: 1000, unit: '%', order: 31, formula: '(sumOfDiameters-baselineSum)/baselineSum*100', locked: true },
  { id: 'f32', key: 'responseCategory', label: '疗效分类', labelEn: 'Response Category', type: 'enum', required: true, group: 'g5', options: [
    { value: 'CR', label: '完全缓解 CR', labelEn: 'Complete Response', color: '#10b981' },
    { value: 'PR', label: '部分缓解 PR', labelEn: 'Partial Response', color: '#3b82f6' },
    { value: 'SD', label: '疾病稳定 SD', labelEn: 'Stable Disease', color: '#f59e0b' },
    { value: 'PD', label: '疾病进展 PD', labelEn: 'Progressive Disease', color: '#dc2626' },
    { value: 'NE', label: '无法评估 NE', labelEn: 'Not Evaluable', color: '#6b7280' },
  ], defaultValue: 'SD', order: 32 },
  { id: 'f33', key: 'treatmentLine', label: '治疗线数', labelEn: 'Treatment Line', type: 'enum', required: false, group: 'g5', options: [
    { value: '1L', label: '一线', labelEn: 'First Line' },
    { value: '2L', label: '二线', labelEn: 'Second Line' },
    { value: '3L+', label: '三线及以上', labelEn: 'Third Line+' },
  ], order: 33 },
  { id: 'f34', key: 'assessor', label: '评估医师', labelEn: 'Assessor', type: 'text', required: true, group: 'g5', order: 34 },
  { id: 'f35', key: 'followUpDate', label: '下次随访日期', labelEn: 'Follow-up Date', type: 'date', required: false, group: 'g5', order: 35 },
  { id: 'f36', key: 'imageUpload', label: '关键图像', labelEn: 'Key Image', type: 'image', required: false, group: 'g5', order: 36 },
  { id: 'f37', key: 'signatureField', label: '签名', labelEn: 'Signature', type: 'signature', required: false, group: 'g5', order: 37, locked: true, permissions: ['doctor:sign'] },
  { id: 'f38', key: 'fieldScore', label: '字段质量分', labelEn: 'Field Score', type: 'number', required: false, group: 'g5', min: 0, max: 100, unit: '%', order: 38, defaultValue: 85, locked: true },
  { id: 'f39', key: 'fillDuration', label: '填写耗时(s)', labelEn: 'Fill Duration', type: 'number', required: false, group: 'g5', min: 0, max: 3600, unit: 's', order: 39, locked: true, defaultValue: 0 },
  { id: 'f40', key: 'recistSummary', label: '总结说明', labelEn: 'Summary', type: 'text', required: false, group: 'g5', order: 40, fillGuide: '请综合所有评估指标后填写', example: '本例患者经2周期化疗后,靶病灶长径总和较基线缩小32.5%,疗效评价为PR。' },
];

export const RECIST_TEMPLATE: StructuredTemplate = {
  id: 'recist',
  name: 'RECIST 1.1 实体瘤疗效评估',
  nameEn: 'RECIST 1.1 Solid Tumor Response',
  modality: 'CT',
  bodyPart: '全身',
  version: '1.1.3',
  fields: recistFields,
  groups: recistGroups,
  createdAt: '2026-05-10T08:00:00Z',
  updatedAt: '2026-08-15T10:00:00Z',
  author: 'G005 肿瘤评估组',
  score: 4.8,
  tags: ['肿瘤', '疗效评估', 'RECIST', 'CT'],
  inheritable: true,
  approved: true,
  approver: '张主任',
};

// ============================================================
// 2. BI-RADS 模板
// ============================================================
const biradsGroups: StructuredFieldGroup[] = [
  { id: 'bg1', label: '临床信息', labelEn: 'Clinical Info', order: 1, collapsible: false, defaultExpanded: true },
  { id: 'bg2', label: '影像所见', labelEn: 'Findings', order: 2, collapsible: false, defaultExpanded: true },
  { id: 'bg3', label: '评估分类', labelEn: 'Assessment', order: 3, collapsible: false, defaultExpanded: true },
  { id: 'bg4', label: '建议', labelEn: 'Recommendation', order: 4, collapsible: false, defaultExpanded: true },
];

const biradsFields: StructuredFieldDefinition[] = [
  { id: 'bf1', key: 'clinicalHistory', label: '临床病史', labelEn: 'Clinical History', type: 'text', required: true, group: 'bg1', order: 1, placeholder: '例:女性 52 岁,自检发现右乳肿块' },
  { id: 'bf2', key: 'breastDensity', label: '乳腺密度', labelEn: 'Breast Density', type: 'enum', required: true, group: 'bg1', options: [
    { value: 'A', label: 'A:几乎全部为脂肪', labelEn: 'A: Almost entirely fatty', color: '#a7f3d0' },
    { value: 'B', label: 'B:散在纤维腺体', labelEn: 'B: Scattered fibroglandular', color: '#bfdbfe' },
    { value: 'C', label: 'C:不均匀致密', labelEn: 'C: Heterogeneously dense', color: '#fed7aa' },
    { value: 'D', label: 'D:极度致密', labelEn: 'D: Extremely dense', color: '#fecaca' },
  ], order: 2 },
  { id: 'bf3', key: 'laterality', label: '侧别', labelEn: 'Laterality', type: 'multi-enum', required: true, group: 'bg2', options: [
    { value: 'L', label: '左乳', labelEn: 'Left' },
    { value: 'R', label: '右乳', labelEn: 'Right' },
  ], order: 3 },
  { id: 'bf4', key: 'mass', label: '肿块', labelEn: 'Mass', type: 'boolean', required: true, group: 'bg2', defaultValue: false, order: 4 },
  { id: 'bf5', key: 'massShape', label: '肿块形态', labelEn: 'Mass Shape', type: 'enum', required: false, group: 'bg2', options: [
    { value: 'round', label: '圆形', labelEn: 'Round' },
    { value: 'oval', label: '卵圆形', labelEn: 'Oval' },
    { value: 'irregular', label: '不规则形', labelEn: 'Irregular' },
  ], order: 5, dependsOn: { fieldKey: 'mass', equals: true } },
  { id: 'bf6', key: 'massMargin', label: '肿块边缘', labelEn: 'Mass Margin', type: 'enum', required: false, group: 'bg2', options: [
    { value: 'circumscribed', label: '清晰', labelEn: 'Circumscribed' },
    { value: 'obscured', label: '遮蔽', labelEn: 'Obscured' },
    { value: 'microlobulated', label: '微小分叶', labelEn: 'Microlobulated' },
    { value: 'indistinct', label: '模糊', labelEn: 'Indistinct' },
    { value: 'spiculated', label: '毛刺', labelEn: 'Spiculated' },
  ], order: 6, dependsOn: { fieldKey: 'mass', equals: true } },
  { id: 'bf7', key: 'massDensity', label: '肿块密度', labelEn: 'Mass Density', type: 'enum', required: false, group: 'bg2', options: [
    { value: 'high', label: '高密度', labelEn: 'High' },
    { value: 'equal', label: '等密度', labelEn: 'Equal' },
    { value: 'low', label: '低密度', labelEn: 'Low' },
    { value: 'fat-containing', label: '含脂肪', labelEn: 'Fat-containing' },
  ], order: 7, dependsOn: { fieldKey: 'mass', equals: true } },
  { id: 'bf8', key: 'massSizeX', label: '肿块大小 X(mm)', labelEn: 'Mass Size X', type: 'number', required: false, group: 'bg2', min: 0, max: 200, unit: 'mm', order: 8, dependsOn: { fieldKey: 'mass', equals: true } },
  { id: 'bf9', key: 'massSizeY', label: '肿块大小 Y(mm)', labelEn: 'Mass Size Y', type: 'number', required: false, group: 'bg2', min: 0, max: 200, unit: 'mm', order: 9, dependsOn: { fieldKey: 'mass', equals: true } },
  { id: 'bf10', key: 'massLocation', label: '肿块位置', labelEn: 'Mass Location', type: 'text', required: false, group: 'bg2', order: 10, dependsOn: { fieldKey: 'mass', equals: true } },
  { id: 'bf11', key: 'calcification', label: '钙化', labelEn: 'Calcification', type: 'boolean', required: true, group: 'bg2', defaultValue: false, order: 11 },
  { id: 'bf12', key: 'calcType', label: '钙化类型', labelEn: 'Calcification Type', type: 'enum', required: false, group: 'bg2', options: [
    { value: 'benign', label: '良性', labelEn: 'Benign' },
    { value: 'suspicious', label: '可疑', labelEn: 'Suspicious' },
    { value: 'amorphous', label: '不定形', labelEn: 'Amorphous' },
    { value: 'finePleomorphic', label: '细小多形性', labelEn: 'Fine Pleomorphic' },
    { value: 'fineLinear', label: '细线/线样分支', labelEn: 'Fine Linear/Branching' },
  ], order: 12, dependsOn: { fieldKey: 'calcification', equals: true } },
  { id: 'bf13', key: 'asymmetry', label: '不对称致密', labelEn: 'Asymmetry', type: 'boolean', required: true, group: 'bg2', defaultValue: false, order: 13 },
  { id: 'bf14', key: 'architecturalDistortion', label: '结构扭曲', labelEn: 'Architectural Distortion', type: 'boolean', required: true, group: 'bg2', defaultValue: false, order: 14 },
  { id: 'bf15', key: 'biradsCategory', label: 'BI-RADS 分类', labelEn: 'BI-RADS Category', type: 'enum', required: true, group: 'bg3', options: [
    { value: '0', label: '0 - 评估不完全', labelEn: '0 - Incomplete', color: '#9ca3af' },
    { value: '1', label: '1 - 阴性', labelEn: '1 - Negative', color: '#10b981' },
    { value: '2', label: '2 - 良性发现', labelEn: '2 - Benign', color: '#10b981' },
    { value: '3', label: '3 - 可能良性', labelEn: '3 - Probably Benign', color: '#f59e0b' },
    { value: '4', label: '4 - 可疑异常', labelEn: '4 - Suspicious', color: '#ea580c' },
    { value: '4A', label: '4A - 低度可疑', labelEn: '4A - Low Suspicion', color: '#fb923c' },
    { value: '4B', label: '4B - 中度可疑', labelEn: '4B - Moderate Suspicion', color: '#f97316' },
    { value: '4C', label: '4C - 高度可疑', labelEn: '4C - High Suspicion', color: '#ea580c' },
    { value: '5', label: '5 - 高度提示恶性', labelEn: '5 - Highly Suggestive', color: '#dc2626' },
    { value: '6', label: '6 - 活检证实恶性', labelEn: '6 - Known Biopsy-Proven', color: '#7f1d1d' },
  ], defaultValue: '2', order: 15 },
  { id: 'bf16', key: 'recommendation', label: '建议', labelEn: 'Recommendation', type: 'text', required: true, group: 'bg4', order: 16, fillGuide: '根据 BI-RADS 分类给出后续随访或活检建议' },
  { id: 'bf17', key: 'imageUploadB', label: '关键图像', labelEn: 'Key Image', type: 'image', required: false, group: 'bg4', order: 17 },
];

export const BIRADS_TEMPLATE: StructuredTemplate = {
  id: 'birads',
  name: 'BI-RADS 乳腺影像报告',
  nameEn: 'BI-RADS Breast Imaging Report',
  modality: 'MG',
  bodyPart: '乳腺',
  version: '5.0.1',
  fields: biradsFields,
  groups: biradsGroups,
  createdAt: '2026-04-20T08:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
  author: 'G005 乳腺组',
  score: 4.9,
  tags: ['乳腺', 'BI-RADS', '钼靶', '筛查'],
  inheritable: true,
  approved: true,
  approver: '李主任',
};

// ============================================================
// 3. PI-RADS 模板
// ============================================================
const piradsFields: StructuredFieldDefinition[] = [
  { id: 'pf1', key: 'psa', label: 'PSA(ng/mL)', labelEn: 'PSA', type: 'number', required: true, group: 'pg1', min: 0, max: 100, unit: 'ng/mL', order: 1, referenceRange: { min: 0, max: 4, unit: 'ng/mL', note: '正常 < 4' } },
  { id: 'pf2', key: 'prostateVolume', label: '前列腺体积(cc)', labelEn: 'Prostate Volume', type: 'number', required: true, group: 'pg1', min: 5, max: 200, unit: 'cc', order: 2 },
  { id: 'pf3', key: 'psad', label: 'PSAD(ng/mL/cc)', labelEn: 'PSAD', type: 'number', required: true, group: 'pg1', min: 0, max: 10, unit: 'ng/mL/cc', order: 3, formula: 'psa/prostateVolume', locked: true },
  { id: 'pf4', key: 'pzLesionCount', label: '外周带病灶数', labelEn: 'PZ Lesions', type: 'number', required: false, group: 'pg1', min: 0, max: 5, defaultValue: 0, order: 4 },
  { id: 'pf5', key: 'tzLesionCount', label: '移行带病灶数', labelEn: 'TZ Lesions', type: 'number', required: false, group: 'pg1', min: 0, max: 5, defaultValue: 0, order: 5 },
  { id: 'pf6', key: 'lesion1Zone', label: '病灶 1 区域', labelEn: 'Lesion 1 Zone', type: 'enum', required: false, group: 'pg2', options: [
    { value: 'PZ', label: '外周带 PZ', labelEn: 'Peripheral Zone' },
    { value: 'TZ', label: '移行带 TZ', labelEn: 'Transition Zone' },
    { value: 'CZ', label: '中央带 CZ', labelEn: 'Central Zone' },
    { value: 'AS', label: '前纤维肌 AS', labelEn: 'Anterior Stroma' },
  ], order: 6 },
  { id: 'pf7', key: 'lesion1T2w', label: '病灶 1 T2W 评分', labelEn: 'Lesion 1 T2W Score', type: 'scale', required: false, group: 'pg2', min: 1, max: 5, defaultValue: 3, order: 7 },
  { id: 'pf8', key: 'lesion1DWI', label: '病灶 1 DWI 评分', labelEn: 'Lesion 1 DWI Score', type: 'scale', required: false, group: 'pg2', min: 1, max: 5, defaultValue: 3, order: 8 },
  { id: 'pf9', key: 'lesion1DCE', label: '病灶 1 DCE', labelEn: 'Lesion 1 DCE', type: 'enum', required: false, group: 'pg2', options: [
    { value: 'positive', label: '阳性', labelEn: 'Positive' },
    { value: 'negative', label: '阴性', labelEn: 'Negative' },
    { value: 'NA', label: '不适用', labelEn: 'N/A' },
  ], order: 9 },
  { id: 'pf10', key: 'lesion1Size', label: '病灶 1 大小(mm)', labelEn: 'Lesion 1 Size', type: 'number', required: false, group: 'pg2', min: 0, max: 100, unit: 'mm', order: 10 },
  { id: 'pf11', key: 'lesion2Zone', label: '病灶 2 区域', labelEn: 'Lesion 2 Zone', type: 'enum', required: false, group: 'pg2', options: [
    { value: 'PZ', label: '外周带 PZ', labelEn: 'Peripheral Zone' },
    { value: 'TZ', label: '移行带 TZ', labelEn: 'Transition Zone' },
    { value: 'CZ', label: '中央带 CZ', labelEn: 'Central Zone' },
    { value: 'AS', label: '前纤维肌 AS', labelEn: 'Anterior Stroma' },
  ], order: 11 },
  { id: 'pf12', key: 'lesion2T2w', label: '病灶 2 T2W 评分', labelEn: 'Lesion 2 T2W Score', type: 'scale', required: false, group: 'pg2', min: 1, max: 5, defaultValue: 3, order: 12 },
  { id: 'pf13', key: 'lesion2DWI', label: '病灶 2 DWI 评分', labelEn: 'Lesion 2 DWI Score', type: 'scale', required: false, group: 'pg2', min: 1, max: 5, defaultValue: 3, order: 13 },
  { id: 'pf14', key: 'lesion2DCE', label: '病灶 2 DCE', labelEn: 'Lesion 2 DCE', type: 'enum', required: false, group: 'pg2', options: [
    { value: 'positive', label: '阳性', labelEn: 'Positive' },
    { value: 'negative', label: '阴性', labelEn: 'Negative' },
    { value: 'NA', label: '不适用', labelEn: 'N/A' },
  ], order: 14 },
  { id: 'pf15', key: 'lesion2Size', label: '病灶 2 大小(mm)', labelEn: 'Lesion 2 Size', type: 'number', required: false, group: 'pg2', min: 0, max: 100, unit: 'mm', order: 15 },
  { id: 'pf16', key: 'overallScore', label: '总体 PI-RADS 评分', labelEn: 'Overall PI-RADS', type: 'scale', required: true, group: 'pg3', min: 1, max: 5, defaultValue: 3, order: 16 },
  { id: 'pf17', key: 'pzScore', label: '外周带最高评分', labelEn: 'PZ Highest Score', type: 'scale', required: false, group: 'pg3', min: 1, max: 5, defaultValue: 3, order: 17 },
  { id: 'pf18', key: 'tzScore', label: '移行带最高评分', labelEn: 'TZ Highest Score', type: 'scale', required: false, group: 'pg3', min: 1, max: 5, defaultValue: 3, order: 18 },
  { id: 'pf19', key: 'piradsNotes', label: '评估说明', labelEn: 'Assessment Notes', type: 'text', required: false, group: 'pg3', order: 19 },
  { id: 'pf20', key: 'recommendationP', label: '建议', labelEn: 'Recommendation', type: 'text', required: true, group: 'pg3', order: 20, fillGuide: 'PI-RADS 1-2:常规随访;3:多参数评估;4-5:活检' },
];

const piradsGroups: StructuredFieldGroup[] = [
  { id: 'pg1', label: '基线', labelEn: 'Baseline', order: 1, collapsible: false, defaultExpanded: true },
  { id: 'pg2', label: '病灶详情', labelEn: 'Lesions', order: 2, collapsible: true, defaultExpanded: true },
  { id: 'pg3', label: '总体评估', labelEn: 'Overall', order: 3, collapsible: false, defaultExpanded: true },
];

export const PIRADS_TEMPLATE: StructuredTemplate = {
  id: 'pirads',
  name: 'PI-RADS v2.1 前列腺 MRI 评估',
  nameEn: 'PI-RADS v2.1 Prostate MRI',
  modality: 'MR',
  bodyPart: '前列腺',
  version: '2.1.5',
  fields: piradsFields,
  groups: piradsGroups,
  createdAt: '2026-03-15T08:00:00Z',
  updatedAt: '2026-09-10T10:00:00Z',
  author: 'G005 泌尿组',
  score: 4.7,
  tags: ['前列腺', 'PI-RADS', 'MR', 'mpMRI'],
  inheritable: true,
  approved: true,
  approver: '王主任',
};

export const ALL_STRUCTURED_TEMPLATES: StructuredTemplate[] = [
  RECIST_TEMPLATE,
  BIRADS_TEMPLATE,
  PIRADS_TEMPLATE,
];

// ============================================================
// 4. RECIST 实例
// ============================================================
export const RECIST_LESIONS: RecistTargetLesion[] = [
  { id: 'l1', site: '右肺上叶(尖段)', longDiameterMm: 18, shortDiameterMm: 14, baselineMm: 28, previousMm: 22, sum: 18 },
  { id: 'l2', site: '右肺中叶(外侧段)', longDiameterMm: 12, shortDiameterMm: 10, baselineMm: 18, previousMm: 15, sum: 12 },
  { id: 'l3', site: '左肺下叶(背段)', longDiameterMm: 9, baselineMm: 14, previousMm: 11, sum: 9 },
  { id: 'l4', site: '纵隔淋巴结(2R)', longDiameterMm: 15, shortDiameterMm: 12, baselineMm: 22, previousMm: 18, sum: 15 },
  { id: 'l5', site: '肝右叶(S6)', longDiameterMm: 22, baselineMm: 35, previousMm: 28, sum: 22 },
];

export const RECIST_RESPONSE: RecistResponse = {
  category: 'PR',
  categoryLabel: '部分缓解',
  categoryLabelEn: 'Partial Response',
  sumOfDiameters: 76,
  baselineSum: 117,
  percentChange: -35.0,
  confirmedAt: '2026-08-20T14:00:00Z',
  confirmedBy: '陈医师',
  notes: '靶病灶长径总和较基线缩小 35%,达到部分缓解(PR)标准。建议继续当前方案 2 周期后再次评估。',
};

// ============================================================
// 5. BI-RADS 实例
// ============================================================
export const BIRADS_CATEGORY_MAP: Record<BiradsCategory, BiradsAssessment> = {
  '0': { category: '0', label: '评估不完全', labelEn: 'Incomplete', description: '需要进一步影像学评估', descriptionEn: 'Needs further imaging evaluation', recommendation: '召回补充其他影像学检查', recommendationEn: 'Recall for additional imaging', malignancyRisk: 0, color: '#9ca3af' },
  '1': { category: '1', label: '阴性', labelEn: 'Negative', description: '乳腺影像正常', descriptionEn: 'Normal breast imaging', recommendation: '常规年度筛查', recommendationEn: 'Routine annual screening', malignancyRisk: 0, color: '#10b981' },
  '2': { category: '2', label: '良性发现', labelEn: 'Benign', description: '明确的良性发现', descriptionEn: 'Definitively benign finding', recommendation: '常规年度筛查', recommendationEn: 'Routine annual screening', malignancyRisk: 0, color: '#10b981' },
  '3': { category: '3', label: '可能良性', labelEn: 'Probably Benign', description: '恶性可能性 ≤ 2%', descriptionEn: '≤ 2% malignancy risk', recommendation: '6 个月短期随访', recommendationEn: '6-month short-term follow-up', malignancyRisk: 2, color: '#f59e0b' },
  '4': { category: '4', label: '可疑异常', labelEn: 'Suspicious', description: '恶性可能性 2-95%', descriptionEn: '2-95% malignancy risk', recommendation: '组织学活检', recommendationEn: 'Tissue biopsy', malignancyRisk: 30, color: '#ea580c' },
  '4A': { category: '4A', label: '低度可疑', labelEn: 'Low Suspicion', description: '恶性可能性 2-10%', descriptionEn: '2-10% malignancy risk', recommendation: '组织学活检', recommendationEn: 'Tissue biopsy', malignancyRisk: 5, color: '#fb923c' },
  '4B': { category: '4B', label: '中度可疑', labelEn: 'Moderate Suspicion', description: '恶性可能性 10-50%', descriptionEn: '10-50% malignancy risk', recommendation: '组织学活检', recommendationEn: 'Tissue biopsy', malignancyRisk: 25, color: '#f97316' },
  '4C': { category: '4C', label: '高度可疑', labelEn: 'High Suspicion', description: '恶性可能性 50-95%', descriptionEn: '50-95% malignancy risk', recommendation: '组织学活检', recommendationEn: 'Tissue biopsy', malignancyRisk: 70, color: '#ea580c' },
  '5': { category: '5', label: '高度提示恶性', labelEn: 'Highly Suggestive', description: '恶性可能性 ≥ 95%', descriptionEn: '≥ 95% malignancy risk', recommendation: '组织学活检与治疗', recommendationEn: 'Biopsy and treatment', malignancyRisk: 95, color: '#dc2626' },
  '6': { category: '6', label: '活检证实恶性', labelEn: 'Known Biopsy-Proven', description: '活检已证实的恶性肿瘤', descriptionEn: 'Biopsy-proven malignancy', recommendation: '临床治疗', recommendationEn: 'Clinical treatment', malignancyRisk: 100, color: '#7f1d1d' },
};

export const BIRADS_FINDINGS: BiradsFinding[] = [
  { findingType: 'mass', shape: 'irregular', margin: 'spiculated', density: 'high', size: { x: 18, y: 15, z: 12, unit: 'mm' }, location: '外上象限', side: 'right', clockPosition: '9-10 点位' },
  { findingType: 'calcification', shape: undefined, margin: undefined, density: undefined, size: undefined, location: '外上象限(与肿块伴行)', side: 'right' },
];

// ============================================================
// 6. PI-RADS 实例
// ============================================================
export const PIRADS_ASSESSMENT: PiradsAssessment = {
  peripheralZoneScore: 4 as PiradsScore,
  transitionZoneScore: 3 as PiradsScore,
  overallScore: 4 as PiradsScore,
  overallCategory: 'High',
  prostateVolumeCc: 45,
  psad: 0.27,
  findings: [
    { lesionId: 'lsn1', zone: 'PZ', t2w: 4 as PiradsScore, dw: 5 as PiradsScore, dwi: 5 as PiradsScore, dce: 'positive', sizeMm: 14, location: '右外周带尖部' },
    { lesionId: 'lsn2', zone: 'TZ', t2w: 3 as PiradsScore, dw: 3 as PiradsScore, dwi: 3 as PiradsScore, dce: 'negative', sizeMm: 8, location: '左移行带中段' },
  ],
};

// ============================================================
// 7. 富文本编辑器 Mock
// ============================================================
export const RICH_DEFAULT_STYLE: RichEditorStyle = {
  fontFamily: 'SimSun',
  fontSize: 14,
  bold: false, italic: false, underline: false, strike: false,
  color: '#000000',
  backgroundColor: '#ffffff',
  align: 'left',
  lineHeight: 1.6,
  letterSpacing: 0,
  heading: 0,
  bullet: null,
  subscript: false, superscript: false,
  indent: 0,
  blockquote: false,
};

export const RICH_IMAGES_MOCK: RichEditorImage[] = [
  { id: 'ri-1', src: '/mock-images/ct-001.png', alt: '胸部 CT 肺窗', width: 320, height: 240, keyImage: true, dicomRef: '1.2.840.10008.5.1.4.1.1.2.1.1234.5678', uploadAt: '2026-09-15T10:30:00Z', uploadedBy: '陈医师', annotation: [{ type: 'arrow', x: 120, y: 80, color: '#dc2626', text: '病灶' }] },
  { id: 'ri-2', src: '/mock-images/ct-002.png', alt: '胸部 CT 纵隔窗', width: 320, height: 240, keyImage: false, dicomRef: '1.2.840.10008.5.1.4.1.1.2.1.1234.5679', uploadAt: '2026-09-15T10:31:00Z', uploadedBy: '陈医师' },
  { id: 'ri-3', src: '/mock-images/mr-001.png', alt: 'MR T2 横断位', width: 320, height: 240, keyImage: true, dicomRef: '1.2.840.10008.5.1.4.1.1.4.1.9876.5432', uploadAt: '2026-09-15T10:35:00Z', uploadedBy: '陈医师', annotation: [{ type: 'circle', x: 150, y: 120, width: 60, height: 60, color: '#10b981' }] },
];

export const RICH_DOCUMENT_MOCK: RichEditorDocument = {
  id: 'doc-rpt-038',
  reportId: 'rpt-038',
  content: '胸部 CT 平扫 + 增强所见...',
  html: '<h2>影像所见</h2><p>双肺纹理清晰...</p><h2>诊断意见</h2><p>1. 右肺上叶...</p>',
  plainText: '胸部 CT 平扫 + 增强所见...双肺纹理清晰...',
  images: RICH_IMAGES_MOCK,
  tables: [],
  style: { fontFamily: 'SimSun', fontSize: 14, align: 'left' },
  wordCount: 248,
  charCount: 1520,
  paragraphCount: 12,
  readingTimeMin: 1.5,
  writingDurationSec: 1845,
  lastEditedAt: '2026-09-15T11:00:00Z',
  lastEditedBy: '陈医师',
  version: 7,
  undoStack: [],
  redoStack: [],
  spellCheck: { enabled: true, language: 'zh-CN', errors: [] },
  pagination: { totalPages: 2, currentPage: 1, split: false },
  fullscreen: false,
  splitPreview: false,
  autoSaveAt: '2026-09-15T11:00:00Z',
};

// ============================================================
// 8. AI 草稿 Mock
// ============================================================
export const AI_DRAFT_REQUEST: AiDraftRequest = {
  reportId: 'rpt-038',
  modality: 'CT',
  bodyPart: '胸部',
  clinicalInfo: '女性 58 岁,体检发现右肺上叶结节 1 周,无明显症状,既往无肿瘤病史。',
  templates: ['tpl-chest-ct-v2'],
  includeImages: true,
  style: 'structured',
  language: 'zh-CN',
};

export const AI_DRAFT_RESULT: AiDraftResult = {
  id: 'aidraft-038-001',
  reportId: 'rpt-038',
  stage: 'ready',
  findings: '双侧胸廓对称,双肺纹理清晰,走行自然。右肺上叶尖段见一不规则形软组织密度结节,大小约 18mm × 15mm,边界欠清,可见短毛刺征,平扫 CT 值约 32HU,增强后强化 CT 值约 78HU,强化幅度约 46HU。邻近胸膜可见牵拉凹陷征。余肺野未见明确实变、肿块及结节影。纵隔居中,纵隔及双侧肺门未见明显肿大淋巴结。双侧胸腔未见明显积液。心脏大血管形态、密度未见异常。',
  impression: '1. 右肺上叶尖段软组织密度结节,大小约 18mm × 15mm,边界欠清,伴短毛刺征及胸膜牵拉,考虑周围型肺癌可能性大,建议进一步穿刺活检明确病理。\n2. 双肺其余肺野未见明确占位。\n3. 纵隔及双肺门未见明显肿大淋巴结。',
  recommendation: '1. 建议行 CT 引导下经皮肺穿刺活检以明确病理诊断。\n2. 必要时可行 PET-CT 检查以评估全身状况。\n3. 待病理结果回报后,建议多学科会诊(MDT)制定治疗方案。',
  confidence: 0.87,
  modelVersion: 'G005-MedAI-v3.2.1',
  generatedAt: '2026-09-15T10:55:00Z',
  basedOnReports: ['rpt-031', 'rpt-022'],
  warnings: [
    'AI 草稿仅供临床参考,最终诊断须由执业医师确认。',
    '建议结合临床病史、实验室检查及其他影像学资料综合判断。',
  ],
  tokens: { input: 1280, output: 540, cost: 0.018 },
};

// ============================================================
// 9. 语音听写 Mock
// ============================================================
export const VOICE_DICTATION_MOCK: VoiceDictationSession = {
  id: 'vd-rpt-038',
  reportId: 'rpt-038',
  state: 'paused',
  lang: 'zh-CN',
  interimText: '右肺上叶可见一不规则形',
  finalText: '胸部 CT 平扫 + 增强所见:双侧胸廓对称,双肺纹理清晰,走行自然。右肺上叶尖段见一不规则形软组织密度结节,大小约十八毫米乘十五毫米。',
  segments: [
    { start: 0, end: 2.5, text: '胸部 CT 平扫 + 增强所见:', confidence: 0.98 },
    { start: 2.5, end: 8.3, text: '双侧胸廓对称,双肺纹理清晰,走行自然。', confidence: 0.95 },
    { start: 8.3, end: 15.7, text: '右肺上叶尖段见一不规则形软组织密度结节,', confidence: 0.92 },
    { start: 15.7, end: 20.1, text: '大小约十八毫米乘十五毫米。', confidence: 0.89 },
  ],
  commands: [
    { command: '换行', action: 'insert-newline', ts: 5.2 },
    { command: '删除', action: 'delete-last-sentence', ts: 12.4 },
  ],
  startedAt: '2026-09-15T10:42:00Z',
  totalDurationSec: 142,
  totalWords: 78,
  autoPunctuation: true,
  history: [
    { id: 'vdh-1', text: '右肺下叶基底段见一斑片状高密度影,边界模糊。', createdAt: '2026-09-15T10:35:00Z' },
  ],
  browser: 'webkit',
};

// ============================================================
// 10. 影像锚定 Mock
// ============================================================
export const IMAGE_ANCHORS_MOCK: ImageAnchor[] = [
  {
    id: 'ia-1', reportId: 'rpt-038', studyInstanceUID: '1.2.840.10008.5.1.4.1.1.2.1.1',
    seriesInstanceUID: '1.2.840.10008.5.1.4.1.1.2.1.1.1', sopInstanceUID: '1.2.840.10008.5.1.4.1.1.2.1.1.1.1',
    frameNumber: 87, annotation: [{ type: 'arrow', coords: [{ x: 124, y: 88 }], label: '右肺上叶结节', labelEn: 'RUL Nodule', color: '#dc2626' }],
    keyImage: true, windowing: { center: -600, width: 1500 }, thumbnail: '/mock/thumb-ct-001.png',
    status: 'active', createdBy: '陈医师', createdAt: '2026-09-15T10:30:00Z', pinnedBy: '陈医师', pinnedAt: '2026-09-15T10:30:00Z', usageCount: 1,
  },
  {
    id: 'ia-2', reportId: 'rpt-038', studyInstanceUID: '1.2.840.10008.5.1.4.1.1.2.1.1',
    seriesInstanceUID: '1.2.840.10008.5.1.4.1.1.2.1.1.1', sopInstanceUID: '1.2.840.10008.5.1.4.1.1.2.1.1.1.2',
    frameNumber: 88, annotation: [
      { type: 'line', coords: [{ x: 100, y: 80 }, { x: 150, y: 110 }], label: '长径 18mm', labelEn: 'Long 18mm', color: '#3b82f6', measurement: { value: 18, unit: 'mm' } },
      { type: 'line', coords: [{ x: 115, y: 95 }, { x: 130, y: 110 }], label: '短径 15mm', labelEn: 'Short 15mm', color: '#10b981', measurement: { value: 15, unit: 'mm' } },
    ],
    keyImage: true, windowing: { center: -600, width: 1500 }, thumbnail: '/mock/thumb-ct-002.png',
    status: 'active', createdBy: '陈医师', createdAt: '2026-09-15T10:32:00Z', usageCount: 1,
  },
];

// ============================================================
// 11. 短语库 Mock(60+)
// ============================================================
export const PHRASES_MOCK: Phrase[] = [
  { id: 'p1', content: '双肺纹理清晰,走行自然,未见明显异常密度影。', contentEn: 'Lung markings are clear with natural distribution; no obvious abnormal density.', category: 'normal', subCategory: '胸部', modality: ['CT', 'DR'], bodyPart: ['胸部'], tags: ['正常', '胸部'], favorite: true, usageCount: 1280, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z', pinyin: 'shuang fei wen li qing xi', pinyinInitials: 'sfwlqx' },
  { id: 'p2', content: '纵隔居中,纵隔及双侧肺门未见明显肿大淋巴结。', contentEn: 'Mediastinum is centered; no obvious enlarged lymph nodes in mediastinum or bilateral hila.', category: 'normal', subCategory: '胸部', modality: ['CT'], bodyPart: ['胸部'], tags: ['纵隔', '淋巴结', '正常'], favorite: true, usageCount: 980, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p3', content: '双侧胸腔未见明显积液征象。', contentEn: 'No obvious pleural effusion bilaterally.', category: 'normal', subCategory: '胸部', modality: ['CT', 'DR', 'US'], bodyPart: ['胸部'], tags: ['胸腔', '积液', '正常'], favorite: true, usageCount: 850, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p4', content: '右肺上叶见一不规则形软组织密度结节,大小约 {{size}},边界欠清,可见短毛刺征。', contentEn: 'An irregular soft-tissue density nodule in RUL, size ~{{size}}, with spiculation.', category: 'findingChest', subCategory: '肺结节', modality: ['CT'], bodyPart: ['胸部'], tags: ['结节', '肺'], favorite: true, usageCount: 320, variables: [{ key: 'size', label: '大小(mm)', labelEn: 'Size', defaultValue: '18mm×15mm' }], isTemplate: true, template: '右肺上叶见一不规则形软组织密度结节,大小约 {{size}},边界欠清,可见短毛刺征。', authorId: 'u-001', authorName: '陈医师', createdAt: '2026-02-15T08:00:00Z', updatedAt: '2026-09-01T10:00:00Z' },
  { id: 'p5', content: '肝脏形态、大小正常,表面光滑,实质回声均匀,肝内胆管未见扩张。', contentEn: 'Liver is normal in shape and size; uniform parenchyma echo; no intrahepatic bile duct dilation.', category: 'findingAbdomen', subCategory: '肝脏', modality: ['US', 'CT', 'MR'], bodyPart: ['腹部'], tags: ['肝脏', '正常'], favorite: true, usageCount: 720, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p6', content: '颅脑实质未见明显异常信号影,脑室、脑池、脑沟未见扩大或变窄,中线结构居中。', contentEn: 'No obvious abnormal signal in brain parenchyma; ventricles, cisterns, sulci normal; midline centered.', category: 'findingNeuro', subCategory: '颅脑', modality: ['MR', 'CT'], bodyPart: ['头颅'], tags: ['颅脑', '正常'], favorite: true, usageCount: 540, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p7', content: '患者 {{patientName}}, {{gender}}, {{age}} 岁,临床诊断 {{clinicalDx}}。', contentEn: 'Patient {{patientName}}, {{gender}}, {{age}} years old, clinical diagnosis {{clinicalDx}}.', category: 'history', subCategory: '基本信息', modality: ['ALL'], bodyPart: ['ALL'], tags: ['基本信息', '模板'], favorite: true, usageCount: 1980, variables: [
    { key: 'patientName', label: '患者姓名', labelEn: 'Patient Name', defaultValue: '张三' },
    { key: 'gender', label: '性别', labelEn: 'Gender', defaultValue: '男' },
    { key: 'age', label: '年龄', labelEn: 'Age', defaultValue: '58' },
    { key: 'clinicalDx', label: '临床诊断', labelEn: 'Clinical Dx', defaultValue: '右肺占位' },
  ], isTemplate: true, template: '患者 {{patientName}}, {{gender}}, {{age}} 岁,临床诊断 {{clinicalDx}}。', authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p8', content: '危急值!建议立即临床干预。', contentEn: 'CRITICAL VALUE! Immediate clinical intervention required.', category: 'critical', subCategory: '危急值', modality: ['ALL'], bodyPart: ['ALL'], tags: ['危急值', 'Critical'], favorite: false, usageCount: 12, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p9', content: '建议 3-6 个月后复查 CT,动态观察病灶变化。', contentEn: 'Recommend follow-up CT in 3-6 months for dynamic observation.', category: 'recommendation', subCategory: '复查建议', modality: ['CT', 'MR'], bodyPart: ['ALL'], tags: ['复查', '随访'], favorite: true, usageCount: 460, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p10', content: '与 {{priorDate}} 老片比较,病灶较前{{change}}。', contentEn: 'Compared with prior study on {{priorDate}}, the lesion has {{change}}.', category: 'comparison', subCategory: '比较', modality: ['ALL'], bodyPart: ['ALL'], tags: ['比较', '随访'], favorite: true, usageCount: 380, variables: [
    { key: 'priorDate', label: '老片日期', labelEn: 'Prior Date', defaultValue: '2026-06-15' },
    { key: 'change', label: '变化', labelEn: 'Change', defaultValue: '缩小' },
  ], isTemplate: true, template: '与 {{priorDate}} 老片比较,病灶较前{{change}}。', authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p11', content: '对比剂:碘海醇(欧乃派克)100mL,经肘静脉高压注射,流率 3.0mL/s。', contentEn: 'Contrast: Iohexol (Omnipaque) 100mL, IV bolus at 3.0mL/s via elbow vein.', category: 'technique', subCategory: '增强技术', modality: ['CT'], bodyPart: ['ALL'], tags: ['增强', '技术'], favorite: true, usageCount: 290, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'p12', content: '未见急性出血、梗死或占位性病变。', contentEn: 'No acute hemorrhage, infarction or space-occupying lesion.', category: 'impression', subCategory: '综合', modality: ['CT', 'MR'], bodyPart: ['头颅'], tags: ['颅脑', '正常', '印象'], favorite: true, usageCount: 350, variables: [], isTemplate: false, authorId: 'u-001', authorName: '陈医师', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
];

// ============================================================
// 12. RadLex Mock
// ============================================================
export const RADLEX_TERMS_MOCK: RadLexTerm[] = [
  { id: 'rdx-1', preferredName: '磨玻璃影', preferredNameEn: 'Ground-glass opacity', synonyms: ['GGO', '磨玻璃密度影', '磨玻璃结节'], definition: '肺内模糊的密度增高影,血管纹理仍可见。', definitionEn: 'Hazy area of increased lung opacity through which vessels are still visible.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 890, lastUsedAt: '2026-09-15T08:00:00Z' },
  { id: 'rdx-2', preferredName: '实性结节', preferredNameEn: 'Solid nodule', synonyms: ['实性肺结节'], definition: '完全遮盖血管纹理的肺内结节。', definitionEn: 'Nodule that completely obscures vessels.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 670, lastUsedAt: '2026-09-14T10:00:00Z' },
  { id: 'rdx-3', preferredName: '毛刺征', preferredNameEn: 'Spiculation', synonyms: ['毛刺', '放射状影'], definition: '结节边缘呈放射状的细线影。', definitionEn: 'Radiating thin lines from the edge of a nodule.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 540, lastUsedAt: '2026-09-15T10:30:00Z' },
  { id: 'rdx-4', preferredName: '分叶征', preferredNameEn: 'Lobulation sign', synonyms: ['分叶'], definition: '肿块边缘呈分叶状的轮廓。', definitionEn: 'Lobulated contour of a mass edge.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 320, lastUsedAt: '2026-09-12T09:00:00Z' },
  { id: 'rdx-5', preferredName: '胸膜牵拉征', preferredNameEn: 'Pleural retraction', synonyms: ['胸膜凹陷征', '胸膜牵拉'], definition: '胸膜向肿块方向凹陷的征象。', definitionEn: 'Pleural indentation toward the mass.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 410, lastUsedAt: '2026-09-15T10:31:00Z' },
  { id: 'rdx-6', preferredName: '空气支气管征', preferredNameEn: 'Air bronchogram', synonyms: ['支气管充气征'], definition: '实变影中可见含气支气管影。', definitionEn: 'Air-filled bronchi visible within consolidation.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 230, lastUsedAt: '2026-09-10T11:00:00Z' },
  { id: 'rdx-7', preferredName: '晕轮征', preferredNameEn: 'Halo sign', synonyms: ['光晕征'], definition: '结节周围的磨玻璃影环绕。', definitionEn: 'Ground-glass opacity surrounding a nodule.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 180, lastUsedAt: '2026-09-08T14:00:00Z' },
  { id: 'rdx-8', preferredName: '反晕征', preferredNameEn: 'Reverse halo sign', synonyms: ['环礁征'], definition: '中央磨玻璃影被环形实变影包围。', definitionEn: 'Central GGO surrounded by a ring of consolidation.', childrenIds: [], modality: ['CT'], bodyPart: ['胸部'], category: '影像所见', usageCount: 90, lastUsedAt: '2026-09-05T09:00:00Z' },
];

// ============================================================
// 13. 历史报告 / 相似病例 Mock
// ============================================================
export const PRIOR_REPORTS_MOCK: PriorReport[] = [
  { id: 'pr-1', patientId: 'p-038', reportId: 'rpt-022', modality: 'CT', bodyPart: '胸部', studyDate: '2026-03-15T09:00:00Z', status: '已发布', findings: '右肺上叶尖段见一不规则形软组织密度结节,大小约 12mm×10mm,边界欠清,余肺野未见明显异常。', impression: '右肺上叶微小结节,建议 3-6 个月复查。', authorName: '王医师', comparisonDelta: { days: 184, summary: '较前明显增大' } },
  { id: 'pr-2', patientId: 'p-038', reportId: 'rpt-031', modality: 'CT', bodyPart: '胸部', studyDate: '2026-06-20T10:00:00Z', status: '已发布', findings: '右肺上叶尖段见一不规则形软组织密度结节,大小约 15mm×12mm,边界欠清,可见短毛刺征,平扫 CT 值约 30HU,增强后强化 CT 值约 65HU。', impression: '右肺上叶结节较前增大,周围型肺癌待排,建议穿刺活检。', authorName: '李医师', comparisonDelta: { days: 87, summary: '病灶较前明显增大 30%,强化程度增加' } },
];

export const SIMILAR_CASES_MOCK: SimilarCase[] = [
  { id: 'sc-1', reportId: 'rpt-099', patientId: 'p-099', modality: 'CT', bodyPart: '胸部', similarityScore: 0.92, topTerms: ['右肺上叶', '不规则形结节', '毛刺征', '胸膜牵拉', '周围型肺癌'], findings: '右肺上叶尖段见一不规则形软组织密度结节,大小约 20mm×17mm,边界欠清,可见短毛刺征,平扫 CT 值约 35HU,增强后明显强化。', impression: '右肺上叶周围型肺癌(腺癌可能性大)', authorName: '王医师', studyDate: '2026-08-10T09:00:00Z' },
  { id: 'sc-2', reportId: 'rpt-102', patientId: 'p-102', modality: 'CT', bodyPart: '胸部', similarityScore: 0.88, topTerms: ['右肺上叶', '不规则形', '强化', '活检'], findings: '右肺上叶不规则结节,大小约 16mm×14mm,增强后中度强化,纵隔未见肿大淋巴结。', impression: '右肺上叶结节,周围型肺癌可能性大,建议活检。', authorName: '陈医师', studyDate: '2026-08-22T10:00:00Z' },
  { id: 'sc-3', reportId: 'rpt-105', patientId: 'p-105', modality: 'CT', bodyPart: '胸部', similarityScore: 0.85, topTerms: ['肺上叶', '结节', '毛刺'], findings: '右肺上叶尖段不规则形结节,大小 19mm×16mm,可见毛刺征及胸膜牵拉,平扫 CT 值 33HU,增强后 75HU。', impression: '右肺上叶周围型肺癌。', authorName: '李医师', studyDate: '2026-08-30T11:00:00Z' },
];

// ============================================================
// 14. 报告模板
// ============================================================
export const REPORT_TEMPLATES_MOCK: ReportTemplate[] = [
  { id: 'tpl-1', name: '胸部 CT 标准模板', nameEn: 'Chest CT Standard', category: 'CT', subCategory: '胸部', modality: 'CT', bodyPart: '胸部', version: '3.2', inheritable: true, autoApply: true, content: '<h2>胸部 CT 平扫+增强</h2><p>...</p>', variables: [], rating: 4.8, useCount: 1240, rank: 1, approved: true, approver: '张主任', approvalDate: '2026-01-15', tags: ['胸部', 'CT', '标准'], authorId: 'u-001', authorName: '陈医师', createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'tpl-2', name: '头颅 MR 标准模板', nameEn: 'Brain MR Standard', category: 'MR', subCategory: '头颅', modality: 'MR', bodyPart: '头颅', version: '2.5', inheritable: true, autoApply: true, content: '<h2>头颅 MR 平扫</h2><p>...</p>', variables: [], rating: 4.7, useCount: 980, rank: 2, approved: true, approver: '张主任', approvalDate: '2026-01-15', tags: ['头颅', 'MR'], authorId: 'u-002', authorName: '王医师', createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'tpl-3', name: '上腹部 CT 增强模板', nameEn: 'Abdomen CT Enhanced', category: 'CT', subCategory: '腹部', modality: 'CT', bodyPart: '腹部', version: '3.0', inheritable: true, autoApply: true, content: '<h2>上腹部 CT 增强</h2><p>...</p>', variables: [], rating: 4.6, useCount: 870, rank: 3, approved: true, approver: '张主任', approvalDate: '2026-01-15', tags: ['腹部', 'CT', '增强'], authorId: 'u-003', authorName: '李医师', createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'tpl-4', name: '乳腺钼靶标准模板', nameEn: 'Mammography Standard', category: 'MG', subCategory: '乳腺', modality: 'MG', bodyPart: '乳腺', version: '2.0', inheritable: true, autoApply: true, content: '<h2>乳腺钼靶</h2><p>...</p>', variables: [], rating: 4.9, useCount: 540, rank: 4, approved: true, approver: '李主任', approvalDate: '2026-02-20', tags: ['乳腺', 'MG', 'BI-RADS'], authorId: 'u-004', authorName: '赵医师', createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
  { id: 'tpl-5', name: '腰椎 MR 平扫模板', nameEn: 'Lumbar Spine MR', category: 'MR', subCategory: '脊柱', modality: 'MR', bodyPart: '脊柱', version: '2.3', inheritable: true, autoApply: true, content: '<h2>腰椎 MR 平扫</h2><p>...</p>', variables: [], rating: 4.5, useCount: 620, rank: 5, approved: true, approver: '张主任', approvalDate: '2026-01-15', tags: ['脊柱', 'MR'], authorId: 'u-005', authorName: '孙医师', createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-08-15T10:00:00Z' },
];

export const TEMPLATE_CATEGORIES_MOCK: TemplateCategory[] = [
  { id: 'tc-1', name: 'CT', nameEn: 'CT', childrenIds: ['tc-1-1', 'tc-1-2', 'tc-1-3'], icon: '🖥', order: 1 },
  { id: 'tc-1-1', name: '胸部', nameEn: 'Chest', parentId: 'tc-1', childrenIds: [], icon: '🫁', order: 1 },
  { id: 'tc-1-2', name: '腹部', nameEn: 'Abdomen', parentId: 'tc-1', childrenIds: [], icon: '🩺', order: 2 },
  { id: 'tc-1-3', name: '头颅', nameEn: 'Head', parentId: 'tc-1', childrenIds: [], icon: '🧠', order: 3 },
  { id: 'tc-2', name: 'MR', nameEn: 'MR', childrenIds: ['tc-2-1', 'tc-2-2'], icon: '🧲', order: 2 },
  { id: 'tc-2-1', name: '头颅', nameEn: 'Brain', parentId: 'tc-2', childrenIds: [], icon: '🧠', order: 1 },
  { id: 'tc-2-2', name: '脊柱', nameEn: 'Spine', parentId: 'tc-2', childrenIds: [], icon: '🦴', order: 2 },
  { id: 'tc-3', name: 'DR/CR', nameEn: 'X-Ray', childrenIds: [], icon: '📷', order: 3 },
  { id: 'tc-4', name: 'MG(乳腺)', nameEn: 'Mammography', childrenIds: [], icon: '🎀', order: 4 },
  { id: 'tc-5', name: 'US(超声)', nameEn: 'Ultrasound', childrenIds: [], icon: '🔊', order: 5 },
];

// ============================================================
// 15. 草稿
// ============================================================
export const REPORT_DRAFTS_MOCK: ReportDraft[] = [
  { id: 'draft-1', reportId: 'rpt-038', authorId: 'u-001', authorName: '陈医师', content: '右肺上叶...', html: '<p>右肺上叶...</p>', structured: {}, wordCount: 245, version: 7, versionLabel: 'v7', createdAt: '2026-09-15T10:30:00Z', updatedAt: '2026-09-15T11:00:00Z', autoSaved: true, conflict: false, tags: ['当前'] },
  { id: 'draft-2', reportId: 'rpt-038', authorId: 'u-001', authorName: '陈医师', content: '右肺上叶尖段...', html: '<p>右肺上叶尖段...</p>', structured: {}, wordCount: 198, version: 6, versionLabel: 'v6', createdAt: '2026-09-15T10:00:00Z', updatedAt: '2026-09-15T10:25:00Z', autoSaved: true, conflict: false, tags: ['历史'] },
  { id: 'draft-3', reportId: 'rpt-038', authorId: 'u-001', authorName: '陈医师', content: '胸部 CT...', html: '<p>胸部 CT...</p>', structured: {}, wordCount: 156, version: 5, versionLabel: 'v5', createdAt: '2026-09-15T09:00:00Z', updatedAt: '2026-09-15T09:55:00Z', autoSaved: false, conflict: false, tags: ['历史'] },
];

// ============================================================
// 16. 书写度量 / 预评分
// ============================================================
export const WRITING_METRICS_MOCK: WritingMetrics = {
  reportId: 'rpt-038',
  startAt: '2026-09-15T10:30:00Z',
  durationSec: 1845,
  pauseCount: 3,
  pauseTotalSec: 95,
  longestPauseSec: 45,
  keystrokeCount: 1850,
  voiceWordsCount: 78,
  typedWordsCount: 167,
  phrasesUsed: 12,
  imagesInserted: 3,
  pagesGenerated: 2,
  speedWordsPerMin: 25.4,
  pagePerformanceMs: 280,
};

export const PRE_SUBMIT_SCORE_MOCK: PreSubmitScore = {
  reportId: 'rpt-038',
  score: 88,
  dimensions: [
    { name: '完整性', nameEn: 'Completeness', score: 92, weight: 0.25 },
    { name: '规范性', nameEn: 'Standardization', score: 90, weight: 0.20 },
    { name: '准确性', nameEn: 'Accuracy', score: 85, weight: 0.25 },
    { name: '及时性', nameEn: 'Timeliness', score: 88, weight: 0.10 },
    { name: '术语规范', nameEn: 'Terminology', score: 86, weight: 0.15 },
    { name: '危急值标注', nameEn: 'Critical Annotation', score: 80, weight: 0.05 },
  ],
  checklist: [
    { id: 'cl-1', label: '患者信息完整', labelEn: 'Patient info complete', passed: true, weight: 0.10 },
    { id: 'cl-2', label: '检查技术描述', labelEn: 'Technique described', passed: true, weight: 0.10 },
    { id: 'cl-3', label: '影像所见完整', labelEn: 'Findings complete', passed: true, weight: 0.20 },
    { id: 'cl-4', label: '诊断意见明确', labelEn: 'Impression clear', passed: true, weight: 0.20 },
    { id: 'cl-5', label: '建议合理', labelEn: 'Recommendation reasonable', passed: true, weight: 0.10 },
    { id: 'cl-6', label: '关键图像标注', labelEn: 'Key image annotated', passed: true, weight: 0.10 },
    { id: 'cl-7', label: '危急值标注', labelEn: 'Critical annotated', passed: false, weight: 0.10 },
    { id: 'cl-8', label: '术语规范', labelEn: 'Terminology', passed: true, weight: 0.10 },
  ],
  aiPreReview: { score: 86, issues: ['建议补充"胸膜牵拉征"细节描述', '"周围型肺癌"诊断应注明病理类型待定'], passed: true },
  termCheck: { checked: 156, issues: ['"肺癌"建议加注"待病理证实"'] },
  requiredFieldsFilled: true,
  criticalValuesAnnotated: false,
  passed: false,
  createdAt: '2026-09-15T11:05:00Z',
};

// ============================================================
// 17. 多模态 / 关键字高亮
// ============================================================
export const MULTI_MODALITY_MOCK: MultiModalityPanel = {
  id: 'mmp-1',
  reportId: 'rpt-038',
  modalities: [
    { modality: 'CT', studyUID: '1.2.840.10008.5.1.4.1.1.2.1.1', seriesCount: 3, thumbnail: '/mock/ct-thumb.png' },
    { modality: 'MR', studyUID: '1.2.840.10008.5.1.4.1.1.4.1.1', seriesCount: 5, thumbnail: '/mock/mr-thumb.png' },
    { modality: 'PET-CT', studyUID: '1.2.840.10008.5.1.4.1.1.128.1.1', seriesCount: 2, thumbnail: '/mock/pet-thumb.png' },
  ],
  activeModality: 'CT',
  crossFindings: [
    { id: 'cf-1', label: '右肺上叶病灶', labelEn: 'RUL Lesion', matchedAcrossModalities: ['CT', 'MR', 'PET-CT'], mergedText: '右肺上叶尖段不规则形软组织密度结节,CT 平扫约 32HU,MR T2W 呈稍高信号,DWI 明显弥散受限,PET-CT 显像示 FDG 代谢增高(SUVmax=6.8)。', confidence: 0.94 },
  ],
  syncScroll: true,
  diffHighlights: [
    { modality: 'CT', color: '#0891b2', notes: '肺窗-600/1500 观察最佳' },
    { modality: 'MR', color: '#7c3aed', notes: 'T2W + DWI 综合评估' },
    { modality: 'PET-CT', color: '#dc2626', notes: '代谢评估' },
  ],
};

export const KEYWORD_HIGHLIGHTS_MOCK: KeywordHighlight[] = [
  { term: '结节', termEn: 'Nodule', category: 'finding', color: '#dc2626', bg: '#fee2e2', weight: 5 },
  { term: '毛刺征', termEn: 'Spiculation', category: 'finding', color: '#dc2626', bg: '#fee2e2', weight: 5 },
  { term: '强化', termEn: 'Enhancement', category: 'finding', color: '#3b82f6', bg: '#dbeafe', weight: 4 },
  { term: '胸腔积液', termEn: 'Pleural Effusion', category: 'finding', color: '#3b82f6', bg: '#dbeafe', weight: 4 },
  { term: '淋巴结肿大', termEn: 'Lymphadenopathy', category: 'finding', color: '#ea580c', bg: '#fed7aa', weight: 5 },
  { term: '肺癌', termEn: 'Lung Cancer', category: 'diagnosis', color: '#dc2626', bg: '#fee2e2', weight: 6 },
  { term: '建议活检', termEn: 'Biopsy Recommended', category: 'recommendation', color: '#0891b2', bg: '#cffafe', weight: 4 },
  { term: '危急值', termEn: 'Critical Value', category: 'critical', color: '#dc2626', bg: '#fee2e2', weight: 6 },
  { term: '主动脉', termEn: 'Aorta', category: 'anatomy', color: '#6b7280', bg: '#f3f4f6', weight: 2 },
  { term: '肺动脉', termEn: 'Pulmonary Artery', category: 'anatomy', color: '#6b7280', bg: '#f3f4f6', weight: 2 },
];

// ============================================================
// 18. 主聚合(报告 ID = rpt-038 示例)
// ============================================================
export const REPORT_WRITING_CONTEXT_MOCK: ReportWritingContext = {
  reportId: 'rpt-038',
  patientId: 'p-038',
  modality: 'CT',
  bodyPart: '胸部',
  template: RECIST_TEMPLATE,
  fields: {
    baselineDate: '2026-06-15',
    lesionCount: 5,
    measurementMethod: 'CT',
    lesion1Site: '右肺上叶(尖段)',
    lesion1Long: 18,
    lesion1Baseline: 28,
    lesion2Site: '右肺中叶(外侧段)',
    lesion2Long: 12,
    lesion2Baseline: 18,
    lesion3Site: '左肺下叶(背段)',
    lesion3Long: 9,
    lesion3Baseline: 14,
    lesion4Site: '纵隔淋巴结(2R)',
    lesion4Long: 15,
    lesion4Baseline: 22,
    lesion5Site: '肝右叶(S6)',
    lesion5Long: 22,
    lesion5Baseline: 35,
    nonTargetLesions: true,
    newLesion: false,
    sumOfDiameters: 76,
    baselineSum: 117,
    percentChange: -35.0,
    responseCategory: 'PR',
    treatmentLine: '2L',
    assessor: '陈医师',
  },
  recist: RECIST_RESPONSE,
  document: RICH_DOCUMENT_MOCK,
  aiDraft: AI_DRAFT_RESULT,
  voice: VOICE_DICTATION_MOCK,
  anchors: IMAGE_ANCHORS_MOCK,
  phrases: PHRASES_MOCK,
  priorReports: PRIOR_REPORTS_MOCK,
  similarCases: SIMILAR_CASES_MOCK,
  drafts: REPORT_DRAFTS_MOCK,
  metrics: WRITING_METRICS_MOCK,
  preSubmitScore: PRE_SUBMIT_SCORE_MOCK,
  multiModality: MULTI_MODALITY_MOCK,
  keywords: KEYWORD_HIGHLIGHTS_MOCK,
};

// ============================================================
// 19. 100+ 报告列表虚拟化
// ============================================================
export interface VirtualReportRow {
  id: string;
  reportId: string;
  patientId: string;
  patientName: string;
  patientGender: '男' | '女';
  patientAge: number;
  modality: string;
  bodyPart: string;
  studyDate: string;
  status: string;
  authorName: string;
  reviewerName?: string;
  priority: '普通' | '紧急' | '危重' | '会诊';
  qualityScore: number;
  wordCount: number;
  writingDurationMin: number;
  hasCritical: boolean;
  templateName: string;
  group: 'draft' | 'review' | 'sign' | 'published' | 'special';
}

const PATIENT_NAMES = ['张敏', '李华', '王芳', '赵建国', '刘洋', '陈静', '杨阳', '黄海涛', '周琳', '吴桐', '徐文博', '孙文静', '马云', '朱凤', '胡军', '林涛', '何欣怡', '高翔', '罗明月', '郑伟杰'];
const MODALITIES = ['CT', 'MR', 'DR', 'US', 'MG', 'DSA', 'PET-CT'];
const BODY_PARTS = ['胸部', '腹部', '头颅', '盆腔', '脊柱', '四肢', '心脏', '血管', '乳腺', '前列腺'];
const AUTHORS = ['陈医师', '王医师', '李医师', '赵医师', '孙医师', '周医师', '吴医师', '郑医师'];
const STATUSES = ['待分配', '已分配', '书写中', '已提交', '初审中', '初审通过', '终审中', '已审核', '签发中', '已签发', '已发布', '修订中', '已修订'];
const TEMPLATES = ['胸部 CT 标准模板', '头颅 MR 标准模板', '上腹部 CT 增强模板', '乳腺钼靶标准模板', '腰椎 MR 平扫模板', '心脏 CTA 模板', '冠脉 CTA 模板', '颅脑 MR 增强模板', '前列腺 mpMRI 模板', '肺结节低剂量 CT 模板'];
const GROUPS: VirtualReportRow['group'][] = ['draft', 'review', 'sign', 'published', 'special'];

export const VIRTUAL_REPORT_LIST: VirtualReportRow[] = Array.from({ length: 120 }, (_, i) => {
  const group = GROUPS[i % 5] ?? 'draft';
  const statusIdx = (() => {
    switch (group) {
      case 'draft': return i % 3;
      case 'review': return 3 + (i % 6);
      case 'sign': return 8 + (i % 2);
      case 'published': return 10;
      case 'special': return 11 + (i % 3);
    }
  })();
  const status = STATUSES[statusIdx] ?? '书写中';
  const studyDate = new Date(Date.now() - (i * 86400000) - Math.random() * 86400000).toISOString();
  return {
    id: `vr-${i + 1}`,
    reportId: `RP${(2026000 + i).toString()}`,
    patientId: `p-${(1000 + i).toString()}`,
    patientName: PATIENT_NAMES[i % PATIENT_NAMES.length] ?? '匿名',
    patientGender: i % 2 === 0 ? '男' : '女',
    patientAge: 18 + (i % 70),
    modality: MODALITIES[i % MODALITIES.length] ?? 'CT',
    bodyPart: BODY_PARTS[i % BODY_PARTS.length] ?? '胸部',
    studyDate,
    status,
    authorName: AUTHORS[i % AUTHORS.length] ?? '陈医师',
    reviewerName: group === 'review' || group === 'sign' ? AUTHORS[(i + 1) % AUTHORS.length] : undefined,
    priority: (['普通', '紧急', '危重', '会诊'] as const)[i % 4] ?? '普通',
    qualityScore: 60 + (i % 40),
    wordCount: 150 + (i * 7) % 400,
    writingDurationMin: 8 + (i % 60),
    hasCritical: i % 15 === 0,
    templateName: TEMPLATES[i % TEMPLATES.length] ?? '胸部 CT 标准模板',
    group,
  };
});

export const VIRTUAL_REPORT_TOTAL = VIRTUAL_REPORT_LIST.length;
