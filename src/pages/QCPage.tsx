// @ts-nocheck
// G005 放射科RIS系统 - 质量控制 v1.0.0
import { useState } from 'react'
import {
  ShieldCheck, AlertTriangle, CheckCircle, Search, Filter, Star,
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart,
  Settings, Clock, Camera, Image, X, Check, Eye, Edit3,
  Activity, Bell, Target, Award, Users, FileText, RefreshCw,
  Zap, ThumbsUp, ThumbsDown, Plus, Minus, Save, RotateCcw
} from 'lucide-react'
import {
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart as RechartsLine, Line,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area
} from 'recharts'
import { initialRadiologyExams, initialConsultations, initialUsers } from '../data/initialData'

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

const TABS = [
  { key: 'report', label: '报告质量评分', icon: <FileText size={15} /> },
  { key: 'image', label: '影像质量控制', icon: <Image size={15} /> },
  { key: 'timeout', label: '超时报告统计', icon: <Clock size={15} /> },
  { key: 'dashboard', label: '质控指标仪表盘', icon: <BarChart3 size={15} /> },
  { key: 'settings', label: '质控规则设置', icon: <Settings size={15} /> },
]

// Sample QC report data
const reportQCData = [
  { id: 'RAD-RPT001', patientName: '张志刚', reportDoctor: '李明辉', reviewDoctor: '王秀峰', score: 95, completeness: 95, accuracy: 98, standardization: 92, timeliness: 94, status: '优秀', date: '2026-05-01' },
  { id: 'RAD-RPT002', patientName: '李秀英', reportDoctor: '王秀峰', reviewDoctor: '李明辉', score: 88, completeness: 90, accuracy: 85, standardization: 88, timeliness: 90, status: '良好', date: '2026-05-01' },
  { id: 'RAD-RPT003', patientName: '赵晓敏', reportDoctor: '张海涛', reviewDoctor: '刘芳', score: 82, completeness: 80, accuracy: 85, standardization: 80, timeliness: 85, status: '良好', date: '2026-05-01' },
  { id: 'RAD-RPT004', patientName: '王建国', reportDoctor: '刘芳', reviewDoctor: '王秀峰', score: 92, completeness: 90, accuracy: 95, standardization: 90, timeliness: 92, status: '优秀', date: '2026-04-30' },
  { id: 'RAD-RPT005', patientName: '周玉芬', reportDoctor: '李明辉', reviewDoctor: '张海涛', score: 78, completeness: 75, accuracy: 80, standardization: 78, timeliness: 80, status: '一般', date: '2026-04-30' },
  { id: 'RAD-RPT006', patientName: '孙伟', reportDoctor: '王秀峰', reviewDoctor: '李明辉', score: 90, completeness: 88, accuracy: 92, standardization: 90, timeliness: 90, status: '优秀', date: '2026-04-30' },
  { id: 'RAD-RPT007', patientName: '吴婷', reportDoctor: '张海涛', reviewDoctor: '刘芳', score: 85, completeness: 85, accuracy: 85, standardization: 85, timeliness: 85, status: '良好', date: '2026-04-29' },
  { id: 'RAD-RPT008', patientName: '郑丽', reportDoctor: '刘芳', reviewDoctor: '王秀峰', score: 91, completeness: 90, accuracy: 92, standardization: 90, timeliness: 92, status: '优秀', date: '2026-04-29' },
]

