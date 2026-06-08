/**
 * G005 放射RIS系统 v3.0.1 - 常用语短语库
 * 对标岱嘉 / 东软 PACS — 按检查类型分类的常用短语抽屉
 */
import React, { useState, useMemo, useCallback } from 'react'
import { Drawer, Input, Tree, Tag, Space, Button, Empty, Tooltip } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { BookOpen, Search, Plus } from 'lucide-react'

export interface Phrase {
  id: string
  category: string
  text: string
  shortcut?: string
  tags?: string[]
}

export const PHRASE_CATEGORIES: Record<string, Phrase[]> = {
  CT: [
    { id: 'ct-1', category: 'CT', text: '双肺纹理清晰,未见明显异常密度影。', shortcut: 'F1' },
    { id: 'ct-2', category: 'CT', text: '气管支气管通畅。', shortcut: 'F2' },
    { id: 'ct-3', category: 'CT', text: '纵隔结构清晰,未见肿大淋巴结。' },
    { id: 'ct-4', category: 'CT', text: '心脏大血管形态正常。' },
    { id: 'ct-5', category: 'CT', text: '胸腔未见积液。' },
    { id: 'ct-6', category: 'CT', text: '肝脏形态、大小正常,平扫及增强各期未见异常密度灶。' },
    { id: 'ct-7', category: 'CT', text: '胆囊大小正常,壁不厚,腔内未见结石影。' },
    { id: 'ct-8', category: 'CT', text: '脾脏、胰腺形态密度正常。' },
    { id: 'ct-9', category: 'CT', text: '双肾形态大小正常,未见结石及积水。' },
    { id: 'ct-10', category: 'CT', text: '腹腔未见肿大淋巴结。' },
  ],
  MR: [
    { id: 'mr-1', category: 'MR', text: '双侧大脑半球对称,灰白质对比正常。' },
    { id: 'mr-2', category: 'MR', text: '脑室、脑池、脑沟未见扩大、变窄。' },
    { id: 'mr-3', category: 'MR', text: '中线结构居中。' },
    { id: 'mr-4', category: 'MR', text: '颅骨骨质未见异常。' },
    { id: 'mr-5', category: 'MR', text: 'DWI 未见明显扩散受限高信号。' },
    { id: 'mr-6', category: 'MR', text: 'T1WI 呈低信号,T2WI 呈高信号。' },
  ],
  DR: [
    { id: 'dr-1', category: 'DR', text: '双肺纹理清晰,肺门影不大。' },
    { id: 'dr-2', category: 'DR', text: '心影大小、形态正常。' },
    { id: 'dr-3', category: 'DR', text: '纵隔居中,气管居中。' },
    { id: 'dr-4', category: 'DR', text: '双侧膈面光滑,肋膈角锐利。' },
    { id: 'dr-5', category: 'DR', text: '胸廓对称,所见骨质未见异常。' },
  ],
  危急值: [
    { id: 'cv-1', category: '危急值', text: '大量气胸(肺组织压缩>50%),建议立即胸腔穿刺引流。' },
    { id: 'cv-2', category: '危急值', text: '主动脉可见内膜片,考虑主动脉夹层,建议立即外科就诊。' },
    { id: 'cv-3', category: '危急值', text: '大面积脑梗死(超过一个脑叶),建议立即神经内科就诊。' },
    { id: 'cv-4', category: '危急值', text: '冠脉 CTA 示冠脉狭窄>75%,考虑急性心肌梗死改变。' },
  ],
}

export interface PhraseBankProps {
  open: boolean
  onClose: () => void
  onInsert?: (text: string) => void
  phrases?: Record<string, Phrase[]>
}

export const PhraseBank: React.FC<PhraseBankProps> = ({ open, onClose, onInsert, phrases = PHRASE_CATEGORIES }) => {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const treeData: DataNode[] = useMemo(
    () =>
      Object.keys(phrases).map((cat) => ({
        title: (
          <Space>
            <span>{cat}</span>
            <Tag>{phrases[cat]?.length ?? 0}</Tag>
          </Space>
        ),
        key: cat,
      })),
    [phrases]
  )

  const filtered = useMemo(() => {
    if (!search && !activeCategory) return []
    if (search) {
      const q = search.toLowerCase()
      return Object.values(phrases)
        .flat()
        .filter((p) => p.text.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }
    return phrases[activeCategory!] ?? []
  }, [phrases, search, activeCategory])

  const handleInsert = useCallback(
    (text: string) => {
      onInsert?.(text)
    },
    [onInsert]
  )

  return (
    <Drawer
      data-testid="phrase-bank"
      title={
        <Space>
          <BookOpen size={16} />
          <span>常用语短语库</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={560}
    >
      <Input
        data-testid="phrase-search"
        prefix={<Search size={14} />}
        placeholder="搜索短语..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />

      <div style={{ display: 'flex', gap: 12, height: 'calc(100% - 56px)' }}>
        <div style={{ width: 160, borderRight: '1px solid #f0f0f0', paddingRight: 8 }}>
          <Tree
            treeData={treeData}
            defaultExpandAll
            selectedKeys={activeCategory ? [activeCategory] : []}
            onSelect={(keys) => setActiveCategory((keys[0] as string) ?? null)}
          />
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <Empty description="暂无可用短语" />
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                data-testid={`phrase-${p.id}`}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  background: '#f8fafc',
                  marginBottom: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
                onClick={() => handleInsert(p.text)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Tag color="blue">{p.category}</Tag>
                  {p.shortcut && (
                    <Tooltip title="快捷键">
                      <Tag color="purple">{p.shortcut}</Tag>
                    </Tooltip>
                  )}
                </div>
                <div>{p.text}</div>
                <Button
                  type="link"
                  size="small"
                  icon={<Plus size={12} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleInsert(p.text)
                  }}
                >
                  插入
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Drawer>
  )
}

export default PhraseBank
