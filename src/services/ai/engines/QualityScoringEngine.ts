import type { IQualityScoringProvider } from '../interfaces/IQualityScoringProvider'
import type { QualityScoringInput, QualityScoringOutput } from '../interfaces/types'

export class QualityScoringEngine {
  constructor(private provider: IQualityScoringProvider) {}

  get providerName(): string {
    return this.provider.name
  }

  async score(input: QualityScoringInput): Promise<QualityScoringOutput> {
    return this.provider.scoreReport(input)
  }
}
