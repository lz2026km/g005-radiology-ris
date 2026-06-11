/**
 * G005 放射RIS系统 v3.0.2 - 多模态报告面板
 * 对标:联影 uAI / 飞利浦 IntelliSpace
 *  功能:CT + MR + PET 同一报告内多模态影像融合
 *  设计:每个模态独立小节 + 跨模态关联 + 关键图像导航
 */
import React, { useState, useMemo, useCallback } from 'react'
import { Card, Tabs, Tag, Space, Button, Empty, Image, Modal, Empty as AntEmpty } from 'antd'
import { Layers, Scan, Brain, Atom, Plus, X, ImageIcon, Link2, Unlink } from 'lucide-react'

export type Modality = 'CT' | 'MR' | 'PET' | 'US' | 'XR' | 'DSA' | 'MAMMO' | 'SPECT'

export interface ModalitySlice {
  id: string
  modality: Modality
  bodyPart: string
  description: string
  /** 关键图像缩略图 dataURL */
  thumbnail?: string
  /** 完整 DICOM 引用路径 */
  studyRef?: string
  /** 系列号 */
  seriesNumber?: number
  /** 实例数 */
  instanceCount?: number
  /** 模态特定结构化字段(自由 JSON) */
  structuredFields?: Record<string, unknown>
}

export interface ModalityLink {
  fromSliceId: string
  toSliceId: string
  relation: 'same-lesion' | 'follow-up' | 'complement' | 'reference'
  note?: string
}

export interface MultiModalityPanelProps {
  slices: ModalitySlice[]
  links?: ModalityLink[]
  onSlicesChange?: (s: ModalitySlice[]) => void
  onLinksChange?: (l: ModalityLink[]) => void
  onSliceClick?: (slice: ModalitySlice) => void
  maxSlices?: number
}

const MODALITY_META: Record<Modality, { label: string; color: string; icon: React.ReactNode }> = {
  CT: { label: 'CT', color: '#1677ff', icon: <Scan size={14} /> },
  MR: { label: 'MR', color: '#722ed1', icon: <Brain size={14} /> },
  PET: { label: 'PET', color: '#fa541c', icon: <Atom size={14} /> },
  US: { label: 'US', color: '#52c41a', icon: <Scan size={14} /> },
  XR: { label: 'XR', color: '#13c2c2', icon: <Scan size={14} /> },
  DSA: { label: 'DSA', color: '#eb2f96', icon: <Scan size={14} /> },
  MAMMO: { label: '钼靶', color: '#fa541c', icon: <Scan size={14} /> },
  SPECT: { label: 'SPECT', color: '#2f54eb', icon: <Atom size={14} /> },
}

const MODALITY_BG: Record<Modality, string> = {
  CT: 'linear-gradient(135deg, #1677ff10, #1677ff05)',
  MR: 'linear-gradient(135deg, #722ed110, #722ed105)',
  PET: 'linear-gradient(135deg, #fa541c10, #fa541c05)',
  US: 'linear-gradient(135deg, #52c41a10, #52c41a05)',
  XR: 'linear-gradient(135deg, #13c2c210, #13c2c205)',
  DSA: 'linear-gradient(135deg, #eb2f9610, #eb2f9605)',
  MAMMO: 'linear-gradient(135deg, #fa541c10, #fa541c05)',
  SPECT: 'linear-gradient(135deg, #2f54eb10, #2f54eb05)',
}

const RELATION_LABEL: Record<ModalityLink['relation'], string> = {
  'same-lesion': '同一病灶',
  'follow-up': '随访',
  complement: '互补',
  reference: '参照',
}

const RELATION_COLOR: Record<ModalityLink['relation'], string> = {
  'same-lesion': 'red',
  'follow-up': 'blue',
  complement: 'green',
  reference: 'default',
}

