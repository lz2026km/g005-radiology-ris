/**
 * G005 RIS v3.0.6.5 - 模板审计器
 * 40 升级点 - 合规 / 完整性 / 翻译 / 公式校验 / 引用一致性
 */
import type {
  TemplateAuditReport, TemplateViolation,
  TemplateViolationCode, TemplateViolationSeverity,
} from '@/types/templates/calculations';

export interface AuditableTemplate {
  id: string;
  name: string;
  version: string;
  approved?: boolean;
  fields: Array<{
    id: string;
    fieldKey: string;
    fieldLabel: string;
    labelEn?: string;
    dataType: string;
    required: boolean;
    fieldGroup?: string;
    unit?: string;
    defaultValue?: unknown;
    referenceRange?: { min?: number; max?: number; unit?: string };
    formula?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
  groups?: Array<{ id: string; name: string }>;
  inheritable?: boolean;
  parentId?: string;
  radsType?: string;
}

const CHECKLIST = [
  { id: 'c1', label: '所有必填字段已定义' },
  { id: 'c2', label: '字段 key 唯一' },
  { id: 'c3', label: '存在分组' },
  { id: 'c4', label: '数值字段带单位' },
  { id: 'c5', label: '数值字段带参考范围' },
  { id: 'c6', label: '中英文标签均存在' },
  { id: 'c7', label: 'RADS 模板已绑定计算引擎' },
  { id: 'c8', label: '公式字段已声明 formula' },
  { id: 'c9', label: '无循环继承' },
  { id: 'c10', label: '模板已批准' },
];

export class TemplateAuditor {
  private static instance: TemplateAuditor;
  static getInstance(): TemplateAuditor {
    if (!TemplateAuditor.instance) TemplateAuditor.instance = new TemplateAuditor();
    return TemplateAuditor.instance;
  }

  audit(template: AuditableTemplate): TemplateAuditReport {
    const violations: TemplateViolation[] = [];
    const checklist = CHECKLIST.map((c) => ({ ...c, pass: true }));

    // 1. 必填字段
    const requiredMissing = template.fields.filter((f) => f.required && f.fieldLabel === '');
    if (requiredMissing.length > 0) {
      requiredMissing.forEach((f) => violations.push(this.buildViolation('missing-required-field', 'warning',
        `必填字段 "${f.fieldKey}" 缺少标签`, `Required field "${f.fieldKey}" has no label`, f.fieldKey)));
      this.setCheck(checklist, 'c1', false);
    }

    // 2. 重复 key
    const keys = new Map<string, number>();
    template.fields.forEach((f) => keys.set(f.fieldKey, (keys.get(f.fieldKey) ?? 0) + 1));
    Array.from(keys.entries()).filter(([, n]) => n > 1).forEach(([key, n]) => {
      violations.push(this.buildViolation('duplicate-field-key', 'error',
        `字段 key "${key}" 重复 ${n} 次`, `Duplicate field key "${key}" (${n} times)`, key));
    });
    this.setCheck(checklist, 'c2', Array.from(keys.values()).every((n) => n === 1));

    // 3. 分组
    if (!template.groups || template.groups.length === 0) {
      violations.push(this.buildViolation('orphan-group', 'info',
        '模板未定义任何分组', 'Template has no groups defined'));
      this.setCheck(checklist, 'c3', false);
    }

    // 4. 单位
    const numericNoUnit = template.fields.filter((f) => (f.dataType === 'number' || f.dataType === 'length' || f.dataType === 'area' || f.dataType === 'volume') && !f.unit);
    if (numericNoUnit.length > 0) {
      numericNoUnit.forEach((f) => violations.push(this.buildViolation('no-metric-unit', 'warning',
        `字段 "${f.fieldKey}" 缺少单位`, `Field "${f.fieldKey}" missing unit`, f.fieldKey)));
      this.setCheck(checklist, 'c4', false);
    }

    // 5. 参考范围
    const numericNoRange = template.fields.filter((f) => (f.dataType === 'number' || f.dataType === 'length') && f.required && !f.referenceRange);
    if (numericNoRange.length > 0) {
      numericNoRange.slice(0, 5).forEach((f) => violations.push(this.buildViolation('no-reference-range', 'info',
        `字段 "${f.fieldKey}" 缺少参考范围`, `Field "${f.fieldKey}" missing reference range`, f.fieldKey)));
      this.setCheck(checklist, 'c5', numericNoRange.length === 0);
    }

    // 6. 中英文
    const untranslated = template.fields.filter((f) => f.fieldLabel && !f.labelEn);
    if (untranslated.length > 0) {
      untranslated.slice(0, 3).forEach((f) => violations.push(this.buildViolation('untranslated-label', 'info',
        `字段 "${f.fieldKey}" 未提供英文标签`, `Field "${f.fieldKey}" missing English label`, f.fieldKey)));
      this.setCheck(checklist, 'c6', untranslated.length === 0);
    }

    // 7. RADS 绑定
    if (template.radsType && !template.fields.some((f) => /rads|category|overallScore/i.test(f.fieldKey))) {
      violations.push(this.buildViolation('rads-not-linked', 'error',
        'RADS 模板未绑定计算字段', 'RADS template has no calculation fields'));
      this.setCheck(checklist, 'c7', false);
    } else {
      this.setCheck(checklist, 'c7', true);
    }

    // 8. 公式
    const formulaFields = template.fields.filter((f) => f.dataType === 'formula' && !f.formula);
    formulaFields.forEach((f) => violations.push(this.buildViolation('invalid-formula', 'error',
      `公式字段 "${f.fieldKey}" 缺少 formula 表达式`, `Formula field "${f.fieldKey}" has no expression`, f.fieldKey)));
    this.setCheck(checklist, 'c8', formulaFields.length === 0);

    // 9. 循环继承
    if (template.parentId && template.parentId === template.id) {
      violations.push(this.buildViolation('circular-inheritance', 'error',
        '模板不能继承自身', 'Template cannot inherit itself'));
      this.setCheck(checklist, 'c9', false);
    } else {
      this.setCheck(checklist, 'c9', true);
    }

    // 10. 批准
    if (!template.approved) {
      violations.push(this.buildViolation('unapproved-template', 'warning',
        '模板尚未批准使用', 'Template has not been approved'));
      this.setCheck(checklist, 'c10', false);
    }

    // 评分
    const passCount = checklist.filter((c) => c.pass).length;
    const score = Math.round((passCount / checklist.length) * 100);

    return {
      templateId: template.id,
      auditedAt: new Date().toISOString(),
      score,
      totalFields: template.fields.length,
      groups: template.groups?.length ?? 0,
      violations,
      summary: {
        errors: violations.filter((v) => v.severity === 'error').length,
        warnings: violations.filter((v) => v.severity === 'warning').length,
        info: violations.filter((v) => v.severity === 'info').length,
      },
      checklist,
    };
  }

