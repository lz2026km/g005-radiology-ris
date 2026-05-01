// @ts-nocheck
// G005 放射科RIS系统 - 远程会诊管理 v1.0.0
import { useState } from 'react'
import {
  Radio, Search, Video, CheckCircle, Clock, Phone, FileText,
  User, Stethoscope, Activity, Upload, Printer, Send, X, Check,
  AlertCircle, ArrowRight, Image, MessageSquare, Star, ThumbsUp,
  Calendar, Clock3, Users, MapPin, Heart, Shield, ChevronRight,
  RefreshCw, Eye, Download, Edit3
} from 'lucide-react'
import { initialConsultations, initialRadiologyExams, initialPatients } from '../data/initialData'

const PRIMARY = '#1e3a5f'
const PRIMARY_LIGHT = '#2d5a8e'
const ACCENT = '#3b82f6'
const SUCCESS = '#059669'
const WARNING = '#d97706'
const DANGER = '#dc2626'
const GRAY = '#64748b'
const LIGHT_BG = '#f8fafc'
const BORDER = '#e2e8f0'
const WHITE = '#ffffff'

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  '待回复': { bg: '#fef3c7', color: '#d97706', label: '待回复' },
  '已回复': { bg: '#d1fae5', color: '#059669', label: '已回复' },
  '已拒绝': { bg: '#f1f5f9', color: '#94a3b8', label: '已拒绝' },
  '进行中': { bg: '#dbeafe', color: '#2563eb', label: '进行中' },
  '已完成': { bg: '#d1fae5', color: '#059669', label: '已完成' },
}

const URGENCY_CONFIG: Record<string, { bg: string; color: string }> = {
  '紧急': { bg: '#fee2e2', color: '#dc2626' },
  '普通': { bg: '#f1f5f9', color: '#64748b' },
}

const TYPE_CONFIG: Record<string, { bg: string; color: string }> = {
  'MDT': { bg: '#ede9fe', color: '#6d28d9' },
  '疑难病例': { bg: '#fef3c7', color: '#b45309' },
  '远程会诊': { bg: '#dbeafe', color: '#2563eb' },
  '二次意见': { bg: '#d1fae5', color: '#047857' },
}

interface TimelineNode {
  label: string
  time: string
  operator: string
  status: 'done' | 'current' | 'pending'
  icon: React.ReactNode
}

const buildTimeline = (consultation: typeof initialConsultations[0]): TimelineNode[] => {
  const nodes: TimelineNode[] = [
    {
      label: '申请提交',
      time: consultation.requestTime,
      operator: consultation.requestingDoctorName,
      status: 'done',
      icon: <FileText size={14} />,
    },
    {
      label: '接收确认',
      time: consultation.responseTime || '—',
      operator: consultation.consultedDoctorName || '待指定',
      status: consultation.status === '待回复' ? 'pending' : 'done',
      icon: <CheckCircle size={14} />,
    },
    {
      label: '影像传输',
      time: consultation.status !== '待回复' ? '2026-05-01 15:00' : '—',
      operator: '系统自动',
      status: consultation.status === '已回复' || consultation.status === '已完成' ? 'done' : 'pending',
      icon: <Image size={14} />,
    },
    {
      label: '会诊进行',
      time: consultation.status === '已回复' ? '2026-05-01 15:30' : '—',
      operator: consultation.consultedDoctorName || '—',
      status: consultation.status === '已回复' ? 'current' : 'pending',
      icon: <MessageSquare size={14} />,
    },
    {
      label: '会诊完成',
      time: consultation.status === '已完成' ? '2026-05-01 16:45' : '—',
      operator: consultation.consultedDoctorName || '—',
      status: consultation.status === '已完成' ? 'done' : 'pending',
      icon: <Check size={14} />,
    },
  ]
  return nodes
}

