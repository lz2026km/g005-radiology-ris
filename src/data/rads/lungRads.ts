// ============================================================
// Lung-RADS v2022 (ACR Lung CT Screening Reporting & Data System)
// 低剂量 CT 肺结节筛查报告
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type LungRadsCategory =
  | '0' | '1' | '2' | '3' | '4A' | '4B' | '4X';

export const LUNG_RADS_CATEGORIES: Record<LungRadsCategory, RadsCategory> = {
  '0':  { code: '0',  name: '评估不完全',       description: '需要与旧片对比或额外影像',     riskPercent: 'N/A',   recommendation: '与既往检查对比或召回',         isActionable: true  },
  '1':  { code: '1',  name: '阴性',             description: '无结节或完全良性结节',         riskPercent: '<1%',   recommendation: '12 个月后 LDCT 复查',           isActionable: false },
  '2':  { code: '2',  name: '良性表现',         description: '有良性钙化/脂肪/平行胸膜',     riskPercent: '<1%',   recommendation: '12 个月后 LDCT 复查',           isActionable: false },
  '3':  { code: '3',  name: '可能良性',         description: '实性 6-7 mm / 部分实性 ≤5 mm / GGN ≥30 mm', riskPercent: '1-2%', recommendation: '6 个月 LDCT 复查',         isActionable: true  },
  '4A': { code: '4A', name: '可疑',             description: '实性 8-15 mm / 部分实性 6-7 mm', riskPercent: '5-15%', recommendation: '3 个月 LDCT / PET-CT / 组织活检', isActionable: true },
  '4B': { code: '4B', name: '高度可疑',         description: '实性 ≥15 mm / 部分实性 8-30 mm', riskPercent: '>15%',  recommendation: '3 个月 LDCT / PET-CT / 组织活检', isActionable: true },
  '4X': { code: '4X', name: '4A/4B + 附加征象', description: '4 类 + 额外恶性征象（毛刺/胸膜凹陷/淋巴/转移）', riskPercent: '>15%', recommendation: '组织学诊断 + 多学科会诊', isActionable: true },
};

// 结节类型
export const NODULE_TYPES = {
  SOLID: '实性结节',
  PART_SOLID: '部分实性结节',
  GGN: '磨玻璃结节 (GGN)',
  CYST: '非典型肺囊肿',
} as const;

// 修饰符
export const LUNG_RADS_MODIFIERS = {
  S: 'S - 显著非肺结节',
  C: 'C - 既往癌症史',
  P: 'P - 病理诊断',
} as const;

// 风险尺寸阈值（mm）
export const NODULE_SIZE_THRESHOLDS = {
  SOLID: {
    BENIGN: '< 6',
    CAT_3: '6 - 7',
    CAT_4A: '8 - 15',
    CAT_4B: '≥ 15',
  },
  PART_SOLID: {
    BENIGN: '< 6',
    CAT_3: '6 - 7',
    CAT_4A: '8 - 15 (固态 ≤7mm)',
    CAT_4B: '≥ 15',
  },
  GGN: {
    BENIGN: '< 30',
    CAT_3: '≥ 30',
    CAT_4A: '新发部分实性',
  },
} as const;

