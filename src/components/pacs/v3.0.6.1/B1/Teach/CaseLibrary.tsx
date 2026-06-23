/**
 * G005 放射RIS系统 v3.0.6.1 - 教学案例库
 */
import React, { useMemo } from 'react'
import { Empty, List, Tag, Space, Card } from 'antd'
import { Eye, Heart, Calendar } from 'lucide-react'
import type { TeachingCase } from './TeachingFiles'

export interface CaseLibraryProps {
  cases: TeachingCase[]
  keyword?: string
  onSelect?: (c: TeachingCase) => void
}

const DIFF_META = {
  BEGINNER: { color: 'green', label: '入门' },
  INTERMEDIATE: { color: 'orange', label: '进阶' },
  ADVANCED: { color: 'red', label: '高级' },
}

export const CaseLibrary: React.FC<CaseLibraryProps> = ({ cases, keyword = '', onSelect }) => {
  const filtered = useMemo(() => {
    const k = keyword.toLowerCase()
    if (!k) return cases
    return cases.filter((c) =>
      c.title.toLowerCase().includes(k) ||
      c.diagnosis.toLowerCase().includes(k) ||
      c.tags.some((t) => t.toLowerCase().includes(k))
    )
  }, [cases, keyword])

  if (filtered.length === 0) return <Empty description="无匹配案例" />

  return (
    <List
      data-testid="case-library"
      dataSource={filtered}
      grid={{ gutter: 12, column: 2 }}
      renderItem={(c) => {
        const d = DIFF_META[c.difficulty]
        return (
          <List.Item>
            <Card
              size="small"
              hoverable
              data-testid={`case-${c.id}`}
              onClick={() => onSelect?.(c)}
              title={
                <Space wrap>
                  <span>{c.title}</span>
                  <Tag color="blue">{c.modality} {c.bodyPart}</Tag>
                  <Tag color={d.color}>{d.label}</Tag>
                </Space>
              }
            >
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                <strong>诊断:</strong> {c.diagnosis}
              </div>
              <Space wrap size={4} style={{ marginBottom: 6 }}>
                {c.tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </Space>
              <Space size={12} style={{ fontSize: 12, color: '#94a3b8' }}>
                <span><Eye size={10} /> {c.views}</span>
                <span><Heart size={10} /> {c.likes}</span>
                <span><Calendar size={10} /> {c.createdAt}</span>
                <span>{c.author}</span>
              </Space>
            </Card>
          </List.Item>
        )
      }}
    />
  )
}

export default CaseLibrary