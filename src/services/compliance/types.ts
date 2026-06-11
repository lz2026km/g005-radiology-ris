export type ComplianceCategory =
  | 'identification'     // 身份鉴别
  | 'accessControl'      // 访问控制
  | 'securityAudit'      // 安全审计
  | 'residualInfo'       // 剩余信息保护
  | 'commConfidentiality' // 通信保密性
  | 'dataIntegrity'      // 数据完整性
  | 'dataBackup'         // 数据备份恢复
  | 'personalInfo'       // 个人信息保护
  | 'securityMgmt'       // 安全管理制度
  | 'incidentResponse'   // 应急响应

export interface ComplianceCheckItem {
  id: string
  category: ComplianceCategory
  name: string
  description: string
  required: boolean
  implemented: boolean
  score: number // 0-100
  evidence?: string
}

export interface ComplianceCategorySummary {
  category: ComplianceCategory
  name: string
  itemCount: number
  implementedCount: number
  averageScore: number
}

export interface ComplianceReport {
  overallScore: number
  overallCompliance: number // percentage
  lastAssessedAt: string
  categories: ComplianceCategorySummary[]
  items: ComplianceCheckItem[]
}

export interface IComplianceProvider {
  getReport(): Promise<ComplianceReport>
  checkItem(id: string): Promise<ComplianceCheckItem>
}
