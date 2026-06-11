import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockAiProvider } from '../../services/ai/providers/MockAiProvider'
import { createAiProvider, createGenerationEngine, createReviewEngine, createScoringEngine, resetAiProvider } from '../../services/ai'
import { AiReviewIntegrated } from '../../components/v3/report/AiReviewIntegrated'
import type { ReportGenerationInput, ReportReviewInput, QualityScoringInput } from '../../services/ai'

describe('MockAiProvider', () => {
  let provider: MockAiProvider

  beforeEach(() => {
    provider = new MockAiProvider()
  })

  it('generates report', async () => {
    const input: ReportGenerationInput = { modality: 'CT', bodyPart: '胸部', findings: '双肺纹理清晰' }
    const result = await provider.generateReport(input)
    expect(result.reportText).toBeTruthy()
    expect(result.sections.length).toBeGreaterThanOrEqual(3)
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('reviews report', async () => {
    const input: ReportReviewInput = { reportText: 'test', findings: '所见正常', conclusion: '未见异常' }
    const result = await provider.reviewReport(input)
    expect(result.issues).toBeDefined()
    expect(result.overallScore).toBeGreaterThan(0)
  })

  it('scores report', async () => {
    const input: QualityScoringInput = {
      reportText: 'normal', findings: '双肺纹理清晰正常未见异常', conclusion: '未见明显异常',
      radsCategory: 'Lung-RADS 1', hasCritical: false,
    }
    const result = await provider.scoreReport(input)
    expect(result.totalScore).toBeGreaterThan(0)
    expect(result.grade).toBeDefined()
    expect(result.dimensions.length).toBeGreaterThan(0)
    expect(result.evaluatedAt).toBeTruthy()
  })

  it('completes messages', async () => {
    const result = await provider.complete({ messages: [{ role: 'user', content: 'hello' }] })
    expect(result.id).toContain('mock')
    expect(result.content).toBeTruthy()
    expect(result.finishReason).toBe('stop')
  })
})

describe('Engine wrappers', () => {
  it('ReportGenerationEngine delegates to provider', async () => {
    const engine = createGenerationEngine()
    expect(engine.providerName).toBe('mock')
    const result = await engine.generate({ modality: 'CT', bodyPart: '头', findings: '正常' })
    expect(result.reportText).toBeTruthy()
  })

  it('ReportReviewEngine delegates to provider', async () => {
    const engine = createReviewEngine()
    const result = await engine.review({ reportText: 'test', findings: '正常', conclusion: '正常' })
    expect(result.issues).toBeDefined()
  })

  it('QualityScoringEngine delegates to provider', async () => {
    const engine = createScoringEngine()
    const result = await engine.score({ reportText: 'test', findings: '正常', conclusion: '正常' })
    expect(result.totalScore).toBeGreaterThan(0)
  })
})

describe('createAiProvider', () => {
  it('returns MockAiProvider by default', () => {
    const provider = createAiProvider()
    expect(provider.name).toBe('mock')
  })

  it('allows reset with mock type', () => {
    resetAiProvider({ type: 'mock' })
    const provider = createAiProvider()
    expect(provider.name).toBe('mock')
  })
})

describe('AiReviewIntegrated', () => {
  it('renders and triggers review', async () => {
    render(<AiReviewIntegrated reportText="test report" findings="双肺纹理清晰" conclusion="未见异常" />)
    expect(screen.getByTestId('ai-review-integrated')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ai-review-start'))
    await waitFor(() => {
      expect(screen.queryByTestId('ai-review-start')).not.toBeInTheDocument()
    })
  })
})
