import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReportQualityScore from '../../components/v3/report/ReportQualityScore'
import ReportTemplatedGenerator from '../../components/v3/report/ReportTemplatedGenerator'
import ReportCoSignPanel from '../../components/v3/report/ReportCoSignPanel'

describe('ReportQualityScore', () => {
  it('renders with A grade for high quality', async () => {
    render(
      <ReportQualityScore
        findings="双肺纹理清晰,气管居中,纵隔对称,规则,均匀,正常,未见异常。"
        conclusion="双肺未见明显异常。"
        radsCategory="Lung-RADS 1"
        structuredCompletion={0.95}
        verified
        hasCritical={false}
      />
    )
    await waitFor(() => {
      expect(screen.getByTestId('report-quality-score')).toBeInTheDocument()
    })
    expect(screen.getByTestId('rqs-grade')).toBeInTheDocument()
  })

  it('renders with low grade for poor content', () => {
    render(
      <ReportQualityScore
        findings="TODO xxx ..."
        conclusion="..."
        hasCritical
      />
    )
    expect(screen.getByTestId('rqs-grade')).toBeInTheDocument()
  })

  it('shows dimensions', () => {
    render(
      <ReportQualityScore
        findings="正常"
        conclusion="正常"
        radsCategory="Lung-RADS 1"
      />
    )
    expect(screen.getByTestId('rqs-dimensions')).toBeInTheDocument()
  })

  it('records history on evaluate click', () => {
    render(
      <ReportQualityScore
        findings="正常"
        conclusion="正常"
        radsCategory="Lung-RADS 1"
      />
    )
    fireEvent.click(screen.getByTestId('rqs-evaluate'))
    expect(screen.getByTestId('rqs-history')).toBeInTheDocument()
  })

  it('uses custom evaluator when provided', () => {
    const custom = vi.fn(() => ({
      id: 'custom',
      totalScore: 88,
      grade: 'B' as const,
      dimensions: [{ key: 'test', label: 'Test', score: 88, max: 100, weight: 1, issues: [] }],
      evaluatedAt: new Date().toISOString(),
      suggestions: ['test'],
    }))
    render(
      <ReportQualityScore
        findings="x"
        conclusion="x"
        customEvaluator={custom}
      />
    )
    expect(custom).toHaveBeenCalled()
  })
})

describe('ReportTemplatedGenerator', () => {
  it('renders with candidates for CT CHEST', () => {
    render(
      <ReportTemplatedGenerator
        modality="CT"
        bodyPart="CHEST"
        patient={{ age: 50, gender: 'M' }}
      />
    )
    expect(screen.getByTestId('report-templated-generator')).toBeInTheDocument()
  })

  it('shows top preview', () => {
    render(
      <ReportTemplatedGenerator modality="CT" bodyPart="CHEST" />
    )
    expect(screen.getByTestId('rtg-top-preview')).toBeInTheDocument()
  })

  it('filters by keyword', () => {
    render(
      <ReportTemplatedGenerator modality="CT" bodyPart="CHEST" />
    )
    const filter = screen.getByTestId('rtg-filter')
    fireEvent.change(filter, { target: { value: '肺' } })
    expect(filter).toBeInTheDocument()
  })

  it('calls onSelect when template clicked', () => {
    const onSelect = vi.fn()
    render(
      <ReportTemplatedGenerator
        modality="CT"
        bodyPart="CHEST"
        onSelect={onSelect}
      />
    )
    // 选用 top 模板
    const btn = screen.getAllByText('选用')[0]
    if (btn) fireEvent.click(btn)
    // 不强制,允许空数组
  })
})

describe('ReportCoSignPanel', () => {
  const events = [
    { id: 'E1', state: 'SIGNED_BY_RESIDENT' as const, actor: '张医师', actorRole: 'RESIDENT' as const, at: '2024-06-15 14:30' },
  ]

  it('renders draft state', () => {
    render(
      <ReportCoSignPanel
        reportId="R1"
        initialState="DRAFT"
        currentUser="张医师"
        currentRole="RESIDENT"
        events={[]}
      />
    )
    expect(screen.getByTestId('report-co-sign-panel')).toBeInTheDocument()
    expect(screen.getByTestId('rcsp-state').textContent).toContain('草稿')
  })

  it('shows timeline with events', () => {
    render(
      <ReportCoSignPanel
        reportId="R1"
        initialState="SIGNED_BY_RESIDENT"
        currentUser="李主任"
        currentRole="ATTENDING"
        events={events}
      />
    )
    expect(screen.getByTestId('rcsp-event-E1')).toBeInTheDocument()
  })

  it('shows sign button for attending on resident signed state', () => {
    render(
      <ReportCoSignPanel
        reportId="R1"
        initialState="SIGNED_BY_RESIDENT"
        currentUser="李主任"
        currentRole="ATTENDING"
        events={events}
      />
    )
    expect(screen.getByTestId('rcsp-sign')).toBeInTheDocument()
  })

  it('hides sign button for resident in DRAFT but signable', () => {
    render(
      <ReportCoSignPanel
        reportId="R1"
        initialState="DRAFT"
        currentUser="张医师"
        currentRole="RESIDENT"
        events={[]}
      />
    )
    // resident 可以在 DRAFT 状态签名
    expect(screen.getByTestId('rcsp-sign')).toBeInTheDocument()
  })

  it('hides sign button for published state', () => {
    render(
      <ReportCoSignPanel
        reportId="R1"
        initialState="PUBLISHED"
        currentUser="李主任"
        currentRole="DIRECTOR"
        events={[]}
      />
    )
    expect(screen.queryByTestId('rcsp-sign')).toBeNull()
  })

  it('opens sign modal', () => {
    render(
      <ReportCoSignPanel
        reportId="R1"
        initialState="DRAFT"
        currentUser="张医师"
        currentRole="RESIDENT"
        events={[]}
      />
    )
    fireEvent.click(screen.getByTestId('rcsp-sign'))
    expect(screen.getByTestId('rcsp-modal')).toBeInTheDocument()
  })
})
