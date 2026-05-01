// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 检查工作列表（Worklist） v0.1.0
// DICOM MWL + HIS融合视图，借鉴GE Centricity/东软Worklist
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Filter, RefreshCw, Clock, AlertCircle,
  CheckCircle, User, Scan, FileText, Wifi, Monitor,
  ChevronRight, X, Calendar, Radio, Bell, ListChecks
} from 'lucide-react'
import { initialRadiologyExams, initialModalityDevices, initialExamRooms, initialUsers } from '../data/initialData'
import type { RadiologyExam, ModalityType } from '../types'

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  '待登记': { bg: '#fef3c7', color: '#d97706', label: '待登记' },
  '已登记': { bg: '#dbeafe', color: '#2563eb', label: '已登记' },
  '待检查': { bg: '#ede9fe', color: '#7c3aed', label: '待检查' },
  '检查中': { bg: '#fce7f3', color: '#db2777', label: '检查中' },
  '待报告': { bg: '#fef9c3', color: '#ca8a04', label: '待报告' },
  '已报告': { bg: '#d1fae5', color: '#059669', label: '已报告' },
  '已发布': { bg: '#ecfdf5', color: '#047857', label: '已发布' },
  '已取消': { bg: '#f1f5f9', color: '#94a3b8', label: '已取消' },
  '检查异常': { bg: '#fee2e2', color: '#dc2626', label: '检查异常' },
}

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  '普通': { bg: '#f1f5f9', color: '#64748b' },
  '紧急': { bg: '#fef3c7', color: '#d97706' },
  '危重': { bg: '#fee2e2', color: '#dc2626' },
  '会诊': { bg: '#ede9fe', color: '#7c3aed' },
}

