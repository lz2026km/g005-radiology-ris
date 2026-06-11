/**
 * G005 放射RIS系统 v3.0.0 - 院长驾驶舱 V3 完整重构
 * Phase T3-W7: 全院核心指标 + 实时大屏
 */

import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  AppLayout,
  AppGrid,
  CardSection,
  AppStatistic,
  type SidebarItem,
} from '@components/antd';
import { Tag, Space, Button, Badge, Progress } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  ExperimentOutlined,
  DesktopOutlined,
  BarChartOutlined,
  RiseOutlined,
  AlertOutlined as AlertIcon,
  ClockCircleOutlined,
  UsergroupAddOutlined,
  MedicineBoxOutlined,
  FundOutlined,
  } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  } from 'recharts';

// ============= 侧边栏 =============
const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'dashboard', icon: <BarChartOutlined />, label: '院长驾驶舱', path: '/director-dashboard' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'devices', icon: <DesktopOutlined />, label: '设备', path: '/devices' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 数据 =============
const OVERVIEW = {
  todayExams: 247,
  todayExamsTrend: 12,
  totalExams: 12845,
  pendingReports: 97,
  criticalToday: 3,
  reportCompletion: 60.7,
  avgReportTime: 28,
  onTimeRate: 92.3,
  deviceUtil: 78.5,
  doctorOnDuty: 8,
  techOnDuty: 12,
  todayRevenue: 187600,
  monthRevenue: 5340000,
};

const DEPARTMENT_STATS = [
  { name: '放射科', today: 247, monthly: 6234, growth: 8.5, target: 7000 },
  { name: 'CT 室', today: 95, monthly: 2400, growth: 12.3, target: 2800 },
  { name: 'MR 室', today: 60, monthly: 1450, growth: 5.2, target: 1600 },
  { name: 'DR 室', today: 55, monthly: 1320, growth: 3.1, target: 1500 },
  { name: '超声科', today: 25, monthly: 620, growth: -1.5, target: 700 },
];

const MONTHLY_TREND = [
  { month: '1月', exams: 4200, revenue: 1950000 },
  { month: '2月', exams: 3800, revenue: 1750000 },
  { month: '3月', exams: 5100, revenue: 2380000 },
  { month: '4月', exams: 5500, revenue: 2580000 },
  { month: '5月', exams: 6100, revenue: 2870000 },
  { month: '6月', exams: 6234, revenue: 2950000 },
];

const EQUIPMENT_EFFICIENCY = [
  { name: 'CT-1', used: 92, color: '#22c55e' },
  { name: 'CT-2', used: 78, color: '#3b82f6' },
  { name: 'MR-1', used: 85, color: '#22c55e' },
  { name: 'MR-2', used: 45, color: '#f59e0b' },
  { name: 'DR-1', used: 65, color: '#3b82f6' },
  { name: 'DR-2', used: 30, color: '#dc2626' },
  { name: 'DSA-1', used: 72, color: '#3b82f6' },
  { name: 'US-1', used: 88, color: '#22c55e' },
];

const REAL_TIME_ALERTS = [
  { id: 1, level: 'critical', message: 'CT-1 设备报告:图像采集异常', time: '2 分钟前' },
  { id: 2, level: 'warning', message: 'MR-2 维护到期提醒', time: '15 分钟前' },
  { id: 3, level: 'critical', message: '危急值未处理:患者王某某', time: '20 分钟前' },
  { id: 4, level: 'info', message: '本月 AI 辅助报告达到 1500 份', time: '1 小时前' },
  { id: 5, level: 'warning', message: '磁盘空间使用率 78%', time: '2 小时前' },
];

const formatCurrency = (n: number) => `¥${(n / 10000).toFixed(1)}万`;

