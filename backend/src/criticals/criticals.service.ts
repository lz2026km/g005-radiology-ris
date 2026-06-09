/**
 * G005 放射RIS系统 v3.0.2 - 危急值通知服务
 */
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface NotifyDto {
  criticalId: string
  patientName: string
  patientId: string
  category: 'LIFE_THREATENING' | 'URGENT' | 'IMPORTANT'
  finding: string
  channels: ('SMS' | 'WECHAT' | 'PHONE' | 'DINGTALK' | 'APP')[]
  recipientName: string
  recipientDept: string
  recipientPhone: string
}

export interface EscalateDto {
  criticalId: string
  reason: string
  newRecipients: { name: string; dept: string; phone: string }[]
}

@Injectable()
export class CriticalsService {
  constructor(private readonly prisma: PrismaService) {}

  async notify(dto: NotifyDto) {
    const records = dto.channels.map((channel) => ({
      criticalId: dto.criticalId,
      patientName: dto.patientName,
      patientId: dto.patientId,
      category: dto.category,
      finding: dto.finding,
      channel,
      recipientName: dto.recipientName,
      recipientDept: dto.recipientDept,
      recipientPhone: dto.recipientPhone,
      status: this.simulateDelivery(channel),
      triggeredAt: new Date(),
    }))
    return this.prisma.criticalValueNotification.createMany({ data: records })
  }

  async escalate(dto: EscalateDto) {
    const records = dto.newRecipients.flatMap((r) =>
      (['SMS', 'PHONE', 'APP'] as const).map((channel) => ({
        criticalId: dto.criticalId,
        patientName: 'Escalated',
        patientId: '',
        category: 'LIFE_THREATENING' as const,
        finding: dto.reason,
        channel,
        recipientName: r.name,
        recipientDept: r.dept,
        recipientPhone: r.phone,
        status: this.simulateDelivery(channel),
        escalated: true,
        triggeredAt: new Date(),
      }))
    )
    return this.prisma.criticalValueNotification.createMany({ data: records })
  }

  async list(criticalId: string) {
    return this.prisma.criticalValueNotification.findMany({
      where: { criticalId },
      orderBy: { triggeredAt: 'desc' },
    })
  }

  private simulateDelivery(channel: string): string {
    // 真实环境调用 SMS 网关/WX API
    return Math.random() > 0.05 ? 'SUCCESS' : 'FAILED'
  }
}
