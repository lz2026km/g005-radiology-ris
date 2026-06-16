export interface DoseRecord {
  id: string
  examId: string
  patientId: string
  patientName: string
  modality: 'CT' | 'MR' | 'DR' | 'DSA' | 'MG'
  procedureName: string
  ctDoseIndex?: number
  dlp?: number
  kap?: number
  fluoroscopyTime?: number
  numberofFrames?: number
  examDate: string
  technologistId: string
  deviceId: string
  deviceName: string
  notes?: string
}

export interface DoseAlertConfig {
  id: string
  modality: string
  procedureName: string
  alertType: 'ctdi' | 'dlp' | 'kap' | 'fluoroscopy-time'
  thresholdValue: number
  thresholdUnit: string
  enabled: boolean
  notificationTargets: string[]
  escalateAfterMinutes: number
}

export interface AlaraComplianceStatus {
  modality: string
  period: string
  totalExams: number
  belowDiagnosticReference: number
  complianceRate: number
  avgDose: number
  referenceLevel: number
  status: 'compliant' | 'warning' | 'non-compliant'
}

export interface PatientCumulativeDose {
  patientId: string
  patientName: string
  totalDlp: number
  totalCtDoseIndex: number
  totalKap: number
  examCount: number
  timeframeDays: number
  lastExamDate: string
  alertTriggered: boolean
}

const MOCK_DOSE_RECORDS: DoseRecord[] = [
  { id: 'DR-001', examId: 'CT20250601-01', patientId: 'P2025001', patientName: '李明', modality: 'CT', procedureName: '头部CT平扫', ctDoseIndex: 45.2, dlp: 680, examDate: '2025-06-01', technologistId: 'T001', deviceId: 'DEV-CT-01', deviceName: 'GE Revolution CT' },
  { id: 'DR-002', examId: 'CT20250601-02', patientId: 'P2025002', patientName: '王芳', modality: 'CT', procedureName: '腹部CT增强', ctDoseIndex: 18.5, dlp: 920, examDate: '2025-06-01', technologistId: 'T002', deviceId: 'DEV-CT-01', deviceName: 'GE Revolution CT' },
  { id: 'DR-003', examId: 'XR20250601-03', patientId: 'P2025003', patientName: '张强', modality: 'DR', procedureName: '胸部正位', kap: 0.35, examDate: '2025-06-01', technologistId: 'T003', deviceId: 'DEV-XR-01', deviceName: 'Siemens Ysio' },
  { id: 'DR-004', examId: 'DSA20250602-01', patientId: 'P2025004', patientName: '赵丽', modality: 'DSA', procedureName: '冠脉造影', kap: 45.2, fluoroscopyTime: 12.5, numberofFrames: 380, examDate: '2025-06-02', technologistId: 'T004', deviceId: 'DEV-DSA-01', deviceName: 'Philips Azurion' },
  { id: 'DR-005', examId: 'CT20250602-02', patientId: 'P2025005', patientName: '刘伟', modality: 'CT', procedureName: '胸部CT平扫', ctDoseIndex: 12.8, dlp: 450, examDate: '2025-06-02', technologistId: 'T001', deviceId: 'DEV-CT-02', deviceName: 'Siemens SOMATOM Force' },
]

const MOCK_DOSE_ALERTS: DoseAlertConfig[] = [
  { id: 'DA-001', modality: 'CT', procedureName: '头部CT平扫', alertType: 'dlp', thresholdValue: 1000, thresholdUnit: 'mGy·cm', enabled: true, notificationTargets: ['主任', '技师组长'], escalateAfterMinutes: 30 },
  { id: 'DA-002', modality: 'CT', procedureName: '腹部CT增强', alertType: 'dlp', thresholdValue: 1500, thresholdUnit: 'mGy·cm', enabled: true, notificationTargets: ['主任', '技师组长', '设备科'], escalateAfterMinutes: 15 },
  { id: 'DA-003', modality: 'CT', procedureName: '胸部CT平扫', alertType: 'ctdi', thresholdValue: 20, thresholdUnit: 'mGy', enabled: true, notificationTargets: ['技师组长'], escalateAfterMinutes: 30 },
  { id: 'DA-004', modality: 'DSA', procedureName: '冠脉造影', alertType: 'kap', thresholdValue: 100, thresholdUnit: 'Gy·cm²', enabled: false, notificationTargets: ['主任'], escalateAfterMinutes: 60 },
]

