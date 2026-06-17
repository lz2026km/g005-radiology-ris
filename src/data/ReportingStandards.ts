// G005 放射RIS - 国际报告分级标准 v1.0.0
// Lung-RADS v2022, PI-RADS v2.1, CAD-RADS

// ============================================================
// 结构化报告模板类型 (复制自ReportWritePage以避免循环依赖)
// ============================================================
interface StructuredTemplateSection {
  id: string
  label: string
  placeholder: string
  type: 'text' | 'measurement' | 'select'
  options?: string[]
  required?: boolean
}

interface StructuredTemplate {
  id: string
  name: string
  modality: string
  bodyPart: string
  sections: StructuredTemplateSection[]
  conclusionTemplate: string
  recommendationTemplate: string
}

// ============================================================
// Lung-RADS v2022 分级标准
// ============================================================
export interface LungRADSCategory {
  code: string
  label: string
  description: string
  criteria: {
    noduleType: string
    size: string
    density: string
    morphology: string
  }
  recommendation: string
  nextStep: string
}

export const LUNG_RADS_CATEGORIES: LungRADSCategory[] = [
  {
    code: '0',
    label: 'Lung-RADS 0',
    description: '检查不完整，需要额外评估',
    criteria: { noduleType: 'N/A', size: 'N/A', density: 'N/A', morphology: '信息不完整' },
    recommendation: '建议补充相关检查或与既往检查对比',
    nextStep: '完成评估后再行分级',
  },
  {
    code: '1',
    label: 'Lung-RADS 1',
    description: '无结节或确定为良性结节',
    criteria: { noduleType: '无结节', size: 'N/A', density: 'N/A', morphology: '确定为良性钙化' },
    recommendation: '继续常规年度筛查',
    nextStep: '年度LDCT筛查',
  },
  {
    code: '2',
    label: 'Lung-RADS 2',
    description: '良性结节的可能性大',
    criteria: { noduleType: '实性结节', size: '<30mm', density: '实性', morphology: '边缘光滑' },
    recommendation: '继续常规年度筛查',
    nextStep: '12个月后复查LDCT',
  },
  {
    code: '3',
    label: 'Lung-RADS 3',
    description: '可能为良性结节',
    criteria: { noduleType: '实性结节', size: '≥30mm或增长<5mm', density: '实性', morphology: '边缘光滑' },
    recommendation: '6个月后复查LDCT',
    nextStep: '6个月后复查LDCT',
  },
  {
    code: '4A',
    label: 'Lung-RADS 4A',
    description: '可疑恶性结节，需进一步检查',
    criteria: { noduleType: '实性结节', size: '≥15mm或增长≥5mm', density: '实性', morphology: '边缘毛刺/分叶' },
    recommendation: '建议增强CT或PET-CT检查',
    nextStep: '3个月后复查，或增强CT/PET',
  },
  {
    code: '4B',
    label: 'Lung-RADS 4B',
    description: '高度可疑恶性',
    criteria: { noduleType: '实性结节', size: '≥30mm或明显增长', density: '实性', morphology: '边缘毛刺/分叶/胸膜牵拉' },
    recommendation: '建议活检或PET-CT',
    nextStep: '活检或多学科讨论',
  },
  {
    code: '4X',
    label: 'Lung-RADS 4X',
    description: '极高风险结节伴额外特征',
    criteria: { noduleType: '任何结节', size: '任何大小', density: '任何密度', morphology: '毛刺征/淋巴结肿大/胸水' },
    recommendation: '紧急活检和多学科评估',
    nextStep: '活检+MDT',
  },
]

// Lung-RADS 结节尺寸阈值
export const LUNG_RADS_SIZE_THRESHOLDS = {
  SUBSPECIALTY: { solid: 30, partSolid: 30, groundGlass: 50 },
  ACTIONABLE: { solid: 15, partSolid: 15, groundGlass: 20 },
}

// ============================================================
// PI-RADS v2.1 前列腺MRI评分标准
// ============================================================
export interface PIRADSCategory {
  score: number
  label: string
  description: string
  clinicalSignificance: string
  recommendation: string
}

