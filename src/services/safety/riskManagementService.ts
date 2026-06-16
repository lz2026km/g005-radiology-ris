import { api } from '../api/client'

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

export async function getRiskRegister(): Promise<RiskItem[]> {
  const res = await api.get<RiskItem[]>('/safety/risk-items')
  return res.data
}

export async function createRiskItem(risk: Omit<RiskItem, 'id' | 'identifiedAt' | 'rpn' | 'level' | 'status'>): Promise<RiskItem> {
  const rpn = risk.likelihood * risk.severity
  const level = calculateRiskLevel(rpn)
  const res = await api.post<RiskItem>('/safety/risk-items', {
    ...risk,
    riskType: risk.category,
    riskLevel: level,
    rpn,
    identifiedAt: new Date().toISOString(),
    status: 'identified',
  })
  return res.data
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

export async function updateRiskMitigation(
  riskId: string,
  plan: string,
  owner: string,
  deadline: string
): Promise<RiskItem | undefined> {
  const risk = await api.get<RiskItem>(`/safety/risk-items/${riskId}`)
  if (!risk.data) return undefined
  const residualRpn = Math.round((risk.data.likelihood * risk.data.severity) / 2)
  const res = await api.put<RiskItem>(`/safety/risk-items/${riskId}`, {
    mitigationPlan: plan,
    mitigationOwner: owner,
    mitigationDeadline: deadline,
    status: 'mitigating',
    residualRpn,
  })
  return res.data ?? undefined
}
