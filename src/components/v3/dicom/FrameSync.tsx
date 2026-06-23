/**
 * G005 放射RIS系统 v3.0.1 - 帧同步开关
 * 对标 GE / 西门子 / 联影 — 棋盘布局下多视口同步滚动/窗位
 */
import React from 'react'
import { Switch, Tooltip, Space, Tag } from 'antd'
import { Link2, Unlink } from 'lucide-react'

export interface FrameSyncProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  syncedFields?: { frame?: boolean; windowLevel?: boolean; zoom?: boolean; pan?: boolean }
  onSyncedFieldsChange?: (fields: { frame?: boolean; windowLevel?: boolean; zoom?: boolean; pan?: boolean }) => void
  viewportCount?: number
}

export const FrameSync: React.FC<FrameSyncProps> = ({
  enabled,
  onToggle,
  syncedFields = { frame: true, windowLevel: true, zoom: false, pan: true },
  onSyncedFieldsChange,
  viewportCount = 4,
}) => {
  const toggleField = (field: keyof typeof syncedFields) => {
    if (!onSyncedFieldsChange) return
    onSyncedFieldsChange({ ...syncedFields, [field]: !syncedFields[field] })
  }

  return (
    <div
      data-testid="frame-sync"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px',
        background: enabled ? '#1e3a5f' : '#1e293b',
        borderRadius: 6,
        border: '1px solid #334155',
        color: '#e2e8f0',
        fontSize: 12,
      }}
    >
      {enabled ? <Link2 size={14} color="#22c55e" /> : <Unlink size={14} color="#64748b" />}
      <span style={{ fontWeight: 600 }}>帧同步</span>
      <Tag color={enabled ? 'green' : 'default'} style={{ margin: 0, fontSize: 12 }}>
        {enabled ? `ON · ${viewportCount}视口` : 'OFF'}
      </Tag>
      <Switch size="small" checked={enabled} onChange={onToggle} data-testid="frame-sync-switch" />
      {enabled && onSyncedFieldsChange && (
        <Space size={4} style={{ marginLeft: 4 }}>
          {(['frame', 'windowLevel', 'zoom', 'pan'] as const).map((f) => (
            <Tooltip key={f} title={`同步 ${f}`}>
              <Tag.CheckableTag
                checked={!!syncedFields[f]}
                onChange={() => toggleField(f)}
                style={{ fontSize: 12, padding: '0 4px' }}
                data-testid={`frame-sync-field-${f}`}
              >
                {f === 'frame' ? '帧' : f === 'windowLevel' ? 'WW/WL' : f === 'zoom' ? '缩放' : '平移'}
              </Tag.CheckableTag>
            </Tooltip>
          ))}
        </Space>
      )}
    </div>
  )
}

export default FrameSync
