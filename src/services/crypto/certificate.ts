export interface SM2Certificate {
  version: number
  serialNumber: string
  subject: string
  issuer: string
  notBefore: string
  notAfter: string
  publicKey: string
  signatureAlgorithm: 'sm2-with-sm3'
  signature: string
  extensions: SM2CertificateExtension[]
  isCA: boolean
}

export interface SM2CertificateExtension {
  oid: string
  name: string
  critical: boolean
  value: string
}

export function generateSelfSignedCert(subject: string, validityDays: number = 365): SM2Certificate {
  const now = new Date()
  return {
    version: 3,
    serialNumber: crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase(),
    subject,
    issuer: subject,
    notBefore: now.toISOString(),
    notAfter: new Date(now.getTime() + validityDays * 86400000).toISOString(),
    publicKey: 'sm2-pub-' + crypto.randomUUID(),
    signatureAlgorithm: 'sm2-with-sm3',
    signature: '00',
    extensions: [
      { oid: '2.5.29.19', name: 'basicConstraints', critical: true, value: 'CA:FALSE' },
      { oid: '2.5.29.14', name: 'subjectKeyIdentifier', critical: false, value: crypto.randomUUID() },
    ],
    isCA: false,
  }
}

export function validateCertChain(cert: SM2Certificate, trustedCAs: SM2Certificate[]): { valid: boolean; reason?: string } {
  const now = new Date()
  if (new Date(cert.notAfter) < now) return { valid: false, reason: 'Certificate expired' }
  if (new Date(cert.notBefore) > now) return { valid: false, reason: 'Certificate not yet valid' }
  return { valid: true }
}

export function isDomesticCA(cert: SM2Certificate): boolean {
  const domesticCAs = ['GMCA', 'CFCA', 'BJCA']
  return domesticCAs.some(ca => cert.issuer.includes(ca))
}
