/**
 * G005 放射RIS系统 v3.0.6.1 - AI-Rad 胸部统计 (Lung-RADS 分布 + 体积测量)
 */
import React, { useMemo } from 'react'
import { Card, Row, Col, Progress, Tag } from 'antd'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import type { ChestFinding } from './DetectionList'

export interface AIRadStatsProps {
  findings: ChestFinding[]
}

const RADS_COLORS: Record<string, string> = {
  '1': '#16a34a',
  '2': '#84cc16',
  '3': '#f59e0b',
  '4A': '#f97316',
  '4B': '#dc2626',
  '4X': '#991b1b',
}

export const AIRadStats: React.FC<AIRadStatsProps> = ({ findings }) => {
  const radsDist = useMemo(() => {
    const map = new Map<string, number>()
    findings.forEach((f) => {
      const k = f.lungRads ?? 'UNK'
      map.set(k, (map.get(k) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([k, v]) => ({ name: k, value: v, color: RADS_COLORS[k] ?? '#94a3b8' }))
  }, [findings])

  const byType = useMemo(() => {
    const map = new Map<string, number>()
    findings.forEach((f) => map.set(f.type, (map.get(f.type) ?? 0) + 1))
    return Array.from(map.entries()).map(([k, v]) => ({ name: k, value: v }))
  }, [findings])

  return (
    <Card size="small" title="AI-Rad 统计" data-testid="airad-stats">
      <Row gutter={12}>
        <Col span={12}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Lung-RADS 分布</div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={radsDist} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60}>
                  {radsDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>类型分布</div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer>
              <BarChart data={byType}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: 8 }}>
        {radsDist.map((d) => (
          <div key={d.name} style={{ marginBottom: 4 }}>
            <Tag color={d.color}>Lung-RADS {d.name}</Tag>
            <Progress percent={Math.round((d.value / findings.length) * 100)} size="small" strokeColor={d.color} />
          </div>
        ))}
      </div>
    </Card>
  )
}

export default AIRadStats