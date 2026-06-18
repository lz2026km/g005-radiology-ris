/**
 * G005 放射RIS系统 v3.0.6.1 - SR 字段编辑器
 */
import React from 'react'
import { Card, Form, Input, Select, DatePicker, InputNumber, Space } from 'antd'

export type SRFieldValue = string | number | string[] | null | undefined

export interface SRField {
  id: string
  label: string
  type: 'text' | 'multiline' | 'number' | 'date' | 'select'
  required?: boolean
  defaultValue?: string
  options?: string[]
}

export interface FieldEditorProps {
  fields: SRField[]
  values: Record<string, SRFieldValue>
  onChange: (id: string, value: SRFieldValue) => void
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ fields, values, onChange }) => {
  return (
    <Card size="small" data-testid="field-editor">
      <Form layout="vertical" size="small">
        {fields.map((f) => {
          const requiredMark = f.required ? <span style={{ color: '#dc2626' }}>*</span> : null
          return (
            <Form.Item key={f.id} label={<Space size={4}><span>{f.label}</span>{requiredMark}</Space>}>
              {f.type === 'text' && (
                <Input
                  value={values[f.id] as string ?? f.defaultValue ?? ''}
                  onChange={(e) => onChange(f.id, e.target.value)}
                  data-testid={`field-${f.id}`}
                />
              )}
              {f.type === 'multiline' && (
                <Input.TextArea
                  rows={3}
                  value={values[f.id] as string ?? f.defaultValue ?? ''}
                  onChange={(e) => onChange(f.id, e.target.value)}
                  data-testid={`field-${f.id}`}
                />
              )}
              {f.type === 'number' && (
                <InputNumber
                  value={values[f.id] as number ?? Number(f.defaultValue ?? 0)}
                  onChange={(v) => onChange(f.id, v ?? 0)}
                />
              )}
              {f.type === 'date' && (
                <DatePicker
                  value={undefined}
                  onChange={() => {}}
                />
              )}
              {f.type === 'select' && (
                <Select
                  value={values[f.id] as string ?? f.defaultValue}
                  onChange={(v) => onChange(f.id, v)}
                  options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                  style={{ minWidth: 180 }}
                />
              )}
            </Form.Item>
          )
        })}
      </Form>
    </Card>
  )
}

export default FieldEditor