/**
 * G005 RIS v3.0.5.1 - R3.QUALITY REPORT 月报 Mock 数据
 * A5-REPORT / 30 点
 * 质控月报/季度报/年度报/实时仪表盘 mock 数据
 */

import type {
  MonthlyQualityReport,
  QuarterlyQualityReport,
  AnnualQualityReport,
  QualityDashboard,
  QualityKPI,
  QualityGrade,
} from '../types/R3/R3.QUALITY';

// ============================================================
// 工具函数
// ============================================================

const pad = (n: number, len = 2): string => String(n).padStart(len, '0');

function daysOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function buildTrendData(year: number, month: number) {
  const days = Math.min(daysOfMonth(year, month), 30);
  const trend: Array<{ date: string; avgScore: number; evaluated: number; defects: number }> = [];
  for (let d = 1; d <= days; d++) {
    const dayScore = 82 + Math.sin(d / 4) * 4 + Math.random() * 3;
    const evaluated = 40 + Math.floor(Math.random() * 25);
    const defects = Math.floor(evaluated * (0.08 + Math.random() * 0.06));
    trend.push({
      date: `${year}-${pad(month)}-${pad(d)}`,
      avgScore: Math.round(dayScore * 10) / 10,
      evaluated,
      defects,
    });
  }
  return trend;
}

// ============================================================
// 月报 Mock (12 月份)
// ============================================================

export const MONTHLY_QUALITY_REPORTS: MonthlyQualityReport[] = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const totalReports = 800 + Math.floor(Math.random() * 400);
  const avgScore = 82 + Math.random() * 8;
  const gradeDistribution: Record<QualityGrade, number> = {
    '甲': Math.floor(totalReports * 0.42),
    '乙': Math.floor(totalReports * 0.38),
    '丙': Math.floor(totalReports * 0.15),
    '丁': Math.floor(totalReports * 0.05),
  };
  return {
    id: `qr-2026-${pad(month)}`,
    year: 2026,
    month,
    totalReports,
    avgScore: Math.round(avgScore * 10) / 10,
    monthOverMonth: Math.round((Math.random() * 6 - 1) * 10) / 10,
    gradeDistribution,
    defectStatistics: [
      { code: 'DSC-001', name: '描述不完整', count: Math.floor(totalReports * 0.08), changeRate: -2.3 },
      { code: 'TER-002', name: '术语不规范', count: Math.floor(totalReports * 0.06), changeRate: -1.5 },
      { code: 'FMT-003', name: '格式错误', count: Math.floor(totalReports * 0.05), changeRate: 0.8 },
      { code: 'LOG-004', name: '逻辑矛盾', count: Math.floor(totalReports * 0.03), changeRate: -0.5 },
      { code: 'CRIT-005', name: '危急值未标', count: Math.floor(totalReports * 0.02), changeRate: 1.2 },
    ],
    doctorRanking: Array.from({ length: 5 }, (_, di) => ({
      doctorId: `D00${di + 1}`,
      doctorName: ['张明远', '李慧敏', '王建华', '刘文博', '孙立军'][di]!,
      avgScore: Math.round((88 - di * 2) * 10) / 10,
      total: 100 + Math.floor(Math.random() * 60),
      rank: di + 1,
    })),
    departmentRanking: ['CT室', 'MR室', 'DR室', '超声科', '介入科'].map((dept, idx) => ({
      department: dept,
      avgScore: Math.round((88 - idx * 1.5) * 10) / 10,
      total: 120 + Math.floor(Math.random() * 80),
      rank: idx + 1,
    })),
    trends: buildTrendData(2026, month),
    topDefects: [
      { code: 'DSC-001', name: '描述不完整', count: Math.floor(totalReports * 0.08) },
      { code: 'TER-002', name: '术语不规范', count: Math.floor(totalReports * 0.06) },
      { code: 'FMT-003', name: '格式错误', count: Math.floor(totalReports * 0.05) },
    ],
    criticalMissed: Math.floor(Math.random() * 5),
    fixRate: 78 + Math.floor(Math.random() * 10),
    autoRate: 65 + Math.floor(Math.random() * 20),
    generatedAt: `2026-${pad(month)}-28T18:00:00Z`,
    generatedBy: '质控系统',
    sections: [
      { key: 'overview', title: '总览', titleEn: 'Overview', content: `本月共评估 ${totalReports} 份报告，平均分 ${avgScore.toFixed(1)}，环比 ${(Math.random() * 4 - 1).toFixed(1)}%。` },
      { key: 'grade', title: '等级分析', titleEn: 'Grade Analysis', content: `甲级 ${gradeDistribution['甲']} 份(42%)，乙级 ${gradeDistribution['乙']} 份(38%)，丙级 ${gradeDistribution['丙']} 份(15%)，丁级 ${gradeDistribution['丁']} 份(5%)。` },
      { key: 'defect', title: '缺陷分析', titleEn: 'Defect Analysis', content: '本月共发现缺陷 120 处，主要集中在描述完整性和术语规范。' },
      { key: 'doctor', title: '医生排名', titleEn: 'Doctor Ranking', content: '本月 Top 5 医生均分 88+，整体表现优秀。' },
      { key: 'department', title: '科室排名', titleEn: 'Department Ranking', content: 'CT 室以 88.5 分位列第一，DR 室进步明显。' },
      { key: 'trend', title: '趋势', titleEn: 'Trend', content: '本月质量分较上月提升 1.2 分，缺陷率下降 0.5%。' },
      { key: 'critical', title: '危急值', titleEn: 'Critical', content: '本月危急值报告 18 例，全部 10 分钟内通报。' },
      { key: 'timeliness', title: '时效', titleEn: 'Timeliness', content: 'TAT 平均 18 分钟，达到 SLA 要求。' },
      { key: 'terminology', title: '术语', titleEn: 'Terminology', content: 'RadLex 术语使用率 92%，同比提升 3%。' },
      { key: 'training', title: '培训', titleEn: 'Training', content: '本月组织质控培训 4 场，覆盖 32 人。' },
      { key: 'rectifications', title: '整改', titleEn: 'Rectifications', content: '本月整改缺陷 95 项，整改率 78.5%。' },
      { key: 'target', title: '目标', titleEn: 'Target', content: '年度质控目标完成度 65%，稳步推进。' },
      { key: 'risk', title: '风险', titleEn: 'Risk', content: '本月新增 3 项质控风险，均已纳入跟踪。' },
      { key: 'improvement', title: '改进', titleEn: 'Improvement', content: 'AI 辅助评分覆盖率提升至 85%，采纳率 78.5%。' },
      { key: 'next', title: '下月计划', titleEn: 'Next Month Plan', content: '下月重点:提升丁级报告整改率、推广 ACR RadPeer 评分。' },
    ],
  };
});

