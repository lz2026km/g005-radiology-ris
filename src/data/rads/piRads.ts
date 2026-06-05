// ============================================================
// PI-RADS v2.1 (Prostate Imaging Reporting and Data System)
// 前列腺多参数 MRI 报告
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type PiRadsCategory = '1' | '2' | '3' | '4' | '5';

export const PI_RADS_CATEGORIES: Record<PiRadsCategory, RadsCategory> = {
  '1': { code: '1', name: '极低风险',         description: '临床显著癌可能性极低',         riskPercent: '<5%',  recommendation: '继续常规筛查',  isActionable: false },
  '2': { code: '2', name: '低风险',           description: '临床显著癌可能性低',           riskPercent: '5-15%', recommendation: '继续随访',       isActionable: false },
  '3': { code: '3', name: '中等风险',         description: '临床显著癌可能性中等',         riskPercent: '15-50%', recommendation: '考虑 MR 引导活检', isActionable: true },
  '4': { code: '4', name: '高风险',           description: '临床显著癌可能性高',           riskPercent: '50-85%', recommendation: '建议靶向活检',  isActionable: true },
  '5': { code: '5', name: '极高风险',         description: '临床显著癌可能性极高',         riskPercent: '>85%',  recommendation: '建议活检 + 治疗',  isActionable: true },
};

// PI-RADS v2.1 41 扇区
export const PROSTATE_SECTORS = {
  peripheralZone: ['PZ', 'PZa', 'PZpm', 'PZpl'],
  transitionZone: ['TZ', 'TZa', 'TZpm', 'TZpl'],
  centralZone: 'CZ',
  anteriorFibromuscularStroma: 'AS',
  totalSectors: 41,
} as const;

// 外周带 T2W 评分
export const T2W_PERIPHERAL_SCORE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '均匀高信号（正常）',
  2: '线状/楔形低信号 或 弥漫性轻度低信号',
  3: '非局限性低信号 或 混杂信号',
  4: '透镜状/非局限性均匀中度低信号，最大径 < 1.5 cm',
  5: '透镜状/非局限性均匀中度低信号，最大径 ≥ 1.5 cm 或明确前列腺外侵犯',
};

// 移行带 T2W 评分
export const T2W_TRANSITION_SCORE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '正常表现（罕见）或圆形/完全包裹的结节',
  2: '低信号均匀结节（前列腺增生结节）',
  3: '不均匀信号伴模糊边界（包含其他评分 = 3 的表现）',
  4: '透镜状/非局限性均匀中度低信号，最大径 < 1.5 cm',
  5: '透镜状/非局限性均匀中度低信号，最大径 ≥ 1.5 cm 或明确前列腺外侵犯',
};

// DWI 评分
export const DWI_SCORE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '无异常（b=高 b 值无低信号，ADC 无低信号）',
  2: '模糊低信号（ADC）',
  3: '局灶性高 b 值轻-中度低信号（ADC 轻-中度低信号），< 1.5 cm',
  4: '局灶性高 b 值显著低信号（ADC 显著低信号），< 1.5 cm',
  5: '≥ 1.5 cm 显著低信号或明确前列腺外侵犯/侵犯',
};

// DCE 评分
export const DCE_SCORE = {
  negative: '- (阴性，无早期强化)',
  positive: '+ (阳性，局灶性早期强化，与 T2W/DWI 病灶对应)',
} as const;

export const PI_RADS_SNIPPETS: Record<PiRadsCategory, RadsReportSnippet> = {
  '1': {
    category: '1',
    findingTemplate: '前列腺多参数 MRI 未见明确异常信号。',
    impressionTemplate: 'PI-RADS 1：极低风险（临床显著癌可能性极低）。',
    recommendationTemplate: '继续 PSA 监测 + 常规随访。',
  },
  '2': {
    category: '2',
    findingTemplate: '前列腺内见 [BPH 结节等良性表现]，未见可疑癌灶。',
    impressionTemplate: 'PI-RADS 2：低风险。',
    recommendationTemplate: '继续随访。',
  },
  '3': {
    category: '3',
    findingTemplate: '前列腺 [外周带/移行带] 见 [位置描述] 一 [T2W 表现 + DWI 表现 + 尺寸] 病灶，临床显著癌可能性中等。',
    impressionTemplate: 'PI-RADS 3：中等风险。',
    recommendationTemplate: '建议 MR-TRUS 融合引导下靶向活检 + 12 扇区系统活检。',
  },
  '4': {
    category: '4',
    findingTemplate: '前列腺 [外周带/移行带] 见 [位置] 一 [T2W 表现 + DWI 表现 + 尺寸] 病灶，伴 [早期强化]，临床显著癌可能性高。',
    impressionTemplate: 'PI-RADS 4：高风险。',
    recommendationTemplate: '建议靶向活检 + 多学科会诊。',
  },
  '5': {
    category: '5',
    findingTemplate: '前列腺 [外周带/移行带] 见 [位置] [尺寸 ≥ 1.5cm] 病灶，伴 [包膜外侵犯/精囊侵犯]，临床显著癌可能性极高。',
    impressionTemplate: 'PI-RADS 5：极高风险。',
    recommendationTemplate: '建议活检 + 临床分期 + 多学科治疗规划。',
  },
};

export function scorePiRads(input: {
  zone: 'peripheral' | 'transition';
  t2wScore: 1 | 2 | 3 | 4 | 5;
  dwiScore: 1 | 2 | 3 | 4 | 5;
  dcePositive?: boolean;
  sizeMm: number;
  hasExtraprostaticExtension?: boolean;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: PiRadsCategory = '1';

  // PI-RADS v2.1 评分规则
  if (input.zone === 'peripheral') {
    // 外周带：DWI 是主要驱动
    if (input.dwiScore >= 4) cat = String(input.dwiScore) as PiRadsCategory;
    else if (input.dwiScore === 3) {
      // T2W=1 → 2, T2W=2 → 2, T2W=3 → 3, T2W=4 → 4, T2W=5 → 5
      cat = String(input.t2wScore) as PiRadsCategory;
    } else {
      // DWI 1-2
      cat = '2';
    }
  } else {
    // 移行带：T2W 是主要驱动
    if (input.t2wScore >= 4) cat = String(input.t2wScore) as PiRadsCategory;
    else if (input.t2wScore === 3) {
      cat = '3';
    } else {
      cat = '2';
    }
  }

  if (input.hasExtraprostaticExtension) {
    cat = '5';
    details.push('明确前列腺外侵犯');
  }

  if (input.sizeMm >= 15 && cat === '4') cat = '5';

  const catInfo = PI_RADS_CATEGORIES[cat];
  const riskMap: Record<PiRadsCategory, RadsScoringResult['riskLevel']> = {
    '1': 'very-low', '2': 'low', '3': 'intermediate', '4': 'high', '5': 'very-high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '1': 5, '2': 15, '3': 35, '4': 65, '5': 90 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；') || `${input.zone === 'peripheral' ? '外周带' : '移行带'}基于 T2W+DWI 综合评分`,
    modifiers: [],
  };
}

export const PI_RADS_STATS = {
  system: 'PI-RADS',
  version: 'v2.1',
  source: 'ACR-ESUR',
  categories: 5,
  sectors: 41,
  sequences: ['T2W', 'DWI', 'DCE'],
} as const;
