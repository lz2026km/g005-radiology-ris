// ============================================================
// 解剖本体 - 解剖标志（landmarks）
// 用于影像定位和参考
// ============================================================

export interface Landmark {
  id: string;
  name: string;
  english: string;
  pinyin: string;
  region: string;
  organId?: string;
  description: string;
  clinicalUse: string;
}

export const LANDMARKS: Landmark[] = [
  // 胸部
  { id: 'lm-carina',       name: '隆突',           english: 'Carina',                 pinyin: 'lt',  region: 'chest', organId: 'org-trachea',     description: '气管分叉为左/右主支气管处', clinicalUse: 'CT 定位 / 支气管镜标志' },
  { id: 'lm-azv',          name: '奇静脉弓',       english: 'Azygos Arch',            pinyin: 'qjmh',region: 'chest', organId: 'org-mediastinum', description: '奇静脉汇入上腔静脉处', clinicalUse: '纵隔解剖标志' },
  { id: 'lm-aortic-knob',  name: '主动脉弓',       english: 'Aortic Arch',            pinyin: 'zdmh',region: 'chest', organId: 'org-aorta',       description: '主动脉弓', clinicalUse: '纵隔窗评估' },
  { id: 'lm-cp-angle',     name: '肋膈角',         english: 'Costophrenic Angle',     pinyin: 'ldj', region: 'chest',                          description: '肋骨与膈肌夹角', clinicalUse: '胸腔积液定位' },
  { id: 'lm-card-phrenic', name: '心膈角',         english: 'Cardiophrenic Angle',    pinyin: 'xdj', region: 'chest',                          description: '心脏与膈肌夹角', clinicalUse: '心包/纵隔评估' },
  // 腹部
  { id: 'lm-papilla',      name: '法特壶腹',       english: 'Ampulla of Vater',       pinyin: 'fthf',region: 'abdomen', organId: 'org-duodenum',  description: '胆胰管汇合开口', clinicalUse: 'ERCP / MRCP 标志' },
  { id: 'lm-porta-hepatis',name: '肝门',           english: 'Porta Hepatis',         pinyin: 'gm',  region: 'abdomen', organId: 'org-liver',     description: '门静脉、肝动脉、胆总管出入处', clinicalUse: '肝门部肿瘤评估' },
  { id: 'lm-renal-hilum',  name: '肾门',           english: 'Renal Hilum',           pinyin: 'sm',  region: 'abdomen', organId: 'org-kidney',    description: '肾血管、输尿管出入处', clinicalUse: '肾脏解剖标志' },
  { id: 'sm-ivc',          name: '下腔静脉',       english: 'Inferior Vena Cava',    pinyin: 'xqjm',region: 'abdomen', organId: 'org-kidney',    description: '下腔静脉', clinicalUse: '血管评估' },
  { id: 'sm-portal-vein',  name: '门静脉',         english: 'Portal Vein',           pinyin: 'mxm', region: 'abdomen', organId: 'org-liver',     description: '门静脉主干', clinicalUse: '肝脏血供评估' },
  // 盆腔
  { id: 'lm-douglas',      name: '直肠子宫陷凹',   english: 'Pouch of Douglas',      pinyin: 'zczx',region: 'pelvis',                          description: '女性 Douglas 陷凹', clinicalUse: '盆腔积液定位' },
  { id: 'lm-bladder-neck', name: '膀胱颈',         english: 'Bladder Neck',          pinyin: 'pgj', region: 'pelvis', organId: 'org-bladder',   description: '膀胱与尿道连接处', clinicalUse: '前列腺/膀胱评估' },
  { id: 'lm-adenomyosis',  name: '结合带',         english: 'Junctional Zone',      pinyin: 'jhd', region: 'pelvis', organId: 'org-uterus',    description: '子宫内膜与肌层过渡区', clinicalUse: '子宫 MR 评估' },
];

export const LANDMARKS_TOTAL = LANDMARKS.length;
