import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SafetyService } from './safety.service'

@ApiTags('safety')
@Controller('safety')
export class SafetyController {
  constructor(private readonly service: SafetyService) {}

  // ── AdverseEvent ──────────────────────────────────────────────

  @Post('adverse-events')
  createAdverseEvent(@Body() body: any) {
    return this.service.createAdverseEvent(body)
  }

  @Get('adverse-events')
  getAdverseEvents(@Query('status') status?: string, @Query('severity') severity?: string, @Query('eventType') eventType?: string) {
    return this.service.getAdverseEvents({ status, severity, eventType })
  }

  @Get('adverse-events/:id')
  getAdverseEvent(@Param('id') id: string) {
    return this.service.getAdverseEvent(id)
  }

  @Put('adverse-events/:id')
  updateAdverseEvent(@Param('id') id: string, @Body() body: any) {
    return this.service.updateAdverseEvent(id, body)
  }

  @Delete('adverse-events/:id')
  deleteAdverseEvent(@Param('id') id: string) {
    return this.service.deleteAdverseEvent(id)
  }

  // ── RcaInvestigation ──────────────────────────────────────────

  @Post('rca-investigations')
  createRcaInvestigation(@Body() body: any) {
    return this.service.createRcaInvestigation(body)
  }

  @Get('rca-investigations')
  getRcaInvestigations(@Query('capaStatus') capaStatus?: string) {
    return this.service.getRcaInvestigations({ capaStatus })
  }

  @Get('rca-investigations/:id')
  getRcaInvestigation(@Param('id') id: string) {
    return this.service.getRcaInvestigation(id)
  }

  @Put('rca-investigations/:id')
  updateRcaInvestigation(@Param('id') id: string, @Body() body: any) {
    return this.service.updateRcaInvestigation(id, body)
  }

  @Delete('rca-investigations/:id')
  deleteRcaInvestigation(@Param('id') id: string) {
    return this.service.deleteRcaInvestigation(id)
  }

  // ── RiskItem ──────────────────────────────────────────────────

  @Post('risk-items')
  createRiskItem(@Body() body: any) {
    return this.service.createRiskItem(body)
  }

  @Get('risk-items')
  getRiskItems(@Query('riskLevel') riskLevel?: string, @Query('status') status?: string) {
    return this.service.getRiskItems({ riskLevel, status })
  }

  @Get('risk-items/:id')
  getRiskItem(@Param('id') id: string) {
    return this.service.getRiskItem(id)
  }

  @Put('risk-items/:id')
  updateRiskItem(@Param('id') id: string, @Body() body: any) {
    return this.service.updateRiskItem(id, body)
  }

  @Delete('risk-items/:id')
  deleteRiskItem(@Param('id') id: string) {
    return this.service.deleteRiskItem(id)
  }
}
