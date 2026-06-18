/**
 * G005 放射RIS系统 v3.0.6.1 - SR 模板选择器
 */
import React from 'react'
import { Select, Card, Tag, Space } from 'antd'

export interface SRFieldMeta {
  id: string
  label: string
  type: 'text' | 'multiline' | 'number' | 'date' | 'select'
  required?: boolean
  defaultValue?: string
  options?: string[]
}

export interface SRTemplateMeta {
  id: string
  name: string
  modality: string
  bodyPart: string
  version: string
  fields: SRFieldMeta[]
}

const MOCK_TEMPLATES: SRTemplateMeta[] = [
  { id: 'T-CT-CHEST', name: '胸部 CT', modality: 'CT', bodyPart: '胸部', version: 'v3.2', fields: [] },
  { id: 'T-CT-ABD', name: '腹部 CT 三期', modality: 'CT', bodyPart: '腹部', version: 'v2.8', fields: [] },
  { id: 'T-MR-HEAD', name: '头颅 MR 增强', modality: 'MR', bodyPart: '头颅', version: 'v4.1', fields: [] },
  { id: 'T-DR-CHEST', name: '胸部 DR', modality: 'DR', bodyPart: '胸部', version: 'v2.0', fields: [] },
  { id: 'T-MG', name: '乳腺钼靶 (BI-RADS)', modality: 'MG', bodyPart: '乳腺', version: 'v5.0', fields: [] },
]

export interface TemplatePickerProps {
  value?: string
  onChange?: (id: string, tpl?: SRTemplateMeta) => void
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ value, onChange }) => {
  return (
    <Card size="small" data-testid="template-picker">
      <Space>
        <span style={{ fontSize: 12 }}>模板:</span>
        <Select
          size="small"
          value={value}
          style={{ width: 280 }}
          onChange={(v) => {
            const tpl = MOCK_TEMPLATES.find((t) => t.id === v)
            onChange?.(v, tpl)
          }}
          options={MOCK_TEMPLATES.map((t) => ({
            value: t.id,
            label: (
              <Space size={4}>
                <span>{t.name}</span>
                <Tag color="blue">{t.modality}</Tag>
                <Tag color="purple">v{t.version}</Tag>
              </Space>
            ),
          }))}
        />
      </Space>
    </Card>
  )
}

export default TemplatePicker