/**
 * G005 放射RIS系统 v3.0.2 - 模板分类树(拖拽)
 * 对标:东软 / 岱嘉 PACS — 树形导航 + 拖拽改类
 */
import React, { useState, useCallback } from 'react'
import { Tree, Tag, Space, Input, Empty, Tooltip } from 'antd'
import { Folder, FileText, Search } from 'lucide-react'
import { REPORT_TEMPLATES, type ReportTemplate, type TemplateCategory } from '@data/reportTemplates'
import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  CT: 'blue',
  MR: 'purple',
  DR: 'cyan',
  US: 'green',
  MG: 'magenta',
  DSA: 'volcano',
  CRITICAL: 'red',
  CUSTOM: 'gold',
}

const DraggableTemplate: React.FC<{ t: ReportTemplate }> = ({ t }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tpl-${t.id}`,
    data: { templateId: t.id, fromCategory: t.category },
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`tpl-row-${t.id}`}
      style={{
        padding: '4px 8px',
        background: isDragging ? '#eef2ff' : 'transparent',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 4,
        userSelect: 'none',
      }}
    >
      <FileText size={12} color={isDragging ? '#6366f1' : '#94a3b8'} />
      <span style={{ flex: 1, fontSize: 12 }}>{t.name}</span>
      <Tooltip title={t.description}>
        <Tag color={t.parentId ? 'purple' : 'default'} style={{ fontSize: 10, margin: 0 }}>
          v{t.version}
        </Tag>
      </Tooltip>
    </div>
  )
}

const DroppableCategory: React.FC<{
  category: TemplateCategory
  label: string
  count: number
  isOver: boolean
}> = ({ category, label, count, isOver }) => {
  const { setNodeRef } = useDroppable({ id: `cat-drop-${category}` })
  return (
    <div
      ref={setNodeRef}
      data-testid={`cat-drop-${category}`}
      style={{
        background: isOver ? '#eef2ff' : 'transparent',
        borderRadius: 4,
        padding: 2,
      }}
    >
      <Space>
        <Folder size={12} color={CATEGORY_COLORS[category]} />
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
        <Tag color={CATEGORY_COLORS[category]} style={{ fontSize: 10 }}>
          {count}
        </Tag>
      </Space>
    </div>
  )
}

export interface TemplateCategoryTreeProps {
  onSelect?: (template: ReportTemplate) => void
  onMove?: (templateId: string, fromCategory: TemplateCategory, toCategory: TemplateCategory) => void
}

export const TemplateCategoryTree: React.FC<TemplateCategoryTreeProps> = ({ onSelect, onMove }) => {
  const [search, setSearch] = useState('')
  const [overCat, setOverCat] = useState<TemplateCategory | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const active = event.active
      const over = event.over
      if (!over || !active) return
      const targetCat = String(over.id).replace('cat-drop-', '') as TemplateCategory
      const fromCat = (active.data.current as { fromCategory?: TemplateCategory } | undefined)?.fromCategory
      const tplId = String(active.id).replace('tpl-', '')
      if (fromCat !== targetCat) {
        const tpl = REPORT_TEMPLATES.find((t) => t.id === tplId)
        if (tpl) tpl.category = targetCat
        onMove?.(tplId, fromCat!, targetCat)
      }
      setOverCat(null)
    },
    [onMove]
  )

  const filteredTemplates = (cat: TemplateCategory) =>
    REPORT_TEMPLATES
      .filter((t) => t.category === cat)
      .filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div data-testid="template-category-tree" style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
      <Input
        prefix={<Search size={12} />}
        placeholder="搜索模板..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 8 }}
        allowClear
        data-testid="tct-search"
      />
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div style={{ flex: 1, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 4, padding: 4 }}>
          {(['CT', 'MR', 'DR', 'US', 'MG', 'DSA', 'CRITICAL', 'CUSTOM'] as TemplateCategory[]).map((cat) => {
            const list = filteredTemplates(cat)
            if (list.length === 0 && search) return null
            return (
              <div key={cat} style={{ marginBottom: 8 }}>
                <DroppableCategory
                  category={cat}
                  label={cat}
                  count={list.length}
                  isOver={overCat === cat}
                />
                {list.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelect?.(t)}
                    style={{ paddingLeft: 16 }}
                  >
                    <DraggableTemplate t={t} />
                  </div>
                ))}
              </div>
            )
          })}
          {search && REPORT_TEMPLATES.every((t) => !t.name.toLowerCase().includes(search.toLowerCase())) && (
            <Empty description="无匹配模板" />
          )}
        </div>
      </DndContext>
    </div>
  )
}

export default TemplateCategoryTree
