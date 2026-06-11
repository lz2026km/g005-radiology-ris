import type { IReportGenerationProvider } from '../interfaces/IReportGenerationProvider'
import type { ReportGenerationInput, ReportGenerationOutput, AiStreamChunk } from '../interfaces/types'

export class ReportGenerationEngine {
  constructor(private provider: IReportGenerationProvider) {}

  get providerName(): string {
    return this.provider.name
  }

  async generate(input: ReportGenerationInput): Promise<ReportGenerationOutput> {
    return this.provider.generateReport(input)
  }

  generateStream(input: ReportGenerationInput): AsyncGenerator<AiStreamChunk, ReportGenerationOutput, void> {
    return this.provider.generateReportStream(input)
  }
}
