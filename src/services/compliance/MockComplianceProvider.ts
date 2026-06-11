import type { ComplianceReport, ComplianceCheckItem, ComplianceCategorySummary, ComplianceCategory } from './types'

const CATEGORY_NAMES: Record<ComplianceCategory, string> = {
  identification: '身份鉴别',
  accessControl: '访问控制',
  securityAudit: '安全审计',
  residualInfo: '剩余信息保护',
  commConfidentiality: '通信保密性',
  dataIntegrity: '数据完整性',
  dataBackup: '数据备份恢复',
  personalInfo: '个人信息保护',
  securityMgmt: '安全管理制度',
  incidentResponse: '应急响应',
}

const MOCK_ITEMS: ComplianceCheckItem[] = [
  { id: 'id-01', category: 'identification', name: '用户标识唯一性', description: '每个用户有唯一标识，禁用共享账号', required: true, implemented: true, score: 100, evidence: 'JWT + 用户名唯一约束' },
  { id: 'id-02', category: 'identification', name: '密码复杂度策略', description: '密码长度≥8位，包含大小写字母+数字+特殊字符', required: true, implemented: true, score: 85, evidence: 'Zod 校验' },
  { id: 'id-03', category: 'identification', name: '登录失败锁定', description: '连续5次登录失败锁定账号15分钟', required: true, implemented: false, score: 0, evidence: '' },
  { id: 'id-04', category: 'identification', name: '双因素认证', description: '支持TOTP或短信二次验证', required: false, implemented: false, score: 30, evidence: 'i18n + 接口已预留，UI未实现' },
  { id: 'ac-01', category: 'accessControl', name: '基于角色的访问控制', description: 'RBAC 模型：医生/技师/护士/管理员/主任', required: true, implemented: true, score: 90, evidence: 'RBAC types + Passport JWT Guard' },
  { id: 'ac-02', category: 'accessControl', name: '最小权限原则', description: '用户只能访问授权资源', required: true, implemented: true, score: 70, evidence: '前端路由守卫 + 后端 Guard' },
  { id: 'ac-03', category: 'accessControl', name: '特权账号管理', description: '管理员账号单独审计，操作留痕', required: true, implemented: false, score: 40, evidence: '审计日志已实现，特权账号管理待完善' },
  { id: 'sa-01', category: 'securityAudit', name: '审计日志覆盖', description: '登录/操作/数据变更/导出/敏感操作全覆盖', required: true, implemented: true, score: 95, evidence: 'auditLogger + auditChain' },
  { id: 'sa-02', category: 'securityAudit', name: '审计日志保护', description: '审计日志不可篡改（哈希链）', required: true, implemented: true, score: 90, evidence: 'Merkle Tree + 区块链审计链' },
  { id: 'sa-03', category: 'securityAudit', name: '审计日志存储≥6个月', description: '审计记录保存不少于6个月', required: true, implemented: false, score: 50, evidence: '内存存储，未配置持久化' },
  { id: 'ri-01', category: 'residualInfo', name: '患者数据脱敏', description: '敏感字段显示脱敏（姓名/身份证/电话）', required: true, implemented: true, score: 95, evidence: 'sanitization.ts 全套脱敏函数' },
  { id: 'ri-02', category: 'residualInfo', name: '会话退出清理', description: '退出登录清除本地敏感数据', required: true, implemented: true, score: 80, evidence: 'sessionStorage 清理 + token 清除' },
  { id: 'cc-01', category: 'commConfidentiality', name: 'HTTPS 传输加密', description: '全站 HTTPS，HSTS 头', required: true, implemented: true, score: 85, evidence: 'CSP + HSTS Header' },
  { id: 'cc-02', category: 'commConfidentiality', name: 'CSP 策略', description: 'Content Security Policy 防止 XSS', required: true, implemented: true, score: 90, evidence: 'csp.ts + Vite 配置' },
  { id: 'di-01', category: 'dataIntegrity', name: '报告签名校验', description: '电子报告数字签名防篡改', required: true, implemented: true, score: 85, evidence: 'CA 签名模块' },
  { id: 'di-02', category: 'dataIntegrity', name: '区块链审计完整性', description: '审计链 Merkle Tree 校验', required: true, implemented: true, score: 95, evidence: 'auditChain.ts' },
  { id: 'db-01', category: 'dataBackup', name: '数据库定期备份', description: '每日自动备份，保留30天', required: true, implemented: false, score: 20, evidence: '' },
  { id: 'db-02', category: 'dataBackup', name: '备份恢复演练', description: '每季度恢复演练', required: false, implemented: false, score: 0, evidence: '' },
  { id: 'pi-01', category: 'personalInfo', name: '患者隐私保护', description: '个人信息收集告知、最小化采集', required: true, implemented: true, score: 80, evidence: 'Sentry 脱敏 + 数据最小化设计' },
  { id: 'pi-02', category: 'personalInfo', name: '数据导出审批', description: '批量导出患者数据需审批', required: true, implemented: false, score: 30, evidence: '' },
  { id: 'sm-01', category: 'securityMgmt', name: '安全管理制度文档', description: '制定信息安全管理制度', required: true, implemented: false, score: 30, evidence: '制度文档待编写' },
  { id: 'sm-02', category: 'securityMgmt', name: '安全意识培训', description: '年度安全意识培训', required: false, implemented: false, score: 10, evidence: '' },
  { id: 'ir-01', category: 'incidentResponse', name: '应急响应预案', description: '信息安全事件应急响应流程', required: true, implemented: false, score: 15, evidence: '' },
  { id: 'ir-02', category: 'incidentResponse', name: '数据容灾', description: '异地容灾备份', required: false, implemented: false, score: 0, evidence: '' },
]

export class MockComplianceProvider {
  async getReport(): Promise<ComplianceReport> {
    const categories = [...new Set(MOCK_ITEMS.map((i) => i.category))]
    const categorySummaries: ComplianceCategorySummary[] = categories.map((cat) => {
      const items = MOCK_ITEMS.filter((i) => i.category === cat)
      return {
        category: cat,
        name: CATEGORY_NAMES[cat],
        itemCount: items.length,
        implementedCount: items.filter((i) => i.implemented).length,
        averageScore: Math.round(items.reduce((s, i) => s + i.score, 0) / items.length),
      }
    })

    const overallScore = Math.round(MOCK_ITEMS.reduce((s, i) => s + i.score, 0) / MOCK_ITEMS.length)
    const overallCompliance = Math.round((MOCK_ITEMS.filter((i) => i.implemented).length / MOCK_ITEMS.length) * 100)

    return {
      overallScore,
      overallCompliance,
      lastAssessedAt: new Date().toISOString(),
      categories: categorySummaries,
      items: MOCK_ITEMS,
    }
  }

  async checkItem(id: string): Promise<ComplianceCheckItem | undefined> {
    return MOCK_ITEMS.find((i) => i.id === id)
  }
}
