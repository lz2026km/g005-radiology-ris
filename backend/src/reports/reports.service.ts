/**
 * G005 放射RIS系统 v3.0.1 - 报告服务
 */
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { ReportState } from '@prisma/client'

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { skip?: number; take?: number; state?: ReportState }) {
    const { skip = 0, take = 20, state } = params
    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take,
        where: state ? { state } : undefined,
        include: { patient: { select: { id: true, name: true, gender: true, age: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.report.count({ where: state ? { state } : undefined }),
    ])
    return { items, total, skip, take }
  }

  async get(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        patient: true,
        radiologist: { select: { id: true, fullName: true, role: true } },
        revisions: { orderBy: { createdAt: 'desc' } },
      },
    })
  }

  async transition(id: string, to: ReportState, actorId: string) {
    const report = await this.prisma.report.findUnique({ where: { id } })
    if (!report) throw new Error('Report not found')
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({ where: { id }, data: { state: to } })
      await tx.reportRevision.create({
        data: {
          reportId: id,
          actorId,
          fromState: report.state,
          toState: to,
        },
      })
      return updated
    })
  }
}
