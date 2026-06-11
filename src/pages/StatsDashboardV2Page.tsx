import { useTranslation } from 'react-i18next'
import { Row, Col, Typography, Space, Tag } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import AppLayout from '@/layouts/AppLayout'
import { SIDEBAR_ITEMS } from '@/routes/sidebarConfig'
import QualityScoreTrendChart from '@/components/v3/stats/QualityScoreTrendChart'
import WorkloadHeatmap from '@/components/v3/stats/WorkloadHeatmap'
import ReportTimelinessChart from '@/components/v3/stats/ReportTimelinessChart'
import DiagnosticAccuracyGauge from '@/components/v3/stats/DiagnosticAccuracyGauge'
import type { QualityScorePoint } from '@/components/v3/stats/QualityScoreTrendChart'
import type { WorkloadCell } from '@/components/v3/stats/WorkloadHeatmap'
import type { TimelinessItem } from '@/components/v3/stats/ReportTimelinessChart'
import type { AccuracyData } from '@/components/v3/stats/DiagnosticAccuracyGauge'

const { Title } = Typography

const qualityScoreData: QualityScorePoint[] = Array.from({ length: 90 }, (_, i) => ({
  date: new Date(Date.now() - (89 - i) * 86400000).toISOString().slice(0, 10),
  avgScore: 85 + Math.round(Math.random() * 10 - 3),
  passRate: 92 + Math.round(Math.random() * 6 - 2),
}))

const doctors = ['张医生', '李医生', '王医生', '赵医生', '陈医生']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const workloadData: WorkloadCell[] = doctors.flatMap((doctor) =>
  days.flatMap((day) =>
    Array.from({ length: 12 }, (_, i) => ({
      doctor,
      day,
      hour: `${i + 8}:00`,
      count: Math.round(Math.random() * 40),
    }))
  )
)

const timelinessData: TimelinessItem[] = doctors.map((name) => ({
  name,
  onTime: 80 + Math.round(Math.random() * 15),
  late: Math.round(Math.random() * 10),
}))

const accuracyData: AccuracyData[] = [
  { name: '准确', value: 88, color: '#10b981' },
  { name: '基本准确', value: 8, color: '#f59e0b' },
  { name: '需修正', value: 3, color: '#ef4444' },
  { name: '不准确', value: 1, color: '#6b7280' },
]

const user = { name: '演示用户', role: '主任' as const }

export default function StatsDashboardV2Page(): JSX.Element {
  const { t } = useTranslation()

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={user} notificationCount={0}>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space align="center">
            <BarChartOutlined style={{ fontSize: 24, color: '#1e3a5f' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>{t('v3statsV2.pageTitle')}</Title>
              <Tag color="blue">v3.0.2.3</Tag>
            </div>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <QualityScoreTrendChart data={qualityScoreData} />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={14}>
            <WorkloadHeatmap data={workloadData} />
          </Col>
          <Col xs={24} lg={10}>
            <DiagnosticAccuracyGauge
              data={accuracyData}
              overallRate={88}
              totalCases={1523}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <ReportTimelinessChart data={timelinessData} />
          </Col>
        </Row>
      </div>
    </AppLayout>
  )
}
