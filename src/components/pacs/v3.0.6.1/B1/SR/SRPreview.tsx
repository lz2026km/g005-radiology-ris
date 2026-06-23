/**
 * G005 放射RIS系统 v3.0.6.1 - SR 预览 (DICOM SR 风格)
 */
import React from 'react'
import { Card, Descriptions, Divider, Typography, Tag, Space } from 'antd'
import type { SRTemplateMeta } from './TemplatePicker'
import type { SRFieldValue } from './FieldEditor'

export interface SRPreviewProps {
  template: SRTemplateMeta
  values: Record<string, SRFieldValue>
}

const { Title, Paragraph } = Typography

export const SRPreview: React.FC<SRPreviewProps> = ({ template, values }) => {
  return (
    <Card size="small" data-testid="sr-preview">
      <Title level={5} style={{ marginTop: 0 }}>{template.name}</Title>
      <Space wrap>
        <Tag color="blue">{template.modality}</Tag>
        <Tag color="purple">{template.bodyPart}</Tag>
        <Tag>v{template.version}</Tag>
        <Tag color="green">DICOM SR TID 1500</Tag>
      </Space>
      <Divider style={{ margin: '12px 0' }} />
      <Descriptions size="small" column={1} bordered>
        {template.fields.map((f) => (
          <Descriptions.Item key={f.id} label={
            <Space>
              <span>{f.label}</span>
              {f.required && <Tag color="red" style={{ fontSize: 12 }}>必填</Tag>}
            </Space>
          }>
            {values[f.id] ? (
              <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{String(values[f.id])}</Paragraph>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: 12 }}>— 未填 —</span>
            )}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  )
}

export default SRPreview