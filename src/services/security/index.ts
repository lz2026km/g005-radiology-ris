export { assessMlps, getMlpsChecks, getMlpsChecksByCategory, checkMlpsItem } from './mlps'
export type { MlpsCategory, MlpsCheckItem, MlpsAssessment } from './mlps'
export { runBaselineScan, getBaselineTrend, SECURITY_BASELINE_CHECKS } from './baseline'
export type { SecurityBaselineCheck, BaselineReport } from './baseline'

export function getOverallSecurityStatus(): { level: number; score: number; complianceRate: number } {
  const assessment = assessMlps()
  return { level: assessment.level, score: assessment.overallScore, complianceRate: assessment.complianceRate }
}