export const PI_RADS_CATEGORIES: PIRADSCategory[] = [
  {
    score: 1,
    label: 'PI-RADS 1',
    description: '极低疑似恶性',
    clinicalSignificance: '几乎可以排除临床显著癌',
    recommendation: '继续常规随访',
  },
  {
    score: 2,
    label: 'PI-RADS 2',
    description: '低度疑似恶性',
    clinicalSignificance: '临床显著癌的可能性很低',
    recommendation: '继续常规随访',
  },
  {
    score: 3,
    label: 'PI-RADS 3',
    description: '中度疑似恶性',
    clinicalSignificance: '临床意义不明确，需结合临床',
    recommendation: '考虑活检，尤其当临床怀疑时',
  },
  {
    score: 4,
    label: 'PI-RADS 4',
    description: '高度疑似恶性',
    clinicalSignificance: '临床显著癌的可能性较高',
    recommendation: '建议系统性活检',
  },
  {
    score: 5,
    label: 'PI-RADS 5',
    description: '极高疑似恶性',
    clinicalSignificance: '临床显著癌的可能性极高',
    recommendation: '强烈建议活检',
  },
]

// PI-RADS 评分规则
export interface PIRADSScoringRule {
  sequence: 'DWI' | 'DCE' | 'T2W'
  finding: string
  score: number
  description: string
}

export const PI_RADS_SCORING_RULES = {
  // 扩散加权成像 (DWI) 评分
  DWI: [
    { finding: '无明显异常信号', score: 1, description: '均匀高b值信号，无明显低信号病灶' },
    { finding: '可能良性', score: 2, description: '边缘清晰的对称性高信号，或小于15mm的均匀高信号' },
    { finding: '不确定', score: 3, description: '线性或锥形低信号，或边界不清的高信号' },
    { finding: '可疑恶性', score: 4, description: '局灶性高信号，ADC图呈低信号，形状/边缘不规则' },
    { finding: '典型癌', score: 5, description: '明显高信号伴ADC图明显低信号，侵犯包膜/神经血管束' },
  ] as PIRADSScoringRule[],
  // 动态增强 (DCE) 评分
  DCE: [
    { finding: '阴性', score: 0, description: '无早期强化或弥漫性均匀强化' },
    { finding: '局灶性强化-', score: 0, description: '强化灶但小于DWI高信号或无对应病灶' },
    { finding: '局灶性强化+', score: 1, description: '局灶性早期强化，与DWI对应或早于前列腺组织强化' },
  ] as PIRADSScoringRule[],
  // T2加权成像评分
  T2W: [
    { finding: '均匀高信号', score: 1, description: '正常年轻患者的外周带信号' },
    { finding: '线性/楔形低信号', score: 2, description: '边缘模糊的线性或楔形低信号' },
    { finding: '弥漫性信号减低', score: 3, description: '不伴肿块形成的弥漫性信号减低，多灶性或跨越2/3以上' },
    { finding: '局灶性低信号肿块', score: 4, description: '外周带或移行带局灶性低信号，形态不规则，≤1.5cm' },
    { finding: '明显肿块伴侵犯', score: 5, description: '明显肿块，>1.5cm，或侵犯包膜/神经血管束/精囊' },
  ] as PIRADSScoringRule[],
}

// ============================================================
// CAD-RADS 冠脉狭窄分级标准
// ============================================================
export interface CADRADSCategory {
  grade: string
  label: string
  stenosis: string
  description: string
  recommendation: string
  modifiers: string[]
}

