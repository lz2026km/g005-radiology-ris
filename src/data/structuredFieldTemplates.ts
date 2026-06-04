// ============================================================
// G005 放射科RIS系统 v1.0.1 - 结构化字段模板
// Phase R1：CT/MR/DR/乳腺钼靶/超声 5 大类报告模板字段集
// ============================================================

import type { StructuredField } from '../types';

export interface TemplateFieldDefinition {
  id: string;                    // 字段 ID
  fieldKey: string;              // 字段 key
  fieldLabel: string;            // 显示标签
  fieldGroup: string;            // 字段分组
  dataType: StructuredField['dataType'];
  unit?: string;
  required: boolean;
  defaultValue?: string | number;
  options?: { label: string; value: string; color?: string }[];
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  dependsOn?: string;            // 依赖其他字段 key
  formula?: (values: Record<string, any>) => string | number; // 联动计算
  order: number;
  category?: string;             // 关联到分类（BI-RADS/Lung-RADS etc.）
}

export interface StructuredFieldTemplate {
  id: string;
  name: string;
  modality: string;
  bodyPart: string;
  description: string;
  version: string;
  fields: TemplateFieldDefinition[];
}

// ============================================================
// 模板 1：胸部 CT 平扫+增强
// ============================================================
export const ChestCTTemplate: StructuredFieldTemplate = {
  id: 'tpl-chest-ct-001',
  name: '胸部CT平扫+增强',
  modality: 'CT',
  bodyPart: '胸部',
  description: '胸部CT平扫+增强标准结构化字段',
  version: 'v1.0',
  fields: [
    // 肺窗所见
    { id: 'f-001', fieldKey: 'lung_r_l', fieldLabel: '右肺', fieldGroup: '肺窗所见', dataType: 'text', required: true, order: 1, placeholder: '右肺野透亮度，纹理' },
    { id: 'f-002', fieldKey: 'lung_l', fieldLabel: '左肺', fieldGroup: '肺窗所见', dataType: 'text', required: true, order: 2, placeholder: '左肺野透亮度，纹理' },
    { id: 'f-003', fieldKey: 'trachea', fieldLabel: '气管', fieldGroup: '肺窗所见', dataType: 'text', required: false, order: 3, placeholder: '气管居中/偏移' },
    { id: 'f-004', fieldKey: 'bronchi', fieldLabel: '支气管', fieldGroup: '肺窗所见', dataType: 'text', required: false, order: 4, placeholder: '支气管通畅/狭窄' },
    { id: 'f-005', fieldKey: 'pleural_effusion', fieldLabel: '胸腔积液', fieldGroup: '肺窗所见', dataType: 'enum', required: false, order: 5, options: [
      { label: '无', value: 'none' },
      { label: '左侧少量', value: 'left-minor', color: '#f59e0b' },
      { label: '右侧少量', value: 'right-minor', color: '#f59e0b' },
      { label: '双侧少量', value: 'bilateral-minor', color: '#f59e0b' },
      { label: '左侧大量', value: 'left-major', color: '#dc2626' },
      { label: '右侧大量', value: 'right-major', color: '#dc2626' },
      { label: '双侧大量', value: 'bilateral-major', color: '#dc2626' },
    ] },
    // 纵隔窗
    { id: 'f-010', fieldKey: 'mediastinum', fieldLabel: '纵隔', fieldGroup: '纵隔窗', dataType: 'text', required: false, order: 6, placeholder: '纵隔形态' },
    { id: 'f-011', fieldKey: 'lymph_nodes', fieldLabel: '淋巴结', fieldGroup: '纵隔窗', dataType: 'enum', required: false, order: 7, options: [
      { label: '未见肿大', value: 'normal' },
      { label: '轻度肿大', value: 'mild', color: '#f59e0b' },
      { label: '明显肿大', value: 'major', color: '#dc2626' },
    ] },
    { id: 'f-012', fieldKey: 'heart_size', fieldLabel: '心脏', fieldGroup: '纵隔窗', dataType: 'text', required: false, order: 8, placeholder: '心影大小' },
    { id: 'f-013', fieldKey: 'pericardial_effusion', fieldLabel: '心包积液', fieldGroup: '纵隔窗', dataType: 'enum', required: false, order: 9, options: [
      { label: '无', value: 'none' },
      { label: '少量', value: 'minor', color: '#f59e0b' },
      { label: '中量', value: 'moderate', color: '#dc2626' },
      { label: '大量', value: 'major', color: '#dc2626' },
    ] },
    // 病灶
    { id: 'f-020', fieldKey: 'has_lesion', fieldLabel: '是否发现病灶', fieldGroup: '病灶', dataType: 'boolean', required: true, order: 10, defaultValue: '' },
    { id: 'f-021', fieldKey: 'lesion_count', fieldLabel: '病灶数量', fieldGroup: '病灶', dataType: 'number', required: false, order: 11, validation: { min: 0, max: 100 } },
    { id: 'f-022', fieldKey: 'lesion_size_max', fieldLabel: '最大病灶尺寸 (mm)', fieldGroup: '病灶', dataType: 'number', required: false, order: 12, unit: 'mm', validation: { min: 0, max: 500 } },
    { id: 'f-023', fieldKey: 'lesion_density', fieldLabel: '病灶密度', fieldGroup: '病灶', dataType: 'enum', required: false, order: 13, options: [
      { label: '实性', value: 'solid', color: '#7c3aed' },
      { label: '部分实性', value: 'part-solid', color: '#a855f7' },
      { label: '磨玻璃', value: 'ground-glass', color: '#c084fc' },
    ], dependsOn: 'has_lesion' },
    // Lung-RADS
    { id: 'f-030', fieldKey: 'lung_rads', fieldLabel: 'Lung-RADS 分级', fieldGroup: 'Lung-RADS', dataType: 'enum', required: false, order: 14, options: [
      { label: '1 类（阴性）', value: '1', color: '#10b981' },
      { label: '2 类（良性）', value: '2', color: '#10b981' },
      { label: '3 类（可能良性）', value: '3', color: '#f59e0b' },
      { label: '4A 类（可疑）', value: '4A', color: '#f97316' },
      { label: '4B 类（高度可疑）', value: '4B', color: '#dc2626' },
      { label: '4X 类（高危）', value: '4X', color: '#dc2626' },
    ], category: 'Lung-RADS', dependsOn: 'has_lesion' },
    { id: 'f-031', fieldKey: 'lung_rads_modifier', fieldLabel: 'Lung-RADS 修饰符', fieldGroup: 'Lung-RADS', dataType: 'multi-enum', required: false, order: 15, options: [
      { label: 'S - 显著/可疑', value: 'S' },
      { label: 'R - 既往肺癌', value: 'R' },
      { label: 'C - 临床关注', value: 'C' },
      { label: 'P - 既往 PET', value: 'P' },
    ], category: 'Lung-RADS', dependsOn: 'has_lesion' },
  ],
};

