/**
 * G005 放射RIS系统 v3.0.1 - NestJS 根模块
 * v3.0.1 新增:LoggerModule(nestjs-pino)+ ReportsModule
 */
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ReportsModule } from './reports/reports.module'
import { PrismaModule } from './prisma/prisma.module'
import { HealthController } from './health/health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['LOG_LEVEL'] ?? 'info',
        transport: process.env['NODE_ENV'] === 'production' ? undefined : { target: 'pino-pretty' },
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ReportsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