// ============= 主组件 =============
export default function DirectorDashboardV3Page(): JSX.Element {
  const { t } = useTranslation();

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '李院长', role: '院长' }} notificationCount={OVERVIEW.criticalToday}>
      <PageContainer
        title="院长驾驶舱"
        extra={
          <Space>
            <Badge count={REAL_TIME_ALERTS.filter((a) => a.level === 'critical').length} offset={[0, 2]}>
              <Button icon={<AlertIcon />}>实时预警</Button>
            </Badge>
            <Button type="primary" icon={<RiseOutlined />}>导出报告</Button>
          </Space>
        }
      >
        {/* 1. 核心 KPI(8 个) */}
        <AppGrid cols={4} gap={12} style={{ marginBottom: 16 }}>
          <CardSection>
            <AppStatistic
              title="今日检查量"
              value={OVERVIEW.todayExams}
              prefix={<FileTextOutlined />}
              trend={{ value: OVERVIEW.todayExamsTrend, positive: true }}
            />
          </CardSection>
          <CardSection>
            <AppStatistic
              title="累计检查(本年)"
              value={OVERVIEW.totalExams}
              prefix={<UsergroupAddOutlined />}
              color="#1e40af"
            />
          </CardSection>
          <CardSection>
            <AppStatistic
              title="危急值(今日)"
              value={OVERVIEW.criticalToday}
              prefix={<AlertOutlined />}
              color="#dc2626"
              trend={{ value: 25, positive: false }}
            />
          </CardSection>
          <CardSection>
            <AppStatistic
              title="本月收入"
              value={OVERVIEW.monthRevenue}
              prefix={<FundOutlined />}
              color="#059669"
              trend={{ value: 8.5, positive: true }}
            />
          </CardSection>
        </AppGrid>

        <AppGrid cols={4} gap={12} style={{ marginBottom: 16 }}>
          <CardSection>
            <AppStatistic
              title="待报告数"
              value={OVERVIEW.pendingReports}
              prefix={<ClockCircleOutlined />}
              color="#d97706"
            />
          </CardSection>
          <CardSection>
            <AppStatistic
              title="报告完成率"
              value={OVERVIEW.reportCompletion}
              precision={1}
              suffix="%"
              color="#059669"
              trend={{ value: 3, positive: true }}
            />
          </CardSection>
          <CardSection>
            <AppStatistic
              title="平均报告时间"
              value={OVERVIEW.avgReportTime}
              suffix="分钟"
              trend={{ value: 5, positive: true }}
            />
          </CardSection>
          <CardSection>
            <AppStatistic
              title="设备平均利用率"
              value={OVERVIEW.deviceUtil}
              precision={1}
              suffix="%"
              color="#1e40af"
            />
          </CardSection>
        </AppGrid>

        {/* 2. 月度趋势 + 收入 */}
        <AppGrid cols={2} gap={16} style={{ marginBottom: 16 }}>
          <CardSection title="月度检查量趋势(近 6 月)" extra={<RiseOutlined />}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="exams" stroke="#3b82f6" strokeWidth={2} name="检查数" />
              </LineChart>
            </ResponsiveContainer>
          </CardSection>

          <CardSection title="月度收入趋势(元)" extra={<FundOutlined />}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="收入" />
              </BarChart>
            </ResponsiveContainer>
          </CardSection>
        </AppGrid>

        {/* 3. 科室统计 + 设备效率 */}
        <AppGrid cols={2} gap={16} style={{ marginBottom: 16 }}>
          <CardSection title="科室月统计" extra={<UsergroupAddOutlined />}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {DEPARTMENT_STATS.map((dept) => (
                <div key={dept.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Space>
                      <strong>{dept.name}</strong>
                      <Tag>{dept.today} 今日</Tag>
                    </Space>
                    <Space>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{dept.monthly} / {dept.target}</span>
                      {dept.growth > 0 ? (
                        <Tag color="green">↑ {dept.growth}%</Tag>
                      ) : (
                        <Tag color="red">↓ {Math.abs(dept.growth)}%</Tag>
                      )}
                    </Space>
                  </div>
                   <div role="progressbar" aria-label={`${dept.name} 完成进度 ${Math.round((dept.monthly / dept.target) * 100)}%`} aria-valuenow={Math.round((dept.monthly / dept.target) * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div aria-hidden="true">
                      <Progress
                        percent={Math.round((dept.monthly / dept.target) * 100)}
                        strokeColor={dept.growth > 0 ? '#10b981' : '#dc2626'}
                        showInfo={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          </CardSection>

          <CardSection title="设备效率(当前利用率)" extra={<DesktopOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={EQUIPMENT_EFFICIENCY} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="used" name="利用率">
                  {EQUIPMENT_EFFICIENCY.map((entry, index) => (
                    <Bar key={`bar-${index}`}>
                      {/* Cell color via parent fill */}
                    </Bar>
                  ))}
                </Bar>
                <Bar dataKey="used" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <Space wrap style={{ marginTop: 8 }}>
              {EQUIPMENT_EFFICIENCY.map((eq) => (
                <Tag key={eq.name} color={eq.color}>
                  {eq.name}: {eq.used}%
                </Tag>
              ))}
            </Space>
          </CardSection>
        </AppGrid>

        {/* 4. 人员 + 实时预警 */}
        <AppGrid cols={2} gap={16} style={{ marginBottom: 16 }}>
          <CardSection title="值班人员" extra={<UserOutlined />}>
            <AppGrid cols={3} gap={12}>
              <CardSection>
                <AppStatistic title="值班医生" value={OVERVIEW.doctorOnDuty} suffix="人" prefix={<UserOutlined />} color="#1e40af" />
              </CardSection>
              <CardSection>
                <AppStatistic title="值班技师" value={OVERVIEW.techOnDuty} suffix="人" prefix={<MedicineBoxOutlined />} color="#059669" />
              </CardSection>
              <CardSection>
                <AppStatistic title="及时率" value={OVERVIEW.onTimeRate} precision={1} suffix="%" color="#d97706" />
              </CardSection>
            </AppGrid>
          </CardSection>

          <CardSection title="实时预警" extra={<AlertIcon />}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {REAL_TIME_ALERTS.map((alert) => {
                const colorMap = { critical: 'red', warning: 'orange', info: 'blue' };
                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: 8,
                      background: '#f8fafc',
                      borderLeft: `3px solid var(--color-${colorMap[alert.level as keyof typeof colorMap]}-500)`,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <Tag color={colorMap[alert.level as keyof typeof colorMap]}>
                          {alert.level === 'critical' ? '严重' : alert.level === 'warning' ? '警告' : '信息'}
                        </Tag>
                        <span style={{ fontSize: 13 }}>{alert.message}</span>
                      </Space>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{alert.time}</span>
                    </div>
                  </div>
                );
              })}
            </Space>
          </CardSection>
        </AppGrid>
      </PageContainer>
    </AppLayout>
  );
}
