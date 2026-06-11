import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { ComplianceDocsController } from './compliance-docs.controller'
import { ComplianceDocsService } from './compliance-docs.service'

@Module({
  imports: [PrismaModule],
  controllers: [ComplianceDocsController],
  providers: [ComplianceDocsService],
  exports: [ComplianceDocsService],
})
export class ComplianceDocsModule {}
