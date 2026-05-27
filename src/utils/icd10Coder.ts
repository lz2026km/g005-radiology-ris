/**
 * ICD-10 编码器工具
 * G005 放射科RIS系统
 * 
 * 功能：ICD-10疾病编码查询、验证、自动补全
 * 用于放射诊断报告中的疾病编码标准化
 * 
 * @packageDocumentation
 * @version 1.0.0
 */

import { z } from 'zod';

// ========== ICD-10 类型定义 ==========

/**
 * ICD-10编码类别（章）
 */
export interface ICD10Chapter {
  /** 章编号，如 "I", "II", "III" */
  code: string;
  /** 章名称 */
  name: string;
  /** 章名称（英文） */
  nameEn: string;
  /** 编码范围 */
  codeRange: string;
  /** 包含疾病数量 */
  diseaseCount: number;
}

/**
 * ICD-10疾病分类（类目）
 */
export interface ICD10Category {
  /** 三位类目编码，如 "A00" */
  code: string;
  /** 类目名称 */
  name: string;
  /** 所属章节 */
  chapterCode: string;
  /** 子类目数量 */
  subCategoryCount: number;
}

/**
 * ICD-10疾病编码（细目）
 */
export interface ICD10Code {
  /** 完整编码，如 "A00.001" */
  code: string;
  /** 疾病名称 */
  name: string;
  /** 疾病名称（英文） */
  nameEn?: string;
  /** 所属类目 */
  categoryCode: string;
  /** 所属章节 */
  chapterCode: string;
  /** 助记码（拼音首字母） */
  mnemonic: string;
  /** 是否为常用诊断 */
  isCommon: boolean;
  /** 是否为放射科常用诊断 */
  isRadiology: boolean;
  /** 备注说明 */
  remark?: string;
}

/**
 * ICD-10搜索结果
 */
export interface ICD10SearchResult {
  /** 匹配到的编码列表 */
  codes: ICD10Code[];
  /** 总命中数 */
  total: number;
  /** 搜索耗时（毫秒） */
  searchTime: number;
  /** 搜索关键词 */
  keyword: string;
}

/**
 * ICD-10自动补全建议
 */
export interface ICD10Suggestion {
  /** 建议的编码 */
  code: string;
  /** 建议的疾病名称 */
  name: string;
  /** 匹配类型：exact=精确, prefix=前缀, fuzzy=模糊 */
  matchType: 'exact' | 'prefix' | 'fuzzy';
  /** 匹配得分（0-100） */
  score: number;
}

// ========== ICD-10 Zod 验证模式 ==========

/**
 * ICD-10编码验证模式
 * 格式要求：A00-Z99，部分可带小数点后亚目
 */
export const ICD10CodeSchema = z.string().regex(
  /^[A-Z][0-9]{2}(\.[0-9]{1,4})?$/,
  'ICD-10编码格式不正确，示例：A00.001, B20, J18.9'
);

/**
 * ICD-10编码输入（用于表单验证）
 */
export const ICD10InputSchema = z.object({
  /** ICD-10编码 */
  code: z.string().min(1, '编码不能为空'),
  /** 疾病名称 */
  name: z.string().min(1, '疾病名称不能为空'),
  /** 是否为常用诊断 */
  isCommon: z.boolean().optional().default(false),
  /** 是否为放射科常用 */
  isRadiology: z.boolean().optional().default(false),
});

export type ICD10Input = z.infer<typeof ICD10InputSchema>;

// ========== 颜色主题（蓝色 #3b82f6） ==========

/**
 * ICD-10编码器颜色配置
 * 主题色：蓝色 #3b82f6（无紫色）
 */
export const ICD10_COLORS = {
  /** 主色 - 蓝色 */
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  /** 辅助色 - 深蓝 */
  secondary: '#1e40af',
  /** 成功色 - 绿色 */
  success: '#10b981',
  /** 警告色 - 橙色 */
  warning: '#f59e0b',
  /** 错误色 - 红色 */
  error: '#ef4444',
  /** 背景色 */
  background: {
    light: '#f8fafc',
    dark: '#0f172a',
  },
  /** 文字色 */
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    light: '#ffffff',
  },
} as const;

/**
 * 获取ICD-10编码对应的显示颜色
 * @param code ICD-10编码
 * @returns 十六进制颜色值
 */
