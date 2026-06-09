/**
 * G005 放射RIS系统 v3.0.2 - 模板设计器(拖拽字段)
 * 对标:创业 PACS — 拖拽式字段 + 实时预览
 */
import React, { useState, useCallback, useMemo } from 'react'
import { Card, Space, Tag, Button, Input, Select, Empty, Tooltip, Modal } from 'antd'
import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Plus, Trash2, Type, Hash, Calendar, ListChecks, Eye, Settings2 } from 'lucide-react'
import { renderMacro, buildSampleContext } from './MacroEngine'

interface DesignerField {
  id: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiline' | 'macro' | 'separator'
  label: string
  value: string
  required?: boolean
  options?: string[]
}

interface FieldTypeMeta {
  type: DesignerField['type']
  label: string
  icon: React.ReactNode
  defaultValue: string
  defaultLabel: string
}

const FIELD_TYPES: FieldTypeMeta[] = [
  { type: 'text', label: '文本', icon: <Type size={12} />, defaultValue: '{{patient.name}}', defaultLabel: '患者姓名' },
  { type: 'multiline', label: '多行文本', icon: <Type size={12} />, defaultValue: '所见:...', defaultLabel: '所见' },
  { type: 'number', label: '数字', icon: <Hash size={12} />, defaultValue: '{{values.bmi}}', defaultLabel: 'BMI' },
  { type: 'date', label: '日期', icon: <Calendar size={12} />, defaultValue: '{{date("YYYY-MM-DD")}}', defaultLabel: '检查日期' },
  { type: 'select', label: '下拉', icon: <ListChecks size={12} />, defaultValue: 'A', defaultLabel: '分级' },
  { type: 'macro', label: '宏', icon: <Settings2 size={12} />, defaultValue: '{{#if patient.age >= 18}}成人{{#else}}未成年{{/if}}', defaultLabel: '条件块' },
  { type: 'separator', label: '分隔线', icon: <Settings2 size={12} />, defaultValue: '---', defaultLabel: '---' },
]