// ============================================================
// 模板 2：头颅 CT 平扫
// ============================================================
export const HeadCTTemplate: StructuredFieldTemplate = {
  id: 'tpl-head-ct-001',
  name: '头颅CT平扫',
  modality: 'CT',
  bodyPart: '头颅',
  description: '头颅CT平扫结构化字段',
  version: 'v1.0',
  fields: [
    { id: 'h-001', fieldKey: 'brain_parenchyma', fieldLabel: '脑实质', fieldGroup: '颅内', dataType: 'text', required: true, order: 1, placeholder: '灰白质分界/密度' },
    { id: 'h-002', fieldKey: 'ventricle', fieldLabel: '脑室系统', fieldGroup: '颅内', dataType: 'enum', required: false, order: 2, options: [
      { label: '正常', value: 'normal' },
      { label: '扩大', value: 'enlarged', color: '#f59e0b' },
      { label: '受压变窄', value: 'compressed', color: '#dc2626' },
      { label: '移位', value: 'shifted', color: '#dc2626' },
    ] },
    { id: 'h-003', fieldKey: 'midline', fieldLabel: '中线结构', fieldGroup: '颅内', dataType: 'enum', required: true, order: 3, defaultValue: 'center', options: [
      { label: '居中', value: 'center' },
      { label: '偏移', value: 'shift', color: '#dc2626' },
    ] },
    { id: 'h-004', fieldKey: 'cisterns', fieldLabel: '脑池', fieldGroup: '颅内', dataType: 'text', required: false, order: 4, placeholder: '脑池显示情况' },
    { id: 'h-005', fieldKey: 'hemorrhage', fieldLabel: '颅内出血', fieldGroup: '异常', dataType: 'enum', required: false, order: 5, options: [
      { label: '无', value: 'none' },
      { label: '硬膜外血肿', value: 'epidural', color: '#dc2626' },
      { label: '硬膜下血肿', value: 'subdural', color: '#dc2626' },
      { label: '蛛网膜下腔出血', value: 'sah', color: '#dc2626' },
      { label: '脑内血肿', value: 'intracerebral', color: '#dc2626' },
    ] },
    { id: 'h-006', fieldKey: 'infarction', fieldLabel: '脑梗死', fieldGroup: '异常', dataType: 'enum', required: false, order: 6, options: [
      { label: '无', value: 'none' },
      { label: '缺血性', value: 'ischemic', color: '#dc2626' },
      { label: '出血性', value: 'hemorrhagic', color: '#dc2626' },
      { label: '腔隙性', value: 'lacunar', color: '#f59e0b' },
    ] },
    { id: 'h-007', fieldKey: 'mass', fieldLabel: '占位', fieldGroup: '异常', dataType: 'enum', required: false, order: 7, options: [
      { label: '无', value: 'none' },
      { label: '有', value: 'present', color: '#dc2626' },
    ] },
    { id: 'h-008', fieldKey: 'fracture', fieldLabel: '颅骨骨折', fieldGroup: '颅骨', dataType: 'enum', required: false, order: 8, options: [
      { label: '无', value: 'none' },
      { label: '线性骨折', value: 'linear', color: '#f59e0b' },
      { label: '凹陷性骨折', value: 'depressed', color: '#dc2626' },
      { label: '粉碎性骨折', value: 'comminuted', color: '#dc2626' },
    ] },
  ],
};

