/**
 * G005 放射RIS系统 v3.0.2 - 检查预约管理
 * 提供 4 个端点:list / create / update / cancel
 */
import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { AppointmentsController } from './appointments.controller'
import { AppointmentsService } from './appointments.service'

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
