// ============================================================
// O-RADS (Ovarian-Adnexal Reporting and Data System) US v2022 / MRI v2022
// 卵巢-附件病变报告
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type ORadsUsCategory = '0' | '1' | '2' | '3' | '4' | '5';
export type ORadsMriCategory = '1' | '2' | '3' | '4' | '5';

// US
export const O_RADS_US_CATEGORIES: Record<ORadsUsCategory, RadsCategory> = {
  '0': { code: '0', name: '评估不完全',     description: '需要进一步评估',           riskPercent: 'N/A',  recommendation: 'MRI / 专科会诊',     isActionable: true  },
  '1': { code: '1', name: '正常卵巢',       description: '生理性滤泡/黄体',         riskPercent: '<1%',  recommendation: '常规随访',           isActionable: false },
  '2': { code: '2', name: '几乎良性',       description: '典型良性病变',             riskPercent: '<1%',  recommendation: '无需随访',           isActionable: false },
  '3': { code: '3', name: '低风险',         description: '单房囊性/单纯黄体样',     riskPercent: '1-<10%', recommendation: '1 年内 US/MRI 随访', isActionable: true  },
  '4': { code: '4', name: '中等风险',       description: '多房囊性/实性成分',         riskPercent: '10-<50%', recommendation: '妇科会诊（短期随访/MRI）', isActionable: true },
  '5': { code: '5', name: '高风险',         description: '实性/乳头状/丰富血流',     riskPercent: '≥50%', recommendation: '妇科肿瘤会诊',       isActionable: true },
};

// MRI
export const O_RADS_MRI_CATEGORIES: Record<ORadsMriCategory, RadsCategory> = {
  '1': { code: '1', name: '几乎良性',       description: '无实性组织',               riskPercent: '<1%',     recommendation: '无需处理',           isActionable: false },
  '2': { code: '2', name: '低风险',         description: '脂肪/出血/纤维成分',       riskPercent: '<5%',     recommendation: '无需处理',           isActionable: false },
  '3': { code: '3', name: '中等风险',       description: '实性组织（低风险特征）',   riskPercent: '~50%',    recommendation: '妇科会诊',           isActionable: true  },
  '4': { code: '4', name: '中高风险',       description: '实性组织（中度特征）',     riskPercent: '~70%',    recommendation: '妇科肿瘤会诊',       isActionable: true  },
  '5': { code: '5', name: '高风险',         description: '实性组织（高度特征）',     riskPercent: '>90%',    recommendation: '妇科肿瘤 + 外科',     isActionable: true  },
};

export const O_RADS_US_SNIPPETS: Record<ORadsUsCategory, RadsReportSnippet> = {
  '0': { category: '0', findingTemplate: '本次 US 评估不完全。', impressionTemplate: 'O-RADS US 0：评估不完全。', recommendationTemplate: '建议 MRI 评估或专科会诊。' },
  '1': { category: '1', findingTemplate: '双侧卵巢大小正常，内见 [滤泡/黄体] 表现。', impressionTemplate: 'O-RADS US 1：正常卵巢。', recommendationTemplate: '常规随访。' },
  '2': { category: '2', findingTemplate: '附件区见 [典型良性病变：单纯囊肿/出血性囊肿/成熟囊性畸胎瘤/腹膜假性囊肿]，形态典型良性。', impressionTemplate: 'O-RADS US 2：几乎良性。', recommendationTemplate: '无需特殊随访。' },
  '3': { category: '3', findingTemplate: '附件区见 [单房/单房伴薄分隔] [尺寸] mm 病变，乳头 [无/小]，血流 [无/少]。', impressionTemplate: 'O-RADS US 3：低风险（1-<10%）。', recommendationTemplate: '1 年内 US/MRI 随访。' },
  '4': { category: '4', findingTemplate: '附件区见 [多房/实性成分] [尺寸] mm 病变，伴 [可疑特征]。', impressionTemplate: 'O-RADS US 4：中等风险（10-<50%）。', recommendationTemplate: '妇科会诊；考虑 MRI 进一步评估。' },
  '5': { category: '5', findingTemplate: '附件区见 [实性/不规则实性/丰富血流/外生乳头] [尺寸] mm 病变。', impressionTemplate: 'O-RADS US 5：高风险（≥50%）。', recommendationTemplate: '妇科肿瘤多学科会诊。' },
};

export const O_RADS_MRI_SNIPPETS: Record<ORadsMriCategory, RadsReportSnippet> = {
  '1': { category: '1', findingTemplate: '附件区见 [无实性组织：单纯囊性病变]。', impressionTemplate: 'O-RADS MRI 1：几乎良性。', recommendationTemplate: '无需处理。' },
  '2': { category: '2', findingTemplate: '附件区见含 [脂肪/T2 高信号出血/T2 低信号纤维] 病变。', impressionTemplate: 'O-RADS MRI 2：低风险。', recommendationTemplate: '无需处理。' },
  '3': { category: '3', findingTemplate: '附件区见 [实性组织伴低风险特征：低 DWI/T2 中等]。', impressionTemplate: 'O-RADS MRI 3：中等风险。', recommendationTemplate: '妇科会诊。' },
  '4': { category: '4', findingTemplate: '附件区见 [实性组织伴中度风险特征]。', impressionTemplate: 'O-RADS MRI 4：中高风险。', recommendationTemplate: '妇科肿瘤会诊。' },
  '5': { category: '5', findingTemplate: '附件区见 [实性组织伴高风险特征：高 DWI 强化]。', impressionTemplate: 'O-RADS MRI 5：高风险。', recommendationTemplate: '妇科肿瘤 + 外科。' },
};

export function scoreORadsUs(input: {
  isNormal?: boolean;
  isTypicalBenign?: boolean;
  isUnilocular?: boolean;
  isMultilocular?: boolean;
  isSolid?: boolean;
  hasPapillation?: boolean;
  hasAscites?: boolean;
  hasRichVascularity?: boolean;
  sizeMm: number;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: ORadsUsCategory = '0';

  if (input.isNormal) {
    cat = '1';
  } else if (input.isTypicalBenign) {
    cat = '2';
  } else if (input.isSolid || (input.hasPapillation && input.hasRichVascularity) || input.hasAscites) {
    cat = '5';
    details.push('实性 / 富血供乳头 / 腹水');
  } else if (input.isMultilocular || (input.hasPapillation && !input.hasRichVascularity)) {
    cat = '4';
    details.push('多房或可疑乳头');
  } else if (input.isUnilocular) {
    cat = '3';
  }

  const catInfo = O_RADS_US_CATEGORIES[cat];
  const riskMap: Record<ORadsUsCategory, RadsScoringResult['riskLevel']> = {
    '0': 'intermediate', '1': 'very-low', '2': 'very-low',
    '3': 'low', '4': 'intermediate', '5': 'very-high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '0': 0, '1': 5, '2': 10, '3': 30, '4': 55, '5': 90 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；') || `附件病变 ${input.sizeMm} mm`,
    modifiers: [],
  };
}

export const O_RADS_STATS = {
  system: 'O-RADS',
  version: 'v2022',
  source: 'ACR',
  usCategories: 6,
  mriCategories: 5,
} as const;
