import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AiService, AiGenerateDto, AiReviewDto, AiScoreDto } from './ai.service'

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('generate')
  generate(@Body() dto: AiGenerateDto) {
    return this.service.generateReport(dto)
  }

  @Post('review')
  review(@Body() dto: AiReviewDto) {
    return this.service.reviewReport(dto)
  }

  @Post('score')
  score(@Body() dto: AiScoreDto) {
    return this.service.scoreReport(dto)
  }

  @Get('providers')
  getProviders() {
    return { providers: ['mock'], active: 'mock' }
  }
}
