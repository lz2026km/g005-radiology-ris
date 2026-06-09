/**
 * G005 放射RIS系统 v3.0.2 - 危急值升级升级版
 * 对标:2024 WS 380 国家危急值通报规范
 *
 * 升级:
 *  - 闭环时限倒计时(< 5分钟红 / < 30分钟橙 / > 30分钟正常)
 *  - 多通路通知(SMS/微信/电话/钉钉/App push)
 *  - 升级(超时自动上报主任/医务科)
 *  - 接收方确认回执
 *  - 实时提醒
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, Tag, Space, Button, Timeline, Statistic, Row, Col, Alert, Modal, Select, Input, Progress, Badge, Tooltip, Empty } from 'antd'
import { AlertOctagon, Clock, Bell, Phone, MessageSquare, Send, CheckCircle2, AlertTriangle, User, Building2, Volume2 } from 'lucide-react'

export interface CriticalValueV2 {
  id: string
  patientName: string
  patientId: string
  modality: string
  bodyPart?: string
  finding: string
  /** 危急值类别 */
  category: 'LIFE_THREATENING' | 'URGENT' | 'IMPORTANT'
  /** 触发时间 */
  triggeredAt: string
  /** 报告医师 */
  reporter: string
  /** 应通知医师 */
  recipient: string
  recipientDept: string
  recipientPhone: string
  /** 通知状态 */
  notifyStatus: 'PENDING' | 'NOTIFIED' | 'ACKED' | 'ESCALATED' | 'COMPLETED'
  /** 通知通路 */
  channels: ('SMS' | 'WECHAT' | 'PHONE' | 'DINGTALK' | 'APP')[]
  /** 通知记录 */
  notifications: {
    channel: 'SMS' | 'WECHAT' | 'PHONE' | 'DINGTALK' | 'APP'
    at: string
    status: 'SUCCESS' | 'FAILED' | 'RETRY'
    ackAt?: string
    acker?: string
  }[]
  /** 上报链 */
  escalationChain: string[]
  /** 当前 SLA(秒) */
  slaSeconds: number
  /** 最终确认医师/时间 */
  acker?: string
  ackedAt?: string
}

export interface CriticalEscalationV2Props {
  values: CriticalValueV2[]
  onNotify?: (id: string, channels: ('SMS' | 'WECHAT' | 'PHONE' | 'DINGTALK' | 'APP')[]) => void
  onEscalate?: (id: string, reason: string) => void
  onAck?: (id: string, acker: string) => void
}

const CHANNEL_META: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  SMS: { color: 'blue', icon: <MessageSquare size={12} />, label: '短信' },
  WECHAT: { color: 'green', icon: <MessageSquare size={12} />, label: '微信' },
  PHONE: { color: 'orange', icon: <Phone size={12} />, label: '电话' },
  DINGTALK: { color: 'cyan', icon: <MessageSquare size={12} />, label: '钉钉' },
  APP: { color: 'purple', icon: <Bell size={12} />, label: 'App' },
}

const CATEGORY_META = {
  LIFE_THREATENING: { color: 'red', label: '危及生命', sla: 300, sound: 3 }, // 5 分钟
  URGENT: { color: 'orange', label: '紧急', sla: 1800, sound: 2 }, // 30 分钟
  IMPORTANT: { color: 'gold', label: '重要', sla: 3600, sound: 1 }, // 60 分钟
} as const

const STATUS_META = {
  PENDING: { color: 'default', label: '待通知' },
  NOTIFIED: { color: 'processing', label: '已通知' },
  ACKED: { color: 'cyan', label: '已确认' },
  ESCALATED: { color: 'red', label: '已升级' },
  COMPLETED: { color: 'green', label: '已完成' },
} as const

const computeElapsed = (triggeredAt: string): number => {
  return Math.floor((Date.now() - new Date(triggeredAt).getTime()) / 1000)
}

const formatElapsed = (s: number): string => {
  if (s < 60) return `${s}秒`
  if (s < 3600) return `${Math.floor(s / 60)}分${s % 60}秒`
  return `${Math.floor(s / 3600)}小时${Math.floor((s % 3600) / 60)}分`
}

