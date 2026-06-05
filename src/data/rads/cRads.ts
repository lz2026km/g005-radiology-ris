// ============================================================
// C-RADS (CT Colonography Reporting and Data System) v2023
// CT 结肠成像（虚拟结肠镜）报告
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type CRadsColonic = 'C0' | 'C1' | 'C2' | 'C3' | 'C4';
export type CRadsExtracolonic = 'E0' | 'E1' | 'E2' | 'E3' | 'E4';

export const C_RADS_COLONIC: Record<CRadsColonic, RadsCategory> = {
  C0: { code: 'C0', name: '评估不完全',       description: '肠道准备不足/技术问题',   riskPercent: 'N/A',  recommendation: '重做 CTC',         isActionable: true  },
  C1: { code: 'C1', name: '正常结肠',         description: '无息肉 ≥ 6 mm',           riskPercent: 'N/A',  recommendation: '5 年后常规筛查',   isActionable: false },
  C2: { code: 'C2', name: '中间型息肉',       description: '1-2 枚 6-9 mm 息肉',       riskPercent: '中',    recommendation: '1-3 年 CTC 随访',   isActionable: true  },
  C3: { code: 'C3', name: '进展型息肉',       description: '≥ 3 枚 6-9 mm 或 ≥ 10 mm', riskPercent: '高',   recommendation: '结肠镜切除',        isActionable: true  },
  C4: { code: 'C4', name: '结肠肿块',         description: '肿块侵犯肠壁/周围结构',   riskPercent: '极高',  recommendation: '结肠镜 + 活检',     isActionable: true  },
};

export const C_RADS_EXTRACOLONIC: Record<CRadsExtracolonic, RadsCategory> = {
  E0: { code: 'E0', name: '评估有限',         description: '无 IV/口服对比剂等',       riskPercent: 'N/A',  recommendation: '考虑全腹增强',      isActionable: true  },
  E1: { code: 'E1', name: '正常/解剖变异',     description: '无异常发现',               riskPercent: 'N/A',  recommendation: '常规筛查',          isActionable: false },
  E2: { code: 'E2', name: '临床不重要的发现', description: '如胆囊结石/肾囊肿',        riskPercent: '低',    recommendation: '常规随访',          isActionable: false },
  E3: { code: 'E3', name: '可能不重要的不完整表征', description: '如肝脏低密度灶、肾上腺肿物', riskPercent: '中', recommendation: '进一步影像检查',    isActionable: true  },
  E4: { code: 'E4', name: '潜在重要发现',     description: '如动脉瘤/实性肿块',        riskPercent: '高',    recommendation: '临床/影像进一步评估', isActionable: true },
};

export const C_RADS_SNIPPETS = {
  colonic: {
    C0: { category: 'C0', findingTemplate: '本次 CTC 肠道准备不足。', impressionTemplate: 'C-RADS C0：评估不完全。', recommendationTemplate: '重做 CTC。' },
    C1: { category: 'C1', findingTemplate: '结肠各段充气良好，黏膜光整，未见 ≥ 6 mm 息肉。', impressionTemplate: 'C-RADS C1：正常结肠。', recommendationTemplate: '5 年后常规筛查。' },
    C2: { category: 'C2', findingTemplate: '结肠 [段] 见 [N] 枚 6-9 mm 息肉。', impressionTemplate: 'C-RADS C2：中间型息肉。', recommendationTemplate: '1-3 年 CTC 随访。' },
    C3: { category: 'C3', findingTemplate: '结肠 [段] 见 [N] 枚 [尺寸] mm 息肉 [及 ≥ 10 mm 描述]。', impressionTemplate: 'C-RADS C3：进展型息肉。', recommendationTemplate: '结肠镜切除。' },
    C4: { category: 'C4', findingTemplate: '结肠 [段] 见 [尺寸] mm 肿块伴肠壁增厚/强化。', impressionTemplate: 'C-RADS C4：结肠肿块（可疑恶性）。', recommendationTemplate: '结肠镜 + 活检。' },
  },
  extracolonic: {
    E0: { category: 'E0', findingTemplate: '本次 CTC 肠外评估有限。', impressionTemplate: 'C-RADS E0：肠外评估有限。', recommendationTemplate: '考虑全腹增强 CT。' },
    E1: { category: 'E1', findingTemplate: '肠外脏器未见明显异常。', impressionTemplate: 'C-RADS E1：正常/解剖变异。', recommendationTemplate: '常规筛查。' },
    E2: { category: 'E2', findingTemplate: '肠外见 [胆囊结石/肾囊肿/肝囊肿] 等临床不重要发现。', impressionTemplate: 'C-RADS E2：临床不重要的发现。', recommendationTemplate: '常规随访。' },
    E3: { category: 'E3', findingTemplate: '肠外见 [肝脏低密度灶/肾上腺肿物]，需进一步评估。', impressionTemplate: 'C-RADS E3：可能不重要的不完全表征。', recommendationTemplate: '进一步影像学检查。' },
    E4: { category: 'E4', findingTemplate: '肠外见 [腹主动脉瘤/实性肿块/恶性征象]。', impressionTemplate: 'C-RADS E4：潜在重要发现。', recommendationTemplate: '临床+影像进一步评估。' },
  },
} as const;

export function scoreCRadsColonic(input: {
  polyps: { count: number; maxSizeMm: number }[];
  hasMass?: boolean;
}): RadsScoringResult {
  const totalCount = input.polyps.reduce((sum, p) => sum + p.count, 0);
  const maxSize = Math.max(...input.polyps.map(p => p.maxSizeMm), 0);
  let cat: CRadsColonic = 'C1';

  if (input.hasMass) {
    cat = 'C4';
  } else if (maxSize >= 10 || totalCount >= 3) {
    cat = 'C3';
  } else if (totalCount > 0 && maxSize >= 6) {
    cat = 'C2';
  }

  const catInfo = C_RADS_COLONIC[cat];
  const riskMap: Record<CRadsColonic, RadsScoringResult['riskLevel']> = {
    C0: 'intermediate', C1: 'very-low', C2: 'low', C3: 'high', C4: 'very-high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { C0: 0, C1: 5, C2: 35, C3: 70, C4: 95 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: `总息肉 ${totalCount} 枚，最大 ${maxSize} mm`,
    modifiers: [],
  };
}

export const C_RADS_STATS = {
  system: 'C-RADS',
  version: 'v2023',
  source: 'ACR',
  colonicCategories: 5,
  extracolonicCategories: 5,
} as const;
