import type { IReportReviewProvider } from '../interfaces/IReportReviewProvider'
import type { ReportReviewInput, ReportReviewOutput } from '../interfaces/types'

export class ReportReviewEngine {
  constructor(private provider: IReportReviewProvider) {}

  get providerName(): string {
    return this.provider.name
  }

  async review(input: ReportReviewInput): Promise<ReportReviewOutput> {
    return this.provider.reviewReport(input)
  }
}
