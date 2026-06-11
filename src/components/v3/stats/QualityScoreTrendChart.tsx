import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, Space, Segmented } from 'antd'
import { useState } from 'react'
import { CHART_COLORS } from '../../../utils/chartColors'

export interface QualityScorePoint {
  date: string
  avgScore: number
  passRate: number
}

interface QualityScoreTrendChartProps {
  data: QualityScorePoint[]
}

type Range = '7d' | '30d' | '90d'

const RANGE_DAYS: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90 }

export default function QualityScoreTrendChart({ data }: QualityScoreTrendChartProps) {
  const { t } = useTranslation()
  const [range, setRange] = useState<Range>('30d')

  const filtered = data.slice(-RANGE_DAYS[range])

  return (
    <Card
      title={t('v3statsV2.qualityScoreTrend')}
      extra={
        <Segmented
          value={range}
          onChange={(v) => setRange(v as Range)}
          options={[
            { value: '7d', label: t('v3statsV2.last7days') },
            { value: '30d', label: t('v3statsV2.last30days') },
            { value: '90d', label: t('v3statsV2.lastQuarter') },
          ]}
        />
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avgScore" stroke={CHART_COLORS.primary} strokeWidth={2} name={t('v3statsV2.avgQualityScore')} />
          <Line type="monotone" dataKey="passRate" stroke={CHART_COLORS.success} strokeWidth={2} name={t('v3statsV2.accuracyRate')} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
