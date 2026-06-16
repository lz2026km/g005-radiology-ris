// ===== Types =====
export interface EFilmShareLink {
  id: string
  patientId: string
  patientName: string
  examId: string
  examItem: string
  shareUrl: string
  accessToken: string
  expiresAt: string
  maxAccessCount: number
  currentAccessCount: number
  createdAt: string
  status: 'active' | 'expired' | 'revoked'
}

export interface EFilmViewerSession {
  seriesInstanceUid: string
  sopInstanceUids: string[]
  totalFrames: number
  currentFrame: number
  windowWidth: number
  windowCenter: number
  zoom: number
}

export interface EFilmShareStats {
  totalShares: number
  activeShares: number
  totalViews: number
  totalDownloads: number
}

export interface IEFilmService {
  createShareLink(patientId: string, examId: string, expiresInHours?: number, maxAccess?: number): Promise<EFilmShareLink>
  revokeShareLink(shareId: string): Promise<boolean>
  getShareLink(shareId: string): Promise<EFilmShareLink | null>
  getShareStats(): Promise<EFilmShareStats>
  listShares(patientId?: string): Promise<EFilmShareLink[]>
  generateDicomQrCode(shareId: string): Promise<string>
}

// ===== Mock Service =====
const MOCK_SHARES: EFilmShareLink[] = [
  { id: 'S001', patientId: 'P001', patientName: '张三', examId: 'EXM001', examItem: '胸部CT平扫', shareUrl: 'https://ris.example.com/share/S001', accessToken: 'tok_a1b2c3d4', expiresAt: '2025-06-01T00:00:00Z', maxAccessCount: 10, currentAccessCount: 2, createdAt: '2025-05-01T00:00:00Z', status: 'active' },
  { id: 'S002', patientId: 'P002', patientName: '李四', examId: 'EXM002', examItem: '颅脑MRI平扫', shareUrl: 'https://ris.example.com/share/S002', accessToken: 'tok_e5f6g7h8', expiresAt: '2025-05-15T00:00:00Z', maxAccessCount: 5, currentAccessCount: 5, createdAt: '2025-04-15T00:00:00Z', status: 'expired' },
]

class MockEFilmService implements IEFilmService {
  private shares: EFilmShareLink[] = [...MOCK_SHARES]

  async createShareLink(patientId: string, examId: string, expiresInHours = 24, maxAccess = 10): Promise<EFilmShareLink> {
    const id = `S${Date.now()}`
    const token = `tok_${Math.random().toString(36).substring(2, 10)}`
    const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString()
    const link: EFilmShareLink = {
      id, patientId, patientName: '张三', examId, examItem: '影像共享',
      shareUrl: `https://ris.example.com/share/${id}`, accessToken: token,
      expiresAt, maxAccessCount: maxAccess, currentAccessCount: 0,
      createdAt: new Date().toISOString(), status: 'active',
    }
    this.shares.push(link)
    return link
  }

  async revokeShareLink(shareId: string): Promise<boolean> {
    const link = this.shares.find(s => s.id === shareId)
    if (link) { link.status = 'revoked'; return true }
    return false
  }

  async getShareLink(shareId: string): Promise<EFilmShareLink | null> {
    return this.shares.find(s => s.id === shareId) ?? null
  }

  async getShareStats(): Promise<EFilmShareStats> {
    return {
      totalShares: this.shares.length,
      activeShares: this.shares.filter(s => s.status === 'active').length,
      totalViews: this.shares.reduce((s, x) => s + x.currentAccessCount, 0),
      totalDownloads: Math.floor(this.shares.reduce((s, x) => s + x.currentAccessCount, 0) / 2),
    }
  }

  async listShares(patientId?: string): Promise<EFilmShareLink[]> {
    return patientId ? this.shares.filter(s => s.patientId === patientId) : this.shares
  }

  async generateDicomQrCode(shareId: string): Promise<string> {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${shareId}&size=200x200`
  }
}

let _instance: IEFilmService | null = null

export function getEFilmService(): IEFilmService {
  if (!_instance) _instance = new MockEFilmService()
  return _instance
}
