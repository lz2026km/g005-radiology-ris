// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 检查工作列表（Worklist） v2.0.0
// 融合DICOM MWL + HIS视图，支持列表/卡片/看板三大视图
// 完全重写版，目标1000+行
// ============================================================
import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Search, Filter, RefreshCw, Clock, AlertCircle,
  CheckCircle, User, Scan, FileText, Wifi, Monitor,
  ChevronRight, X, Calendar, Radio, Bell, ListChecks,
  LayoutList, LayoutGrid, Kanban, ChevronDown, ChevronUp,
  ArrowRightLeft, Printer, Download, Trash2, Edit3,
  Stethoscope, Activity, Timer, CheckSquare, Square,
  ArrowUp, ArrowDown, Move, Eye, Image, UserCheck,
  AlertTriangle, Zap, FileSpreadsheet, Barcode,
  XCircle, Plus, Minus, Info, ArrowLeftRight,
  ClipboardList, Images, Clipboard, History, UserCog,
  Settings, RadioButton, Check, ListOrdered, ArrowUpDown
} from 'lucide-react'
import { initialRadiologyExams, initialModalityDevices, initialExamRooms, initialUsers } from '../data/initialData'
import type { RadiologyExam, ExamRoom } from '../types'

// ============================================================
// 常量定义
// ============================================================
const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; order: number }> = {
  '已登记': { bg: '#dbeafe', color: '#2563eb', label: '已登记', order: 0 },
  '待检查': { bg: '#ede9fe', color: '#7c3aed', label: '待检查', order: 1 },
  '检查中': { bg: '#fce7f3', color: '#db2777', label: '检查中', order: 2 },
  '待报告': { bg: '#fef9c3', color: '#ca8a04', label: '待报告', order: 3 },
  '已报告': { bg: '#d1fae5', color: '#059669', label: '已报告', order: 4 },
  '已发布': { bg: '#ecfdf5', color: '#047857', label: '已发布', order: 5 },
  '已取消': { bg: '#f1f5f9', color: '#94a3b8', label: '已取消', order: 6 },
}

const PRIORITY_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  '普通': { bg: '#f1f5f9', color: '#64748b', label: '普通' },
  '紧急': { bg: '#fef3c7', color: '#d97706', label: '紧急' },
  '危重': { bg: '#fee2e2', color: '#dc2626', label: '危重' },
  '会诊': { bg: '#ede9fe', color: '#7c3aed', label: '会诊' },
}

const MODALITY_LIST = ['CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']
const PATIENT_TYPE_LIST = ['门诊', '住院', '急诊', '体检']
const PRIORITY_LIST = ['普通', '紧急', '危重', '会诊']
const STATUS_LIST = ['已登记', '待检查', '检查中', '待报告', '已报告', '已发布', '已取消']

const KANBAN_COLUMNS = ['已登记', '待检查', '检查中', '待报告', '已报告', '已发布']

// ============================================================
// 类型定义
// ============================================================
type ViewMode = 'list' | 'card' | 'kanban'

interface FilterState {
  search: string
  dateStart: string
  dateEnd: string
  modalities: string[]
  patientTypes: string[]
  priorities: string[]
  statuses: string[]
  doctorId: string
}

interface BatchState {
  selectedIds: Set<string>
  operation: 'priority' | 'room' | 'print' | 'export' | null
  priorityValue: string
  roomValue: string
}

// ============================================================
// 辅助函数
// ============================================================
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return dateStr
}

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  return dateStr
}

const getDeviceById = (deviceId: string) => {
  return initialModalityDevices.find(d => d.id === deviceId)
}

const getRoomById = (roomId: string) => {
  return initialExamRooms.find(r => r.id === roomId)
}

const getDoctorById = (doctorId: string) => {
  return initialUsers.find(u => u.id === doctorId)
}