export default function ConsultationPage() {
  const [filter, setFilter] = useState<string>('全部')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string>(initialConsultations[0]?.id || '')
  const [conclusionText, setConclusionText] = useState('')
  const [diagnosisAdvice, setDiagnosisAdvice] = useState('')
  const [referenceInfo, setReferenceInfo] = useState('')
  const [qualityScore, setQualityScore] = useState(5)
  const [satisfactionScore, setSatisfactionScore] = useState(5)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingModalData, setRatingModalData] = useState<{ dimension: string; score: number; comment: string }[]>([
    { dimension: '完整性', score: 5, comment: '' },
    { dimension: '准确性', score: 5, comment: '' },
    { dimension: '规范性', score: 5, comment: '' },
    { dimension: '及时性', score: 5, comment: '' },
  ])

  const consultations = initialConsultations
  const selected = consultations.find(c => c.id === selectedId)

  const filters = ['全部', '待回复', '已回复', '已完成', '已拒绝']

  const filtered = consultations.filter(c => {
    const matchFilter = filter === '全部' || c.status === filter
    const matchSearch = !search || c.patientName.includes(search) || c.id.includes(search)
    return matchFilter && matchSearch
  })

  const getExamForConsultation = (consultation: typeof selected) => {
    return initialRadiologyExams.find(e => e.id === consultation?.examId)
  }

  const getPatientForConsultation = (consultation: typeof selected) => {
    return initialPatients.find(p => p.id === consultation?.patientId)
  }

  const handleAccept = () => {
    alert('已接受会诊请求')
  }

  const handleReject = () => {
    alert('已拒绝会诊请求')
  }

  const handleUpload = () => {
    alert('打开补充资料上传')
  }

  const handleSubmitConclusion = () => {
    if (!conclusionText.trim()) {
      alert('请填写会诊意见')
      return
    }
    alert('会诊结论已提交')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSubmitRating = () => {
    const total = ratingModalData.reduce((sum, item) => sum + item.score, 0)
    setQualityScore(Math.round(total / ratingModalData.length))
    setShowRatingModal(false)
    alert('评价已提交')
  }

  const renderStars = (score: number, onChange?: (s: number) => void) => {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={18}
            fill={star <= score ? '#f59e0b' : 'none'}
            color={star <= score ? '#f59e0b' : '#d1d5db'}
            style={{ cursor: onChange ? 'pointer' : 'default' }}
            onClick={() => onChange?.(star)}
          />
        ))}
      </div>
    )
  }

  const timeline = selected ? buildTimeline(selected) : []

  const statCards = [
    {
      label: '全部会诊',
      value: consultations.length,
      icon: <Radio size={18} color={ACCENT} />,
      bg: '#eff6ff',
    },
    {
      label: '待回复',
      value: consultations.filter(c => c.status === '待回复').length,
      icon: <Clock size={18} color={WARNING} />,
      bg: '#fef3c7',
    },
    {
      label: '进行中',
      value: consultations.filter(c => c.status === '已回复').length,
      icon: <Activity size={18} color={ACCENT} />,
      bg: '#dbeafe',
    },
    {
      label: '已完成',
      value: consultations.filter(c => c.status === '已完成').length,
      icon: <CheckCircle size={18} color={SUCCESS} />,
      bg: '#d1fae5',
    },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', background: '#f1f5f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: PRIMARY, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={18} color='#fff' />
          </div>
          远程会诊管理
          <span style={{ fontSize: 12, fontWeight: 400, color: GRAY, marginLeft: 8 }}>Remote Consultation Management</span>
        </h1>
        <p style={{ fontSize: 13, color: GRAY, margin: 0 }}>疑难病例讨论 · MDT多学科会诊 · 远程影像会诊 · 二次意见</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {statCards.map(card => (
          <div key={card.label} style={{ background: WHITE, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY }}>{card.value}</div>
              <div style={{ fontSize: 12, color: GRAY }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left Panel - Consultation List */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Search */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, background: LIGHT_BG }}>
            <div style={{ background: WHITE, borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} color={GRAY} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索患者姓名、会诊单号..."
                style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', color: PRIMARY }}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filters.map(f => {
              const count = f === '全部' ? consultations.length : consultations.filter(c => c.status === f).length
              const isActive = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 16,
                    border: isActive ? 'none' : `1px solid ${BORDER}`,
                    background: isActive ? PRIMARY : WHITE,
                    color: isActive ? WHITE : GRAY,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {f}
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                    color: isActive ? WHITE : GRAY,
                    borderRadius: 10,
                    padding: '1px 6px',
                    fontSize: 11,
                  }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* List */}
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: GRAY }}>
                <AlertCircle size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div style={{ fontSize: 13 }}>暂无会诊记录</div>
              </div>
            ) : filtered.map((c, idx) => {
              const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG['待回复']
              const tc = TYPE_CONFIG[c.consultationType] || TYPE_CONFIG['疑难病例']
              const isSelected = selectedId === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: `1px solid ${BORDER}`,
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : idx % 2 === 0 ? WHITE : '#fafbfc',
                    borderLeft: isSelected ? `3px solid ${ACCENT}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f0f7ff' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? WHITE : '#fafbfc' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: PRIMARY }}>{c.patientName}</span>
                      {c.isRemote && (
                        <span style={{ padding: '1px 6px', background: '#ede9fe', color: '#6d28d9', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Video size={9} />远程
                        </span>
                      )}
                    </div>
                    <span style={{ padding: '2px 10px', background: sc.bg, color: sc.color, borderRadius: 10, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {sc.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '1px 8px', background: '#eff6ff', color: ACCENT, borderRadius: 4, fontSize: 11 }}>{c.modality}</span>
                    <span style={{ padding: '1px 8px', background: tc.bg, color: tc.color, borderRadius: 4, fontSize: 11 }}>{c.consultationType}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    <div>
                      <div style={{ fontSize: 10, color: GRAY }}>申请科室</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{c.requestingDepartment}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: GRAY }}>接收科室</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{c.consultedDepartment || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: GRAY }}>会诊医生</div>
                      <div style={{ fontSize: 12, color: '#334155' }}>{c.consultedDoctorName || '待指定'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: GRAY }}>申请时间</div>
                      <div style={{ fontSize: 12, color: '#334155' }}>{c.requestTime.split(' ')[0]}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: GRAY, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileText size={11} /> {c.requestReason.length > 30 ? c.requestReason.slice(0, 30) + '…' : c.requestReason}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Panel - Consultation Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!selected ? (
            <div style={{ background: WHITE, borderRadius: 12, padding: 60, textAlign: 'center', border: `1px solid ${BORDER}` }}>
              <AlertCircle size={48} color={GRAY} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 15, color: GRAY }}>请从左侧选择一个会诊记录查看详情</div>
            </div>
          ) : (
            <>
              {/* Header Info Card */}
              <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: PRIMARY, margin: 0 }}>{selected.patientName}</h2>
                      <span style={{ padding: '2px 10px', background: STATUS_CONFIG[selected.status]?.bg, color: STATUS_CONFIG[selected.status]?.color, borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                        {STATUS_CONFIG[selected.status]?.label}
                      </span>
                      {selected.isRemote && (
                        <span style={{ padding: '2px 8px', background: '#ede9fe', color: '#6d28d9', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Video size={11} />远程会诊
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: GRAY }}>会诊单号：{selected.id}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleUpload} style={{ padding: '6px 14px', background: '#f0f7ff', color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Upload size={13} />上传资料
                    </button>
                    <button onClick={handlePrint} style={{ padding: '6px 14px', background: '#f0f7ff', color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Printer size={13} />打印会诊单
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { label: '会诊单号', value: selected.id, icon: <FileText size={14} color={GRAY} /> },
                    { label: '申请时间', value: selected.requestTime, icon: <Calendar size={14} color={GRAY} /> },
                    { label: '会诊类型', value: selected.consultationType, icon: <Users size={14} color={GRAY} /> },
                    { label: '会诊科室', value: selected.consultedDepartment || '待指定', icon: <MapPin size={14} color={GRAY} /> },
                  ].map(item => (
                    <div key={item.label} style={{ background: LIGHT_BG, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        {item.icon}
                        <span style={{ fontSize: 11, color: GRAY }}>{item.label}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                  {selected.status === '待回复' && (
                    <>
                      <button onClick={handleAccept} style={{ padding: '8px 20px', background: SUCCESS, color: WHITE, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={15} />接受会诊
                      </button>
                      <button onClick={handleReject} style={{ padding: '8px 20px', background: WHITE, color: DANGER, border: `1px solid ${DANGER}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <X size={15} />拒绝会诊
                      </button>
                    </>
                  )}
                  <button onClick={handleSubmitConclusion} style={{ padding: '8px 20px', background: PRIMARY, color: WHITE, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Send size={15} />提交会诊结论
                  </button>
                </div>
              </div>

              {/* Patient & Exam Info */}
              <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={16} color={ACCENT} />患者与检查信息
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Patient Info */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>患者基本信息</div>
                    {(() => {
                      const patient = getPatientForConsultation(selected)
                      return patient ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            { label: '姓名', value: patient.name },
                            { label: '性别', value: patient.gender },
                            { label: '年龄', value: `${patient.age}岁` },
                            { label: '类型', value: patient.patientType },
                            { label: '电话', value: patient.phone },
                            { label: '主诊断', value: patient.primaryDiagnosis },
                          ].map(item => (
                            <div key={item.label} style={{ background: LIGHT_BG, borderRadius: 6, padding: '6px 10px' }}>
                              <div style={{ fontSize: 10, color: GRAY }}>{item.label}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : <div style={{ color: GRAY, fontSize: 13 }}>未找到患者信息</div>
                    })()}
                  </div>
                  {/* Exam Info */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>检查信息</div>
                    {(() => {
                      const exam = getExamForConsultation(selected)
                      return exam ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            { label: '检查项目', value: exam.examItemName },
                            { label: '检查日期', value: exam.examDate },
                            { label: '设备', value: exam.deviceName?.split('（')[0] },
                            { label: '影像数量', value: `${exam.imagesAcquired}幅` },
                            { label: '检查号', value: exam.accessionNumber },
                            { label: '临床诊断', value: exam.clinicalDiagnosis },
                          ].map(item => (
                            <div key={item.label} style={{ background: LIGHT_BG, borderRadius: 6, padding: '6px 10px' }}>
                              <div style={{ fontSize: 10, color: GRAY }}>{item.label}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : <div style={{ color: GRAY, fontSize: 13 }}>未找到检查信息</div>
                    })()}
                  </div>
                </div>
              </div>

              {/* Consultation Purpose & Clinical Info */}
              <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stethoscope size={16} color={ACCENT} />会诊目的与临床信息
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: '会诊目的描述', value: selected.requestReason, icon: <MessageSquare size={14} color={ACCENT} /> },
                    { label: '临床诊断', value: getExamForConsultation(selected)?.clinicalDiagnosis || '—', icon: <Activity size={14} color={ACCENT} /> },
                    { label: '相关检查结果', value: getExamForConsultation(selected)?.relevantLabResults || '暂无实验室检查结果', icon: <FileText size={14} color={ACCENT} /> },
                  ].map(item => (
                    <div key={item.label} style={{ background: LIGHT_BG, borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        {item.icon}
                        <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{item.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock3 size={16} color={ACCENT} />会诊进度时间轴
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {timeline.map((node, idx) => (
                    <div key={node.label} style={{ display: 'flex', alignItems: 'stretch', minHeight: 72 }}>
                      {/* Connector line */}
                      {idx < timeline.length - 1 && (
                        <div style={{ position: 'absolute', left: 19, top: 40, bottom: -16, width: 2, background: node.status === 'done' ? ACCENT : BORDER, zIndex: 0 }} />
                      )}
                      {/* Node */}
                      <div style={{ position: 'relative', zIndex: 1, width: 40, minWidth: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: node.status === 'done' ? ACCENT : node.status === 'current' ? WHITE : LIGHT_BG,
                          border: `2px solid ${node.status === 'done' ? ACCENT : node.status === 'current' ? ACCENT : BORDER}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: node.status === 'done' ? WHITE : node.status === 'current' ? ACCENT : GRAY,
                          boxShadow: node.status === 'current' ? `0 0 0 4px ${ACCENT}22` : 'none',
                        }}>
                          {node.icon}
                        </div>
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, padding: '6px 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: node.status === 'pending' ? GRAY : PRIMARY }}>{node.label}</div>
                          <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>操作人：{node.operator}</div>
                        </div>
                        <div style={{ fontSize: 11, color: GRAY, textAlign: 'right' }}>
                          <div>{node.time !== '—' ? '时间' : ''}</div>
                          <div style={{ fontWeight: 600, color: node.status === 'pending' ? GRAY : PRIMARY }}>{node.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Conclusion */}
              <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={16} color={ACCENT} />会诊结论区
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>
                      会诊医生意见 <span style={{ color: DANGER }}>*</span>
                    </label>
                    <textarea
                      value={conclusionText}
                      onChange={e => setConclusionText(e.target.value)}
                      placeholder="请输入会诊医生的详细意见..."
                      rows={4}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, color: PRIMARY, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>
                      诊断建议
                    </label>
                    <textarea
                      value={diagnosisAdvice}
                      onChange={e => setDiagnosisAdvice(e.target.value)}
                      placeholder="请输入诊断建议和治疗方案建议..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, color: PRIMARY, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>
                      参考资料
                    </label>
                    <textarea
                      value={referenceInfo}
                      onChange={e => setReferenceInfo(e.target.value)}
                      placeholder="请输入参考资料、文献依据等..."
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, color: PRIMARY, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Evaluation */}
              <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ThumbsUp size={16} color={ACCENT} />会诊评价
                  </h3>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    style={{ padding: '4px 12px', background: '#f0f7ff', color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Edit3 size={12} />详细评分
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: LIGHT_BG, borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: GRAY, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Shield size={12} />会诊质量评分
                    </div>
                    <div style={{ marginBottom: 8 }}>{renderStars(qualityScore)}</div>
                    <div style={{ fontSize: 12, color: GRAY }}>综合评分：<span style={{ fontWeight: 700, color: PRIMARY }}>{qualityScore}.0/5.0</span></div>
                  </div>
                  <div style={{ background: LIGHT_BG, borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: GRAY, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Heart size={12} />满意度评价
                    </div>
                    <div style={{ marginBottom: 8 }}>{renderStars(satisfactionScore, setSatisfactionScore)}</div>
                    <div style={{ fontSize: 12, color: GRAY }}>满意度：<span style={{ fontWeight: 700, color: PRIMARY }}>{satisfactionScore}.0/5.0</span></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: WHITE, borderRadius: 16, padding: 24, width: 480, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: PRIMARY, margin: 0 }}>会诊质量详细评分</h3>
              <button onClick={() => setShowRatingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY, padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ratingModalData.map((item, idx) => (
                <div key={item.dimension} style={{ background: LIGHT_BG, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{item.dimension}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT }}>{item.score}分</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          const updated = [...ratingModalData]
                          updated[idx].score = s
                          setRatingModalData(updated)
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      >
                        <Star size={22} fill={s <= item.score ? '#f59e0b' : 'none'} color={s <= item.score ? '#f59e0b' : '#d1d5db'} />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={item.comment}
                    onChange={e => {
                      const updated = [...ratingModalData]
                      updated[idx].comment = e.target.value
                      setRatingModalData(updated)
                    }}
                    placeholder={`${item.dimension}评语（选填）`}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${BORDER}`, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRatingModal(false)} style={{ padding: '8px 20px', background: LIGHT_BG, color: GRAY, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                取消
              </button>
              <button onClick={handleSubmitRating} style={{ padding: '8px 20px', background: PRIMARY, color: WHITE, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
