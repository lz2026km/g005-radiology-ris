/**
 * G005 RIS v3.0.6.5 - 通用 RADS 计算引擎
 * 120 升级点 - 11 大 RADS 统一入口
 * 覆盖:BI-RADS / TI-RADS / Lung-RADS / LI-RADS / CAD-RADS / PI-RADS /
 *      C-RADS / NI-RADS / O-RADS / VI-RADS / Bone-RADS
 * 输入:radType + 临床值集合,输出:统一 {score, category, risk, recommendation} + 报告片段
 */
import type { RadsScoringResult, RadsSystem } from '@data/rads/radsCommon';
import {
  scoreBiRads,
  BI_RADS_CATEGORIES,
  BI_RADS_REPORT_SNIPPETS,
  type BiRadsCategory,
} from '@data/rads/biRads';
import {
  scoreTiRads,
  TI_RADS_CATEGORIES,
  TI_RADS_SNIPPETS,
  type TiRadsCategory,
} from '@data/rads/tiRads';
import {
  scoreLungRads,
  LUNG_RADS_CATEGORIES,
  LUNG_RADS_SNIPPETS,
  type LungRadsCategory,
} from '@data/rads/lungRads';
import {
  scoreLiRads,
  LI_RADS_CATEGORIES,
  LI_RADS_SNIPPETS,
  type LiRadsCategory,
} from '@data/rads/liRads';
import {
  scoreCadRads,
  CAD_RADS_STENOSIS,
  CAD_RADS_SNIPPETS,
  type CadRadsStenosis,
} from '@data/rads/cadRads';
import {
  scorePiRads,
  PI_RADS_CATEGORIES,
  PI_RADS_SNIPPETS,
  type PiRadsCategory,
} from '@data/rads/piRads';
import {
  scoreCRadsColonic,
  C_RADS_COLONIC,
  C_RADS_SNIPPETS,
  type CRadsColonic,
} from '@data/rads/cRads';
import {
  scoreNiRads,
  NI_RADS_CATEGORIES,
  NI_RADS_SNIPPETS,
  type NiRadsCategory,
} from '@data/rads/niRads';
import {
  scoreORadsUs,
  O_RADS_US_CATEGORIES,
  O_RADS_US_SNIPPETS,
  type ORadsUsCategory,
} from '@data/rads/oRads';
import {
  scoreViRads,
  VI_RADS_CATEGORIES,
  VI_RADS_SNIPPETS,
  type ViRadsCategory,
} from '@data/rads/viRads';
import {
  scoreBoneRads,
  BONE_RADS_CATEGORIES,
  BONE_RADS_SNIPPETS,
  type BoneRadsCategory,
} from '@data/rads/boneRads';
import type { RadsCalculatorRequest, RadsCalculatorResult, RiskBand } from '@/types/templates/calculations';

// ============================================================
// 元数据:每个 RADS 系统的字段 schema (用于表单绑定 / 校验)
// ============================================================
export interface RadsFieldSchema {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'enum';
  required: boolean;
  options?: Array<{ value: string; label: string; points?: number }>;
  unit?: string;
  min?: number;
  max?: number;
  description?: string;
  group: string;
}

export interface RadsSystemSchema {
  system: RadsSystem;
  label: string;
  labelEn: string;
  source: string;
  version: string;
  fields: RadsFieldSchema[];
  groups: Array<{ key: string; label: string }>;
  categories: Array<{ value: string; label: string; riskBand: RiskBand; recommendation: string }>;
}

