// @ts-nocheck
// G005 放射科RIS系统 - 检查预约 v0.1.0
import { useState } from 'react'
import { CalendarClock, Search, Plus, Clock, CheckCircle, X, AlertCircle } from 'lucide-react'
import { initialRadiologyExams, initialModalityDevices, initialExamItems } from '../data/initialData'

export default function AppointmentPage() {
  const [search, setSearch] = useState('')
  const exams = initialRadiologyExams.filter(e => ['已登记', '待检查'].includes(e.status))
  const devices = initialModalityDevices

  const filtered = exams.filter(e => !search || e.patientName.includes(search))

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>
            <CalendarClock size={20} style={{ marginRight: 8, color: '#d97706', verticalAlign: 'text-bottom' }} />
            检查预约管理
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>预约排程 · 设备分配 · 时间段管理 · 冲突检测</p>
        </div>
        <button style={{ padding: '8px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> 新建预约
        </button>
      </div>

      {/* 设备日历视图 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {devices.filter(d => d.status !== '维护中').slice(0, 6).map(device => (
          <div key={device.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{device.name.split('（')[0]}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{device.roomNumber} · {device.modality}</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: device.status === '使用中' ? '#dbeafe' : '#d1fae5', color: device.status === '使用中' ? '#2563eb' : '#059669' }}>{device.status}</span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>今日预约 ({device.currentLoad || 0}/{device.dailyCapacity || 0})</div>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${Math.round((device.currentLoad || 0) / (device.dailyCapacity || 1) * 100)}%`, background: '#3b82f6', borderRadius: 3 }} />
              </div>
              {/* 时间段 */}
              {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => {
                const exam = exams.find(e => e.deviceId === device.id && e.examTime === time)
                return (
                  <div key={time} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8', width: 40 }}>{time}</span>
                    {exam ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#334155', background: '#eff6ff', padding: '2px 6px', borderRadius: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exam.patientName} · {exam.examItemName.split('CT')[0] || exam.examItemName.split('MR')[0] || exam.examItemName}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 预约列表 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>待预约检查</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['患者', '检查项目', '设备偏好', '预约日期', '预约时间', '优先级', '状态', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(exam => (
              <tr key={exam.id} style={{ borderBottom: '1px solid #f8fafc' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fff'}
              >
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e3a5f' }}>{exam.patientName}</td>
                <td style={{ padding: '8px 12px' }}><div style={{ fontSize: 12, color: '#334155' }}>{exam.examItemName}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>{exam.modality}</div></td>
                <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{exam.deviceName?.split('（')[0] || '-'}</td>
                <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{exam.examDate}</td>
                <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{exam.examTime || '待定'}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: exam.priority === '危重' ? '#fee2e2' : exam.priority === '紧急' ? '#fef3c7' : '#f1f5f9', color: exam.priority === '危重' ? '#dc2626' : exam.priority === '紧急' ? '#d97706' : '#64748b' }}>{exam.priority}</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#fef9c3', color: '#ca8a04' }}>待预约</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <button style={{ padding: '3px 10px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>安排</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
