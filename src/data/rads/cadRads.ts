// ============================================================
// CAD-RADS 2.0 (Coronary Artery Disease Reporting and Data System) 2022
// 冠状动脉 CTA 报告
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type CadRadsStenosis = '0' | '1' | '2' | '3' | '4A' | '4B' | '5' | 'N';

export const CAD_RADS_STENOSIS: Record<CadRadsStenosis, RadsCategory> = {
  '0':  { code: '0',  name: '无狭窄',           description: '所有管腔 < 25%',           riskPercent: 'N/A',   recommendation: '无再检查',       isActionable: false },
  '1':  { code: '1',  name: '轻微狭窄',         description: '1-24%',                  riskPercent: '<5%',   recommendation: '无再检查',       isActionable: false },
  '2':  { code: '2',  name: '轻度狭窄',         description: '25-49%',                 riskPercent: '低',    recommendation: '随访',           isActionable: false },
  '3':  { code: '3',  name: '中度狭窄',         description: '50-69%',                 riskPercent: '中',    recommendation: '考虑 ICA 或功能检查', isActionable: true },
  '4A': { code: '4A', name: '重度狭窄 1-2 支',  description: '70-99% 单/双支',         riskPercent: '高',    recommendation: '考虑血运重建',   isActionable: true  },
  '4B': { code: '4B', name: '重度狭窄 3 支/左主干', description: '≥ 70% 3 支 OR 左主干 >50%', riskPercent: '高', recommendation: '强烈考虑血运重建', isActionable: true },
  '5':  { code: '5',  name: '完全闭塞',         description: '100%',                  riskPercent: '极高',  recommendation: '心内科 + 介入/搭桥', isActionable: true },
  'N':  { code: 'N',  name: '不可评估',         description: '图像质量不足',           riskPercent: 'N/A',   recommendation: '重做检查',       isActionable: true  },
};

// 修饰符
export const CAD_RADS_MODIFIERS = {
  P1: 'P1 - 斑块负荷 1 (轻度)',
  P2: 'P2 - 斑块负荷 2 (中度)',
  P3: 'P3 - 斑块负荷 3 (中重度)',
  P4: 'P4 - 斑块负荷 4 (重度)',
  HRP: 'HRP - 高危斑块（低密度斑块/餐巾环征/正性重塑）',
  I: 'I - FFR-CT 显示缺血',
  E: 'E - 特殊情况',
  G: 'G - 桥血管',
  S: 'S - 支架',
} as const;

// 17 节段模型（AHA）
export const CORONARY_SEGMENTS = {
  RIGHT: {
    proximal: 'pRCA',
    mid: 'mRCA',
    distal: 'dRCA',
    posDesc: 'RPDA',
    posterolateral: 'RPLA',
  },
  LEFT_MAIN: 'LM',
  LAD: {
    proximal: 'pLAD',
    mid: 'mLAD',
    distal: 'dLAD',
    D1: 'D1',
    D2: 'D2',
  },
  LCX: {
    proximal: 'pLCX',
    OM1: 'OM1',
    OM2: 'OM2',
    distal: 'dLCX',
  },
  INTERMEDIATE: 'Ramus',
  PDA: 'PDA',
} as const;

export const CAD_RADS_SNIPPETS: Record<CadRadsStenosis, RadsReportSnippet> = {
  '0': { category: '0', findingTemplate: '冠脉各支未见斑块及管腔狭窄。', impressionTemplate: 'CAD-RADS 0：冠脉无狭窄。', recommendationTemplate: '无再检查指征。' },
  '1': { category: '1', findingTemplate: '冠脉 [支] 见轻微斑块，管腔狭窄 < 25%。', impressionTemplate: 'CAD-RADS 1：轻微狭窄。', recommendationTemplate: '无再检查指征。' },
  '2': { category: '2', findingTemplate: '冠脉 [支] 见 [尺寸] 斑块，管腔狭窄 25-49%。', impressionTemplate: 'CAD-RADS 2：轻度狭窄。', recommendationTemplate: '随访 + 危险因素控制。' },
  '3': { category: '3', findingTemplate: '冠脉 [支] 见 [尺寸] 斑块，管腔狭窄 50-69%。', impressionTemplate: 'CAD-RADS 3：中度狭窄。', recommendationTemplate: '考虑 ICA 或功能学检查（FFR-CT/SPECT）。' },
  '4A': { category: '4A', findingTemplate: '冠脉 [支] 见 [尺寸] 斑块，管腔狭窄 70-99%。', impressionTemplate: 'CAD-RADS 4A：重度狭窄 1-2 支。', recommendationTemplate: '考虑血运重建（PCI / CABG）。' },
  '4B': { category: '4B', findingTemplate: '冠脉 [支] 见 [尺寸] 斑块，[左主干 >50% 或 3 支 ≥70%]。', impressionTemplate: 'CAD-RADS 4B：重度狭窄 3 支/左主干。', recommendationTemplate: '强烈考虑血运重建 + 多学科会诊。' },
  '5': { category: '5', findingTemplate: '冠脉 [支] [段] 见完全闭塞。', impressionTemplate: 'CAD-RADS 5：完全闭塞。', recommendationTemplate: '心内科会诊 + 介入/搭桥。' },
  'N': { category: 'N', findingTemplate: '本次冠脉 CTA 图像质量不足。', impressionTemplate: 'CAD-RADS N：不可评估。', recommendationTemplate: '重做检查。' },
};

export function scoreCadRads(input: {
  maxStenosisPercent: number;
  affectedVessels: number;
  hasLeftMain?: boolean;
  hasHighRiskPlaque?: boolean;
  hasFFRCTIschemia?: boolean;
  isNonDiagnostic?: boolean;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: CadRadsStenosis = '0';
  const modifiers: string[] = [];

  if (input.isNonDiagnostic) {
    cat = 'N';
  } else if (input.maxStenosisPercent === 0) {
    cat = '0';
  } else if (input.maxStenosisPercent < 25) {
    cat = '1';
  } else if (input.maxStenosisPercent < 50) {
    cat = '2';
  } else if (input.maxStenosisPercent < 70) {
    cat = '3';
  } else if (input.maxStenosisPercent < 100) {
    if (input.hasLeftMain || input.affectedVessels >= 3) {
      cat = '4B';
    } else {
      cat = '4A';
    }
  } else {
    cat = '5';
  }

  if (input.hasHighRiskPlaque) modifiers.push('HRP');
  if (input.hasFFRCTIschemia) modifiers.push('I');

  const catInfo = CAD_RADS_STENOSIS[cat];
  const riskMap: Record<CadRadsStenosis, RadsScoringResult['riskLevel']> = {
    '0': 'very-low', '1': 'very-low', '2': 'low', '3': 'intermediate',
    '4A': 'high', '4B': 'very-high', '5': 'very-high', 'N': 'intermediate',
  };

  if (input.maxStenosisPercent >= 50) details.push(`最大狭窄 ${input.maxStenosisPercent}%`);
  if (input.affectedVessels >= 1) details.push(`${input.affectedVessels} 支血管受累`);

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '0': 5, '1': 10, '2': 25, '3': 50, '4A': 75, '4B': 90, '5': 100, 'N': 0 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；') || '无显著狭窄',
    modifiers,
  };
}

export const CAD_RADS_STATS = {
  system: 'CAD-RADS',
  version: '2.0 (2022)',
  source: 'SCCT/ACR/ACC/NASCI',
  stenosisCategories: 8,
  modifiers: 9,
  segments: 17,
} as const;
