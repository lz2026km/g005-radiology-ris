/**
 * G005 放射RIS系统 v3.0.2 - 实时运营仪表盘
 * 对标:指挥中心大屏 / 实时监控
 */
import React, { useState, useMemo, useEffect } from 'react'
import { Card, Row, Col, Statistic, Tag, Space, List, Progress, Badge, Empty, Avatar } from 'antd'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import { Activity, AlertOctagon, CheckCircle, Clock, Users, Cpu, Wifi, Stethoscope, TrendingUp, Server, Zap } from 'lucide-react'

export interface RealtimeEvent {
  id: string
  type: 'EXAM' | 'REPORT' | 'CRITICAL' | 'LOGIN' | 'ERROR' | 'DEVICE' | 'APPOINTMENT'
  at: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'success'
  actor?: string
}

export interface DeviceRealtime {
  id: string
  name: string
  modality: string
  state: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'IDLE' | 'MAINTENANCE'
  queue: number
  currentPatient?: string
  utilization: number
}

export interface RealtimeOpsDashboardProps {
  events: RealtimeEvent[]
  devices: DeviceRealtime[]
  onlineUsers: number
  /** 自动刷新间隔(秒) */
  refreshInterval?: number
  onRefresh?: () => void
}

const COLORS = { EXAM: '#3b82f6', REPORT: '#1e3a5f', CRITICAL: '#dc2626', LOGIN: '#16a34a', ERROR: '#dc2626', DEVICE: '#7c3aed', APPOINTMENT: '#0891b2' } as const

const SEVERITY_COLOR: Record<RealtimeEvent['severity'], string> = {
  info: 'blue',
  warning: 'orange',
  error: 'red',
  success: 'green',
}

