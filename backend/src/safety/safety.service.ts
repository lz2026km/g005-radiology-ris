import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  // ── AdverseEvent ──────────────────────────────────────────────

  async createAdverseEvent(data: any) {
    return this.prisma.adverseEvent.create({ data })
  }

  async getAdverseEvents(filters?: { status?: string; severity?: string; eventType?: string }) {
    const where: any = {}
    if (filters?.status) where.status = filters.status
    if (filters?.severity) where.severity = filters.severity
    if (filters?.eventType) where.eventType = filters.eventType
    return this.prisma.adverseEvent.findMany({ where, orderBy: { reportedAt: 'desc' } })
  }

  async getAdverseEvent(id: string) {
    return this.prisma.adverseEvent.findUnique({ where: { id } })
  }

  async updateAdverseEvent(id: string, data: any) {
    return this.prisma.adverseEvent.update({ where: { id }, data })
  }

  async deleteAdverseEvent(id: string) {
    return this.prisma.adverseEvent.delete({ where: { id } })
  }

  // ── RcaInvestigation ──────────────────────────────────────────

  async createRcaInvestigation(data: any) {
    return this.prisma.rcaInvestigation.create({ data })
  }

  async getRcaInvestigations(filters?: { capaStatus?: string }) {
    const where: any = {}
    if (filters?.capaStatus) where.capaStatus = filters.capaStatus
    return this.prisma.rcaInvestigation.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async getRcaInvestigation(id: string) {
    return this.prisma.rcaInvestigation.findUnique({ where: { id } })
  }

  async updateRcaInvestigation(id: string, data: any) {
    return this.prisma.rcaInvestigation.update({ where: { id }, data })
  }

  async deleteRcaInvestigation(id: string) {
    return this.prisma.rcaInvestigation.delete({ where: { id } })
  }

  // ── RiskItem ──────────────────────────────────────────────────

  async createRiskItem(data: any) {
    return this.prisma.riskItem.create({ data })
  }

  async getRiskItems(filters?: { riskLevel?: string; status?: string }) {
    const where: any = {}
    if (filters?.riskLevel) where.riskLevel = filters.riskLevel
    if (filters?.status) where.status = filters.status
    return this.prisma.riskItem.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async getRiskItem(id: string) {
    return this.prisma.riskItem.findUnique({ where: { id } })
  }

  async updateRiskItem(id: string, data: any) {
    return this.prisma.riskItem.update({ where: { id }, data })
  }

  async deleteRiskItem(id: string) {
    return this.prisma.riskItem.delete({ where: { id } })
  }
}
