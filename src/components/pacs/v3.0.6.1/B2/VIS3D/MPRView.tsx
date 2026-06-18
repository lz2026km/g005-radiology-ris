/**
 * G005 放射RIS系统 v3.0.6.1 - MPR 多平面重建
 */
import React from 'react'
import { Card, Row, Col, Tag, Space } from 'antd'

export interface MPRViewProps {
  axial?: boolean
  sagittal?: boolean
  coronal?: boolean
}

export const MPRView: React.FC<MPRViewProps> = () => {
  const panes = [
    { title: '轴位', color: '#3b82f6', x: 50, y: 30 },
    { title: '矢状位', color: '#16a34a', x: 30, y: 50 },
    { title: '冠状位', color: '#f59e0b', x: 70, y: 50 },
  ]
  return (
    <div data-testid="mpr-view">
      <Row gutter={8}>
        {panes.map((p) => (
          <Col span={8} key={p.title}>
            <Card size="small" title={p.title} bodyStyle={{ padding: 4 }}>
              <div style={{
                height: 130,
                background: '#0f172a',
                borderRadius: 4,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: 80,
                  height: 60,
                  background: p.color,
                  opacity: 0.7,
                  borderRadius: '50%',
                  filter: 'blur(2px)',
                }} />
                <Tag color={p.color} style={{ position: 'absolute', top: 4, left: 4 }}>{p.title}</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Space style={{ marginTop: 8 }} wrap>
        <Tag color="blue">层厚:1mm</Tag>
        <Tag color="purple">重建:骨算法</Tag>
        <Tag>层间距:0.8mm</Tag>
      </Space>
    </div>
  )
}

export default MPRView