const DraggablePalette: React.FC<{ meta: FieldTypeMeta }> = ({ meta }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${meta.type}`,
    data: { meta },
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`palette-${meta.type}`}
      style={{
        padding: '6px 10px',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        background: isDragging ? '#eef2ff' : '#fafafa',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        userSelect: 'none',
      }}
    >
      {meta.icon}
      <span>{meta.label}</span>
    </div>
  )
}

const DroppableCanvas: React.FC<{ children: React.ReactNode; isOver?: boolean }> = ({ children, isOver }) => (
  <div
    style={{
      minHeight: 320,
      padding: 12,
      background: isOver ? '#eef2ff' : '#fafafa',
      border: `2px dashed ${isOver ? '#6366f1' : '#d9d9d9'}`,
      borderRadius: 6,
      transition: 'all 0.15s',
    }}
  >
    {children}
  </div>
)

const DraggableField: React.FC<{ field: DesignerField; onRemove: () => void; onUpdate: (p: Partial<DesignerField>) => void }> = ({
  field,
  onRemove,
  onUpdate,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `field-${field.id}`,
    data: { field },
  })
  return (
    <div
      ref={setNodeRef}
      data-testid={`canvas-field-${field.id}`}
      style={{
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span
          {...listeners}
          {...attributes}
          style={{ cursor: 'grab', color: '#94a3b8', fontSize: 14 }}
          data-testid={`field-drag-${field.id}`}
        >
          ⋮⋮
        </span>
        <Input
          size="small"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="字段标签"
          style={{ flex: 1 }}
          data-testid={`field-label-${field.id}`}
        />
        {field.required && <Tag color="red">必填</Tag>}
        <Tag color={field.type === 'macro' ? 'purple' : 'blue'}>{field.type}</Tag>
        <Button
          size="small"
          type="text"
          danger
          icon={<Trash2 size={12} />}
          onClick={onRemove}
          data-testid={`field-remove-${field.id}`}
        />
      </div>
      {field.type === 'select' ? (
        <Select
          size="small"
          mode="tags"
          style={{ width: '100%' }}
          placeholder="选项(回车添加)"
          value={field.options ?? []}
          onChange={(v) => onUpdate({ options: v })}
        />
      ) : field.type === 'separator' ? null : (
        <Input.TextArea
          size="small"
          rows={field.type === 'multiline' ? 3 : 1}
          value={field.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="值或宏"
          data-testid={`field-value-${field.id}`}
        />
      )}
    </div>
  )
}

export interface TemplateDesignerCanvasProps {
  initialFields?: DesignerField[]
  onChange?: (fields: DesignerField[]) => void
}

export const TemplateDesignerCanvas: React.FC<TemplateDesignerCanvasProps> = ({
  initialFields = [],
  onChange,
}) => {
  const [fields, setFields] = useState<DesignerField[]>(initialFields)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { setNodeRef: setCanvasRef, isOver } = useDroppable({ id: 'canvas-root' })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const update = useCallback(
    (next: DesignerField[]) => {
      setFields(next)
      onChange?.(next)
    },
    [onChange]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || over.id !== 'canvas-root') return
      const data = active.data.current as { meta?: FieldTypeMeta } | undefined
      if (!data?.meta) return
      const meta = data.meta
      const newField: DesignerField = {
        id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: meta.type,
        label: meta.defaultLabel,
        value: meta.defaultValue,
        options: meta.type === 'select' ? ['A', 'B', 'C'] : undefined,
      }
      update([...fields, newField])
    },
    [fields, update]
  )

  const removeField = useCallback(
    (id: string) => {
      update(fields.filter((f) => f.id !== id))
    },
    [fields, update]
  )

  const updateField = useCallback(
    (id: string, patch: Partial<DesignerField>) => {
      update(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)))
    },
    [fields, update]
  )

  const generatedTemplate = useMemo(() => {
    return fields
      .map((f) => {
        if (f.type === 'separator') return '\n---'
        if (f.type === 'macro') return `\n${f.value}`
        return `\n${f.label}: ${f.value}`
      })
      .join('\n')
      .trim()
  }, [fields])

  const previewText = useMemo(() => {
    const ctx = buildSampleContext()
    return renderMacro(generatedTemplate, ctx).text
  }, [generatedTemplate])

  return (
    <Card
      data-testid="template-designer-canvas"
      size="small"
      title={
        <Space>
          <Settings2 size={16} color="#1e3a5f" />
          <span>模板设计器</span>
          <Tag>{fields.length} 字段</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            size="small"
            icon={<Eye size={12} />}
            onClick={() => setPreviewOpen(true)}
            data-testid="tdc-preview"
          >
            预览
          </Button>
        </Space>
      }
      bodyStyle={{ padding: 12 }}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Space wrap style={{ marginBottom: 12 }}>
          {FIELD_TYPES.map((m) => (
            <DraggablePalette key={m.type} meta={m} />
          ))}
        </Space>
        <div ref={setCanvasRef}>
          <DroppableCanvas isOver={isOver}>
            {fields.length === 0 ? (
              <Empty description="拖拽左侧字段到此处开始设计" />
            ) : (
              fields.map((f) => (
                <DraggableField
                  key={f.id}
                  field={f}
                  onRemove={() => removeField(f.id)}
                  onUpdate={(p) => updateField(f.id, p)}
                />
              ))
            )}
          </DroppableCanvas>
        </div>
      </DndContext>

      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        title="模板预览"
        width={640}
      >
        <pre
          data-testid="tdc-preview-text"
          style={{
            background: '#f8fafc',
            padding: 12,
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.8,
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
          }}
        >
          {previewText}
        </pre>
      </Modal>
    </Card>
  )
}

export default TemplateDesignerCanvas