export function getICD10Color(code: string): string {
  const chapter = code.charAt(0).toUpperCase();
  const chapterColors: Record<string, string> = {
    'A': '#3b82f6', 'B': '#3b82f6',
    'C': '#8b5cf6', 'D': '#8b5cf6',
    'E': '#10b981',
    'F': '#f59e0b',
    'G': '#3b82f6',
    'H': '#06b6d4',
    'I': '#ef4444',
    'J': '#f97316',
    'K': '#84cc16',
    'L': '#a855f7',
    'M': '#ec4899',
    'N': '#14b8a6',
    'O': '#f43f5e',
    'P': '#6366f1',
    'Q': '#8b5cf6',
    'R': '#64748b',
    'S': '#f97316',
    'T': '#10b981',
    'U': '#3b82f6',
    'V': '#06b6d4',
    'W': '#ec4899',
    'X': '#3b82f6',
    'Y': '#64748b',
    'Z': '#8b5cf6',
  };
  return chapterColors[chapter] || ICD10_COLORS.primary;
}

// ========== ICD-10 数据存储 ==========

/**
 * ICD-10编码数据集（模拟数据）
 * 包含至少10个常用放射诊断编码
 */
const ICD10_DATABASE: ICD10Code[] = [
  // 肿瘤性疾病 (C00-C97)
  {
    code: 'C34.001',
    name: '右肺上叶恶性肿瘤',
    nameEn: 'Malignant neoplasm of upper lobe, right lung',
    categoryCode: 'C34',
    chapterCode: 'II',
    mnemonic: 'FLSSZXZZL',
    isCommon: true,
    isRadiology: true,
    remark: '肺癌常见类型',
  },
  {
    code: 'C34.002',
    name: '左肺下叶恶性肿瘤',
    nameEn: 'Malignant neoplasm of lower lobe, left lung',
    categoryCode: 'C34',
    chapterCode: 'II',
    mnemonic: 'FFXJYZL',
    isCommon: true,
    isRadiology: true,
    remark: '肺癌常见类型',
  },
  {
    code: 'C50.001',
    name: '右乳浸润性导管癌',
    nameEn: 'Invasive ductal carcinoma of right breast',
    categoryCode: 'C50',
    chapterCode: 'II',
    mnemonic: 'YRJRSGDJ',
    isCommon: true,
    isRadiology: true,
    remark: '乳腺癌常见类型',
  },
  {
    code: 'C62.101',
    name: '左睾丸恶性肿瘤',
    nameEn: 'Malignant neoplasm of left testis',
    categoryCode: 'C62',
    chapterCode: 'II',
    mnemonic: 'ZGZZZL',
    isCommon: false,
    isRadiology: true,
  },
  {
    code: 'C22.001',
    name: '肝细胞癌',
    nameEn: 'Hepatocellular carcinoma',
    categoryCode: 'C22',
    chapterCode: 'II',
    mnemonic: 'GXBA',
    isCommon: true,
    isRadiology: true,
    remark: '原发性肝癌',
  },
  {
    code: 'C18.501',
    name: '乙状结肠癌',
    nameEn: 'Sigmoid colon cancer',
    categoryCode: 'C18',
    chapterCode: 'II',
    mnemonic: 'YJCJ',
    isCommon: true,
    isRadiology: true,
  },
  
  // 呼吸系统疾病 (J00-J99)
  {
    code: 'J18.901',
    name: '社区获得性肺炎',
    nameEn: 'Community-acquired pneumonia',
    categoryCode: 'J18',
    chapterCode: 'X',
    mnemonic: 'SQHDXFFY',
    isCommon: true,
    isRadiology: true,
    remark: '常见肺部感染',
  },
  {
    code: 'J44.101',
    name: '慢性阻塞性肺病急性加重',
    nameEn: 'Acute exacerbation of COPD',
    categoryCode: 'J44',
    chapterCode: 'X',
    mnemonic: 'MXZSUFFJAZ',
    isCommon: true,
    isRadiology: true,
    remark: 'COPD急性发作',
  },
  {
    code: 'J84.101',
    name: '肺间质纤维化',
    nameEn: 'Pulmonary interstitial fibrosis',
    categoryCode: 'J84',
    chapterCode: 'X',
    mnemonic: 'FJZXWWH',
    isCommon: true,
    isRadiology: true,
    remark: 'CT常见表现',
  },
  {
    code: 'J93.801',
    name: '自发性气胸',
    nameEn: 'Spontaneous pneumothorax',
    categoryCode: 'J93',
    chapterCode: 'X',
    mnemonic: 'ZFXQX',
    isCommon: true,
    isRadiology: true,
  },
  {
    code: 'J45.001',
    name: '支气管哮喘',
    nameEn: 'Bronchial asthma',
    categoryCode: 'J45',
    chapterCode: 'X',
    mnemonic: 'ZQGCXX',
    isCommon: true,
    isRadiology: false,
  },
  
  // 消化系统疾病 (K00-K93)
  {
    code: 'K29.501',
    name: '慢性胃炎',
    nameEn: 'Chronic gastritis',
    categoryCode: 'K29',
    chapterCode: 'XI',
    mnemonic: 'MXWY',
    isCommon: true,
    isRadiology: false,
  },
  {
    code: 'K80.201',
    name: '胆囊结石',
    nameEn: 'Gallstones',
    categoryCode: 'K80',
    chapterCode: 'XI',
    mnemonic: 'DNJS',
    isCommon: true,
    isRadiology: true,
    remark: '超声常见诊断',
  },
  {
    code: 'K76.001',
    name: '肝硬化',
    nameEn: 'Cirrhosis of liver',
    categoryCode: 'K76',
    chapterCode: 'XI',
    mnemonic: 'GYH',
    isCommon: true,
    isRadiology: true,
  },
  
  // 循环系统疾病 (I00-I99)
  {
    code: 'I50.001',
    name: '充血性心力衰竭',
    nameEn: 'Congestive heart failure',
    categoryCode: 'I50',
    chapterCode: 'IX',
    mnemonic: 'CXXLFSJ',
    isCommon: true,
    isRadiology: true,
  },
  {
    code: 'I63.901',
    name: '脑梗死',
    nameEn: 'Cerebral infarction',
    categoryCode: 'I63',
    chapterCode: 'IX',
    mnemonic: 'NGSi',
    isCommon: true,
    isRadiology: true,
    remark: 'CT/MR常见诊断',
  },
  {
    code: 'I10.001',
    name: '原发性高血压',
    nameEn: 'Essential hypertension',
    categoryCode: 'I10',
    chapterCode: 'IX',
    mnemonic: 'YFXGXY',
    isCommon: true,
    isRadiology: false,
  },
  {
    code: 'I25.103',
    name: '冠状动脉粥样硬化性心脏病',
    nameEn: 'Coronary atherosclerotic heart disease',
    categoryCode: 'I25',
    chapterCode: 'IX',
    mnemonic: 'GZDMDZYGHXBZ',
    isCommon: true,
    isRadiology: true,
  },
  
  // 泌尿生殖系统疾病 (N00-N99)
  {
    code: 'N18.301',
    name: '慢性肾脏病5期',
    nameEn: 'Chronic kidney disease stage 5',
    categoryCode: 'N18',
    chapterCode: 'XIV',
    mnemonic: 'MSSB5Q',
    isCommon: true,
    isRadiology: true,
  },
  {
    code: 'N40.001',
    name: '前列腺增生',
    nameEn: 'Prostatic hyperplasia',
    categoryCode: 'N40',
    chapterCode: 'XIV',
    mnemonic: 'QLXZZ',
    isCommon: true,
    isRadiology: true,
  },
  
  // 损伤和中毒 (S00-T98)
  {
    code: 'S72.001',
    name: '股骨转子间骨折',
    nameEn: 'Intertrochanteric fracture of femur',
    categoryCode: 'S72',
    chapterCode: 'XIX',
    mnemonic: 'GGZJJGZ',
    isCommon: true,
    isRadiology: true,
  },
  {
    code: 'S06.201',
    name: '脑震荡',
    nameEn: 'Cerebral concussion',
    categoryCode: 'S06',
    chapterCode: 'XIX',
    mnemonic: 'NDZ',
    isCommon: true,
    isRadiology: true,
  },
  
  // 其他常见疾病
  {
    code: 'M54.501',
    name: '腰背痛',
    nameEn: 'Low back pain',
    categoryCode: 'M54',
    chapterCode: 'XIII',
    mnemonic: 'YBT',
    isCommon: true,
    isRadiology: true,
  },
  {
    code: 'E11.901',
    name: '2型糖尿病',
    nameEn: 'Type 2 diabetes mellitus',
    categoryCode: 'E11',
    chapterCode: 'IV',
    mnemonic: 'ETNB',
    isCommon: true,
    isRadiology: false,
  },
  {
    code: 'G40.901',
    name: '癫痫',
    nameEn: 'Epilepsy',
    categoryCode: 'G40',
    chapterCode: 'VI',
    mnemonic: 'DB',
    isCommon: true,
    isRadiology: true,
  },
];

