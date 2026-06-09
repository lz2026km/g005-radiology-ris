/**
 * G005 放射RIS系统 v3.0.2 - 预约服务
 */
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { Appointment, AppointmentState } from '@prisma/client'

export interface CreateAppointmentDto {
  patientName: string
  patientId: string
  modality: string
  bodyPart?: string
  startAt: string | Date
  endAt: string | Date
  deviceId: string
  deviceName: string
  room?: string
  priority?: string
  note?: string
  referringDoctor?: string
  createdById: string
}

export interface UpdateAppointmentDto {
  state?: AppointmentState
  startAt?: string | Date
  endAt?: string | Date
  note?: string
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { skip?: number; take?: number; state?: AppointmentState; deviceId?: string; dateFrom?: string; dateTo?: string }) {
    const where: any = {}
    if (params.state) where.state = params.state
    if (params.deviceId) where.deviceId = params.deviceId
    if (params.dateFrom || params.dateTo) {
      where.scheduledAt = {}
      if (params.dateFrom) where.scheduledAt.gte = new Date(params.dateFrom)
      if (params.dateTo) where.scheduledAt.lte = new Date(params.dateTo)
    }
    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip: params.skip ?? 0,
        take: params.take ?? 50,
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.appointment.count({ where }),
    ])
    return { items, total }
  }

  async get(id: string): Promise<Appointment> {
    const a = await this.prisma.appointment.findUnique({ where: { id } })
    if (!a) throw new NotFoundException(`Appointment ${id} not found`)
    return a
  }

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    // v3.0.2 预约创建:使用前端传入的 startAt → 数据库 scheduledAt
    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        modality: dto.modality,
        deviceId: dto.deviceId,
        scheduledAt: new Date(dto.startAt),
      },
    })
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const data: any = { ...dto }
    if (dto.startAt) data.scheduledAt = new Date(dto.startAt)
    return this.prisma.appointment.update({ where: { id }, data })
  }

  async cancel(id: string): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: { state: 'CANCELLED' },
    })
  }
}
