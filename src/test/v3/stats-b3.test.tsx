import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import QualityScoreTrendChart from '@/components/v3/stats/QualityScoreTrendChart'
import WorkloadHeatmap from '@/components/v3/stats/WorkloadHeatmap'
import ReportTimelinessChart from '@/components/v3/stats/ReportTimelinessChart'
import DiagnosticAccuracyGauge from '@/components/v3/stats/DiagnosticAccuracyGauge'
import type { QualityScorePoint } from '@/components/v3/stats/QualityScoreTrendChart'
import type { WorkloadCell } from '@/components/v3/stats/WorkloadHeatmap'
import type { TimelinessItem } from '@/components/v3/stats/ReportTimelinessChart'
import type { AccuracyData } from '@/components/v3/stats/DiagnosticAccuracyGauge'

const qualityData: QualityScorePoint[] = [
  { date: '2026-01-01', avgScore: 85, passRate: 92 },
  { date: '2026-01-02', avgScore: 87, passRate: 94 },
  { date: '2026-01-03', avgScore: 86, passRate: 93 },
]

const workloadData: WorkloadCell[] = [
  { doctor: '张医生', day: 'Mon', hour: '8:00', count: 5 },
  { doctor: '张医生', day: 'Mon', hour: '9:00', count: 10 },
  { doctor: '李医生', day: 'Tue', hour: '10:00', count: 15 },
]

const timelinessData: TimelinessItem[] = [
  { name: '张医生', onTime: 90, late: 10 },
  { name: '李医生', onTime: 85, late: 15 },
  { name: '王医生', onTime: 95, late: 5 },
]

const accuracyData: AccuracyData[] = [
  { name: '准确', value: 88, color: '#10b981' },
  { name: '基本准确', value: 8, color: '#f59e0b' },
  { name: '需修正', value: 3, color: '#ef4444' },
]

describe('B3 StatsDashboardV2', () => {
  describe('QualityScoreTrendChart', () => {
    it('renders without crashing', () => {
      const { container } = render(<QualityScoreTrendChart data={qualityData} />)
      expect(container.querySelector('.ant-card')).toBeTruthy()
    })

    it('renders recharts component', () => {
      const { container } = render(<QualityScoreTrendChart data={qualityData} />)
      expect(container.querySelector('.recharts-responsive-container')).toBeTruthy()
    })

    it('renders Segmented for range selection', () => {
      const { container } = render(<QualityScoreTrendChart data={qualityData} />)
      expect(container.querySelector('.ant-segmented')).toBeTruthy()
    })

    it('handles empty data', () => {
      const { container } = render(<QualityScoreTrendChart data={[]} />)
      expect(container.querySelector('.ant-card')).toBeTruthy()
    })
  })

  describe('WorkloadHeatmap', () => {
    it('renders doctor names from data', () => {
      const { container } = render(<WorkloadHeatmap data={workloadData} />)
      expect(container.textContent).toContain('张医生')
      expect(container.textContent).toContain('李医生')
    })

    it('renders hour headers', () => {
      const { container } = render(<WorkloadHeatmap data={workloadData} />)
      expect(container.textContent).toContain('8:00')
      expect(container.textContent).toContain('9:00')
    })

    it('renders with custom title', () => {
      const { container } = render(<WorkloadHeatmap data={workloadData} title="自定义标题" />)
      expect(container.textContent).toContain('自定义标题')
    })

    it('handles empty data', () => {
      const { container } = render(<WorkloadHeatmap data={[]} />)
      expect(container.querySelector('table')).toBeTruthy()
    })
  })

  describe('ReportTimelinessChart', () => {
    it('renders without crashing', () => {
      const { container } = render(<ReportTimelinessChart data={timelinessData} />)
      expect(container.querySelector('.ant-card')).toBeTruthy()
    })

    it('renders recharts component', () => {
      const { container } = render(<ReportTimelinessChart data={timelinessData} />)
      expect(container.querySelector('.recharts-responsive-container')).toBeTruthy()
    })
  })

  describe('DiagnosticAccuracyGauge', () => {
    it('renders without crashing', () => {
      const { container } = render(<DiagnosticAccuracyGauge data={accuracyData} overallRate={88} totalCases={1523} />)
      expect(container.querySelector('.ant-card')).toBeTruthy()
    })

    it('renders overall rate statistic', () => {
      const { container } = render(<DiagnosticAccuracyGauge data={accuracyData} overallRate={88} totalCases={1500} />)
      expect(container.textContent).toContain('1,500')
    })

    it('renders recharts pie chart', () => {
      const { container } = render(<DiagnosticAccuracyGauge data={accuracyData} overallRate={88} totalCases={1500} />)
      expect(container.querySelector('.recharts-responsive-container')).toBeTruthy()
    })

    it('handles empty data', () => {
      const { container } = render(<DiagnosticAccuracyGauge data={[]} overallRate={0} totalCases={0} />)
      expect(container.querySelector('.ant-card')).toBeTruthy()
    })
  })
})
