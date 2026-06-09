/**
 * G005 放射RIS系统 v3.0.2 - 危急值升级统计仪表盘
 */
import React, { useMemo } from 'react'
import { Card, Tag, Statistic, Row, Col, Progress, Empty, Table, Tooltip } from 'antd'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { TrendingUp, AlertOctagon, CheckCircle2, Clock, Building2, User, BarChart3 } from 'lucide-react'
import type { CriticalValueV2 } from './CriticalEscalationV2'

const COLORS = ['#dc2626', '#ca8a04', '#2563eb', '#16a34a', '#7c3aed', '#0891b2']

export interface CriticalStatsDashboardProps {
  values: CriticalValueV2[]
  /** 时间范围(天) */
  days?: number
}

export const CriticalStatsDashboard: React.FC<CriticalStatsDashboardProps> = ({ values, days = 30 }) => {
  const data = useMemo(() => {
    const cutoff = Date.now() - days * 24 * 3600 * 1000
    const recent = values.filter((v) => new Date(v.triggeredAt).getTime() > cutoff)

    // 类别分布
    const byCategory = Object.entries(
      recent.reduce<Record<string, number>>((acc, v) => {
        acc[v.category] = (acc[v.category] ?? 0) + 1
        return acc
      }, {})
    ).map(([k, v]) => ({ name: k, value: v }))

    // 状态分布
    const byStatus = Object.entries(
      recent.reduce<Record<string, number>>((acc, v) => {
        acc[v.notifyStatus] = (acc[v.notifyStatus] ?? 0) + 1
        return acc
      }, {})
    ).map(([k, v]) => ({ name: k, value: v }))

    // 接收方 Top
    const byRecipient = Object.entries(
      recent.reduce<Record<string, number>>((acc, v) => {
        acc[v.recipient] = (acc[v.recipient] ?? 0) + 1
        return acc
      }, {})
    )
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // 每天触发数(按类别)
    const dailyMap: Record<string, Record<string, number>> = {}
    const catKeys = ['LIFE_THREATENING', 'URGENT', 'IMPORTANT']
    recent.forEach((v) => {
      const d = v.triggeredAt.split('T')[0]
      if (!dailyMap[d]) dailyMap[d] = Object.fromEntries(catKeys.map((c) => [c, 0]))
      dailyMap[d][v.category] = (dailyMap[d][v.category] ?? 0) + 1
    })
    const daily = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([d, counts]) => ({ date: d.slice(5), ...counts }))

    // 平均响应时间
    const acked = recent.filter((v) => v.ackedAt)
    const avgResponseTime = acked.length
      ? Math.round(
          acked.reduce((s, v) => s + (new Date(v.ackedAt!).getTime() - new Date(v.triggeredAt).getTime()), 0) /
            acked.length /
            1000
        )
      : 0

    // 超时率
    const overdueRate = recent.length
      ? (recent.filter((v) => {
          const sla = v.category === 'LIFE_THREATENING' ? 300 : v.category === 'URGENT' ? 1800 : 3600
          return (
            new Date(v.ackedAt ?? v.triggeredAt).getTime() - new Date(v.triggeredAt).getTime() >
            sla * 1000
          )
        }).length /
          recent.length) *
        100
      : 0

    return { recent, byCategory, byStatus, byRecipient, daily, avgResponseTime, overdueRate, catKeys }
  }, [values, days])

  if (data.recent.length === 0) return <Empty description={`近 ${days} 天无危急值数据`} />

  return (
    <div data-testid="critical-stats-dashboard">
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <Card>
            <Statistic title={`近 ${days} 天危急值`} value={data.recent.length} prefix={<AlertOctagon size={14} color="#dc2626" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均响应" value={`${data.avgResponseTime}秒`} prefix={<Clock size={14} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="超时率" value={data.overdueRate.toFixed(1)} suffix="%" valueStyle={{ color: data.overdueRate > 10 ? '#dc2626' : '#16a34a' }} />
            <Progress percent={data.overdueRate} size="small" status={data.overdueRate > 10 ? 'exception' : 'normal'} showInfo={false} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="完成数" value={data.recent.filter((v) => v.notifyStatus === 'COMPLETED' || v.notifyStatus === 'ACKED').length} prefix={<CheckCircle2 size={14} color="#16a34a" />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Card size="small" title="按类别分布" data-testid="cv-stats-category">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {data.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="按状态分布" data-testid="cv-stats-status">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={14}>
          <Card size="small" title="近 30 天每日触发(分类)" data-testid="cv-stats-daily">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RTooltip />
                <Legend />
                {data.catKeys.map((c, i) => (
                  <Line key={c} type="monotone" dataKey={c} stroke={COLORS[i]} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card size="small" title="接收方 Top 10" data-testid="cv-stats-recipient">
            <Table
              size="small"
              dataSource={data.byRecipient.map((r, i) => ({ ...r, key: i }))}
              pagination={false}
              columns={[
                { title: '医师', dataIndex: 'name', render: (v) => <span><User size={10} /> {v}</span> },
                { title: '次数', dataIndex: 'value', width: 60, render: (v) => <Tag color="red">{v}</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CriticalStatsDashboard
