// ============================================================
// BI-RADS 5th Edition (ACR 2013, 现行)
// 乳腺影像报告与数据系统
// 覆盖: 钼靶/MR/超声
// ============================================================

import type { RadsCategory, RadsDescriptor, RadsScoringResult, RadsReportSnippet } from './radsCommon';

export type BiRadsCategory =
  | '0' | '1' | '2' | '3' | '4A' | '4B' | '4C' | '5' | '6';

export const BI_RADS_CATEGORIES: Record<BiRadsCategory, RadsCategory> = {
  '0':  { code: '0',  name: '评估不完全',         description: '需要进一步影像学评估',                  riskPercent: 'N/A',  recommendation: '召回做额外影像（点压片/放大/超声/MR）',          isActionable: true  },
  '1':  { code: '1',  name: '阴性',               description: '无异常发现',                              riskPercent: '~0%',  recommendation: '常规筛查（1 年后）',                              isActionable: false },
  '2':  { code: '2',  name: '良性发现',           description: '完全描述的良性发现',                       riskPercent: '~0%',  recommendation: '常规筛查（1 年后）',                              isActionable: false },
  '3':  { code: '3',  name: '可能良性',           description: '恶性可能性 ≤ 2%',                          riskPercent: '≤2%',  recommendation: '短期随访（6 个月）或继续筛查',                    isActionable: true  },
  '4A': { code: '4A', name: '低度可疑恶性',       description: '恶性可能性 >2% 至 ≤10%',                  riskPercent: '2-10%', recommendation: '组织学诊断（穿刺活检）',                          isActionable: true  },
  '4B': { code: '4B', name: '中度可疑恶性',       description: '恶性可能性 >10% 至 ≤50%',                 riskPercent: '10-50%', recommendation: '组织学诊断（穿刺活检）',                          isActionable: true  },
  '4C': { code: '4C', name: '高度可疑恶性（但非典型）', description: '恶性可能性 >50% 至 <95%',           riskPercent: '50-95%', recommendation: '组织学诊断（穿刺活检）',                          isActionable: true  },
  '5':  { code: '5',  name: '高度提示恶性',       description: '恶性可能性 ≥ 95%',                         riskPercent: '≥95%', recommendation: '组织学诊断 + 治疗计划',                            isActionable: true  },
  '6':  { code: '6',  name: '活检证实的恶性',     description: '治疗前确诊',                              riskPercent: '100%', recommendation: '外科/系统治疗',                                    isActionable: true  },
};

export type BreastDensity = 'a' | 'b' | 'c' | 'd';

export const BREAST_DENSITY: Record<BreastDensity, { code: string; name: string; description: string; recommendation: string }> = {
  a: { code: 'a', name: '脂肪型',     description: '腺体 < 25%',     recommendation: '常规筛查' },
  b: { code: 'b', name: '散在纤维腺体型', description: '腺体 25-50%', recommendation: '常规筛查' },
  c: { code: 'c', name: '不均匀致密型', description: '腺体 51-75%', recommendation: '考虑补充筛查（超声/MR）' },
  d: { code: 'd', name: '极度致密型', description: '腺体 > 75%', recommendation: '建议补充筛查（超声/MR）' },
};

// 词典 - 肿块
export const MASS_DESCRIPTORS: RadsDescriptor[] = [
  { term: '形状-卵圆形',   definition: '椭圆形/卵形，2-3 个波浪', category: 'shape' },
  { term: '形状-圆形',     definition: '球形',                   category: 'shape' },
  { term: '形状-不规则形', definition: '非卵圆形/圆形',          category: 'shape' },
  { term: '边缘-光整',     definition: '清晰锐利的边界',          category: 'margin' },
  { term: '边缘-遮蔽状',   definition: '被周围组织遮蔽',          category: 'margin' },
  { term: '边缘-微小分叶', definition: '短周期波状轮廓',          category: 'margin' },
  { term: '边缘-成角',     definition: '锐角',                    category: 'margin' },
  { term: '边缘-毛刺',     definition: '放射状线条',              category: 'margin' },
  { term: '密度-高密度',   definition: '比脂肪高',                category: 'density' },
  { term: '密度-等密度',   definition: '同脂肪',                  category: 'density' },
  { term: '密度-低密度（不含脂肪）', definition: '低于脂肪',       category: 'density' },
  { term: '密度-含脂肪',   definition: '含透亮脂肪',              category: 'density' },
];

