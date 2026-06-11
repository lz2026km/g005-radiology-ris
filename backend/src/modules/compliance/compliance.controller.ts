import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ComplianceService } from './compliance.service'

@ApiTags('compliance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  @Get('report')
  getReport() {
    return this.service.getReport()
  }
}
