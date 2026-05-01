// @ts-nocheck
// G005 放射RIS系统 - 检查执行页面 v0.2.0
// 模拟放射科技师执行检查的完整流程
import { useState } from 'react'
import {
  User, Scan, Clock, AlertCircle, CheckCircle, XCircle,
  Wifi, WifiOff, Camera, Image, Printer, FileText,
  Play, Pause, RotateCcw, Plus, X, ChevronRight,
  Activity, Monitor, Disc, Star, BadgeAlert, RotateCcw as ReAcq,
  ImagePlus, CheckCircle2, Search, Filter, Eye, Trash2,
  MonitorCheck, Radio, Dices, Stethoscope, Timer, Layers,
  Tag, BarChart3, MessageSquare, History, Bell, Power,
  Settings, RefreshCw, SkipForward, Save, ArrowLeft
} from 'lucide-react'
import { initialRadiologyExams, initialModalityDevices } from '../data/initialData'

// 优先级配置
const PRIORITY_CONFIG = {
  '普通': { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', label: '普通' },
  '紧急': { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', label: '紧急' },
  '危重': { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', label: '危重' },
}

// 优先级筛选选项
const PRIORITY_FILTERS = ['全部', '普通', '紧急', '危重']

// 设备状态颜色
const DEVICE_STATUS_COLORS = {
  '使用中': { color: '#16a34a', bg: '#dcfce7' },
  '空闲': { color: '#2563eb', bg: '#dbeafe' },
  '维护中': { color: '#d97706', bg: '#fef3c7' },
  '故障': { color: '#dc2626', bg: '#fee2e2' },
}

// 图像质量配置
const QUALITY_CONFIG = {
  '优': { color: '#16a34a', bg: '#dcfce7', stars: 3 },
  '良': { color: '#d97706', bg: '#fef3c7', stars: 2 },
  '差': { color: '#dc2626', bg: '#fee2e2', stars: 1 },
}

// DICOM连接状态
const DICOM_STATUS = {
  connected: { text: '已连接', color: '#16a34a', bg: '#dcfce7' },
  connecting: { text: '连接中...', color: '#d97706', bg: '#fef3c7' },
  disconnected: { text: '未连接', color: '#dc2626', bg: '#fee2e2' },
  error: { text: '连接错误', color: '#dc2626', bg: '#fee2e2' },
}

export default function ExamPage() {
  // ==================== 状态定义 ====================
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('RAD-EX001')
  const [priorityFilter, setPriorityFilter] = useState('全部')
  const [technicianNotes, setTechnicianNotes] = useState('')
  const [specialNotes, setSpecialNotes] = useState<string[]>([])
  const [dicomStatus, setDicomStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connected')
  const [acquisitionStatus, setAcquisitionStatus] = useState<'idle' | 'acquiring' | 'paused' | 'completed'>('idle')
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0)
  const [imageQuality, setImageQuality] = useState<Record<string, string>>({})
  const [acquisitionHistory, setAcquisitionHistory] = useState<any[]>([])
  const [alertMessages, setAlertMessages] = useState<string[]>([])

  // ==================== 数据源 ====================
  const allExams = initialRadiologyExams
  const devices = initialModalityDevices

  // 筛选待检查的患者
  const pendingExams = allExams.filter(e => ['待检查', '已登记', '已预约'].includes(e.status))

  const filteredPatients = pendingExams.filter(e => {
    if (priorityFilter === '全部') return true
    if (priorityFilter === '普通') return e.priority === '普通'
    if (priorityFilter === '紧急') return e.priority === '紧急'
    if (priorityFilter === '危重') return e.priority === '危重'
    return true
  })

  // 当前选中的患者
  const selectedPatient = selectedPatientId
    ? pendingExams.find(e => e.id === selectedPatientId) || pendingExams[0]
    : pendingExams[0]

  // 当前使用的设备
  const currentDevice = selectedPatient
    ? devices.find(d => d.id === selectedPatient.deviceId)
    : devices[0]

  // 检查进度步骤
  const examSteps = [
    { id: 'registered', label: '登记', icon: FileText, status: 'completed' },
    { id: 'triaged', label: '分诊', icon: User, status: 'completed' },
    { id: 'examining', label: '检查', icon: Stethoscope, status: acquisitionStatus === 'idle' && currentSeriesIndex > 0 ? 'completed' : 'current' },
    { id: 'acquiring', label: '图像采集', icon: Camera, status: acquisitionStatus === 'acquiring' ? 'current' : acquisitionStatus === 'completed' ? 'completed' : 'pending' },
    { id: 'completed', label: '检查完成', icon: CheckCircle2, status: acquisitionStatus === 'completed' ? 'completed' : 'pending' },
  ]

  // 当前检查序列
  const currentSeries = [
    { id: 'S001', name: '平扫序列', description: '平扫动脉期', imageCount: 128, quality: '优' },
    { id: 'S002', name: '动脉期', description: '增强动脉期', imageCount: 86, quality: '良' },
    { id: 'S003', name: '静脉期', description: '增强静脉期', imageCount: 92, quality: '优' },
  ]

  // 模拟图像缩略图
  const imageThumbnails = Array.from({ length: 12 }, (_, i) => ({
    id: `IMG-${String(i + 1).padStart(3, '0')}`,
    seriesId: i < 4 ? 'S001' : i < 8 ? 'S002' : 'S003',
    timestamp: `2026-05-01 ${String(9 + Math.floor(i / 3)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    quality: ['优', '优', '良', '优', '良', '良', '优', '良', '优', '优', '良', '优'][i],
    checked: i < 3,
  }))

  // 附加图像选项
  const supplementalTypes = [
    { id: 'localizer', label: '定位像', icon: Monitor },
    { id: 'scout', label: 'Scout', icon: Layers },
    { id: 'calibration', label: '校准图像', icon: Settings },
    { id: 'mask', label: '蒙片', icon: Eye },
  ]

  // ==================== 事件处理 ====================
  const handleStartAcquisition = () => {
    setAcquisitionStatus('acquiring')
    addAlert('开始图像采集...')
    addToHistory({
      id: `ACQ-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      series: `序列 ${currentSeriesIndex + 1}`,
      images: currentSeries[currentSeriesIndex]?.imageCount || 0,
      type: '开始采集',
      quality: '优',
    })
  }

  const handlePauseAcquisition = () => {
    setAcquisitionStatus('paused')
    addAlert('采集已暂停')
  }

  const handleResumeAcquisition = () => {
    setAcquisitionStatus('acquiring')
    addAlert('采集已恢复')
  }

  const handleCompleteSeries = () => {
    addToHistory({
      id: `ACQ-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      series: `序列 ${currentSeriesIndex + 1}`,
      images: currentSeries[currentSeriesIndex]?.imageCount || 0,
      type: '完成采集',
      quality: '优',
    })
    if (currentSeriesIndex < currentSeries.length - 1) {
      setCurrentSeriesIndex(prev => prev + 1)
      addAlert(`进入下一序列: ${currentSeries[currentSeriesIndex + 1]?.name}`)
    } else {
      setAcquisitionStatus('completed')
      addAlert('所有序列采集完成')
    }
  }

  const handleReacquire = () => {
    setAcquisitionStatus('idle')
    setCurrentSeriesIndex(0)
    addAlert('重新开始采集')
    addToHistory({
      id: `ACQ-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      series: '全部序列',
      images: 0,
      type: '重新采集',
      quality: '-',
    })
  }

  const handleAddImage = (type: string) => {
    addAlert(`已添加附加图像: ${type}`)
    addToHistory({
      id: `ACQ-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      series: '附加',
      images: 1,
      type: `添加${type}`,
      quality: '-',
    })
  }

  const handlePrintBarcode = () => {
    addAlert('正在打印条码...')
    setTimeout(() => addAlert('条码打印完成'), 1500)
  }

  const handleCancelExam = () => {
    if (confirm('确定要取消当前检查吗？')) {
      setSelectedPatientId(null)
      setAcquisitionStatus('idle')
      setCurrentSeriesIndex(0)
      setTechnicianNotes('')
      setSpecialNotes([])
      addAlert('检查已取消')
    }
  }

  const addToHistory = (entry: any) => {
    setAcquisitionHistory(prev => [entry, ...prev])
  }

  const addAlert = (message: string) => {
    setAlertMessages(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 4)])
  }

  const toggleSpecialNote = (note: string) => {
    setSpecialNotes(prev =>
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    )
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return '#16a34a'
      case 'current': return '#2563eb'
      case 'pending': return '#cbd5e1'
      default: return '#cbd5e1'
    }
  }

  const getPriorityStyle = (priority: string) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['普通']
    return {
      color: config.color,
      backgroundColor: config.bg,
      borderColor: config.border,
    }
  }

  // ==================== 渲染 ====================
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ==================== 左侧患者列表 ==================== */}
      <div style={{
        width: 340,
        backgroundColor: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      }}>
        {/* 左侧头部 */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Scan size={18} style={{ color: '#2563eb', marginRight: 8 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f' }}>检查执行</span>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 26 }}>
            放射科技师工作台 · 实时检查流程管理
          </div>
        </div>

        {/* 统计概览 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          {[
            { label: '待检查', value: pendingExams.length, color: '#2563eb' },
            { label: '采集中', value: pendingExams.filter(e => e.status === '检查中').length, color: '#d97706' },
            { label: '已完成', value: pendingExams.filter(e => e.status === '已完成').length, color: '#16a34a' },
          ].map(item => (
            <div key={item.label} style={{
              backgroundColor: item.color + '10',
              borderRadius: 8,
              padding: '8px 10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* 优先级筛选 */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {PRIORITY_FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setPriorityFilter(filter)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: '1px solid',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderColor: priorityFilter === filter ? (filter === '全部' ? '#2563eb' : PRIORITY_CONFIG[filter]?.border) : '#e2e8f0',
                  background: priorityFilter === filter ? (filter === '全部' ? '#eff6ff' : PRIORITY_CONFIG[filter]?.bg) : '#fff',
                  color: priorityFilter === filter ? (filter === '全部' ? '#2563eb' : PRIORITY_CONFIG[filter]?.color) : '#64748b',
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 患者列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {filteredPatients.map(exam => {
            const pStyle = getPriorityStyle(exam.priority)
            const isSelected = selectedPatient?.id === exam.id
            return (
              <div
                key={exam.id}
                onClick={() => setSelectedPatientId(exam.id)}
                style={{
                  padding: '12px',
                  marginBottom: 8,
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                  background: isSelected ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#93c5fd'
                    e.currentTarget.style.background = '#f8faff'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.background = '#fff'
                  }
                }}
              >
                {/* 优先级标识 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: pStyle.color,
                    }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: pStyle.color }}>
                      {exam.priority}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: 600,
                  }}>
                    {exam.patientType}
                  </span>
                </div>

                {/* 患者姓名 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <User size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{exam.patientName}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{exam.gender} · {exam.age}岁</span>
                </div>

                {/* 检查项目 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Camera size={12} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{exam.examItemName}</span>
                </div>

                {/* 设备和时间 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Monitor size={11} style={{ color: '#94a3b8' }} />
                    <span style={{ fontSize: 10, color: '#64748b' }}>
                      {exam.deviceName?.split('（')[0]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} style={{ color: '#94a3b8' }} />
                    <span style={{ fontSize: 10, color: '#64748b' }}>{exam.examTime}</span>
                  </div>
                </div>

                {/* 预计时长 */}
                <div style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: '1px dashed #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Timer size={11} style={{ color: '#94a3b8' }} />
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    预计检查时长: 15分钟
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ==================== 右侧检查执行工作区 ==================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* ==================== 顶部信息栏 ==================== */}
        <div style={{
          backgroundColor: '#1e3a5f',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(30,58,95,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* 患者基本信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <User size={22} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                    {selectedPatient?.patientName || '未选择患者'}
                  </span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: selectedPatient ? PRIORITY_CONFIG[selectedPatient.priority]?.bg : '#fff',
                    color: selectedPatient ? PRIORITY_CONFIG[selectedPatient.priority]?.color : '#666',
                    fontWeight: 700,
                  }}>
                    {selectedPatient?.priority || '-'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                  {selectedPatient?.gender} · {selectedPatient?.age}岁 ·{' '}
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: 4 }}>
                    {selectedPatient?.patientType}
                  </span>
                  {' · '}ID: {selectedPatient?.patientId}
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div style={{ width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' }} />

            {/* 检查信息 */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {selectedPatient?.examItemName}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                {selectedPatient?.modality} · {selectedPatient?.bodyPart} ·{' '}
                检查号: {selectedPatient?.accessionNumber}
              </div>
            </div>
          </div>

          {/* 设备信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <MonitorCheck size={18} style={{ color: '#4ade80' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                  {currentDevice?.name?.split('（')[0] || '-'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                  {currentDevice?.manufacturer} · {currentDevice?.model}
                </div>
              </div>
              <div style={{
                padding: '3px 10px',
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: DEVICE_STATUS_COLORS[currentDevice?.status || '空闲']?.bg,
                color: DEVICE_STATUS_COLORS[currentDevice?.status || '空闲']?.color,
              }}>
                {currentDevice?.status || '空闲'}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 检查进度步骤条 ==================== */}
        <div style={{
          backgroundColor: '#fff',
          padding: '14px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {examSteps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === examSteps.length - 1
            const isCompleted = step.status === 'completed'
            const isCurrent = step.status === 'current'
            const stepColor = getStepColor(step.status)

            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: stepColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? `0 0 0 4px ${stepColor}30` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {isCompleted ? (
                      <CheckCircle size={18} style={{ color: '#fff' }} />
                    ) : (
                      <Icon size={16} style={{ color: '#fff' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? '#1e3a5f' : '#94a3b8',
                    marginTop: 6,
                  }}>
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isCompleted ? '#16a34a' : '#e2e8f0',
                    margin: '0 4px',
                    marginBottom: 22,
                    transition: 'all 0.3s',
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ==================== 主工作区 ==================== */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左侧主区域 */}
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            {/* DICOM连接状态 */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Radio size={16} style={{ color: '#1e3a5f' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>DICOM设备连接</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: DICOM_STATUS[dicomStatus].color,
                    boxShadow: `0 0 6px ${DICOM_STATUS[dicomStatus].color}`,
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: DICOM_STATUS[dicomStatus].color }}>
                    {DICOM_STATUS[dicomStatus].text}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { label: 'AE Title', value: 'CT-ACQ-01' },
                  { label: '服务器', value: 'PACS-SERVER-01' },
                  { label: '端口', value: '11112' },
                  { label: '传输', value: 'C-STORE ✓' },
                ].map(item => (
                  <div key={item.label} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', fontFamily: 'monospace' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 当前序列信息 */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} style={{ color: '#1e3a5f' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>当前序列</span>
                </div>
                <span style={{
                  fontSize: 10,
                  padding: '3px 10px',
                  borderRadius: 10,
                  backgroundColor: acquisitionStatus === 'acquiring' ? '#fef3c7' : '#dcfce7',
                  color: acquisitionStatus === 'acquiring' ? '#d97706' : '#16a34a',
                  fontWeight: 700,
                }}>
                  {acquisitionStatus === 'idle' && '待机'}
                  {acquisitionStatus === 'acquiring' && '采集中'}
                  {acquisitionStatus === 'paused' && '已暂停'}
                  {acquisitionStatus === 'completed' && '已完成'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {currentSeries.map((series, index) => (
                  <div
                    key={series.id}
                    onClick={() => setCurrentSeriesIndex(index)}
                    style={{
                      padding: '12px',
                      borderRadius: 10,
                      border: '2px solid',
                      borderColor: currentSeriesIndex === index ? '#2563eb' : '#e2e8f0',
                      backgroundColor: currentSeriesIndex === index ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Disc size={16} style={{ color: currentSeriesIndex === index ? '#2563eb' : '#64748b' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: currentSeriesIndex === index ? '#1e3a5f' : '#334155' }}>
                        {series.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>
                      {series.description}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        <Image size={11} style={{ display: 'inline', marginRight: 4 }} />
                        {series.imageCount} 幅
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: '2px 8px',
                        borderRadius: 8,
                        backgroundColor: QUALITY_CONFIG[series.quality]?.bg,
                      }}>
                        {[1, 2, 3].map(s => (
                          <Star
                            key={s}
                            size={10}
                            style={{
                              color: s <= QUALITY_CONFIG[series.quality]?.stars ? QUALITY_CONFIG[series.quality]?.color : '#e2e8f0',
                              fill: s <= QUALITY_CONFIG[series.quality]?.stars ? QUALITY_CONFIG[series.quality]?.color : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 实时图像预览区 */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              flex: 1,
              minHeight: 300,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Monitor size={16} style={{ color: '#1e3a5f' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>实时图像预览</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>窗宽窗位:</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#334155', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>
                    W:400 L:50
                  </span>
                </div>
              </div>

              {/* 图像显示区域 */}
              <div style={{
                flex: 1,
                backgroundColor: '#1a1a2e',
                borderRadius: 10,
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* 模拟图像 */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}>
                  {/* CT扫描模拟 */}
                  <svg width="100%" height="100%" viewBox="0 0 300 200" style={{ opacity: 0.9 }}>
                    <defs>
                      <radialGradient id="ctGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#2a2a4a" />
                        <stop offset="100%" stopColor="#1a1a2e" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="150" cy="100" rx="90" ry="80" fill="url(#ctGradient)" stroke="#3a3a5a" strokeWidth="2" />
                    {/* 模拟CT横断面结构 */}
                    <ellipse cx="130" cy="90" rx="25" ry="20" fill="#4a4a6a" opacity="0.7" />
                    <ellipse cx="170" cy="95" rx="20" ry="18" fill="#4a4a6a" opacity="0.7" />
                    <ellipse cx="150" cy="115" rx="30" ry="15" fill="#5a5a7a" opacity="0.5" />
                    {/* 图像网格 */}
                    <line x1="60" y1="20" x2="60" y2="180" stroke="#3a3a5a" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="120" y1="20" x2="120" y2="180" stroke="#3a3a5a" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="180" y1="20" x2="180" y2="180" stroke="#3a3a5a" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="240" y1="20" x2="240" y2="180" stroke="#3a3a5a" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="20" y1="60" x2="280" y2="60" stroke="#3a3a5a" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="20" y1="100" x2="280" y2="100" stroke="#3a3a5a" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="20" y1="140" x2="280" y2="140" stroke="#3a3a5a" strokeWidth="0.5" strokeDasharray="2,2" />
                  </svg>
                </div>

                {/* 叠加信息 */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}>
                  <span style={{ fontSize: 10, color: '#4ade80', fontFamily: 'monospace' }}>
                    {selectedPatient?.examItemName} - {currentSeries[currentSeriesIndex]?.name}
                  </span>
                </div>

                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}>
                  <span style={{ fontSize: 10, color: '#fff', fontFamily: 'monospace' }}>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}>
                  <span style={{ fontSize: 10, color: '#fff', fontFamily: 'monospace' }}>
                    Slice: {String(currentSeriesIndex + 1).padStart(3, '0')}/{String(currentSeries.length).padStart(3, '0')}
                  </span>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}>
                  <span style={{ fontSize: 10, color: '#fff', fontFamily: 'monospace' }}>
                    IM: {String(imageThumbnails.filter(i => i.seriesId === currentSeries[currentSeriesIndex]?.id).length * 32).padStart(4, '0')}
                  </span>
                </div>

                {/* 采集动画指示 */}
                {acquisitionStatus === 'acquiring' && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(37,99,235,0.9)',
                    padding: '10px 20px',
                    borderRadius: 10,
                  }}>
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      animation: 'pulse 1s ease-in-out infinite',
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>采集中...</span>
                  </div>
                )}
              </div>

              {/* 图像质量评分 */}
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart3 size={14} style={{ color: '#64748b' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>当前序列图像质量</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>优: 128 幅</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>良: 24 幅</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>差: 0 幅</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <div style={{ flex: '86%', height: 8, backgroundColor: '#dcfce7', borderRadius: 4 }} />
                  <div style={{ flex: '14%', height: 8, backgroundColor: '#fef3c7', borderRadius: 4 }} />
                </div>
              </div>
            </div>

            {/* 已采集图像缩略图列表 */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Image size={16} style={{ color: '#1e3a5f' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>已采集图像</span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: 700,
                  }}>
                    {imageThumbnails.length} 幅
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fff',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <Eye size={12} /> 预览
                  </button>
                  <button style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fff',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {imageThumbnails.map((img, index) => (
                  <div
                    key={img.id}
                    style={{
                      flexShrink: 0,
                      width: 80,
                      height: 70,
                      backgroundColor: '#1a1a2e',
                      borderRadius: 8,
                      border: '2px solid',
                      borderColor: img.quality === '优' ? '#16a34a' : img.quality === '良' ? '#d97706' : '#dc2626',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* 模拟缩略图 */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#2a2a4a',
                    }}>
                      <svg width="50" height="50" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="20" fill="#3a3a5a" />
                        <circle cx="20" cy="22" r="6" fill="#4a4a6a" />
                        <circle cx="30" cy="25" r="5" fill="#4a4a6a" />
                      </svg>
                    </div>
                    <div style={{
                      padding: '3px 6px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 9, color: '#fff', fontFamily: 'monospace' }}>
                        {String(index + 1).padStart(3, '0')}
                      </span>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {[1, 2, 3].map(s => (
                          <Star
                            key={s}
                            size={7}
                            style={{
                              color: s <= QUALITY_CONFIG[img.quality]?.stars ? QUALITY_CONFIG[img.quality]?.color : '#555',
                              fill: s <= QUALITY_CONFIG[img.quality]?.stars ? QUALITY_CONFIG[img.quality]?.color : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 添加更多按钮 */}
                <div style={{
                  flexShrink: 0,
                  width: 80,
                  height: 70,
                  border: '2px dashed #cbd5e1',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#fafbfc',
                  transition: 'all 0.2s',
                }}>
                  <Plus size={20} style={{ color: '#94a3b8' }} />
                  <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>添加</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧操作面板 */}
          <div style={{
            width: 300,
            backgroundColor: '#f8fafc',
            borderLeft: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}>
            {/* 操作按钮面板 */}
            <div style={{
              padding: 14,
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Power size={16} style={{ color: '#1e3a5f' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>操作面板</span>
              </div>

              {/* 主要操作按钮 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {acquisitionStatus === 'idle' && (
                  <button
                    onClick={handleStartAcquisition}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: '#16a34a',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Play size={16} /> 开始采集
                  </button>
                )}

                {acquisitionStatus === 'acquiring' && (
                  <>
                    <button
                      onClick={handlePauseAcquisition}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: 'none',
                        backgroundColor: '#d97706',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 2px 6px rgba(217,119,6,0.3)',
                      }}
                    >
                      <Pause size={16} /> 暂停采集
                    </button>
                    <button
                      onClick={handleCompleteSeries}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: 'none',
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                      }}
                    >
                      <SkipForward size={16} /> 完成序列
                    </button>
                  </>
                )}

                {acquisitionStatus === 'paused' && (
                  <button
                    onClick={handleResumeAcquisition}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: '#16a34a',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Play size={16} /> 恢复采集
                  </button>
                )}

                <button
                  onClick={handleReacquire}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <RotateCcw size={14} /> 重新采集
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handlePrintBarcode}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#fff',
                      color: '#334155',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Printer size={13} /> 条码
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#fff',
                      color: '#334155',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Tag size={13} /> 附加
                  </button>
                </div>

                <button
                  onClick={handleCancelExam}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid #fca5a5',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <XCircle size={14} /> 取消检查
                </button>
              </div>

              {/* 附加图像选项 */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <ImagePlus size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>附加图像</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {supplementalTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleAddImage(type.label)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#fff',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <type.icon size={12} /> {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 技师备注 */}
            <div style={{
              padding: 14,
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <MessageSquare size={16} style={{ color: '#1e3a5f' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>技师备注</span>
              </div>

              <textarea
                value={technicianNotes}
                onChange={e => setTechnicianNotes(e.target.value)}
                placeholder="记录检查过程中的备注信息..."
                style={{
                  width: '100%',
                  height: 80,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  color: '#334155',
                  backgroundColor: '#fafbfc',
                }}
              />

              {/* 特殊情况 */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <BadgeAlert size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>特殊情况</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { label: '运动伪影', color: '#dc2626' },
                    { label: '金属伪影', color: '#dc2626' },
                    { label: '呼吸伪影', color: '#d97706' },
                    { label: '体位不正', color: '#d97706' },
                    { label: '噪声较大', color: '#d97706' },
                    { label: '对比剂反应', color: '#dc2626' },
                  ].map(note => (
                    <button
                      key={note.label}
                      onClick={() => toggleSpecialNote(note.label)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        border: '1px solid',
                        borderColor: specialNotes.includes(note.label) ? note.color : '#e2e8f0',
                        backgroundColor: specialNotes.includes(note.label) ? note.color + '15' : '#fff',
                        color: specialNotes.includes(note.label) ? note.color : '#94a3b8',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {specialNotes.includes(note.label) && (
                        <CheckCircle size={10} style={{ marginRight: 4 }} />
                      )}
                      {note.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 采集历史记录 */}
            <div style={{
              padding: 14,
              backgroundColor: '#fff',
              flex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <History size={16} style={{ color: '#1e3a5f' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>采集历史</span>
              </div>

              {/* 实时告警 */}
              {alertMessages.length > 0 && (
                <div style={{
                  padding: '8px 10px',
                  backgroundColor: '#fef3c7',
                  borderRadius: 8,
                  marginBottom: 12,
                  border: '1px solid #fcd34d',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Bell size={12} style={{ color: '#d97706' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e' }}>实时状态</span>
                  </div>
                  {alertMessages.map((msg, i) => (
                    <div key={i} style={{ fontSize: 10, color: '#92400e', marginTop: 2 }}>
                      {msg}
                    </div>
                  ))}
                </div>
              )}

              {/* 历史记录列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { time: '10:35:42', series: '序列 1', images: 128, type: '完成采集', quality: '优', color: '#16a34a' },
                  { time: '10:32:18', series: '序列 1', images: 45, type: '暂停', quality: '-', color: '#d97706' },
                  { time: '10:30:00', series: '序列 1', images: 32, type: '开始采集', quality: '-', color: '#2563eb' },
                  { time: '10:28:15', series: '定位像', images: 1, type: '添加定位像', quality: '-', color: '#64748b' },
                ].map((record, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#fafbfc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      borderLeft: `3px solid ${record.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: record.color }}>{record.type}</span>
                      <span style={{ fontSize: 9, color: '#94a3b8' }}>{record.time}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {record.series} · {record.images} 幅
                      {record.quality !== '-' && (
                        <span style={{ marginLeft: 6, color: QUALITY_CONFIG[record.quality]?.color }}>
                          {'★'.repeat(QUALITY_CONFIG[record.quality]?.stars || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
