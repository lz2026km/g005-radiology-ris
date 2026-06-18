/**
 * G005 RIS v3.0.5.1 - R3.QUALITY REPORT 月报 Service (Mock)
 * A5-REPORT / 30 点
 * 月报/季报/年报/仪表盘 全部 mock，延迟 200-1500ms
 */

import {
  MONTHLY_QUALITY_REPORTS,
  QUARTERLY_QUALITY_REPORTS,
  ANNUAL_QUALITY_REPORT,
  QUALITY_DASHBOARD_MOCK,
  QUALITY_DASHBOARD_KPI,
  getMonthlyReport,
} from '../../data/qualityReportMock';
import type {
  QuarterlyQualityReport,
  AnnualQualityReport,
  QualityDashboard,
  QualityKPI,
  ReportConfig,
  ReportExport,
  ReportFormat,
  ReportSectionKey,
} from '../../types/R3/R3.QUALITY.REPORT';
import type { MonthlyQualityReport } from '../../types/R3/R3.QUALITY';

const LATENCY_MIN = 200;
const LATENCY_MAX = 1500;

const randomLatency = (): number => Math.floor(Math.random() * (LATENCY_MAX - LATENCY_MIN)) + LATENCY_MIN;

const wait = (ms?: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms ?? randomLatency()));

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const inMemoryConfigs: ReportConfig[] = [];
const inMemoryExports: ReportExport[] = [];

export const reportService = {
  // 月报
  async getMonthlyReport(year: number, month: number): Promise<MonthlyQualityReport> {
    await wait(1000);
    return clone(getMonthlyReport(year, month));
  },

  async listMonthlyReports(): Promise<MonthlyQualityReport[]> {
    await wait();
    return clone(MONTHLY_QUALITY_REPORTS);
  },

  async getLatestMonthlyReport(): Promise<MonthlyQualityReport> {
    await wait();
    const latest = MONTHLY_QUALITY_REPORTS[MONTHLY_QUALITY_REPORTS.length - 1];
    return clone(latest ?? MONTHLY_QUALITY_REPORTS[0]!);
  },

  // 季报
  async getQuarterlyReport(year: number, quarter: 1 | 2 | 3 | 4): Promise<QuarterlyQualityReport> {
    await wait(1200);
    const found = QUARTERLY_QUALITY_REPORTS.find((r) => r.year === year && r.quarter === quarter);
    return clone(found ?? QUARTERLY_QUALITY_REPORTS[0]!);
  },

  async listQuarterlyReports(): Promise<QuarterlyQualityReport[]> {
    await wait();
    return clone(QUARTERLY_QUALITY_REPORTS);
  },

  // 年报
  async getAnnualReport(year: number): Promise<AnnualQualityReport> {
    await wait(1500);
    return clone({ ...ANNUAL_QUALITY_REPORT, year });
  },

  // 实时仪表盘
  async getDashboard(): Promise<QualityDashboard> {
    await wait();
    return clone(QUALITY_DASHBOARD_MOCK);
  },

  async getKPI(): Promise<QualityKPI> {
    await wait();
    return clone(QUALITY_DASHBOARD_KPI);
  },

  // 报表导出
  async exportReport(
    year: number,
    month: number,
    format: ReportFormat,
  ): Promise<{ data: string; mime: string; filename: string }> {
    await wait(1500);
    const filename = `quality-monthly-report-${year}-${String(month).padStart(2, '0')}.${format}`;
    const mime =
      format === 'pdf'
        ? 'application/pdf'
        : format === 'word'
          ? 'application/msword'
          : format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/html';
    const exportRec: ReportExport = {
      id: `exp-${Date.now()}`,
      reportId: `qr-${year}-${String(month).padStart(2, '0')}`,
      format,
      filename,
      size: 1024 * (50 + Math.floor(Math.random() * 200)),
      url: `/api/v1/quality/exports/${filename}`,
      generatedBy: 'current-user',
      generatedAt: new Date().toISOString(),
    };
    inMemoryExports.push(exportRec);
    return {
      data: `Mock ${format.toUpperCase()} content for ${year}-${month}`,
      mime,
      filename,
    };
  },

  async listExports(): Promise<ReportExport[]> {
    await wait();
    return clone(inMemoryExports);
  },

  async deleteExport(id: string): Promise<void> {
    await wait(200);
    const idx = inMemoryExports.findIndex((e) => e.id === id);
    if (idx >= 0) inMemoryExports.splice(idx, 1);
  },

  // 报表配置
  async listConfigs(): Promise<ReportConfig[]> {
    await wait();
    return clone(inMemoryConfigs);
  },

  async createConfig(
    config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ReportConfig> {
    await wait();
    const now = new Date().toISOString();
    const c: ReportConfig = {
      ...config,
      id: `cfg-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryConfigs.push(c);
    return clone(c);
  },

  async updateConfig(id: string, patch: Partial<ReportConfig>): Promise<ReportConfig> {
    await wait();
    const c = inMemoryConfigs.find((x) => x.id === id);
    if (!c) throw new Error('Config not found');
    Object.assign(c, patch, { updatedAt: new Date().toISOString() });
    return clone(c);
  },

  async deleteConfig(id: string): Promise<void> {
    await wait(200);
    const idx = inMemoryConfigs.findIndex((c) => c.id === id);
    if (idx >= 0) inMemoryConfigs.splice(idx, 1);
  },

  async toggleConfig(id: string, autoGenerate: boolean): Promise<ReportConfig> {
    await wait();
    const c = inMemoryConfigs.find((x) => x.id === id);
    if (!c) throw new Error('Config not found');
    c.autoGenerate = autoGenerate;
    c.updatedAt = new Date().toISOString();
    return clone(c);
  },

  // 章节管理
  async getSections(year: number, month: number): Promise<Array<{ key: ReportSectionKey; title: string; titleEn: string; content: string }>> {
    await wait();
    const report = getMonthlyReport(year, month);
    return clone(report.sections as Array<{ key: ReportSectionKey; title: string; titleEn: string; content: string }>);
  },

  // 趋势数据
  async getTrend(year: number, month: number): Promise<Array<{ date: string; avgScore: number; evaluated: number; defects: number }>> {
    await wait();
    const report = getMonthlyReport(year, month);
    return clone(report.trends);
  },

  // 排名
  async getDoctorRanking(year: number, month: number, limit = 10): Promise<Array<{ doctorId: string; doctorName: string; avgScore: number; total: number; rank: number }>> {
    await wait();
    const report = getMonthlyReport(year, month);
    return clone(report.doctorRanking.slice(0, limit));
  },

  async getDepartmentRanking(year: number, month: number, limit = 10): Promise<Array<{ department: string; avgScore: number; total: number; rank: number }>> {
    await wait();
    const report = getMonthlyReport(year, month);
    return clone(report.departmentRanking.slice(0, limit));
  },

  // 缺陷统计
  async getDefectStatistics(year: number, month: number, limit = 20): Promise<Array<{ code: string; name: string; count: number; changeRate: number }>> {
    await wait();
    const report = getMonthlyReport(year, month);
    return clone(report.defectStatistics.slice(0, limit));
  },
};

export type ReportService = typeof reportService;
export default reportService;
