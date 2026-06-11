import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import * as crypto from 'crypto'

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  async createBackup(type: string, userId?: string) {
    let data: any
    switch (type) {
      case 'CONFIG':
        data = await this.prisma.systemConfig.findMany()
        break
      case 'AUDIT':
        data = await this.prisma.auditLog.findMany({ take: 10000 })
        break
      case 'COMPLIANCE':
        data = {
          config: await this.prisma.systemConfig.findMany(),
          auditCount: await this.prisma.auditLog.count(),
          loginLogCount: await this.prisma.loginLog.count(),
          exportApprovals: await this.prisma.exportApproval.findMany({ take: 1000 }),
        }
        break
      case 'FULL':
      default:
        data = {
          users: await this.prisma.user.findMany(),
          patients: await this.prisma.patient.findMany({ take: 5000 }),
          config: await this.prisma.systemConfig.findMany(),
          auditCount: await this.prisma.auditLog.count(),
        }
        break
    }

    const json = JSON.stringify(data)
    const checksum = crypto.createHash('sha256').update(json).digest('hex')

    await this.prisma.backupRecord.create({
      data: { type, status: 'COMPLETED', sizeBytes: Buffer.byteLength(json), checksum, createdBy: userId },
    })

    return { type, sizeBytes: Buffer.byteLength(json), checksum, recordCount: Array.isArray(data) ? data.length : Object.keys(data).length }
  }

  async listBackups(query: { page?: number; pageSize?: number; type?: string }) {
    const page = query.page || 1
    const pageSize = query.pageSize || 20
    const where: any = {}
    if (query.type) where.type = query.type

    const [items, total] = await Promise.all([
      this.prisma.backupRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.backupRecord.count({ where }),
    ])
    return { items, total, page, pageSize }
  }
}
