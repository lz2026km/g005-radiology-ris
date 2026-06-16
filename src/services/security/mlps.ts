export type MlpsCategory =
  | 'identification'
  | 'accessControl'
  | 'securityAudit'
  | 'residualInfo'
  | 'commConfidentiality'
  | 'dataIntegrity'
  | 'dataBackup'
  | 'personalInfo'
  | 'securityMgmt'
  | 'incidentResponse'

export interface MlpsCheckItem {
  id: string
  category: MlpsCategory
  name: string
  description: string
  requirement: string
  requiredLevel: 1 | 2 | 3
  implemented: boolean
  score: number
  evidence?: string
}

export interface MlpsAssessment {
  systemName: string
  level: 1 | 2 | 3
  overallScore: number
  complianceRate: number
  categorySummaries: Record<MlpsCategory, { itemCount: number; passed: number; score: number }>
  items: MlpsCheckItem[]
  assessedAt: string
  assessedBy: string
}

const MLPS_CHECKS: Record<MlpsCategory, MlpsCheckItem[]> = {
  identification: [
    { id: 'ID-01', category: 'identification', name: 'Password Policy', description: '密码复杂度与更换周期', requirement: '长度≥8，含大小写字母+数字+特殊字符，90天更换', requiredLevel: 2, implemented: true, score: 100 },
    { id: 'ID-02', category: 'identification', name: 'Multi-Factor Auth', description: '双因素鉴别', requirement: '支持密码+短信/生物特征', requiredLevel: 3, implemented: false, score: 0 },
  ],
  accessControl: [
    { id: 'AC-01', category: 'accessControl', name: 'RBAC Matrix', description: '基于角色的访问控制矩阵', requirement: '三权分立：系统管理员、安全管理员、审计管理员', requiredLevel: 2, implemented: true, score: 90 },
  ],
  securityAudit: [
    { id: 'SA-01', category: 'securityAudit', name: 'Audit Logging', description: '安全审计日志记录', requirement: '记录用户登录、操作、异常事件，保存≥180天', requiredLevel: 2, implemented: true, score: 85 },
  ],
  residualInfo: [
    { id: 'RI-01', category: 'residualInfo', name: 'Memory Sanitization', description: '内存剩余信息保护', requirement: '会话结束后清除敏感数据', requiredLevel: 2, implemented: false, score: 0 },
  ],
  commConfidentiality: [
    { id: 'CC-01', category: 'commConfidentiality', name: 'TLS 1.3', description: '通信加密', requirement: '支持TLS 1.2/1.3，禁用弱密码套件', requiredLevel: 2, implemented: true, score: 100 },
  ],
  dataIntegrity: [
    { id: 'DI-01', category: 'dataIntegrity', name: 'Data Integrity Check', description: '数据完整性校验', requirement: '关键数据添加数字签名或MAC', requiredLevel: 2, implemented: false, score: 0 },
  ],
  dataBackup: [
    { id: 'DB-01', category: 'dataBackup', name: 'Backup Policy', description: '数据备份恢复', requirement: '每日增量+每周全量，RPO≤2h，RTO≤30min', requiredLevel: 2, implemented: true, score: 80 },
  ],
  personalInfo: [
    { id: 'PI-01', category: 'personalInfo', name: 'PII Encryption', description: '个人信息加密存储', requirement: '身份证号、手机号等敏感字段加密存储', requiredLevel: 2, implemented: true, score: 95 },
  ],
  securityMgmt: [
    { id: 'SM-01', category: 'securityMgmt', name: 'Security Policy', description: '安全管理制度', requirement: '制定并发布信息安全管理制度体系', requiredLevel: 1, implemented: true, score: 100 },
  ],
  incidentResponse: [
    { id: 'IR-01', category: 'incidentResponse', name: 'Incident Response Plan', description: '应急响应预案', requirement: '制定应急响应预案并定期演练', requiredLevel: 2, implemented: false, score: 0 },
  ],
}

export function getMlpsChecks(): MlpsCheckItem[] {
  return Object.values(MLPS_CHECKS).flat()
}

export function getMlpsChecksByCategory(category: MlpsCategory): MlpsCheckItem[] {
  return MLPS_CHECKS[category] ?? []
}

export function assessMlps(level: 1 | 2 | 3 = 2): MlpsAssessment {
  const allItems = getMlpsChecks()
  const categorySummaries = {} as Record<MlpsCategory, { itemCount: number; passed: number; score: number }>
  for (const category of Object.keys(MLPS_CHECKS) as MlpsCategory[]) {
    const items = MLPS_CHECKS[category]
    const passed = items.filter(i => i.implemented).length
    const score = items.reduce((s, i) => s + i.score, 0) / items.length
    categorySummaries[category] = { itemCount: items.length, passed, score: Math.round(score) }
  }
  const overallScore = Math.round(allItems.reduce((s, i) => s + i.score, 0) / allItems.length)
  const complianceRate = Math.round((allItems.filter(i => i.implemented).length / allItems.length) * 100)
  return {
    systemName: 'G005-RIS',
    level,
    overallScore,
    complianceRate,
    categorySummaries,
    items: allItems,
    assessedAt: new Date().toISOString(),
    assessedBy: 'system',
  }
}

export function checkMlpsItem(id: string): MlpsCheckItem | undefined {
  return getMlpsChecks().find(i => i.id === id)
}