export const RADS_SCHEMAS: Record<RadsSystem, RadsSystemSchema> = {
  'BI-RADS': {
    system: 'BI-RADS',
    label: 'BI-RADS 乳腺',
    labelEn: 'BI-RADS Breast',
    source: 'ACR',
    version: '5th',
    fields: [
      { key: 'hasMass', label: '存在肿块', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasCalcification', label: '存在钙化', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasAsymmetry', label: '存在不对称', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasArchitecture', label: '存在结构扭曲', type: 'boolean', required: false, group: 'finding' },
      { key: 'massShape', label: '肿块形态', type: 'enum', required: false, options: [
        { value: 'oval', label: '卵圆形' }, { value: 'round', label: '圆形' }, { value: 'irregular', label: '不规则' },
      ], group: 'mass' },
      { key: 'massMargin', label: '肿块边缘', type: 'enum', required: false, options: [
        { value: 'circumscribed', label: '光整' }, { value: 'obscured', label: '遮蔽' },
        { value: 'microlobulated', label: '微小分叶' }, { value: 'indistinct', label: '模糊' }, { value: 'spiculated', label: '毛刺' },
      ], group: 'mass' },
      { key: 'calcMorphology', label: '钙化形态', type: 'enum', required: false, options: [
        { value: 'benign', label: '典型良性' }, { value: 'amorphous', label: '无定形' },
        { value: 'coarse-heterogeneous', label: '粗糙不均质' }, { value: 'fine-pleomorphic', label: '细小多形性' },
        { value: 'fine-linear-branching', label: '细线/分枝状' },
      ], group: 'calc' },
      { key: 'calcDistribution', label: '钙化分布', type: 'enum', required: false, options: [
        { value: 'diffuse', label: '弥散' }, { value: 'regional', label: '区域性' },
        { value: 'grouped', label: '成簇' }, { value: 'linear', label: '线样' }, { value: 'segmental', label: '段样' },
      ], group: 'calc' },
    ],
    groups: [
      { key: 'finding', label: '病灶' },
      { key: 'mass', label: '肿块' },
      { key: 'calc', label: '钙化' },
    ],
    categories: Object.entries(BI_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('BI-RADS', value), recommendation: c.recommendation,
    })),
  },
  'TI-RADS': {
    system: 'TI-RADS',
    label: 'ACR TI-RADS 甲状腺',
    labelEn: 'ACR TI-RADS Thyroid',
    source: 'ACR',
    version: '2017',
    fields: [
      { key: 'composition', label: '成分', type: 'enum', required: true, options: [
        { value: '0', label: '囊性 0 分', points: 0 },
        { value: '1', label: '海绵状 0 分', points: 0 },
        { value: '2', label: '囊实混合 1 分', points: 1 },
        { value: '3', label: '实性 2 分', points: 2 },
      ], group: 'features' },
      { key: 'echogenicity', label: '回声', type: 'enum', required: true, options: [
        { value: '0', label: '无回声 0 分', points: 0 },
        { value: '1', label: '高/等回声 1 分', points: 1 },
        { value: '2', label: '低回声 2 分', points: 2 },
        { value: '3', label: '极低回声 3 分', points: 3 },
      ], group: 'features' },
      { key: 'shape', label: '形态', type: 'enum', required: true, options: [
        { value: '0', label: '横>纵 0 分', points: 0 },
        { value: '3', label: '纵>横 3 分', points: 3 },
      ], group: 'features' },
      { key: 'margin', label: '边缘', type: 'enum', required: true, options: [
        { value: '0', label: '光整/模糊 0 分', points: 0 },
        { value: '1', label: '分叶/不规则 2 分', points: 2 },
        { value: '2', label: '甲状腺外侵犯 3 分', points: 3 },
      ], group: 'features' },
      { key: 'echogenicFoci', label: '强回声灶', type: 'enum', required: true, options: [
        { value: '0', label: '无/大彗星尾 0 分', points: 0 },
        { value: '1', label: '粗钙化 1 分', points: 1 },
        { value: '2', label: '周边钙化 2 分', points: 2 },
        { value: '3', label: '点状强回声 3 分', points: 3 },
      ], group: 'features' },
      { key: 'sizeMm', label: '结节尺寸 (mm)', type: 'number', required: true, unit: 'mm', min: 0, max: 100, group: 'size' },
    ],
    groups: [
      { key: 'features', label: '特征' },
      { key: 'size', label: '尺寸' },
    ],
    categories: Object.entries(TI_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('TI-RADS', value), recommendation: c.recommendation,
    })),
  },
  'Lung-RADS': {
    system: 'Lung-RADS',
    label: 'Lung-RADS 2022 肺结节',
    labelEn: 'Lung-RADS 2022',
    source: 'ACR',
    version: '2022',
    fields: [
      { key: 'noduleType', label: '结节类型', type: 'enum', required: true, options: [
        { value: 'solid', label: '实性' }, { value: 'part-solid', label: '部分实性' },
        { value: 'ggn', label: '磨玻璃' }, { value: 'cyst', label: '非典型囊肿' },
      ], group: 'finding' },
      { key: 'sizeMm', label: '结节最大径 (mm)', type: 'number', required: true, unit: 'mm', min: 0, max: 200, group: 'finding' },
      { key: 'isNew', label: '新发结节', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasSpiculation', label: '毛刺征', type: 'boolean', required: false, group: 'extra' },
      { key: 'hasPleuralRetraction', label: '胸膜凹陷', type: 'boolean', required: false, group: 'extra' },
      { key: 'hasLymphNode', label: '淋巴结肿大', type: 'boolean', required: false, group: 'extra' },
    ],
    groups: [
      { key: 'finding', label: '结节' },
      { key: 'extra', label: '附加征象' },
    ],
    categories: Object.entries(LUNG_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('Lung-RADS', value), recommendation: c.recommendation,
    })),
  },
  'LI-RADS': {
    system: 'LI-RADS',
    label: 'LI-RADS 肝脏',
    labelEn: 'LI-RADS Liver',
    source: 'ACR',
    version: 'v2018',
    fields: [
      { key: 'sizeMm', label: '病灶最大径 (mm)', type: 'number', required: true, unit: 'mm', min: 0, max: 300, group: 'finding' },
      { key: 'hasNonrimAPHE', label: '非边缘 APHE', type: 'boolean', required: false, group: 'major' },
      { key: 'hasWashout', label: '廓清', type: 'boolean', required: false, group: 'major' },
      { key: 'hasThresholdGrowth', label: '阈值增长', type: 'boolean', required: false, group: 'major' },
      { key: 'hasCapsule', label: '包膜强化', type: 'boolean', required: false, group: 'major' },
      { key: 'hasTargetAppearance', label: '靶环征 (LR-M)', type: 'boolean', required: false, group: 'lr-m' },
      { key: 'hasTIV', label: '静脉癌栓 (LR-TIV)', type: 'boolean', required: false, group: 'lr-tiv' },
      { key: 'isUnclassifiable', label: '不可分类', type: 'boolean', required: false, group: 'meta' },
    ],
    groups: [
      { key: 'finding', label: '病灶' },
      { key: 'major', label: '主要征象' },
      { key: 'lr-m', label: 'LR-M 特征' },
      { key: 'lr-tiv', label: 'LR-TIV 特征' },
      { key: 'meta', label: '元信息' },
    ],
    categories: Object.entries(LI_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('LI-RADS', value), recommendation: c.recommendation,
    })),
  },
  'CAD-RADS': {
    system: 'CAD-RADS',
    label: 'CAD-RADS 2.0 冠脉',
    labelEn: 'CAD-RADS 2.0',
    source: 'SCCT/ACR/ACC/NASCI',
    version: '2.0',
    fields: [
      { key: 'maxStenosisPercent', label: '最大狭窄 (%)', type: 'number', required: true, unit: '%', min: 0, max: 100, group: 'finding' },
      { key: 'affectedVessels', label: '受累血管支数', type: 'number', required: true, min: 0, max: 5, group: 'finding' },
      { key: 'hasLeftMain', label: '左主干受累', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasHighRiskPlaque', label: '高危斑块 (HRP)', type: 'boolean', required: false, group: 'modifier' },
      { key: 'hasFFRCTIschemia', label: 'FFR-CT 缺血', type: 'boolean', required: false, group: 'modifier' },
      { key: 'isNonDiagnostic', label: '图像不可评估', type: 'boolean', required: false, group: 'meta' },
    ],
    groups: [
      { key: 'finding', label: '狭窄' },
      { key: 'modifier', label: '修饰符' },
      { key: 'meta', label: '元信息' },
    ],
    categories: Object.entries(CAD_RADS_STENOSIS).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('CAD-RADS', value), recommendation: c.recommendation,
    })),
  },
  'PI-RADS': {
    system: 'PI-RADS',
    label: 'PI-RADS v2.1 前列腺',
    labelEn: 'PI-RADS v2.1 Prostate',
    source: 'ACR-ESUR',
    version: 'v2.1',
    fields: [
      { key: 'zone', label: '病灶区域', type: 'enum', required: true, options: [
        { value: 'peripheral', label: '外周带' }, { value: 'transition', label: '移行带' },
      ], group: 'finding' },
      { key: 't2wScore', label: 'T2W 评分', type: 'number', required: true, min: 1, max: 5, group: 'score' },
      { key: 'dwiScore', label: 'DWI 评分', type: 'number', required: true, min: 1, max: 5, group: 'score' },
      { key: 'dcePositive', label: 'DCE 阳性', type: 'boolean', required: false, group: 'score' },
      { key: 'sizeMm', label: '病灶最大径 (mm)', type: 'number', required: true, unit: 'mm', min: 0, max: 100, group: 'finding' },
      { key: 'hasExtraprostaticExtension', label: '前列腺外侵犯', type: 'boolean', required: false, group: 'extra' },
    ],
    groups: [
      { key: 'finding', label: '病灶' },
      { key: 'score', label: '评分' },
      { key: 'extra', label: '侵犯' },
    ],
    categories: Object.entries(PI_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('PI-RADS', value), recommendation: c.recommendation,
    })),
  },
  'C-RADS': {
    system: 'C-RADS',
    label: 'C-RADS 结肠',
    labelEn: 'C-RADS Colonography',
    source: 'ACR',
    version: 'v2023',
    fields: [
      { key: 'polypCount', label: '息肉总数', type: 'number', required: true, min: 0, max: 50, group: 'colonic' },
      { key: 'maxPolypSizeMm', label: '最大息肉 (mm)', type: 'number', required: true, unit: 'mm', min: 0, max: 100, group: 'colonic' },
      { key: 'hasMass', label: '存在肿块', type: 'boolean', required: false, group: 'colonic' },
    ],
    groups: [
      { key: 'colonic', label: '结肠发现' },
    ],
    categories: Object.entries(C_RADS_COLONIC).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('C-RADS', value), recommendation: c.recommendation,
    })),
  },
  'NI-RADS': {
    system: 'NI-RADS',
    label: 'NI-RADS 头颈',
    labelEn: 'NI-RADS Neck',
    source: 'ACR',
    version: 'v2025',
    fields: [
      { key: 'hasNewMass', label: '新发肿块', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasDiffusionRestriction', label: '弥散受限', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasEnhancement', label: '强化', type: 'boolean', required: false, group: 'finding' },
      { key: 'isPathologyConfirmed', label: '病理证实', type: 'boolean', required: false, group: 'finding' },
    ],
    groups: [
      { key: 'finding', label: '病灶' },
    ],
    categories: Object.entries(NI_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('NI-RADS', value), recommendation: c.recommendation,
    })),
  },
  'O-RADS': {
    system: 'O-RADS',
    label: 'O-RADS 卵巢',
    labelEn: 'O-RADS Ovarian',
    source: 'ACR',
    version: 'v2022',
    fields: [
      { key: 'isNormal', label: '正常卵巢', type: 'boolean', required: false, group: 'finding' },
      { key: 'isTypicalBenign', label: '典型良性', type: 'boolean', required: false, group: 'finding' },
      { key: 'isUnilocular', label: '单房囊性', type: 'boolean', required: false, group: 'finding' },
      { key: 'isMultilocular', label: '多房囊性', type: 'boolean', required: false, group: 'finding' },
      { key: 'isSolid', label: '实性', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasPapillation', label: '乳头状突起', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasAscites', label: '腹水', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasRichVascularity', label: '富血供', type: 'boolean', required: false, group: 'finding' },
      { key: 'sizeMm', label: '病灶最大径 (mm)', type: 'number', required: true, unit: 'mm', min: 0, max: 300, group: 'finding' },
    ],
    groups: [
      { key: 'finding', label: '附件' },
    ],
    categories: Object.entries(O_RADS_US_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('O-RADS', value), recommendation: c.recommendation,
    })),
  },
  'VI-RADS': {
    system: 'VI-RADS',
    label: 'VI-RADS 膀胱',
    labelEn: 'VI-RADS Bladder',
    source: 'ECR',
    version: '2018',
    fields: [
      { key: 'sizeMm', label: '肿瘤最大径 (mm)', type: 'number', required: true, unit: 'mm', min: 0, max: 200, group: 'finding' },
      { key: 'stalkPresent', label: '带蒂', type: 'boolean', required: false, group: 'finding' },
      { key: 'muscleInvasionSuspected', label: '可疑肌层侵犯', type: 'boolean', required: false, group: 'finding' },
      { key: 'muscleInvasionDefinite', label: '明确肌层侵犯', type: 'boolean', required: false, group: 'finding' },
      { key: 'perivesicalInvasion', label: '膀胱外侵犯', type: 'boolean', required: false, group: 'finding' },
    ],
    groups: [
      { key: 'finding', label: '膀胱' },
    ],
    categories: Object.entries(VI_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('VI-RADS', value), recommendation: c.recommendation,
    })),
  },
  'Bone-RADS': {
    system: 'Bone-RADS',
    label: 'Bone-RADS 偶发骨病灶',
    labelEn: 'Bone-RADS',
    source: 'ACR',
    version: '2023',
    fields: [
      { key: 'isTypicalBenign', label: '典型良性', type: 'boolean', required: false, group: 'finding' },
      { key: 'isUncharacterized', label: '未完全特征化', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasAggressiveFeatures', label: '侵袭特征', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasOsteolysis', label: '溶骨破坏', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasPeriostealReaction', label: '骨膜反应', type: 'boolean', required: false, group: 'finding' },
      { key: 'hasSoftTissueMass', label: '软组织肿块', type: 'boolean', required: false, group: 'finding' },
    ],
    groups: [
      { key: 'finding', label: '骨病灶' },
    ],
    categories: Object.entries(BONE_RADS_CATEGORIES).map(([value, c]) => ({
      value, label: c.name, riskBand: bandFromCode('Bone-RADS', value), recommendation: c.recommendation,
    })),
  },
};