// 模拟历史检查数据
const generateHistoryExams = (patientId: string): RadiologyExam[] => {
  const patientHistory: Record<string, RadiologyExam[]> = {
    'RAD-P001': [
      { id: 'HIST001', patientId: 'RAD-P001', patientName: '张志刚', gender: '男', age: 62, patientType: '住院', examItemId: 'EI-CT-002', examItemName: '胸部CT平扫', modality: 'CT', bodyPart: '胸部', examDate: '2026-04-15', examTime: '10:00', priority: '普通', clinicalDiagnosis: '肺炎复查', clinicalHistory: '咳嗽咳痰1周', examIndications: '评估炎症吸收情况', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-CT-01', deviceName: 'CT-1', roomId: 'ROOM-CT1', roomName: 'CT室1', status: '已发布', accessionNumber: '20260415001', imagesAcquired: 128, createdTime: '2026-04-15 09:00', updatedTime: '2026-04-15 10:00' } as RadiologyExam,
      { id: 'HIST002', patientId: 'RAD-P001', patientName: '张志刚', gender: '男', age: 62, patientType: '住院', examItemId: 'EI-CT-006', examItemName: '冠脉CTA', modality: 'CT', bodyPart: '心脏', examDate: '2026-03-20', examTime: '14:00', priority: '紧急', clinicalDiagnosis: '冠心病筛查', clinicalHistory: '胸闷不适', examIndications: '评估冠脉情况', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-CT-01', deviceName: 'CT-1', roomId: 'ROOM-CT1', roomName: 'CT室1', status: '已发布', accessionNumber: '20260320001', imagesAcquired: 256, createdTime: '2026-03-20 13:00', updatedTime: '2026-03-20 14:00' } as RadiologyExam,
    ],
    'RAD-P002': [
      { id: 'HIST003', patientId: 'RAD-P002', patientName: '李秀英', gender: '女', age: 55, patientType: '门诊', examItemId: 'EI-MR-001', examItemName: '头颅MR平扫', modality: 'MR', bodyPart: '头颅', examDate: '2026-02-10', examTime: '09:00', priority: '普通', clinicalDiagnosis: '头痛复查', clinicalHistory: '头痛缓解', examIndications: '评估治疗效果', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-MR-01', deviceName: 'MR-1', roomId: 'ROOM-MR1', roomName: 'MR室1', status: '已发布', accessionNumber: '20260210001', imagesAcquired: 1200, createdTime: '2026-02-10 08:00', updatedTime: '2026-02-10 09:00' } as RadiologyExam,
    ],
  }
  return patientHistory[patientId] || []
}

// ============================================================
// 子组件：统计卡片
// ============================================================
interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  bg: string
  onClick?: () => void
}

function StatCard({ label, value, icon, color, bg, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      } : undefined}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#1e3a5f',
          lineHeight: 1,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 13,
          color: '#64748b',
          marginTop: 6,
          fontWeight: 500,
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 子组件：筛选区
// ============================================================
interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onReset: () => void
}

function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false)

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = <T extends string>(key: 'modalities' | 'patientTypes' | 'priorities' | 'statuses', value: T) => {
    const arr = filters[key] as T[]
    const newArr = arr.includes(value)
      ? arr.filter(v => v !== value)
      : [...arr, value]
    updateFilter(key, newArr)
  }

  const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 8,
        border: '1px solid',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
        borderColor: active ? '#1e3a5f' : '#e2e8f0',
        background: active ? '#1e3a5f' : '#fff',
        color: active ? '#fff' : '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {active && <Check size={12} />}
      {label}
    </button>
  )

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      marginBottom: 16,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* 主筛选行 */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* 搜索框 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          minWidth: 240,
          background: '#f8fafc',
          borderRadius: 8,
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
        }}>
          <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="搜索患者姓名 / Accession号 / 检查项目..."
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#334155',
              width: '100%',
              background: 'transparent',
            }}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 日期范围 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} style={{ color: '#64748b' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>日期</span>
          </div>
          <input
            type="date"
            value={filters.dateStart}
            onChange={e => updateFilter('dateStart', e.target.value)}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              color: '#334155',
              background: '#f8fafc',
            }}
          />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>至</span>
          <input
            type="date"
            value={filters.dateEnd}
            onChange={e => updateFilter('dateEnd', e.target.value)}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              color: '#334155',
              background: '#f8fafc',
            }}
          />
        </div>

        {/* 展开/收起按钮 */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: '6px 12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            fontSize: 12,
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Filter size={12} />
          高级筛选
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* 重置按钮 */}
        <button
          onClick={onReset}
          style={{
            padding: '6px 12px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            fontSize: 12,
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <RefreshCw size={12} />
          重置
        </button>
      </div>

      {/* 高级筛选区域 */}
      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          paddingTop: 16,
        }}>
          {/* 设备类型 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Monitor size={12} />
              设备类型
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MODALITY_LIST.map(m => (
                <FilterChip
                  key={m}
                  label={m}
                  active={filters.modalities.includes(m)}
                  onClick={() => toggleArrayFilter('modalities', m)}
                />
              ))}
            </div>
          </div>

          {/* 患者类型 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={12} />
              患者类型
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PATIENT_TYPE_LIST.map(p => (
                <FilterChip
                  key={p}
                  label={p}
                  active={filters.patientTypes.includes(p)}
                  onClick={() => toggleArrayFilter('patientTypes', p)}
                />
              ))}
            </div>
          </div>

          {/* 优先级 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={12} />
              优先级
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRIORITY_LIST.map(p => (
                <FilterChip
                  key={p}
                  label={p}
                  active={filters.priorities.includes(p)}
                  onClick={() => toggleArrayFilter('priorities', p)}
                />
              ))}
            </div>
          </div>

          {/* 状态 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Activity size={12} />
              状态
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATUS_LIST.map(s => (
                <FilterChip
                  key={s}
                  label={s}
                  active={filters.statuses.includes(s)}
                  onClick={() => toggleArrayFilter('statuses', s)}
                />
              ))}
            </div>
          </div>

          {/* 检查医生 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Stethoscope size={12} />
              检查医生
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                style={{
                  padding: '6px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 12,
                  color: filters.doctorId ? '#1e3a5f' : '#94a3b8',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{filters.doctorId ? getDoctorById(filters.doctorId)?.name || filters.doctorId : '全部医生'}</span>
                <ChevronDown size={12} style={{ color: '#94a3b8' }} />
              </button>
              {showDoctorDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  maxHeight: 200,
                  overflowY: 'auto',
                  marginTop: 4,
                }}>
                  <div
                    onClick={() => { updateFilter('doctorId', ''); setShowDoctorDropdown(false) }}
                    style={{
                      padding: '8px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                      color: !filters.doctorId ? '#1e3a5f' : '#64748b',
                      background: !filters.doctorId ? '#f0f7ff' : 'transparent',
                    }}
                    onMouseEnter={e => { if (filters.doctorId) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { if (filters.doctorId) e.currentTarget.style.background = 'transparent' }}
                  >
                    全部医生
                  </div>
                  {initialUsers
                    .filter(u => u.role === 'radiologist')
                    .map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => { updateFilter('doctorId', doc.id); setShowDoctorDropdown(false) }}
                        style={{
                          padding: '8px 12px',
                          fontSize: 12,
                          cursor: 'pointer',
                          color: filters.doctorId === doc.id ? '#1e3a5f' : '#64748b',
                          background: filters.doctorId === doc.id ? '#f0f7ff' : 'transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onMouseEnter={e => { if (filters.doctorId !== doc.id) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (filters.doctorId !== doc.id) e.currentTarget.style.background = 'transparent' }}
                      >
                        <span>{doc.name}</span>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{doc.title}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 子组件：批量操作工具栏
// ============================================================
interface BatchToolbarProps {
  batch: BatchState
  onChange: (batch: BatchState) => void
  onClear: () => void
  onExecute: () => void
  totalSelected: number
}

function BatchToolbar({ batch, onChange, onClear, onExecute, totalSelected }: BatchToolbarProps) {
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showRoomDropdown, setShowRoomDropdown] = useState(false)

  if (totalSelected === 0) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
      borderRadius: 10,
      padding: '12px 16px',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 4px 12px rgba(30,58,95,0.3)',
    }}>
      {/* 已选数量 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
      }}>
        <CheckSquare size={16} style={{ color: '#4ade80' }} />
        已选中 <span style={{ fontSize: 18, fontWeight: 800 }}>{totalSelected}</span> 项
      </div>

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />

      {/* 批量修改优先级 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
          style={{
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            fontSize: 12,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Zap size={12} />
          批量修改优先级
          <ChevronDown size={12} />
        </button>
        {showPriorityDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 100,
            marginTop: 6,
            minWidth: 140,
            overflow: 'hidden',
          }}>
            {PRIORITY_LIST.map(p => (
              <div
                key={p}
                onClick={() => {
                  onChange({ ...batch, priorityValue: p })
                  setShowPriorityDropdown(false)
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: batch.priorityValue === p ? '#1e3a5f' : '#334155',
                  background: batch.priorityValue === p ? '#f0f7ff' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => { if (batch.priorityValue !== p) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (batch.priorityValue !== p) e.currentTarget.style.background = '#fff' }}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: PRIORITY_CONFIG[p]?.color || '#64748b',
                }} />
                {p}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 批量分配检查室 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowRoomDropdown(!showRoomDropdown)}
          style={{
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            fontSize: 12,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <LayoutList size={12} />
          批量分配检查室
          <ChevronDown size={12} />
        </button>
        {showRoomDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 100,
            marginTop: 6,
            minWidth: 160,
            overflow: 'hidden',
          }}>
            {initialExamRooms.map(room => (
              <div
                key={room.id}
                onClick={() => {
                  onChange({ ...batch, roomValue: room.id })
                  setShowRoomDropdown(false)
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: batch.roomValue === room.id ? '#1e3a5f' : '#334155',
                  background: batch.roomValue === room.id ? '#f0f7ff' : '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={e => { if (batch.roomValue !== room.id) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (batch.roomValue !== room.id) e.currentTarget.style.background = '#fff' }}
              >
                <span>{room.name}</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{room.modality.join(',')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 批量打印条码 */}
      <button
        onClick={() => onChange({ ...batch, operation: 'print' })}
        style={{
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          fontSize: 12,
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Barcode size={12} />
        批量打印条码
      </button>

      {/* 批量导出Excel */}
      <button
        onClick={() => onChange({ ...batch, operation: 'export' })}
        style={{
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          fontSize: 12,
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <FileSpreadsheet size={12} />
        批量导出Excel
      </button>

      {/* 执行按钮 */}
      <button
        onClick={onExecute}
        style={{
          marginLeft: 'auto',
          padding: '6px 16px',
          background: '#4ade80',
          border: 'none',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          color: '#1e3a5f',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Check size={12} />
        确认执行
      </button>

      {/* 清除选择 */}
      <button
        onClick={onClear}
        style={{
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          fontSize: 12,
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <XCircle size={12} />
        清除
      </button>
    </div>
  )
}

// ============================================================
// 子组件：列表视图表格
// ============================================================
interface ListViewProps {
  exams: RadiologyExam[]
  selectedIds: Set<string>
  onSelect: (ids: Set<string>) => void
  onRowClick: (exam: RadiologyExam) => void
  onSelectAll: () => void
  allSelected: boolean
}

function ListView({ exams, selectedIds, onSelect, onRowClick, onSelectAll, allSelected }: ListViewProps) {
  const SortableHeader = ({ label, sortKey, currentSort, onSort }: { label: string; sortKey: string; currentSort: { key: string; dir: 'asc' | 'desc' }; onSort: (key: string) => void }) => (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: '10px 12px',
        textAlign: 'left',
        fontWeight: 600,
        color: '#475569',
        fontSize: 11,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        userSelect: 'none',
        background: currentSort.key === sortKey ? '#f0f7ff' : '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <ArrowUp size={10} style={{ color: currentSort.key === sortKey && currentSort.dir === 'asc' ? '#1e3a5f' : '#cbd5e1', marginBottom: -2 }} />
          <ArrowDown size={10} style={{ color: currentSort.key === sortKey && currentSort.dir === 'desc' ? '#1e3a5f' : '#cbd5e1' }} />
        </div>
      </div>
    </th>
  )

  const [sort, setSort] = useState({ key: 'createdTime', dir: 'desc' as 'asc' | 'desc' })

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => {
      let aVal: any = ''
      let bVal: any = ''
      switch (sort.key) {
        case 'patientName': aVal = a.patientName; bVal = b.patientName; break
        case 'priority': aVal = PRIORITY_CONFIG[a.priority]?.order || 99; bVal = PRIORITY_CONFIG[b.priority]?.order || 99; break
        case 'status': aVal = STATUS_CONFIG[a.status]?.order || 99; bVal = STATUS_CONFIG[b.status]?.order || 99; break
        case 'examTime': aVal = a.examTime || ''; bVal = b.examTime || ''; break
        case 'createdTime': aVal = a.createdTime || ''; bVal = b.createdTime || ''; break
        case 'modality': aVal = a.modality; bVal = b.modality; break
        default: aVal = a.createdTime; bVal = b.createdTime
      }
      if (sort.dir === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
  }, [exams, sort])

  const handleSort = (key: string) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  }

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    onSelect(newSet)
  }

  const handleSelectAll = () => {
    if (allSelected) {
      onSelect(new Set())
    } else {
      onSelect(new Set(exams.map(e => e.id)))
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1200 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px', width: 40 }}>
                <div
                  onClick={handleSelectAll}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: allSelected ? '#1e3a5f' : '#cbd5e1',
                  }}
                >
                  {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                </div>
              </th>
              <SortableHeader label="优先级" sortKey="priority" currentSort={sort} onSort={handleSort} />
              <SortableHeader label="患者姓名" sortKey="patientName" currentSort={sort} onSort={handleSort} />
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11, whiteSpace: 'nowrap', background: '#f8fafc' }}>性别/年龄</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11, whiteSpace: 'nowrap', background: '#f8fafc' }}>检查项目+部位</th>
              <SortableHeader label="设备" sortKey="modality" currentSort={sort} onSort={handleSort} />
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11, whiteSpace: 'nowrap', background: '#f8fafc' }}>检查室</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11, whiteSpace: 'nowrap', background: '#f8fafc' }}>患者类型</th>
              <SortableHeader label="状态" sortKey="status" currentSort={sort} onSort={handleSort} />
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11, whiteSpace: 'nowrap', background: '#f8fafc' }}>申请医生</th>
              <SortableHeader label="登记时间" sortKey="createdTime" currentSort={sort} onSort={handleSort} />
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11, whiteSpace: 'nowrap', background: '#f8fafc' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedExams.map((exam, idx) => {
              const device = getDeviceById(exam.deviceId)
              const room = getRoomById(exam.roomId)
              const sc = STATUS_CONFIG[exam.status] || { bg: '#f1f5f9', color: '#64748b', label: exam.status }
              const pc = PRIORITY_CONFIG[exam.priority] || PRIORITY_CONFIG['普通']
              const isSelected = selectedIds.has(exam.id)

              return (
                <tr
                  key={exam.id}
                  onClick={() => onRowClick(exam)}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: isSelected ? '#f0f7ff' : idx % 2 === 0 ? '#fff' : '#fafbfc',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = '#f0f7ff'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'
                  }}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <div
                      onClick={(e) => toggleSelect(exam.id, e)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#1e3a5f' : '#cbd5e1',
                      }}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      ...pc,
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'inline-block',
                    }}>
                      {pc.label}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#1e3a5f', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={12} style={{ color: '#94a3b8' }} />
                      {exam.patientName}
                      {exam.priority === '危重' && <AlertTriangle size={12} style={{ color: '#dc2626' }} />}
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>
                    <span style={{ fontWeight: 500 }}>{exam.gender}</span>
                    <span style={{ margin: '0 4px', color: '#cbd5e1' }}>/</span>
                    <span>{exam.age}岁</span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{exam.examItemName}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Scan size={10} />
                      {exam.modality} · {exam.bodyPart}
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Monitor size={12} style={{ color: '#94a3b8' }} />
                      <div>
                        <div style={{ color: '#334155', fontSize: 12, fontWeight: 500 }}>
                          {device?.name.split('（')[0] || '-'}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>
                          {device?.modality || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Radio size={11} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: 11, color: '#64748b' }}>{room?.roomNumber || '-'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: exam.patientType === '急诊' ? '#fee2e2' : exam.patientType === '住院' ? '#dbeafe' : '#f1f5f9',
                      color: exam.patientType === '急诊' ? '#dc2626' : exam.patientType === '住院' ? '#2563eb' : '#64748b',
                    }}>
                      {exam.patientType}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      ...sc,
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'inline-block',
                    }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Stethoscope size={11} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {exam.technologistName || getDoctorById(exam.technologistId || '')?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{exam.createdTime || '-'}</div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRowClick(exam) }}
                        style={{
                          padding: '4px 10px',
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Eye size={11} />
                        查看
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {sortedExams.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <Scan size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>暂无符合条件的检查记录</div>
            <div style={{ fontSize: 12 }}>请调整筛选条件后重试</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：卡片视图
// ============================================================
interface CardViewProps {
  exams: RadiologyExam[]
  selectedIds: Set<string>
  onSelect: (ids: Set<string>) => void
  onRowClick: (exam: RadiologyExam) => void
}

function CardView({ exams, selectedIds, onSelect, onRowClick }: CardViewProps) {
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    onSelect(newSet)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: 16,
    }}>
      {exams.map(exam => {
        const device = getDeviceById(exam.deviceId)
        const room = getRoomById(exam.roomId)
        const sc = STATUS_CONFIG[exam.status] || { bg: '#f1f5f9', color: '#64748b', label: exam.status }
        const pc = PRIORITY_CONFIG[exam.priority] || PRIORITY_CONFIG['普通']
        const isSelected = selectedIds.has(exam.id)

        return (
          <div
            key={exam.id}
            onClick={() => onRowClick(exam)}
            style={{
              background: '#fff',
              borderRadius: 12,
              border: isSelected ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: isSelected ? '0 4px 16px rgba(30,58,95,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            {/* 卡片顶部 - 优先级标识 */}
            <div style={{
              height: 4,
              background: pc.color,
            }} />

            {/* 卡片头部 */}
            <div style={{
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  onClick={(e) => toggleSelect(exam.id, e)}
                  style={{
                    cursor: 'pointer',
                    color: isSelected ? '#1e3a5f' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {exam.patientName}
                    {exam.priority === '危重' && <AlertTriangle size={14} style={{ color: '#dc2626' }} />}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {exam.gender} · {exam.age}岁 · <span style={{
                      background: exam.patientType === '急诊' ? '#fee2e2' : exam.patientType === '住院' ? '#dbeafe' : '#f1f5f9',
                      color: exam.patientType === '急诊' ? '#dc2626' : exam.patientType === '住院' ? '#2563eb' : '#64748b',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontWeight: 600,
                    }}>{exam.patientType}</span>
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 4,
              }}>
                <span style={{
                  ...pc,
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  {pc.label}
                </span>
                <span style={{
                  ...sc,
                  padding: '3px 8px',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 600,
                }}>
                  {sc.label}
                </span>
              </div>
            </div>

            {/* 卡片内容 */}
            <div style={{ padding: '12px 14px' }}>
              {/* 检查信息 */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 10,
              }}>
                <div style={{ fontWeight: 600, color: '#334155', fontSize: 13, marginBottom: 6 }}>
                  {exam.examItemName}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  fontSize: 11,
                  color: '#64748b',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Monitor size={11} />
                    {device?.name.split('（')[0] || '-'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Radio size={11} />
                    {room?.roomNumber || '-'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Scan size={11} />
                    {exam.modality} · {exam.bodyPart}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    {exam.examTime || '-'}
                  </div>
                </div>
              </div>

              {/* Accession号 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                color: '#64748b',
              }}>
                <span style={{ fontFamily: 'monospace' }}>{exam.accessionNumber}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Images size={11} />
                  {exam.imagesAcquired} 幅
                </span>
              </div>
            </div>
          </div>
        )
      })}
      {exams.length === 0 && (
        <div style={{
          gridColumn: '1 / -1',
          padding: 60,
          textAlign: 'center',
          color: '#94a3b8',
        }}>
          <LayoutGrid size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>暂无检查记录</div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 子组件：看板视图（Kanban）
// ============================================================
interface KanbanViewProps {
  exams: RadiologyExam[]
  onRowClick: (exam: RadiologyExam) => void
}

function KanbanView({ exams, onRowClick }: KanbanViewProps) {
  const [draggedExam, setDraggedExam] = useState<RadiologyExam | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [examStatuses, setExamStatuses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    exams.forEach(e => { map[e.id] = e.status })
    return map
  })

  const getColumnExams = (status: string) => {
    return exams.filter(e => examStatuses[e.id] === status)
  }

  const handleDragStart = (e: React.DragEvent, exam: RadiologyExam) => {
    setDraggedExam(exam)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    if (draggedExam) {
      setExamStatuses(prev => ({
        ...prev,
        [draggedExam.id]: targetStatus,
      }))
    }
    setDraggedExam(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedExam(null)
    setDragOverColumn(null)
  }

  const KanbanCard = ({ exam }: { exam: RadiologyExam }) => {
    const device = getDeviceById(exam.deviceId)
    const pc = PRIORITY_CONFIG[exam.priority] || PRIORITY_CONFIG['普通']
    const isDragging = draggedExam?.id === exam.id

    return (
      <div
        draggable
        onDragStart={e => handleDragStart(e, exam)}
        onDragEnd={handleDragEnd}
        onClick={() => onRowClick(exam)}
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 8,
          cursor: 'move',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          opacity: isDragging ? 0.5 : 1,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          if (!isDragging) {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={e => {
          if (!isDragging) {
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
      >
        {/* 卡片头部 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}>
          <div style={{
            fontWeight: 600,
            color: '#1e3a5f',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            {exam.patientName}
            {exam.priority === '危重' && <AlertTriangle size={10} style={{ color: '#dc2626' }} />}
            {exam.priority === '紧急' && <Zap size={10} style={{ color: '#d97706' }} />}
          </div>
          <Move size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} />
        </div>

        {/* 检查信息 */}
        <div style={{
          fontSize: 11,
          color: '#64748b',
          marginBottom: 6,
        }}>
          {exam.examItemName}
        </div>

        {/* 设备信息 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 10,
          color: '#94a3b8',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Monitor size={10} />
            {device?.name.split('（')[0] || '-'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} />
            {exam.examTime || '-'}
          </span>
        </div>

        {/* 优先级条 */}
        <div style={{
          height: 2,
          borderRadius: 1,
          background: pc.color,
          marginTop: 8,
        }} />
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, minmax(240px, 1fr))`,
      gap: 12,
      overflowX: 'auto',
      paddingBottom: 8,
    }}>
      {KANBAN_COLUMNS.map(status => {
        const columnExams = getColumnExams(status)
        const sc = STATUS_CONFIG[status] || { bg: '#f1f5f9', color: '#64748b' }
        const isOver = dragOverColumn === status

        return (
          <div
            key={status}
            onDragOver={e => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, status)}
            style={{
              background: isOver ? '#f0f7ff' : '#f8fafc',
              borderRadius: 10,
              padding: 12,
              minHeight: 400,
              transition: 'background 0.15s',
              border: isOver ? '2px dashed #1e3a5f' : '2px dashed transparent',
            }}
          >
            {/* 列头 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              padding: '8px 10px',
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: sc.color,
                }} />
                <span style={{
                  fontWeight: 600,
                  color: '#334155',
                  fontSize: 12,
                }}>
                  {status}
                </span>
              </div>
              <div style={{
                background: sc.bg,
                color: sc.color,
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
              }}>
                {columnExams.length}
              </div>
            </div>

            {/* 卡片列表 */}
            <div style={{ minHeight: 100 }}>
              {columnExams.map(exam => (
                <KanbanCard key={exam.id} exam={exam} />
              ))}
              {columnExams.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: '#cbd5e1',
                  fontSize: 11,
                  padding: '20px 0',
                }}>
                  暂无记录
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// 子组件：检查详情抽屉
// ============================================================
interface DetailDrawerProps {
  exam: RadiologyExam | null
  onClose: () => void
}

function DetailDrawer({ exam, onClose }: DetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'history' | 'log'>('info')

  if (!exam) return null

  const device = getDeviceById(exam.deviceId)
  const room = getRoomById(exam.roomId)
  const historyExams = generateHistoryExams(exam.patientId)

  const sc = STATUS_CONFIG[exam.status] || { bg: '#f1f5f9', color: '#64748b', label: exam.status }
  const pc = PRIORITY_CONFIG[exam.priority] || PRIORITY_CONFIG['普通']

  // 模拟日志时间线
  const examLogs = [
    { time: exam.createdTime || exam.examDate + ' 08:00', event: '检查登记', operator: '系统', status: '登记' },
    { time: exam.examDate + ' 08:30', event: '分配设备', operator: '护士长 赵雪梅', status: '分配' },
    exam.examTime ? { time: exam.examDate + ' ' + exam.examTime, event: '开始检查', operator: exam.technologistName || '技师', status: '检查' } : null,
    exam.imagesAcquired > 0 ? { time: exam.examDate + ' ' + (parseInt(exam.examTime?.split(':')[0] || '0') + 1) + ':00', event: `图像采集完成（${exam.imagesAcquired}幅）`, operator: exam.technologistName || '技师', status: '采集' } : null,
    exam.status === '待报告' || exam.status === '已报告' || exam.status === '已发布' ? { time: exam.examDate + ' ' + (parseInt(exam.examTime?.split(':')[0] || '0') + 2) + ':00', event: '报告书写', operator: '报告医生', status: '报告' } : null,
  ].filter(Boolean) as { time: string; event: string; operator: string; status: string }[]

  const DrawerTab = ({ label, key, icon }: { label: string; key: typeof activeTab; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        padding: '8px 14px',
        border: 'none',
        background: activeTab === key ? '#1e3a5f' : 'transparent',
        color: activeTab === key ? '#fff' : '#64748b',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <>
      {/* 遮罩层 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 99,
        }}
      />

      {/* 抽屉 */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 500,
        height: '100vh',
        background: '#fff',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out',
      }}>
        {/* 抽屉头部 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
          color: '#fff',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>检查详情</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.8, marginTop: 2 }}>
              {exam.accessionNumber}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              cursor: 'pointer',
              color: '#fff',
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 患者信息头部 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', display: 'flex', alignItems: 'center', gap: 8 }}>
                {exam.patientName}
                {exam.priority === '危重' && <AlertTriangle size={18} style={{ color: '#dc2626' }} />}
                {exam.priority === '紧急' && <Zap size={18} style={{ color: '#d97706' }} />}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', background: '#f1f5f9', color: '#64748b', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                  {exam.gender} / {exam.age}岁
                </span>
                <span style={{ padding: '3px 10px', background: exam.patientType === '急诊' ? '#fee2e2' : exam.patientType === '住院' ? '#dbeafe' : '#f1f5f9', color: exam.patientType === '急诊' ? '#dc2626' : exam.patientType === '住院' ? '#2563eb' : '#64748b', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                  {exam.patientType}
                </span>
                <span style={{ ...pc, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                  {pc.label}
                </span>
                <span style={{ ...sc, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                  {sc.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页切换 */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: 8,
          background: '#fff',
        }}>
          <DrawerTab label="基本信息" key="info" icon={<User size={12} />} />
          <DrawerTab label="影像信息" key="images" icon={<Images size={12} />} />
          <DrawerTab label="历史检查" key="history" icon={<History size={12} />} />
          <DrawerTab label="操作日志" key="log" icon={<Clipboard size={12} />} />
        </div>

        {/* 抽屉内容 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* 基本信息 */}
          {activeTab === 'info' && (
            <div>
              {/* 患者信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1e3a5f',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <UserCog size={14} />
                  患者信息
                </div>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  padding: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}>
                  {[
                    ['患者ID', exam.patientId],
                    ['姓名', exam.patientName],
                    ['性别', exam.gender],
                    ['年龄', exam.age + '岁'],
                    ['患者类型', exam.patientType],
                    ['联系电话', '138****8001'],
                    ['出生日期', '1964-02-15'],
                    ['体重', '65kg'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 检查信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1e3a5f',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Stethoscope size={14} />
                  检查信息
                </div>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  padding: 14,
                }}>
                  {[
                    ['检查项目', exam.examItemName],
                    ['检查设备', device?.name || '-'],
                    ['检查室', room?.name || '-'],
                    ['检查日期', exam.examDate],
                    ['检查时间', exam.examTime || '-'],
                    ['设备类型', exam.modality],
                    ['检查部位', exam.bodyPart],
                    ['申请医生', '李明辉 主任医师'],
                    ['临床诊断', exam.clinicalDiagnosis || '-'],
                    ['病史摘要', exam.clinicalHistory || '-'],
                    ['检查指征', exam.examIndications || '-'],
                  ].map(([label, value], idx, arr) => (
                    <div
                      key={label}
                      style={{
                        padding: '8px 0',
                        borderBottom: idx < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#334155' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 影像信息 */}
          {activeTab === 'images' && (
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#1e3a5f',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Images size={14} />
                已采集图像
              </div>
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 20,
                textAlign: 'center',
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: '#e2e8f0',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Image size={32} style={{ color: '#94a3b8' }} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f' }}>
                  {exam.imagesAcquired}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  幅图像
                </div>
                <div style={{
                  marginTop: 16,
                  padding: '8px 12px',
                  background: '#fff',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#64748b',
                  border: '1px dashed #cbd5e1',
                }}>
                  点击"查看图像"按钮打开图像查看器
                </div>
              </div>
            </div>
          )}

          {/* 历史检查 */}
          {activeTab === 'history' && (
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#1e3a5f',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <History size={14} />
                历史检查记录
              </div>
              {historyExams.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {historyExams.map(hist => {
                    const histSc = STATUS_CONFIG[hist.status] || { bg: '#f1f5f9', color: '#64748b', label: hist.status }
                    return (
                      <div
                        key={hist.id}
                        style={{
                          background: '#f8fafc',
                          borderRadius: 10,
                          padding: 12,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 8,
                        }}>
                          <div style={{ fontWeight: 600, color: '#334155', fontSize: 12 }}>
                            {hist.examItemName}
                          </div>
                          <span style={{
                            ...histSc,
                            padding: '2px 8px',
                            borderRadius: 8,
                            fontSize: 10,
                            fontWeight: 600,
                          }}>
                            {histSc.label}
                          </span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 6,
                          fontSize: 11,
                          color: '#64748b',
                        }}>
                          <span>{hist.examDate}</span>
                          <span>{hist.modality}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  padding: 40,
                  textAlign: 'center',
                  color: '#94a3b8',
                }}>
                  <History size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontSize: 12 }}>暂无历史检查记录</div>
                </div>
              )}
            </div>
          )}

          {/* 操作日志 */}
          {activeTab === 'log' && (
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#1e3a5f',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <ClipboardList size={14} />
                操作日志
              </div>
              <div style={{ position: 'relative' }}>
                {/* 时间线 */}
                <div style={{
                  position: 'absolute',
                  left: 11,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: '#e2e8f0',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {examLogs.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: 16,
                        paddingBottom: idx < examLogs.length - 1 ? 20 : 0,
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#1e3a5f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                        zIndex: 1,
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: 8,
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                        }}>
                          <div style={{ fontWeight: 600, color: '#334155', fontSize: 12, marginBottom: 4 }}>
                            {log.event}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{log.operator}</span>
                            <span style={{ fontFamily: 'monospace' }}>{log.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 抽屉底部操作按钮 */}
        <div style={{
          padding: 16,
          borderTop: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          background: '#f8fafc',
        }}>
          <button
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Edit3 size={12} />
            修改信息
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <UserCheck size={12} />
            分配设备
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: exam.status === '待报告' ? '#1e3a5f' : '#e2e8f0',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: exam.status === '待报告' ? '#fff' : '#94a3b8',
              cursor: exam.status === '待报告' ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <FileText size={12} />
            {exam.status === '待报告' ? '书写报告' : '查看报告'}
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <ArrowLeftRight size={12} />
            开始检查
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid #fee2e2',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#dc2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <XCircle size={12} />
            取消检查
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Printer size={12} />
            打印条码
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function WorklistPage() {
  // 视图模式
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateStart: '2026-05-01',
    dateEnd: '2026-05-01',
    modalities: [],
    patientTypes: [],
    priorities: [],
    statuses: [],
    doctorId: '',
  })

  // 选中状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 批量操作状态
  const [batch, setBatch] = useState<BatchState>({
    selectedIds: new Set(),
    operation: null,
    priorityValue: '普通',
    roomValue: '',
  })

  // 详情抽屉
  const [selectedExam, setSelectedExam] = useState<RadiologyExam | null>(null)

  // 筛选逻辑
  const filteredExams = useMemo(() => {
    return initialRadiologyExams.filter(exam => {
      // 搜索过滤
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchSearch =
          exam.patientName.toLowerCase().includes(searchLower) ||
          exam.accessionNumber.toLowerCase().includes(searchLower) ||
          exam.examItemName.toLowerCase().includes(searchLower)
        if (!matchSearch) return false
      }

      // 日期范围过滤
      if (filters.dateStart && exam.examDate < filters.dateStart) return false
      if (filters.dateEnd && exam.examDate > filters.dateEnd) return false

      // 设备类型过滤
      if (filters.modalities.length > 0 && !filters.modalities.includes(exam.modality)) return false

      // 患者类型过滤
      if (filters.patientTypes.length > 0 && !filters.patientTypes.includes(exam.patientType)) return false

      // 优先级过滤
      if (filters.priorities.length > 0 && !filters.priorities.includes(exam.priority)) return false

      // 状态过滤
      if (filters.statuses.length > 0 && !filters.statuses.includes(exam.status)) return false

      // 医生过滤
      if (filters.doctorId && exam.technologistId !== filters.doctorId) return false

      return true
    })
  }, [filters])

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: filteredExams.length,
      critical: filteredExams.filter(e => e.priority === '危重' || e.priority === '紧急').length,
      completed: filteredExams.filter(e => ['已报告', '已发布'].includes(e.status)).length,
      pending: filteredExams.filter(e => ['已登记', '待检查', '检查中', '待报告'].includes(e.status)).length,
    }
  }, [filteredExams])

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      search: '',
      dateStart: '2026-05-01',
      dateEnd: '2026-05-01',
      modalities: [],
      patientTypes: [],
      priorities: [],
      statuses: [],
      doctorId: '',
    })
  }

  // 全选状态
  const allSelected = filteredExams.length > 0 && selectedIds.size === filteredExams.length

  // 清除选择
  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // 执行批量操作
  const executeBatchOperation = () => {
    if (selectedIds.size === 0) return

    // 模拟批量操作
    const action = batch.operation || 'print'
    const actionLabels: Record<string, string> = {
      priority: `修改优先级为：${batch.priorityValue}`,
      room: `分配检查室：${initialExamRooms.find(r => r.id === batch.roomValue)?.name || '-'}`,
      print: '打印条码',
      export: '导出Excel',
    }

    // 实际应用中这里会调用API
    alert(`批量操作：${actionLabels[action]}\n选中了 ${selectedIds.size} 项`)

    // 清除选择
    clearSelection()
    setBatch({
      selectedIds: new Set(),
      operation: null,
      priorityValue: '普通',
      roomValue: '',
    })
  }

  // 刷新数据（模拟）
  const handleRefresh = () => {
    // 实际应用中这里会重新请求数据
    const btn = document.activeElement as HTMLButtonElement
    if (btn) {
      btn.style.opacity = '0.7'
      btn.disabled = true
      setTimeout(() => {
        btn.style.opacity = '1'
        btn.disabled = false
      }, 1000)
    }
  }

  // 一键打印选中报告（模拟）
  const handlePrintSelected = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要打印的报告')
      return
    }
    alert(`正在打印 ${selectedIds.size} 份报告...`)
  }

  const ViewModeButton = ({ mode, icon, label }: { mode: ViewMode; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      style={{
        padding: '8px 14px',
        background: viewMode === mode ? '#1e3a5f' : '#fff',
        border: '1px solid',
        borderColor: viewMode === mode ? '#1e3a5f' : '#e2e8f0',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        color: viewMode === mode ? '#fff' : '#64748b',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div style={{
      padding: 24,
      maxWidth: 1600,
      margin: '0 auto',
      background: '#f8fafc',
      minHeight: '100vh',
    }}>
      {/* 页面标题区 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#1e3a5f',
            margin: '0 0 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <ClipboardList size={24} />
            检查工作列表
          </h1>
          <p style={{
            fontSize: 13,
            color: '#64748b',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>DICOM Worklist</span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span>融合HIS/PAACS预约数据</span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span>实时设备状态</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* 连接状态 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: '#ecfdf5',
            borderRadius: 8,
            fontSize: 12,
            color: '#059669',
            fontWeight: 500,
            border: '1px solid #d1fae5',
          }}>
            <Wifi size={12} />
            DICOM WL 已连接
          </div>

          {/* 视图切换 */}
          <div style={{
            display: 'flex',
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
            <ViewModeButton
              mode="list"
              icon={<LayoutList size={14} />}
              label="列表"
            />
            <ViewModeButton
              mode="card"
              icon={<LayoutGrid size={14} />}
              label="卡片"
            />
            <ViewModeButton
              mode="kanban"
              icon={<Kanban size={14} />}
              label="看板"
            />
          </div>

          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              background: '#1e3a5f',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2d4a6f' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1e3a5f' }}
          >
            <RefreshCw size={12} />
            刷新列表
          </button>
        </div>
      </div>

      {/* 统计栏 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 20,
      }}>
        <StatCard
          label="全部检查"
          value={stats.total}
          icon={<ListChecks size={20} />}
          color="#3b82f6"
          bg="#eff6ff"
          onClick={() => setFilters(f => ({ ...f, statuses: [] }))}
        />
        <StatCard
          label="危重/紧急"
          value={stats.critical}
          icon={<AlertTriangle size={20} />}
          color="#dc2626"
          bg="#fef2f2"
          onClick={() => setFilters(f => ({ ...f, priorities: ['危重', '紧急'] }))}
        />
        <StatCard
          label="待完成"
          value={stats.pending}
          icon={<Clock size={20} />}
          color="#d97706"
          bg="#fffbeb"
          onClick={() => setFilters(f => ({ ...f, statuses: ['已登记', '待检查', '检查中', '待报告'] }))}
        />
        <StatCard
          label="已完成"
          value={stats.completed}
          icon={<CheckCircle size={20} />}
          color="#059669"
          bg="#ecfdf5"
          onClick={() => setFilters(f => ({ ...f, statuses: ['已报告', '已发布'] }))}
        />
      </div>

      {/* 批量操作工具栏 */}
      <BatchToolbar
        batch={batch}
        onChange={setBatch}
        onClear={clearSelection}
        onExecute={executeBatchOperation}
        totalSelected={selectedIds.size}
      />

      {/* 筛选区 */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
      />

      {/* 当前视图 */}
      {viewMode === 'list' && (
        <ListView
          exams={filteredExams}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onRowClick={setSelectedExam}
          onSelectAll={() => {
            if (allSelected) setSelectedIds(new Set())
            else setSelectedIds(new Set(filteredExams.map(e => e.id)))
          }}
          allSelected={allSelected}
        />
      )}

      {viewMode === 'card' && (
        <CardView
          exams={filteredExams}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onRowClick={setSelectedExam}
        />
      )}

      {viewMode === 'kanban' && (
        <KanbanView
          exams={filteredExams}
          onRowClick={setSelectedExam}
        />
      )}

      {/* 详情抽屉 */}
      <DetailDrawer
        exam={selectedExam}
        onClose={() => setSelectedExam(null)}
      />

      {/* 右下角浮动按钮 */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 50,
      }}>
        {/* 一键打印 */}
        <button
          onClick={handlePrintSelected}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#fff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#1e3a5f'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#64748b'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title="打印选中的报告"
        >
          <Printer size={20} />
        </button>

        {/* 一键刷新 */}
        <button
          onClick={handleRefresh}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#1e3a5f',
            border: 'none',
            boxShadow: '0 4px 12px rgba(30,58,95,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#2d4a6f'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#1e3a5f'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title="刷新数据"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* 底部信息栏 */}
      <div style={{
        marginTop: 20,
        padding: '12px 0',
        textAlign: 'center',
        fontSize: 11,
        color: '#94a3b8',
        borderTop: '1px solid #e2e8f0',
      }}>
        G005 放射科RIS系统 · 检查工作列表 · {new Date().toLocaleDateString('zh-CN')}
      </div>
    </div>
  )
}
