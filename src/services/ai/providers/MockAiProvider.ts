import type {
  AiCompletionRequest,
  AiCompletionResponse,
  AiStreamChunk,
  ReportGenerationInput,
  ReportGenerationOutput,
  ReportReviewInput,
  ReportReviewOutput,
  ReviewIssue,
  QualityScoringInput,
  QualityScoringOutput,
  QualityDimension,
} from '../interfaces/types'
import type { IReportGenerationProvider } from '../interfaces/IReportGenerationProvider'
import type { IReportReviewProvider } from '../interfaces/IReportReviewProvider'
import type { IQualityScoringProvider } from '../interfaces/IQualityScoringProvider'

export class MockAiProvider implements IReportGenerationProvider, IReportReviewProvider, IQualityScoringProvider {
  readonly name = 'mock'

  private delay = 800

  private mockGenerateSections(input: ReportGenerationInput): Array<{ heading: string; content: string }> {
    const sections = [
      {
        heading: '检查技术',
        content: `${input.modality} 平扫 + 增强扫描，层厚 5mm，层间距 5mm。`,
      },
      {
        heading: '影像所见',
        content: input.findings || `${input.bodyPart} 显示清晰，未见明确异常密度/信号影。`,
      },
    ]
    if (input.impression) {
      sections.push({ heading: '影像诊断', content: input.impression })
    }
    sections.push({
      heading: '建议',
      content: '建议定期随访，必要时进一步检查。',
    })
    return sections
  }

  async generateReport(input: ReportGenerationInput): Promise<ReportGenerationOutput> {
    await new Promise((r) => setTimeout(r, this.delay))
    const sections = this.mockGenerateSections(input)
    return {
      reportText: sections.map((s) => `## ${s.heading}\n${s.content}`).join('\n\n'),
      sections,
      confidence: 0.85,
      criticalFindings: [],
    }
  }

  async *generateReportStream(
    input: ReportGenerationInput,
  ): AsyncGenerator<AiStreamChunk, ReportGenerationOutput, void> {
    const sections = this.mockGenerateSections(input)
    for (const sec of sections) {
      for (const char of sec.content) {
        yield { id: 'mock-' + Date.now(), content: char, finishReason: null }
        await new Promise((r) => setTimeout(r, 10))
      }
    }
    return {
      reportText: sections.map((s) => `## ${s.heading}\n${s.content}`).join('\n\n'),
      sections,
      confidence: 0.85,
      criticalFindings: [],
    }
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    await new Promise((r) => setTimeout(r, this.delay))
    return {
      id: 'mock-' + Date.now(),
      content: `[Mock] AI 响应: 收到 ${request.messages.length} 条消息`,
      finishReason: 'stop',
      usage: { promptTokens: 50, completionTokens: 20 },
    }
  }

  async *completeStream(request: AiCompletionRequest): AsyncGenerator<AiStreamChunk, void, void> {
    const text = `[Mock] AI 流式响应: 收到 ${request.messages.length} 条消息`
    for (const char of text) {
      yield { id: 'mock-' + Date.now(), content: char, finishReason: null }
      await new Promise((r) => setTimeout(r, 10))
    }
  }

  async reviewReport(input: ReportReviewInput): Promise<ReportReviewOutput> {
    await new Promise((r) => setTimeout(r, this.delay))
    const issues: ReviewIssue[] = []
    if (input.findings.length < 20) {
      issues.push({
        id: 'mock-len-findings',
        severity: 'warning',
        category: 'completeness',
        field: 'findings',
        message: '所见过短，建议补充详细描述',
        suggestion: '补充影像所见的具体描述',
      })
    }
    if (input.conclusion.length < 10) {
      issues.push({
        id: 'mock-len-conclusion',
        severity: 'warning',
        category: 'completeness',
        field: 'conclusion',
        message: '结论过短，建议明确诊断意见',
        suggestion: '给出明确的诊断结论',
      })
    }
    return {
      issues,
      summary: `发现 ${issues.length} 个问题，其中 ${issues.filter((i) => i.severity === 'error').length} 个错误`,
      overallScore: Math.max(60, 100 - issues.length * 10),
    }
  }

  async scoreReport(input: QualityScoringInput): Promise<QualityScoringOutput> {
    await new Promise((r) => setTimeout(r, this.delay))
    const dimensions: QualityDimension[] = [
      {
        key: 'completeness',
        label: '完整度',
        score: input.findings.length > 50 ? 18 : 10,
        max: 20,
        weight: 0.2,
        issues: input.findings.length <= 50 ? ['所见过短'] : [],
      },
      {
        key: 'terminology',
        label: '术语规范',
        score: 16,
        max: 20,
        weight: 0.2,
        issues: [],
      },
      {
        key: 'rads',
        label: 'RADS标注',
        score: input.radsCategory ? 15 : 0,
        max: 15,
        weight: 0.15,
        issues: input.radsCategory ? [] : ['未标注RADS分类'],
      },
      {
        key: 'clarity',
        label: '结论清晰度',
        score: input.conclusion.length > 30 ? 15 : 8,
        max: 15,
        weight: 0.15,
        issues: input.conclusion.length <= 30 ? ['结论可更详细'] : [],
      },
      {
        key: 'length',
        label: '长度合理',
        score: 10,
        max: 10,
        weight: 0.1,
        issues: [],
      },
      {
        key: 'blacklist',
        label: '黑名单规避',
        score: 10,
        max: 10,
        weight: 0.1,
        issues: [],
      },
      {
        key: 'critical',
        label: '危急值标注',
        score: input.hasCritical ? 5 : 0,
        max: 5,
        weight: 0.05,
        issues: input.hasCritical ? [] : ['未标注危急值'],
      },
      {
        key: 'verified',
        label: '审核完成',
        score: 5,
        max: 5,
        weight: 0.05,
        issues: [],
      },
    ]
    const totalScore = dimensions.reduce((s, d) => s + d.score, 0)
    const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
      totalScore >= 90 ? 'A' : totalScore >= 80 ? 'B' : totalScore >= 70 ? 'C' : totalScore >= 60 ? 'D' : 'F'
    return {
      totalScore,
      grade,
      dimensions,
      suggestions: dimensions.filter((d) => d.issues.length > 0).map((d) => `${d.label}: ${d.issues.join(';')}`),
      evaluatedAt: new Date().toISOString(),
    }
  }
}
