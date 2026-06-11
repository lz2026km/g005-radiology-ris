import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { ExportApprovalController } from './export-approval.controller'
import { ExportApprovalService } from './export-approval.service'

@Module({
  imports: [PrismaModule],
  controllers: [ExportApprovalController],
  providers: [ExportApprovalService],
  exports: [ExportApprovalService],
})
export class ExportApprovalModule {}
