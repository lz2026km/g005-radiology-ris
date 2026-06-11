import type { ReportReviewInput, ReportReviewOutput } from './types'

export interface IReportReviewProvider {
  readonly name: string

  reviewReport(input: ReportReviewInput): Promise<ReportReviewOutput>
}
