/**
 * G005 放射RIS系统 v3.0.6.1 - Canon Vitrea Cloud Viewer
 */
import React from 'react'
import { Card, Tag, Space, Statistic, Row, Col, Progress } from 'antd'
import { Cloud, Activity } from 'lucide-react'

export interface CloudViewerProps {
  cloudName?: string
}

export const CloudViewer: React.FC<CloudViewerProps> = ({ cloudName = 'Vitrea Cloud' }) => {
  return (
    <div data-testid="vitrea-cloud">
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={6}><Card size="small"><Statistic title="云端" value={cloudName} prefix={<Cloud size={14} />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="在线会话" value={8} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="存储" value="2.4 TB" /></Card></Col>
        <Col span={6}>
          <Card size="small">
            <span style={{ fontSize: 12 }}>带宽</span>
            <Progress percent={68} size="small" strokeColor="#3b82f6" />
          </Card>
        </Col>
      </Row>
      <Card size="small" title="云端会话">
        <Space wrap>
          <Tag color="blue">零下载</Tag>
          <Tag color="purple">流式渲染</Tag>
          <Tag color="green">HTTPS 加密</Tag>
          <Tag color="cyan">跨设备</Tag>
          <Tag icon={<Activity size={10} />} color="orange">实时同步</Tag>
        </Space>
      </Card>
    </div>
  )
}

export default CloudViewer