// 词典 - 钙化
export const CALCIFICATION_DESCRIPTORS: RadsDescriptor[] = [
  { term: '典型良性-皮肤钙化',  definition: '中心透亮',     category: 'typically-benign' },
  { term: '典型良性-血管钙化',  definition: '平行轨道/管状', category: 'typically-benign' },
  { term: '典型良性-粗大棒状',  definition: '≥ 0.5 mm',      category: 'typically-benign' },
  { term: '典型良性-圆形/点状', definition: '≤ 0.5 mm',     category: 'typically-benign' },
  { term: '典型良性-边缘型',    definition: '蛋壳样',       category: 'typically-benign' },
  { term: '典型良性-营养不良性', definition: '不规则 > 1mm 中心透亮', category: 'typically-benign' },
  { term: '可疑-无定形',        definition: '小/模糊无具体形状', category: 'suspicious' },
  { term: '可疑-粗糙不均质',    definition: '≥ 0.5 mm 颗粒',     category: 'suspicious' },
  { term: '可疑-细小多形性',    definition: '多形 < 0.5 mm',      category: 'suspicious' },
  { term: '可疑-细线/细线分枝状', definition: '线状不规则分叉',    category: 'suspicious-high' },
  { term: '分布-弥散',          definition: '散在全乳',         category: 'distribution' },
  { term: '分布-区域性',        definition: '占据 1 个导管系统', category: 'distribution' },
  { term: '分布-成簇',          definition: '< 2 cm³ 5 枚以上', category: 'distribution' },
  { term: '分布-线样',          definition: '单支导管',         category: 'distribution' },
  { term: '分布-段样',          definition: '锥形 乳管亚段',    category: 'distribution-high' },
];

// 词典 - 结构扭曲 / 不对称
export const ASYMMETRY_DESCRIPTORS: RadsDescriptor[] = [
  { term: '不对称',         definition: '仅单一体位可见',          category: 'asymmetry' },
  { term: '整体不对称',     definition: '较大范围',                  category: 'asymmetry' },
  { term: '进展性不对称',   definition: '较前次新发或增大',          category: 'asymmetry' },
  { term: '结构扭曲',       definition: '无明确肿块',                category: 'architecture' },
];

// 词典 - 伴随征象
export const ASSOCIATED_FEATURES: RadsDescriptor[] = [
  { term: '皮肤回缩',         definition: '皮肤被牵拉',        category: 'skin' },
  { term: '乳头回缩',         definition: '乳头内陷',          category: 'nipple' },
  { term: '皮肤增厚',         definition: '> 2mm 局部',         category: 'skin' },
  { term: '小梁结构增厚',     definition: 'Cooper 韧带增粗',    category: 'trabecular' },
  { term: '皮肤侵犯',         definition: '肿瘤累及皮肤',       category: 'skin-invasion' },
  { term: '乳头侵犯',         definition: '肿瘤累及乳头',       category: 'nipple-invasion' },
  { term: '腋窝淋巴结肿大',   definition: '> 2cm 异常',         category: 'lymph-node' },
  { term: '胸肌侵犯',         definition: '肿瘤累及胸肌',       category: 'muscle-invasion' },
];

// 报告片段
export const BI_RADS_REPORT_SNIPPETS: Record<BiRadsCategory, RadsReportSnippet> = {
  '0': {
    category: '0',
    findingTemplate: '本次检查发现需进一步评估，建议召回补充影像学检查（点压片/放大/MR）。',
    impressionTemplate: 'BI-RADS 0 类：评估不完全。',
    recommendationTemplate: '建议召回，补充点压摄影 / 放大摄影 / 超声 / MR 检查。',
  },
  '1': {
    category: '1',
    findingTemplate: '双侧乳腺未见明确肿块、钙化、结构扭曲或不对称。',
    impressionTemplate: 'BI-RADS 1 类：阴性。',
    recommendationTemplate: '建议 1 年后常规筛查。',
  },
  '2': {
    category: '2',
    findingTemplate: '双侧乳腺内见 [良性描述：钙化/含脂肪肿块/术后改变]，形态典型，符合良性改变。',
    impressionTemplate: 'BI-RADS 2 类：良性发现。',
    recommendationTemplate: '建议 1 年后常规筛查。',
  },
  '3': {
    category: '3',
    findingTemplate: '乳腺内见 [所见描述：边界清晰的实性肿块等]，形态倾向良性，恶性可能性 ≤ 2%。',
    impressionTemplate: 'BI-RADS 3 类：可能良性。',
    recommendationTemplate: '建议短期随访（6 个月后复查乳腺影像），或继续常规年度筛查。',
  },
  '4A': {
    category: '4A',
    findingTemplate: '乳腺内见 [所见描述]，形态学部分可疑，恶性可能性 2-10%。',
    impressionTemplate: 'BI-RADS 4A 类：低度可疑恶性。',
    recommendationTemplate: '建议组织学诊断（穿刺活检）。',
  },
  '4B': {
    category: '4B',
    findingTemplate: '乳腺内见 [所见描述]，形态学可疑，恶性可能性 10-50%。',
    impressionTemplate: 'BI-RADS 4B 类：中度可疑恶性。',
    recommendationTemplate: '建议组织学诊断（穿刺活检）。',
  },
  '4C': {
    category: '4C',
    findingTemplate: '乳腺内见 [所见描述]，形态学高度可疑但非典型恶性，恶性可能性 50-95%。',
    impressionTemplate: 'BI-RADS 4C 类：高度可疑恶性。',
    recommendationTemplate: '建议组织学诊断（穿刺活检）。',
  },
  '5': {
    category: '5',
    findingTemplate: '乳腺内见 [典型恶性描述：毛刺肿块/段样分布细线分枝状钙化]，形态高度提示恶性。',
    impressionTemplate: 'BI-RADS 5 类：高度提示恶性。',
    recommendationTemplate: '建议组织学诊断 + 多学科会诊制定治疗计划。',
  },
  '6': {
    category: '6',
    findingTemplate: '已知活检证实的乳腺恶性肿瘤，本次评估为治疗前基线或新辅助化疗监测。',
    impressionTemplate: 'BI-RADS 6 类：活检证实的恶性。',
    recommendationTemplate: '依据肿瘤分期进行外科/系统治疗。',
  },
};

