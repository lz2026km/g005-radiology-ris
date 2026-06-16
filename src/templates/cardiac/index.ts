import { generateCoronaryCtaReport } from './coronaryCtaReport'
import { generateCardiacMrReport } from './cardiacMrReport'
import { generateEchoReport } from './echoReport'
import { generateCathReport } from './cathReport'
import type { CoronaryCtaReport } from './coronaryCtaReport'
import type { CardiacMrReport } from './cardiacMrReport'
import type { EchoReport } from './echoReport'
import type { CathReport } from './cathReport'

export type CardiacReport = CoronaryCtaReport | CardiacMrReport | EchoReport | CathReport

export type CardiacReportType = 'coronary-cta' | 'cardiac-mr' | 'echocardiography' | 'catheterization'

export { generateCoronaryCtaReport, type CoronaryCtaReport } from './coronaryCtaReport'
export { generateCardiacMrReport, type CardiacMrReport } from './cardiacMrReport'
export { generateEchoReport, type EchoReport } from './echoReport'
export { generateCathReport, type CathReport } from './cathReport'

export function generateCardiacReport(type: CardiacReportType, data: any): CardiacReport {
  switch (type) {
    case 'coronary-cta':
      return generateCoronaryCtaReport(data)
    case 'cardiac-mr':
      return generateCardiacMrReport(data)
    case 'echocardiography':
      return generateEchoReport(data)
    case 'catheterization':
      return generateCathReport(data)
  }
}