// ============================================================
// 模板 3：乳腺钼靶
// ============================================================
export const MammographyTemplate: StructuredFieldTemplate = {
  id: 'tpl-mg-001',
  name: '乳腺钼靶',
  modality: '乳腺钼靶',
  bodyPart: '胸部',
  description: '乳腺钼靶 BI-RADS 结构化字段',
  version: 'v1.0',
  fields: [
    { id: 'm-001', fieldKey: 'breast_density', fieldLabel: '腺体密度', fieldGroup: '腺体', dataType: 'enum', required: true, order: 1, options: [
      { label: 'A - 脂肪型', value: 'A', color: '#10b981' },
      { label: 'B - 散在纤维腺体型', value: 'B', color: '#84cc16' },
      { label: 'C - 不均匀致密型', value: 'C', color: '#f59e0b' },
      { label: 'D - 极度致密型', value: 'D', color: '#dc2626' },
    ] },
    { id: 'm-002', fieldKey: 'mass_r', fieldLabel: '右乳肿块', fieldGroup: '肿块', dataType: 'enum', required: false, order: 2, options: [
      { label: '无', value: 'none' },
      { label: '有', value: 'present', color: '#dc2626' },
    ] },
    { id: 'm-003', fieldKey: 'mass_r_size', fieldLabel: '右乳肿块尺寸 (mm)', fieldGroup: '肿块', dataType: 'number', required: false, order: 3, unit: 'mm', validation: { min: 0, max: 200 }, dependsOn: 'mass_r' },
    { id: 'm-004', fieldKey: 'mass_r_shape', fieldLabel: '右乳肿块形态', fieldGroup: '肿块', dataType: 'enum', required: false, order: 4, options: [
      { label: '圆形', value: 'round' },
      { label: '卵圆形', value: 'oval' },
      { label: '不规则形', value: 'irregular', color: '#dc2626' },
    ], dependsOn: 'mass_r' },
    { id: 'm-005', fieldKey: 'mass_r_margin', fieldLabel: '右乳肿块边缘', fieldGroup: '肿块', dataType: 'enum', required: false, order: 5, options: [
      { label: '清晰', value: 'circumscribed' },
      { label: '遮蔽', value: 'obscured' },
      { label: '微小分叶', value: 'microlobulated' },
      { label: '模糊', value: 'indistinct' },
      { label: '毛刺', value: 'spiculated', color: '#dc2626' },
    ], dependsOn: 'mass_r' },
    { id: 'm-010', fieldKey: 'calcification_r', fieldLabel: '右乳钙化', fieldGroup: '钙化', dataType: 'enum', required: false, order: 6, options: [
      { label: '无', value: 'none' },
      { label: '典型良性', value: 'benign' },
      { label: '可疑', value: 'suspicious', color: '#dc2626' },
    ] },
    { id: 'm-011', fieldKey: 'calc_r_type', fieldLabel: '右乳钙化类型', fieldGroup: '钙化', dataType: 'enum', required: false, order: 7, options: [
      { label: '无定形', value: 'amorphous', color: '#f59e0b' },
      { label: '粗糙不均质', value: 'coarse-heterogeneous', color: '#f59e0b' },
      { label: '细小多形性', value: 'fine-pleomorphic', color: '#dc2626' },
      { label: '细线/分支状', value: 'fine-linear-branching', color: '#dc2626' },
    ], dependsOn: 'calcification_r' },
    // BI-RADS 分级
    { id: 'm-020', fieldKey: 'bi_rads', fieldLabel: 'BI-RADS 分级', fieldGroup: 'BI-RADS', dataType: 'enum', required: true, order: 8, options: [
      { label: '0 类 - 评估不完整', value: '0', color: '#94a3b8' },
      { label: '1 类 - 阴性', value: '1', color: '#10b981' },
      { label: '2 类 - 良性', value: '2', color: '#10b981' },
      { label: '3 类 - 可能良性', value: '3', color: '#f59e0b' },
      { label: '4A 类 - 低度可疑', value: '4A', color: '#f97316' },
      { label: '4B 类 - 中度可疑', value: '4B', color: '#ea580c' },
      { label: '4C 类 - 高度可疑', value: '4C', color: '#dc2626' },
      { label: '5 类 - 高度提示恶性', value: '5', color: '#b91c1c' },
      { label: '6 类 - 已证实恶性', value: '6', color: '#7f1d1d' },
    ], category: 'BI-RADS' },
    { id: 'm-021', fieldKey: 'bi_rads_recommend', fieldLabel: 'BI-RADS 建议', fieldGroup: 'BI-RADS', dataType: 'text', required: false, order: 9, placeholder: '如：建议6个月后复查' },
  ],
};