// 报告片段
export const LUNG_RADS_SNIPPETS: Record<LungRadsCategory, RadsReportSnippet> = {
  '0': {
    category: '0',
    findingTemplate: '本次检查需与既往影像对比或补充额外影像。',
    impressionTemplate: 'Lung-RADS 0 类：评估不完全。',
    recommendationTemplate: '与既往 CT 对比 / 召回补充影像。',
  },
  '1': {
    category: '1',
    findingTemplate: '双肺野清晰，未见明确肺结节。',
    impressionTemplate: 'Lung-RADS 1 类：阴性。',
    recommendationTemplate: '12 个月后 LDCT 复查。',
  },
  '2': {
    category: '2',
    findingTemplate: '双肺内见 [良性结节描述：完全钙化/中心钙化/同心钙化/脂肪密度/平行胸膜结节]。',
    impressionTemplate: 'Lung-RADS 2 类：良性表现。',
    recommendationTemplate: '12 个月后 LDCT 复查。',
  },
  '3': {
    category: '3',
    findingTemplate: '右/左肺 [叶] 见 [N] 枚 [结节类型：实性/部分实性/磨玻璃] 结节，最大径 [X] mm，形态倾向良性。',
    impressionTemplate: 'Lung-RADS 3 类：可能良性结节。',
    recommendationTemplate: '6 个月后 LDCT 复查。',
  },
  '4A': {
    category: '4A',
    findingTemplate: '右/左肺 [叶] 见 [N] 枚 [结节类型] 结节，最大径 [X] mm，形态可疑。',
    impressionTemplate: 'Lung-RADS 4A 类：可疑结节。',
    recommendationTemplate: '3 个月后 LDCT 复查 / PET-CT / 组织学活检。',
  },
  '4B': {
    category: '4B',
    findingTemplate: '右/左肺 [叶] 见 [N] 枚 [结节类型] 结节，最大径 [X] mm，形态高度可疑。',
    impressionTemplate: 'Lung-RADS 4B 类：高度可疑结节。',
    recommendationTemplate: '3 个月后 LDCT 复查 / PET-CT / 组织学活检。',
  },
  '4X': {
    category: '4X',
    findingTemplate: '右/左肺 [叶] 见 [N] 枚 [结节类型] 结节，伴 [额外征象：毛刺/胸膜凹陷/淋巴结肿大/转移]。',
    impressionTemplate: 'Lung-RADS 4X 类：附加恶性征象。',
    recommendationTemplate: '组织学诊断 + 多学科会诊（MDT）。',
  },
};

export function scoreLungRads(input: {
  noduleType: 'solid' | 'part-solid' | 'ggn' | 'cyst';
  sizeMm: number;
  hasSpiculation?: boolean;
  hasPleuralRetraction?: boolean;
  hasLymphNode?: boolean;
  isNew?: boolean;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: LungRadsCategory = '1';
  const { noduleType, sizeMm, hasSpiculation, hasPleuralRetraction, hasLymphNode, isNew } = input;

  if (noduleType === 'solid') {
    if (sizeMm < 6) cat = '2';
    else if (sizeMm <= 7) cat = '3';
    else if (sizeMm <= 15) cat = '4A';
    else cat = '4B';
  } else if (noduleType === 'part-solid') {
    if (sizeMm < 6) cat = '2';
    else if (sizeMm <= 7) cat = '3';
    else if (sizeMm <= 15) cat = '4A';
    else cat = '4B';
    if (isNew) {
      cat = '4A';
      details.push('新发部分实性结节');
    }
  } else if (noduleType === 'ggn') {
    if (sizeMm < 30) cat = '2';
    else cat = '3';
  } else if (noduleType === 'cyst') {
    cat = '3';
  }

  if (hasSpiculation || hasPleuralRetraction || hasLymphNode) {
    if (cat === '4A') cat = '4B';
    else if (cat === '4B' || cat === '3') cat = '4X';
    details.push('伴附加征象：' + [
      hasSpiculation && '毛刺',
      hasPleuralRetraction && '胸膜凹陷',
      hasLymphNode && '淋巴结',
    ].filter(Boolean).join('、'));
  }

  const catInfo = LUNG_RADS_CATEGORIES[cat];
  const riskMap: Record<LungRadsCategory, RadsScoringResult['riskLevel']> = {
    '0': 'intermediate', '1': 'very-low', '2': 'very-low', '3': 'low',
    '4A': 'intermediate', '4B': 'high', '4X': 'very-high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '0': 0, '1': 5, '2': 10, '3': 25, '4A': 50, '4B': 75, '4X': 90 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；') || '基于结节类型与尺寸评估',
    modifiers: [],
  };
}

export const LUNG_RADS_STATS = {
  system: 'Lung-RADS',
  version: 'v2022',
  source: 'ACR',
  categories: 7,
  noduleTypes: 4,
  modifiers: 3,
  sizeThresholds: 9,
} as const;
