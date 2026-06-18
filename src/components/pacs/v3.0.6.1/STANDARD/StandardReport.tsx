/**
 * G005 放射RIS系统 v3.0.6.1 - 标准报告 (RadReport 标准)
 */
import React, { useState } from 'react'
import { Card, Space, Tag, Select, Input, Row, Col, Button } from 'antd'
import { FileCheck, Languages } from 'lucide-react'
import { TermMapper, type MappingTerm } from './TermMapper'

export interface StandardReportProps {
  language?: 'zh-CN' | 'en-US'
}

export const StandardReport: React.FC<StandardReportProps> = ({ language = 'zh-CN' }) => {
  const [lang, setLang] = useState(language)
  const [text, setText] = useState('右肺下叶背段见一斑片状高密度影,边界欠清,大小约 12mm×8mm。')
  const [terms, setTerms] = useState<MappingTerm[]>([
    { id: 't1', source: '斑片状高密度影', target: 'Patchy high-density shadow', system: 'RadLex' },
    { id: 't2', source: '右肺下叶背段', target: 'Right lower lobe, dorsal segment', system: 'RadLex + SNOMED' },
    { id: 't3', source: '边界欠清', target: 'Ill-defined margin', system: 'RadLex' },
  ])

  return (
    <div data-testid="standard-report">
      <Card
        size="small"
        title={<Space><FileCheck size={14} />标准报告 (RadReport 模板)</Space>}
        extra={
          <Space>
            <Tag color="blue">RSNA RadReport</Tag>
            <Tag color="purple">IHE RRR</Tag>
            <Select
              size="small"
              value={lang}
              onChange={setLang}
              style={{ width: 100 }}
              suffixIcon={<Languages size={12} />}
              options={[{ value: 'zh-CN', label: '中文' }, { value: 'en-US', label: 'English' }]}
            />
          </Space>
        }
      >
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>所见 ({lang === 'zh-CN' ? '中文' : 'EN'})</div>
            <Input.TextArea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
            <Space style={{ marginTop: 8 }}>
              <Button size="small" type="primary">模板插入</Button>
              <Button size="small">翻译</Button>
              <Button size="small">导出 DICOM SR</Button>
            </Space>
          </Col>
          <Col span={12}>
            <TermMapper terms={terms} onChange={setTerms} />
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default StandardReport