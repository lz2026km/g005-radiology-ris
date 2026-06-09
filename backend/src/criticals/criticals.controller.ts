/**
 * G005 放射RIS系统 v3.0.2 - 危急值通知控制器
 */
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { CriticalsService, NotifyDto, EscalateDto } from './criticals.service'

const ChannelEnum = z.enum(['SMS', 'WECHAT', 'PHONE', 'DINGTALK', 'APP'])
const CategoryEnum = z.enum(['LIFE_THREATENING', 'URGENT', 'IMPORTANT'])

const NotifySchema = z.object({
  criticalId: z.string().min(1),
  patientName: z.string().min(1),
  patientId: z.string().min(1),
  category: CategoryEnum,
  finding: z.string().min(1),
  channels: z.array(ChannelEnum).min(1),
  recipientName: z.string().min(1),
  recipientDept: z.string().min(1),
  recipientPhone: z.string().min(1),
})

const EscalateSchema = z.object({
  criticalId: z.string().min(1),
  reason: z.string().min(1),
  newRecipients: z
    .array(z.object({ name: z.string(), dept: z.string(), phone: z.string() }))
    .min(1),
})

@ApiTags('criticals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('criticals')
export class CriticalsController {
  constructor(private readonly service: CriticalsService) {}

  @Post('notify')
  notify(@Body(new ZodValidationPipe(NotifySchema)) body: NotifyDto) {
    return this.service.notify(body)
  }

  @Post('escalate')
  escalate(@Body(new ZodValidationPipe(EscalateSchema)) body: EscalateDto) {
    return this.service.escalate(body)
  }

  @Get(':criticalId/history')
  list(@Param('criticalId') criticalId: string) {
    return this.service.list(criticalId)
  }
}
