export interface SecurityBaselineCheck {
  id: string
  name: string
  category: 'os' | 'network' | 'application' | 'database'
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  recommendedValue: string
  actualValue?: string
  compliant: boolean
}

export interface BaselineReport {
  timestamp: string
  totalChecks: number
  passed: number
  failed: number
  complianceRate: number
  checks: SecurityBaselineCheck[]
}

export const SECURITY_BASELINE_CHECKS: SecurityBaselineCheck[] = [
  { id: 'OS-01', name: 'OS Patch Level', category: 'os', severity: 'critical', description: '操作系统安全补丁级别', recommendedValue: 'Latest', compliant: false },
  { id: 'OS-02', name: 'Unnecessary Services', category: 'os', severity: 'high', description: '禁用不必要的系统服务', recommendedValue: 'Minimal', compliant: false },
  { id: 'OS-03', name: 'File Permissions', category: 'os', severity: 'high', description: '敏感文件权限最小化', recommendedValue: '600/700', compliant: false },
  { id: 'NET-01', name: 'Firewall Rules', category: 'network', severity: 'critical', description: '防火墙规则最小开放原则', recommendedValue: 'Whitelist only', compliant: false },
  { id: 'NET-02', name: 'TLS Version', category: 'network', severity: 'high', description: 'TLS版本检查', recommendedValue: 'TLS 1.2+', compliant: true },
  { id: 'APP-01', name: 'Auth Hardening', category: 'application', severity: 'critical', description: '身份鉴别强化', recommendedValue: 'MFA + strong password', compliant: false },
  { id: 'APP-02', name: 'Session Management', category: 'application', severity: 'high', description: '会话超时与销毁', recommendedValue: '15min idle timeout', compliant: false },
  { id: 'DB-01', name: 'DB Access Control', category: 'database', severity: 'critical', description: '数据库访问白名单', recommendedValue: 'Application-only access', compliant: false },
  { id: 'DB-02', name: 'DB Audit Log', category: 'database', severity: 'high', description: '数据库审计日志启用', recommendedValue: 'Enabled with retention', compliant: false },
]

export function runBaselineScan(): BaselineReport {
  const checks = SECURITY_BASELINE_CHECKS.map(c => ({ ...c }))
  const passed = checks.filter(c => c.compliant).length
  return {
    timestamp: new Date().toISOString(),
    totalChecks: checks.length,
    passed,
    failed: checks.length - passed,
    complianceRate: Math.round((passed / checks.length) * 100),
    checks,
  }
}

export function getBaselineTrend(): { date: string; rate: number }[] {
  return [{ date: new Date().toISOString().slice(0, 10), rate: 60 }]
}
