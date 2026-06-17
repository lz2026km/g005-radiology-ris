export interface RevenueSummaryDto {
  period: string
  totalRevenue: number
  totalExams: number
  avgRevenuePerExam: number
  byModality: { modality: string; revenue: number; exams: number; percentage: number }[]
  byPayer: { payer: string; revenue: number; percentage: number }[]
  byDoctor: { doctorId: string; doctorName: string; revenue: number; exams: number }[]
}

export interface RevenueTrendDto {
  month: string
  revenue: number
  cost: number
  profit: number
  examCount: number
}

export interface RevenueComparisonDto {
  currentPeriod: { revenue: number; exams: number; profit: number }
  previousPeriod: { revenue: number; exams: number; profit: number }
  revenueChange: number
  examChange: number
  profitChange: number
}

const MOCK_TREND: RevenueTrendDto[] = [
  { month: '2025-07', revenue: 680000, cost: 420000, profit: 260000, examCount: 4200 },
  { month: '2025-08', revenue: 720000, cost: 435000, profit: 285000, examCount: 4450 },
  { month: '2025-09', revenue: 695000, cost: 428000, profit: 267000, examCount: 4300 },
  { month: '2025-10', revenue: 780000, cost: 445000, profit: 335000, examCount: 4800 },
  { month: '2025-11', revenue: 820000, cost: 460000, profit: 360000, examCount: 5100 },
  { month: '2025-12', revenue: 890000, cost: 485000, profit: 405000, examCount: 5500 },
  { month: '2026-01', revenue: 750000, cost: 440000, profit: 310000, examCount: 4600 },
  { month: '2026-02', revenue: 680000, cost: 420000, profit: 260000, examCount: 4100 },
  { month: '2026-03', revenue: 820000, cost: 465000, profit: 355000, examCount: 5100 },
  { month: '2026-04', revenue: 860000, cost: 475000, profit: 385000, examCount: 5300 },
]

export const revenueService = {
  getSummary: async (period: string): Promise<RevenueSummaryDto> => ({
    period,
    totalRevenue: 860000,
    totalExams: 5300,
    avgRevenuePerExam: 162.3,
    byModality: [
      { modality: 'CT', revenue: 385000, exams: 2500, percentage: 44.8 },
      { modality: 'MRI', revenue: 235000, exams: 850, percentage: 27.3 },
      { modality: 'DSA', revenue: 195000, exams: 150, percentage: 22.7 },
      { modality: 'DR', revenue: 45000, exams: 1800, percentage: 5.2 },
    ],
    byPayer: [
      { payer: '医保(城镇职工)', revenue: 516000, percentage: 60.0 },
      { payer: '医保(城乡居民)', revenue: 172000, percentage: 20.0 },
      { payer: '商业保险', revenue: 98000, percentage: 11.4 },
      { payer: '自费', revenue: 48000, percentage: 5.6 },
      { payer: '公费/其他', revenue: 26000, percentage: 3.0 },
    ],
    byDoctor: [
      { doctorId: 'D001', doctorName: '张伟', revenue: 185000, exams: 1120 },
      { doctorId: 'D002', doctorName: '李娜', revenue: 168000, exams: 980 },
      { doctorId: 'D003', doctorName: '王建国', revenue: 152000, exams: 890 },
      { doctorId: 'D004', doctorName: '刘芳', revenue: 128000, exams: 760 },
      { doctorId: 'D005', doctorName: '陈明', revenue: 115000, exams: 680 },
    ],
  }),

  getTrend: async (months?: number): Promise<RevenueTrendDto[]> => {
    const data = [...MOCK_TREND]
    return months ? data.slice(-months) : data
  },

  getComparison: async (currentLabel: string, previousLabel: string): Promise<RevenueComparisonDto> => {
    const current = MOCK_TREND.find(m => m.month === currentLabel)
    const previous = MOCK_TREND.find(m => m.month === previousLabel)
    const c = current ?? MOCK_TREND[MOCK_TREND.length - 1]!
    const p = previous ?? MOCK_TREND[MOCK_TREND.length - 3]!
    return {
      currentPeriod: { revenue: c.revenue, exams: c.examCount, profit: c.profit },
      previousPeriod: { revenue: p.revenue, exams: p.examCount, profit: p.profit },
      revenueChange: p.revenue ? ((c.revenue - p.revenue) / p.revenue) * 100 : 0,
      examChange: p.examCount ? ((c.examCount - p.examCount) / p.examCount) * 100 : 0,
      profitChange: p.profit ? ((c.profit - p.profit) / p.profit) * 100 : 0,
    }
  },
}