// Image quality data
const imageQCData = [
  { id: 'RAD-EX001', patientName: '张志刚', device: 'CT-1（GE Revolution）', score: 95, issues: [], status: '优秀' },
  { id: 'RAD-EX002', patientName: '李秀英', device: 'MR-1（西门子Vida）', score: 88, issues: ['轻微运动伪影'], status: '良好' },
  { id: 'RAD-EX003', patientName: '王建国', device: 'DR-1（飞利浦）', score: 92, issues: [], status: '优秀' },
  { id: 'RAD-EX004', patientName: '赵晓敏', device: 'CT-1（GE Revolution）', score: 72, issues: ['运动伪影', '曝光不当'], status: '差' },
  { id: 'RAD-EX005', patientName: '周玉芬', device: 'CT-2（西门子Force）', score: 85, issues: ['体位不正'], status: '良好' },
  { id: 'RAD-EX006', patientName: '孙伟', device: 'MR-1（西门子Vida）', score: 90, issues: [], status: '优秀' },
  { id: 'RAD-EX007', patientName: '吴婷', device: 'DSA-1（飞利浦）', score: 80, issues: ['对比剂用量不足'], status: '一般' },
  { id: 'RAD-EX008', patientName: '郑丽', device: '乳腺钼靶', score: 94, issues: [], status: '优秀' },
]

// Timeout reports
const timeoutData = [
  { id: 'RAD-EX002', patientName: '李秀英', examItem: '头颅MR平扫', scheduledTime: '10:00', actualReportTime: '14:30', delayMinutes: 270, reason: 'MR设备维护延迟', severity: '严重' },
  { id: 'RAD-EX003', patientName: '王建国', examItem: '胸部DR正侧位', scheduledTime: '11:00', actualReportTime: '12:15', delayMinutes: 75, reason: '体检报告高峰积压', severity: '一般' },
  { id: 'RAD-EX004', patientName: '赵晓敏', examItem: '头颅CT平扫', scheduledTime: '12:00', actualReportTime: '15:45', delayMinutes: 225, reason: '急诊优先处理', severity: '严重' },
  { id: 'RAD-EX006', patientName: '孙伟', examItem: '腰椎MR平扫', scheduledTime: '15:00', actualReportTime: '18:00', delayMinutes: 180, reason: '报告医师临时会议', severity: '中等' },
]

// Dashboard metrics
const dashboardData = {
  passRate: 92,
  excellentRate: 65,
  avgScore: 87.3,
  totalReviewed: 156,
  trend7days: [
    { date: '04-25', score: 85.2, count: 22 },
    { date: '04-26', score: 86.8, count: 25 },
    { date: '04-27', score: 84.5, count: 20 },
    { date: '04-28', score: 88.1, count: 28 },
    { date: '04-29', score: 87.5, count: 23 },
    { date: '04-30', score: 89.2, count: 26 },
    { date: '05-01', score: 87.3, count: 12 },
  ],
  trend30days: Array.from({ length: 30 }, (_, i) => ({
    date: `04-${String(i + 1).padStart(2, '0')}`,
    score: 82 + Math.random() * 10,
    count: 18 + Math.floor(Math.random() * 12 ),
  })),
  issueDistribution: [
    { name: '运动伪影', value: 28, color: '#ef4444' },
    { name: '曝光不当', value: 22, color: '#f97316' },
    { name: '体位不正', value: 18, color: '#eab308' },
    { name: '对比剂问题', value: 12, color: '#22c55e' },
    { name: '设备故障', value: 8, color: '#3b82f6' },
    { name: '其他', value: 12, color: '#94a3b8' },
  ],
  weakLinks: ['报告及时性', '描述规范性', '危急值追踪'],
}

// QC Rules Settings
const qcRulesDefault = {
  reportTimeoutMinutes: 30,
  imageScoreExcellent: 90,
  imageScoreGood: 80,
  reminderBeforeMinutes: 10,
  autoEscalateAfterMinutes: 60,
  dailyReviewQuota: 20,
  peerReviewRate: 0.3,
}

