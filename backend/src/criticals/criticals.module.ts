/**
 * G005 放射RIS系统 v3.0.2 - 危急值通知
 * 2 端点:POST notify / POST escalate
 */
import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { CriticalsController } from './criticals.controller'
import { CriticalsService } from './criticals.service'

@Module({
  imports: [PrismaModule],
  controllers: [CriticalsController],
  providers: [CriticalsService],
  exports: [CriticalsService],
})
export class CriticalsModule {}
