// ============================================================
// LI-RADS (Liver Imaging Reporting and Data System) v2018
// 肝癌高危患者肝细胞癌 CT/MRI 报告
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type LiRadsCategory =
  | 'LR-1' | 'LR-2' | 'LR-3' | 'LR-4' | 'LR-5'
  | 'LR-M' | 'LR-TIV' | 'LR-NC';

export const LI_RADS_CATEGORIES: Record<LiRadsCategory, RadsCategory> = {
  'LR-1':   { code: 'LR-1',   name: '确定良性',         description: '囊肿/血管瘤/灌注缺损等明确良性', riskPercent: '0%',  recommendation: '常规随访',       isActionable: false },
  'LR-2':   { code: 'LR-2',   name: '可能良性',         description: 'LR-1 表现不典型，倾向良性',         riskPercent: '<5%',  recommendation: '6 月后影像复查', isActionable: true  },
  'LR-3':   { code: 'LR-3',   name: '中等概率',         description: '既非明确良性也非明确 HCC',         riskPercent: '30-50%', recommendation: '3-6 月增强 CT/MR 复查', isActionable: true },
  'LR-4':   { code: 'LR-4',   name: '可能 HCC',         description: 'HCC 大部分主要征象 + 1 项附加',     riskPercent: '60-80%', recommendation: '多学科会诊（MDT）', isActionable: true },
  'LR-5':   { code: 'LR-5',   name: '确定 HCC',         description: '非边缘 APHE + 廓清 + 增大或包膜',   riskPercent: '>95%', recommendation: '无需活检，按 HCC 治疗', isActionable: true },
  'LR-M':   { code: 'LR-M',   name: '可能恶性非 HCC',   description: '靶环/廓清 + 中心低信号（IRM）',     riskPercent: '>50%',  recommendation: '活检排除非 HCC 恶性', isActionable: true },
  'LR-TIV': { code: 'LR-TIV', name: '静脉癌栓',         description: '静脉内明确软组织强化',             riskPercent: '>95%',  recommendation: '多学科会诊',       isActionable: true },
  'LR-NC':  { code: 'LR-NC',  name: '不可分类',         description: '技术不充分或对比剂丢失',           riskPercent: 'N/A',  recommendation: '重做检查',         isActionable: true  },
};

// 主要征象
export const MAJOR_FEATURES = {
  size: '观察最大径 (mm)',
  nonrimAPHE: '非边缘动脉期高强化',
  washout: '门脉期/延迟期廓清',
  thresholdGrowth: '阈值增长（≥50% 在 ≤6 月内）',
  capsule: '包膜强化（延迟期/门脉期）',
} as const;

// 辅助征象 - 支持 HCC
export const ANCILLARY_FAVORING_HCC = [
  'T2 中等信号',
  '扩散受限',
  '廓清 + 廓清范围',
  '病灶内脂肪',
  '病灶内出血',
  '结节中结节（高分级结节中含低分级结节）',
  '动静脉分流（TTPAS）',
  '廓清阈值降低',
  '铁缺乏型结节',
  '同/反相位信号减低（脂肪变）',
  'HBP 低信号（肝胆期）',
  '靶样 HBP 信号',
  '前/后处理大小不匹配',
  '前/后处理强化不匹配',
  '前/后处理 T2 信号不匹配',
  '多灶性',
] as const;

// 辅助征象 - 支持恶性（非 HCC 特异）
export const ANCILLARY_FAVORING_MALIGNANCY = [
  'USP 弥散受限',
  'T2 中-高信号',
  '前/后处理大小不匹配',
  '前/后处理强化不匹配',
  '靶样 HBP 信号（仅 LR-M）',
  '廓清阈值降低',
  '铁缺乏型结节',
  '动静脉分流',
] as const;

// 辅助征象 - 支持良性
export const ANCILLARY_FAVORING_BENIGNITY = [
  '病灶缩小 ≥ 50%',
  'HBP 等信号（肝细胞特异对比剂）',
  'T2 显著高信号（提示血管瘤）',
  'T1 高信号（出血/脂肪）',
  '多时相无强化 + 随访稳定',
  '廓清 + 持续性 + 同心性',
] as const;

