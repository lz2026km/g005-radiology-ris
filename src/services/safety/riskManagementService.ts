export type RiskLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high'

export interface RiskMatrix {
  likelihood: number
  severity: number
  rpn: number
  level: RiskLevel
}

export interface FmeaEntry {
  processStep: string
  failureMode: string
  failureEffect: string
  failureCause: string
  currentControls: string[]
  severity: number
  occurrence: number
  detection: number
  rpn: number
  recommendedActions: string[]
  responsiblePerson: string
  targetDate: string
  actionStatus: 'pending' | 'in-progress' | 'completed'
  postActionRpn?: number
}

export interface RiskItem {
  id: string
  title: string
  description: string
  category: 'clinical' | 'operational' | 'regulatory' | 'financial' | 'it-security'
  likelihood: number
  severity: number
  rpn: number
  level: RiskLevel
  status: 'identified' | 'mitigating' | 'monitoring' | 'closed'
  identifiedBy: string
  identifiedAt: string
  mitigationPlan?: string
  mitigationOwner?: string
  mitigationDeadline?: string
  residualRpn?: number
  closedAt?: string
  closedBy?: string
}

const MOCK_RISKS: RiskItem[] = [
  { id: 'RISK-001', title: '对比剂外渗风险', description: '高压注射器使用中发生对比剂外渗导致软组织损伤', category: 'clinical', likelihood: 4, severity: 3, rpn: 12, level: 'high', status: 'mitigating', identifiedBy: '质控办', identifiedAt: '2025-04-15', mitigationPlan: '引入智能外渗检测系统，培训规范操作流程', mitigationOwner: '护理部', mitigationDeadline: '2025-07-30', residualRpn: 6 },
  { id: 'RISK-002', title: '辐射剂量超标风险', description: 'CT扫描参数设置错误导致患者接受过量辐射', category: 'clinical', likelihood: 3, severity: 5, rpn: 15, level: 'very-high', status: 'mitigating', identifiedBy: '设备科', identifiedAt: '2025-04-20', mitigationPlan: '部署剂量自动监控报警系统，制定参数复核流程', mitigationOwner: '影像科', mitigationDeadline: '2025-08-15', residualRpn: 6 },
  { id: 'RISK-003', title: '患者身份识别错误', description: '检查过程中张冠李戴导致医疗差错', category: 'clinical', likelihood: 4, severity: 4, rpn: 16, level: 'very-high', status: 'identifying', identifiedBy: '质控办', identifiedAt: '2025-05-01' },
  { id: 'RISK-004', title: '信息系统故障', description: 'RIS/PACS系统宕机导致检查中断或数据丢失', category: 'it-security', likelihood: 2, severity: 5, rpn: 10, level: 'high', status: 'mitigating', identifiedBy: '信息科', identifiedAt: '2025-05-10', mitigationPlan: '部署灾备系统，制定应急切换预案', mitigationOwner: '信息科', mitigationDeadline: '2025-09-30', residualRpn: 4 },
  { id: 'RISK-005', title: '检查预约积压', description: '患者等待时间过长导致投诉和病情延误', category: 'operational', likelihood: 3, severity: 3, rpn: 9, level: 'medium', status: 'monitoring', identifiedBy: '门诊部', identifiedAt: '2025-05-15', mitigationPlan: '弹性排班，开通加班通道', mitigationOwner: '科室主任', mitigationDeadline: '2025-06-30', residualRpn: 6 },
  { id: 'RISK-006', title: '设备突发故障', description: '核心设备故障导致检查停摆', category: 'operational', likelihood: 3, severity: 4, rpn: 12, level: 'high', status: 'monitoring', identifiedBy: '设备科', identifiedAt: '2025-05-20', mitigationPlan: '签订维保合同，储备备机备件', mitigationOwner: '设备科', mitigationDeadline: '2025-07-15', residualRpn: 8 },
]

export function getRiskRegister(): RiskItem[] {
  return [...MOCK_RISKS]
}

export function createRiskItem(risk: Omit<RiskItem, 'id' | 'identifiedAt' | 'rpn' | 'level' | 'status'>): RiskItem {
  const rpn = risk.likelihood * risk.severity
  const level = calculateRiskLevel(rpn)
  const newRisk: RiskItem = {
    ...risk,
    id: `RISK-${String(MOCK_RISKS.length + 1).padStart(3, '0')}`,
    identifiedAt: new Date().toISOString().slice(0, 10),
    rpn,
    level,
    status: 'identified',
  }
  MOCK_RISKS.unshift(newRisk)
  return newRisk
}

export function calculateRpn(likelihood: number, severity: number): number {
  return likelihood * severity
}

export function calculateRiskLevel(rpn: number): RiskLevel {
  if (rpn >= 15) return 'very-high'
  if (rpn >= 10) return 'high'
  if (rpn >= 6) return 'medium'
  if (rpn >= 3) return 'low'
  return 'very-low'
}

export function performFmea(entries: Omit<FmeaEntry, 'rpn'>[]): FmeaEntry[] {
  return entries.map(e => ({
    ...e,
    rpn: e.severity * e.occurrence * e.detection,
  }))
}

export function updateRiskMitigation(
  riskId: string,
  plan: string,
  owner: string,
  deadline: string
): RiskItem | undefined {
  const risk = MOCK_RISKS.find(r => r.id === riskId)
  if (!risk) return undefined
  risk.mitigationPlan = plan
  risk.mitigationOwner = owner
  risk.mitigationDeadline = deadline
  risk.status = 'mitigating'
  risk.residualRpn = Math.round((risk.likelihood * risk.severity) / 2)
  return risk
}
