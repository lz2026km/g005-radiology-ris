/**
 * G005 放射RIS系统 v3.0.6.1 - 性能监控 (Web Vitals + 后端)
 */
import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Tag, Space, Statistic } from 'antd'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react'

export interface PerformanceMonitorProps {
  enabled?: boolean
}

interface Metric {
  ts: number
  lcp: number
  fid: number
  cls: number
  ttfb: number
}

const generate = (n: number): Metric[] =>
  Array.from({ length: n }).map((_, i) => ({
    ts: i,
    lcp: 1.2 + Math.sin(i / 3) * 0.3 + Math.random() * 0.2,
    fid: 80 + Math.cos(i / 2) * 20 + Math.random() * 15,
    cls: 0.05 + Math.random() * 0.04,
    ttfb: 200 + Math.sin(i / 4) * 80 + Math.random() * 30,
  }))

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ enabled = true }) => {
  const [data, setData] = useState<Metric[]>(generate(30))
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const t = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), {
          ts: prev.length,
          lcp: 1.0 + Math.random() * 0.8,
          fid: 50 + Math.random() * 80,
          cls: 0.02 + Math.random() * 0.06,
          ttfb: 150 + Math.random() * 200,
        }]
        return next
      })
      setTick((x) => x + 1)
    }, 2000)
    return () => clearInterval(t)
  }, [enabled])
  void tick

  const last = data[data.length - 1]
  const avg = (key: keyof Metric) => data.reduce((s, d) => s + d[key], 0) / data.length

  return (
    <div data-testid="performance-monitor">
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={6}><Card size="small"><Statistic title="LCP (s)" value={last?.lcp ?? 0} precision={2} prefix={<Activity size={14} />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="FID (ms)" value={last?.fid ?? 0} precision={0} prefix={<Zap size={14} />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="CLS" value={last?.cls ?? 0} precision={3} prefix={<Cpu size={14} />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="TTFB (ms)" value={last?.ttfb ?? 0} prefix={<HardDrive size={14} />} /></Card></Col>
      </Row>

      <Card size="small" title="Web Vitals 趋势 (tick={tick})">
        <div style={{ height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="ts" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lcp" stroke="#3b82f6" />
              <Line type="monotone" dataKey="ttfb" stroke="#f59e0b" />
              <Line type="monotone" dataKey="cls" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Space wrap style={{ marginTop: 8 }}>
          <Tag color="green">LCP avg {avg('lcp').toFixed(2)}s</Tag>
          <Tag color="green">FID avg {avg('fid').toFixed(0)}ms</Tag>
          <Tag color="green">CLS avg {avg('cls').toFixed(3)}</Tag>
          <Tag color="green">TTFB avg {avg('ttfb').toFixed(0)}ms</Tag>
        </Space>
      </Card>
    </div>
  )
}

export default PerformanceMonitor