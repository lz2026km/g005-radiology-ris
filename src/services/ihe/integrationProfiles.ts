export type IheProfileId = 'XDS.b' | 'XCA' | 'PIX' | 'PDQ' | 'ATNA' | 'CT' | 'SWF' | 'PIR' | 'CPI'

export interface IheProfile {
  id: IheProfileId
  name: string
  description: string
  enabled: boolean
  actors: string[]
  transactions: string[]
  config: Record<string, string>
}

export interface IheEndpoint {
  id: string
  profileId: IheProfileId
  name: string
  url: string
  method: 'SOAP' | 'REST' | 'FHIR'
  authType: 'none' | 'basic' | 'token' | 'certificate'
  enabled: boolean
}

export interface IheAuditRecord {
  id: string
  profileId: IheProfileId
  eventType: string
  participant: string
  resourceId?: string
  outcome: 'success' | 'failure' | 'warning'
  timestamp: string
  detail: string
}

const PROFILES: Record<IheProfileId, IheProfile> = {
  'XDS.b': {
    id: 'XDS.b', name: 'Cross-Enterprise Document Sharing (b)', description: '跨企业文档共享b版本',
    enabled: false, actors: ['Document Source', 'Document Consumer', 'Repository', 'Registry'],
    transactions: ['Provide & Register', 'Query Registry', 'Retrieve Document'], config: {},
  },
  XCA: {
    id: 'XCA', name: 'Cross-Community Access', description: '跨社区文档访问',
    enabled: false, actors: ['Initiating Gateway', 'Responding Gateway'],
    transactions: ['Cross-Community Query', 'Cross-Community Retrieve'], config: {},
  },
  PIX: {
    id: 'PIX', name: 'Patient Identity Cross-Reference', description: '患者身份交叉引用',
    enabled: true, actors: ['PIX Manager', 'PIX Consumer', 'Identity Source'],
    transactions: ['Patient Identity Feed', 'PIX Query'], config: { domain: 'LOCAL' },
  },
  PDQ: {
    id: 'PDQ', name: 'Patient Demographics Query', description: '患者人口统计学查询',
    enabled: true, actors: ['PDQ Supplier', 'PDQ Consumer'],
    transactions: ['Patient Demographics Query'], config: { maxResults: '100' },
  },
  ATNA: {
    id: 'ATNA', name: 'Audit Trail and Node Authentication', description: '审计追踪与节点认证',
    enabled: true, actors: ['Secure Node', 'Secure Application', 'Audit Repository'],
    transactions: ['Record Audit Event', 'Node Authentication'], config: { auditLevel: 'detailed' },
  },
  CT: {
    id: 'CT', name: 'Consistent Time', description: '时间同步',
    enabled: true, actors: ['Time Client', 'Time Server'],
    transactions: ['Time Synchronization'], config: { ntpServer: 'pool.ntp.org' },
  },
  SWF: {
    id: 'SWF', name: 'Scheduled Workflow', description: '调度工作流',
    enabled: true, actors: ['Order Filler', 'Order Placer', 'Image Manager', 'Image Archive', 'Acquisition Modality'],
    transactions: ['Modality Worklist', 'Storage Commitment', 'MPPS'], config: {},
  },
  PIR: {
    id: 'PIR', name: 'Patient Information Reconciliation', description: '患者信息核对',
    enabled: true, actors: ['Image Manager', 'Image Archive', 'Report Repository'],
    transactions: ['Query Images', 'Retrieve Images', 'Query Reports'], config: {},
  },
  CPI: {
    id: 'CPI', name: 'Consistent Presentation of Images', description: '图像一致性显示',
    enabled: true, actors: ['Image Display', 'Grayscale Image Display'],
    transactions: ['Presentation State Storage'], config: {},
  },
}

const auditRecords: IheAuditRecord[] = []

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getProfiles(): IheProfile[] {
  return Object.values(PROFILES)
}

export function getProfile(id: IheProfileId): IheProfile | undefined {
  return PROFILES[id]
}

export function enableProfile(id: IheProfileId): boolean {
  if (!PROFILES[id]) return false
  PROFILES[id].enabled = true
  return true
}

export function disableProfile(id: IheProfileId): boolean {
  if (!PROFILES[id]) return false
  PROFILES[id].enabled = false
  return true
}

export function updateProfileConfig(id: IheProfileId, config: Record<string, string>): boolean {
  if (!PROFILES[id]) return false
  Object.assign(PROFILES[id].config, config)
  return true
}

export function getEnabledProfiles(): IheProfile[] {
  return Object.values(PROFILES).filter(p => p.enabled)
}

export function sendIheAuditEvent(profileId: IheProfileId, eventType: string, participant: string, outcome: IheAuditRecord['outcome'], detail: string, resourceId?: string): IheAuditRecord {
  const record: IheAuditRecord = {
    id: generateId(), profileId, eventType, participant, resourceId,
    outcome, timestamp: new Date().toISOString(), detail,
  }
  auditRecords.push(record)
  return record
}

export function getIheAuditLog(profileId?: IheProfileId): IheAuditRecord[] {
  return profileId ? auditRecords.filter(r => r.profileId === profileId) : [...auditRecords]
}

export function executeIheTransaction(profileId: IheProfileId, transaction: string): Promise<{ success: boolean; message: string }> {
  const profile = PROFILES[profileId]
  if (!profile) return Promise.resolve({ success: false, message: 'Profile not found' })
  if (!profile.enabled) return Promise.resolve({ success: false, message: `${profile.name} profile is disabled` })
  sendIheAuditEvent(profileId, transaction, 'system', 'success', `Executed ${transaction} on ${profile.name}`)
  return Promise.resolve({ success: true, message: `${transaction} executed successfully on ${profile.name}` })
}
