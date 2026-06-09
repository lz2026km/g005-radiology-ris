/**
 * G005 放射RIS系统 v3.0.2 - 报告模板管理
 * 2 端点:GET list / POST create
 */
import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { TemplatesController } from './templates.controller'
import { TemplatesService } from './templates.service'

@Module({
  imports: [PrismaModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
