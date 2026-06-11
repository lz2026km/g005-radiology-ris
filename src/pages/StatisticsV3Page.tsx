/**
 * G005 放射RIS系统 v3.0.0 - 统计分析 V3 完整重构
 * Phase T3-W7: recharts + 业务组件 + 多维度统计
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  AppLayout,
  AppGrid,
  CardSection,
  AppDateRangeField,
  AppStatistic,
  type SidebarItem,
} from '@components/antd';
import { Tag, Space, Button, Segmented } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart as RechartsLine,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useToast } from '@components/antd';

// ============= 侧边栏 =============
const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'stats', icon: <BarChartOutlined />, label: '统计分析', path: '/statistics' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
];

// ============= 模拟数据 =============
const TODAY_STATS = {
  totalExams: 247,
  completedExams: 150,
  pendingReports: 97,
  criticalValues: 3,
  avgReportTime: 28,  // 分钟
  reportCompletion: 60.7,  // %
};

const WEEKLY_TREND = [
  { day: '周一', exams: 220, reports: 180, critical: 2 },
  { day: '周二', exams: 245, reports: 195, critical: 4 },
  { day: '周三', exams: 260, reports: 210, critical: 3 },
  { day: '周四', exams: 230, reports: 185, critical: 5 },
  { day: '周五', exams: 280, reports: 220, critical: 6 },
  { day: '周六', exams: 195, reports: 150, critical: 1 },
  { day: '周日', exams: 170, reports: 130, critical: 0 },
];

const MODALITY_DISTRIBUTION = [
  { name: 'CT', value: 95, color: '#3b82f6' },
  { name: 'MR', value: 60, color: '#8b5cf6' },
  { name: 'DR', value: 55, color: '#22c55e' },
  { name: 'US', value: 25, color: '#06b6d4' },
  { name: 'DSA', value: 8, color: '#f59e0b' },
  { name: 'MG', value: 4, color: '#ec4899' },
];

const DOCTOR_WORKLOAD = [
  { name: '张明远', exams: 38, reports: 32, avgTime: 25 },
  { name: '李慧敏', exams: 35, reports: 30, avgTime: 28 },
  { name: '王建华', exams: 42, reports: 35, avgTime: 22 },
  { name: '陈晓燕', exams: 30, reports: 26, avgTime: 30 },
  { name: '刘文博', exams: 36, reports: 31, avgTime: 26 },
  { name: '赵雪琴', exams: 33, reports: 28, avgTime: 24 },
];

const HOURLY_DISTRIBUTION = [
  { hour: '08:00', count: 12 },
  { hour: '09:00', count: 28 },
  { hour: '10:00', count: 35 },
  { hour: '11:00', count: 30 },
  { hour: '12:00', count: 15 },
  { hour: '13:00', count: 18 },
  { hour: '14:00', count: 32 },
  { hour: '15:00', count: 38 },
  { hour: '16:00', count: 25 },
  { hour: '17:00', count: 14 },
];

// ============= 主组件 =============
export default function StatisticsV3Page(): JSX.Element {
  const { t } = useTranslation();
  const toast = useToast();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customRange, setCustomRange] = useState<[string, string] | null>(null);

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '张明远', role: '主任医师' }}>
      <PageContainer
        title="统计分析"
        extra={
          <Space>
            <Segmented
              value={timeRange}
              onChange={(v) => setTimeRange(v as typeof timeRange)}
              options={[
                { label: '今日', value: 'today' },
                { label: '本周', value: 'week' },
                { label: '本月', value: 'month' },
                { label: '自定义', value: 'custom' },
              ]}
            />
            {timeRange === 'custom' && (
              <AppDateRangeField
                value={customRange as never}
                onChange={(value) => setCustomRange(value as [string, string] | null)}
                placeholder={['开始日期', '结束日期']}
              />
            )}
            <Button onClick={() => toast.success('已导出 Excel')}>导出 Excel</Button>
          </Space>
        }
      >
        {/* 关键 KPI */}
        <AppGrid cols={6} gap={12} style={{ marginBottom: 16 }}>
          <CardSection hoverable>
            <AppStatistic
              title="今日检查"
              value={TODAY_STATS.totalExams}
              trend={{ value: 12, positive: true }}
            />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic
              title="已完成报告"
              value={TODAY_STATS.completedExams}
              trend={{ value: 8, positive: true }}
            />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic
              title="待报告"
              value={TODAY_STATS.pendingReports}
              color="#d97706"
              trend={{ value: 15, positive: false }}
            />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic
              title="危急值"
              value={TODAY_STATS.criticalValues}
              color="#dc2626"
              prefix={<AlertOutlined />}
              trend={{ value: 25, positive: false }}
            />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic
              title="平均报告时间"
              value={TODAY_STATS.avgReportTime}
              suffix="分钟"
              trend={{ value: 5, positive: true }}
            />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic
              title="报告完成率"
              value={TODAY_STATS.reportCompletion}
              precision={1}
              suffix="%"
              color="#059669"
              trend={{ value: 3, positive: true }}
            />
          </CardSection>
        </AppGrid>

        {/* 趋势 + 分布 */}
        <AppGrid cols={2} gap={16} style={{ marginBottom: 16 }}>
          {/* 周趋势 */}
          <CardSection title="本周检查 / 报告趋势" extra={<LineChartOutlined />}>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsLine data={WEEKLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="exams" stroke="#3b82f6" strokeWidth={2} name="检查数" />
                <Line type="monotone" dataKey="reports" stroke="#10b981" strokeWidth={2} name="报告数" />
                <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} name="危急值" />
              </RechartsLine>
            </ResponsiveContainer>
          </CardSection>

          {/* 设备分布 */}
          <CardSection title="设备类型分布" extra={<PieChartOutlined />}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={MODALITY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                >
                  {MODALITY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardSection>
        </AppGrid>

        {/* 医生工作量 + 时段分布 */}
        <AppGrid cols={2} gap={16} style={{ marginBottom: 16 }}>
          {/* 医生工作量 */}
          <CardSection title="医生工作量(本周)" extra={<BarChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={DOCTOR_WORKLOAD}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="exams" fill="#3b82f6" name="检查" />
                <Bar dataKey="reports" fill="#10b981" name="报告" />
              </BarChart>
            </ResponsiveContainer>
          </CardSection>

          {/* 时段分布 */}
          <CardSection title="检查时段分布(今日)" extra={<BarChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={HOURLY_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardSection>
        </AppGrid>

        {/* 报告质量分布 */}
        <CardSection title="报告质量评分分布" extra={<Tag color="green">本月</Tag>}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { range: '90-100', count: 45, color: '#22c55e' },
                { range: '80-89', count: 38, color: '#3b82f6' },
                { range: '70-79', count: 18, color: '#f59e0b' },
                { range: '< 70', count: 5, color: '#dc2626' },
              ]}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="range" type="category" />
              <Tooltip />
              <Bar dataKey="count" name="报告数">
                {[
                  { color: '#22c55e' },
                  { color: '#3b82f6' },
                  { color: '#f59e0b' },
                  { color: '#dc2626' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardSection>
      </PageContainer>
    </AppLayout>
  );
}