export const CAD_RADS_CATEGORIES: CADRADSCategory[] = [
  {
    grade: '0',
    label: 'CAD-RADS 0',
    stenosis: '0%',
    description: '冠脉无狭窄或无斑块',
    recommendation: '无需进一步检查',
    modifiers: [],
  },
  {
    grade: '1',
    label: 'CAD-RADS 1',
    stenosis: '1-24%',
    description: '轻微狭窄或非阻塞性斑块',
    recommendation: '考虑危险因素管理',
    modifiers: ['N'],
  },
  {
    grade: '2',
    label: 'CAD-RADS 2',
    stenosis: '25-49%',
    description: '轻度狭窄',
    recommendation: '考虑进一步功能评估',
    modifiers: ['N'],
  },
  {
    grade: '3',
    label: 'CAD-RADS 3',
    stenosis: '50-69%',
    description: '中度狭窄',
    recommendation: '建议功能评估或心脏科就诊',
    modifiers: ['N'],
  },
  {
    grade: '4A',
    label: 'CAD-RADS 4A',
    stenosis: '70-99%',
    description: '重度狭窄（单支或两支）',
    recommendation: '强烈建议心脏科就诊评估血运重建',
    modifiers: ['V'],
  },
  {
    grade: '4B',
    label: 'CAD-RADS 4B',
    stenosis: '70-99%',
    description: '重度狭窄伴左主干或三支病变',
    recommendation: '紧急心脏科就诊，评估血运重建',
    modifiers: ['M', 'V'],
  },
  {
    grade: '5',
    label: 'CAD-RADS 5',
    stenosis: '100%',
    description: '完全闭塞',
    recommendation: '紧急心脏科就诊',
    modifiers: ['V'],
  },
]

// CAD-RADS 修饰符
export const CAD_RADS_MODIFIERS = {
  N: { label: 'N', name: 'Non-assessable', description: '无法评估的节段' },
  M: { label: 'M', name: 'Maximally stenosed', description: '最多狭窄处' },
  V: { label: 'V', name: 'Vulnerable plaque', description: '易损斑块（正性重构、点状钙化、低密度斑块）' },
  I: { label: 'I', name: ' stent/Interval', description: '支架内或评估间隔' },
}

// CAD-RADS 冠脉分段
export const CORONARY_SEGMENTS = [
  { code: 'LM', name: '左主干', anatomy: '左主干' },
  { code: 'LAD', name: '左前降支', anatomy: '左前降支近/中/远段' },
  { code: 'LCX', name: '左回旋支', anatomy: '左回旋支近/远段' },
  { code: 'RCA', name: '右冠状动脉', anatomy: '右冠近/中/远段' },
]

// ============================================================
// 结构化模板定义
// ============================================================

// Lung-RADS 结构化模板
export const LUNG_RADS_TEMPLATE: StructuredTemplate = {
  id: 'st_lung_rads',
  name: '胸部低剂量CT (Lung-RADS)',
  modality: 'CT',
  bodyPart: '胸部',
  sections: [
    { id: 'lr_nodule_location', label: '结节部位', placeholder: '右上肺尖段、左下肺背段...', type: 'text', required: true },
    { id: 'lr_nodule_size', label: '结节大小 (mm)', placeholder: '输入结节直径，如6', type: 'measurement', required: true },
    { id: 'lr_nodule_density', label: '密度类型', placeholder: '选择密度类型', type: 'select', options: ['实性', '磨玻璃', '部分实性'], required: true },
    { id: 'lr_nodule_morphology', label: '形态特征', placeholder: '边缘光滑/毛刺分叶/空洞...', type: 'text', required: false },
    { id: 'lr_calcification', label: '钙化情况', placeholder: '无钙化/中心钙化/爆米花钙化...', type: 'text', required: false },
    { id: 'lr_category', label: 'Lung-RADS分类', placeholder: '系统自动计算', type: 'select', options: ['0', '1', '2', '3', '4A', '4B', '4X'], required: true },
    { id: 'lr_recommendation', label: '建议', placeholder: '系统自动生成建议', type: 'text', required: false },
  ],
  conclusionTemplate: 'Lung-RADS [分类]，建议[下一步措施]',
  recommendationTemplate: '[时间]个月后复查胸部CT',
}

