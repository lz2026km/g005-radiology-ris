// ============================================================
// TI-RADS (ACR Thyroid Imaging Reporting and Data System)
// 甲状腺超声报告 - 基于评分的分类
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type TiRadsCategory = 'TR1' | 'TR2' | 'TR3' | 'TR4' | 'TR5';

export const TI_RADS_CATEGORIES: Record<TiRadsCategory, RadsCategory> = {
  TR1: { code: 'TR1', name: '良性',             description: '完全囊性结节',                       riskPercent: '~0%',  recommendation: '无需活检',  isActionable: false },
  TR2: { code: 'TR2', name: '无可疑',           description: '0 分',                              riskPercent: '<2%',  recommendation: '无需活检',  isActionable: false },
  TR3: { code: 'TR3', name: '低度可疑',         description: '3 分',                              riskPercent: '<5%',  recommendation: '≥ 2.5 cm 活检 / 随访',  isActionable: true },
  TR4: { code: 'TR4', name: '中度可疑',         description: '4-6 分',                            riskPercent: '5-20%', recommendation: '≥ 1.5 cm 活检 / 随访', isActionable: true },
  TR5: { code: 'TR5', name: '高度可疑',         description: '≥ 7 分',                            riskPercent: '>20%', recommendation: '≥ 1.0 cm 活检',  isActionable: true },
};

// 5 维评分词典（0-3 分）
export const TI_RADS_FEATURES = {
  composition: {
    '0': '囊性或几乎完全囊性',
    '1': '海绵状',
    '2': '囊实混合（实性成分 < 50%）',
    '3': '实性或几乎完全实性',
  },
  echogenicity: {
    '0': '无回声',
    '1': '高回声或等回声',
    '2': '低回声',
    '3': '极低回声',
  },
  shape: {
    '0': '横径 > 纵径（宽 > 高）',
    '3': '纵径 > 横径（高 > 宽）',
  },
  margin: {
    '0': '光整或模糊',
    '1': '分叶或不规则',
    '2': '甲状腺外侵犯',
  },
  echogenicFoci: {
    '0': '无或大彗星尾',
    '1': '粗大钙化',
    '2': '周边（环形）钙化',
    '3': '点状强回声（"暴风雪"）',
  },
} as const;

export const TI_RADS_SNIPPETS: Record<TiRadsCategory, RadsReportSnippet> = {
  TR1: {
    category: 'TR1',
    findingTemplate: '甲状腺内见完全囊性结节 [位置]，形态典型良性。',
    impressionTemplate: 'TI-RADS 1：良性结节。',
    recommendationTemplate: '无需活检或特殊随访。',
  },
  TR2: {
    category: 'TR2',
    findingTemplate: '甲状腺内见 [位置] [尺寸] 结节，组成 [海绵状/囊实混合]、回声 [等回声]、形态规则、未见可疑点状强回声。',
    impressionTemplate: 'TI-RADS 2：无可疑结节（总评分 0 分）。',
    recommendationTemplate: '无需活检。',
  },
  TR3: {
    category: 'TR3',
    findingTemplate: '甲状腺 [叶] 见 [位置] [尺寸] mm 结节，总评分 3 分。',
    impressionTemplate: 'TI-RADS 3：低度可疑结节（总评分 3 分）。',
    recommendationTemplate: '结节 ≥ 2.5 cm 建议 FNA 活检；< 2.5 cm 建议 1-3 年随访。',
  },
  TR4: {
    category: 'TR4',
    findingTemplate: '甲状腺 [叶] 见 [位置] [尺寸] mm 结节，总评分 4-6 分，伴 [可疑特征]。',
    impressionTemplate: 'TI-RADS 4：中度可疑结节（总评分 4-6 分）。',
    recommendationTemplate: '结节 ≥ 1.5 cm 建议 FNA 活检；< 1.5 cm 建议半年-1 年随访。',
  },
  TR5: {
    category: 'TR5',
    findingTemplate: '甲状腺 [叶] 见 [位置] [尺寸] mm 结节，总评分 ≥ 7 分，伴 [高度可疑特征]。',
    impressionTemplate: 'TI-RADS 5：高度可疑结节（总评分 ≥ 7 分）。',
    recommendationTemplate: '结节 ≥ 1.0 cm 建议 FNA 活检；< 1.0 cm 建议密切随访。',
  },
};

export function scoreTiRads(input: {
  composition: 0 | 1 | 2 | 3;
  echogenicity: 0 | 1 | 2 | 3;
  shape: 0 | 3;
  margin: 0 | 1 | 2;
  echogenicFoci: 0 | 1 | 2 | 3;
  sizeMm: number;
}): RadsScoringResult {
  const total = input.composition + input.echogenicity + input.shape + input.margin + input.echogenicFoci;
  let cat: TiRadsCategory = 'TR2';
  if (total === 0) cat = 'TR1';        // 完全囊性
  else if (total === 2) cat = 'TR2';   // 0 分实为 TR1，2 分实为 TR2
  else if (total === 3) cat = 'TR3';
  else if (total <= 6) cat = 'TR4';
  else cat = 'TR5';

  const catInfo = TI_RADS_CATEGORIES[cat];
  const riskMap: Record<TiRadsCategory, RadsScoringResult['riskLevel']> = {
    TR1: 'very-low', TR2: 'very-low', TR3: 'low', TR4: 'intermediate', TR5: 'high',
  };

  let fnaThreshold = 10;
  if (cat === 'TR3') fnaThreshold = 25;
  else if (cat === 'TR4') fnaThreshold = 15;
  else if (cat === 'TR5') fnaThreshold = 10;
  const needsFna = input.sizeMm >= fnaThreshold;

  return {
    category: cat,
    categoryName: catInfo.name,
    score: total * 10,
    riskLevel: riskMap[cat],
    recommendation: needsFna ? catInfo.recommendation : '随访观察',
    details: `组成${input.composition}分 + 回声${input.echogenicity}分 + 形态${input.shape}分 + 边缘${input.margin}分 + 强回声${input.echogenicFoci}分 = ${total}分；结节 ${input.sizeMm} mm`,
    modifiers: [needsFna ? 'FNA 阈值达标' : 'FNA 阈值未达'],
  };
}

export const TI_RADS_STATS = {
  system: 'ACR TI-RADS',
  version: '2017',
  source: 'ACR',
  categories: 5,
  features: 5,
  pointsRange: '0-13',
} as const;