// ============================================================
// 模板 4：腹部 CT 平扫+增强
// ============================================================
export const AbdomenCTTemplate: StructuredFieldTemplate = {
  id: 'tpl-abd-ct-001',
  name: '腹部CT平扫+增强',
  modality: 'CT',
  bodyPart: '腹部',
  description: '腹部CT结构化字段',
  version: 'v1.0',
  fields: [
    { id: 'a-001', fieldKey: 'liver', fieldLabel: '肝脏', fieldGroup: '实质器官', dataType: 'text', required: true, order: 1, placeholder: '肝脏大小、密度' },
    { id: 'a-002', fieldKey: 'liver_lesion', fieldLabel: '肝脏占位', fieldGroup: '实质器官', dataType: 'enum', required: false, order: 2, options: [
      { label: '无', value: 'none' },
      { label: '有', value: 'present', color: '#dc2626' },
    ] },
    { id: 'a-003', fieldKey: 'gallbladder', fieldLabel: '胆囊', fieldGroup: '实质器官', dataType: 'text', required: false, order: 3, placeholder: '胆囊壁/结石' },
    { id: 'a-004', fieldKey: 'pancreas', fieldLabel: '胰腺', fieldGroup: '实质器官', dataType: 'text', required: false, order: 4, placeholder: '胰腺大小、密度' },
    { id: 'a-005', fieldKey: 'spleen', fieldLabel: '脾脏', fieldGroup: '实质器官', dataType: 'text', required: false, order: 5, placeholder: '脾脏大小' },
    { id: 'a-006', fieldKey: 'kidney_l', fieldLabel: '左肾', fieldGroup: '实质器官', dataType: 'text', required: false, order: 6, placeholder: '左肾大小/积水/结石' },
    { id: 'a-007', fieldKey: 'kidney_r', fieldLabel: '右肾', fieldGroup: '实质器官', dataType: 'text', required: false, order: 7, placeholder: '右肾大小/积水/结石' },
    { id: 'a-010', fieldKey: 'ascites', fieldLabel: '腹水', fieldGroup: '腹腔', dataType: 'enum', required: false, order: 8, options: [
      { label: '无', value: 'none' },
      { label: '少量', value: 'minor', color: '#f59e0b' },
      { label: '中量', value: 'moderate', color: '#dc2626' },
      { label: '大量', value: 'major', color: '#dc2626' },
    ] },
    { id: 'a-011', fieldKey: 'lymphadenopathy', fieldLabel: '腹腔淋巴结', fieldGroup: '腹腔', dataType: 'enum', required: false, order: 9, options: [
      { label: '无肿大', value: 'none' },
      { label: '肿大', value: 'enlarged', color: '#dc2626' },
    ] },
  ],
};