// PI-RADS 结构化模板
export const PI_RADS_TEMPLATE: StructuredTemplate = {
  id: 'st_pi_rads',
  name: '前列腺MRI (PI-RADS)',
  modality: 'MR',
  bodyPart: '盆腔',
  sections: [
    { id: 'pr_dwi_score', label: 'DWI评分', placeholder: '选择DWI评分', type: 'select', options: ['1', '2', '3', '4', '5'], required: true },
    { id: 'pr_dwi_finding', label: 'DWI表现', placeholder: '描述DWI高信号区域...', type: 'text', required: false },
    { id: 'pr_dce_score', label: 'DCE评分', placeholder: '选择DCE评分', type: 'select', options: ['阴性(-)', '局灶性强化(-)', '局灶性强化(+)'], required: true },
    { id: 'pr_dce_finding', label: 'DCE表现', placeholder: '描述早期强化区域...', type: 'text', required: false },
    { id: 'pr_t2w_score', label: 'T2W评分', placeholder: '选择T2W评分', type: 'select', options: ['1', '2', '3', '4', '5'], required: true },
    { id: 'pr_t2w_finding', label: 'T2W表现', placeholder: '描述T2W信号异常区域...', type: 'text', required: false },
    { id: 'pr_total_score', label: 'PI-RADS总分', placeholder: '系统自动计算', type: 'text', required: true },
    { id: 'pr_clinical_significance', label: '临床意义', placeholder: '系统自动判定', type: 'text', required: false },
  ],
  conclusionTemplate: 'PI-RADS [总分]，建议[处理意见]',
  recommendationTemplate: '建议泌尿外科就诊，评估活检指征',
}

// CAD-RADS 结构化模板
export const CAD_RADS_TEMPLATE: StructuredTemplate = {
  id: 'st_cad_rads',
  name: '冠脉CTA (CAD-RADS)',
  modality: 'CTA',
  bodyPart: '心脏',
  sections: [
    { id: 'cr_lm_stenosis', label: '左主干狭窄%', placeholder: '输入0-100', type: 'measurement', required: true },
    { id: 'cr_lad_prox_stenosis', label: '左前降支近段狭窄%', placeholder: '输入0-100', type: 'measurement', required: true },
    { id: 'cr_lad_mid_stenosis', label: '左前降支中远段狭窄%', placeholder: '输入0-100', type: 'measurement', required: false },
    { id: 'cr_lcx_stenosis', label: '左回旋支狭窄%', placeholder: '输入0-100', type: 'measurement', required: true },
    { id: 'cr_rca_stenosis', label: '右冠状动脉狭窄%', placeholder: '输入0-100', type: 'measurement', required: true },
    { id: 'cr_modifier', label: '修饰符', placeholder: '选择修饰符', type: 'select', options: ['无', 'N-无法评估', 'M-最多狭窄处', 'V-易损斑块', 'I-支架内'], required: false },
    { id: 'cr_plaque_type', label: '斑块性质', placeholder: '描述斑块性质（软斑块/混合斑块/钙化斑块）', type: 'text', required: false },
    { id: 'cr_category', label: 'CAD-RADS分级', placeholder: '系统自动计算', type: 'text', required: true },
  ],
  conclusionTemplate: 'CAD-RADS [分级][修饰符]，冠脉[狭窄情况]',
  recommendationTemplate: '建议心脏科就诊，评估血运重建指征',
}

// ============================================================
// 自动计算函数
// ============================================================

// 计算 Lung-RADS 分类
export function calculateLungRADS(
  size: number,
  density: '实性' | '磨玻璃' | '部分实性',
  morphology: string
): { category: string; recommendation: string } {
  // 毛刺/分叶等恶性特征
  const hasSuspiciousFeatures = morphology.includes('毛刺') || 
                                morphology.includes('分叶') || 
                                morphology.includes('胸膜牵拉') ||
                                morphology.includes('空洞')

  // 部分实性结节处理
  if (density === '部分实性') {
    if (size >= 30 || hasSuspiciousFeatures) {
      return { category: '4B', recommendation: '建议活检和多学科讨论' }
    }
    if (size >= 15) {
      return { category: '4A', recommendation: '建议增强CT或PET-CT检查' }
    }
    return { category: '3', recommendation: '6个月后复查LDCT' }
  }

  // 磨玻璃结节
  if (density === '磨玻璃') {
    if (size >= 50 || hasSuspiciousFeatures) {
      return { category: '4B', recommendation: '建议活检和多学科讨论' }
    }
    if (size >= 20) {
      return { category: '3', recommendation: '6个月后复查LDCT' }
    }
    return { category: '2', recommendation: '12个月后复查LDCT' }
  }

  // 实性结节
  if (hasSuspiciousFeatures) {
    if (size >= 30) {
      return { category: '4B', recommendation: '建议活检和多学科讨论' }
    }
    if (size >= 15) {
      return { category: '4A', recommendation: '建议增强CT或PET-CT检查' }
    }
  }

  if (size >= 30) {
    return { category: '3', recommendation: '6个月后复查LDCT' }
  }
  if (size >= 15) {
    return { category: '4A', recommendation: '建议增强CT或PET-CT检查' }
  }
  
  return { category: '2', recommendation: '12个月后复查LDCT' }
}

