import { api } from '../api/client'

export type RcaStatus = 'open' | 'analyzing' | 'capa-planned' | 'implementing' | 'verified' | 'closed'

export interface FishboneCategory {
  category: string
  causes: string[]
  subCauses: { cause: string; details: string[] }[]
}

export interface FiveWhysAnalysis {
  problem: string
  whys: { level: number; question: string; answer: string }[]
  rootCause: string
}

export interface CapaPlan {
  id: string
  correctiveAction: string
  preventiveAction: string
  responsiblePerson: string
  deadline: string
  implementationStatus: 'pending' | 'in-progress' | 'completed'
  verificationMethod: string
  verifiedBy?: string
  verifiedAt?: string
  effectivenessRating?: number
}

export interface RcaInvestigation {
  id: string
  eventId: string
  eventTitle: string
  description: string
  dateOccurred: string
  dateInvestigationStarted: string
  status: RcaStatus
  teamMembers: string[]
  fishboneData: FishboneCategory[]
  fiveWhys: FiveWhysAnalysis[]
  rootCauses: string[]
  capaPlans: CapaPlan[]
  conclusion?: string
  lessonsLearned?: string
  closedAt?: string
  closedBy?: string
}

export async function createRcaInvestigation(investigation: Omit<RcaInvestigation, 'id' | 'dateInvestigationStarted' | 'status'>): Promise<RcaInvestigation> {
  const res = await api.post<RcaInvestigation>('/safety/rca-investigations', {
    ...investigation,
    dateInvestigationStarted: new Date().toISOString(),
    capaStatus: 'open',
  })
  return res.data
}

export async function getRcaInvestigations(filters?: { status?: RcaStatus }): Promise<RcaInvestigation[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('capaStatus', filters.status)
  const qs = params.toString()
  const res = await api.get<RcaInvestigation[]>(`/safety/rca-investigations${qs ? '?' + qs : ''}`)
  return res.data
}

export async function performFiveWhys(rcaId: string, analysis: FiveWhysAnalysis): Promise<RcaInvestigation | undefined> {
  const rca = await api.get<RcaInvestigation>(`/safety/rca-investigations/${rcaId}`)
  if (!rca.data) return undefined
  const fiveWhys = [...rca.data.fiveWhys, analysis]
  const status = rca.data.status === 'open' ? 'analyzing' : rca.data.status
  const res = await api.put<RcaInvestigation>(`/safety/rca-investigations/${rcaId}`, { fiveWhys, capaStatus: status })
  return res.data ?? undefined
}

export async function generateFishboneData(rcaId: string, categories: FishboneCategory[]): Promise<RcaInvestigation | undefined> {
  const res = await api.put<RcaInvestigation>(`/safety/rca-investigations/${rcaId}`, { fishboneData: categories })
  return res.data ?? undefined
}

export async function createCapaPlan(rcaId: string, plan: Omit<CapaPlan, 'id'>): Promise<RcaInvestigation | undefined> {
  const rca = await api.get<RcaInvestigation>(`/safety/rca-investigations/${rcaId}`)
  if (!rca.data) return undefined
  const newPlan: CapaPlan = { ...plan, id: `CAPA-${String(rca.data.capaPlans.length + 1).padStart(3, '0')}` }
  const capaPlans = [...rca.data.capaPlans, newPlan]
  const res = await api.put<RcaInvestigation>(`/safety/rca-investigations/${rcaId}`, { capaPlans, capaStatus: 'capa-planned' })
  return res.data ?? undefined
}

export async function closeRca(rcaId: string, closedBy: string, conclusion: string, lessonsLearned: string): Promise<RcaInvestigation | undefined> {
  const res = await api.put<RcaInvestigation>(`/safety/rca-investigations/${rcaId}`, {
    capaStatus: 'closed',
    closedBy,
    closedAt: new Date().toISOString(),
    conclusion,
    lessonsLearned,
  })
  return res.data ?? undefined
}