// ============================================================
// 模板 5：冠脉 CTA
// ============================================================
export const CoronaryCTATemplate: StructuredFieldTemplate = {
  id: 'tpl-coronary-cta-001',
  name: '冠脉CTA',
  modality: 'CT',
  bodyPart: '心脏',
  description: '冠状动脉CTA CAD-RADS 结构化字段',
  version: 'v1.0',
  fields: [
    { id: 'c-001', fieldKey: 'lm', fieldLabel: '左主干 (LM)', fieldGroup: '冠脉', dataType: 'enum', required: true, order: 1, options: [
      { label: '无狭窄', value: 'normal' },
      { label: '< 25%', value: 'min', color: '#10b981' },
      { label: '25-49%', value: 'mild', color: '#84cc16' },
      { label: '50-69%', value: 'moderate', color: '#f59e0b' },
      { label: '70-99%', value: 'severe', color: '#dc2626' },
      { label: '完全闭塞', value: 'occlusion', color: '#7f1d1d' },
    ], category: 'CAD-RADS' },
    { id: 'c-002', fieldKey: 'lad', fieldLabel: '前降支 (LAD)', fieldGroup: '冠脉', dataType: 'enum', required: true, order: 2, options: [
      { label: '无狭窄', value: 'normal' },
      { label: '< 25%', value: 'min', color: '#10b981' },
      { label: '25-49%', value: 'mild', color: '#84cc16' },
      { label: '50-69%', value: 'moderate', color: '#f59e0b' },
      { label: '70-99%', value: 'severe', color: '#dc2626' },
      { label: '完全闭塞', value: 'occlusion', color: '#7f1d1d' },
    ], category: 'CAD-RADS' },
    { id: 'c-003', fieldKey: 'lcx', fieldLabel: '回旋支 (LCX)', fieldGroup: '冠脉', dataType: 'enum', required: true, order: 3, options: [
      { label: '无狭窄', value: 'normal' },
      { label: '< 25%', value: 'min', color: '#10b981' },
      { label: '25-49%', value: 'mild', color: '#84cc16' },
      { label: '50-69%', value: 'moderate', color: '#f59e0b' },
      { label: '70-99%', value: 'severe', color: '#dc2626' },
      { label: '完全闭塞', value: 'occlusion', color: '#7f1d1d' },
    ], category: 'CAD-RADS' },
    { id: 'c-004', fieldKey: 'rca', fieldLabel: '右冠状动脉 (RCA)', fieldGroup: '冠脉', dataType: 'enum', required: true, order: 4, options: [
      { label: '无狭窄', value: 'normal' },
      { label: '< 25%', value: 'min', color: '#10b981' },
      { label: '25-49%', value: 'mild', color: '#84cc16' },
      { label: '50-69%', value: 'moderate', color: '#f59e0b' },
      { label: '70-99%', value: 'severe', color: '#dc2626' },
      { label: '完全闭塞', value: 'occlusion', color: '#7f1d1d' },
    ], category: 'CAD-RADS' },
    { id: 'c-010', fieldKey: 'plaque_type', fieldLabel: '斑块类型', fieldGroup: '斑块', dataType: 'multi-enum', required: false, order: 5, options: [
      { label: '钙化斑块', value: 'calcified' },
      { label: '非钙化斑块', value: 'non-calcified' },
      { label: '混合斑块', value: 'mixed' },
    ] },
    { id: 'c-020', fieldKey: 'cad_rads', fieldLabel: 'CAD-RADS 分级', fieldGroup: 'CAD-RADS', dataType: 'enum', required: true, order: 6, options: [
      { label: '0 类 - 不完整评估', value: '0', color: '#94a3b8' },
      { label: '1 类 - 正常', value: '1', color: '#10b981' },
      { label: '2 类 - 轻度斑块', value: '2', color: '#10b981' },
      { label: '3 类 - 中度狭窄', value: '3', color: '#f59e0b' },
      { label: '4A 类 - 重度狭窄', value: '4A', color: '#dc2626' },
      { label: '4B 类 - 重度狭窄', value: '4B', color: '#dc2626' },
      { label: '5 类 - 完全闭塞', value: '5', color: '#7f1d1d' },
    ], category: 'CAD-RADS' },
    { id: 'c-021', fieldKey: 'recommend', fieldLabel: '建议', fieldGroup: 'CAD-RADS', dataType: 'enum', required: false, order: 7, options: [
      { label: '随访', value: 'follow-up' },
      { label: '进一步检查', value: 'further-exam' },
      { label: '冠脉造影', value: 'invasive-angio' },
      { label: 'PCI', value: 'pci' },
    ] },
  ],
};