// BI-RADS 评分函数
export function scoreBiRads(input: {
  hasMass?: boolean;
  hasCalcification?: boolean;
  hasAsymmetry?: boolean;
  hasArchitecture?: boolean;
  massShape?: 'oval' | 'round' | 'irregular';
  massMargin?: 'circumscribed' | 'obscured' | 'microlobulated' | 'indistinct' | 'spiculated';
  calcMorphology?: 'benign' | 'amorphous' | 'coarse-heterogeneous' | 'fine-pleomorphic' | 'fine-linear-branching';
  calcDistribution?: 'diffuse' | 'regional' | 'grouped' | 'linear' | 'segmental';
}): RadsScoringResult {
  const details: string[] = [];
  const modifiers: string[] = [];
  let cat: BiRadsCategory = '1';

  if (input.hasMass) {
    if (input.massMargin === 'spiculated' || input.massShape === 'irregular') {
      cat = '5';
      details.push('肿块边缘毛刺或形态不规则，高度提示恶性');
    } else if (input.massMargin === 'indistinct' || input.massMargin === 'microlobulated') {
      cat = '4C';
      details.push('肿块边缘模糊/微小分叶，恶性可能 50-95%');
    } else if (input.massMargin === 'obscured') {
      cat = '4A';
      details.push('肿块边缘遮蔽，部分可疑 2-10%');
    } else if (input.massMargin === 'circumscribed' && input.massShape === 'oval') {
      cat = '3';
      details.push('肿块边缘光整 + 形态卵圆形，可能良性 ≤ 2%');
    } else {
      cat = '4A';
      details.push('肿块部分可疑');
    }
  }

  if (input.hasCalcification) {
    if (input.calcMorphology === 'fine-linear-branching' || input.calcDistribution === 'segmental') {
      cat = '5';
      details.push('细线/分枝状钙化或段样分布，高度提示恶性');
    } else if (input.calcMorphology === 'fine-pleomorphic') {
      cat = '4C';
      modifiers.push('细小多形性');
    } else if (input.calcMorphology === 'coarse-heterogeneous') {
      cat = '4B';
    } else if (input.calcMorphology === 'amorphous') {
      cat = '4A';
    }
  }

  if (input.hasAsymmetry) {
    if (cat === ('1' as BiRadsCategory) || cat === ('2' as BiRadsCategory)) cat = '3';
    details.push('不对称结构');
  }

  if (input.hasArchitecture) {
    cat = '4A';
    details.push('结构扭曲');
  }

  const catInfo = BI_RADS_CATEGORIES[cat];
  const riskMap: Record<BiRadsCategory, RadsScoringResult['riskLevel']> = {
    '0': 'intermediate', '1': 'very-low', '2': 'very-low', '3': 'low',
    '4A': 'low', '4B': 'intermediate', '4C': 'high', '5': 'very-high', '6': 'very-high',
  };

  return {
    category: cat,
    categoryName: catInfo.name,
    score: { '0': 0, '1': 10, '2': 15, '3': 30, '4A': 50, '4B': 65, '4C': 80, '5': 95, '6': 100 }[cat],
    riskLevel: riskMap[cat],
    recommendation: catInfo.recommendation,
    details: details.join('；'),
    modifiers,
  };
}

export const BI_RADS_STATS = {
  system: 'BI-RADS',
  version: '5th Edition (2013)',
  source: 'ACR',
  totalDescriptors: MASS_DESCRIPTORS.length + CALCIFICATION_DESCRIPTORS.length + ASYMMETRY_DESCRIPTORS.length + ASSOCIATED_FEATURES.length,
  densityOptions: 4,
  assessmentOptions: 9,
} as const;