const CriticalCard: React.FC<{
  v: CriticalValueV2
  onNotify?: CriticalEscalationV2Props['onNotify']
  onEscalate?: CriticalEscalationV2Props['onEscalate']
  onAck?: CriticalEscalationV2Props['onAck']
  onSelect: (v: CriticalValueV2) => void
}> = ({ v, onNotify, onEscalate, onAck, onSelect }) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const cat = CATEGORY_META[v.category]
  const elapsed = Math.floor((now - new Date(v.triggeredAt).getTime()) / 1000)
  const ratio = Math.min(100, (elapsed / cat.sla) * 100)
  const overSla = elapsed > cat.sla
  const status = STATUS_META[v.notifyStatus]

  return (
    <Card
      data-testid={`cv-card-${v.id}`}
      size="small"
      style={{
        borderColor: overSla ? '#dc2626' : undefined,
        background: overSla ? '#fef2f2' : undefined,
      }}
      onClick={() => onSelect(v)}
      hoverable
    >
      <Space size={4} wrap style={{ marginBottom: 4 }}>
        <Badge count={overSla ? '超时' : 0} color="red">
          <Tag color={cat.color} icon={<AlertOctagon size={10} />} data-testid={`cv-cat-${v.id}`}>{cat.label}</Tag>
        </Badge>
        <Tag color="blue">{v.modality}</Tag>
        {v.bodyPart && <Tag>{v.bodyPart}</Tag>}
        <Tag color={status.color}>{status.label}</Tag>
      </Space>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{v.patientName} <Tag>{v.patientId}</Tag></div>
      <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>{v.finding.slice(0, 80)}{v.finding.length > 80 ? '...' : ''}</div>
      <Space size={4} wrap>
        <Tag icon={<User size={10} />}>{v.recipient}</Tag>
        <Tag icon={<Building2 size={10} />}>{v.recipientDept}</Tag>
      </Space>
      <div style={{ marginTop: 6 }}>
        <Progress
          percent={ratio}
          size="small"
          showInfo={false}
          strokeColor={overSla ? '#dc2626' : cat.color}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
          <span><Clock size={10} /> 已过 {formatElapsed(elapsed)}</span>
          <span>SLA {formatElapsed(cat.sla)}</span>
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <Space size={2} wrap>
          {v.channels.map((c) => {
            const m = CHANNEL_META[c]
            return (
              <Tag key={c} color={m.color} icon={m.icon} style={{ fontSize: 10 }}>
                {m.label}
              </Tag>
            )
          })}
        </Space>
      </div>
      {overSla && v.notifyStatus !== 'ESCALATED' && v.notifyStatus !== 'COMPLETED' && (
        <Button
          block
          danger
          size="small"
          icon={<AlertTriangle size={12} />}
          style={{ marginTop: 6 }}
          onClick={(e) => {
            e.stopPropagation()
            onEscalate?.(v.id, `超时 ${formatElapsed(elapsed - cat.sla)}`)
          }}
          data-testid={`cv-escalate-${v.id}`}
        >
          立即升级
        </Button>
      )}
    </Card>
  )
}

