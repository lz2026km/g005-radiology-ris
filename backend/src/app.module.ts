/**
 * G005 放射RIS系统 v3.0.2.2 - NestJS 根模块
 * v3.0.1 新增:LoggerModule(nestjs-pino)+ ReportsModule
 * v3.0.2 新增:AppointmentsModule + CriticalsModule + TemplatesModule + FilesModule + Hl7Module
 * v3.0.2.2 新增:ReportsQualityModule
 */
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ReportsModule } from './reports/reports.module'
import { PrismaModule } from './prisma/prisma.module'
import { HealthController } from './health/health.controller'
import { AppointmentsModule } from './appointments/appointments.module'
import { CriticalsModule } from './criticals/criticals.module'
import { TemplatesModule } from './templates/templates.module'
import { FilesModule } from './files/files.module'
import { Hl7Module } from './hl7/hl7.module'
import { ReportsQualityModule } from './reports-quality/reports-quality.module'
import { DicomWebModule } from './dicom-web/dicom-web.module'
import { NotificationsModule } from './notifications/notifications.module'
import { AiModule } from './modules/ai/ai.module'
import { StatsModule } from './modules/stats/stats.module'
import { ComplianceModule } from './modules/compliance/compliance.module'
import { PatientModule } from './modules/patient/patient.module'
import { ExamModule } from './modules/exam/exam.module'
import { DeviceModule } from './modules/device/device.module'
import { AuditModule } from './modules/audit/audit.module'
import { BackupModule } from './modules/backup/backup.module'
import { ExportApprovalModule } from './modules/export-approval/export-approval.module'
import { ComplianceDocsModule } from './modules/compliance-docs/compliance-docs.module'

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
    AppointmentsModule,
    CriticalsModule,
    TemplatesModule,
    FilesModule,
    Hl7Module,
    ReportsQualityModule,
    DicomWebModule,
    NotificationsModule,
    AiModule,
    StatsModule,
    ComplianceModule,
    PatientModule,
    ExamModule,
    DeviceModule,
    AuditModule,
    BackupModule,
    ExportApprovalModule,
    ComplianceDocsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
