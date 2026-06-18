/**
 * G005 放射RIS系统 v3.0.6.1 - 教学案例编辑器
 */
import React, { useState } from 'react'
import { Card, Form, Input, Select, Tag, Space, Button, Empty } from 'antd'
import { Save, Plus } from 'lucide-react'
import type { TeachingCase } from './TeachingFiles'

export interface CaseEditorProps {
  caseData: TeachingCase | null
  onSave?: (c: TeachingCase) => void
}

export const CaseEditor: React.FC<CaseEditorProps> = ({ caseData, onSave }) => {
  const [title, setTitle] = useState(caseData?.title ?? '')
  const [diagnosis, setDiagnosis] = useState(caseData?.diagnosis ?? '')
  const [difficulty, setDifficulty] = useState(caseData?.difficulty ?? 'INTERMEDIATE')
  const [tags, setTags] = useState<string[]>(caseData?.tags ?? [])
  const [newTag, setNewTag] = useState('')

  if (!caseData) {
    return (
      <Empty
        description="请从案例库选择案例"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  return (
    <Card size="small" title={`编辑:${caseData.title}`} data-testid="case-editor">
      <Form layout="vertical" size="small">
        <Form.Item label="标题">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item label="诊断">
          <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </Form.Item>
        <Form.Item label="难度">
          <Select
            value={difficulty}
            onChange={(v) => setDifficulty(v as TeachingCase['difficulty'])}
            options={[
              { value: 'BEGINNER', label: '入门' },
              { value: 'INTERMEDIATE', label: '进阶' },
              { value: 'ADVANCED', label: '高级' },
            ]}
            style={{ width: 160 }}
          />
        </Form.Item>
        <Form.Item label="标签">
          <Space wrap>
            {tags.map((t) => <Tag key={t} closable onClose={() => setTags(tags.filter((x) => x !== t))}>{t}</Tag>)}
            <Input
              size="small"
              style={{ width: 100 }}
              placeholder="新标签"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onPressEnter={() => {
                if (newTag && !tags.includes(newTag)) {
                  setTags([...tags, newTag])
                  setNewTag('')
                }
              }}
            />
            <Button size="small" icon={<Plus size={10} />} onClick={() => {
              if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag])
                setNewTag('')
              }
            }}>添加</Button>
          </Space>
        </Form.Item>
        <Form.Item label="教学要点">
          <Input.TextArea rows={4} placeholder="鉴别诊断要点、影像特征..." />
        </Form.Item>
        <Space>
          <Button type="primary" icon={<Save size={12} />} onClick={() => onSave?.(caseData)}>保存</Button>
          <Button>取消</Button>
        </Space>
      </Form>
    </Card>
  )
}

export default CaseEditor