// ============================================================
// 解剖本体 - 部位 ↔ 模态 映射
// 用于自动选择适合的检查模态
// ============================================================

export interface ModalityExamMap {
  region: string;
  bodyPart: string;
  preferredModalities: string[];
  standardProtocols: string[];
  contrast: 'required' | 'optional' | 'none';
  radiationDose: 'low' | 'medium' | 'high' | 'none';
  estimatedDurationMin: [number, number];
}

export const MODALITY_EXAM_MAP: ModalityExamMap[] = [
  // 头颈
  { region: 'head', bodyPart: '头颅', preferredModalities: ['CT', 'MR'], standardProtocols: ['CT平扫', 'CT增强', 'MR平扫', 'MR增强', 'MRA', 'CTA', 'MR-DWI'], contrast: 'optional', radiationDose: 'medium', estimatedDurationMin: [10, 30] },
  { region: 'head', bodyPart: '鼻窦', preferredModalities: ['CT'], standardProtocols: ['CT鼻窦平扫', 'CT鼻窦冠状位重建'], contrast: 'none', radiationDose: 'low', estimatedDurationMin: [5, 10] },
  { region: 'head', bodyPart: '颞骨', preferredModalities: ['CT'], standardProtocols: ['CT颞骨高分辨', '内耳 MRI'], contrast: 'none', radiationDose: 'low', estimatedDurationMin: [10, 20] },
  { region: 'head', bodyPart: '眼眶', preferredModalities: ['CT', 'MR'], standardProtocols: ['CT眼眶平扫+增强', 'MR眼眶平扫+增强'], contrast: 'optional', radiationDose: 'medium', estimatedDurationMin: [10, 25] },
  { region: 'head', bodyPart: '垂体', preferredModalities: ['MR'], standardProtocols: ['MR垂体平扫+增强', 'MR-DWI'], contrast: 'required', radiationDose: 'none', estimatedDurationMin: [20, 30] },
  { region: 'neck', bodyPart: '颈部', preferredModalities: ['CT', 'MR', 'US'], standardProtocols: ['CT颈部增强', 'MR颈部平扫+增强', '颈部血管超声', 'CTA颈部'], contrast: 'optional', radiationDose: 'medium', estimatedDurationMin: [10, 30] },
  { region: 'neck', bodyPart: '甲状腺', preferredModalities: ['US', 'MR'], standardProtocols: ['甲状腺超声', 'TI-RADS 评估', 'MR甲状腺'], contrast: 'optional', radiationDose: 'none', estimatedDurationMin: [10, 30] },

  // 胸部
  { region: 'chest', bodyPart: '胸部', preferredModalities: ['CT', 'DR'], standardProtocols: ['DR胸片正侧位', 'CT胸部平扫', 'CT胸部增强', 'CTPA', 'CT高分辨'], contrast: 'optional', radiationDose: 'high', estimatedDurationMin: [5, 30] },
  { region: 'chest', bodyPart: '肺结节筛查', preferredModalities: ['CT'], standardProtocols: ['LDCT 低剂量 CT 肺结节筛查'], contrast: 'none', radiationDose: 'low', estimatedDurationMin: [5, 10] },
  { region: 'chest', bodyPart: '心脏', preferredModalities: ['CT', 'MR', 'US'], standardProtocols: ['CT冠脉CTA', 'MR心脏', '心脏超声', '心电图'], contrast: 'required', radiationDose: 'high', estimatedDurationMin: [15, 45] },
  { region: 'chest', bodyPart: '乳腺', preferredModalities: ['MG', 'MR', 'US'], standardProtocols: ['乳腺钼靶双侧', '乳腺 MR 增强', '乳腺超声', 'BI-RADS 评估'], contrast: 'optional', radiationDose: 'low', estimatedDurationMin: [10, 30] },

  // 腹部
  { region: 'abdomen', bodyPart: '肝脏', preferredModalities: ['CT', 'MR', 'US'], standardProtocols: ['CT上腹部平扫+增强（三期）', 'MR上腹部平扫+增强', 'MRCP', '肝胆胰脾超声', 'LI-RADS 评估'], contrast: 'required', radiationDose: 'high', estimatedDurationMin: [20, 45] },
  { region: 'abdomen', bodyPart: '胆胰', preferredModalities: ['CT', 'MR', 'US'], standardProtocols: ['CT上腹部增强', 'MRCP', 'ERCP', 'EUS'], contrast: 'required', radiationDose: 'medium', estimatedDurationMin: [20, 45] },
  { region: 'abdomen', bodyPart: '脾', preferredModalities: ['CT', 'US'], standardProtocols: ['CT上腹部增强', '脾脏超声'], contrast: 'optional', radiationDose: 'medium', estimatedDurationMin: [15, 30] },
  { region: 'abdomen', bodyPart: '肾', preferredModalities: ['CT', 'MR', 'US'], standardProtocols: ['CT全腹平扫+增强', 'MR肾脏', '肾输尿管膀胱超声'], contrast: 'required', radiationDose: 'high', estimatedDurationMin: [15, 30] },
  { region: 'abdomen', bodyPart: '肾上腺', preferredModalities: ['CT', 'MR'], standardProtocols: ['CT肾上腺平扫+增强', 'MR肾上腺'], contrast: 'required', radiationDose: 'medium', estimatedDurationMin: [15, 30] },

  // 盆腔
  { region: 'pelvis', bodyPart: '盆腔', preferredModalities: ['CT', 'MR'], standardProtocols: ['CT盆腔增强', 'MR盆腔平扫+增强'], contrast: 'required', radiationDose: 'high', estimatedDurationMin: [20, 45] },
  { region: 'pelvis', bodyPart: '前列腺', preferredModalities: ['MR'], standardProtocols: ['MR前列腺多参数（mpMRI）', 'PI-RADS v2.1 评估'], contrast: 'required', radiationDose: 'none', estimatedDurationMin: [30, 45] },
  { region: 'pelvis', bodyPart: '子宫附件', preferredModalities: ['MR', 'US'], standardProtocols: ['MR子宫附件平扫+增强', 'O-RADS US 评估', '经阴道超声'], contrast: 'optional', radiationDose: 'none', estimatedDurationMin: [20, 45] },
  { region: 'pelvis', bodyPart: '膀胱', preferredModalities: ['CT', 'MR', 'US'], standardProtocols: ['CT尿路造影 CTU', 'MR膀胱（VI-RADS）', '膀胱超声'], contrast: 'required', radiationDose: 'high', estimatedDurationMin: [20, 45] },
  { region: 'pelvis', bodyPart: '直肠', preferredModalities: ['MR'], standardProtocols: ['MR直肠高分辨', 'DWI'], contrast: 'required', radiationDose: 'none', estimatedDurationMin: [30, 45] },

  // 脊柱
  { region: 'spine', bodyPart: '颈椎', preferredModalities: ['MR', 'CT', 'DR'], standardProtocols: ['MR颈椎', 'CT颈椎', 'DR颈椎正侧位'], contrast: 'optional', radiationDose: 'medium', estimatedDurationMin: [15, 30] },
  { region: 'spine', bodyPart: '胸椎', preferredModalities: ['MR', 'CT'], standardProtocols: ['MR胸椎', 'CT胸椎'], contrast: 'optional', radiationDose: 'medium', estimatedDurationMin: [15, 30] },
  { region: 'spine', bodyPart: '腰椎', preferredModalities: ['MR', 'CT', 'DR'], standardProtocols: ['MR腰椎', 'CT腰椎', 'DR腰椎正侧位'], contrast: 'optional', radiationDose: 'medium', estimatedDurationMin: [15, 30] },

  // 四肢
  { region: 'limbs', bodyPart: '肩关节', preferredModalities: ['MR', 'DR'], standardProtocols: ['MR肩关节', 'DR肩关节正位', 'CT肩关节三维重建'], contrast: 'optional', radiationDose: 'low', estimatedDurationMin: [15, 30] },
  { region: 'limbs', bodyPart: '膝关节', preferredModalities: ['MR', 'DR'], standardProtocols: ['MR膝关节', 'DR膝关节正侧位', 'CT膝关节'], contrast: 'optional', radiationDose: 'low', estimatedDurationMin: [15, 30] },
  { region: 'limbs', bodyPart: '髋关节', preferredModalities: ['MR', 'DR', 'CT'], standardProtocols: ['MR髋关节', 'DR髋关节正位', 'CT髋关节'], contrast: 'optional', radiationDose: 'low', estimatedDurationMin: [15, 30] },
  { region: 'limbs', bodyPart: '踝关节', preferredModalities: ['MR', 'DR', 'CT'], standardProtocols: ['MR踝关节', 'DR踝关节正侧位', 'CT踝关节'], contrast: 'optional', radiationDose: 'low', estimatedDurationMin: [15, 30] },
];

export const MODALITY_MAP_TOTAL = MODALITY_EXAM_MAP.length;
