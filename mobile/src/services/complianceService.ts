export interface ConsentRecord {
  patientId: string
  consentType: 'share' | 'research' | 'telemedicine'
  granted: boolean
  grantedAt: number
  expiresAt: number
  grantedBy: string
}

export interface RetentionPolicy {
  resourceType: string
  retentionDays: number
  action: 'archive' | 'delete' | 'notify'
}

const DEFAULT_POLICIES: RetentionPolicy[] = [
  { resourceType: 'report', retentionDays: 3650, action: 'archive' },
  { resourceType: 'image', retentionDays: 3650, action: 'archive' },
  { resourceType: 'audit_log', retentionDays: 1825, action: 'archive' },
  { resourceType: 'temp_data', retentionDays: 30, action: 'delete' },
]

class ComplianceService {
  private consents: Map<string, ConsentRecord[]> = new Map()
  private policies: RetentionPolicy[] = DEFAULT_POLICIES

  async checkConsent(patientId: string, consentType: ConsentRecord['consentType']): Promise<boolean> {
    const records = this.consents.get(patientId) || []
    const active = records.find(r => r.consentType === consentType && r.granted && r.expiresAt > Date.now())
    return !!active
  }

  async recordConsent(consent: ConsentRecord): Promise<void> {
    const records = this.consents.get(consent.patientId) || []
    records.push(consent)
    this.consents.set(consent.patientId, records)
    try {
      await fetch('/api/v1/compliance/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consent),
      })
    } catch {
      // Queue for sync
    }
  }

  async revokeConsent(patientId: string, consentType: ConsentRecord['consentType']): Promise<void> {
    const records = this.consents.get(patientId) || []
    const idx = records.findIndex(r => r.consentType === consentType && r.granted)
    if (idx >= 0) {
      records[idx].granted = false
      this.consents.set(patientId, records)
    }
  }

  getRetentionPolicy(resourceType: string): RetentionPolicy | undefined {
    return this.policies.find(p => p.resourceType === resourceType)
  }

  async checkRetention(resourceType: string, createdAt: number): Promise<{ expired: boolean; action: RetentionPolicy['action'] }> {
    const policy = this.getRetentionPolicy(resourceType)
    if (!policy) return { expired: false, action: 'notify' }
    const age = Date.now() - createdAt
    const maxAge = policy.retentionDays * 86400000
    return { expired: age > maxAge, action: policy.action }
  }

  async getPolicies(): Promise<RetentionPolicy[]> {
    return [...this.policies]
  }

  async updatePolicy(policy: RetentionPolicy): Promise<void> {
    const idx = this.policies.findIndex(p => p.resourceType === policy.resourceType)
    if (idx >= 0) {
      this.policies[idx] = policy
    } else {
      this.policies.push(policy)
    }
  }
}

export const complianceService = new ComplianceService()
