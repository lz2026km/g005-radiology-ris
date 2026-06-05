// ============================================================
// Bone-RADS (Incidental Bone Lesions) 2023
// 偶发骨病灶 CT/MR 评估
// ============================================================

import type { RadsCategory, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type BoneRadsCategory = '1' | '2' | '3' | '4';

export const BONE_RADS_CATEGORIES: Record<BoneRadsCategory, RadsCategory> = {
  '1': { code: '1', name: '良性',             description: '明确良性骨病灶（血管瘤/纤维性骨皮质缺损/骨岛等）', riskPercent: '0%',  recommendation: '无需随访',         isActionable: false },
  '2': { code: '2', name: '可能良性',         description: '未完全特征化但倾向良性',                     riskPercent: '<5%',  recommendation: '随访 6-12 月',     isActionable: true  },
  '3': { code: '3', name: '需要进一步检查',   description: '不能定性',                                   riskPercent: '20%',  recommendation: 'MRI 进一步评估 / 活检', isActionable: true },
  '4': { code: '4', name: '高度可疑恶性',     description: '形态学 + 临床高度怀疑恶性',                 riskPercent: '>50%',  recommendation: '活检 + 肿瘤科会诊', isActionable: true },
};

export const BONE_RADS_SNIPPETS: Record<BoneRadsCategory, RadsReportSnippet> = {
  '1': { category: '1', findingTemplate: '骨 [部位] 见 [典型良性病灶：血管瘤/骨岛/纤维性骨皮质缺损]。', impressionTemplate: 'Bone-RADS 1：良性骨病灶。', recommendationTemplate: '无需随访。' },
  '2': { category: '2', findingTemplate: '骨 [部位] 见 [尺寸] mm [表现描述]，倾向良性但未完全特征化。', impressionTemplate: 'Bone-RADS 2：可能良性。', recommendationTemplate: '6-12 月后影像随访。' },
  '3': { category: '3', findingTemplate: '骨 [部位] 见 [尺寸] mm [表现描述]，不能定性。', impressionTemplate: 'Bone-RADS 3：需要进一步检查。', recommendationTemplate: '推荐 MRI 进一步评估或活检。' },
  '4': { category: '4', findingTemplate: '骨 [部位] 见 [尺寸] mm 溶骨性/混合性破坏伴 [恶性征象：骨膜反应/软组织肿块]。', impressionTemplate: 'Bone-RADS 4：高度可疑恶性。', recommendationTemplate: '活检 + 骨肿瘤科会诊。' },
};

export function scoreBoneRads(input: {
  isTypicalBenign?: boolean;
  isUncharacterized?: boolean;
  hasAggressiveFeatures?: boolean;
  hasOsteolysis?: boolean;
  hasPeriostealReaction?: boolean;
  hasSoftTissueMass?: boolean;
}): RadsScoringResult {
  const details: string[] = [];
  let cat: BoneRadsCategory = '1';

  if (input.isTypicalBenign) {
    cat = '1';
  } else if (input.hasAggressiveFeatures || input.hasOsteolysis || input.hasPeriostealReaction || input.hasSoftTissueMass) {
    cat = '4';
    details.push('溶骨/骨膜反应/软组织肿块');
  } else if (input.isUncharacterized) {
    cat = '3';
  } else {
    cat = '2';
  }

  const catInfo = BONE_RADS_CATEGORIES[cat];
  const riskMap: Record<BoneRadsCategory, RadsScoringResult['riskLevel']> = {
    '1': 'very-low', '2': 'low', '3': 'intermediate', '4': 'high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '1': 5, '2': 30, '3': 55, '4': 90 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；') || '倾向良性',
    modifiers: [],
  };
}

export const BONE_RADS_STATS = {
  system: 'Bone-RADS',
  version: 'v1.0 (2023)',
  source: 'ACR',
  categories: 4,
} as const;