/**
 * ICD-10章节信息
 */
const ICD10_CHAPTERS: ICD10Chapter[] = [
  { code: 'I', name: '传染病和寄生虫病', nameEn: 'Infectious diseases', codeRange: 'A00-B99', diseaseCount: 212 },
  { code: 'II', name: '肿瘤', nameEn: 'Neoplasms', codeRange: 'C00-D48', diseaseCount: 156 },
  { code: 'III', name: '血液及造血器官疾病', nameEn: 'Blood diseases', codeRange: 'D50-D89', diseaseCount: 87 },
  { code: 'IV', name: '内分泌、营养和代谢疾病', nameEn: 'Endocrine diseases', codeRange: 'E00-E90', diseaseCount: 112 },
  { code: 'V', name: '精神和行为障碍', nameEn: 'Mental disorders', codeRange: 'F00-F99', diseaseCount: 145 },
  { code: 'VI', name: '神经系统疾病', nameEn: 'Nervous system diseases', codeRange: 'G00-G99', diseaseCount: 134 },
  { code: 'VII', name: '眼和附器疾病', nameEn: 'Eye diseases', codeRange: 'H00-H59', diseaseCount: 176 },
  { code: 'VIII', name: '耳和乳突疾病', nameEn: 'Ear diseases', codeRange: 'H60-H95', diseaseCount: 98 },
  { code: 'IX', name: '循环系统疾病', nameEn: 'Circulatory diseases', codeRange: 'I00-I99', diseaseCount: 143 },
  { code: 'X', name: '呼吸系统疾病', nameEn: 'Respiratory diseases', codeRange: 'J00-J99', diseaseCount: 128 },
  { code: 'XI', name: '消化系统疾病', nameEn: 'Digestive diseases', codeRange: 'K00-K93', diseaseCount: 167 },
  { code: 'XII', name: '皮肤和皮下组织疾病', nameEn: 'Skin diseases', codeRange: 'L00-L99', diseaseCount: 189 },
  { code: 'XIII', name: '肌肉骨骼系统和结缔组织疾病', nameEn: 'Musculoskeletal diseases', codeRange: 'M00-M99', diseaseCount: 223 },
  { code: 'XIV', name: '泌尿生殖系统疾病', nameEn: 'Genitourinary diseases', codeRange: 'N00-N99', diseaseCount: 178 },
  { code: 'XV', name: '妊娠、分娩和产褥期', nameEn: 'Pregnancy', codeRange: 'O00-O99', diseaseCount: 198 },
  { code: 'XVI', name: '起源于围生期的疾病', nameEn: 'Perinatal diseases', codeRange: 'P00-P96', diseaseCount: 76 },
  { code: 'XVII', name: '先天异常', nameEn: 'Congenital anomalies', codeRange: 'Q00-Q99', diseaseCount: 145 },
  { code: 'XVIII', name: '症状、体征和异常临床和实验室结果', nameEn: 'Symptoms', codeRange: 'R00-R99', diseaseCount: 234 },
  { code: 'XIX', name: '损伤、中毒和外因的某些其他后果', nameEn: 'Injuries', codeRange: 'S00-T98', diseaseCount: 312 },
  { code: 'XX', name: '疾病和死亡的外因', nameEn: 'External causes', codeRange: 'V01-Y98', diseaseCount: 189 },
  { code: 'XXI', name: '影响健康状态和保健机构接触因素', nameEn: 'Health status', codeRange: 'Z00-Z99', diseaseCount: 167 },
  { code: 'XXII', name: '用于特殊目的的编码', nameEn: 'Special purposes', codeRange: 'U00-U99', diseaseCount: 45 },
];

