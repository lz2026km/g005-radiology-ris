/**
 * G005 放射RIS系统 v3.0.6.1 - 术语映射 (RadLex / SNOMED CT)
 */
import React from 'react'
import { Card, Tag, Space, Select, Input } from 'antd'
import { Languages, Link2 } from 'lucide-react'

export interface MappingTerm {
  id: string
  source: string
  target: string
  system: string
}

export interface TermMapperProps {
  terms: MappingTerm[]
  onChange: (t: MappingTerm[]) => void
}

export const TermMapper: React.FC<TermMapperProps> = ({ terms, onChange }) => {
  const update = (id: string, patch: Partial<MappingTerm>) => {
    onChange(terms.map((t) => t.id === id ? { ...t, ...patch } : t))
  }

  return (
    <Card size="small" title={<Space><Languages size={14} />术语映射 (RadLex / SNOMED CT)</Space>} data-testid="term-mapper">
      {terms.map((t) => (
        <div key={t.id} style={{ padding: 6, marginBottom: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}>
          <Space wrap style={{ width: '100%' }}>
            <Input
              size="small"
              value={t.source}
              onChange={(e) => update(t.id, { source: e.target.value })}
              style={{ width: 180 }}
            />
            <Link2 size={12} />
            <Input
              size="small"
              value={t.target}
              onChange={(e) => update(t.id, { target: e.target.value })}
              style={{ width: 220 }}
            />
            <Select
              size="small"
              value={t.system}
              onChange={(v) => update(t.id, { system: v })}
              style={{ width: 140 }}
              options={[
                { value: 'RadLex', label: 'RadLex' },
                { value: 'SNOMED', label: 'SNOMED CT' },
                { value: 'RadLex + SNOMED', label: 'RadLex+SNOMED' },
                { value: 'LOINC', label: 'LOINC' },
              ]}
            />
            <Tag color="blue">{t.id}</Tag>
          </Space>
        </div>
      ))}
      <Tag color="purple">共 {terms.length} 条术语</Tag>
    </Card>
  )
}

export default TermMapper