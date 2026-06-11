import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from 'antd'
import { CHART_COLORS } from '../../../utils/chartColors'

export interface TimelinessItem {
  name: string
  onTime: number
  late: number
}

interface ReportTimelinessChartProps {
  data: TimelinessItem[]
}

export default function ReportTimelinessChart({ data }: ReportTimelinessChartProps) {
  const { t } = useTranslation()

  return (
    <Card title={t('v3statsV2.reportTimeliness')}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Legend />
          <Bar dataKey="onTime" stackId="a" fill={CHART_COLORS.success} name={t('v3statsV2.onTimeRate')} />
          <Bar dataKey="late" stackId="a" fill={CHART_COLORS.error} name={t('v3statsV2.reportCount')} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
