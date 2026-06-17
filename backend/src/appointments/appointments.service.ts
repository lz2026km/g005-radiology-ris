/**
 * G005 放射RIS系统 v3.0.2 - 预约服务
 */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
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
  id?: string
  state?: AppointmentState
  startAt?: string | Date
  endAt?: string | Date
  note?: string
  deviceId?: string
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
    return this.prisma.$transaction(async (tx) => {
      const overlap = await tx.appointment.findFirst({
        where: {
          deviceId: dto.deviceId,
          state: { in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] },
          scheduledAt: { lt: new Date(dto.endAt), gt: new Date(dto.startAt) },
        },
      })
      if (overlap) throw new ConflictException(`设备冲突: ${overlap.id}`)
      return tx.appointment.create({
        data: {
          patientId: dto.patientId,
          modality: dto.modality,
          deviceId: dto.deviceId,
          scheduledAt: new Date(dto.startAt),
        },
      })
    })
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.deviceId || dto.startAt || dto.endAt) {
        const existing = await tx.appointment.findUnique({ where: { id } })
        if (!existing) throw new NotFoundException(`Appointment ${id} not found`)
        const deviceId = dto.deviceId ?? existing.deviceId
        const startAt = dto.startAt ? new Date(dto.startAt) : existing.scheduledAt
        const endAt = dto.endAt ? new Date(dto.endAt) : new Date(existing.scheduledAt.getTime() + 30 * 60 * 1000)
        const overlap = await tx.appointment.findFirst({
          where: {
            deviceId,
            id: { not: id },
            state: { in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] },
            scheduledAt: { lt: endAt, gt: startAt },
          },
        })
        if (overlap) throw new ConflictException(`设备冲突: ${overlap.id}`)
      }
      const data: any = { ...dto }
      delete data.id
      if (dto.startAt) data.scheduledAt = new Date(dto.startAt)
      return tx.appointment.update({ where: { id }, data })
    })
  }

  async cancel(id: string): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: { state: 'CANCELLED' },
    })
  }
}
