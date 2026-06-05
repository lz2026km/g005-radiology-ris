// ============================================================
// 解剖本体 - ICD-10 映射
// 覆盖常见放射学相关诊断
// ============================================================

export interface Icd10Mapping {
  code: string;
  name: string;
  pinyin: string;
  category: 'neoplasm' | 'circulatory' | 'respiratory' | 'digestive' | 'musculoskeletal' | 'genitourinary' | 'nervous' | 'injury' | 'other';
  relatedOrgans: string[];
  radsLink?: { system: string; category: string };
}

export const ICD10_MAP: Icd10Mapping[] = [
  // 肿瘤
  { code: 'C34.11', name: '右肺上叶恶性肿瘤', pinyin: 'yfsy', category: 'neoplasm', relatedOrgans: ['org-rul'], radsLink: { system: 'Lung-RADS', category: '4A-5' } },
  { code: 'C34.12', name: '右肺中叶恶性肿瘤', pinyin: 'yfzy', category: 'neoplasm', relatedOrgans: ['org-rml'] },
  { code: 'C34.13', name: '右肺下叶恶性肿瘤', pinyin: 'yfxy', category: 'neoplasm', relatedOrgans: ['org-rll'] },
  { code: 'C34.02', name: '左肺上叶恶性肿瘤', pinyin: 'zfsy', category: 'neoplasm', relatedOrgans: ['org-lul'] },
  { code: 'C34.03', name: '左肺下叶恶性肿瘤', pinyin: 'zfxy', category: 'neoplasm', relatedOrgans: ['org-lll'] },
  { code: 'C22.0',  name: '肝细胞癌',         pinyin: 'HCC', category: 'neoplasm', relatedOrgans: ['org-liver'], radsLink: { system: 'LI-RADS', category: 'LR-5' } },
  { code: 'C22.1',  name: '肝内胆管癌',       pinyin: 'gnda', category: 'neoplasm', relatedOrgans: ['org-liver'] },
  { code: 'C25.0',  name: '胰头癌',           pinyin: 'yt', category: 'neoplasm', relatedOrgans: ['org-pancreas-head'] },
  { code: 'C25.1',  name: '胰体癌',           pinyin: 'yt2',category: 'neoplasm', relatedOrgans: ['org-pancreas-body'] },
  { code: 'C25.2',  name: '胰尾癌',           pinyin: 'yw', category: 'neoplasm', relatedOrgans: ['org-pancreas-tail'] },
  { code: 'C50.9',  name: '乳腺恶性肿瘤',     pinyin: 'rx', category: 'neoplasm', relatedOrgans: ['org-breast'], radsLink: { system: 'BI-RADS', category: '5-6' } },
  { code: 'C61',    name: '前列腺恶性肿瘤',   pinyin: 'qlx',category: 'neoplasm', relatedOrgans: ['org-prostate'], radsLink: { system: 'PI-RADS', category: '4-5' } },
  { code: 'C54.1',  name: '子宫内膜癌',       pinyin: 'zgnm',category: 'neoplasm', relatedOrgans: ['org-endometrium'] },
  { code: 'C56',    name: '卵巢恶性肿瘤',     pinyin: 'lc', category: 'neoplasm', relatedOrgans: ['org-ovary'], radsLink: { system: 'O-RADS', category: '4-5' } },
  { code: 'C18.9',  name: '结肠恶性肿瘤',     pinyin: 'jc', category: 'neoplasm', relatedOrgans: ['org-ileum'] },
  { code: 'C20',    name: '直肠恶性肿瘤',     pinyin: 'zc', category: 'neoplasm', relatedOrgans: ['org-rectum'] },
  { code: 'C67.9',  name: '膀胱恶性肿瘤',     pinyin: 'pg', category: 'neoplasm', relatedOrgans: ['org-bladder'], radsLink: { system: 'VI-RADS', category: '3-5' } },
  { code: 'C64',    name: '肾恶性肿瘤',       pinyin: 'sz', category: 'neoplasm', relatedOrgans: ['org-kidney'] },
  { code: 'C71.9',  name: '脑恶性肿瘤',       pinyin: 'n',  category: 'neoplasm', relatedOrgans: ['org-brain'] },
  { code: 'C73',    name: '甲状腺恶性肿瘤',   pinyin: 'jzx',category: 'neoplasm', relatedOrgans: ['org-thyroid'], radsLink: { system: 'TI-RADS', category: 'TR4-5' } },
  { code: 'C80.1',  name: '骨继发恶性肿瘤',   pinyin: 'g',  category: 'neoplasm', relatedOrgans: [], radsLink: { system: 'Bone-RADS', category: '3-4' } },

  // 循环
  { code: 'I21.9',  name: '急性心肌梗死',     pinyin: 'jxg',category: 'circulatory', relatedOrgans: ['org-heart'] },
  { code: 'I25.10', name: '动脉粥样硬化性心脏病',pinyin:'dmzh',category:'circulatory',relatedOrgans:['org-coronary'], radsLink: { system: 'CAD-RADS', category: '3-5' } },
  { code: 'I63.9',  name: '脑梗死',           pinyin: 'ngs',category: 'circulatory', relatedOrgans: ['org-brain'] },
  { code: 'I71.0',  name: '主动脉夹层',       pinyin: 'zdmjc',category: 'circulatory', relatedOrgans: ['org-aorta'] },
  { code: 'I26.9',  name: '肺栓塞',           pinyin: 'fss',category: 'circulatory', relatedOrgans: ['org-pa'] },
  { code: 'I60.9',  name: '蛛网膜下腔出血',   pinyin: 'zwm',category: 'circulatory', relatedOrgans: ['org-brain'] },
  { code: 'I61.9',  name: '脑出血',           pinyin: 'ncx',category: 'circulatory', relatedOrgans: ['org-brain'] },

  // 呼吸
  { code: 'J18.9',  name: '肺炎',             pinyin: 'fy', category: 'respiratory', relatedOrgans: ['org-lung'] },
  { code: 'J44.9',  name: '慢性阻塞性肺疾病', pinyin: 'mzs', category: 'respiratory', relatedOrgans: ['org-lung'] },
  { code: 'J90',    name: '胸腔积液',         pinyin: 'xqjy',category: 'respiratory', relatedOrgans: ['org-pleura'] },
  { code: 'J93.9',  name: '气胸',             pinyin: 'qx', category: 'respiratory', relatedOrgans: ['org-pleura'] },

  // 消化
  { code: 'K35.80', name: '急性阑尾炎',       pinyin: 'jxlw',category: 'digestive', relatedOrgans: ['org-appendix'] },
  { code: 'K76.0',  name: '脂肪肝',           pinyin: 'zfg',category: 'digestive', relatedOrgans: ['org-liver'] },
  { code: 'K74.6',  name: '肝硬化',           pinyin: 'gyh',category: 'digestive', relatedOrgans: ['org-liver'] },
  { code: 'K80.20', name: '胆囊结石',         pinyin: 'dnjs',category: 'digestive', relatedOrgans: ['org-gallbladder'] },
  { code: 'K85.9',  name: '急性胰腺炎',       pinyin: 'jxyx',category: 'digestive', relatedOrgans: ['org-pancreas'] },
  { code: 'K92.2',  name: '上消化道出血',     pinyin: 'xhdcx',category: 'digestive', relatedOrgans: ['org-stomach'] },

  // 肌肉骨骼
  { code: 'M51.2',  name: '腰椎间盘突出',     pinyin: 'yzp',category: 'musculoskeletal', relatedOrgans: ['org-disc-l'] },
  { code: 'M50.20', name: '颈椎间盘突出',     pinyin: 'jzp',category: 'musculoskeletal', relatedOrgans: ['org-disc-c'] },
  { code: 'M16.9',  name: '髋关节骨关节炎',   pinyin: 'kg', category: 'musculoskeletal', relatedOrgans: ['org-hip'] },
  { code: 'M17.9',  name: '膝关节骨关节炎',   pinyin: 'xgg', category: 'musculoskeletal', relatedOrgans: ['org-knee'] },
  { code: 'M75.30', name: '肩袖损伤',         pinyin: 'jx', category: 'musculoskeletal', relatedOrgans: ['org-shoulder'] },
  { code: 'M23.30', name: '半月板损伤',       pinyin: 'byb',category: 'musculoskeletal', relatedOrgans: ['org-meniscus'] },
  { code: 'M48.06', name: '椎管狭窄',         pinyin: 'zgxz',category: 'musculoskeletal', relatedOrgans: ['org-cervical-spine', 'org-lumbar-spine'] },

  // 泌尿生殖
  { code: 'N20.0',  name: '肾结石',           pinyin: 'sjs',category: 'genitourinary', relatedOrgans: ['org-kidney'] },
  { code: 'N40.0',  name: '前列腺增生',       pinyin: 'qlx',category: 'genitourinary', relatedOrgans: ['org-prostate'] },
  { code: 'N83.20', name: '卵巢囊肿',         pinyin: 'lcnz',category: 'genitourinary', relatedOrgans: ['org-ovary'], radsLink: { system: 'O-RADS', category: '2-3' } },
  { code: 'N85.20', name: '子宫肌瘤',         pinyin: 'zgjl',category: 'genitourinary', relatedOrgans: ['org-uterus'] },

  // 神经
  { code: 'G45.9',  name: '短暂性脑缺血发作', pinyin: 'zdnxq',category: 'nervous', relatedOrgans: ['org-brain'] },
  { code: 'G93.1',  name: '缺氧性脑损伤',     pinyin: 'qyxn',category: 'nervous', relatedOrgans: ['org-brain'] },
  { code: 'G35',    name: '多发性硬化',       pinyin: 'dfyh',category: 'nervous', relatedOrgans: ['org-brain'] },

  // 损伤
  { code: 'S32.00', name: '腰椎骨折',         pinyin: 'yz', category: 'injury', relatedOrgans: ['org-lumbar-spine'] },
  { code: 'S12.9',  name: '颈椎骨折',         pinyin: 'jz', category: 'injury', relatedOrgans: ['org-cervical-spine'] },
  { code: 'S72.00', name: '股骨骨折',         pinyin: 'gg', category: 'injury', relatedOrgans: ['org-femur'] },
  { code: 'S42.00', name: '肱骨骨折',         pinyin: 'gg2',category: 'injury', relatedOrgans: ['org-humerus'] },
  { code: 'S06.9',  name: '颅内损伤',         pinyin: 'lnss',category: 'injury', relatedOrgans: ['org-brain'] },

  // 其他
  { code: 'R91.1',  name: '肺结节',           pinyin: 'fjj',category: 'other', relatedOrgans: ['org-lung'], radsLink: { system: 'Lung-RADS', category: '2-4X' } },
  { code: 'R93.3',  name: '消化系统影像异常', pinyin: 'xhxt',category: 'other', relatedOrgans: ['org-stomach'] },
  { code: 'R90.0',  name: '中枢神经系统影像异常',pinyin:'zksj',category:'other', relatedOrgans:['org-brain'] },
];

export const ICD10_BY_CODE: Record<string, Icd10Mapping> = ICD10_MAP.reduce((acc, m) => {
  acc[m.code] = m;
  return acc;
}, {} as Record<string, Icd10Mapping>);

export const ICD10_BY_CATEGORY: Record<string, Icd10Mapping[]> = ICD10_MAP.reduce((acc, m) => {
  if (!acc[m.category]) acc[m.category] = [];
  acc[m.category].push(m);
  return acc;
}, {} as Record<string, Icd10Mapping[]>);

export const ICD10_TOTAL = ICD10_MAP.length;