export const MultiModalityPanel: React.FC<MultiModalityPanelProps> = ({
  slices: initialSlices,
  links: initialLinks = [],
  onSlicesChange,
  onLinksChange,
  onSliceClick,
  maxSlices = 6,
}) => {
  const [slices, setSlices] = useState<ModalitySlice[]>(initialSlices)
  const [links, setLinks] = useState<ModalityLink[]>(initialLinks)
  const [activeKey, setActiveKey] = useState<string>(initialSlices[0]?.id ?? '')
  const [linkMode, setLinkMode] = useState(false)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const [linkTo, setLinkTo] = useState<string | null>(null)
  const [linkRelation, setLinkRelation] = useState<ModalityLink['relation']>('same-lesion')
  const [previewSlice, setPreviewSlice] = useState<ModalitySlice | null>(null)

  const update = useCallback(
    (next: ModalitySlice[]) => {
      setSlices(next)
      onSlicesChange?.(next)
    },
    [onSlicesChange]
  )
  const updateLinks = useCallback(
    (next: ModalityLink[]) => {
      setLinks(next)
      onLinksChange?.(next)
    },
    [onLinksChange]
  )

  const modalities = useMemo(() => Array.from(new Set(slices.map((s) => s.modality))), [slices])

  const addSlice = useCallback(() => {
    if (slices.length >= maxSlices) return
    const id = `slice_${Date.now()}`
    const next: ModalitySlice = {
      id,
      modality: 'CT',
      bodyPart: '',
      description: '',
    }
    update([...slices, next])
    setActiveKey(id)
  }, [slices, maxSlices, update])

  const removeSlice = useCallback(
    (id: string) => {
      update(slices.filter((s) => s.id !== id))
      updateLinks(links.filter((l) => l.fromSliceId !== id && l.toSliceId !== id))
      if (activeKey === id) setActiveKey(slices[0]?.id ?? '')
    },
    [slices, links, activeKey, update, updateLinks]
  )

  const updateSlice = useCallback(
    (id: string, patch: Partial<ModalitySlice>) => {
      update(slices.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    },
    [slices, update]
  )

  const handleSliceClick = useCallback(
    (s: ModalitySlice) => {
      onSliceClick?.(s)
      setActiveKey(s.id)
    },
    [onSliceClick]
  )

  const startLink = useCallback((id: string) => {
    setLinkFrom(id)
    setLinkTo(null)
    setLinkMode(true)
  }, [])

  const completeLink = useCallback(
    (id: string) => {
      if (!linkFrom) {
        setLinkFrom(id)
        return
      }
      if (linkFrom === id) {
        setLinkFrom(null)
        setLinkMode(false)
        return
      }
      setLinkTo(id)
    },
    [linkFrom]
  )

  const confirmLink = useCallback(() => {
    if (!linkFrom || !linkTo) return
    const next: ModalityLink[] = [
      ...links,
      { fromSliceId: linkFrom, toSliceId: linkTo, relation: linkRelation },
    ]
    updateLinks(next)
    setLinkFrom(null)
    setLinkTo(null)
    setLinkMode(false)
  }, [linkFrom, linkTo, linkRelation, links, updateLinks])

  const cancelLink = useCallback(() => {
    setLinkFrom(null)
    setLinkTo(null)
    setLinkMode(false)
  }, [])

  const removeLink = useCallback(
    (idx: number) => {
      updateLinks(links.filter((_, i) => i !== idx))
    },
    [links, updateLinks]
  )

  const renderSlicePanel = (s: ModalitySlice) => {
    const meta = MODALITY_META[s.modality]
    return (
      <div data-testid={`mm-slice-${s.id}`} key={s.id}>
        <div
          style={{
            background: MODALITY_BG[s.modality],
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${meta.color}30`,
            marginBottom: 12,
          }}
        >
          <Space style={{ marginBottom: 8 }} wrap>
            <Tag color={meta.color} icon={meta.icon}>
              {meta.label}
            </Tag>
            <span style={{ fontSize: 12, color: '#64748b' }}>模态</span>
            <select
              value={s.modality}
              data-testid={`mm-modality-${s.id}`}
              onChange={(e) => updateSlice(s.id, { modality: e.target.value as Modality })}
              style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #d9d9d9' }}
            >
              {Object.keys(MODALITY_META).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Button
              size="small"
              type="link"
              icon={linkMode ? <Link2 size={12} color={linkFrom === s.id ? '#1677ff' : '#94a3b8'} /> : <Unlink size={12} />}
              onClick={() => (linkMode ? completeLink(s.id) : startLink(s.id))}
              data-testid={`mm-link-${s.id}`}
            >
              {linkFrom === s.id ? '已选起点' : linkMode ? '选终点' : '建立关联'}
            </Button>
            <Button
              size="small"
              type="text"
              danger
              icon={<X size={12} />}
              onClick={() => removeSlice(s.id)}
              data-testid={`mm-remove-${s.id}`}
            >
              移除
            </Button>
          </Space>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: '#64748b' }}>部位</label>
              <input
                data-testid={`mm-bodyPart-${s.id}`}
                value={s.bodyPart}
                onChange={(e) => updateSlice(s.id, { bodyPart: e.target.value })}
                placeholder="如 CHEST / ABDOMEN / BRAIN"
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #d9d9d9',
                  marginTop: 2,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b' }}>序列号 / 实例数</label>
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                <input
                  type="number"
                  value={s.seriesNumber ?? ''}
                  onChange={(e) => updateSlice(s.id, { seriesNumber: Number(e.target.value) || undefined })}
                  placeholder="Series"
                  style={{ width: '50%', padding: '4px 8px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                />
                <input
                  type="number"
                  value={s.instanceCount ?? ''}
                  onChange={(e) => updateSlice(s.id, { instanceCount: Number(e.target.value) || undefined })}
                  placeholder="Instances"
                  style={{ width: '50%', padding: '4px 8px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>所见描述</label>
            <textarea
              data-testid={`mm-desc-${s.id}`}
              value={s.description}
              onChange={(e) => updateSlice(s.id, { description: e.target.value })}
              placeholder="该模态所见..."
              rows={3}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 4,
                border: '1px solid #d9d9d9',
                fontFamily: 'inherit',
                fontSize: 13,
                marginTop: 2,
              }}
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>关键图像</label>
            <div
              data-testid={`mm-thumb-${s.id}`}
              onClick={() => setPreviewSlice(s)}
              style={{
                marginTop: 4,
                width: 120,
                height: 90,
                borderRadius: 4,
                border: '1px dashed #94a3b8',
                background: s.thumbnail ? `url(${s.thumbnail}) center/cover` : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              {s.thumbnail ? null : <ImageIcon size={24} />}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (slices.length === 0) {
    return (
      <Empty
        data-testid="multi-modality-empty"
        description="尚无模态切片,点击下方按钮添加"
        image={AntEmpty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" icon={<Plus size={14} />} onClick={addSlice} data-testid="mm-add-empty">
          添加第一张切片
        </Button>
      </Empty>
    )
  }

  const tabItems = slices.map((s) => {
    const meta = MODALITY_META[s.modality]
    return {
      key: s.id,
      label: (
        <Space>
          {meta.icon}
          <span>{meta.label}</span>
          {s.bodyPart && <span style={{ fontSize: 10, color: '#94a3b8' }}>· {s.bodyPart}</span>}
        </Space>
      ),
      children: (
        <div>
          {renderSlicePanel(s)}
          {links.length > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: 8,
                background: '#f8fafc',
                borderRadius: 6,
              }}
              data-testid={`mm-links-${s.id}`}
            >
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>跨模态关联</div>
              {links
                .map((l, i) => ({ l, i }))
                .filter(({ l }) => l.fromSliceId === s.id || l.toSliceId === s.id)
                .map(({ l, i }) => {
                  const other = slices.find((x) => (l.fromSliceId === s.id ? x.id === l.toSliceId : x.id === l.fromSliceId))
                  if (!other) return null
                  const otherMeta = MODALITY_META[other.modality]
                  const direction = l.fromSliceId === s.id ? '→' : '←'
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 0',
                        fontSize: 12,
                      }}
                    >
                      <Tag color={RELATION_COLOR[l.relation]} style={{ fontSize: 10 }}>
                        {RELATION_LABEL[l.relation]}
                      </Tag>
                      <span>{direction}</span>
                      <Tag color={otherMeta.color} icon={otherMeta.icon}>
                        {otherMeta.label}
                      </Tag>
                      <span>{other.bodyPart || '(未填部位)'}</span>
                      <Button size="small" type="text" danger onClick={() => removeLink(i)}>
                        删除
                      </Button>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      ),
    }
  })

  return (
    <div data-testid="multi-modality-panel">
      <Card
        size="small"
        title={
          <Space>
            <Layers size={16} color="#1e3a5f" />
            <span>多模态报告</span>
            <Tag color="blue">{slices.length} 张切片</Tag>
            <Tag color="purple">{modalities.length} 个模态</Tag>
            <Tag color="green">{links.length} 个关联</Tag>
          </Space>
        }
        extra={
          <Space>
            {linkMode && (
              <>
                <Button size="small" type="primary" onClick={confirmLink} disabled={!linkTo}>
                  确认关联 {linkTo ? '(已选终点)' : ''}
                </Button>
                <Button size="small" onClick={cancelLink}>
                  取消
                </Button>
              </>
            )}
            <Button
              size="small"
              type={linkMode ? 'primary' : 'default'}
              icon={<Link2 size={12} />}
              onClick={() => setLinkMode(!linkMode)}
              data-testid="mm-link-mode"
            >
              {linkMode ? '退出关联模式' : '建立关联'}
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<Plus size={12} />}
              onClick={addSlice}
              disabled={slices.length >= maxSlices}
              data-testid="mm-add"
            >
              添加切片
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
          type="card"
          size="small"
          onTabClick={(k) => {
            const s = slices.find((x) => x.id === k)
            if (s) handleSliceClick(s)
          }}
        />
      </Card>

      <Modal
        open={!!previewSlice}
        onCancel={() => setPreviewSlice(null)}
        footer={null}
        width={720}
        title={previewSlice ? `${MODALITY_META[previewSlice.modality].label} · ${previewSlice.bodyPart || '关键图像'}` : ''}
      >
        {previewSlice && (
          <Image
            src={previewSlice.thumbnail}
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f1f5f9' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' text-anchor='middle' dy='.3em' font-size='14'%3E关键图像占位%3C/text%3E%3C/svg%3E"
            alt="thumbnail"
            style={{ maxHeight: 480, objectFit: 'contain', width: '100%' }}
          />
        )}
      </Modal>
    </div>
  )
}

export default MultiModalityPanel
