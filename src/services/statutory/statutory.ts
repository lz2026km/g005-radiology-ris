export type StatutoryReportType =
  | 'nhsa_drg_dip'
  | 'nhc_quality'
  | 'notifiable_disease'
  | 'adverse_drug_reaction'
  | 'medical_device_adverse'
  | 'radiation_dose'
  | 'hqms'
  | 'medical_dispute'
  | 'infectious_outbreak'
  | 'other'

export interface StatutoryReport {
  id: string
  type: StatutoryReportType
  title: string
  authority: string
  department: string
  submissionDate: string
  dueDate: string
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'amendment_requested'
  dataPeriod: { start: string; end: string }
  data: Record<string, any>
  submittedBy?: string
  submittedAt?: string
  rejectionReason?: string
  attachmentUrls: string[]
}

const reports: StatutoryReport[] = []

export function createStatutoryReport(report: Omit<StatutoryReport, 'id' | 'status'>): StatutoryReport {
  const record: StatutoryReport = { id: crypto.randomUUID(), status: 'draft', ...report }
  reports.push(record)
  return record
}

export function getStatutoryReports(type?: StatutoryReportType): StatutoryReport[] {
  return type ? reports.filter(r => r.type === type) : [...reports]
}

export function getStatutoryReport(id: string): StatutoryReport | undefined {
  return reports.find(r => r.id === id)
}

export function submitStatutoryReport(id: string, submittedBy: string): boolean {
  const report = reports.find(r => r.id === id)
  if (!report || report.status !== 'draft') return false
  report.status = 'submitted'
  report.submittedBy = submittedBy
  report.submittedAt = new Date().toISOString()
  return true
}

export function getPendingReports(): StatutoryReport[] {
  return reports.filter(r => r.status === 'draft')
}

export function generateNhsaDrgDipReport(dataPeriod: { start: string; end: string }): StatutoryReport {
  return createStatutoryReport({
    type: 'nhsa_drg_dip',
    title: `DRG/DIP Quality Report ${dataPeriod.start}~${dataPeriod.end}`,
    authority: '国家医疗保障局',
    department: '医保办',
    submissionDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    dataPeriod,
    data: { totalCases: 0, drgGroupCount: 0, dipScore: 0 },
    attachmentUrls: [],
  })
}

export function generateNhcQualityReport(dataPeriod: { start: string; end: string }): StatutoryReport {
  return createStatutoryReport({
    type: 'nhc_quality',
    title: `医疗质量控制指标 ${dataPeriod.start}~${dataPeriod.end}`,
    authority: '国家卫生健康委员会',
    department: '质控办',
    submissionDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    dataPeriod,
    data: { admissionRate: 0, readmissionRate: 0, mortalityRate: 0, infectionRate: 0 },
    attachmentUrls: [],
  })
}

export function generateRadiationDoseReport(dataPeriod: { start: string; end: string }): StatutoryReport {
  return createStatutoryReport({
    type: 'radiation_dose',
    title: `放射剂量监测报告 ${dataPeriod.start}~${dataPeriod.end}`,
    authority: '国家卫生健康委员会',
    department: '放射科',
    submissionDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    dataPeriod,
    data: { ctDoseCount: 0, meanDlp: 0, meanCtdi: 0, exceedCount: 0 },
    attachmentUrls: [],
  })
}

export function getStatutoryCompliance(): { totalDue: number; submitted: number; pending: number; overdue: number } {
  return {
    totalDue: reports.length,
    submitted: reports.filter(r => r.status === 'submitted' || r.status === 'accepted').length,
    pending: reports.filter(r => r.status === 'draft').length,
    overdue: reports.filter(r => r.status === 'draft' && new Date(r.dueDate) < new Date()).length,
  }
}