// ============================================================
// 风险等级映射
// ============================================================
function bandFromCode(system: RadsSystem, value: string): RiskBand {
  const code = String(value);
  if (system === 'BI-RADS') {
    if (['0', '1', '2'].includes(code)) return 'very-low';
    if (code === '3') return 'low';
    if (code === '4A') return 'low';
    if (code === '4B') return 'intermediate';
    if (code === '4C') return 'high';
    if (['5', '6'].includes(code)) return 'very-high';
  }
  if (system === 'TI-RADS') {
    if (['TR1', 'TR2'].includes(code)) return 'very-low';
    if (code === 'TR3') return 'low';
    if (code === 'TR4') return 'intermediate';
    if (code === 'TR5') return 'high';
  }
  if (system === 'Lung-RADS') {
    if (['0', '1', '2'].includes(code)) return 'very-low';
    if (code === '3') return 'low';
    if (code === '4A') return 'intermediate';
    if (code === '4B') return 'high';
    if (code === '4X') return 'very-high';
  }
  if (system === 'LI-RADS') {
    if (code === 'LR-1' || code === 'LR-NC') return 'very-low';
    if (code === 'LR-2') return 'low';
    if (code === 'LR-3') return 'intermediate';
    if (code === 'LR-4' || code === 'LR-M') return 'high';
    if (code === 'LR-5' || code === 'LR-TIV') return 'very-high';
  }
  if (system === 'CAD-RADS') {
    if (['0', '1', '2'].includes(code)) return 'very-low';
    if (code === '3') return 'intermediate';
    if (code === '4A') return 'high';
    if (code === '4B' || code === '5') return 'very-high';
    if (code === 'N') return 'intermediate';
  }
  if (system === 'PI-RADS') {
    if (['1', '2'].includes(code)) return 'low';
    if (code === '3') return 'intermediate';
    if (code === '4') return 'high';
    if (code === '5') return 'very-high';
  }
  if (system === 'C-RADS') {
    if (code === 'C0') return 'intermediate';
    if (code === 'C1') return 'very-low';
    if (code === 'C2') return 'low';
    if (code === 'C3') return 'high';
    if (code === 'C4') return 'very-high';
  }
  if (system === 'NI-RADS') {
    if (code === '1') return 'low';
    if (code === '2') return 'intermediate';
    if (code === '3') return 'high';
    if (code === '4') return 'very-high';
  }
  if (system === 'O-RADS') {
    if (code === '0') return 'intermediate';
    if (['1', '2'].includes(code)) return 'very-low';
    if (code === '3') return 'low';
    if (code === '4') return 'intermediate';
    if (code === '5') return 'very-high';
  }
  if (system === 'VI-RADS') {
    if (code === '1') return 'very-low';
    if (code === '2') return 'low';
    if (code === '3') return 'intermediate';
    if (code === '4') return 'high';
    if (code === '5') return 'very-high';
  }
  if (system === 'Bone-RADS') {
    if (code === '1') return 'very-low';
    if (code === '2') return 'low';
    if (code === '3') return 'intermediate';
    if (code === '4') return 'high';
  }
  return 'low';
}

