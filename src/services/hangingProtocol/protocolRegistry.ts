export interface ProtocolMatchCriteria {
  modality?: string
  bodyPart?: string
  clinicalIndication?: string
  priorStudies?: number
  manufacturer?: string
  institution?: string
}

export interface ProtocolView {
  id: string
  layout: '1x1' | '2x1' | '1x2' | '2x2' | '3x3' | 'custom'
  seriesMatcher?: Partial<ProtocolMatchCriteria>
  initialWw?: number
  initialWl?: number
  zoom?: number
  pan?: { x: number; y: number }
}

export interface HangingProtocol {
  id: string
  name: string
  description: string
  builtin?: boolean
  views: ProtocolView[]
  matchCriteria: ProtocolMatchCriteria
  priority: number
  category?: string
}

export type ProtocolMatchResult = {
  protocol: HangingProtocol
  score: number
  matchedCriteria: string[]
}

const BUILTIN_PROTOCOLS: HangingProtocol[] = [
  {
    id: 'ct-chest-default',
    name: 'CT 胸部默认',
    description: 'CT Chest 1×1 纵隔窗 + 肺窗',
    builtin: true,
    priority: 100,
    category: 'chest',
    matchCriteria: { modality: 'CT', bodyPart: 'CHEST' },
    views: [
      { id: 'v1', layout: '1x1', initialWw: 400, initialWl: 40 },
    ],
  },
  {
    id: 'mr-brain-default',
    name: 'MR 头颅默认',
    description: 'MR Brain 1×1 T1/T2 脑窗',
    builtin: true,
    priority: 100,
    category: 'neuro',
    matchCriteria: { modality: 'MR', bodyPart: 'HEAD' },
    views: [
      { id: 'v1', layout: '1x1', initialWw: 80, initialWl: 40 },
    ],
  },
  {
    id: 'cta-coronary',
    name: '冠脉 CTA',
    description: '冠脉 CTA 2×1 矢状/冠状 + 血管窗',
    builtin: true,
    priority: 200,
    category: 'cardiac',
    matchCriteria: { modality: 'CT', bodyPart: 'CHEST', clinicalIndication: 'coronary' },
    views: [
      { id: 'v1', layout: '2x1', initialWw: 300, initialWl: 100 },
    ],
  },
  {
    id: 'pet-ct-fusion',
    name: 'PET-CT 融合',
    description: 'PET/CT 融合 + 单独 PET + 单独 CT',
    builtin: true,
    priority: 150,
    category: 'fusion',
    matchCriteria: { modality: 'PET-CT' },
    views: [
      { id: 'v1', layout: '2x2', initialWw: 400, initialWl: 40 },
      { id: 'v2', layout: '2x2', initialWw: 300, initialWl: 100 },
    ],
  },
  {
    id: 'msk-bone-default',
    name: '骨肌关节',
    description: '骨肌 2×1 骨窗',
    builtin: true,
    priority: 150,
    category: 'msk',
    matchCriteria: { modality: 'CT', bodyPart: 'EXTREMITY' },
    views: [
      { id: 'v1', layout: '2x1', initialWw: 2000, initialWl: 500 },
    ],
  },
]

let customProtocols: HangingProtocol[] = []

export function getRegistry(): HangingProtocol[] {
  return [...BUILTIN_PROTOCOLS, ...customProtocols]
}

export function addProtocol(protocol: HangingProtocol): void {
  customProtocols.push(protocol)
}

export function removeProtocol(id: string): void {
  customProtocols = customProtocols.filter(p => p.id !== id)
}

export function updateProtocol(id: string, updates: Partial<HangingProtocol>): void {
  const idx = customProtocols.findIndex(p => p.id === id)
  if (idx >= 0) customProtocols[idx] = { ...customProtocols[idx], ...updates }
}

export function matchProtocols(criteria: ProtocolMatchCriteria): ProtocolMatchResult[] {
  const all = getRegistry()
  const results: ProtocolMatchResult[] = all.map(protocol => {
    let score = 0
    const matchedCriteria: string[] = []
    const c = protocol.matchCriteria

    if (c.modality && c.modality === criteria.modality) {
      score += 30
      matchedCriteria.push('modality')
    }
    if (c.bodyPart && c.bodyPart === criteria.bodyPart) {
      score += 25
      matchedCriteria.push('bodyPart')
    }
    if (c.clinicalIndication && criteria.clinicalIndication?.toLowerCase().includes(c.clinicalIndication.toLowerCase())) {
      score += 20
      matchedCriteria.push('clinicalIndication')
    }
    if (c.priorStudies !== undefined && (criteria.priorStudies ?? 0) >= c.priorStudies) {
      score += 10
      matchedCriteria.push('priorStudies')
    }
    if (c.manufacturer && c.manufacturer === criteria.manufacturer) {
      score += 5
      matchedCriteria.push('manufacturer')
    }
    if (c.institution && c.institution === criteria.institution) {
      score += 5
      matchedCriteria.push('institution')
    }

    score += protocol.priority
    return { protocol, score, matchedCriteria }
  })

  return results.sort((a, b) => b.score - a.score)
}

export function suggestProtocol(criteria: ProtocolMatchCriteria): HangingProtocol | null {
  const results = matchProtocols(criteria)
  return results[0]?.protocol ?? null
}
