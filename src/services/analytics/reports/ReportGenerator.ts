import { kpiEngine } from '../KpiEngine';
import type { ReportTemplate, ReportSection, KpiSnapshot, ExportFormat } from '../../../types/analytics';

export interface GeneratedReport {
  templateId: string;
  name: string;
  description: string;
  sections: ReportSection[];
  snapshot: KpiSnapshot;
  generatedAt: string;
}

export class ReportGenerator {
  private templates: Map<string, ReportTemplate>;

  constructor() {
    this.templates = new Map();
  }

  registerTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): ReportTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): ReportTemplate[] {
    return [...this.templates.values()];
  }

  generate(templateId: string, period: Parameters<typeof kpiEngine.computeSnapshot>[0], range: Parameters<typeof kpiEngine.computeSnapshot>[1]): GeneratedReport {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`Unknown template: ${templateId}`);
    const snapshot = kpiEngine.computeSnapshot(period, range);
    return {
      templateId,
      name: template.name,
      description: template.description,
      sections: template.sections,
      snapshot,
      generatedAt: new Date().toISOString(),
    };
  }

  buildSectionData(section: ReportSection, snapshot: KpiSnapshot): Record<string, unknown> {
    switch (section.type) {
      case 'kpi-grid': {
        const ids = (section.options?.kpiIds as string[]) ?? snapshot.values.map(v => v.kpiId);
        const values = snapshot.values.filter(v => ids.includes(v.kpiId));
        return { type: 'kpi-grid', kpis: values, title: section.title };
      }
      case 'chart':
        return { type: 'chart', source: section.source, title: section.title, options: section.options };
      case 'table':
        return { type: 'table', source: section.source, title: section.title, options: section.options };
      default:
        return { type: section.type, title: section.title, source: section.source };
    }
  }

  registerDefaultTemplates(): void {
    this.registerTemplate({
      id: 'tpl-exec-summary',
      name: '科室执行摘要',
      description: '科室核心 KPI 执行摘要报告',
      sections: [
        { id: 'sec-volume', title: '数量概览', type: 'kpi-grid', source: 'kpi', options: { kpiIds: ['kpi-001', 'kpi-002', 'kpi-003', 'kpi-004'] } },
        { id: 'sec-timeliness', title: '时效分析', type: 'kpi-grid', source: 'kpi', options: { kpiIds: ['kpi-010', 'kpi-011', 'kpi-012', 'kpi-013'] } },
        { id: 'sec-quality', title: '质量指标', type: 'kpi-grid', source: 'kpi', options: { kpiIds: ['kpi-020', 'kpi-021', 'kpi-022', 'kpi-023'] } },
        { id: 'sec-chart-volume', title: '报告趋势', type: 'chart', source: 'chart-volume-trend', options: {} },
      ],
      createdAt: new Date().toISOString(),
    });
    this.registerTemplate({
      id: 'tpl-quality',
      name: '质控月报',
      description: '月度质量控制详细报告',
      sections: [
        { id: 'sec-quality-grid', title: '质量概览', type: 'kpi-grid', source: 'kpi', options: { kpiIds: ['kpi-020', 'kpi-021', 'kpi-022', 'kpi-023'] } },
        { id: 'sec-safety', title: '安全指标', type: 'kpi-grid', source: 'kpi', options: { kpiIds: ['kpi-030', 'kpi-031', 'kpi-032', 'kpi-033'] } },
        { id: 'sec-heatmap', title: '质量热力图', type: 'heatmap', source: 'quality-heatmap', options: {} },
      ],
      createdAt: new Date().toISOString(),
    });
    this.registerTemplate({
      id: 'tpl-benchmark',
      name: '行业基准对标',
      description: '与行业基准进行对比分析',
      sections: [
        { id: 'sec-bench', title: '基准对比', type: 'benchmark', source: 'benchmark', options: {} },
        { id: 'sec-cohort', title: '队列分析', type: 'cohort', source: 'cohort', options: {} },
      ],
      createdAt: new Date().toISOString(),
    });
  }
}

export const reportGenerator = new ReportGenerator();
reportGenerator.registerDefaultTemplates();
