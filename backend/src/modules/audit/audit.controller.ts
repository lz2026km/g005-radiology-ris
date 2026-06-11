import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditService } from './audit.service'

@ApiTags('audit')
@Controller('audit')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: '审计日志列表' })
  list(@Query() query: { page?: string; pageSize?: string; userId?: string; action?: string; resource?: string; startDate?: string; endDate?: string }) {
    return this.audit.list({
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      userId: query.userId,
      action: query.action,
      resource: query.resource,
      startDate: query.startDate,
      endDate: query.endDate,
    })
  }

  @Get('stats')
  @ApiOperation({ summary: '审计日志统计' })
  stats() {
    return this.audit.stats()
  }
}