export const getMonthlyReport = (year: number, month: number): MonthlyQualityReport => {
  const found = MONTHLY_QUALITY_REPORTS.find((r) => r.year === year && r.month === month);
  if (found) return { ...found };
  // Fallback: clone first report with year/month override
  const base = MONTHLY_QUALITY_REPORTS[0]!;
  return { ...base, year, month, id: `qr-${year}-${pad(month)}` };
};

// ============================================================
// 季报 Mock (4 季度)
// ============================================================

export const QUARTERLY_QUALITY_REPORTS: QuarterlyQualityReport[] = Array.from({ length: 4 }, (_, qi) => {
  const total = 2400 + Math.floor(Math.random() * 600);
  return {
    id: `qr-q${qi + 1}-2026`,
    year: 2026,
    quarter: (qi + 1) as 1 | 2 | 3 | 4,
    totalReports: total,
    avgScore: 84 + Math.random() * 4,
    monthOverQuarter: Math.round((Math.random() * 4 - 1) * 10) / 10,
    gradeDistribution: {
      '甲': Math.floor(total * 0.45),
      '乙': Math.floor(total * 0.36),
      '丙': Math.floor(total * 0.14),
      '丁': Math.floor(total * 0.05),
    },
    departmentRanking: ['CT室', 'MR室', 'DR室', '超声科'].map((dept, idx) => ({
      department: dept,
      avgScore: 88 - idx * 1.5,
      total: 600,
      rank: idx + 1,
    })),
    sections: [],
    fixRate: 80,
    autoRate: 70,
    generatedAt: `2026-${pad((qi + 1) * 3)}-30T18:00:00Z`,
    generatedBy: '质控系统',
  };
});

// ============================================================
// 年报 Mock
// ============================================================

export const ANNUAL_QUALITY_REPORT: AnnualQualityReport = {
  id: 'qr-2026-annual',
  year: 2026,
  totalReports: 12480,
  avgScore: 85.6,
  yearOverYear: 3.2,
  gradeDistribution: {
    '甲': 5616,
    '乙': 4493,
    '丙': 1747,
    '丁': 624,
  },
  monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    avgScore: 82 + Math.sin(i / 2) * 3,
    totalReports: 1000 + Math.floor(Math.random() * 100),
  })),
  annualTargets: {
    avgScoreTarget: 88,
    avgScoreActual: 85.6,
    gradeARate: 0.45,
    fixRate: 0.82,
  },
  sections: [],
  generatedAt: '2026-12-31T23:59:00Z',
  generatedBy: '质控系统',
};

// ============================================================
// 实时仪表盘 Mock
// ============================================================

