/**
 * G005 RIS v3.0.6.5 - 自动报告编排器
 * 50 升级点 - 将结构化字段 / 影像所见 / RADS / 计算结果
 * 自动组合成符合规范的结构化报告
 */
import type { AutoReportDraft, AutoReportSection } from '@/types/templates/calculations';
import type { RadsSystem } from '@data/rads/radsCommon';
import { RadsCalculatorEngine } from '../rads/RadsCalculatorEngine';
import { PHRASE_CATEGORIES } from '@data/phrases';

interface ComposeInput {
  reportId: string;
  templateId: string;
  modality: string;
  bodyPart: string;
  radsType?: RadsSystem;
  radsValues?: Record<string, unknown>;
  fields: Record<string, unknown>;
  findings?: string;
  impression?: string;
  priorSummary?: string;
  calculationSummary?: string;
  locale?: 'zh-CN' | 'en-US';
}

// ============================================================
// AutoReportComposer
// ============================================================
export class AutoReportComposer {
  private static instance: AutoReportComposer;
  static getInstance(): AutoReportComposer {
    if (!AutoReportComposer.instance) AutoReportComposer.instance = new AutoReportComposer();
    return AutoReportComposer.instance;
  }

  compose(input: ComposeInput): AutoReportDraft {
    const sections: AutoReportSection[] = [];

    // 1. 临床背景
    const clinicalSection = this.composeClinical(input);
    if (clinicalSection) sections.push(clinicalSection);

    // 2. RADS 评估
    if (input.radsType && input.radsValues) {
      const rads = this.composeRads(input);
      if (rads) sections.push(rads);
    }

    // 3. 测量
    const meas = this.composeMeasurements(input);
    if (meas) sections.push(meas);

    // 4. 计算结果
    if (input.calculationSummary) {
      sections.push({
        key: 'calculations',
        title: '衍生计算',
        body: input.calculationSummary,
        source: 'calculation',
        confidence: 0.9,
      });
    }

    // 5. 影像所见
    if (input.findings) {
      sections.push({
        key: 'findings',
        title: '影像所见',
        body: input.findings,
        source: 'findings',
        confidence: 0.85,
      });
    }

    // 6. 既往对比
    if (input.priorSummary) {
      sections.push({
        key: 'comparison',
        title: '与既往对比',
        body: input.priorSummary,
        source: 'comparison',
        confidence: 0.7,
        citations: ['prior-report'],
      });
    }

    // 7. 诊断意见
    sections.push(this.composeImpression(input));

    // 8. 建议
    sections.push(this.composeRecommendation(input));

    // 9. 签名块
    sections.push(this.composeSignature());

    return {
      reportId: input.reportId,
      templateId: input.templateId,
      radsType: input.radsType,
      sections,
      generatedAt: new Date().toISOString(),
      modelVersion: 'ARC-AutoReport v1.0',
      warnings: [],
      totalConfidence: this.avgConfidence(sections),
    };
  }

  /**
   * 转换为纯文本(用于直接打印)
   */
  toText(draft: AutoReportDraft): string {
    return draft.sections.map((s) => `【${s.title}】\n${s.body}`).join('\n\n');
  }

  /**
   * 转换为 HTML(用于富文本编辑器)
   */
  toHtml(draft: AutoReportDraft): string {
    return draft.sections
      .map((s) => `<h3>${s.title}</h3><p>${s.body.replace(/\n/g, '<br/>')}</p>`)
      .join('\n');
  }

  // ---------- 私有方法 ----------
  private composeClinical(input: ComposeInput): AutoReportSection | null {
    if (!input.findings) return null;
    return {
      key: 'clinical',
      title: '临床背景',
      body: `${input.modality} ${input.bodyPart} 检查。${input.findings.split('。')[0] ?? ''}。`,
      source: 'fields',
      confidence: 0.8,
    };
  }

  private composeRads(input: ComposeInput): AutoReportSection | null {
    if (!input.radsType || !input.radsValues) return null;
    const result = RadsCalculatorEngine.getInstance().calculate({
      radsType: input.radsType,
      modality: input.modality,
      bodyPart: input.bodyPart,
      values: input.radsValues,
    });
    if (!result.snippet) return null;
    const body = [
      `${result.radsType} 分级:${result.category} (${result.categoryName})`,
      `风险等级:${result.riskLevel},评分 ${result.score}`,
      `所见:${result.snippet.finding}`,
      `意见:${result.snippet.impression}`,
      `建议:${result.snippet.recommendation}`,
    ].join('\n');
    return {
      key: 'rads',
      title: `${result.radsType} 评估`,
      body,
      source: 'rads',
      confidence: 0.9,
      citations: [result.radsType],
    };
  }

  private composeMeasurements(input: ComposeInput): AutoReportSection | null {
    const meas: string[] = [];
    for (const [k, v] of Object.entries(input.fields)) {
      if (/mm|cm|size|length|volume|angle/i.test(k) && v !== undefined && v !== '') {
        meas.push(`${k}: ${v}`);
      }
    }
    if (meas.length === 0) return null;
    return {
      key: 'measurements',
      title: '关键测量',
      body: meas.join('；'),
      source: 'fields',
      confidence: 1.0,
    };
  }

  private composeImpression(input: ComposeInput): AutoReportSection {
    const lines: string[] = [];
    if (input.radsType && input.radsValues) {
      const result = RadsCalculatorEngine.getInstance().calculate({
        radsType: input.radsType,
        modality: input.modality,
        bodyPart: input.bodyPart,
        values: input.radsValues,
      });
      lines.push(result.snippet?.impression ?? `${result.radsType} ${result.category}`);
    } else if (input.impression) {
      lines.push(input.impression);
    } else {
      lines.push('影像学表现请参见所见。');
    }
    return {
      key: 'impression',
      title: '诊断意见',
      body: lines.join('\n'),
      source: input.radsType ? 'rads' : 'fields',
      confidence: 0.85,
    };
  }

  private composeRecommendation(input: ComposeInput): AutoReportSection {
    let body = '建议结合临床,必要时复查。';
    if (input.radsType && input.radsValues) {
      const result = RadsCalculatorEngine.getInstance().calculate({
        radsType: input.radsType,
        modality: input.modality,
        bodyPart: input.bodyPart,
        values: input.radsValues,
      });
      body = result.snippet?.recommendation ?? result.recommendation;
    }
    return {
      key: 'recommendation',
      title: '建议',
      body,
      source: 'template',
      confidence: 0.7,
    };
  }

  private composeSignature(): AutoReportSection {
    return {
      key: 'signature',
      title: '报告医师',
      body: `报告医师:__________ 审签医师:__________\n日期:${new Date().toISOString().slice(0, 10)}`,
      source: 'template',
      confidence: 1.0,
    };
  }

  private avgConfidence(sections: AutoReportSection[]): number {
    if (sections.length === 0) return 0;
    return Math.round((sections.reduce((a, b) => a + b.confidence, 0) / sections.length) * 100) / 100;
  }
}

export const autoReportComposer = AutoReportComposer.getInstance();
// 引用 PHRASE_CATEGORIES 避免 unused import 警告
void PHRASE_CATEGORIES;
