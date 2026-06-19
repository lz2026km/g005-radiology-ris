/**
 * G005 RIS v3.0.6.6 - PACS 驱动自动危急值检测器
 * 监听 PACS 上报(SR TID 1500 / Modality Worklist),命中规则后立即创建 Critical Event
 */

import { srTid1500Parser } from './SrTid1500Parser';
import type { CriticalRuleMatch, DicomSrDocument } from './SrTid1500Parser';

export interface AutoDetectInput {
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  /** SR TID 1500 测量数据 */
  measurements?: DicomSrDocument;
  /** 自由文本发现(用于 NLP 关键字触发) */
  freeText?: string;
  /** 检查元数据 */
  examDate: string;
}

export interface AutoDetectRule {
  id: string;
  code: string;
  name: string;
  /** 触发条件:'sr' / 'text' / 'both' */
  source: 'sr' | 'text' | 'both';
  /** 路径(用于 SR 命中) */
  path?: string;
  threshold?: number;
  operator?: '>' | '<' | '>=' | '<=' | '==';
  /** NLP 关键字(用于 freeText) */
  keywords?: string[];
  severity: 'critical' | 'urgent' | 'warning' | 'info';
  description: string;
}

export interface AutoDetectResult {
  matched: CriticalRuleMatch[];
  detectedAt: string;
  ruleId: string;
  criticalHint: {
    ruleCode: string;
    ruleName: string;
    severity: 'critical' | 'urgent' | 'warning' | 'info';
    detail: string;
  };
}

export interface IAutoDetector {
  detect(input: AutoDetectInput, rules: AutoDetectRule[]): AutoDetectResult[];
  /** 注册一个默认的"出血/梗阻"关键字规则 */
  defaultRules(): AutoDetectRule[];
}

const DEFAULT_RULES: AutoDetectRule[] = [
  {
    id: 'auto-sr-hr-high',
    code: 'CV-AUTO-HR-HIGH',
    name: '心率 > 120',
    source: 'sr',
    path: '心率',
    threshold: 120,
    operator: '>',
    severity: 'urgent',
    description: 'PACS SR TID1500 心率 > 120 bpm',
  },
  {
    id: 'auto-sr-hr-low',
    code: 'CV-AUTO-HR-LOW',
    name: '心率 < 40',
    source: 'sr',
    path: '心率',
    threshold: 40,
    operator: '<',
    severity: 'critical',
    description: 'PACS SR TID1500 心率 < 40 bpm',
  },
  {
    id: 'auto-sr-bp-high',
    code: 'CV-AUTO-BP-HIGH',
    name: '收缩压 > 180',
    source: 'sr',
    path: '收缩压',
    threshold: 180,
    operator: '>',
    severity: 'urgent',
    description: 'PACS SR TID1500 收缩压 > 180 mmHg',
  },
  {
    id: 'auto-sr-bp-low',
    code: 'CV-AUTO-BP-LOW',
    name: '收缩压 < 90',
    source: 'sr',
    path: '收缩压',
    threshold: 90,
    operator: '<',
    severity: 'critical',
    description: 'PACS SR TID1500 收缩压 < 90 mmHg',
  },
  {
    id: 'auto-sr-hb-low',
    code: 'CV-AUTO-HB-LOW',
    name: '血红蛋白 < 60 g/L',
    source: 'sr',
    path: '血红蛋白',
    threshold: 60,
    operator: '<',
    severity: 'critical',
    description: 'PACS SR TID1500 血红蛋白 < 60 g/L',
  },
  {
    id: 'auto-text-pneumothorax',
    code: 'CV-AUTO-TXT-PTX',
    name: '张力性气胸(文本)',
    source: 'text',
    keywords: ['张力性气胸', '大量气胸'],
    severity: 'critical',
    description: '报告文本命中张力性气胸/大量气胸关键字',
  },
  {
    id: 'auto-text-ich',
    code: 'CV-AUTO-TXT-ICH',
    name: '颅内出血(文本)',
    source: 'text',
    keywords: ['脑出血', '蛛网膜下腔出血', '硬膜下血肿'],
    severity: 'critical',
    description: '报告文本命中颅内出血关键字',
  },
];

class AutoDetectorImpl implements IAutoDetector {
  detect(input: AutoDetectInput, rules: AutoDetectRule[] = this.defaultRules()): AutoDetectResult[] {
    const results: AutoDetectResult[] = [];
    for (const rule of rules) {
      const matched: CriticalRuleMatch[] = [];
      let detail = '';
      if ((rule.source === 'sr' || rule.source === 'both') && input.measurements) {
        const r = srTid1500Parser.matchRules(input.measurements, [{
          code: rule.code,
          name: rule.name,
          path: rule.path!,
          threshold: rule.threshold ?? 0,
          operator: rule.operator ?? '>',
          severity: rule.severity,
        }]);
        matched.push(...r);
        if (r.length > 0) {
          const m = r[0]!;
          detail = `${m.message} (来自 SR TID1500)`;
        }
      }
      if ((rule.source === 'text' || rule.source === 'both') && input.freeText && rule.keywords) {
        const hit = rule.keywords.find((kw) => input.freeText!.includes(kw));
        if (hit) {
          detail = `关键字命中: "${hit}" (报告文本)`;
          matched.push({
            ruleCode: rule.code,
            ruleName: rule.name,
            measurementPath: 'freeText',
            observed: 0,
            threshold: 0,
            unit: '',
            severity: rule.severity,
            message: detail,
          });
        }
      }
      if (matched.length > 0) {
        results.push({
          matched,
          detectedAt: new Date().toISOString(),
          ruleId: rule.id,
          criticalHint: {
            ruleCode: rule.code,
            ruleName: rule.name,
            severity: rule.severity,
            detail,
          },
        });
      }
    }
    return results;
  }

  defaultRules(): AutoDetectRule[] {
    return DEFAULT_RULES;
  }
}

export const autoDetector: IAutoDetector = new AutoDetectorImpl();