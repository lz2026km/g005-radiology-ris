import { MockAiProvider } from './providers/MockAiProvider'
import { DeepSeekProvider } from './providers/DeepSeekProvider'
import { ReportGenerationEngine } from './engines/ReportGenerationEngine'
import { ReportReviewEngine } from './engines/ReportReviewEngine'
import { QualityScoringEngine } from './engines/QualityScoringEngine'
import type { AiProviderType, AiProviderConfig } from './interfaces/types'
import type { IReportGenerationProvider } from './interfaces/IReportGenerationProvider'
import type { IReportReviewProvider } from './interfaces/IReportReviewProvider'
import type { IQualityScoringProvider } from './interfaces/IQualityScoringProvider'

export type { IReportGenerationProvider, IReportReviewProvider, IQualityScoringProvider }
export type * from './interfaces/types'
export { ReportGenerationEngine, ReportReviewEngine, QualityScoringEngine }
export { MockAiProvider, DeepSeekProvider }

let _provider: (IReportGenerationProvider & IReportReviewProvider & IQualityScoringProvider) | null = null

export function getAiProviderType(): AiProviderType {
  const envType = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_AI_PROVIDER : undefined) as string | undefined
  if (envType === 'deepseek' || envType === 'openai' || envType === 'custom') return envType
  return 'mock'
}

export function createAiProvider(config?: Partial<AiProviderConfig>): IReportGenerationProvider & IReportReviewProvider & IQualityScoringProvider {
  const type = config?.type ?? getAiProviderType()
  switch (type) {
    case 'deepseek':
      return new DeepSeekProvider()
    case 'mock':
    default:
      return new MockAiProvider()
  }
}

export function getAiProvider(): IReportGenerationProvider & IReportReviewProvider & IQualityScoringProvider {
  if (!_provider) {
    _provider = createAiProvider()
  }
  return _provider
}

export function resetAiProvider(config?: Partial<AiProviderConfig>): void {
  _provider = createAiProvider(config)
}

export function createGenerationEngine(): ReportGenerationEngine {
  return new ReportGenerationEngine(getAiProvider())
}

export function createReviewEngine(): ReportReviewEngine {
  return new ReportReviewEngine(getAiProvider())
}

export function createScoringEngine(): QualityScoringEngine {
  return new QualityScoringEngine(getAiProvider())
}
