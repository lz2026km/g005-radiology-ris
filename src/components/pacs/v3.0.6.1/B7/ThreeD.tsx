/**
 * G005 放射RIS系统 v3.0.6.1 - Canon Vitrea 3D
 */
import React from 'react'
import { Card, Tag, Space, Button } from 'antd'
import { Box } from 'lucide-react'

export const ThreeD: React.FC = () => {
  return (
    <div data-testid="vitrea-threed">
      <Card size="small" title={<Space><Box size={14} />3D 容积渲染</Space>} extra={<Tag color="blue">Vitrea v7</Tag>}>
        <div style={{ height: 280, background: 'radial-gradient(circle, #1e293b 0%, #020617 80%)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24, #dc2626)',
            opacity: 0.85,
            boxShadow: '0 0 40px #fbbf24',
          }} />
        </div>
        <Space style={{ marginTop: 8 }}>
          <Tag>VR</Tag>
          <Tag>MIP</Tag>
          <Tag>MPR</Tag>
          <Tag>Veasure</Tag>
          <Button size="small">保存预设</Button>
        </Space>
      </Card>
    </div>
  )
}

export default ThreeD