// ============================================================
// 模板 6：甲状腺超声
// ============================================================
export const ThyroidUSTemplate: StructuredFieldTemplate = {
  id: 'tpl-thyroid-us-001',
  name: '甲状腺超声',
  modality: 'US',
  bodyPart: '颈部',
  description: '甲状腺超声 TI-RADS 结构化字段',
  version: 'v1.0',
  fields: [
    { id: 't-001', fieldKey: 'thyroid_size_l', fieldLabel: '左叶大小', fieldGroup: '甲状腺', dataType: 'text', required: false, order: 1, placeholder: '如：45mm×15mm×12mm' },
    { id: 't-002', fieldKey: 'thyroid_size_r', fieldLabel: '右叶大小', fieldGroup: '甲状腺', dataType: 'text', required: false, order: 2, placeholder: '如：42mm×14mm×11mm' },
    { id: 't-003', fieldKey: 'thyroid_echogenicity', fieldLabel: '回声', fieldGroup: '甲状腺', dataType: 'enum', required: false, order: 3, options: [
      { label: '均匀', value: 'homogeneous' },
      { label: '欠均匀', value: 'inhomogeneous' },
    ] },
    { id: 't-010', fieldKey: 'nodule_l', fieldLabel: '左叶结节', fieldGroup: '结节', dataType: 'enum', required: false, order: 4, options: [
      { label: '无', value: 'none' },
      { label: '有', value: 'present', color: '#f59e0b' },
    ] },
    { id: 't-011', fieldKey: 'nodule_l_size', fieldLabel: '左叶结节尺寸 (mm)', fieldGroup: '结节', dataType: 'number', required: false, order: 5, unit: 'mm', validation: { min: 0, max: 100 } },
    { id: 't-012', fieldKey: 'nodule_l_echogenicity', fieldLabel: '左叶结节回声', fieldGroup: '结节', dataType: 'enum', required: false, order: 6, options: [
      { label: '高回声', value: 'hyperechoic' },
      { label: '等回声', value: 'isoechoic' },
      { label: '低回声', value: 'hypoechoic' },
      { label: '极低回声', value: 'very-hypoechoic', color: '#dc2626' },
    ] },
    { id: 't-020', fieldKey: 'ti_rads', fieldLabel: 'TI-RADS 分级', fieldGroup: 'TI-RADS', dataType: 'enum', required: true, order: 7, options: [
      { label: '1 类 - 正常', value: '1', color: '#10b981' },
      { label: '2 类 - 良性', value: '2', color: '#10b981' },
      { label: '3 类 - 可能良性', value: '3', color: '#f59e0b' },
      { label: '4A 类 - 低度可疑', value: '4A', color: '#f97316' },
      { label: '4B 类 - 中度可疑', value: '4B', color: '#ea580c' },
      { label: '4C 类 - 高度可疑', value: '4C', color: '#dc2626' },
      { label: '5 类 - 高度提示恶性', value: '5', color: '#b91c1c' },
      { label: '6 类 - 已证实恶性', value: '6', color: '#7f1d1d' },
    ], category: 'TI-RADS' },
  ],
};

// ============================================================
// 所有模板集合
// ============================================================
export const STRUCTURED_FIELD_TEMPLATES: StructuredFieldTemplate[] = [
  ChestCTTemplate,
  HeadCTTemplate,
  MammographyTemplate,
  AbdomenCTTemplate,
  CoronaryCTATemplate,
  ThyroidUSTemplate,
];

// 按 modality + bodyPart 查找模板
export function findTemplate(modality: string, bodyPart: string): StructuredFieldTemplate | undefined {
  return STRUCTURED_FIELD_TEMPLATES.find(
    t => t.modality === modality && t.bodyPart === bodyPart,
  );
}

// 按 ID 查找
export function getTemplateById(id: string): StructuredFieldTemplate | undefined {
  return STRUCTURED_FIELD_TEMPLATES.find(t => t.id === id);
}

// 默认导出
export default {
  STRUCTURED_FIELD_TEMPLATES,
  findTemplate,
  getTemplateById,
  ChestCTTemplate,
  HeadCTTemplate,
  MammographyTemplate,
  AbdomenCTTemplate,
  CoronaryCTATemplate,
  ThyroidUSTemplate,
};