// ========== ICD-10 辅助函数 ==========

/**
 * 计算拼音首字母匹配度
 */
function calculateMatchScore(keyword: string, code: ICD10Code): number {
  const kw = keyword.toUpperCase();
  const kwLen = kw.length;
  
  // 精确匹配编码
  if (code.code.toUpperCase().includes(kw)) {
    return 100;
  }
  
  // 精确匹配名称
  if (code.name.includes(keyword)) {
    return 90;
  }
  
  // 拼音首字母匹配
  if (code.mnemonic.toUpperCase().startsWith(kw)) {
    return 85;
  }
  
  if (code.mnemonic.toUpperCase().includes(kw)) {
    return 70;
  }
  
  // 部分匹配
  if (code.code.toUpperCase().startsWith(kw)) {
    return 75;
  }
  
  return 0;
}

/**
 * 判断是否为有效的ICD-10编码格式
 */
function isValidICD10Format(code: string): boolean {
  return /^[A-Z][0-9]{2}(\.[0-9]{1,4})?$/.test(code.toUpperCase());
}

// ========== ICD-10 导出函数 ==========

/**
 * 搜索ICD-10编码
 * @param keyword 搜索关键词（编码、名称、拼音）
 * @param options 搜索选项
 * @returns 搜索结果
 * 
 * @example
 * ```ts
 * const result = searchICD10('肺癌');
 * // 返回匹配到的肺癌相关ICD-10编码
 * 
 * const result = searchICD10('C34');
 * // 返回C34开头的编码
 * ```
 */