  getViolations(template: AuditableTemplate): TemplateViolation[] {
    return this.audit(template).violations;
  }

  // ---------- 私有 ----------
  private buildViolation(
    code: TemplateViolationCode,
    severity: TemplateViolationSeverity,
    msg: string, msgEn: string,
    fieldKey?: string,
  ): TemplateViolation {
    return {
      id: `${code}-${Math.random().toString(36).slice(2, 9)}`,
      code,
      severity,
      message: msg,
      messageEn: msgEn,
      fieldKey,
      recommendation: this.getRecommendation(code),
      rule: code,
    };
  }

  private getRecommendation(code: TemplateViolationCode): string {
    const map: Record<TemplateViolationCode, string> = {
      'missing-required-field': '为该字段补充完整标签',
      'duplicate-field-key': '修改重复 key,保持唯一',
      'circular-inheritance': '移除自引用或纠正继承链',
      'orphan-group': '添加至少一个分组(基础信息/所见/结论)',
      'rads-not-linked': '在字段中加入 RADS 计算引擎键',
      'calculation-not-bound': '将 formula 字段绑定到 CalculationEngine',
      'untranslated-label': '补充 labelEn',
      'invalid-formula': '为 formula 类型字段提供表达式',
      'sensitive-phi': '移除模板中的 PHI(姓名/身份证)',
      'deprecated-snippet': '更新为最新 RADS 报告片段',
      'unapproved-template': '提交审核流程并获得批准',
      'inconsistent-version': '检查语义化版本号',
      'no-metric-unit': '添加公制单位(mm/cm/mL)',
      'no-reference-range': '提供参考范围与单位',
    };
    return map[code];
  }

  private setCheck(checklist: ReturnType<typeof this.audit>['checklist'], id: string, pass: boolean): void {
    const item = checklist.find((c) => c.id === id);
    if (item) item.pass = pass;
  }
}

export const templateAuditor = TemplateAuditor.getInstance();
