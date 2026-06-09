/**
 * G005 放射RIS系统 v3.0.2 - 报告模板服务
 */
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface CreateTemplateDto {
  name: string
  category: string
  bodyPart: string
  body: string
  parentId?: string
  radsCategory?: string
  tags?: string[]
  createdById: string
}

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter?: { category?: string; bodyPart?: string; keyword?: string }) {
    const where: any = {}
    if (filter?.category) where.category = filter.category
    if (filter?.bodyPart) where.bodyPart = filter.bodyPart
    if (filter?.keyword) {
      where.OR = [
        { name: { contains: filter.keyword, mode: 'insensitive' } },
        { body: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }
    return this.prisma.reportTemplate.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 100 })
  }

  async create(dto: CreateTemplateDto) {
    return this.prisma.reportTemplate.create({ data: dto })
  }
}