export function searchICD10(
  keyword: string,
  options: {
    /** 限制返回数量，默认20 */
    limit?: number;
    /** 只搜索放射科常用诊断 */
    radiologyOnly?: boolean;
    /** 只搜索常用诊断 */
    commonOnly?: boolean;
    /** 搜索章节编码 */
    chapterCode?: string;
  } = {}
): ICD10SearchResult {
  const startTime = performance.now();
  const { limit = 20, radiologyOnly = false, commonOnly = false, chapterCode } = options;
  
  if (!keyword || keyword.trim().length === 0) {
    return {
      codes: [],
      total: 0,
      searchTime: 0,
      keyword,
    };
  }
  
  const kw = keyword.trim();
  const results: ICD10Code[] = [];
  
  for (const code of ICD10_DATABASE) {
    // 应用过滤器
    if (radiologyOnly && !code.isRadiology) continue;
    if (commonOnly && !code.isCommon) continue;
    if (chapterCode && code.chapterCode !== chapterCode) continue;
    
    const score = calculateMatchScore(kw, code);
    if (score > 0) {
      results.push({ ...code, remark: score >= 70 ? code.remark : undefined } as ICD10Code);
    }
  }
  
  // 按匹配度排序
  results.sort((a, b) => {
    const scoreA = calculateMatchScore(kw, a);
    const scoreB = calculateMatchScore(kw, b);
    return scoreB - scoreA;
  });
  
  const total = results.length;
  const codes = results.slice(0, limit);
  
  return {
    codes,
    total,
    searchTime: Math.round(performance.now() - startTime),
    keyword: kw,
  };
}

/**
 * 根据编码获取ICD-10详细信息
 * @param code ICD-10编码
 * @returns 编码详细信息，如果未找到返回null
 * 
 * @example
 * ```ts
 * const info = getICD10ByCode('C34.001');
 * if (info) {
 *   console.log(info.name); // '右肺上叶恶性肿瘤'
 * }
 * ```
 */
export function getICD10ByCode(code: string): ICD10Code | null {
  if (!isValidICD10Format(code)) {
    return null;
  }
  
  const normalizedCode = code.toUpperCase();
  return ICD10_DATABASE.find(c => c.code.toUpperCase() === normalizedCode) || null;
}

/**
 * 获取ICD-10章节信息
 * @param chapterCode 章节编码（如 "II", "X"）
 * @returns 章节详细信息，如果未找到返回null
 * 
 * @example
 * ```ts
 * const chapter = getChapterInfo('II');
 * if (chapter) {
 *   console.log(chapter.name); // '肿瘤'
 * }
 * ```
 */