const SCORE_COLORS = {
  '优秀': SUCCESS,
  '良好': WARNING,
  '一般': '#f97316',
  '差': DANGER,
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  '优秀': { bg: '#d1fae5', color: '#059669' },
  '良好': { bg: '#fef3c7', color: '#d97706' },
  '一般': { bg: '#fed7aa', color: '#c2410c' },
  '差': { bg: '#fee2e2', color: '#dc2626' },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#64748b']

export default function QCPage() {
  const [activeTab, setActiveTab] = useState('report')
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<typeof reportQCData[0] | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [qcRules, setQcRules] = useState({ ...qcRulesDefault })
  const [editingRules, setEditingRules] = useState(false)
  const [tempRules, setTempRules] = useState({ ...qcRulesDefault })
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d')
  const [filterStatus, setFilterStatus] = useState('全部')

  const filteredReports = reportQCData.filter(r => {
    const matchSearch = !search || r.patientName.includes(search) || r.id.includes(search)
    const matchStatus = filterStatus === '全部' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const imageFiltered = imageQCData.filter(i => {
    return !search || i.patientName.includes(search) || i.id.includes(search)
  })

  const handleOpenRating = (report: typeof reportQCData[0]) => {
    setSelectedReport(report)
    setShowRatingModal(true)
  }

  const handleSaveRules = () => {
    setQcRules({ ...tempRules })
    setEditingRules(false)
    alert('质控规则已保存')
  }

  const handleResetRules = () => {
    setTempRules({ ...qcRulesDefault })
  }

  const trendData = trendRange === '7d' ? dashboardData.trend7days : dashboardData.trend30days

  const statCardsReport = [
    { label: '今日审核数', value: reportQCData.filter(r => r.date === '2026-05-01').length, icon: <FileText size={18} color={ACCENT} />, bg: '#eff6ff', color: ACCENT },
    { label: '平均评分', value: '87.3', icon: <Star size={18} color={'#f59e0b'} />, bg: '#fef3c7', color: '#f59e0b' },
    { label: '超时审核数', value: timeoutData.length, icon: <Clock size={18} color={WARNING} />, bg: '#fef3c7', color: WARNING },
    { label: '优秀率', value: `${Math.round(reportQCData.filter(r => r.status === '优秀').length / reportQCData.length * 100)}%`, icon: <Award size={18} color={SUCCESS} />, bg: '#d1fae5', color: SUCCESS },
  ]

  const statCardsImage = [
    { label: '今日采集数', value: imageQCData.length, icon: <Camera size={18} color={ACCENT} />, bg: '#eff6ff', color: ACCENT },
    { label: '优秀率', value: `${Math.round(imageQCData.filter(i => i.status === '优秀').length / imageQCData.length * 100)}%`, icon: <Award size={18} color={SUCCESS} />, bg: '#d1fae5', color: SUCCESS },
    { label: '废片率', value: `${Math.round(imageQCData.filter(i => i.status === '差').length / imageQCData.length * 100)}%`, icon: <AlertTriangle size={18} color={DANGER} />, bg: '#fee2e2', color: DANGER },
    { label: '平均评分', value: '87.2', icon: <Star size={18} color={'#f59e0b'} />, bg: '#fef3c7', color: '#f59e0b' },
  ]

  const renderStars = (score: number, size: number = 14) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} fill={s <= score ? '#f59e0b' : 'none'} color={s <= score ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  )

  const renderScoreBar = (value: number, max: number = 100) => {
    const pct = (value / max) * 100
    const color = pct >= 90 ? SUCCESS : pct >= 80 ? WARNING : pct >= 70 ? '#f97316' : DANGER
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>{value}</span>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', background: '#f1f5f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: PRIMARY, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color='#fff' />
          </div>
          质量控制中心
          <span style={{ fontSize: 12, fontWeight: 400, color: GRAY, marginLeft: 8 }}>Quality Control Center</span>
        </h1>
        <p style={{ fontSize: 13, color: GRAY, margin: 0 }}>报告质量评分 · 影像质量控制 · 超时统计 · 质控指标仪表盘 · 规则设置</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: WHITE, borderRadius: 12, padding: '6px', marginBottom: 16, display: 'flex', gap: 4, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? PRIMARY : 'transparent',
                color: isActive ? WHITE : GRAY,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {statCardsReport.map(card => (
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

          {/* Search & Filter */}
          <div style={{ background: WHITE, borderRadius: 10, padding: 12, border: `1px solid ${BORDER}`, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: LIGHT_BG, borderRadius: 8, padding: '8px 12px' }}>
              <Search size={14} color={GRAY} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索患者姓名、报告ID..." style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', background: 'transparent', color: PRIMARY }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['全部', '优秀', '良好', '一般', '差'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '4px 12px', borderRadius: 16, border: `1px solid ${filterStatus === s ? ACCENT : BORDER}`, background: filterStatus === s ? ACCENT : WHITE, color: filterStatus === s ? WHITE : GRAY, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Report List */}
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                  {['报告ID', '患者姓名', '报告医生', '审核医生', '总分', '完整性', '准确性', '规范性', '及时性', '状态', '操作'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: PRIMARY, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? WHITE : '#fafbfc' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? WHITE : '#fafbfc'}
                  >
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: GRAY }}>{r.id}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: PRIMARY, fontSize: 13 }}>{r.patientName}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#334155' }}>{r.reportDoctor}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#334155' }}>{r.reviewDoctor}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: SCORE_COLORS[r.status as keyof typeof SCORE_COLORS] }}>{r.score}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{renderScoreBar(r.completeness)}</td>
                    <td style={{ padding: '10px 12px' }}>{renderScoreBar(r.accuracy)}</td>
                    <td style={{ padding: '10px 12px' }}>{renderScoreBar(r.standardization)}</td>
                    <td style={{ padding: '10px 12px' }}>{renderScoreBar(r.timeliness)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 10px', background: STATUS_COLORS[r.status]?.bg, color: STATUS_COLORS[r.status]?.color, borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button onClick={() => handleOpenRating(r)} style={{ padding: '4px 10px', background: '#eff6ff', color: ACCENT, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
                        <Eye size={12} />详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {statCardsImage.map(card => (
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

          {/* Image QC Table */}
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                  {['检查号', '患者', '设备', '影像评分', '主要问题', '状态', '操作'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: PRIMARY, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {imageFiltered.map((img, idx) => (
                  <tr key={img.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? WHITE : '#fafbfc' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? WHITE : '#fafbfc'}
                  >
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: GRAY }}>{img.id}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: PRIMARY, fontSize: 13 }}>{img.patientName}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#334155' }}>{img.device.split('（')[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: SCORE_COLORS[img.status as keyof typeof SCORE_COLORS] }}>{img.score}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {img.issues.length === 0 ? (
                          <span style={{ fontSize: 11, color: SUCCESS }}>无问题</span>
                        ) : img.issues.map(issue => (
                          <span key={issue} style={{ padding: '2px 6px', background: '#fee2e2', color: DANGER, borderRadius: 4, fontSize: 10 }}>{issue}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 10px', background: STATUS_COLORS[img.status]?.bg, color: STATUS_COLORS[img.status]?.color, borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                        {img.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button style={{ padding: '4px 10px', background: '#eff6ff', color: ACCENT, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
                        <Image size={12} />查看影像
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Waste Film Analysis Chart */}
          <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PieChart size={16} color={ACCENT} />废片问题类型分布
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
              <ResponsiveContainer width='100%' height={220}>
                <RechartsPie>
                  <Pie data={dashboardData.issueDistribution} cx='50%' cy='50%' innerRadius={55} outerRadius={90} paddingAngle={3} dataKey='value' label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {dashboardData.issueDistribution.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}例`} />
                </RechartsPie>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dashboardData.issueDistribution.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                    <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: PRIMARY, fontSize: 13 }}>{item.value}例</span>
                    <span style={{ fontSize: 12, color: GRAY }}>{Math.round(item.value / dashboardData.issueDistribution.reduce((s, i) => s + i.value, 0) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ background: WHITE, borderRadius: 10, padding: '16px 20px', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Clock size={18} color={WARNING} />
                <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>超时报告数</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: WARNING }}>{timeoutData.length}</div>
              <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>占今日报告 {(timeoutData.length / reportQCData.length * 100).toFixed(0)}%</div>
            </div>
            <div style={{ background: WHITE, borderRadius: 10, padding: '16px 20px', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={18} color={DANGER} />
                <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>严重超时</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: DANGER }}>{timeoutData.filter(t => t.severity === '严重').length}</div>
              <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>延迟超过3小时</div>
            </div>
            <div style={{ background: WHITE, borderRadius: 10, padding: '16px 20px', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TrendingUp size={18} color={ACCENT} />
                <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>平均延迟</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: ACCENT }}>{Math.round(timeoutData.reduce((s, t) => s + t.delayMinutes, 0) / timeoutData.length)}</div>
              <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>分钟/例</div>
            </div>
          </div>

          {/* Timeout List */}
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                  {['检查号', '患者', '检查项目', '计划时间', '实际报告', '延迟(分钟)', '超时原因', '严重程度'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: PRIMARY, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeoutData.map((t, idx) => {
                  const severityColor = t.severity === '严重' ? DANGER : t.severity === '中等' ? WARNING : GRAY
                  return (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? WHITE : '#fafbfc' }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: GRAY }}>{t.id}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: PRIMARY }}>{t.patientName}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#334155' }}>{t.examItem}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: GRAY }}>{t.scheduledTime}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: GRAY }}>{t.actualReportTime}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: t.delayMinutes > 180 ? DANGER : t.delayMinutes > 120 ? WARNING : GRAY }}>
                          {t.delayMinutes}′
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#334155' }}>{t.reason}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 10px', background: t.severity === '严重' ? '#fee2e2' : t.severity === '中等' ? '#fef3c7' : '#f1f5f9', color: severityColor, borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                          {t.severity}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Reason Analysis & Suggestions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} color={WARNING} />超时原因分析
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { reason: '设备维护/故障延迟', count: 1, pct: '25%' },
                  { reason: '报告医师临时会议/培训', count: 1, pct: '25%' },
                  { reason: '急诊优先导致积压', count: 1, pct: '25%' },
                  { reason: '体检高峰时段积压', count: 1, pct: '25%' },
                ].map(item => (
                  <div key={item.reason} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>{item.reason}</div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                        <div style={{ width: item.pct, height: '100%', background: WARNING, borderRadius: 3 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, minWidth: 40, textAlign: 'right' }}>{item.count}例</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={16} color={SUCCESS} />改进建议
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { suggestion: '建立设备预防性维护机制，减少突发故障', priority: '高' },
                  { suggestion: '会议/培训时间错开报告高峰时段', priority: '中' },
                  { suggestion: '增设体检报告快速通道', priority: '中' },
                  { suggestion: '优化急诊报告优先级调度算法', priority: '高' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: LIGHT_BG, borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: PRIMARY, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{item.suggestion}</div>
                    </div>
                    <span style={{ padding: '1px 8px', background: item.priority === '高' ? '#fee2e2' : '#fef3c7', color: item.priority === '高' ? DANGER : WARNING, borderRadius: 10, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: '达标率', value: `${dashboardData.passRate}%`, icon: <Target size={18} color={SUCCESS} />, bg: '#d1fae5', color: SUCCESS },
              { label: '优良率', value: `${dashboardData.excellentRate}%`, icon: <Award size={18} color={'#f59e0b'} />, bg: '#fef3c7', color: '#f59e0b' },
              { label: '总审核数', value: dashboardData.totalReviewed, icon: <FileText size={18} color={ACCENT} />, bg: '#eff6ff', color: ACCENT },
              { label: '综合评分', value: dashboardData.avgScore.toFixed(1), icon: <Star size={18} color={'#8b5cf6'} />, bg: '#ede9fe', color: '#8b5cf6' },
            ].map(card => (
              <div key={card.label} style={{ background: WHITE, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: GRAY }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Pass Rate Ring */}
            <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 16px' }}>达标率 / 优良率</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ResponsiveContainer width='100%' height={180}>
                  <RechartsPie>
                    <Pie data={[{ name: '达标', value: dashboardData.passRate }, { name: '未达标', value: 100 - dashboardData.passRate }]} cx='50%' cy='50%' innerRadius={50} outerRadius={75} dataKey='value'>
                      <Cell fill={SUCCESS} /><Cell fill='#e2e8f0' />
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </RechartsPie>
                </ResponsiveContainer>
                <ResponsiveContainer width='100%' height={180}>
                  <RechartsPie>
                    <Pie data={[{ name: '优良', value: dashboardData.excellentRate }, { name: '非优良', value: 100 - dashboardData.excellentRate }]} cx='50%' cy='50%' innerRadius={50} outerRadius={75} dataKey='value'>
                      <Cell fill={'#f59e0b'} /><Cell fill='#e2e8f0' />
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: SUCCESS }}>{dashboardData.passRate}%</div>
                  <div style={{ fontSize: 12, color: GRAY }}>达标率</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{dashboardData.excellentRate}%</div>
                  <div style={{ fontSize: 12, color: GRAY }}>优良率</div>
                </div>
              </div>
            </div>

            {/* Issue Distribution */}
            <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 16px' }}>影像质量问题分布</h3>
              <ResponsiveContainer width='100%' height={200}>
                <BarChart data={dashboardData.issueDistribution} layout='vertical'>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                  <XAxis type='number' tick={{ fontSize: 11, color: GRAY }} />
                  <YAxis dataKey='name' type='category' tick={{ fontSize: 11, color: GRAY }} width={80} />
                  <Tooltip formatter={(v) => `${v}例`} />
                  <Bar dataKey='value' radius={[0, 4, 4, 0]}>
                    {dashboardData.issueDistribution.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: 0 }}>评分趋势</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setTrendRange('7d')} style={{ padding: '4px 12px', borderRadius: 16, border: `1px solid ${trendRange === '7d' ? ACCENT : BORDER}`, background: trendRange === '7d' ? ACCENT : WHITE, color: trendRange === '7d' ? WHITE : GRAY, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>7天</button>
                <button onClick={() => setTrendRange('30d')} style={{ padding: '4px 12px', borderRadius: 16, border: `1px solid ${trendRange === '30d' ? ACCENT : BORDER}`, background: trendRange === '30d' ? ACCENT : WHITE, color: trendRange === '30d' ? WHITE : GRAY, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>30天</button>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={240}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                <XAxis dataKey='date' tick={{ fontSize: 11, color: GRAY }} />
                <YAxis domain={[75, 95]} tick={{ fontSize: 11, color: GRAY }} />
                <Tooltip formatter={(v, name) => [name === 'score' ? `${v}分` : `${v}份`, name === 'score' ? '评分' : '报告数']} />
                <Area type='monotone' dataKey='score' stroke={ACCENT} fill='#dbeafe' strokeWidth={2} name='score' />
                <Line type='monotone' dataKey='count' stroke={SUCCESS} strokeWidth={1.5} dot={false} name='count' />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weak Links & Target Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} color={WARNING} />薄弱环节提示
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dashboardData.weakLinks.map((link, idx) => (
                  <div key={link} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef3c7', borderRadius: 8, padding: '10px 14px' }}>
                    <AlertTriangle size={16} color={WARNING} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#92400e' }}>{link}</span>
                    <span style={{ fontSize: 11, color: WARNING }}>需改进</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={16} color={ACCENT} />质控目标 vs 实际达成
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '报告及时率', target: '95%', actual: '88%', color: DANGER },
                  { label: '优良率', target: '70%', actual: '65%', color: WARNING },
                  { label: '废片率', target: '<2%', actual: '1.8%', color: SUCCESS },
                  { label: '危急值10min内通知', target: '100%', actual: '96%', color: WARNING },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#334155' }}>{item.label}</span>
                      <span style={{ fontSize: 12, color: GRAY }}>目标: {item.target} | 实际: <span style={{ fontWeight: 700, color: item.color }}>{item.actual}</span></span>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, position: 'relative' }}>
                      <div style={{ height: '100%', borderRadius: 4, background: item.color, width: item.actual.replace('%', '') / parseFloat(item.target.replace('%', '').replace('<', '')) * 100 + '%', maxWidth: '100%', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
          {/* Report Timeout Settings */}
          <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color={ACCENT} />报告审核时限设置
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>报告超时时限（分钟）</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingRules ? (
                    <input type='number' value={tempRules.reportTimeoutMinutes} onChange={e => setTempRules({ ...tempRules, reportTimeoutMinutes: parseInt(e.target.value) || 0 })} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${ACCENT}`, fontSize: 13, outline: 'none' }} />
                  ) : (
                    <div style={{ flex: 1, padding: '8px 12px', background: LIGHT_BG, borderRadius: 8, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{qcRules.reportTimeoutMinutes} 分钟</div>
                  )}
                  <span style={{ fontSize: 12, color: GRAY }}>超时未审核自动提醒</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>提前提醒时间（分钟）</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingRules ? (
                    <input type='number' value={tempRules.reminderBeforeMinutes} onChange={e => setTempRules({ ...tempRules, reminderBeforeMinutes: parseInt(e.target.value) || 0 })} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${ACCENT}`, fontSize: 13, outline: 'none' }} />
                  ) : (
                    <div style={{ flex: 1, padding: '8px 12px', background: LIGHT_BG, borderRadius: 8, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{qcRules.reminderBeforeMinutes} 分钟</div>
                  )}
                  <span style={{ fontSize: 12, color: GRAY }}>超时前提醒</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>自动升级时间（分钟）</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingRules ? (
                    <input type='number' value={tempRules.autoEscalateAfterMinutes} onChange={e => setTempRules({ ...tempRules, autoEscalateAfterMinutes: parseInt(e.target.value) || 0 })} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${ACCENT}`, fontSize: 13, outline: 'none' }} />
                  ) : (
                    <div style={{ flex: 1, padding: '8px 12px', background: LIGHT_BG, borderRadius: 8, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{qcRules.autoEscalateAfterMinutes} 分钟</div>
                  )}
                  <span style={{ fontSize: 12, color: GRAY }}>超时后自动升级</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>每日审核配额</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingRules ? (
                    <input type='number' value={tempRules.dailyReviewQuota} onChange={e => setTempRules({ ...tempRules, dailyReviewQuota: parseInt(e.target.value) || 0 })} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${ACCENT}`, fontSize: 13, outline: 'none' }} />
                  ) : (
                    <div style={{ flex: 1, padding: '8px 12px', background: LIGHT_BG, borderRadius: 8, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{qcRules.dailyReviewQuota} 份/医生</div>
                  )}
                  <span style={{ fontSize: 12, color: GRAY }}>每人每日审核量</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Quality Standards */}
          <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Image size={16} color={ACCENT} />影像质量评分标准设置
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>优秀标准（≥X分）</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingRules ? (
                    <input type='number' value={tempRules.imageScoreExcellent} onChange={e => setTempRules({ ...tempRules, imageScoreExcellent: parseInt(e.target.value) || 0 })} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${ACCENT}`, fontSize: 13, outline: 'none' }} />
                  ) : (
                    <div style={{ flex: 1, padding: '8px 12px', background: LIGHT_BG, borderRadius: 8, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{qcRules.imageScoreExcellent} 分</div>
                  )}
                  <span style={{ fontSize: 12, color: GRAY }}>≥此分数为优秀</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, display: 'block', marginBottom: 6 }}>良好标准（≥X分）</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingRules ? (
                    <input type='number' value={tempRules.imageScoreGood} onChange={e => setTempRules({ ...tempRules, imageScoreGood: parseInt(e.target.value) || 0 })} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${ACCENT}`, fontSize: 13, outline: 'none' }} />
                  ) : (
                    <div style={{ flex: 1, padding: '8px 12px', background: LIGHT_BG, borderRadius: 8, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{qcRules.imageScoreGood} 分</div>
                  )}
                  <span style={{ fontSize: 12, color: GRAY }}>≥此分数为良好</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: '12px 14px', background: '#fef3c7', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>评分等级说明</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { level: '优秀', range: `≥${qcRules.imageScoreExcellent}分`, color: SUCCESS, bg: '#d1fae5' },
                  { level: '良好', range: `${qcRules.imageScoreGood}-${qcRules.imageScoreExcellent - 1}分`, color: WARNING, bg: '#fef3c7' },
                  { level: '一般', range: '70-79分', color: '#c2410c', bg: '#fed7aa' },
                  { level: '差', range: '<70分', color: DANGER, bg: '#fee2e2' },
                ].map(item => (
                  <div key={item.level} style={{ background: item.bg, borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.level}</div>
                    <div style={{ fontSize: 11, color: item.color, marginTop: 2 }}>{item.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QC Reminder Rules */}
          <div style={{ background: WHITE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={16} color={ACCENT} />质控提醒规则设置
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '报告超时提醒', enabled: true, desc: '报告超过设定时限未审核时自动提醒' },
                { label: '危急值追踪提醒', enabled: true, desc: '危急值报告发送后未确认时持续提醒' },
                { label: '质量评分预警', enabled: true, desc: '当评分低于阈值时向主管发送预警' },
                { label: '废片自动登记', enabled: false, desc: '影像质量评分低于70分时自动登记废片' },
                { label: '同行评审分配', enabled: true, desc: '按设定比例自动分配同行评审任务' },
              ].map((rule, idx) => (
                <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: LIGHT_BG, borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{rule.label}</div>
                    <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>{rule.desc}</div>
                  </div>
                  <div style={{ width: 44, height: 24, borderRadius: 12, background: rule.enabled ? SUCCESS : BORDER, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: WHITE, position: 'absolute', top: 2, left: rule.enabled ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save / Reset Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {editingRules ? (
              <>
                <button onClick={() => { setEditingRules(false); setTempRules({ ...qcRules }); }} style={{ padding: '8px 20px', background: WHITE, color: GRAY, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={14} />取消
                </button>
                <button onClick={handleSaveRules} style={{ padding: '8px 20px', background: PRIMARY, color: WHITE, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={14} />保存设置
                </button>
              </>
            ) : (
              <button onClick={() => { setEditingRules(true); setTempRules({ ...qcRules }); }} style={{ padding: '8px 20px', background: ACCENT, color: WHITE, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit3 size={14} />编辑规则
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: WHITE, borderRadius: 16, padding: 24, width: 500, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: PRIMARY, margin: 0 }}>报告评分详情</h3>
              <button onClick={() => setShowRatingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY, padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: LIGHT_BG, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div><div style={{ fontSize: 10, color: GRAY }}>报告ID</div><div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{selectedReport.id}</div></div>
                <div><div style={{ fontSize: 10, color: GRAY }}>患者</div><div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{selectedReport.patientName}</div></div>
                <div><div style={{ fontSize: 10, color: GRAY }}>总分</div><div style={{ fontSize: 14, fontWeight: 800, color: SCORE_COLORS[selectedReport.status as keyof typeof SCORE_COLORS] }}>{selectedReport.score}</div></div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { dimension: '完整性', score: selectedReport.completeness, key: 'completeness' },
                { dimension: '准确性', score: selectedReport.accuracy, key: 'accuracy' },
                { dimension: '规范性', score: selectedReport.standardization, key: 'standardization' },
                { dimension: '及时性', score: selectedReport.timeliness, key: 'timeliness' },
              ].map(item => (
                <div key={item.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{item.dimension}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: SCORE_COLORS[item.score >= 90 ? '优秀' : item.score >= 80 ? '良好' : '一般'] }}>{item.score}分</span>
                  </div>
                  {renderScoreBar(item.score)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRatingModal(false)} style={{ padding: '8px 24px', background: PRIMARY, color: WHITE, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
