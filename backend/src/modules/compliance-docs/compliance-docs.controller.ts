import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ComplianceDocsService } from './compliance-docs.service'

@ApiTags('compliance-docs')
@Controller('compliance-docs')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ComplianceDocsController {
  constructor(private readonly svc: ComplianceDocsService) {}

  @Get()
  @ApiOperation({ summary: '生成合规文档报告' })
  report() {
    return this.svc.generateReport()
  }
}
