/**
 * G005 放射RIS系统 v3.0.6.1 - SR 单字段 (Siemens 风格)
 */
import React from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Space, Tag } from 'antd'

export type SRFieldDataType = 'text' | 'multiline' | 'number' | 'date' | 'select'

export interface SRFieldConfig {
  id: string
  label: string
  type: SRFieldDataType
  required?: boolean
  placeholder?: string
  options?: string[]
  rows?: number
}

export interface SRFieldProps {
  config: SRFieldConfig
  value: string
  onChange: (v: string) => void
}

export const SRField: React.FC<SRFieldProps> = ({ config, value, onChange }) => {
  return (
    <Form.Item
      label={
        <Space size={4}>
          <span>{config.label}</span>
          {config.required && <Tag color="red" style={{ fontSize: 12 }}>必填</Tag>}
        </Space>
      }
      style={{ marginBottom: 12 }}
    >
      {config.type === 'text' && (
        <Input
          value={value}
          placeholder={config.placeholder}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`sr-field-${config.id}`}
        />
      )}
      {config.type === 'multiline' && (
        <Input.TextArea
          rows={config.rows ?? 3}
          value={value}
          placeholder={config.placeholder}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`sr-field-${config.id}`}
        />
      )}
      {config.type === 'number' && (
        <InputNumber value={Number(value) || 0} onChange={(v) => onChange(String(v ?? 0))} />
      )}
      {config.type === 'date' && <DatePicker onChange={() => {}} />}
      {config.type === 'select' && (
        <Select
          value={value || undefined}
          onChange={onChange}
          style={{ width: 200 }}
          options={(config.options ?? []).map((o) => ({ value: o, label: o }))}
        />
      )}
    </Form.Item>
  )
}

export default SRField