export function getDoseRecords(filters?: { modality?: string; patientId?: string; startDate?: string; endDate?: string }): DoseRecord[] {
  let result = [...MOCK_DOSE_RECORDS]
  if (filters?.modality) result = result.filter(r => r.modality === filters.modality)
  if (filters?.patientId) result = result.filter(r => r.patientId === filters.patientId)
  if (filters?.startDate) result = result.filter(r => r.examDate >= filters.startDate!)
  if (filters?.endDate) result = result.filter(r => r.examDate <= filters.endDate!)
  return result
}

export function configureDoseAlerts(config: Omit<DoseAlertConfig, 'id'>): DoseAlertConfig {
  const newConfig: DoseAlertConfig = { ...config, id: `DA-${String(MOCK_DOSE_ALERTS.length + 1).padStart(3, '0')}` }
  MOCK_DOSE_ALERTS.push(newConfig)
  return newConfig
}

export function getDoseAlertConfigs(): DoseAlertConfig[] {
  return [...MOCK_DOSE_ALERTS]
}

export function getPatientCumulativeDose(patientId: string): PatientCumulativeDose {
  const records = MOCK_DOSE_RECORDS.filter(r => r.patientId === patientId)
  const totalDlp = records.reduce((sum, r) => sum + (r.dlp ?? 0), 0)
  const totalCtDoseIndex = records.reduce((sum, r) => sum + (r.ctDoseIndex ?? 0), 0)
  const totalKap = records.reduce((sum, r) => sum + (r.kap ?? 0), 0)
  return {
    patientId,
    patientName: records[0]?.patientName ?? 'Unknown',
    totalDlp,
    totalCtDoseIndex,
    totalKap,
    examCount: records.length,
    timeframeDays: 365,
    lastExamDate: records.length > 0 ? records[records.length - 1].examDate : '',
    alertTriggered: totalDlp > 3000,
  }
}

export function checkAlaraCompliance(): AlaraComplianceStatus[] {
  return [
    { modality: 'CT', period: '2025-05', totalExams: 320, belowDiagnosticReference: 298, complianceRate: 93.1, avgDose: 580, referenceLevel: 750, status: 'compliant' },
    { modality: 'DR', period: '2025-05', totalExams: 580, belowDiagnosticReference: 562, complianceRate: 96.9, avgDose: 0.28, referenceLevel: 0.5, status: 'compliant' },
    { modality: 'DSA', period: '2025-05', totalExams: 45, belowDiagnosticReference: 38, complianceRate: 84.4, avgDose: 52.3, referenceLevel: 60, status: 'warning' },
    { modality: 'MG', period: '2025-05', totalExams: 120, belowDiagnosticReference: 115, complianceRate: 95.8, avgDose: 1.8, referenceLevel: 2.5, status: 'compliant' },
  ]
}

export function getProtocolOptimizationSuggestions(): { modality: string; procedureName: string; currentAvgDose: number; recommendedTarget: number; estimatedReduction: number; actionItems: string[] }[] {
  return [
    { modality: 'CT', procedureName: '腹部CT增强', currentAvgDose: 920, recommendedTarget: 750, estimatedReduction: 18.5, actionItems: ['启用迭代重建算法', '优化扫描期相', '降低管电流至Smart mA范围'] },
    { modality: 'CT', procedureName: '头部CT平扫', currentAvgDose: 680, recommendedTarget: 600, estimatedReduction: 11.8, actionItems: ['调整FOV至最小必要范围', '使用自动管电压选择'] },
    { modality: 'DSA', procedureName: '冠脉造影', currentAvgDose: 52.3, recommendedTarget: 45, estimatedReduction: 14.0, actionItems: ['优化透视脉冲频率', '使用路图引导减少曝光帧数', '启用剂量报告自动记录'] },
  ]
}