export const LI_RADS_SNIPPETS: Record<LiRadsCategory, RadsReportSnippet> = {
  'LR-1': {
    category: 'LR-1',
    findingTemplate: '肝内见 [确定性良性表现：单纯囊肿/典型血管瘤/S2 灌注异常等]。',
    impressionTemplate: 'LI-RADS 1：确定良性。',
    recommendationTemplate: '无需特殊处理，继续常规监测。',
  },
  'LR-2': {
    category: 'LR-2',
    findingTemplate: '肝 [段] 见 [尺寸] mm [典型良性表现不典型：例如低密度小灶]。',
    impressionTemplate: 'LI-RADS 2：可能良性。',
    recommendationTemplate: '6 个月后增强 CT/MR 复查。',
  },
  'LR-3': {
    category: 'LR-3',
    findingTemplate: '肝 [段] 见 [尺寸] mm [所见描述]，不满足 LR-4/5 标准。',
    impressionTemplate: 'LI-RADS 3：中等概率恶性。',
    recommendationTemplate: '3-6 个月后增强 CT/MR 复查；考虑活检。',
  },
  'LR-4': {
    category: 'LR-4',
    findingTemplate: '肝 [段] 见 [尺寸] mm 病灶伴 [主要征象：非边缘 APHE] + [附加征象：廓清等]。',
    impressionTemplate: 'LI-RADS 4：可能 HCC。',
    recommendationTemplate: '多学科会诊（MDT）讨论活检/消融/手术。',
  },
  'LR-5': {
    category: 'LR-5',
    findingTemplate: '肝 [段] 见 [尺寸] mm 病灶伴 [非边缘 APHE + 廓清 + 大小阈值增长/包膜强化]。',
    impressionTemplate: 'LI-RADS 5：确定 HCC。',
    recommendationTemplate: '无需活检，按 BCLC 分期进行相应治疗。',
  },
  'LR-M': {
    category: 'LR-M',
    findingTemplate: '肝 [段] 见 [尺寸] mm 病灶，伴 [靶环征 + 中心 T2 高信号]，倾向非 HCC 恶性。',
    impressionTemplate: 'LI-RADS M：可能恶性（非 HCC 特异）。',
    recommendationTemplate: '建议穿刺活检明确病理。',
  },
  'LR-TIV': {
    category: 'LR-TIV',
    findingTemplate: '[门静脉/肝静脉/下腔静脉] 内见软组织充盈缺损伴强化，符合静脉癌栓。',
    impressionTemplate: 'LI-RADS TIV：静脉癌栓。',
    recommendationTemplate: '多学科会诊（MDT）。',
  },
  'LR-NC': {
    category: 'LR-NC',
    findingTemplate: '本次图像技术不充分或对比剂时相缺失，无法可靠分类。',
    impressionTemplate: 'LI-RADS NC：不可分类。',
    recommendationTemplate: '重做检查。',
  },
};

export function scoreLiRads(input: {
  sizeMm: number;
  hasNonrimAPHE?: boolean;
  hasWashout?: boolean;
  hasThresholdGrowth?: boolean;
  hasCapsule?: boolean;
  hasTargetAppearance?: boolean;
  hasTIV?: boolean;
  isUnclassifiable?: boolean;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: LiRadsCategory = 'LR-3';

  if (input.isUnclassifiable) {
    cat = 'LR-NC';
  } else if (input.hasTIV) {
    cat = 'LR-TIV';
    details.push('静脉癌栓');
  } else if (input.hasTargetAppearance) {
    cat = 'LR-M';
    details.push('靶环征');
  } else {
    // LI-RADS 5 条件：非边缘 APHE + 廓清 + (阈值增长 OR 包膜)
    if (input.hasNonrimAPHE && input.hasWashout && (input.hasThresholdGrowth || input.hasCapsule)) {
      cat = 'LR-5';
      details.push('APHE + 廓清 + 增大/包膜');
    } else if (input.hasNonrimAPHE && input.hasWashout) {
      cat = 'LR-4';
      details.push('APHE + 廓清');
    } else if (input.sizeMm < 20) {
      cat = 'LR-2';
    }
  }

  const catInfo = LI_RADS_CATEGORIES[cat];
  const riskMap: Record<LiRadsCategory, RadsScoringResult['riskLevel']> = {
    'LR-1': 'very-low', 'LR-2': 'low', 'LR-3': 'intermediate',
    'LR-4': 'high', 'LR-5': 'very-high',
    'LR-M': 'high', 'LR-TIV': 'very-high', 'LR-NC': 'intermediate',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { 'LR-1': 0, 'LR-2': 15, 'LR-3': 40, 'LR-4': 70, 'LR-5': 95, 'LR-M': 75, 'LR-TIV': 95, 'LR-NC': 0 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；') || `基于主要征象评估（${input.sizeMm}mm）`,
    modifiers: [],
  };
}

export const LI_RADS_STATS = {
  system: 'LI-RADS',
  version: 'v2018',
  source: 'ACR',
  categories: 8,
  majorFeatures: 5,
  ancillaryFeatures: 31,
} as const;
