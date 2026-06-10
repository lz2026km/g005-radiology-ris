/**
 * G005 放射RIS系统 v3.0.2.2 - 通知服务
 */
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface CreateNotificationDto {
  userId: string
  type: 'CRITICAL' | 'REPORT' | 'TASK' | 'SYSTEM' | 'APPOINTMENT'
  severity?: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'
  title: string
  content: string
  link?: string
  targetId?: string
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /notifications/unread/:userId — 获取未读数
   */
  async getUnreadCount(userId: string): Promise<{ userId: string; unread: number }> {
    const model = (this.prisma as any).notification
    if (!model?.count) return { userId, unread: 0 }
    const unread = await model.count({ where: { userId, read: false } })
    return { userId, unread }
  }

  /**
   * GET /notifications/history/:userId — 获取历史
   */
  async getHistory(userId: string, limit = 50) {
    const model = (this.prisma as any).notification
    if (!model?.findMany) return []
    return model.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * POST /notifications/read — 标记已读
   */
  async markRead(id: string) {
    const model = (this.prisma as any).notification
    if (!model?.update) return null
    return model.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    })
  }

  /**
   * POST /notifications/broadcast — 创建(广播)
   */
  async create(dto: CreateNotificationDto) {
    const model = (this.prisma as any).notification
    const data: any = {
      userId: dto.userId,
      type: dto.type,
      severity: dto.severity ?? 'INFO',
      title: dto.title,
      content: dto.content,
      link: dto.link,
      targetId: dto.targetId,
    }
    if (!model?.create) {
      // 返回内存对象(测试用)
      return { id: 'mock-' + Date.now(), ...data, read: false, createdAt: new Date().toISOString() }
    }
    return model.create({ data })
  }

  /**
   * 批量广播给多个用户
   */
  async broadcast(userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>) {
    const results = []
    for (const userId of userIds) {
      const r = await this.create({ ...dto, userId })
      results.push(r)
    }
    return { count: results.length, items: results }
  }
}