export const QUALITY_DASHBOARD_MOCK: QualityDashboard = {
  realtime: {
    pendingEvaluation: 28,
    completedToday: 142,
    inProgressEvaluation: 12,
    criticalMissedToday: 1,
  },
  byModality: [
    { modality: 'CT', count: 480, avgScore: 87.5, passRate: 0.92 },
    { modality: 'MR', count: 320, avgScore: 86.2, passRate: 0.90 },
    { modality: 'DR', count: 250, avgScore: 84.8, passRate: 0.88 },
    { modality: 'MG', count: 80, avgScore: 89.1, passRate: 0.95 },
    { modality: 'US', count: 120, avgScore: 85.5, passRate: 0.89 },
  ],
  byDoctor: [
    { doctorId: 'D001', doctorName: '张明远', count: 180, avgScore: 91.2, passRate: 0.95 },
    { doctorId: 'D002', doctorName: '李慧敏', count: 165, avgScore: 89.8, passRate: 0.93 },
    { doctorId: 'D003', doctorName: '王建华', count: 142, avgScore: 88.1, passRate: 0.91 },
    { doctorId: 'D004', doctorName: '刘文博', count: 138, avgScore: 86.5, passRate: 0.89 },
    { doctorId: 'D005', doctorName: '孙立军', count: 120, avgScore: 85.3, passRate: 0.87 },
  ],
  byHour: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: h >= 8 && h <= 17 ? 20 + Math.floor(Math.random() * 15) : Math.floor(Math.random() * 5),
    avgScore: 80 + Math.random() * 10,
  })),
  recentScores: [
    { id: 'qs-001', reportId: 'RP20260618012', patientName: '张三', doctorName: '张明远', score: 92, grade: '甲', evaluatedAt: new Date(Date.now() - 5 * 60_000).toISOString() },
    { id: 'qs-002', reportId: 'RP20260618011', patientName: '李四', doctorName: '李慧敏', score: 88, grade: '乙', evaluatedAt: new Date(Date.now() - 12 * 60_000).toISOString() },
    { id: 'qs-003', reportId: 'RP20260618010', patientName: '王五', doctorName: '王建华', score: 85, grade: '乙', evaluatedAt: new Date(Date.now() - 25 * 60_000).toISOString() },
    { id: 'qs-004', reportId: 'RP20260618009', patientName: '赵六', doctorName: '刘文博', score: 76, grade: '丙', evaluatedAt: new Date(Date.now() - 40 * 60_000).toISOString() },
    { id: 'qs-005', reportId: 'RP20260618008', patientName: '钱七', doctorName: '孙立军', score: 55, grade: '丁', evaluatedAt: new Date(Date.now() - 55 * 60_000).toISOString() },
  ],
  alerts: [
    { id: 'alert-001', type: 'critical-miss', message: '今晨 1 例危急值未在 10 分钟内通报', severity: 'critical', timestamp: new Date(Date.now() - 30 * 60_000).toISOString() },
    { id: 'alert-002', type: 'low-score', message: '孙立军医生本周均分 78，低于阈值', severity: 'warning', timestamp: new Date(Date.now() - 2 * 60 * 60_000).toISOString() },
    { id: 'alert-003', type: 'overdue-eval', message: '12 份报告待评估超过 24 小时', severity: 'warning', timestamp: new Date(Date.now() - 3 * 60 * 60_000).toISOString() },
  ],
};

// ============================================================
// 仪表盘 KPI Mock
// ============================================================

export const QUALITY_DASHBOARD_KPI: QualityKPI = {
  totalEvaluated: 12480,
  avgScore: 85.6,
  p50Score: 86,
  p95Score: 95,
  gradeDistribution: {
    '甲': 5616,
    '乙': 4493,
    '丙': 1747,
    '丁': 624,
  },
  gradeRate: {
    '甲': 0.45,
    '乙': 0.36,
    '丙': 0.14,
    '丁': 0.05,
  },
  defectTopList: [
    { code: 'DSC-001', name: '描述不完整', count: 998, severity: 'major' },
    { code: 'TER-002', name: '术语不规范', count: 749, severity: 'minor' },
    { code: 'FMT-003', name: '格式错误', count: 624, severity: 'minor' },
    { code: 'LOG-004', name: '逻辑矛盾', count: 374, severity: 'major' },
    { code: 'CRIT-005', name: '危急值未标', count: 250, severity: 'critical' },
  ],
  doctorRanking: [
    { doctorId: 'D001', doctorName: '张明远', avgScore: 91.2, totalReports: 2160, rank: 1 },
    { doctorId: 'D002', doctorName: '李慧敏', avgScore: 89.8, totalReports: 1980, rank: 2 },
    { doctorId: 'D003', doctorName: '王建华', avgScore: 88.1, totalReports: 1704, rank: 3 },
  ],
  departmentRanking: [
    { department: 'CT室', avgScore: 88.5, totalReports: 5760, rank: 1 },
    { department: 'MR室', avgScore: 87.2, totalReports: 3840, rank: 2 },
    { department: 'DR室', avgScore: 85.8, totalReports: 2880, rank: 3 },
  ],
  aiAcceptanceRate: 0.785,
  trend30d: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-05-${pad(i + 1)}`,
    avgScore: 84 + Math.sin(i / 3) * 3,
    evaluated: 400 + Math.floor(Math.random() * 80),
    defectRate: 0.08 + Math.random() * 0.04,
  })),
  autoRate: 0.72,
  retrainingNeeded: 8,
  criticalMissedCount: 5,
};
