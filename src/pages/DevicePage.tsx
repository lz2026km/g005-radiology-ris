// @ts-nocheck
// G005 放射科RIS系统 - 设备管理 v0.1.0
import { useState } from 'react'
import { Monitor, Wrench, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react'
import { initialModalityDevices, initialDeviceMaintenance, initialExamRooms } from '../data/initialData'

const STATUS_COLORS: Record<string, string> = {
  '空闲': '#059669', '使用中': '#2563eb', '维护中': '#d97706', '维修中': '#dc2626', '已报废': '#94a3b8'
}

export default function DevicePage() {
  const [search, setSearch] = useState('')
  const devices = initialModalityDevices
  const maintenance = initialDeviceMaintenance
  const rooms = initialExamRooms

  const filtered = devices.filter(d => !search || d.name.includes(search) || d.modality.includes(search))

  const stats = {
    total: devices.length,
    idle: devices.filter(d => d.status === '空闲').length,
    busy: devices.filter(d => d.status === '使用中').length,
    maint: devices.filter(d => ['维护中', '维修中'].includes(d.status)).length,
    capacity: Math.round(devices.reduce((sum, d) => sum + (d.currentLoad || 0), 0) / devices.reduce((sum, d) => sum + (d.dailyCapacity || 1), 0) * 100)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>设备管理</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>设备状态监控 · 维护记录 · 产能分析 · 故障预警</p>
      </div>

      {/* 统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '设备总数', value: stats.total, icon: <Monitor size={16} />, color: '#3b82f6' },
          { label: '使用中', value: stats.busy, icon: <CheckCircle size={16} />, color: '#2563eb' },
          { label: '空闲', value: stats.idle, icon: <Clock size={16} />, color: '#059669' },
          { label: '维护/维修', value: stats.maint, icon: <Wrench size={16} />, color: '#d97706' },
          { label: '整体负载', value: `${stats.capacity}%`, icon: <AlertCircle size={16} />, color: '#7c3aed' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: item.color }}>{item.icon}</div>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>{item.value}</div><div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.label}</div></div>
          </div>
        ))}
      </div>

      {/* 搜索 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '10px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={14} style={{ color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索设备名称/型号..." style={{ border: 'none', outline: 'none', fontSize: 13, width: 300 }} />
      </div>

      {/* 设备卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(device => {
          const deviceRooms = rooms.filter(r => r.deviceId === device.id)
          const deviceMaint = maintenance.filter(m => m.deviceId === device.id)
          const loadPct = device.dailyCapacity ? Math.round((device.currentLoad || 0) / device.dailyCapacity * 100) : 0
          return (
            <div key={device.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* 头部 */}
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{device.name.split('（')[0]}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{device.manufacturer} · {device.model}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[device.status]}20`, color: STATUS_COLORS[device.status] }}>
                  {device.status}
                </span>
              </div>
              {/* 内容 */}
              <div style={{ padding: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    ['设备类型', device.modality],
                    ['检查室', device.roomNumber || '-'],
                    ['序列号', device.serialNumber || '-'],
                    ['购置年份', device.acquisitionYear ? `${device.acquisitionYear}年` : '-'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: 6, padding: '5px 8px' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginTop: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>
                {/* 产能 */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                    <span>今日负载</span><span style={{ fontWeight: 700, color: loadPct > 90 ? '#dc2626' : loadPct > 70 ? '#d97706' : '#059669' }}>{loadPct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${loadPct}%`, background: loadPct > 90 ? '#dc2626' : loadPct > 70 ? '#d97706' : '#22c55e', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{device.currentLoad || 0} / {device.dailyCapacity || 0} 例</div>
                </div>
                {/* 维护 */}
                {device.nextMaintenanceDate && (
                  <div style={{ fontSize: 11, color: '#94a3b8', padding: '4px 0', borderTop: '1px solid #f1f5f9' }}>
                    下次维护：{device.nextMaintenanceDate}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
