/**
 * G005 放射RIS系统 v3.0.2 - 报告模板控制器
 */
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { TemplatesService, CreateTemplateDto } from './templates.service'

const CreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  bodyPart: z.string().min(1),
  body: z.string().min(1),
  parentId: z.string().optional(),
  radsCategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdById: z.string().min(1),
})

@ApiTags('templates')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('templates')
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  list(@Query('category') category?: string, @Query('bodyPart') bodyPart?: string, @Query('keyword') keyword?: string) {
    return this.service.list({ category, bodyPart, keyword })
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateSchema)) body: CreateTemplateDto) {
    return this.service.create(body)
  }
}