export default function WorklistPage() {
  const [search, setSearch] = useState('')
  const [modalityFilter, setModalityFilter] = useState<string>('全部')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [priorityFilter, setPriorityFilter] = useState<string>('全部')
  const [dateFilter, setDateFilter] = useState('2026-05-01')
  const [selectedExam, setSelectedExam] = useState<RadiologyExam | null>(null)

  const exams = initialRadiologyExams
  const devices = initialModalityDevices
  const rooms = initialExamRooms

  const modalities = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']
  const statuses = ['全部', '已登记', '待检查', '检查中', '待报告', '已报告', '已发布']

  const filtered = useMemo(() => {
    return exams.filter(exam => {
      if (search && !exam.patientName.includes(search) && !exam.accessionNumber.includes(search) && !exam.examItemName.includes(search)) return false
      if (modalityFilter !== '全部' && exam.modality !== modalityFilter) return false
      if (statusFilter !== '全部' && exam.status !== statusFilter) return false
      if (priorityFilter !== '全部' && exam.priority !== priorityFilter) return false
      if (dateFilter && exam.examDate !== dateFilter) return false
      return true
    })
  }, [exams, search, modalityFilter, statusFilter, priorityFilter, dateFilter])

  const stats = useMemo(() => ({
    total: filtered.length,
    critical: filtered.filter(e => e.priority === '危重').length,
    completed: filtered.filter(e => ['已报告', '已发布'].includes(e.status)).length,
    pending: filtered.filter(e => ['已登记', '待检查', '检查中'].includes(e.status)).length,
  }), [filtered])

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* 顶部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>检查工作列表 (DICOM Worklist)</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>融合HIS/PAACS预约数据 · 实时设备状态 · 支持DICOM MWL</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#ecfdf5', borderRadius: 6, fontSize: 12, color: '#059669' }}>
            <Wifi size={12} /> DICOM WL 连接正常
          </div>
          <button style={{ padding: '6px 14px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> 刷新列表
          </button>
        </div>
      </div>

      {/* 统计栏 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '全部检查', value: stats.total, icon: <ListChecks size={14} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: '危重/紧急', value: stats.critical, icon: <AlertCircle size={14} />, color: '#dc2626', bg: '#fef2f2' },
          { label: '待完成', value: stats.pending, icon: <Clock size={14} />, color: '#d97706', bg: '#fffbeb' },
          { label: '已完成', value: stats.completed, icon: <CheckCircle size={14} />, color: '#059669', bg: '#ecfdf5' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索患者姓名 / Accession号 / 检查项目..." style={{ border: 'none', outline: 'none', fontSize: 13, color: '#334155', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={14} /></button>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#64748b' }}><Calendar size={12} style={{ marginRight: 4 }} />日期</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#334155' }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {modalities.map(m => (
            <button key={m} onClick={() => setModalityFilter(m)} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: modalityFilter === m ? '#3b82f6' : '#e2e8f0',
              background: modalityFilter === m ? '#eff6ff' : '#fff', color: modalityFilter === m ? '#2563eb' : '#64748b'
            }}>{m}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: statusFilter === s ? '#059669' : '#e2e8f0',
              background: statusFilter === s ? '#ecfdf5' : '#fff', color: statusFilter === s ? '#047857' : '#64748b'
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['优先级', '患者姓名', '性别/年龄', '检查项目', '设备', '检查室', '类型', '状态', 'Accession号', '检查时间', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((exam, idx) => {
              const device = devices.find(d => d.id === exam.deviceId)
              const room = rooms.find(r => r.id === exam.roomId)
              const sc = STATUS_COLORS[exam.status] || { bg: '#f1f5f9', color: '#64748b' }
              const pc = PRIORITY_COLORS[exam.priority] || PRIORITY_COLORS['普通']
              return (
                <tr key={exam.id} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}
                  onClick={() => setSelectedExam(exam)}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ ...pc, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{exam.priority}</span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{exam.patientName}</div>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{exam.gender} / {exam.age}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{exam.examItemName}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{exam.modality} · {exam.bodyPart}</div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Monitor size={11} style={{ color: '#94a3b8' }} />
                      <span style={{ color: '#64748b', fontSize: 11 }}>{device?.name.split('（')[0] || '-'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{room?.roomNumber || '-'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#f0f7ff', color: '#3b82f6' }}>{exam.patientType}</span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ ...sc, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{sc.label}</span>
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{exam.accessionNumber}</td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{exam.examTime || '-'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ padding: '3px 8px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                        {exam.status === '待报告' ? '书写' : '查看'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <Scan size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
            <div style={{ fontSize: 13 }}>暂无符合条件的检查记录</div>
          </div>
        )}
      </div>

      {/* 详情抽屉 */}
      {selectedExam && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 480, height: '100vh', background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>检查详情</h3>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{selectedExam.accessionNumber}</div>
            </div>
            <button onClick={() => setSelectedExam(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>{selectedExam.patientName}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontSize: 11 }}>{selectedExam.gender} / {selectedExam.age}岁</span>
                <span style={{ padding: '2px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: 4, fontSize: 11 }}>{selectedExam.patientType}</span>
                <span style={{ ...PRIORITY_COLORS[selectedExam.priority], padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{selectedExam.priority}</span>
                <span style={{ ...STATUS_COLORS[selectedExam.status], padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{selectedExam.status}</span>
              </div>
            </div>
            {[
              ['检查项目', selectedExam.examItemName],
              ['检查设备', selectedExam.deviceName],
              ['检查室', selectedExam.roomName],
              ['检查日期', selectedExam.examDate],
              ['临床诊断', selectedExam.clinicalDiagnosis || '-'],
              ['病史摘要', selectedExam.clinicalHistory || '-'],
              ['检查指征', selectedExam.examIndications || '-'],
              ['相关检查', selectedExam.relevantLabResults || '-'],
              ['技师', selectedExam.technologistName || '-'],
              ['已采集图像', `${selectedExam.imagesAcquired} 幅`],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#334155' }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              书写报告
            </button>
            <button style={{ flex: 1, padding: '8px 16px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              查看图像
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