export const CriticalEscalationV2: React.FC<CriticalEscalationV2Props> = ({
  values,
  onNotify,
  onEscalate,
  onAck,
}) => {
  const [selected, setSelected] = useState<CriticalValueV2 | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [ackModal, setAckModal] = useState(false)
  const [acker, setAcker] = useState('')
  const [channelsModal, setChannelsModal] = useState(false)
  const [chosenChannels, setChosenChannels] = useState<string[]>([])

  const stats = useMemo(() => {
    return {
      pending: values.filter((v) => v.notifyStatus === 'PENDING').length,
      notified: values.filter((v) => v.notifyStatus === 'NOTIFIED').length,
      overdue: values.filter((v) => {
        const cat = CATEGORY_META[v.category]
        return computeElapsed(v.triggeredAt) > cat.sla && v.notifyStatus !== 'COMPLETED' && v.notifyStatus !== 'ACKED'
      }).length,
      completed: values.filter((v) => v.notifyStatus === 'COMPLETED' || v.notifyStatus === 'ACKED').length,
    }
  }, [values])

  const handleSelect = useCallback((v: CriticalValueV2) => {
    setSelected(v)
    setDetailOpen(true)
  }, [])

  return (
    <div data-testid="critical-escalation-v2">
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <Card>
            <Statistic title="待通知" value={stats.pending} prefix={<Bell size={14} color="#3b82f6" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已通知待确认" value={stats.notified} prefix={<Send size={14} color="#ca8a04" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="超时未完成" value={stats.overdue} prefix={<AlertTriangle size={14} color="#dc2626" />} valueStyle={{ color: '#dc2626' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成" value={stats.completed} prefix={<CheckCircle2 size={14} color="#16a34a" />} />
          </Card>
        </Col>
      </Row>

      {stats.overdue > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<Volume2 size={16} />}
          message={`⚠️ ${stats.overdue} 项危急值已超时,请立即处理!`}
          banner
          style={{ marginBottom: 12 }}
        />
      )}

      <Row gutter={[12, 12]}>
        {values.map((v) => (
          <Col key={v.id} xs={24} sm={12} md={8} lg={6}>
            <CriticalCard v={v} onNotify={onNotify} onEscalate={onEscalate} onAck={onAck} onSelect={handleSelect} />
          </Col>
        ))}
      </Row>

      {values.length === 0 && <Empty description="无危急值" style={{ marginTop: 24 }} />}

      <Modal
        title={
          <Space>
            <AlertOctagon size={16} color="#dc2626" />
            <span>危急值详情</span>
          </Space>
        }
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>关闭</Button>,
          selected && selected.notifyStatus !== 'COMPLETED' && selected.notifyStatus !== 'ACKED' ? (
            <Button
              key="ack"
              type="primary"
              icon={<CheckCircle2 size={12} />}
              onClick={() => {
                setAckModal(true)
                setDetailOpen(false)
              }}
              data-testid="cv-ack-btn"
            >
              我已确认
            </Button>
          ) : null,
          selected && (selected.notifyStatus === 'PENDING' || selected.notifyStatus === 'ESCALATED') ? (
            <Button
              key="notify"
              type="primary"
              icon={<Send size={12} />}
              onClick={() => {
                setChosenChannels(selected.channels)
                setChannelsModal(true)
              }}
              data-testid="cv-notify-btn"
            >
              通知
            </Button>
          ) : null,
        ]}
      >
        {selected && (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Card size="small" title="基本信息">
              <div style={{ fontSize: 13 }}>
                <strong>患者:</strong> {selected.patientName} ({selected.patientId})
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>检查:</strong> {selected.modality} {selected.bodyPart ?? ''}
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>发现:</strong> {selected.finding}
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>类别:</strong>{' '}
                <Tag color={CATEGORY_META[selected.category].color}>
                  {CATEGORY_META[selected.category].label}
                </Tag>
                <Tag color={STATUS_META[selected.notifyStatus].color}>
                  {STATUS_META[selected.notifyStatus].label}
                </Tag>
              </div>
            </Card>
            <Card size="small" title="接收方">
              <div style={{ fontSize: 13 }}>
                <strong>医师:</strong> {selected.recipient}
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>科室:</strong> {selected.recipientDept}
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>电话:</strong> {selected.recipientPhone}
              </div>
            </Card>
            <Card size="small" title="通知记录" data-testid="cv-notify-history">
              <Timeline
                items={selected.notifications.map((n, i) => {
                  const m = CHANNEL_META[n.channel]
                  return {
                    key: i,
                    color: n.status === 'SUCCESS' ? 'green' : 'red',
                    children: (
                      <div>
                        <Tag color={m.color} icon={m.icon}>{m.label}</Tag>
                        <span style={{ fontSize: 12 }}>{n.at}</span>
                        <Tag color={n.status === 'SUCCESS' ? 'green' : 'red'}>{n.status}</Tag>
                        {n.ackAt && <Tag color="cyan">已确认 by {n.acker} {n.ackAt}</Tag>}
                      </div>
                    ),
                  }
                })}
              />
              {selected.notifications.length === 0 && <Empty description="尚未通知" />}
            </Card>
            {selected.escalationChain.length > 0 && (
              <Card size="small" title="升级链" data-testid="cv-escalation-chain">
                <Timeline
                  items={selected.escalationChain.map((e, i) => ({
                    key: i,
                    color: 'red',
                    children: <span style={{ fontSize: 12 }}>{e}</span>,
                  }))}
                />
              </Card>
            )}
          </Space>
        )}
      </Modal>

      <Modal
        title="接收方确认"
        open={ackModal}
        onCancel={() => setAckModal(false)}
        onOk={() => {
          if (acker) {
            onAck?.(selected!.id, acker)
            setAckModal(false)
            setAcker('')
          }
        }}
        data-testid="cv-ack-modal"
      >
        <p>请输入您的姓名以确认已接收危急值通知:</p>
        <Input
          value={acker}
          onChange={(e) => setAcker(e.target.value)}
          placeholder="确认人姓名"
          data-testid="cv-ack-name"
        />
      </Modal>

      <Modal
        title="选择通知通路"
        open={channelsModal}
        onCancel={() => setChannelsModal(false)}
        onOk={() => {
          onNotify?.(selected!.id, chosenChannels as any)
          setChannelsModal(false)
        }}
        data-testid="cv-channels-modal"
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          value={chosenChannels}
          onChange={setChosenChannels}
          options={Object.entries(CHANNEL_META).map(([k, m]) => ({ value: k, label: m.label }))}
        />
      </Modal>
    </div>
  )
}

export default CriticalEscalationV2
