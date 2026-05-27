/**
 * 报告模板管理 - I7: 结构化报告模板支持中英双语对照输出
 * G005 Radiology RIS System
 */

export interface ReportTemplateField {
  key: string;
  labelKey: string;       // i18n key for bilingual label
  type: 'text' | 'textarea' | 'select' | 'number' | 'date';
  required?: boolean;
  options?: Array<{ value: string; labelKey: string }>;
  defaultValue?: string;
}

export interface ReportTemplate {
  id: string;
  nameKey: string;        // i18n key for template name
  descriptionKey: string;  // i18n key for description
  modality: string;        // modality code
  fields: ReportTemplateField[];
  structure: 'free' | 'structured';
}

// 报告模板库
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'ct_brain',
    nameKey: 'template.ctBrain.name',
    descriptionKey: 'template.ctBrain.desc',
    modality: 'CT',
    structure: 'structured',
    fields: [
      { key: 'findings', labelKey: 'template.field.findings', type: 'textarea', required: true },
      { key: 'impression', labelKey: 'template.field.impression', type: 'textarea', required: true },
      { key: 'technique', labelKey: 'template.field.technique', type: 'text' },
      { key: 'contrast', labelKey: 'template.field.contrast', type: 'select', options: [
        { value: 'none', labelKey: 'template.contrast.none' },
        { value: 'plain', labelKey: 'template.contrast.plain' },
        { value: 'enhanced', labelKey: 'template.contrast.enhanced' },
      ]},
    ],
  },
  {
    id: 'ct_chest',
    nameKey: 'template.ctChest.name',
    descriptionKey: 'template.ctChest.desc',
    modality: 'CT',
    structure: 'structured',
    fields: [
      { key: 'findings', labelKey: 'template.field.findings', type: 'textarea', required: true },
      { key: 'impression', labelKey: 'template.field.impression', type: 'textarea', required: true },
      { key: 'lungParenchyma', labelKey: 'template.ctChest.lungParenchyma', type: 'textarea' },
      { key: 'mediastinum', labelKey: 'template.ctChest.mediastinum', type: 'textarea' },
      { key: 'pleura', labelKey: 'template.ctChest.pleura', type: 'textarea' },
    ],
  },
  {
    id: 'mri_brain',
    nameKey: 'template.mriBrain.name',
    descriptionKey: 'template.mriBrain.desc',
    modality: 'MR',
    structure: 'structured',
    fields: [
      { key: 'findings', labelKey: 'template.field.findings', type: 'textarea', required: true },
      { key: 'impression', labelKey: 'template.field.impression', type: 'textarea', required: true },
      { key: 'sequence', labelKey: 'template.mriBrain.sequence', type: 'text' },
      { key: 't1weighted', labelKey: 'template.mriBrain.t1Weighted', type: 'textarea' },
      { key: 't2weighted', labelKey: 'template.mriBrain.t2Weighted', type: 'textarea' },
      { key: 'flair', labelKey: 'template.mriBrain.flair', type: 'textarea' },
      { key: 'dwi', labelKey: 'template.mriBrain.dwi', type: 'textarea' },
    ],
  },
  {
    id: 'xray_chest',
    nameKey: 'template.xrayChest.name',
    descriptionKey: 'template.xrayChest.desc',
    modality: 'Xray',
    structure: 'structured',
    fields: [
      { key: 'findings', labelKey: 'template.field.findings', type: 'textarea', required: true },
      { key: 'impression', labelKey: 'template.field.impression', type: 'textarea', required: true },
      { key: 'technique', labelKey: 'template.field.technique', type: 'text' },
      { key: 'position', labelKey: 'template.xrayChest.position', type: 'select', options: [
        { value: 'pa', labelKey: 'template.xrayChest.positionPA' },
        { value: 'ap', labelKey: 'template.xrayChest.positionAP' },
        { value: 'lateral', labelKey: 'template.xrayChest.positionLateral' },
      ]},
    ],
  },
  {
    id: 'ultrasound_abdominal',
    nameKey: 'template.usAbdominal.name',
    descriptionKey: 'template.usAbdominal.desc',
    modality: 'US',
    structure: 'structured',
    fields: [
      { key: 'findings', labelKey: 'template.field.findings', type: 'textarea', required: true },
      { key: 'impression', labelKey: 'template.field.impression', type: 'textarea', required: true },
      { key: 'liver', labelKey: 'template.usAbdominal.liver', type: 'textarea' },
      { key: 'gallbladder', labelKey: 'template.usAbdominal.gallbladder', type: 'textarea' },
      { key: 'pancreas', labelKey: 'template.usAbdominal.pancreas', type: 'textarea' },
      { key: 'spleen', labelKey: 'template.usAbdominal.spleen', type: 'textarea' },
      { key: 'kidneys', labelKey: 'template.usAbdominal.kidneys', type: 'textarea' },
    ],
  },
];

