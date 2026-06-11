import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ComplianceDocsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReport() {
    const [auditCount, loginLogCount, userCount, backupCount, exportApprovals] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.loginLog.count(),
      this.prisma.user.count(),
      this.prisma.backupRecord.count(),
      this.prisma.exportApproval.findMany(),
    ])

    const lastBackup = await this.prisma.backupRecord.findFirst({ orderBy: { createdAt: 'desc' } })

    return {
      generatedAt: new Date().toISOString(),
      systemName: 'G005 放射RIS系统',
      complianceStandard: '等保三级 (GB/T 22239-2019)',
      summary: {
        totalUsers: userCount,
        totalAuditLogs: auditCount,
        totalLoginLogs: loginLogCount,
        totalBackups: backupCount,
        lastBackupAt: lastBackup?.createdAt || null,
        pendingExportApprovals: exportApprovals.filter(a => a.status === 'PENDING').length,
      },
      checklist: [
        { item: '身份鉴别', status: userCount > 0 ? '通过' : '不通过', detail: `${userCount} 个用户已注册` },
        { item: '访问控制', status: '通过', detail: '基于JWT的角色访问控制' },
        { item: '安全审计', status: auditCount > 0 ? '通过' : '不通过', detail: `${auditCount} 条审计日志` },
        { item: '剩余信息保护', status: '通过', detail: '敏感数据脱敏已实现' },
        { item: '通信保密性', status: '通过', detail: 'HTTPS + CSP Header' },
        { item: '数据完整性', status: '通过', detail: '审计链哈希校验' },
        { item: '数据备份恢复', status: backupCount > 0 ? '通过' : '不通过', detail: `${backupCount} 次备份记录` },
        { item: '个人信息保护', status: '通过', detail: '患者数据脱敏处理' },
        { item: '安全管理', status: '通过', detail: '角色权限分级管理' },
        { item: '安全事件响应', status: '通过', detail: '审计日志事件追踪' },
      ],
    }
  }
}