// 计算 PI-RADS 总分 (取DWI和T2W中的较高分,结合DCE)
export function calculatePIRADS(
  dwiScore: number,
  dceScore: number,
  t2wScore: number
): { totalScore: number; clinicalSignificance: string; recommendation: string } {
  // 外周带主要看DWI+IDC, 移行带看T2W为主
  // 取DWI和T2W较高分作为基础分
  let baseScore = Math.max(dwiScore, t2wScore)
  
  // 如果DCE(+)且基础分为3，则升为4
  if (dceScore === 1 && baseScore === 3) {
    baseScore = 4
  }
  
  const clinicalMap: Record<number, { significance: string; recommendation: string }> = {
    1: { significance: '极低可能为临床显著癌', recommendation: '继续常规随访' },
    2: { significance: '低度疑似，建议继续观察', recommendation: '12个月后复查' },
    3: { significance: '中度疑似，建议活检评估', recommendation: '考虑系统活检' },
    4: { significance: '高度疑似，建议积极活检', recommendation: '强烈建议活检' },
    5: { significance: '极高疑似，几乎可确定临床显著癌', recommendation: '必须活检' },
  }

  const entry = clinicalMap[baseScore] ?? clinicalMap[3]!

  return {
    totalScore: baseScore,
    clinicalSignificance: entry.significance,
    recommendation: entry.recommendation,
  }
}

// 计算 CAD-RADS 分级
export function calculateCADRADS(
  lmStenosis: number,
  ladProxStenosis: number,
  ladMidStenosis: number,
  lcxStenosis: number,
  rcaStenosis: number,
  modifier: string
): { category: string; description: string; recommendation: string } {
  // 找最大狭窄
  const stenoses = [lmStenosis, ladProxStenosis, ladMidStenosis, lcxStenosis, rcaStenosis]
  const maxStenosis = Math.max(...stenoses)
  
  // 左主干≥50%等同于两支病变
  const hasLeftMainDisease = lmStenosis >= 50
  const hasThreeVesselDisease = [ladProxStenosis, lcxStenosis, rcaStenosis].filter(s => s >= 70).length >= 3
  
  let category: string
  let recommendation: string
  
  if (maxStenosis === 0) {
    category = '0'
    recommendation = '无需进一步检查'
  } else if (maxStenosis <= 24) {
    category = '1'
    recommendation = '考虑危险因素管理'
  } else if (maxStenosis <= 49) {
    category = '2'
    recommendation = '考虑进一步功能评估'
  } else if (maxStenosis <= 69) {
    category = '3'
    recommendation = '建议功能评估或心脏科就诊'
  } else if (maxStenosis <= 99) {
    if (hasLeftMainDisease || hasThreeVesselDisease) {
      category = '4B'
      recommendation = '紧急心脏科就诊，评估血运重建'
    } else {
      category = '4A'
      recommendation = '强烈建议心脏科就诊评估血运重建'
    }
  } else {
    category = '5'
    recommendation = '紧急心脏科就诊'
  }
  
  const fullCategory = modifier && modifier !== '无' ? `${category}${modifier}` : category
  
  return {
    category: fullCategory,
    description: CAD_RADS_CATEGORIES.find(c => c.grade === category)?.description || '',
    recommendation,
  }
}

// 导出所有模板
export const REPORTING_STANDARDS_TEMPLATES: StructuredTemplate[] = [
  LUNG_RADS_TEMPLATE,
  PI_RADS_TEMPLATE,
  CAD_RADS_TEMPLATE,
]