/**
 * 根据检查类型获取模板列表
 */
export function getTemplatesByModality(modality: string): ReportTemplate[] {
  return REPORT_TEMPLATES.filter(t => t.modality.toUpperCase() === modality.toUpperCase());
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find(t => t.id === id);
}

/**
 * 生成双语报告文本
 */
export function generateBilingualReport(
  template: ReportTemplate,
  fieldValues: Record<string, string>,
  locale: 'zh-CN' | 'en-US'
): string {
  // 本地化字段标签
  const getLabel = (key: string) => {
    if (key === 'findings') return locale === 'zh-CN' ? '所见' : 'Findings';
    if (key === 'impression') return locale === 'zh-CN' ? '印象' : 'Impression';
    return key;
  };

  let report = '';
  const separator = locale === 'zh-CN' ? '\n------------\n' : '\n------------\n';

  // 自由文本模板
  if (template.structure === 'free') {
    return fieldValues.findings || '';
  }

  // 结构化模板 - 输出双语对照
  if (locale === 'zh-CN') {
    report += `【${template.id.toUpperCase()} 检查报告】\n\n`;
  } else {
    report += `【${template.id.toUpperCase()} Examination Report】\n\n`;
  }

  for (const field of template.fields) {
    const value = fieldValues[field.key];
    if (value) {
      const label = getLabel(field.key);
      report += `${label}：${value}\n\n`;
    }
  }

  // 添加分隔符（双语对照）
  if (locale === 'zh-CN') {
    report += separator;
    report += '--- English Translation ---\n\n';
    report += generateBilingualReportEN(template, fieldValues);
  } else {
    report += separator;
    report += '--- 中文翻译 ---\n\n';
    report += generateBilingualReportZH(template, fieldValues);
  }

  return report;
}

function generateBilingualReportEN(template: ReportTemplate, fieldValues: Record<string, string>): string {
  const getLabelEN = (key: string) => {
    if (key === 'findings') return 'Findings';
    if (key === 'impression') return 'Impression';
    return key;
  };

  let report = '';
  report += `【${template.id.toUpperCase()} Examination Report】\n\n`;

  for (const field of template.fields) {
    const value = fieldValues[field.key];
    if (value) {
      const label = getLabelEN(field.key);
      report += `${label}: ${value}\n\n`;
    }
  }

  return report;
}

function generateBilingualReportZH(template: ReportTemplate, fieldValues: Record<string, string>): string {
  const getLabelZH = (key: string) => {
    if (key === 'findings') return '所见';
    if (key === 'impression') return '印象';
    return key;
  };

  let report = '';
  report += `【${template.id.toUpperCase()} 检查报告】\n\n`;

  for (const field of template.fields) {
    const value = fieldValues[field.key];
    if (value) {
      const label = getLabelZH(field.key);
      report += `${label}：${value}\n\n`;
    }
  }

  return report;
}