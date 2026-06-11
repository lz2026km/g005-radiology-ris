import type { QualityScoringInput, QualityScoringOutput } from './types'

export interface IQualityScoringProvider {
  readonly name: string

  scoreReport(input: QualityScoringInput): Promise<QualityScoringOutput>
}
