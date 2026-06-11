import { Injectable } from '@nestjs/common'

@Injectable()
export class ComplianceService {
  async getReport() {
    return {
      overallScore: 58,
      overallCompliance: 46,
      lastAssessedAt: new Date().toISOString(),
      categories: [
        { category: 'identification', name: '身份鉴别', itemCount: 4, implementedCount: 2, averageScore: 54 },
        { category: 'accessControl', name: '访问控制', itemCount: 3, implementedCount: 2, averageScore: 67 },
        { category: 'securityAudit', name: '安全审计', itemCount: 3, implementedCount: 2, averageScore: 78 },
        { category: 'residualInfo', name: '剩余信息保护', itemCount: 2, implementedCount: 2, averageScore: 88 },
        { category: 'commConfidentiality', name: '通信保密性', itemCount: 2, implementedCount: 2, averageScore: 88 },
        { category: 'dataIntegrity', name: '数据完整性', itemCount: 2, implementedCount: 2, averageScore: 90 },
        { category: 'dataBackup', name: '数据备份恢复', itemCount: 2, implementedCount: 0, averageScore: 10 },
        { category: 'personalInfo', name: '个人信息保护', itemCount: 2, implementedCount: 1, averageScore: 55 },
        { category: 'securityMgmt', name: '安全管理制度', itemCount: 2, implementedCount: 0, averageScore: 20 },
        { category: 'incidentResponse', name: '应急响应', itemCount: 2, implementedCount: 0, averageScore: 8 },
      ],
      items: [
        { id: 'id-01', category: 'identification', name: '用户标识唯一性', required: true, implemented: true, score: 100 },
        { id: 'id-02', category: 'identification', name: '密码复杂度策略', required: true, implemented: true, score: 85 },
        { id: 'id-03', category: 'identification', name: '登录失败锁定', required: true, implemented: false, score: 0 },
        { id: 'id-04', category: 'identification', name: '双因素认证', required: false, implemented: false, score: 30 },
        { id: 'ac-01', category: 'accessControl', name: 'RBAC 访问控制', required: true, implemented: true, score: 90 },
        { id: 'ac-02', category: 'accessControl', name: '最小权限原则', required: true, implemented: true, score: 70 },
        { id: 'ac-03', category: 'accessControl', name: '特权账号管理', required: true, implemented: false, score: 40 },
        { id: 'sa-01', category: 'securityAudit', name: '审计日志覆盖', required: true, implemented: true, score: 95 },
        { id: 'sa-02', category: 'securityAudit', name: '审计日志保护', required: true, implemented: true, score: 90 },
        { id: 'sa-03', category: 'securityAudit', name: '审计日志存储6个月', required: true, implemented: false, score: 50 },
        { id: 'ri-01', category: 'residualInfo', name: '患者数据脱敏', required: true, implemented: true, score: 95 },
        { id: 'ri-02', category: 'residualInfo', name: '会话退出清理', required: true, implemented: true, score: 80 },
        { id: 'cc-01', category: 'commConfidentiality', name: 'HTTPS 传输加密', required: true, implemented: true, score: 85 },
        { id: 'cc-02', category: 'commConfidentiality', name: 'CSP 策略', required: true, implemented: true, score: 90 },
        { id: 'di-01', category: 'dataIntegrity', name: '报告签名校验', required: true, implemented: true, score: 85 },
        { id: 'di-02', category: 'dataIntegrity', name: '区块链审计完整性', required: true, implemented: true, score: 95 },
        { id: 'db-01', category: 'dataBackup', name: '数据库定期备份', required: true, implemented: false, score: 20 },
        { id: 'db-02', category: 'dataBackup', name: '备份恢复演练', required: false, implemented: false, score: 0 },
        { id: 'pi-01', category: 'personalInfo', name: '患者隐私保护', required: true, implemented: true, score: 80 },
        { id: 'pi-02', category: 'personalInfo', name: '数据导出审批', required: true, implemented: false, score: 30 },
        { id: 'sm-01', category: 'securityMgmt', name: '安全管理制度文档', required: true, implemented: false, score: 30 },
        { id: 'sm-02', category: 'securityMgmt', name: '安全意识培训', required: false, implemented: false, score: 10 },
        { id: 'ir-01', category: 'incidentResponse', name: '应急响应预案', required: true, implemented: false, score: 15 },
        { id: 'ir-02', category: 'incidentResponse', name: '数据容灾', required: false, implemented: false, score: 0 },
      ],
    }
  }
}
