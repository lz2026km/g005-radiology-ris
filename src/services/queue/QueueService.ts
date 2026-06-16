import type { QueueCallDto, ExamRoomStatus } from '../api/queueApi'

// ===== Types =====
export interface KioskCheckInRequest {
  patientId: string
  appointmentId?: string
  examItemId: string
  idCardLast4: string
  checkInTime: string
}

export interface KioskCheckInResult {
  success: boolean
  queueNumber: string
  estimatedWaitMinutes: number
  roomName: string
  message?: string
}

export interface QueueStats {
  totalWaiting: number
  averageWaitMinutes: number
  byRoom: { roomName: string; count: number; waitMinutes: number }[]
  peakHours: string[]
}

export interface IQQueueService {
  checkIn(request: KioskCheckInRequest): Promise<KioskCheckInResult>
  getQueueStats(): Promise<QueueStats>
  getRoomStatuses(): Promise<ExamRoomStatus[]>
  getQueueList(roomId?: string): Promise<QueueCallDto[]>
  callNext(roomId: string): Promise<QueueCallDto | null>
  recall(patientId: string): Promise<boolean>
  complete(patientId: string): Promise<boolean>
}

// ===== Mock Service =====
const MOCK_QUEUE: QueueCallDto[] = [
  { id: 'Q1', patientName: '张三', examItem: '胸部CT平扫', roomId: 'R1', roomName: 'CT-1室', status: 'waiting', queueNumber: 'A001' },
  { id: 'Q2', patientName: '李四', examItem: '颅脑MRI', roomId: 'R2', roomName: 'MR-1室', status: 'waiting', queueNumber: 'B001' },
  { id: 'Q3', patientName: '王五', examItem: '腹部彩超', roomId: 'R3', roomName: 'US-1室', status: 'in_service', queueNumber: 'C001', calledAt: '2025-05-01T09:00:00' },
  { id: 'Q4', patientName: '赵六', examItem: '胸部CT平扫', roomId: 'R1', roomName: 'CT-1室', status: 'waiting', queueNumber: 'A002' },
]

const MOCK_ROOMS: ExamRoomStatus[] = [
  { id: 'R1', roomNumber: 'CT-1室', modality: 'CT', status: '使用中', currentPatient: '王五', queueCount: 2 },
  { id: 'R2', roomNumber: 'MR-1室', modality: 'MR', status: '空闲', queueCount: 1 },
  { id: 'R3', roomNumber: 'US-1室', modality: 'US', status: '使用中', currentPatient: '赵六', queueCount: 0 },
  { id: 'R4', roomNumber: 'DR-1室', modality: 'DR', status: '维护中', queueCount: 0 },
]

class MockQueueService implements IQQueueService {
  private queue: QueueCallDto[] = [...MOCK_QUEUE]
  private rooms: ExamRoomStatus[] = [...MOCK_ROOMS]
  private counter = 100

  async checkIn(request: KioskCheckInRequest): Promise<KioskCheckInResult> {
    this.counter++
    const room = this.rooms.find(r => r.id === 'R1')
    const queueNumber = `A${String(this.counter).padStart(3, '0')}`
    this.queue.push({
      id: `Q${Date.now()}`, patientName: `患者${this.counter}`, examItem: request.examItemId,
      roomId: 'R1', roomName: room?.roomNumber ?? 'CT-1室', status: 'waiting', queueNumber,
    })
    if (room) room.queueCount = this.queue.filter(q => q.roomId === room.id && q.status === 'waiting').length
    return { success: true, queueNumber, estimatedWaitMinutes: 15 + Math.floor(Math.random() * 20), roomName: 'CT-1室' }
  }

  async getQueueStats(): Promise<QueueStats> {
    const waiting = this.queue.filter(q => q.status === 'waiting')
    const byRoom = this.rooms.map(r => ({
      roomName: r.roomNumber,
      count: waiting.filter(q => q.roomId === r.id).length,
      waitMinutes: waiting.filter(q => q.roomId === r.id).length * 15,
    }))
    return {
      totalWaiting: waiting.length,
      averageWaitMinutes: waiting.length * 15,
      byRoom,
      peakHours: ['08:00-10:00', '14:00-16:00'],
    }
  }

  async getRoomStatuses(): Promise<ExamRoomStatus[]> {
    return this.rooms
  }

  async getQueueList(roomId?: string): Promise<QueueCallDto[]> {
    return roomId ? this.queue.filter(q => q.roomId === roomId) : this.queue
  }

  async callNext(roomId: string): Promise<QueueCallDto | null> {
    const next = this.queue.find(q => q.roomId === roomId && q.status === 'waiting')
    if (!next) return null
    next.status = 'called'
    next.calledAt = new Date().toISOString()
    return next
  }

  async recall(patientId: string): Promise<boolean> {
    const item = this.queue.find(q => q.id === patientId)
    if (item) item.status = 'waiting'
    return !!item
  }

  async complete(patientId: string): Promise<boolean> {
    const item = this.queue.find(q => q.id === patientId)
    if (item) { item.status = 'completed'; item.completedAt = new Date().toISOString() }
    return !!item
  }
}

let _instance: IQQueueService | null = null

export function getQueueService(): IQQueueService {
  if (!_instance) _instance = new MockQueueService()
  return _instance
}
