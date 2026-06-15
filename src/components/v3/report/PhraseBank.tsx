/**
 * G005 放射RIS系统 v3.0.1 - 常用语短语库
 * 对标岱嘉 / 东软 PACS — 按检查类型分类的常用短语抽屉
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Drawer, Input, Tree, Tag, Space, Button, Empty, Tooltip } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { BookOpen, Search, Plus, Star, StarOff, Clock } from 'lucide-react'

export interface Phrase {
  id: string
  bodyPart: string
  findingType: string
  text: string
  pinyin?: string
  shortcut?: string
  tags?: string[]
}

export const BODY_PARTS = ['胸部', '腹部', '头颅', '脊柱', '四肢', '颈部', '盆腔'] as const
export const FINDING_TYPES = ['正常所见', '异常所见', '随访建议'] as const

export const PHRASES: Phrase[] = [
  { id: 'ct-1', bodyPart: '胸部', findingType: '正常所见', text: '双肺纹理清晰,未见明显异常密度影。', pinyin: 'shuangfeiwenliqingximeijianmingxianyichangmiduying', shortcut: 'F1' },
  { id: 'ct-2', bodyPart: '胸部', findingType: '正常所见', text: '气管支气管通畅。', pinyin: 'qiguanzhiqiguanchangtong', shortcut: 'F2' },
  { id: 'ct-3', bodyPart: '胸部', findingType: '正常所见', text: '纵隔结构清晰,未见肿大淋巴结。', pinyin: 'zonggejiegouqingximeijianzhongdalinbajie' },
  { id: 'ct-4', bodyPart: '胸部', findingType: '正常所见', text: '心脏大血管形态正常。', pinyin: 'xinzangdaxueguanxingtaizhengchang' },
  { id: 'ct-5', bodyPart: '胸部', findingType: '正常所见', text: '胸腔未见积液。', pinyin: 'xiongqiangweijianjiye' },
  { id: 'ct-6', bodyPart: '腹部', findingType: '正常所见', text: '肝脏形态、大小正常,平扫及增强各期未见异常密度灶。', pinyin: 'ganzangxingtaidaxiaozhengchangpingsaojizengqianggeqiweijianyichangmiduzao' },
  { id: 'ct-7', bodyPart: '腹部', findingType: '正常所见', text: '胆囊大小正常,壁不厚,腔内未见结石影。', pinyin: 'dannangdaxiaozhengchangbibuhouqiangneiweijianjieshiying' },
  { id: 'ct-8', bodyPart: '腹部', findingType: '正常所见', text: '脾脏、胰腺形态密度正常。', pinyin: 'pizangyixianxingtaimiduzhengchang' },
  { id: 'ct-9', bodyPart: '腹部', findingType: '正常所见', text: '双肾形态大小正常,未见结石及积水。', pinyin: 'shuangshenxingtaidaxiaozhengchangweijianjieshijijishui' },
  { id: 'ct-10', bodyPart: '腹部', findingType: '正常所见', text: '腹腔未见肿大淋巴结。', pinyin: 'fuqiangweijianzhongdalinbajie' },
  { id: 'mr-1', bodyPart: '头颅', findingType: '正常所见', text: '双侧大脑半球对称,灰白质对比正常。', pinyin: 'shuangcedanaobanqiuduicheng' },
  { id: 'mr-2', bodyPart: '头颅', findingType: '正常所见', text: '脑室、脑池、脑沟未见扩大、变窄。', pinyin: 'naoshinaochinaogouweijiankuodabianzhai' },
  { id: 'mr-3', bodyPart: '头颅', findingType: '正常所见', text: '中线结构居中。', pinyin: 'zhongxianjiegoujuzhong' },
  { id: 'mr-4', bodyPart: '头颅', findingType: '正常所见', text: '颅骨骨质未见异常。', pinyin: 'luguguzhiweijianyichang' },
  { id: 'mr-5', bodyPart: '头颅', findingType: '正常所见', text: 'DWI 未见明显扩散受限高信号。', pinyin: 'dwiweijianmingxiankuosanshouxiangaoxinhao' },
  { id: 'mr-6', bodyPart: '头颅', findingType: '异常所见', text: 'T1WI 呈低信号,T2WI 呈高信号。', pinyin: 't1wichengdixinhaot2wichenggaoxinhao' },
  { id: 'dr-1', bodyPart: '胸部', findingType: '正常所见', text: '双肺纹理清晰,肺门影不大。', pinyin: 'shuangfeiwenliqingxifeimengyingbuda' },
  { id: 'dr-2', bodyPart: '胸部', findingType: '正常所见', text: '心影大小、形态正常。', pinyin: 'xinyingdaxiaoxingtaizhengchang' },
  { id: 'dr-3', bodyPart: '胸部', findingType: '正常所见', text: '纵隔居中,气管居中。', pinyin: 'zonggejuzhongqiguanjuzhong' },
  { id: 'dr-4', bodyPart: '胸部', findingType: '正常所见', text: '双侧膈面光滑,肋膈角锐利。', pinyin: 'shuangcegemianaguangleigejiaoruili' },
  { id: 'dr-5', bodyPart: '胸部', findingType: '正常所见', text: '胸廓对称,所见骨质未见异常。', pinyin: 'xiongkuoduicheng' },
  { id: 'cv-1', bodyPart: '胸部', findingType: '异常所见', text: '大量气胸(肺组织压缩>50%),建议立即胸腔穿刺引流。', pinyin: 'daliangqixiongfeizuzhiyasuo' },
  { id: 'cv-2', bodyPart: '胸部', findingType: '异常所见', text: '主动脉可见内膜片,考虑主动脉夹层,建议立即外科就诊。', pinyin: 'zhudongmaikejianneimopian' },
  { id: 'cv-3', bodyPart: '头颅', findingType: '异常所见', text: '大面积脑梗死(超过一个脑叶),建议立即神经内科就诊。', pinyin: 'damianjinaogengsi' },
  { id: 'cv-4', bodyPart: '胸部', findingType: '异常所见', text: '冠脉 CTA 示冠脉狭窄>75%,考虑急性心肌梗死改变。', pinyin: 'guanmaictashiguanmaixiazhai' },
]

const FAVORITES_KEY = 'g005_phrase_favorites'
const USAGE_KEY = 'g005_phrase_usage'
const RECENT_KEY = 'g005_phrase_recent'

interface RecentItem {
  id: string
  text: string
  timestamp: number
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

export interface PhraseBankProps {
  open: boolean
  onClose: () => void
  onInsert?: (text: string) => void
  phrases?: Phrase[]
}

export const PhraseBank: React.FC<PhraseBankProps> = ({ open, onClose, onInsert, phrases = PHRASES }) => {
  const [search, setSearch] = useState('')
  const [activeBodyPart, setActiveBodyPart] = useState<string | null>(BODY_PARTS[0])
  const [activeFindingType, setActiveFindingType] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(() => loadJSON<string[]>(FAVORITES_KEY, []))
  const [usage, setUsage] = useState<Record<string, number>>(() => loadJSON<Record<string, number>>(USAGE_KEY, {}))
  const [recent, setRecent] = useState<RecentItem[]>(() => loadJSON<RecentItem[]>(RECENT_KEY, []))

  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)) }, [usage])
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)) }, [recent])

  const treeData: DataNode[] = useMemo(() => {
    return BODY_PARTS
      .filter(bp => phrases.some(p => p.bodyPart === bp))
      .map((bp) => {
        const bodyPhrases = phrases.filter(p => p.bodyPart === bp)
        const children: DataNode[] = FINDING_TYPES
          .filter(ft => bodyPhrases.some(p => p.findingType === ft))
          .map(ft => ({
            title: (
              <Space size={4}>
                <span>{ft}</span>
                <Tag style={{ fontSize: 10 }}>{bodyPhrases.filter(p => p.findingType === ft).length}</Tag>
              </Space>
            ),
            key: `${bp}||${ft}`,
            isLeaf: true,
          }))
        return {
          title: (
            <Space size={4}>
              <span>{bp}</span>
              <Tag style={{ fontSize: 10 }}>{bodyPhrases.length}</Tag>
            </Space>
          ),
          key: bp,
          children,
        }
      })
  }, [phrases])

  const filtered = useMemo(() => {
    let result = [...phrases]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.text.toLowerCase().includes(q) ||
        (p.pinyin && p.pinyin.toLowerCase().includes(q)) ||
        p.bodyPart.includes(q) ||
        p.findingType.includes(q)
      )
    }
    if (activeBodyPart) {
      result = result.filter(p => p.bodyPart === activeBodyPart)
      if (activeFindingType) {
        result = result.filter(p => p.findingType === activeFindingType)
      }
    }
    if (showFavorites) {
      result = result.filter(p => favorites.includes(p.id))
    }
    return result
  }, [phrases, search, activeBodyPart, activeFindingType, showFavorites, favorites])

  const selectedKeys = useMemo(() => {
    if (activeFindingType && activeBodyPart) return [`${activeBodyPart}||${activeFindingType}`]
    if (activeBodyPart) return [activeBodyPart]
    return []
  }, [activeBodyPart, activeFindingType])

  const onTreeSelect = useCallback((keys: React.Key[]) => {
    const raw = keys[0]
    if (raw == null || typeof raw !== 'string') {
      setActiveBodyPart(null)
      setActiveFindingType(null)
      return
    }
    const idx = raw.indexOf('||')
    if (idx !== -1) {
      setActiveBodyPart(raw.slice(0, idx))
      setActiveFindingType(raw.slice(idx + 2))
    } else {
      setActiveBodyPart(raw)
      setActiveFindingType(null)
    }
  }, [])

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }, [])

  const handleInsert = useCallback((text: string, id: string) => {
    onInsert?.(text)
    setUsage(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    setRecent(prev => {
      const without = prev.filter(r => r.id !== id)
      return [{ id, text, timestamp: Date.now() }, ...without].slice(0, 5)
    })
  }, [onInsert])

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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Input
          data-testid="phrase-search"
          prefix={<Search size={14} />}
          placeholder="搜索短语(支持拼音)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 8 }}
        />

        <Space style={{ marginBottom: 8 }} size={4}>
          <Button
            size="small"
            type={!showFavorites ? 'primary' : 'default'}
            onClick={() => setShowFavorites(false)}
          >
            全部
          </Button>
          <Button
            size="small"
            type={showFavorites ? 'primary' : 'default'}
            onClick={() => setShowFavorites(true)}
          >
            收藏 {favorites.length > 0 && `(${favorites.length})`}
          </Button>
        </Space>

        <div style={{ display: 'flex', gap: 12, flex: 1, overflow: 'hidden' }}>
          <div style={{ width: 160, borderRight: '1px solid #f0f0f0', paddingRight: 8, overflow: 'auto' }}>
            <Tree
              treeData={treeData}
              defaultExpandAll
              selectedKeys={selectedKeys}
              onSelect={onTreeSelect}
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {recent.length > 0 && !search && !showFavorites && (
              <div
                style={{
                  marginBottom: 8,
                  padding: 6,
                  background: '#f0f9ff',
                  borderRadius: 6,
                  border: '1px solid #bae6fd',
                }}
              >
                <Space style={{ marginBottom: 4 }}>
                  <Clock size={12} color="#0284c7" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0284c7' }}>最近使用</span>
                </Space>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {recent.map((r) => (
                    <Tooltip key={r.id} title={formatTime(r.timestamp)}>
                      <Tag
                        style={{ cursor: 'pointer', fontSize: 11, maxWidth: 160 }}
                        color="blue"
                        onClick={() => handleInsert(r.text, r.id)}
                      >
                        {r.text.length > 12 ? `${r.text.slice(0, 12)}...` : r.text}
                      </Tag>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <Empty description={showFavorites ? '暂无收藏短语' : '暂无可用短语'} />
            ) : (
              filtered.map((p) => {
                const count = usage[p.id]
                return (
                  <div
                    key={p.id}
                    data-testid={`phrase-${p.id}`}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: '#f8fafc',
                      marginBottom: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                    onClick={() => handleInsert(p.text, p.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Space size={4}>
                        <Tag color="blue" style={{ fontSize: 10 }}>{p.bodyPart}/{p.findingType}</Tag>
                        {p.shortcut && (
                          <Tooltip title="快捷键">
                            <Tag color="purple" style={{ fontSize: 10 }}>{p.shortcut}</Tag>
                          </Tooltip>
                        )}
                        {count != null && count > 0 ? (
                          <span style={{ fontSize: 9, color: '#94a3b8' }}>
                            使用{count}次
                          </span>
                        ) : null}
                      </Space>
                      <Space size={2}>
                        <Button
                          type="link"
                          size="small"
                          icon={<Plus size={12} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInsert(p.text, p.id)
                          }}
                          style={{ height: 20, padding: '0 4px' }}
                        >
                          插入
                        </Button>
                        <Tooltip title={favorites.includes(p.id) ? '取消收藏' : '收藏'}>
                          <Button
                            type="link"
                            size="small"
                            icon={
                              favorites.includes(p.id)
                                ? <Star size={13} fill="#f59e0b" color="#f59e0b" />
                                : <StarOff size={13} />
                            }
                            onClick={(e) => toggleFavorite(p.id, e)}
                            style={{ height: 20, padding: '0 4px' }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                    <div>{p.text}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default PhraseBank