// ============================================================
// 计算引擎主类
// ============================================================
export class RadsCalculatorEngine {
  private static instance: RadsCalculatorEngine;
  static getInstance(): RadsCalculatorEngine {
    if (!RadsCalculatorEngine.instance) RadsCalculatorEngine.instance = new RadsCalculatorEngine();
    return RadsCalculatorEngine.instance;
  }

  /**
   * 统一计算入口
   */
  calculate(req: RadsCalculatorRequest): RadsCalculatorResult {
    const dispatcher = RADS_DISPATCHERS[req.radsType];
    if (!dispatcher) {
      throw new Error(`Unsupported RADS system: ${req.radsType}`);
    }
    const base = dispatcher(req.values);
    const snippet = dispatcher.snippet(req.values, base.category);
    const warnings = this.collectWarnings(req);
    return {
      ...base,
      radsType: req.radsType,
      modality: req.modality,
      bodyPart: req.bodyPart,
      inputs: req.values,
      snippet,
      explanation: this.explain(req.radsType, base, req.values),
      warnings,
      computedAt: new Date().toISOString(),
    };
  }

  /** 获取系统 schema(UI 用) */
  getSchema(system: RadsSystem): RadsSystemSchema {
    return RADS_SCHEMAS[system];
  }

  /** 列出所有支持的系统 */
  listSystems(): RadsSystem[] {
    return Object.keys(RADS_SCHEMAS) as RadsSystem[];
  }

