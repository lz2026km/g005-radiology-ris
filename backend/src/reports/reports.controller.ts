/**
 * G005 放射RIS系统 v3.0.1 - 报告控制器
 */
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { ReportsService } from './reports.service'

export const ReportStateEnum = z.enum([
  'PENDING_ASSIGNMENT',
  'ASSIGNED',
  'WRITING',
  'SUBMITTED',
  'REVIEWING',
  'REVIEWED',
  'SIGNING',
  'SIGNED',
  'PUBLISHED',
  'AMENDING',
  'AMENDED',
  'WITHDRAWN',
  'REJECTED',
  'ARCHIVED',
])

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  list(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('state') state?: string
  ) {
    const parsedState = state && ReportStateEnum.safeParse(state).success
      ? (state as z.infer<typeof ReportStateEnum>)
      : undefined
    return this.reports.list({ skip: Number(skip ?? 0), take: Number(take ?? 20), state: parsedState })
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.reports.get(id)
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(z.object({ to: ReportStateEnum, actorId: z.string().min(1) })))
    body: { to: z.infer<typeof ReportStateEnum>; actorId: string }
  ) {
    return this.reports.transition(id, body.to, body.actorId)
  }
}
