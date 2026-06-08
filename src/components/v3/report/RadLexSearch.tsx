/**
 * G005 放射RIS系统 v3.0.1 - RadLex 放射学术语检索
 * 对标飞利浦 / GE — RadLex 编码与术语联想
 */
import React, { useState, useMemo, useCallback } from 'react'
import { Modal, Input, List, Tag, Space, Button, Tooltip, Empty } from 'antd'
import { Search, BookMarked, Plus } from 'lucide-react'

export interface RadLexTerm {
  id: string
  code: string
  name: string
  nameEn: string
  category: string
  synonyms?: string[]
}

export const RADLEX_SAMPLE: RadLexTerm[] = [
  { id: 'rl-1', code: 'RID4799', name: '肺结节', nameEn: 'pulmonary nodule', category: '影像所见', synonyms: ['肺内结节', 'lung nodule'] },
  { id: 'rl-2', code: 'RID6305', name: '气胸', nameEn: 'pneumothorax', category: '影像所见' },
  { id: 'rl-3', code: 'RID5762', name: '胸腔积液', nameEn: 'pleural effusion', category: '影像所见' },
  { id: 'rl-4', code: 'RID5651', name: '肝囊肿', nameEn: 'hepatic cyst', category: '影像所见' },
  { id: 'rl-5', code: 'RID5673', name: '肝占位', nameEn: 'hepatic mass', category: '影像所见' },
  { id: 'rl-6', code: 'RID5658', name: '脂肪肝', nameEn: 'fatty liver', category: '影像所见' },
  { id: 'rl-7', code: 'RID3902', name: '脑梗死', nameEn: 'cerebral infarction', category: '影像所见' },
  { id: 'rl-8', code: 'RID3843', name: '脑出血', nameEn: 'cerebral hemorrhage', category: '影像所见' },
  { id: 'rl-9', code: 'RID7407', name: '骨折', nameEn: 'fracture', category: '影像所见' },
  { id: 'rl-10', code: 'RID3388', name: '椎间盘突出', nameEn: 'disc herniation', category: '影像所见' },
  { id: 'rl-11', code: 'RID3999', name: '主动脉夹层', nameEn: 'aortic dissection', category: '危急值' },
  { id: 'rl-12', code: 'RID5879', name: '肺栓塞', nameEn: 'pulmonary embolism', category: '危急值' },
  { id: 'rl-13', code: 'RID5725', name: '肾结石', nameEn: 'renal stone', category: '影像所见' },
  { id: 'rl-14', code: 'RID5740', name: '胆囊结石', nameEn: 'gallbladder stone', category: '影像所见' },
  { id: 'rl-15', code: 'RID5764', name: '腹水', nameEn: 'ascites', category: '影像所见' },
]

export interface RadLexSearchProps {
  open: boolean
  onClose: () => void
  onInsert?: (term: RadLexTerm) => void
  terms?: RadLexTerm[]
}

export const RadLexSearch: React.FC<RadLexSearchProps> = ({
  open,
  onClose,
  onInsert,
  terms = RADLEX_SAMPLE,
}) => {
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    if (!keyword) return terms
    const q = keyword.toLowerCase()
    return terms.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        (t.synonyms ?? []).some((s) => s.toLowerCase().includes(q))
    )
  }, [terms, keyword])

  const handleInsert = useCallback(
    (term: RadLexTerm) => {
      onInsert?.(term)
    },
    [onInsert]
  )

  return (
    <Modal
      data-testid="radlex-search"
      title={
        <Space>
          <BookMarked size={16} />
          <span>RadLex 放射学术语</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
    >
      <Input
        data-testid="radlex-input"
        prefix={<Search size={14} />}
        placeholder="输入 RadLex 编码、术语或同义词..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
        autoFocus
      />
      {filtered.length === 0 ? (
        <Empty description="未找到术语" />
      ) : (
        <List
          dataSource={filtered}
          renderItem={(t) => (
            <List.Item
              key={t.id}
              data-testid={`radlex-${t.id}`}
              actions={[
                <Tooltip key="insert" title="插入到报告">
                  <Button
                    type="link"
                    size="small"
                    icon={<Plus size={12} />}
                    onClick={() => handleInsert(t)}
                    data-testid={`radlex-insert-${t.id}`}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{t.name}</span>
                    <Tag color="blue">{t.code}</Tag>
                    {t.category === '危急值' && <Tag color="red">危急</Tag>}
                  </Space>
                }
                description={
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {t.nameEn} · {t.category}
                    {t.synonyms && t.synonyms.length > 0 && (
                      <span> · 同义:{t.synonyms.join(', ')}</span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  )
}

export default RadLexSearch
