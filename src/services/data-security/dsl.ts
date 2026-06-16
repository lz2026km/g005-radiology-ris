export type DataClass = 'general' | 'important' | 'core'
export type DataGrade = 'L1' | 'L2' | 'L3' | 'L4'

export interface DataAsset {
  id: string
  name: string
  category: string
  dataClass: DataClass
  dataGrade: DataGrade
  owner: string
  location: string
  retentionPeriod: string
  crossBorder: boolean
  encrypted: boolean
  description: string
}

export interface DataTransferAssessment {
  id: string
  assetId: string
  destinationCountry: string
  purpose: string
  dataVolume: string
  securityMeasures: string[]
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  assessedAt?: string
  expiresAt?: string
}

export interface SecurityIncident {
  id: string
  type: 'breach' | 'leak' | 'loss' | 'unauthorized_access' | 'ransomware'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedData: string[]
  discoveredAt: string
  containedAt?: string
  reportedToAuthorities: boolean
  reportedAt?: string
  status: 'open' | 'investigating' | 'contained' | 'resolved'
}

const assets: DataAsset[] = []
const transferAssessments: DataTransferAssessment[] = []

export function classifyData(name: string, category: string, owner: string): DataAsset {
  const asset: DataAsset = {
    id: crypto.randomUUID(),
    name,
    category,
    dataClass: 'general',
    dataGrade: 'L1',
    owner,
    location: 'domestic',
    retentionPeriod: '5 years',
    crossBorder: false,
    encrypted: true,
    description: '',
  }
  if (category === 'medical_record' || category === 'genetic') {
    asset.dataClass = 'important'
    asset.dataGrade = 'L3'
  }
  if (category === 'population_health' || category === 'national_health_survey') {
    asset.dataClass = 'core'
    asset.dataGrade = 'L4'
  }
  assets.push(asset)
  return asset
}

export function getDataAssets(): DataAsset[] {
  return [...assets]
}

export function createTransferAssessment(assessment: Omit<DataTransferAssessment, 'id' | 'status'>): DataTransferAssessment {
  const record: DataTransferAssessment = { id: crypto.randomUUID(), status: 'draft', ...assessment }
  transferAssessments.push(record)
  return record
}

export function getTransferAssessments(): DataTransferAssessment[] {
  return [...transferAssessments]
}

export function reportSecurityIncident(incident: Omit<SecurityIncident, 'id' | 'discoveredAt' | 'status'>): SecurityIncident {
  return { id: crypto.randomUUID(), discoveredAt: new Date().toISOString(), status: 'open', ...incident }
}

export function conductDsia(assetId: string): { riskLevel: 'low' | 'medium' | 'high'; mitigationMeasures: string[] } {
  return {
    riskLevel: 'medium',
    mitigationMeasures: [
      'Encrypt data at rest and in transit',
      'Implement access control based on need-to-know',
      'Regular security audit and monitoring',
    ],
  }
}

export function getDSLComplianceStatus(): { totalAssets: number; importantCount: number; coreCount: number; crossBorderCount: number; openIncidents: number } {
  return {
    totalAssets: assets.length,
    importantCount: assets.filter(a => a.dataClass === 'important').length,
    coreCount: assets.filter(a => a.dataClass === 'core').length,
    crossBorderCount: assets.filter(a => a.crossBorder).length,
    openIncidents: 0,
  }
}
