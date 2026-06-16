// ===== Types =====
export interface TelemedicineSession {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  doctorTitle: string
  startTime: string
  endTime?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  modality: 'video' | 'audio' | 'chat'
  roomUrl: string
  notes?: string
  diagnosisSummary?: string
  prescription?: string
}

export interface TelemedicineProvider {
  id: string
  name: string
  type: 'wechat' | 'dingtalk' | 'zoom' | 'custom_rtc'
  apiEndpoint: string
  enabled: boolean
}

export interface ITelemedicineService {
  createSession(patientId: string, doctorId: string, modality: TelemedicineSession['modality'], scheduledTime: string): Promise<TelemedicineSession>
  joinSession(sessionId: string): Promise<{ roomUrl: string; token: string }>
  endSession(sessionId: string, summary?: string): Promise<boolean>
  getSession(sessionId: string): Promise<TelemedicineSession | null>
  listSessions(patientId?: string, doctorId?: string): Promise<TelemedicineSession[]>
  getProviders(): Promise<TelemedicineProvider[]>
  generateInviteLink(sessionId: string): Promise<string>
}

// ===== Mock Service =====
const MOCK_SESSIONS: TelemedicineSession[] = [
  { id: 'TM001', patientId: 'P001', patientName: '张三', doctorId: 'D001', doctorName: '李明', doctorTitle: '主任医师', startTime: '2025-05-01T10:00:00Z', status: 'completed', modality: 'video', roomUrl: 'https://meet.example.com/tm001', notes: '复查胸部CT结果', diagnosisSummary: '双肺未见明显异常', prescription: '定期体检' },
  { id: 'TM002', patientId: 'P002', patientName: '李四', doctorId: 'D002', doctorName: '王芳', doctorTitle: '副主任医师', startTime: '2025-05-03T14:00:00Z', status: 'scheduled', modality: 'video', roomUrl: 'https://meet.example.com/tm002' },
]

const MOCK_PROVIDERS: TelemedicineProvider[] = [
  { id: 'PROV1', name: '微信视频', type: 'wechat', apiEndpoint: 'https://api.weixin.qq.com/cgi-bin/', enabled: true },
  { id: 'PROV2', name: 'Zoom', type: 'zoom', apiEndpoint: 'https://api.zoom.us/v2/', enabled: true },
  { id: 'PROV3', name: '自建RTC', type: 'custom_rtc', apiEndpoint: 'https://rtc.example.com/', enabled: false },
]

class MockTelemedicineService implements ITelemedicineService {
  private sessions: TelemedicineSession[] = [...MOCK_SESSIONS]

  async createSession(patientId: string, doctorId: string, modality: TelemedicineSession['modality'], scheduledTime: string): Promise<TelemedicineSession> {
    const session: TelemedicineSession = {
      id: `TM${Date.now()}`, patientId, patientName: '患者', doctorId,
      doctorName: '医生', doctorTitle: '主治医师',
      startTime: scheduledTime, status: 'scheduled', modality,
      roomUrl: `https://meet.example.com/tm${Date.now()}`,
    }
    this.sessions.push(session)
    return session
  }

  async joinSession(sessionId: string): Promise<{ roomUrl: string; token: string }> {
    const session = this.sessions.find(s => s.id === sessionId)
    if (!session) throw new Error('Session not found')
    return { roomUrl: session.roomUrl, token: `tok_${Math.random().toString(36).substring(2)}` }
  }

  async endSession(sessionId: string, summary?: string): Promise<boolean> {
    const session = this.sessions.find(s => s.id === sessionId)
    if (!session) return false
    session.status = 'completed'
    session.endTime = new Date().toISOString()
    if (summary) session.diagnosisSummary = summary
    return true
  }

  async getSession(sessionId: string): Promise<TelemedicineSession | null> {
    return this.sessions.find(s => s.id === sessionId) ?? null
  }

  async listSessions(patientId?: string, doctorId?: string): Promise<TelemedicineSession[]> {
    let result = this.sessions
    if (patientId) result = result.filter(s => s.patientId === patientId)
    if (doctorId) result = result.filter(s => s.doctorId === doctorId)
    return result
  }

  async getProviders(): Promise<TelemedicineProvider[]> {
    return MOCK_PROVIDERS
  }

  async generateInviteLink(sessionId: string): Promise<string> {
    return `https://ris.example.com/telemedicine/join/${sessionId}`
  }
}

let _instance: ITelemedicineService | null = null

export function getTelemedicineService(): ITelemedicineService {
  if (!_instance) _instance = new MockTelemedicineService()
  return _instance
}
