/**
 * G005 放射RIS系统 v3.0.2 - HL7 控制器
 * 2 端点:POST oru / POST batch
 */
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { Hl7Service, ReportForHL7 } from './hl7.service'

const ReportSchema = z.object({
  accessionNumber: z.string(),
  patientName: z.string(),
  patientId: z.string(),
  patientSex: z.enum(['M', 'F', 'O', '']),
  patientBirthDate: z.string().optional(),
  modality: z.string(),
  studyDate: z.string(),
  studyTime: z.string(),
  findings: z.string(),
  conclusion: z.string(),
  authorName: z.string(),
  authorId: z.string(),
  reviewerName: z.string().optional(),
  reviewedAt: z.string().datetime().or(z.date()).optional(),
  reportId: z.string(),
  radsCategory: z.string().optional(),
})

const BatchSchema = z.object({
  reports: z.array(ReportSchema).min(1).max(100),
})

@ApiTags('hl7')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('hl7')
export class Hl7Controller {
  constructor(private readonly service: Hl7Service) {}

  @Post('oru')
  oru(@Body(new ZodValidationPipe(ReportSchema)) body: ReportForHL7) {
    const message = this.service.buildORU(body)
    return {
      message,
      controlId: `G005-${body.reportId}-${Date.now()}`,
      messageType: 'ORU^R01',
      generatedAt: new Date().toISOString(),
      bytes: Buffer.byteLength(message, 'utf8'),
    }
  }

  @Post('batch')
  batch(@Body(new ZodValidationPipe(BatchSchema)) body: { reports: ReportForHL7[] }) {
    return {
      count: body.reports.length,
      messages: body.reports.map((r) => ({
        reportId: r.reportId,
        message: this.service.buildORU(r),
      })),
    }
  }
}
