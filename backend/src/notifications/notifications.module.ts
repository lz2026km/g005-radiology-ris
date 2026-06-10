/**
 * G005 放射RIS系统 v3.0.2.2 - 通知中心模块
 * 4 端点:GET 未读 / POST 已读 / GET 历史 / POST 创建
 * 含 WebSocket gateway
 */
import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsGateway } from './notifications.gateway'

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