  /** 取风险等级 */
  getRiskBand(system: RadsSystem, category: string): RiskBand {
    return bandFromCode(system, category);
  }

  /** 取等级标签 */
  getCategoryLabel(system: RadsSystem, category: string): string {
    const schema = RADS_SCHEMAS[system];
    return schema.categories.find((c) => c.value === category)?.label ?? category;
  }

  private explain(system: RadsSystem, result: RadsScoringResult, values: Record<string, unknown>): string {
    const schema = RADS_SCHEMAS[system];
    const facts: string[] = [];
    for (const f of schema.fields) {
      const v = values[f.key];
      if (v === undefined || v === null || v === '') continue;
      facts.push(`${f.label}=${String(v)}`);
    }
    return `[${system} ${result.category}] 评分 ${result.score}, 风险等级 ${result.riskLevel};关键因素:${facts.join(' / ')}`;
  }

  private collectWarnings(req: RadsCalculatorRequest): string[] {
    const schema = RADS_SCHEMAS[req.radsType];
    const missing = schema.fields.filter((f) => f.required).filter((f) => {
      const v = req.values[f.key];
      return v === undefined || v === null || v === '';
    });
    return missing.map((f) => `必填项缺失:${f.label} (${f.key})`);
  }
}

// ============================================================
// 内部:各 RADS 系统的 dispatcher
// ============================================================
type Dispatcher = (values: Record<string, unknown>) => RadsScoringResult;
type SnippetGetter = (values: Record<string, unknown>, category: string) => RadsCalculatorResult['snippet'];

