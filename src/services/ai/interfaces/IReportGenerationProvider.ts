import type { ReportGenerationInput, ReportGenerationOutput, AiCompletionRequest, AiCompletionResponse, AiStreamChunk } from './types'

export interface IReportGenerationProvider {
  readonly name: string

  generateReport(input: ReportGenerationInput): Promise<ReportGenerationOutput>

  generateReportStream(input: ReportGenerationInput): AsyncGenerator<AiStreamChunk, ReportGenerationOutput, void>

  complete(request: AiCompletionRequest): Promise<AiCompletionResponse>

  completeStream(request: AiCompletionRequest): AsyncGenerator<AiStreamChunk, void, void>
}
