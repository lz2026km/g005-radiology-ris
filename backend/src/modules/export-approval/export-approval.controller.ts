import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { ExportApprovalService } from './export-approval.service'

const RequestSchema = z.object({ resource: z.string(), resourceId: z.string().optional(), reason: z.string().min(1) })
const RejectSchema = z.object({ reason: z.string().min(1) })

@ApiTags('export-approval')
@Controller('export-approval')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ExportApprovalController {
  constructor(private readonly svc: ExportApprovalService) {}

  @Post()
  @ApiOperation({ summary: '申请导出' })
  request(@Req() req: { user: { sub: string } }, @Body(new ZodValidationPipe(RequestSchema)) dto: z.infer<typeof RequestSchema>) {
    return this.svc.request({ requesterId: req.user.sub, ...dto })
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '批准导出' })
  approve(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.svc.approve(id, req.user.sub)
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '拒绝导出' })
  reject(@Param('id') id: string, @Req() req: { user: { sub: string } }, @Body(new ZodValidationPipe(RejectSchema)) dto: z.infer<typeof RejectSchema>) {
    return this.svc.reject(id, req.user.sub, dto.reason)
  }

  @Get()
  @ApiOperation({ summary: '导出审批列表' })
  list(@Query() query: { page?: string; pageSize?: string; status?: string; requesterId?: string }) {
    return this.svc.list({
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      status: query.status,
      requesterId: query.requesterId,
    })
  }
}
