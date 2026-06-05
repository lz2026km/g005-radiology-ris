// ============================================================
// NI-RADS (Neck Imaging Reporting and Data System) v2025
// 头颈癌治疗后 MR 监测
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type NiRadsCategory = '1' | '2' | '3' | '4';

export const NI_RADS_CATEGORIES: Record<NiRadsCategory, RadsCategory> = {
  '1': { code: '1', name: '无复发证据',         description: '原发灶和颈部均无可疑发现',           riskPercent: '低',  recommendation: '常规随访',         isActionable: false },
  '2': { code: '2', name: '低度怀疑',           description: '异常但低度怀疑（炎症/治疗反应）',   riskPercent: '中',  recommendation: '短期间 MR 随访',   isActionable: true  },
  '3': { code: '3', name: '高度怀疑',           description: '新发/进展可疑病灶',                 riskPercent: '高',  recommendation: '活检确认',         isActionable: true  },
  '4': { code: '4', name: '确定复发',           description: '明确恶性征象 + 病理证实',           riskPercent: '极高', recommendation: '多学科会诊 + 治疗', isActionable: true  },
};

export const NI_RADS_TARGET_RISK = ['低风险 HPV+ 口咽癌', '高风险 HPV 口咽癌', '喉/下咽癌', '鼻咽癌', '口腔癌'] as const;

export const NI_RADS_SNIPPETS: Record<NiRadsCategory, RadsReportSnippet> = {
  '1': {
    category: '1',
    findingTemplate: '原发部位及颈部均未见明确复发征象；可见治疗后改变（如水肿/纤维化/黏膜增厚）。',
    impressionTemplate: 'NI-RADS 1：原发灶 + 颈部：无复发证据。',
    recommendationTemplate: '常规 MR 随访。',
  },
  '2': {
    category: '2',
    findingTemplate: '原发部位/颈部见 [轻度异常：弥漫性黏膜增厚/弥漫性 T2 信号] 但无明确肿块。',
    impressionTemplate: 'NI-RADS 2：原发灶/颈部：低度怀疑（可能为炎症或治疗反应）。',
    recommendationTemplate: '3 个月内 MR 随访复查；必要时 PET-CT。',
  },
  '3': {
    category: '3',
    findingTemplate: '原发部位/颈部见 [可疑病灶：新发/进展 T2 高信号 + 弥散受限 + 强化]。',
    impressionTemplate: 'NI-RADS 3：原发灶/颈部：高度怀疑复发。',
    recommendationTemplate: '建议活检明确病理。',
  },
  '4': {
    category: '4',
    findingTemplate: '原发部位/颈部见 [明确恶性征象：肿块+淋巴结/包膜外侵犯]，病理证实复发。',
    impressionTemplate: 'NI-RADS 4：原发灶/颈部：确定复发。',
    recommendationTemplate: '多学科会诊 + 系统治疗。',
  },
};

export function scoreNiRads(input: {
  hasNewMass?: boolean;
  hasDiffusionRestriction?: boolean;
  hasEnhancement?: boolean;
  isPathologyConfirmed?: boolean;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: NiRadsCategory = '1';

  if (input.isPathologyConfirmed) {
    cat = '4';
    details.push('病理证实复发');
  } else if (input.hasNewMass && (input.hasDiffusionRestriction || input.hasEnhancement)) {
    cat = '3';
    details.push('新发肿块 + DWI/强化');
  } else if (input.hasDiffusionRestriction || input.hasEnhancement) {
    cat = '2';
    details.push('弥散受限或强化但无明确肿块');
  }

  const catInfo = NI_RADS_CATEGORIES[cat];
  const riskMap: Record<NiRadsCategory, RadsScoringResult['riskLevel']> = {
    '1': 'low', '2': 'intermediate', '3': 'high', '4': 'very-high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '1': 10, '2': 40, '3': 75, '4': 100 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；') || '治疗后改变，无明确复发',
    modifiers: [],
  };
}

export const NI_RADS_STATS = {
  system: 'NI-RADS',
  version: 'v2025',
  source: 'ACR',
  categories: 4,
  regions: ['原发灶', '颈部'],
} as const;
