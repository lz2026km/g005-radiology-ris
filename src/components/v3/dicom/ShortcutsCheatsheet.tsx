/**
 * G005 放射RIS系统 v3.0.1 - 快捷键速查面板
 * 行业标准:按 ? 唤起,展示所有全局快捷键
 */
import React, { useEffect, useState, useCallback } from 'react'
import { Modal, Tag, Divider } from 'antd'
import { Keyboard } from 'lucide-react'

export interface ShortcutItem {
  key: string
  description: string
  scope: 'viewer' | 'report' | 'global'
}

export const SHORTCUTS: ShortcutItem[] = [
  { key: 'W / Shift+W', description: '窗宽 / 窗位', scope: 'viewer' },
  { key: 'R', description: '测距', scope: 'viewer' },
  { key: 'A', description: '角度', scope: 'viewer' },
  { key: 'C', description: '圆形 / 椭圆', scope: 'viewer' },
  { key: 'M', description: '测量模式', scope: 'viewer' },
  { key: 'F', description: '复位', scope: 'viewer' },
  { key: 'H', description: '摆位协议', scope: 'viewer' },
  { key: 'K', description: '关键图像', scope: 'viewer' },
  { key: 'Space', description: '播放 / 暂停', scope: 'viewer' },
  { key: '← / →', description: '上一帧 / 下一帧', scope: 'viewer' },
  { key: '+ / -', description: '放大 / 缩小', scope: 'viewer' },
  { key: 'Ctrl+1..7', description: '7 种窗宽预设', scope: 'viewer' },
  { key: 'Ctrl+S', description: '保存草稿', scope: 'report' },
  { key: 'Ctrl+Enter', description: '提交一审', scope: 'report' },
  { key: 'Alt+A', description: 'AI 续写', scope: 'report' },
  { key: 'Alt+T', description: '插入模板', scope: 'report' },
  { key: 'Alt+P', description: '短语库', scope: 'report' },
  { key: 'Alt+H', description: '历史报告', scope: 'report' },
  { key: 'F2', description: '关键图像锚点', scope: 'report' },
  { key: 'Ctrl+K', description: '命令面板', scope: 'global' },
  { key: 'Alt+1..9', description: '工作列表快速过滤', scope: 'global' },
  { key: '?', description: '速查面板', scope: 'global' },
  { key: 'Esc', description: '取消选择 / 关闭弹窗', scope: 'global' },
]

const scopeColor: Record<ShortcutItem['scope'], string> = {
  viewer: 'blue',
  report: 'green',
  global: 'purple',
}

const scopeLabel: Record<ShortcutItem['scope'], string> = {
  viewer: '影像',
  report: '报告',
  global: '全局',
}

export interface ShortcutsCheatsheetProps {
  open?: boolean
  onClose?: () => void
}

export const ShortcutsCheatsheet: React.FC<ShortcutsCheatsheetProps> = ({ open: controlledOpen, onClose }) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen

  const close = useCallback(() => {
    if (controlledOpen === undefined) setInternalOpen(false)
    onClose?.()
  }, [controlledOpen, onClose])

  useEffect(() => {
    if (controlledOpen !== undefined) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if (isInput) return
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setInternalOpen((o) => !o)
      } else if (e.key === 'Escape' && internalOpen) {
        setInternalOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [controlledOpen, internalOpen])

  const grouped = SHORTCUTS.reduce(
    (acc, s) => {
      acc[s.scope] = acc[s.scope] ?? []
      acc[s.scope]!.push(s)
      return acc
    },
    {} as Record<ShortcutItem['scope'], ShortcutItem[]>
  )

  return (
    <Modal
      data-testid="shortcuts-cheatsheet"
      open={open}
      onCancel={close}
      footer={null}
      width={640}
      title={
        <span>
          <Keyboard size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          快捷键速查
        </span>
      }
    >
      {(['viewer', 'report', 'global'] as const).map((scope) => (
        <div key={scope} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Tag color={scopeColor[scope]} style={{ fontWeight: 600 }}>
              {scopeLabel[scope]}
            </Tag>
          </div>
          {grouped[scope]?.map((s) => (
            <div
              key={s.key + s.description}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 12px',
                borderBottom: '1px dashed #f0f0f0',
              }}
            >
              <span style={{ color: '#475569' }}>{s.description}</span>
              <kbd
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
          <Divider style={{ margin: '12px 0' }} />
        </div>
      ))}
      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        提示:在工作区任意位置按 <kbd>?</kbd> 唤起 / 关闭本面板
      </div>
    </Modal>
  )
}

export default ShortcutsCheatsheet
