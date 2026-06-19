import React, { useEffect, useState } from 'react'
import { Tag, Tooltip, Progress } from 'antd'
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react'
import type { NetworkConnectivity } from '../../types/mobile'

interface OfflineIndicatorProps {
  connectivity: NetworkConnectivity
  queueCount?: number
  onSyncClick?: () => void
  compact?: boolean
}

const CONFIG: Record<NetworkConnectivity, { color: string; label: string; icon: React.ReactNode }> = {
  online: { color: 'green', label: '在线', icon: <Wifi size={12} /> },
  offline: { color: 'red', label: '离线', icon: <WifiOff size={12} /> },
  weak: { color: 'orange', label: '信号弱', icon: <CloudOff size={12} /> },
  unstable: { color: 'warning', label: '不稳定', icon: <RefreshCw size={12} /> },
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ connectivity, queueCount = 0, onSyncClick, compact }) => {
  const cfg = CONFIG[connectivity]

  if (compact) {
    return (
      <Tooltip title={`${cfg.label}${queueCount > 0 ? ` · ${queueCount} 项待同步` : ''}`}>
        <span style={{ color: connectivity === 'online' ? '#16a34a' : '#dc2626', cursor: 'pointer' }} onClick={onSyncClick}>
          {cfg.icon}
        </span>
      </Tooltip>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
      <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>
      {connectivity !== 'online' && queueCount > 0 && (
        <Tooltip title="点击同步">
          <span onClick={onSyncClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Progress type="circle" percent={100} size={18} format={() => `${queueCount}`} strokeColor="#faad14" />
            <span style={{ fontSize: 11, color: '#64748b' }}>待同步</span>
          </span>
        </Tooltip>
      )}
    </div>
  )
}

export default OfflineIndicator
