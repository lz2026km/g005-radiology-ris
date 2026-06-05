// ============================================================
// VI-RADS (Vesical Imaging Reporting and Data System) 2018
// 膀胱 MR 肌层侵犯评估
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type ViRadsCategory = '1' | '2' | '3' | '4' | '5';

export const VI_RADS_CATEGORIES: Record<ViRadsCategory, RadsCategory> = {
  '1': { code: '1', name: '极不可能侵犯肌层',   description: '肿瘤 < 1 cm + 无肌层侵犯征象',   riskPercent: '<5%',   recommendation: 'TURBT 切除',     isActionable: false },
  '2': { code: '2', name: '不太可能侵犯肌层',   description: '肿瘤 ≥ 1 cm + 无明确肌层侵犯',   riskPercent: '5-10%', recommendation: 'TURBT + 重复活检', isActionable: true  },
  '3': { code: '3', name: '可能侵犯肌层',       description: '可疑但非确定',                  riskPercent: '10-50%', recommendation: 'TURBT + MDT',     isActionable: true  },
  '4': { code: '4', name: '很可能侵犯肌层',     description: '明确肌层侵犯但未达脂肪',        riskPercent: '50-95%', recommendation: '新辅助化疗 + 膀胱切除', isActionable: true },
  '5': { code: '5', name: '侵犯超过肌层',       description: '侵犯膀胱周围脂肪/器官',        riskPercent: '>95%',  recommendation: '根治性膀胱切除 + 化疗', isActionable: true },
};

export const VI_RADS_SNIPPETS: Record<ViRadsCategory, RadsReportSnippet> = {
  '1': { category: '1', findingTemplate: '膀胱内见 [尺寸 < 1cm] 带蒂肿块，肌层低信号带连续。', impressionTemplate: 'VI-RADS 1：极不可能侵犯肌层。', recommendationTemplate: 'TURBT 切除。' },
  '2': { category: '2', findingTemplate: '膀胱内见 [尺寸 ≥ 1cm] 肿块，肌层低信号带尚连续。', impressionTemplate: 'VI-RADS 2：不太可能侵犯肌层。', recommendationTemplate: 'TURBT + 重复活检。' },
  '3': { category: '3', findingTemplate: '膀胱内见肿块，肌层低信号带局部可疑中断。', impressionTemplate: 'VI-RADS 3：可能侵犯肌层。', recommendationTemplate: 'TURBT + MDT。' },
  '4': { category: '4', findingTemplate: '膀胱内见肿块，肌层低信号带明确中断但未达脂肪。', impressionTemplate: 'VI-RADS 4：很可能侵犯肌层。', recommendationTemplate: '新辅助化疗 + 膀胱切除。' },
  '5': { category: '5', findingTemplate: '膀胱肿块侵犯周围脂肪/邻近器官。', impressionTemplate: 'VI-RADS 5：侵犯超过肌层。', recommendationTemplate: '根治性膀胱切除 + 化疗。' },
};

export function scoreViRads(input: {
  sizeMm: number;
  stalkPresent?: boolean;
  muscleInvasionSuspected?: boolean;
  muscleInvasionDefinite?: boolean;
  perivesicalInvasion?: boolean;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: ViRadsCategory = '1';

  if (input.perivesicalInvasion) {
    cat = '5';
  } else if (input.muscleInvasionDefinite) {
    cat = '4';
  } else if (input.muscleInvasionSuspected) {
    cat = '3';
  } else if (input.sizeMm >= 10) {
    cat = '2';
  }

  details.push(`肿瘤 ${input.sizeMm} mm`);

  const catInfo = VI_RADS_CATEGORIES[cat];
  const riskMap: Record<ViRadsCategory, RadsScoringResult['riskLevel']> = {
    '1': 'very-low', '2': 'low', '3': 'intermediate', '4': 'high', '5': 'very-high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '1': 10, '2': 25, '3': 50, '4': 75, '5': 95 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；'),
    modifiers: [],
  };
}

export const VI_RADS_STATS = {
  system: 'VI-RADS',
  version: '2018',
  source: 'ESUR',
  categories: 5,
  sequences: ['T2W', 'DWI', 'DCE'],
} as const;
