import type { ExportRequest, ExportSheet } from '../../../types/analytics';

export class ExcelExporter {
  async export(request: ExportRequest): Promise<Blob> {
    const wb = this.buildWorkbook(request);
    const buf = this.writeWorkbook(wb);
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async exportFromSheets(sheets: ExportSheet[], filename?: string): Promise<Blob> {
    const request: ExportRequest = {
      format: 'xlsx',
      filename: filename ?? 'export.xlsx',
      sheets,
    };
    return this.export(request);
  }

  private buildWorkbook(request: ExportRequest): unknown[][] {
    const sheets: unknown[][] = [];
    for (const sheet of request.sheets ?? []) {
      const header = sheet.columns.map(c => c.header);
      const rows = sheet.rows.map(r => sheet.columns.map(c => r[c.key]));
      sheets.push([header, ...rows]);
    }
    return sheets;
  }

  private writeWorkbook(data: unknown[][]): ArrayBuffer {
    const encoder = new TextEncoder();
    const parts: string[] = ['PK_EXCEL_WORKBOOK_MOCK'];

    for (const sheet of data) {
      const rows = (sheet as unknown[][]).map(row =>
        (row as unknown[]).map(cell => String(cell ?? '')).join(',')
      );
      parts.push(rows.join('\n'));
    }

    const bytes = encoder.encode(parts.join('||SHEET||'));
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }
}

export const excelExporter = new ExcelExporter();