interface DispatcherEntry {
  (values: Record<string, unknown>): RadsScoringResult;
  snippet: SnippetGetter;
}

function toNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(v: unknown): boolean {
  return v === true || v === 'true' || v === 1 || v === '1';
}

const biradsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreBiRads({
    hasMass: toBool(values['hasMass']),
    hasCalcification: toBool(values['hasCalcification']),
    hasAsymmetry: toBool(values['hasAsymmetry']),
    hasArchitecture: toBool(values['hasArchitecture']),
    massShape: values['massShape'] as 'oval' | 'round' | 'irregular' | undefined,
    massMargin: values['massMargin'] as 'circumscribed' | 'obscured' | 'microlobulated' | 'indistinct' | 'spiculated' | undefined,
    calcMorphology: values['calcMorphology'] as 'benign' | 'amorphous' | 'coarse-heterogeneous' | 'fine-pleomorphic' | 'fine-linear-branching' | undefined,
    calcDistribution: values['calcDistribution'] as 'diffuse' | 'regional' | 'grouped' | 'linear' | 'segmental' | undefined,
  })) as DispatcherEntry;
biradsDispatcher.snippet = (values, category) => {
  const sn = BI_RADS_REPORT_SNIPPETS[category as BiRadsCategory];
  if (!sn) return undefined;
  return {
    finding: sn.findingTemplate,
    impression: sn.impressionTemplate,
    recommendation: sn.recommendationTemplate,
  };
};

const tiradsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreTiRads({
    composition: toNumber(values['composition'], 0) as 0 | 1 | 2 | 3,
    echogenicity: toNumber(values['echogenicity'], 0) as 0 | 1 | 2 | 3,
    shape: toNumber(values['shape'], 0) as 0 | 3,
    margin: toNumber(values['margin'], 0) as 0 | 1 | 2,
    echogenicFoci: toNumber(values['echogenicFoci'], 0) as 0 | 1 | 2 | 3,
    sizeMm: toNumber(values['sizeMm']),
  })) as DispatcherEntry;
tiradsDispatcher.snippet = (values, category) => {
  const sn = TI_RADS_SNIPPETS[category as TiRadsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const lungRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreLungRads({
    noduleType: (values['noduleType'] as 'solid' | 'part-solid' | 'ggn' | 'cyst') ?? 'solid',
    sizeMm: toNumber(values['sizeMm']),
    isNew: toBool(values['isNew']),
    hasSpiculation: toBool(values['hasSpiculation']),
    hasPleuralRetraction: toBool(values['hasPleuralRetraction']),
    hasLymphNode: toBool(values['hasLymphNode']),
  })) as DispatcherEntry;
lungRadsDispatcher.snippet = (values, category) => {
  const sn = LUNG_RADS_SNIPPETS[category as LungRadsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const liRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreLiRads({
    sizeMm: toNumber(values['sizeMm']),
    hasNonrimAPHE: toBool(values['hasNonrimAPHE']),
    hasWashout: toBool(values['hasWashout']),
    hasThresholdGrowth: toBool(values['hasThresholdGrowth']),
    hasCapsule: toBool(values['hasCapsule']),
    hasTargetAppearance: toBool(values['hasTargetAppearance']),
    hasTIV: toBool(values['hasTIV']),
    isUnclassifiable: toBool(values['isUnclassifiable']),
  })) as DispatcherEntry;
liRadsDispatcher.snippet = (values, category) => {
  const sn = LI_RADS_SNIPPETS[category as LiRadsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const cadRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreCadRads({
    maxStenosisPercent: toNumber(values['maxStenosisPercent']),
    affectedVessels: toNumber(values['affectedVessels']),
    hasLeftMain: toBool(values['hasLeftMain']),
    hasHighRiskPlaque: toBool(values['hasHighRiskPlaque']),
    hasFFRCTIschemia: toBool(values['hasFFRCTIschemia']),
    isNonDiagnostic: toBool(values['isNonDiagnostic']),
  })) as DispatcherEntry;
cadRadsDispatcher.snippet = (values, category) => {
  const sn = CAD_RADS_SNIPPETS[category as CadRadsStenosis];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const piRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scorePiRads({
    zone: (values['zone'] as 'peripheral' | 'transition') ?? 'peripheral',
    t2wScore: Math.max(1, Math.min(5, toNumber(values['t2wScore'], 3))) as 1 | 2 | 3 | 4 | 5,
    dwiScore: Math.max(1, Math.min(5, toNumber(values['dwiScore'], 3))) as 1 | 2 | 3 | 4 | 5,
    dcePositive: toBool(values['dcePositive']),
    sizeMm: toNumber(values['sizeMm']),
    hasExtraprostaticExtension: toBool(values['hasExtraprostaticExtension']),
  })) as DispatcherEntry;
piRadsDispatcher.snippet = (values, category) => {
  const sn = PI_RADS_SNIPPETS[category as PiRadsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const cRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) => {
  const count = toNumber(values['polypCount']);
  const size = toNumber(values['maxPolypSizeMm']);
  return scoreCRadsColonic({
    polyps: [{ count, maxSizeMm: size }],
    hasMass: toBool(values['hasMass']),
  });
}) as DispatcherEntry;
cRadsDispatcher.snippet = (values, category) => {
  const sn = C_RADS_SNIPPETS.colonic[category as CRadsColonic];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const niRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreNiRads({
    hasNewMass: toBool(values['hasNewMass']),
    hasDiffusionRestriction: toBool(values['hasDiffusionRestriction']),
    hasEnhancement: toBool(values['hasEnhancement']),
    isPathologyConfirmed: toBool(values['isPathologyConfirmed']),
  })) as DispatcherEntry;
niRadsDispatcher.snippet = (values, category) => {
  const sn = NI_RADS_SNIPPETS[category as NiRadsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const oRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreORadsUs({
    isNormal: toBool(values['isNormal']),
    isTypicalBenign: toBool(values['isTypicalBenign']),
    isUnilocular: toBool(values['isUnilocular']),
    isMultilocular: toBool(values['isMultilocular']),
    isSolid: toBool(values['isSolid']),
    hasPapillation: toBool(values['hasPapillation']),
    hasAscites: toBool(values['hasAscites']),
    hasRichVascularity: toBool(values['hasRichVascularity']),
    sizeMm: toNumber(values['sizeMm']),
  })) as DispatcherEntry;
oRadsDispatcher.snippet = (values, category) => {
  const sn = O_RADS_US_SNIPPETS[category as ORadsUsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const viRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreViRads({
    sizeMm: toNumber(values['sizeMm']),
    stalkPresent: toBool(values['stalkPresent']),
    muscleInvasionSuspected: toBool(values['muscleInvasionSuspected']),
    muscleInvasionDefinite: toBool(values['muscleInvasionDefinite']),
    perivesicalInvasion: toBool(values['perivesicalInvasion']),
  })) as DispatcherEntry;
viRadsDispatcher.snippet = (values, category) => {
  const sn = VI_RADS_SNIPPETS[category as ViRadsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const boneRadsDispatcher: DispatcherEntry = ((values: Record<string, unknown>) =>
  scoreBoneRads({
    isTypicalBenign: toBool(values['isTypicalBenign']),
    isUncharacterized: toBool(values['isUncharacterized']),
    hasAggressiveFeatures: toBool(values['hasAggressiveFeatures']),
    hasOsteolysis: toBool(values['hasOsteolysis']),
    hasPeriostealReaction: toBool(values['hasPeriostealReaction']),
    hasSoftTissueMass: toBool(values['hasSoftTissueMass']),
  })) as DispatcherEntry;
boneRadsDispatcher.snippet = (values, category) => {
  const sn = BONE_RADS_SNIPPETS[category as BoneRadsCategory];
  if (!sn) return undefined;
  return { finding: sn.findingTemplate, impression: sn.impressionTemplate, recommendation: sn.recommendationTemplate };
};

const RADS_DISPATCHERS: Record<RadsSystem, DispatcherEntry> = {
  'BI-RADS': biradsDispatcher,
  'TI-RADS': tiradsDispatcher,
  'Lung-RADS': lungRadsDispatcher,
  'LI-RADS': liRadsDispatcher,
  'CAD-RADS': cadRadsDispatcher,
  'PI-RADS': piRadsDispatcher,
  'C-RADS': cRadsDispatcher,
  'NI-RADS': niRadsDispatcher,
  'O-RADS': oRadsDispatcher,
  'VI-RADS': viRadsDispatcher,
  'Bone-RADS': boneRadsDispatcher,
};

// 导出便捷函数
export const calculateRads = (req: RadsCalculatorRequest): RadsCalculatorResult =>
  RadsCalculatorEngine.getInstance().calculate(req);
