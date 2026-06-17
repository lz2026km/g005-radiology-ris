export interface CostCategorySummary {
  category: string
  amount: number
  percentage: number
  budget: number
  variance: number
}

export interface CostSummaryDto {
  period: string
  totalCost: number
  totalBudget: number
  variance: number
  byCategory: CostCategorySummary[]
}

export interface CostPerExamDto {
  modality: string
  totalCost: number
  examCount: number
  costPerExam: number
  revenuePerExam: number
  profitPerExam: number
  profitRate: number
}

export interface BudgetVarianceDto {
  month: string
  budget: number
  actual: number
  variance: number
  varianceRate: number
}

export const costAccountingService = {
  getCostSummary: async (period: string): Promise<CostSummaryDto> => ({
    period,
    totalCost: 475000,
    totalBudget: 450000,
    variance: 25000,
    byCategory: [
      { category: '人力成本', amount: 158000, percentage: 33.3, budget: 152000, variance: 6000 },
      { category: '耗材成本', amount: 142000, percentage: 29.9, budget: 135000, variance: 7000 },
      { category: '设备折旧', amount: 85000, percentage: 17.9, budget: 85000, variance: 0 },
      { category: '管理费用', amount: 52000, percentage: 10.9, budget: 48000, variance: 4000 },
      { category: '其他费用', amount: 38000, percentage: 8.0, budget: 30000, variance: 8000 },
    ],
  }),

  getCostPerExam: async (): Promise<CostPerExamDto[]> => [
    { modality: 'CT', totalCost: 210000, examCount: 2500, costPerExam: 84, revenuePerExam: 154, profitPerExam: 70, profitRate: 45.5 },
    { modality: 'MRI', totalCost: 135000, examCount: 850, costPerExam: 158.8, revenuePerExam: 276.5, profitPerExam: 117.7, profitRate: 42.6 },
    { modality: 'DSA', totalCost: 95000, examCount: 150, costPerExam: 633.3, revenuePerExam: 1300, profitPerExam: 666.7, profitRate: 51.3 },
    { modality: 'DR', totalCost: 35000, examCount: 1800, costPerExam: 19.4, revenuePerExam: 25, profitPerExam: 5.6, profitRate: 22.4 },
  ],

  getBudgetVariance: async (): Promise<BudgetVarianceDto[]> => [
    { month: '2026-01', budget: 440000, actual: 418000, variance: -22000, varianceRate: -5.0 },
    { month: '2026-02', budget: 440000, actual: 435000, variance: -5000, varianceRate: -1.1 },
    { month: '2026-03', budget: 450000, actual: 465000, variance: 15000, varianceRate: 3.3 },
    { month: '2026-04', budget: 450000, actual: 475000, variance: 25000, varianceRate: 5.6 },
  ],
}
