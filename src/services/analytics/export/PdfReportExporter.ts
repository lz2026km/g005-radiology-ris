import type { ExportRequest, ExportSheet } from '../../../types/analytics';

export interface PdfReportOptions {
  title: string;
  author?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'Letter';
  includeTimestamp?: boolean;
  sections: PdfReportSection[];
}

export interface PdfReportSection {
  title: string;
  content: string;
  type: 'text' | 'table' | 'kpi-grid';
  data?: Record<string, unknown>[];
}

export class PdfReportExporter {
  async export(request: ExportRequest): Promise<Blob> {
    const pdfContent = this.buildPdfContent(request);
    const bytes = new TextEncoder().encode(pdfContent);
    return new Blob([bytes], { type: 'application/pdf' });
  }

  async exportReport(options: PdfReportOptions): Promise<Blob> {
    const request: ExportRequest = {
      format: 'pdf',
      filename: `${options.title.replace(/\s+/g, '_')}.pdf`,
      title: options.title,
      author: options.author,
      sheets: this.sectionsToSheets(options.sections),
      metadata: { orientation: options.orientation ?? 'portrait', pageSize: options.pageSize ?? 'A4' },
    };
    return this.export(request);
  }

  private buildPdfContent(request: ExportRequest): string {
    const lines: string[] = ['%PDF-MOCK'];
    lines.push(`/Title (${request.title ?? 'Report'})`);
    if (request.author) lines.push(`/Author (${request.author})`);
    lines.push(`/Generated (${new Date().toISOString()})`);

    for (const sheet of request.sheets ?? []) {
      lines.push(`\n=== ${sheet.name} ===`);
      const header = sheet.columns.map(c => c.header).join(' | ');
      lines.push(header);
      lines.push('-'.repeat(header.length));
      for (const row of sheet.rows) {
        lines.push(sheet.columns.map(c => String(row[c.key] ?? '')).join(' | '));
      }
    }

    lines.push('\n%PDF-MOCK-END');
    return lines.join('\n');
  }

  private sectionsToSheets(sections: PdfReportSection[]): ExportSheet[] {
    return sections.map((s, i) => ({
      name: s.title,
      columns: s.data?.length ? Object.keys(s.data[0]!).map(k => ({ key: k, header: k })) : [{ key: 'content', header: '内容' }],
      rows: s.data ?? (s.type === 'text' ? [{ content: s.content }] : []),
    }));
  }
}

export const pdfReportExporter = new PdfReportExporter();
