import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card } from 'antd'
import { CHART_COLORS } from '../../../utils/chartColors'
import { ChartContainer } from '../../charts'

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
      <ChartContainer height={300} state={data.length === 0 ? 'empty' : 'ready'} emptyDescription="暂无数据">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Legend verticalAlign="bottom" align="center" />
          <Bar dataKey="onTime" stackId="a" fill={CHART_COLORS.success} name={t('v3statsV2.onTimeRate')} />
          <Bar dataKey="late" stackId="a" fill={CHART_COLORS.error} name={t('v3statsV2.reportCount')} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