export function getChapterInfo(chapterCode: string): ICD10Chapter | null {
  return ICD10_CHAPTERS.find(c => c.code === chapterCode) || null;
}

/**
 * ICD-10自动补全建议
 * @param input 用户输入
 * @param options 补全选项
 * @returns 补全建议列表（最多10条）
 * 
 * @example
 * ```ts
 * const suggestions = autoSuggest('肺');
 * // 返回以"肺"开头的ICD-10编码建议
 * ```
 */
export function autoSuggest(
  input: string,
  options: {
    /** 最大返回条数，默认10 */
    maxResults?: number;
    /** 只搜索放射科常用诊断 */
    radiologyOnly?: boolean;
  } = {}
): ICD10Suggestion[] {
  const { maxResults = 10, radiologyOnly = false } = options;
  
  if (!input || input.trim().length === 0) {
    return [];
  }
  
  const kw = input.trim();
  const suggestions: ICD10Suggestion[] = [];
  
  for (const code of ICD10_DATABASE) {
    if (radiologyOnly && !code.isRadiology) continue;
    
    const score = calculateMatchScore(kw, code);
    if (score >= 50) {
      let matchType: 'exact' | 'prefix' | 'fuzzy' = 'fuzzy';
      
      if (code.code.toUpperCase() === kw.toUpperCase() || code.name === kw) {
        matchType = 'exact';
      } else if (
        code.code.toUpperCase().startsWith(kw.toUpperCase()) ||
        code.mnemonic.toUpperCase().startsWith(kw.toUpperCase())
      ) {
        matchType = 'prefix';
      }
      
      suggestions.push({
        code: code.code,
        name: code.name,
        matchType,
        score,
      });
    }
  }
  
  // 按得分排序
  suggestions.sort((a, b) => b.score - a.score);
  
  return suggestions.slice(0, maxResults);
}

/**
 * 验证ICD-10编码
 * @param code 待验证的编码
 * @returns 验证结果
 * 
 * @example
 * ```ts
 * const result = validateICD10('C34.001');
 * if (result.valid) {
 *   console.log('编码有效');
 * } else {
 *   console.log('错误:', result.error);
 * }
 * ```
 */
export function validateICD10(code: string): {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息，如果有效则为undefined */
  error?: string;
  /** 编码信息，如果有效则包含 */
  data?: ICD10Code;
} {
  if (!code || code.trim().length === 0) {
    return {
      valid: false,
      error: '编码不能为空',
    };
  }
  
  const trimmedCode = code.trim().toUpperCase();
  
  // 格式验证
  if (!isValidICD10Format(trimmedCode)) {
    return {
      valid: false,
      error: `编码格式不正确，应为字母+2位数字，可选小数点后1-4位，如：A00.001`,
    };
  }
  
  // 存在性验证
  const icd10Info = ICD10_DATABASE.find(c => c.code.toUpperCase() === trimmedCode);
  
  if (!icd10Info) {
    return {
      valid: false,
      error: `编码 ${trimmedCode} 不存在于ICD-10数据库中`,
    };
  }
  
  return {
    valid: true,
    data: icd10Info,
  };
}

/**
 * 获取放射科常用ICD-10编码
 * @returns 放射科常用诊断列表
 * 
 * @example
 * ```ts
 * const commonCodes = getRadiologyCommonCodes();
 * commonCodes.forEach(code => {
 *   console.log(`${code.code} - ${code.name}`);
 * });
 * ```
 */
export function getRadiologyCommonCodes(): ICD10Code[] {
  return ICD10_DATABASE.filter(c => c.isRadiology && c.isCommon);
}

/**
 * 根据章节获取ICD-10编码
 * @param chapterCode 章节编码
 * @returns 该章节下的所有编码
 */
export function getCodesByChapter(chapterCode: string): ICD10Code[] {
  return ICD10_DATABASE.filter(c => c.chapterCode === chapterCode);
}

/**
 * 导出ICD-10数据库（用于调试）
 * @returns 完整的ICD-10编码数据库
 */
export function getICD10Database(): readonly ICD10Code[] {
  return ICD10_DATABASE;
}

/**
 * 导出ICD-10章节列表
 * @returns 完整的ICD-10章节列表
 */
export function getICD10Chapters(): readonly ICD10Chapter[] {
  return ICD10_CHAPTERS;
}