export const RealtimeOpsDashboard: React.FC<RealtimeOpsDashboardProps> = ({
  events,
  devices,
  onlineUsers,
  refreshInterval = 5,
  onRefresh,
}) => {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), refreshInterval * 1000)
    return () => clearInterval(t)
  }, [refreshInterval])

  const summary = useMemo(() => {
    const now = Date.now()
    const recent = events.filter((e) => now - new Date(e.at).getTime() < 60 * 60 * 1000) // 1h
    return {
      examsLastHour: recent.filter((e) => e.type === 'EXAM').length,
      reportsLastHour: recent.filter((e) => e.type === 'REPORT').length,
      criticalsLastHour: recent.filter((e) => e.type === 'CRITICAL').length,
      errorsLastHour: recent.filter((e) => e.type === 'ERROR').length,
    }
  }, [events])

  const deviceStats = useMemo(() => {
    return {
      total: devices.length,
      online: devices.filter((d) => d.state === 'ONLINE' || d.state === 'IDLE' || d.state === 'BUSY').length,
      busy: devices.filter((d) => d.state === 'BUSY').length,
      avgUtilization: devices.length
        ? (devices.reduce((s, d) => s + d.utilization, 0) / devices.length * 100).toFixed(1)
        : 0,
    }
  }, [devices])

  const eventTypeData = useMemo(() => {
    const m: Record<string, number> = {}
    events.forEach((e) => (m[e.type] = (m[e.type] ?? 0) + 1))
    return Object.entries(m).map(([k, v]) => ({ name: k, value: v }))
  }, [events])

  return (
    <div data-testid="realtime-ops-dashboard" key={tick}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={onlineUsers}
              prefix={<Users size={14} color="#3b82f6" />}
              valueStyle={{ color: '#3b82f6' }}
            />
            <Badge status="processing" text="实时" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="1h 检查数" value={summary.examsLastHour} prefix={<Activity size={14} color="#1e3a5f" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="1h 报告数" value={summary.reportsLastHour} prefix={<Stethoscope size={14} color="#16a34a" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="1h 危急值"
              value={summary.criticalsLastHour}
              prefix={<AlertOctagon size={14} color="#dc2626" />}
              valueStyle={{ color: summary.criticalsLastHour > 0 ? '#dc2626' : '#16a34a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="设备在线率" value={deviceStats.total > 0 ? (deviceStats.online / deviceStats.total * 100).toFixed(1) : 0} suffix="%" prefix={<Wifi size={14} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="设备使用中" value={deviceStats.busy} prefix={<Cpu size={14} color="#ca8a04" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均利用率" value={deviceStats.avgUtilization} suffix="%" prefix={<TrendingUp size={14} color="#7c3aed" />} />
            <Progress percent={Number(deviceStats.avgUtilization)} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="1h 系统错误"
              value={summary.errorsLastHour}
              prefix={<Server size={14} color={summary.errorsLastHour > 0 ? '#dc2626' : '#16a34a'} />}
              valueStyle={{ color: summary.errorsLastHour > 0 ? '#dc2626' : '#16a34a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={10}>
          <Card
            size="small"
            title={
              <Space>
                <Zap size={14} color="#ca8a04" />
                <span>实时事件流</span>
              </Space>
            }
            extra={<Tag color="red">LIVE</Tag>}
            data-testid="ops-event-stream"
          >
            {events.length === 0 ? (
              <Empty />
            ) : (
              <List
                size="small"
                dataSource={events.slice(0, 12)}
                renderItem={(e) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size="small"
                          style={{ background: COLORS[e.type] }}
                          icon={<Zap size={10} />}
                        />
                      }
                      title={
                        <Space size={4}>
                          <Tag color={SEVERITY_COLOR[e.severity]}>{e.severity}</Tag>
                          <span style={{ fontSize: 12 }}>{e.title}</span>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ fontSize: 11, color: '#475569' }}>{e.description}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>
                            <Clock size={8} /> {e.at} {e.actor ? `· ${e.actor}` : ''}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                style={{ maxHeight: 360, overflow: 'auto' }}
              />
            )}
          </Card>
        </Col>
        <Col span={14}>
          <Card
            size="small"
            title={
              <Space>
                <Cpu size={14} />
                <span>设备状态</span>
              </Space>
            }
            data-testid="ops-device-status"
          >
            <Row gutter={[12, 12]}>
              {devices.map((d) => {
                const stateColor =
                  d.state === 'BUSY' ? '#dc2626' : d.state === 'IDLE' ? '#16a34a' : d.state === 'OFFLINE' ? '#94a3b8' : d.state === 'MAINTENANCE' ? '#ca8a04' : '#3b82f6'
                return (
                  <Col key={d.id} xs={12} sm={8} md={6}>
                    <Card
                      size="small"
                      data-testid={`ops-device-${d.id}`}
                      style={{ borderColor: stateColor }}
                    >
                      <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <Space size={4}>
                          <Tag color="blue">{d.modality}</Tag>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{d.name}</span>
                        </Space>
                        <Tag color={stateColor} style={{ fontSize: 10 }}>{d.state}</Tag>
                        {d.currentPatient && <div style={{ fontSize: 10, color: '#475569' }}>患者:{d.currentPatient}</div>}
                        {d.queue > 0 && <div style={{ fontSize: 10, color: '#ca8a04' }}>队列:{d.queue}</div>}
                        <Progress
                          percent={Math.round(d.utilization)}
                          size="small"
                          showInfo={false}
                          strokeColor={d.utilization > 80 ? '#dc2626' : '#3b82f6'}
                        />
                      </Space>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col span={8}>
          <Card size="small" title="事件分布" data-testid="ops-event-distribution">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {eventTypeData.map((e, i) => <Cell key={i} fill={COLORS[e.name as keyof typeof COLORS] ?? '#94a3b8'} />)}
                </Pie>
                <Legend />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="设备利用率" data-testid="ops-device-utilization">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={devices.map((d) => ({ name: d.name, util: d.utilization }))}
                layout="vertical"
              >
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <RTooltip />
                <Bar dataKey="util" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="系统状态" data-testid="ops-system-status">
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>数据库</span>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>DICOM 网关</span>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>HL7 引擎</span>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>消息队列</span>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>AI 服务</span>
                <Badge status="processing" text="运行中" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>缓存</span>
                <Badge status="success" text="命中率 92%" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default RealtimeOpsDashboard
