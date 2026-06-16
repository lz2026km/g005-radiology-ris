export interface RegionalStats {
  totalInstitutions: number
  totalPatients: number
  totalStudies: number
  totalExams: number
  modalityDistribution: Record<string, number>
  examTrend: Array<{ month: string; count: number }>
  institutionWorkload: Array<{ institutionId: string; institutionName: string; examCount: number }>
}

export interface RegionalReport {
  id: string
  title: string
  type: '疾病分布' | '设备利用率' | '检查量统计' | '质量分析' | '辐射剂量'
  region: string
  startDate: string
  endDate: string
  createdAt: string
  summary: string
  dataUrl?: string
}

export interface PopulationHealthMetric {
  metric: string
  value: number
  unit: string
  period: string
  trend: 'up' | 'down' | 'stable'
}

const MOCK_STATS: RegionalStats = {
  totalInstitutions: 12,
  totalPatients: 158000,
  totalStudies: 425000,
  totalExams: 398000,
  modalityDistribution: { CT: 85000, MR: 42000, X光: 156000, 超声: 98000, PETCT: 17000 },
  examTrend: [
    { month: '2026-01', count: 32000 },
    { month: '2026-02', count: 28000 },
    { month: '2026-03', count: 35000 },
    { month: '2026-04', count: 34000 },
    { month: '2026-05', count: 37000 },
  ],
  institutionWorkload: [
    { institutionId: 'I001', institutionName: '中山大学附属第一医院', examCount: 85000 },
    { institutionId: 'I002', institutionName: '广东省人民医院', examCount: 72000 },
    { institutionId: 'I003', institutionName: '广州市第一人民医院', examCount: 55000 },
  ],
}

const MOCK_REPORTS: RegionalReport[] = [
  { id: 'R001', title: '2026年Q2广州市区疾病分布报告', type: '疾病分布', region: '广州市', startDate: '2026-04-01', endDate: '2026-06-30', createdAt: '2026-06-15', summary: '呼吸系统疾病占比最高，达到32.5%', dataUrl: '/reports/regional/disease-q2-2026.pdf' },
  { id: 'R002', title: '2026年5月设备利用率分析', type: '设备利用率', region: '广州市越秀区', startDate: '2026-05-01', endDate: '2026-05-31', createdAt: '2026-06-05', summary: 'CT设备利用率78.5%，MR设备利用率65.2%' },
]

const POPULATION_METRICS: PopulationHealthMetric[] = [
  { metric: '肺癌筛查覆盖率', value: 68.5, unit: '%', period: '2026-Q1', trend: 'up' },
  { metric: '乳腺癌筛查覆盖率', value: 55.2, unit: '%', period: '2026-Q1', trend: 'up' },
  { metric: '平均等待时间', value: 3.5, unit: '天', period: '2026-05', trend: 'down' },
  { metric: '重复检查率', value: 12.3, unit: '%', period: '2026-05', trend: 'down' },
]

export function getRegionalStats(): RegionalStats {
  return MOCK_STATS
}

export function getRegionalReports(type?: RegionalReport['type']): RegionalReport[] {
  return type ? MOCK_REPORTS.filter(r => r.type === type) : [...MOCK_REPORTS]
}

export function getPopulationHealthMetrics(): PopulationHealthMetric[] {
  return [...POPULATION_METRICS]
}

export function getModalityComparison() {
  return {
    labels: ['CT', 'MR', 'X光', '超声', 'PET-CT'],
    currentPeriod: [85000, 42000, 156000, 98000, 17000],
    previousPeriod: [78000, 39000, 145000, 92000, 15500],
  }
}

export function getRegionalHeatmapData() {
  return [
    { region: '越秀区', value: 125000 },
    { region: '天河区', value: 98000 },
    { region: '海珠区', value: 87000 },
    { region: '荔湾区', value: 56000 },
    { region: '白云区', value: 112000 },
    { region: '黄埔区', value: 45000 },
    { region: '番禺区', value: 78000 },
    { region: '花都区', value: 35000 },
  ]
}
