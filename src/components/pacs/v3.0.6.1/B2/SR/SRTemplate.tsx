/**
 * G005 放射RIS系统 v3.0.6.1 - Siemens SR Template (syngo Reporting)
 */
import React from 'react'
import { Card, Space, Tag, Button } from 'antd'
import { FileText } from 'lucide-react'
import { SRField, type SRFieldConfig } from './SRField'

export interface SRTemplateProps {
  templateId: string
  values: Record<string, string>
  onChange: (id: string, value: string) => void
  onSave?: () => void
}

const FIELDS: SRFieldConfig[] = [
  { id: 'tech', label: '扫描技术', type: 'text', required: true, placeholder: '例:平扫+增强' },
  { id: 'contrast', label: '对比剂', type: 'text', placeholder: '例:碘海醇 350mgI/mL 80mL' },
  { id: 'findings', label: '所见', type: 'multiline', required: true, rows: 4 },
  { id: 'conclusion', label: '诊断结论', type: 'multiline', required: true, rows: 3 },
  { id: 'recommendation', label: '建议', type: 'multiline', rows: 2 },
]

export const SRTemplate: React.FC<SRTemplateProps> = ({ templateId, values, onChange, onSave }) => {
  return (
    <Card size="small" title={<Space><FileText size={14} />syngo 报告模板 ({templateId})</Space>}
      extra={<Space><Tag color="blue">Siemens</Tag><Button type="primary" size="small" onClick={onSave}>保存</Button></Space>}>
      {FIELDS.map((f) => (
        <SRField key={f.id} config={f} value={values[f.id] ?? ''} onChange={(v) => onChange(f.id, v)} />
      ))}
    </Card>
  )
}

export default SRTemplate