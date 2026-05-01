// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 报告书写页面 v1.0.0
// 完全重写版：1000+行，完整模拟放射科诊断报告书写流程
// 参照GE Centricity/东软RIS/联影系统界面设计
// ============================================================
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, FileText, Save, Send, AlertTriangle, CheckCircle, BookOpen,
  ShieldAlert, Printer, Clock, X, Plus, Minus, ChevronDown, ChevronUp,
  Eye, Download, Upload, RefreshCw, Edit2, Trash2, Copy, Clipboard,
  Image, LayoutGrid, List, Filter, SortAsc, SortDesc, Check, AlertCircle,
  Info, Maximize2, ZoomIn, ZoomOut, RotateCcw, Settings, Bell, User,
  Calendar, Timer, Stethoscope, Activity, Heart, Brain, Bone as BoneIcon,
  ChevronRight, ChevronLeft, FolderOpen, FileCheck, ClipboardList,
  Target, Crosshair, Wifi, WifiOff, Clock3, Edit3, SaveAndPrint
} from 'lucide-react'
import {
  initialRadiologyExams,
  initialRadiologyReports,
  initialReportTemplates,
  initialTermLibrary,
  initialUsers,
  initialPatients,
} from '../data/initialData'
import type { RadiologyExam, ReportTemplate, TermLibrary, RadiologyReport } from '../types'

// ============================================================
// 样式常量 - CSS变量统一管理
// ============================================================
const s = {
  // 主色调
  primary: '#1e3a5f',
  primaryLight: '#2d5a8a',
  primaryDark: '#152a45',
  primaryBg: '#eff6ff',
  primaryBorder: '#bfdbfe',

  // 辅助色
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',

  // 语义色
  success: '#059669',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  info: '#2563eb',
  infoBg: '#eff6ff',
  infoBorder: '#bfdbfe',

  // 状态色
  statusPending: '#f59e0b',
  statusInProgress: '#3b82f6',
  statusCompleted: '#10b981',
  statusCancelled: '#6b7280',

  // 模态/设备色
  ctColor: '#3b82f6',
  mrColor: '#8b5cf6',
  drColor: '#10b981',
  dsaColor: '#f97316',
  mgColor: '#ec4899',

  // 阴影
  shadowSm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  shadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  shadowCard: '0 2px 8px rgba(30,58,95,0.08)',
  shadowCardHover: '0 4px 16px rgba(30,58,95,0.15)',

  // 圆角
  radiusSm: '4px',
  radius: '8px',
  radiusMd: '10px',
  radiusLg: '12px',
  radiusXl: '16px',

  // 字体
  fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}

// ============================================================
// 模板分类配置
// ============================================================
const TEMPLATE_CATEGORIES = [
  { label: 'CT头部', modality: 'CT', bodyPart: '头颅', color: s.ctColor, icon: Brain },
  { label: 'CT胸部', modality: 'CT', bodyPart: '胸部', color: s.ctColor, icon: Activity },
  { label: 'CT腹部', modality: 'CT', bodyPart: '腹部', color: s.ctColor, icon: Activity },
  { label: 'CT盆腔', modality: 'CT', bodyPart: '盆腔', color: s.ctColor, icon: Activity },
  { label: 'CT脊柱', modality: 'CT', bodyPart: '脊柱', color: s.ctColor, icon: Bone },
  { label: '冠脉CTA', modality: 'CT', bodyPart: '心脏', color: '#dc2626', icon: Heart },
  { label: 'MR头部', modality: 'MR', bodyPart: '头颅', color: s.mrColor, icon: Brain },
  { label: 'MR腹部', modality: 'MR', bodyPart: '腹部', color: s.mrColor, icon: Activity },
  { label: 'MR脊柱', modality: 'MR', bodyPart: '脊柱', color: s.mrColor, icon: Bone },
  { label: 'DR胸部', modality: 'DR', bodyPart: '胸部', color: s.drColor, icon: LungsIcon },
  { label: 'DR四肢', modality: 'DR', bodyPart: '四肢', color: s.drColor, icon: Bone },
  { label: 'DR腹部', modality: 'DR', bodyPart: '腹部', color: s.drColor, icon: Activity },
  { label: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部', color: s.mgColor, icon: Activity },
  { label: 'DSA冠脉', modality: 'DSA', bodyPart: '心脏', color: s.dsaColor, icon: Heart },
]

// ============================================================
// 危急值词库
// ============================================================
const CRITICAL_TERMS = [
  '大量气胸（肺组织压缩>50%）',
  '大量胸腔积液',
  '急性心肌梗死改变',
  '大面积脑梗死（超过一个脑叶）',
  '颅内出血（外伤性/自发性）',
  '主动脉夹层',
  '肺栓塞',
  '消化道穿孔',
  '肠系膜血栓',
  '急性胰腺炎坏死',
  '脾破裂',
  '肝破裂',
  '心包填塞',
  '张力性气胸',
]

// ============================================================
// 常用描述短语 - 按检查类型分类
// ============================================================
const COMMON_PHRASES: Record<string, { label: string; phrase: string }[]> = {
  CT: [
    { label: '脑实质密度均匀', phrase: '脑实质密度均匀，未见异常密度影。' },
    { label: '脑室系统正常', phrase: '脑室系统形态正常，无扩张或受压改变。' },
    { label: '中线居中', phrase: '中线结构居中，无偏移。' },
    { label: '未见骨折', phrase: '颅骨骨质完整，无骨折征象。' },
    { label: '肺纹理增粗', phrase: '双肺纹理增粗，排列紊乱。' },
    { label: '占位性病变', phrase: '可见团块状异常密度影，边界不清，周围组织受压推移。' },
    { label: '未见异常', phrase: '扫描范围内未见明显异常。' },
    { label: '胸腔积液', phrase: '双侧胸腔可见弧形水样密度影。' },
    { label: '肝囊肿', phrase: '肝内可见圆形水样低密度影，边界清晰。' },
    { label: '肾结石', phrase: '右/左侧肾盂内可见高密度影。' },
  ],
  MR: [
    { label: '未见异常信号', phrase: '脑实质内未见异常信号影。' },
    { label: 'DWI受限', phrase: 'DWI序列呈高信号，相应ADC值降低。' },
    { label: 'T1低T2高', phrase: '病灶呈长T1长T2信号。' },
    { label: '强化明显', phrase: '增强扫描病灶明显均匀/不均匀强化。' },
    { label: '脑膜强化', phrase: '脑膜可见线样强化。' },
    { label: '椎间盘突出', phrase: '相应椎间盘向后方突出，压迫硬膜囊。' },
    { label: '未见骨折', phrase: '所见椎体形态及信号未见异常。' },
  ],
  DR: [
    { label: '双肺清晰', phrase: '双肺野透亮度正常，肺纹理清晰。' },
    { label: '心影正常', phrase: '心影形态大小正常。' },
    { label: '肋膈角锐', phrase: '双侧肋膈角锐利。' },
    { label: '未见骨折', phrase: '所见肋骨骨质完整，无骨折征象。' },
    { label: '肺野异常', phrase: '右/左肺野可见片状密度增高影。' },
    { label: '胸腔积液', phrase: '右/左侧肋膈角变钝，可见弧形液平面。' },
  ],
}

// ============================================================
// 常用诊断短语
// ============================================================
const DIAGNOSIS_PHRASES = [
  { label: '未见明显异常', phrase: '未见明显异常。' },
  { label: '建议随访', phrase: '建议定期随访复查。' },
  { label: '建议增强', phrase: '建议进一步行增强扫描。' },
  { label: '建议CT', phrase: '建议行CT检查进一步评估。' },
  { label: '疑似良性', phrase: '考虑良性病变可能性大。' },
  { label: '疑似恶性', phrase: '不除外恶性可能，建议进一步检查。' },
  { label: '先天性变异', phrase: '考虑先天性发育变异。' },
  { label: '治疗后改变', phrase: '符合治疗后改变。' },
  { label: '退行性改变', phrase: '符合退行性改变。' },
  { label: '炎症可能', phrase: '考虑炎性病变可能。' },
]

// ============================================================
// 诊断结果选项
// ============================================================
const DIAGNOSIS_RESULT_OPTIONS = [
  { value: 'normal', label: '正常', color: s.success },
  { value: 'abnormal', label: '异常', color: s.warning },
  { value: 'suspicious_malignant', label: '疑似恶性', color: s.danger },
  { value: 'suspicious_benign', label: '疑似良性', color: s.info },
  { value: 'non_specific', label: '非特异性改变', color: s.gray500 },
]

// ============================================================
// 窗宽窗位预设
// ============================================================
const WWWL_PRESETS = [
  { label: '骨窗', ww: 2000, wl: 500, color: '#f59e0b' },
  { label: '肺窗', ww: 1200, wl: -600, color: '#10b981' },
  { label: '软组织', ww: 400, wl: 40, color: '#8b5cf6' },
  { label: '纵隔', ww: 350, wl: 50, color: '#ec4899' },
  { label: '脑组织', ww: 80, wl: 40, color: '#3b82f6' },
  { label: '肝脏', ww: 150, wl: 30, color: '#f97316' },
  { label: '血管', ww: 300, wl: 100, color: '#dc2626' },
]

// ============================================================
// 工具函数
// ============================================================
const formatDateTime = (date: Date = new Date()) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getModalityColor = (modality: string) => {
  const colors: Record<string, string> = {
    CT: s.ctColor,
    MR: s.mrColor,
    DR: s.drColor,
    DSA: s.dsaColor,
    '乳腺钼靶': s.mgColor,
    胃肠造影: '#f59e0b',
  }
  return colors[modality] || s.gray500
}

const getModalityBg = (modality: string) => {
  const colors: Record<string, string> = {
    CT: '#eff6ff',
    MR: '#f5f3ff',
    DR: '#ecfdf5',
    DSA: '#fff7ed',
    '乳腺钼靶': '#fdf2f8',
    胃肠造影: '#fef3c7',
  }
  return colors[modality] || s.gray100
}

// ============================================================
// 子组件：卡片容器
// ============================================================
interface CardProps {
  title?: string
  icon?: React.ReactNode
  extra?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
  headerStyle?: React.CSSProperties
  bodyStyle?: React.CSSProperties
  noPadding?: boolean
}

function Card({ title, icon, extra, children, style, headerStyle, bodyStyle, noPadding }: CardProps) {
  return (
    <div style={{
      background: s.white,
      borderRadius: s.radiusLg,
      border: `1px solid ${s.gray200}`,
      boxShadow: s.shadowCard,
      overflow: 'hidden',
      ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: `1px solid ${s.gray200}`,
          background: s.gray50,
          ...headerStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && <span style={{ color: s.primary }}>{icon}</span>}
            <span style={{ fontSize: 13, fontWeight: 700, color: s.primary }}>{title}</span>
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : 16, ...bodyStyle }}>
        {children}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：按钮
// ============================================================
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  disabled?: boolean
  fullWidth?: boolean
  style?: React.CSSProperties
}

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  fullWidth,
  style,
}: ButtonProps) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    borderRadius: s.radius,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...style,
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: 11 },
    md: { padding: '8px 14px', fontSize: 13 },
    lg: { padding: '10px 18px', fontSize: 14 },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: hover && !disabled ? (active ? s.primaryDark : s.primaryLight) : s.primary,
      color: s.white,
    },
    secondary: {
      background: hover && !disabled ? s.gray200 : s.gray100,
      color: s.gray700,
    },
    success: {
      background: hover && !disabled ? '#047857' : s.success,
      color: s.white,
    },
    danger: {
      background: hover && !disabled ? '#b91c1c' : s.danger,
      color: s.white,
    },
    ghost: {
      background: hover && !disabled ? s.gray100 : 'transparent',
      color: s.gray600,
    },
    outline: {
      background: hover && !disabled ? s.gray50 : s.white,
      color: s.gray700,
      border: `1px solid ${s.gray300}`,
    },
  }

  return (
    <button
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  )
}

// ============================================================
// 子组件：输入框
// ============================================================
interface InputProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number' | 'date' | 'time' | 'datetime-local'
  style?: React.CSSProperties
  disabled?: boolean
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

function Input({ value, onChange, placeholder, type = 'text', style, disabled, icon, suffix }: InputProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: s.gray50,
      border: `1px solid ${s.gray200}`,
      borderRadius: s.radius,
      padding: '6px 12px',
      ...style,
    }}>
      {icon && <span style={{ color: s.gray400, display: 'flex' }}>{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 13,
          background: 'transparent',
          width: '100%',
          color: s.gray700,
          fontFamily: 'inherit',
        }}
      />
      {suffix && <span>{suffix}</span>}
    </div>
  )
}

// ============================================================
// 子组件：标签徽章
// ============================================================
interface BadgeProps {
  children: React.ReactNode
  color?: string
  bg?: string
  size?: 'sm' | 'md'
}

function Badge({ children, color = s.white, bg = s.primary, size = 'sm' }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '2px 6px' : '3px 8px',
      borderRadius: s.radiusSm,
      fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 700,
      color,
      background: bg,
    }}>
      {children}
    </span>
  )
}

// ============================================================
// 子组件：模态弹窗
// ============================================================
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
  footer?: React.ReactNode
}

function Modal({ open, onClose, title, children, width = 600, footer }: ModalProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: s.white,
          borderRadius: s.radiusLg,
          boxShadow: s.shadowLg,
          width: Math.min(width, window.innerWidth - 40),
          maxHeight: window.innerHeight - 80,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: `1px solid ${s.gray200}`,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: s.primary }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: s.gray400,
              display: 'flex',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '12px 18px',
            borderTop: `1px solid ${s.gray200}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：患者信息头部
// ============================================================
interface PatientHeaderProps {
  exam: RadiologyExam
  onClose?: () => void
}

function PatientHeader({ exam, onClose }: PatientHeaderProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${s.primary} 0%, ${s.primaryLight} 100%)`,
      borderRadius: s.radiusLg,
      padding: '16px 20px',
      color: s.white,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 装饰性背景 */}
      <div style={{
        position: 'absolute',
        right: -20,
        top: -20,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute',
        right: 30,
        bottom: -30,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{exam.patientName}</span>
            <Badge bg="rgba(255,255,255,0.2)" color={s.white}>{exam.gender} / {exam.age}岁</Badge>
            <Badge bg={exam.patientType === '急诊' ? s.danger : exam.patientType === '住院' ? s.warning : s.info} color={s.white}>{exam.patientType}</Badge>
            {exam.priority !== '普通' && (
              <Badge bg={exam.priority === '危重' ? s.danger : s.warning} color={s.white}>
                <AlertTriangle size={10} style={{ marginRight: 3 }} />
                {exam.priority}
              </Badge>
            )}
          </div>
          <div style={{ fontSize: 11, fontFamily: s.fontMono, opacity: 0.8, marginBottom: 4 }}>
            Accession: {exam.accessionNumber}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {exam.clinicalDiagnosis || exam.clinicalHistory || '无临床诊断'}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              cursor: 'pointer',
              color: s.white,
              borderRadius: s.radius,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
            }}
          >
            <X size={14} /> 关闭
          </button>
        )}
      </div>

      {/* 信息网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        marginTop: 14,
        position: 'relative',
        zIndex: 1,
      }}>
        {[
          { label: '检查项目', value: exam.examItemName, icon: Stethoscope },
          { label: '检查设备', value: exam.deviceName?.split('（')[0] || '-', icon: Settings },
          { label: '检查日期', value: exam.examDate + (exam.examTime ? ' ' + exam.examTime : ''), icon: Calendar },
          { label: '影像数量', value: `${exam.imagesAcquired} 幅`, icon: Image },
          { label: '临床病史', value: (exam.clinicalHistory || '-').slice(0, 20), icon: ClipboardList },
          { label: '检查部位', value: exam.bodyPart, icon: Target },
          { label: '申请医生', value: '-', icon: User },
          { label: '登记时间', value: exam.createdTime, icon: Clock3 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: s.radius,
              padding: '8px 10px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
              <Icon size={10} style={{ opacity: 0.7 }} />
              <span style={{ fontSize: 10, opacity: 0.7 }}>{label}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：历史报告卡片
// ============================================================
interface HistoryReportProps {
  report: RadiologyReport
  onClick?: () => void
}

function HistoryReportCard({ report, onClick }: HistoryReportProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        border: `1px solid ${s.gray200}`,
        borderRadius: s.radius,
        padding: 10,
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'all 0.15s',
        background: s.white,
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = s.shadowCard
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{report.examItemName}</div>
          <div style={{ fontSize: 10, color: s.gray500, marginTop: 2 }}>
            {report.examDate} · {report.modality} · {report.deviceName?.split('（')[0]}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Badge
            bg={report.criticalFinding ? s.dangerBg : s.successBg}
            color={report.criticalFinding ? s.danger : s.success}
          >
            {report.criticalFinding ? '危急值' : '正常'}
          </Badge>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${s.gray200}` }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: s.gray500 }}>检查所见：</span>
            <p style={{ fontSize: 11, color: s.gray700, margin: '4px 0 0', lineHeight: 1.6 }}>
              {report.examFindings?.slice(0, 100)}...
            </p>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: s.gray500 }}>诊断意见：</span>
            <p style={{ fontSize: 11, color: s.gray700, margin: '4px 0 0', lineHeight: 1.6 }}>
              {report.diagnosis?.slice(0, 80)}...
            </p>
          </div>
          <div style={{ fontSize: 10, color: s.gray400 }}>
            报告医生：{report.reportDoctorName} · {report.signedTime}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 主组件：报告书写页面
// ============================================================
export default function ReportWritePage() {
  // ----------------------------------------
  // 状态定义
  // ----------------------------------------
  const [leftPanelWidth] = useState('60%')
  const [rightPanelWidth] = useState('40%')

  // 搜索和筛选
  const [examSearch, setExamSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalityFilter, setModalityFilter] = useState<string>('all')

  // 选中的检查
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [showExamList, setShowExamList] = useState(true)

  // 报告内容状态
  const [findings, setFindings] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [impressions, setImpressions] = useState<string[]>([''])
  const [recommendations, setRecommendations] = useState('')
  const [reportNotes, setReportNotes] = useState('')

  // 危急值状态
  const [criticalFinding, setCriticalFinding] = useState(false)
  const [criticalDetails, setCriticalDetails] = useState('')

  // 报告信息状态
  const [reportDoctorId, setReportDoctorId] = useState('')
  const [auditorId, setAuditorId] = useState('')
  const [reportDateTime, setReportDateTime] = useState(formatDateTime())

  // 诊断结果选项
  const [diagnosisResult, setDiagnosisResult] = useState('normal')

  // 模板状态
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  // 词库状态
  const [showTermLib, setShowTermLib] = useState(false)
  const [termSearch, setTermSearch] = useState('')
  const [termCategory, setTermCategory] = useState('all')

  // 图像预览状态
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [currentWwlPreset, setCurrentWwlPreset] = useState(WWWL_PRESETS[0])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [windowWidth, setWindowWidth] = useState(2000)
  const [windowLevel, setWindowLevel] = useState(500)

  // 参考图像标签页
  const [refTab, setRefTab] = useState<'typical' | 'history'>('typical')

  // 活跃标签页
  const [activeTab, setActiveTab] = useState<'findings' | 'diagnosis' | 'impression' | 'info'>('findings')

  // 保存状态
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // ----------------------------------------
  // 数据引用
  // ----------------------------------------
  const exams = initialRadiologyExams
  const reports = initialRadiologyReports
  const templates = initialReportTemplates
  const termLib = initialTermLibrary
  const patients = initialPatients
  const users = initialUsers

  // 医生列表
  const doctors = users.filter(u => u.role === 'radiologist')

  // ----------------------------------------
  // 计算属性
  // ----------------------------------------
  // 待报告的检查（检查已完成但尚未提交报告的）
  const pendingExams = useMemo(() => {
    return exams.filter(e => {
      // 状态为待报告或检查中（有图像）
      const statusMatch = ['待报告', '检查中'].includes(e.status)
      // 尚未提交报告
      const noReport = !reports.some(r => r.examId === e.id && r.status !== '已驳回')
      // 图像已采集
      const hasImages = e.imagesAcquired > 0
      return statusMatch && noReport && hasImages
    })
  }, [exams, reports])

  // 选中的检查
  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId)
  }, [exams, selectedExamId])

  // 筛选后的待报告列表
  const filteredPendingExams = useMemo(() => {
    return pendingExams.filter(e => {
      // 搜索过滤
      const searchMatch = !examSearch ||
        e.patientName.includes(examSearch) ||
        e.accessionNumber.includes(examSearch) ||
        e.examItemName.includes(examSearch)
      // 模态过滤
      const modalityMatch = modalityFilter === 'all' || e.modality === modalityFilter
      return searchMatch && modalityMatch
    })
  }, [pendingExams, examSearch, modalityFilter])

  // 患者历史报告
  const patientHistoryReports = useMemo(() => {
    if (!selectedExam) return []
    const patientId = selectedExam.patientId
    return reports
      .filter(r =>
        r.patientId === patientId &&
        r.examId !== selectedExamId &&
        r.modality === selectedExam.modality &&
        r.status === '已发布'
      )
      .sort((a, b) => (b.signedTime || '').localeCompare(a.signedTime || ''))
      .slice(0, 3)
  }, [selectedExam, selectedExamId, reports])

  // 筛选后的词库
  const filteredTerms = useMemo(() => {
    return termLib.filter(t => {
      const searchMatch = !termSearch ||
        t.keyword.includes(termSearch) ||
        t.fullTerm.includes(termSearch) ||
        t.category.includes(termSearch)
      return searchMatch
    }).slice(0, 30)
  }, [termSearch, termCategory])

  // 当前检查类型的模板
  const relevantTemplates = useMemo(() => {
    if (!selectedExam) return []
    return templates.filter(t =>
      t.modality === selectedExam.modality &&
      (t.bodyPart === selectedExam.bodyPart || !t.bodyPart)
    )
  }, [selectedExam, templates])

  // 当前检查类型的常用短语
  const relevantPhrases = useMemo(() => {
    if (!selectedExam) return []
    const modality = selectedExam.modality
    if (modality === 'CT' || modality === 'MR' || modality === 'DR') {
      return COMMON_PHRASES[modality] || []
    }
    return COMMON_PHRASES['CT'] || []
  }, [selectedExam])

  // 当前设备类型的模拟图像数量
  const imageCount = selectedExam?.imagesAcquired || 0

  // ----------------------------------------
  // 处理函数
  // ----------------------------------------

  // 选择检查
  const handleSelectExam = useCallback((examId: string) => {
    setSelectedExamId(examId)
    setShowExamList(false)
    // 重置报告内容
    setFindings('')
    setDiagnosis('')
    setImpressions([''])
    setRecommendations('')
    setReportNotes('')
    setCriticalFinding(false)
    setCriticalDetails('')
    setSelectedTemplateId('')
    setDiagnosisResult('normal')
    setReportDoctorId(doctors[0]?.id || '')
    setSaveSuccess(false)
    setLastSaved(null)
  }, [doctors])

  // 插入短语到当前激活的文本框
  const handleInsertPhrase = useCallback((phrase: string) => {
    if (activeTab === 'findings') {
      setFindings(prev => prev + phrase)
    } else if (activeTab === 'diagnosis') {
      setDiagnosis(prev => prev + phrase)
    } else if (activeTab === 'impression') {
      const lastIdx = impressions.length - 1
      setImpressions(prev => {
        const updated = [...prev]
        updated[lastIdx] = (updated[lastIdx] || '') + phrase
        return updated
      })
    }
  }, [activeTab, impressions])

  // 添加印象行
  const handleAddImpression = useCallback(() => {
    setImpressions(prev => [...prev, ''])
  }, [])

  // 删除印象行
  const handleRemoveImpression = useCallback((index: number) => {
    setImpressions(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 更新印象行
  const handleUpdateImpression = useCallback((index: number, value: string) => {
    setImpressions(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }, [])

  // 应用模板
  const handleApplyTemplate = useCallback((template: ReportTemplate) => {
    // 解析模板内容 - 提取各部分
    const content = template.content || ''
    const sections = content.split('\n\n')

    // 简单处理：假设第一部分是检查所见，最后是结论
    let findingsContent = ''
    let diagnosisContent = ''
    let impressionContent = ''

    sections.forEach(section => {
      if (section.includes('结论')) {
        impressionContent = section.replace(/结论[：:]\s*/g, '')
      } else if (section.length > 20) {
        findingsContent += section + '\n\n'
      } else {
        diagnosisContent += section + '\n'
      }
    })

    if (!impressionContent && content.includes('结论')) {
      const conclusionMatch = content.match(/结论[：:]\s*([\s\S]*?)$/)
      if (conclusionMatch) {
        impressionContent = conclusionMatch[1]
      }
    }

    setFindings(findingsContent.trim())
    setDiagnosis(diagnosisContent.trim())
    setImpressions(impressionContent ? [impressionContent.trim()] : [''])
    setSelectedTemplateId(template.id)
    setShowTemplateModal(false)
  }, [])

  // 保存报告（草稿）
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    setSaveSuccess(true)
    setLastSaved(formatDateTime())
  }, [findings, diagnosis, impressions, recommendations, criticalFinding, criticalDetails])

  // 提交报告
  const handleSubmitReport = useCallback(async () => {
    if (!findings.trim()) {
      alert('请填写检查所见')
      return
    }
    if (!diagnosis.trim()) {
      alert('请填写诊断意见')
      return
    }

    setIsSubmitting(true)
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert('报告已提交，待审核')
    // 可以在这里重置状态或跳转
  }, [findings, diagnosis, impressions])

  // 打印预览
  const handlePrintPreview = useCallback(() => {
    setShowPrintPreview(true)
  }, [])

  // 导出PDF（模拟）
  const handleExportPdf = useCallback(() => {
    alert('PDF导出功能（模拟）')
  }, [])

  // 复制报告
  const handleCopyReport = useCallback(() => {
    const text = `
检查所见：
${findings}

诊断意见：
${diagnosis}

印象：
${impressions.filter(i => i.trim()).join('\n')}

建议：
${recommendations}
    `.trim()
    navigator.clipboard.writeText(text)
    alert('报告已复制到剪贴板')
  }, [findings, diagnosis, impressions, recommendations])

  // 切换窗宽窗位
  const handleWwlChange = useCallback((preset: typeof WWW_L_PRESETS[0]) => {
    setCurrentWwlPreset(preset)
    setWindowWidth(preset.ww)
    setWindowLevel(preset.wl)
  }, [])

  // ----------------------------------------
  // 渲染：检查列表项
  // ----------------------------------------
  const renderExamItem = (exam: RadiologyExam) => {
    const modalityColor = getModalityColor(exam.modality)
    const modalityBg = getModalityBg(exam.modality)

    return (
      <div
        key={exam.id}
        onClick={() => handleSelectExam(exam.id)}
        style={{
          padding: '12px 14px',
          borderRadius: s.radius,
          marginBottom: 8,
          cursor: 'pointer',
          border: `1px solid ${s.gray200}`,
          background: s.white,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
          ;(e.currentTarget as HTMLDivElement).style.background = s.primaryBg
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = s.shadowCard
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
          ;(e.currentTarget as HTMLDivElement).style.background = s.white
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* 头部：患者名 + 模态 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: s.primary }}>{exam.patientName}</span>
            <span style={{ fontSize: 11, color: s.gray500 }}>{exam.gender}/{exam.age}岁</span>
          </div>
          <Badge bg={modalityBg} color={modalityColor}>{exam.modality}</Badge>
        </div>

        {/* 信息行 */}
        <div style={{ fontSize: 12, color: s.gray600, marginBottom: 4 }}>
          {exam.examItemName} · {exam.deviceName?.split('（')[0]}
        </div>

        {/* 底部信息 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: s.gray400 }}>
            <span style={{ fontFamily: s.fontMono }}>{exam.accessionNumber}</span>
            <span style={{ marginLeft: 8 }}>{exam.examDate}</span>
          </div>
          <Badge
            bg={exam.priority === '危重' ? s.dangerBg : exam.priority === '紧急' ? s.warningBg : s.gray100}
            color={exam.priority === '危重' ? s.danger : exam.priority === '紧急' ? s.warning : s.gray500}
            size="sm"
          >
            {exam.priority}
          </Badge>
        </div>

        {/* 临床信息 */}
        {(exam.clinicalDiagnosis || exam.clinicalHistory) && (
          <div style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: `1px dashed ${s.gray200}`,
            fontSize: 10,
            color: s.gray500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {exam.clinicalDiagnosis || exam.clinicalHistory}
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------
  // 渲染：报告书写表单
  // ----------------------------------------
  const renderReportForm = () => {
    if (!selectedExam) return null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 患者信息头部 */}
        <PatientHeader exam={selectedExam} onClose={() => {
          setSelectedExamId('')
          setShowExamList(true)
        }} />

        {/* 历史报告参考 */}
        {patientHistoryReports.length > 0 && (
          <Card
            title="历史报告参考"
            icon={<Clock size={14} />}
            extra={
              <span style={{ fontSize: 10, color: s.gray400 }}>
                同部位检查 {patientHistoryReports.length} 条
              </span>
            }
          >
            <div style={{ maxHeight: 160, overflowY: 'auto' }}>
              {patientHistoryReports.map(report => (
                <HistoryReportCard key={report.id} report={report} />
              ))}
            </div>
          </Card>
        )}

        {/* 模板选择区 */}
        <Card
          title="报告模板"
          icon={<FileCheck size={14} />}
          extra={
            <Button
              variant="ghost"
              size="sm"
              icon={<LayoutGrid size={12} />}
              onClick={() => setShowTemplateModal(true)}
            >
              全部模板
            </Button>
          }
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {relevantTemplates.slice(0, 6).map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl)}
                style={{
                  padding: '6px 12px',
                  borderRadius: s.radius,
                  border: `1px solid ${selectedTemplateId === tpl.id ? s.primaryBorder : s.gray200}`,
                  background: selectedTemplateId === tpl.id ? s.primaryBg : s.white,
                  color: selectedTemplateId === tpl.id ? s.primary : s.gray600,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s',
                }}
              >
                {selectedTemplateId === tpl.id && <Check size={12} />}
                {tpl.name}
              </button>
            ))}
            {relevantTemplates.length === 0 && (
              <div style={{ fontSize: 12, color: s.gray400, padding: 8 }}>
                暂无适用模板
              </div>
            )}
          </div>
        </Card>

        {/* 报告编辑器 */}
        <Card title="报告内容" icon={<Edit3 size={14} />}>
          {/* 标签切换 */}
          <div style={{
            display: 'flex',
            gap: 0,
            marginBottom: 14,
            borderBottom: `2px solid ${s.gray200}`,
          }}>
            {[
              { key: 'findings', label: '检查所见', count: findings.length },
              { key: 'diagnosis', label: '诊断意见', count: diagnosis.length },
              { key: 'impression', label: '印象/结论', count: impressions.join('').length },
              { key: 'info', label: '报告信息', count: 0 },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === key ? s.primary : 'transparent'}`,
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeTab === key ? s.primary : s.gray500,
                  marginBottom: -2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    fontSize: 10,
                    background: activeTab === key ? s.primaryBg : s.gray100,
                    color: activeTab === key ? s.primary : s.gray400,
                    padding: '1px 5px',
                    borderRadius: 10,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 检查所见 */}
          {activeTab === 'findings' && (
            <div>
              {/* 常用短语工具栏 */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
                  常用描述短语
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {relevantPhrases.map(({ label, phrase }) => (
                    <button
                      key={label}
                      onClick={() => handleInsertPhrase(phrase)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: s.radiusSm,
                        border: `1px solid ${s.gray200}`,
                        background: s.gray50,
                        color: s.gray600,
                        fontSize: 11,
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = s.primaryBorder
                        ;(e.currentTarget as HTMLButtonElement).style.background = s.primaryBg
                        ;(e.currentTarget as HTMLButtonElement).style.color = s.primary
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = s.gray200
                        ;(e.currentTarget as HTMLButtonElement).style.background = s.gray50
                        ;(e.currentTarget as HTMLButtonElement).style.color = s.gray600
                      }}
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文本框 */}
              <textarea
                value={findings}
                onChange={e => setFindings(e.target.value)}
                placeholder="【检查所见】&#10;&#10;请在此处详细描述影像所见，包括：&#10;• 扫描范围及技术参数&#10;• 各脏器/组织密度/信号描述&#10;• 发现病变的部位、大小、形态、边界、密度/信号特征&#10;• 与周围组织的关系&#10;• ..."

                style={{
                  width: '100%',
                  minHeight: 200,
                  border: `1px solid ${s.gray200}`,
                  borderRadius: s.radius,
                  padding: '12px 14px',
                  fontSize: 13,
                  lineHeight: 1.8,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: s.gray700,
                }}
                onFocus={e => {
                  e.target.style.borderColor = s.primaryBorder
                  e.target.style.boxShadow = `0 0 0 3px ${s.primaryBg}`
                }}
                onBlur={e => {
                  e.target.style.borderColor = s.gray200
                  e.target.style.boxShadow = 'none'
                }}
              />

              {/* 底部工具栏 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Copy size={12} />}
                    onClick={() => {
                      navigator.clipboard.writeText(findings)
                    }}
                  >
                    复制
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={12} />}
                    onClick={() => setFindings('')}
                  >
                    清空
                  </Button>
                </div>
                <div style={{ fontSize: 11, color: s.gray400 }}>
                  {findings.length} 字符
                </div>
              </div>
            </div>
          )}

          {/* 诊断意见 */}
          {activeTab === 'diagnosis' && (
            <div>
              {/* 诊断结果选择 */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 8 }}>
                  诊断结果
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DIAGNOSIS_RESULT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDiagnosisResult(opt.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: s.radius,
                        border: `1px solid ${diagnosisResult === opt.value ? opt.color : s.gray200}`,
                        background: diagnosisResult === opt.value ? `${opt.color}15` : s.white,
                        color: diagnosisResult === opt.value ? opt.color : s.gray500,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s',
                      }}
                    >
                      {diagnosisResult === opt.value && (
                        <Check size={12} style={{ color: opt.color }} />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 常用诊断短语 */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
                  常用诊断短语
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIAGNOSIS_PHRASES.map(({ label, phrase }) => (
                    <button
                      key={label}
                      onClick={() => handleInsertPhrase(phrase)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: s.radiusSm,
                        border: `1px solid ${s.gray200}`,
                        background: s.gray50,
                        color: s.gray600,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文本框 */}
              <textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="【诊断意见】&#10;&#10;请在此处填写诊断结论：&#10;• 明确诊断&#10;• 疑似诊断（请注明不能明确的原因）&#10;• 鉴别诊断（必要时）"

                style={{
                  width: '100%',
                  minHeight: 160,
                  border: `1px solid ${s.gray200}`,
                  borderRadius: s.radius,
                  padding: '12px 14px',
                  fontSize: 13,
                  lineHeight: 1.8,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: s.gray700,
                }}
                onFocus={e => {
                  e.target.style.borderColor = s.primaryBorder
                  e.target.style.boxShadow = `0 0 0 3px ${s.primaryBg}`
                }}
                onBlur={e => {
                  e.target.style.borderColor = s.gray200
                  e.target.style.boxShadow = 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={12} />}
                    onClick={() => setDiagnosis('')}
                  >
                    清空
                  </Button>
                </div>
                <div style={{ fontSize: 11, color: s.gray400 }}>
                  {diagnosis.length} 字符
                </div>
              </div>
            </div>
          )}

          {/* 印象/结论 */}
          {activeTab === 'impression' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 8 }}>
                检查印象/结论（可添加多条，按优先级排序）
              </div>

              {/* 印象列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {impressions.map((imp, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: s.primary,
                      color: s.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 6,
                    }}>
                      {idx + 1}
                    </div>
                    <textarea
                      value={imp}
                      onChange={e => handleUpdateImpression(idx, e.target.value)}
                      placeholder={`印象 ${idx + 1}...`}
                      style={{
                        flex: 1,
                        minHeight: 60,
                        border: `1px solid ${s.gray200}`,
                        borderRadius: s.radius,
                        padding: '8px 12px',
                        fontSize: 13,
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                        color: s.gray700,
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = s.primaryBorder
                        e.target.style.boxShadow = `0 0 0 3px ${s.primaryBg}`
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = s.gray200
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    {impressions.length > 1 && (
                      <button
                        onClick={() => handleRemoveImpression(idx)}
                        style={{
                          border: 'none',
                          background: s.dangerBg,
                          color: s.danger,
                          borderRadius: s.radius,
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          marginTop: 6,
                        }}
                      >
                        <Minus size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 添加按钮 */}
              <button
                onClick={handleAddImpression}
                style={{
                  marginTop: 10,
                  padding: '8px 14px',
                  borderRadius: s.radius,
                  border: `1px dashed ${s.gray300}`,
                  background: s.gray50,
                  color: s.gray500,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Plus size={14} /> 添加印象
              </button>

              {/* 建议 */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 8 }}>
                  建议
                </div>
                <textarea
                  value={recommendations}
                  onChange={e => setRecommendations(e.target.value)}
                  placeholder="填写检查建议，如：&#10;• 建议定期随访复查&#10;• 建议进一步行增强扫描&#10;• 建议专科就诊"

                  style={{
                    width: '100%',
                    minHeight: 80,
                    border: `1px solid ${s.gray200}`,
                    borderRadius: s.radius,
                    padding: '10px 12px',
                    fontSize: 13,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: s.gray700,
                  }}
                />
              </div>
            </div>
          )}

          {/* 报告信息 */}
          {activeTab === 'info' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* 报告医生 */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    报告医生
                  </label>
                  <select
                    value={reportDoctorId}
                    onChange={e => setReportDoctorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 13,
                      background: s.white,
                      color: s.gray700,
                      cursor: 'pointer',
                    }}
                  >
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}（{doc.title}）
                      </option>
                    ))}
                  </select>
                </div>

                {/* 审核医生 */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    审核医生
                  </label>
                  <select
                    value={auditorId}
                    onChange={e => setAuditorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 13,
                      background: s.white,
                      color: s.gray700,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">待审核</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}（{doc.title}）
                      </option>
                    ))}
                  </select>
                </div>

                {/* 报告日期时间 */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    报告日期时间
                  </label>
                  <input
                    type="datetime-local"
                    value={reportDateTime.replace(/\//g, '-')}
                    onChange={e => setReportDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 13,
                      color: s.gray700,
                    }}
                  />
                </div>

                {/* 报告备注 */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    报告备注
                  </label>
                  <textarea
                    value={reportNotes}
                    onChange={e => setReportNotes(e.target.value)}
                    placeholder="填写补充说明，如：检查局限性、患者配合情况等..."

                    style={{
                      width: '100%',
                      minHeight: 60,
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      padding: '8px 12px',
                      fontSize: 13,
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      color: s.gray700,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 危急值标注 */}
        <Card
          title="危急值标注"
          icon={<ShieldAlert size={14} />}
          style={{
            border: criticalFinding ? `1px solid ${s.dangerBorder}` : undefined,
            background: criticalFinding ? s.dangerBg : undefined,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: criticalFinding ? 12 : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: s.danger }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: s.danger }}>
                发现危急值
              </span>
            </div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 12, color: s.gray500 }}>
                {criticalFinding ? '已启用' : '未启用'}
              </span>
              <div
                onClick={() => setCriticalFinding(!criticalFinding)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: criticalFinding ? s.danger : s.gray300,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: s.white,
                  position: 'absolute',
                  top: 2,
                  left: criticalFinding ? 22 : 2,
                  transition: 'all 0.2s',
                  boxShadow: s.shadow,
                }} />
              </div>
            </label>
          </div>

          {criticalFinding && (
            <div>
              {/* 危急值详情 */}
              <textarea
                value={criticalDetails}
                onChange={e => setCriticalDetails(e.target.value)}
                placeholder="请详细描述危急值情况，包括：&#10;• 病变描述&#10;• 严重程度&#10;• 建议处理措施..."

                style={{
                  width: '100%',
                  minHeight: 80,
                  border: `1px solid ${s.dangerBorder}`,
                  borderRadius: s.radius,
                  padding: '10px 12px',
                  fontSize: 13,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: s.gray700,
                  background: s.white,
                }}
              />

              {/* 常用危急值词条 */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.danger, marginBottom: 6 }}>
                  常用危急值描述
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CRITICAL_TERMS.map(term => (
                    <button
                      key={term}
                      onClick={() => setCriticalDetails(prev => prev + (prev ? '\n' : '') + term)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: s.radiusSm,
                        border: `1px solid ${s.dangerBorder}`,
                        background: '#fee2e2',
                        color: s.danger,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      + {term.slice(0, 10)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 提示 */}
              <div style={{
                marginTop: 12,
                padding: '8px 12px',
                background: '#fef2f2',
                borderRadius: s.radius,
                fontSize: 11,
                color: s.danger,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Info size={12} />
                勾选危急值后，系统将自动通知临床医生和相关部门
              </div>
            </div>
          )}
        </Card>

        {/* 操作按钮区 */}
        <div style={{
          background: s.white,
          borderRadius: s.radiusLg,
          border: `1px solid ${s.gray200}`,
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: s.shadowCard,
        }}>
          {/* 左侧状态 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {saveSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: s.success,
                fontSize: 12,
              }}>
                <CheckCircle size={14} />
                <span>已保存 {lastSaved}</span>
              </div>
            )}
          </div>

          {/* 右侧按钮 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="outline"
              size="md"
              icon={<Printer size={14} />}
              onClick={handlePrintPreview}
            >
              打印预览
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Download size={14} />}
              onClick={handleExportPdf}
            >
              导出PDF
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              保存草稿
            </Button>
            <Button
              variant="success"
              size="md"
              icon={isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              onClick={handleSubmitReport}
              disabled={isSubmitting}
            >
              提交审核
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------
  // 渲染：右侧面板 - 图像预览
  // ----------------------------------------
  const renderRightPanel = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 图像预览区 */}
        <Card
          title="图像预览"
          icon={<Image size={14} />}
          extra={
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                style={{
                  border: 'none',
                  background: s.gray100,
                  borderRadius: s.radiusSm,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomOut size={12} />
              </button>
              <span style={{ fontSize: 11, padding: '3px 6px', color: s.gray500 }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                style={{
                  border: 'none',
                  background: s.gray100,
                  borderRadius: s.radiusSm,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={() => setShowImageViewer(true)}
                style={{
                  border: 'none',
                  background: s.primaryBg,
                  borderRadius: s.radiusSm,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: s.primary,
                }}
              >
                <Maximize2 size={12} />
              </button>
            </div>
          }
        >
          {/* 窗宽窗位预设 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
              窗宽/窗位
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {WWWL_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleWwlChange(preset)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: s.radiusSm,
                    border: `1px solid ${currentWwlPreset.label === preset.label ? preset.color : s.gray200}`,
                    background: currentWwlPreset.label === preset.label ? `${preset.color}15` : s.white,
                    color: currentWwlPreset.label === preset.label ? preset.color : s.gray600,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: s.gray400, marginTop: 4 }}>
              WW: {windowWidth} / WL: {windowLevel}
            </div>
          </div>

          {/* 主图像区 */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => setShowImageViewer(true)}
          >
            {/* DICOM模拟图像 */}
            <div style={{
              width: '80%',
              height: '80%',
              background: `repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              )`,
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: s.radiusSm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* 模拟CT切片图像 */}
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ opacity: 0.7 }}>
                <ellipse cx="100" cy="75" rx="70" ry="60" fill="#4a4a6a" />
                <ellipse cx="100" cy="75" rx="50" ry="45" fill="#3a3a5a" />
                <ellipse cx="85" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="115" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="100" cy="85" rx="15" ry="10" fill="#5a5a7a" />
              </svg>

              {/* 角标 */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                CT: {selectedExam?.modality || 'CT'}
              </div>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                W: {windowWidth} L: {windowLevel}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedExam?.accessionNumber || 'N/A'}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedImageIndex + 1}/{imageCount}
              </div>
            </div>
          </div>

          {/* 缩略图列表 */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
              序列缩略图 ({imageCount > 0 ? imageCount : '无'} 幅)
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {imageCount > 0 ? (
                Array.from({ length: Math.min(imageCount, 8) }).map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: 56,
                      height: 44,
                      flexShrink: 0,
                      background: `linear-gradient(135deg, #2a2a4a, #3a3a6a)`,
                      borderRadius: s.radiusSm,
                      border: `2px solid ${selectedImageIndex === idx ? s.primary : 'transparent'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: s.fontMono,
                    }}
                  >
                    {idx + 1}
                  </div>
                ))
              ) : (
                <div style={{
                  width: '100%',
                  padding: 20,
                  textAlign: 'center',
                  color: s.gray400,
                  fontSize: 12,
                  background: s.gray50,
                  borderRadius: s.radius,
                }}>
                  暂无图像
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 参考图像区 */}
        <Card
          title="参考图像"
          icon={<FolderOpen size={14} />}
        >
          {/* 标签切换 */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            borderBottom: `1px solid ${s.gray200}`,
          }}>
            <button
              onClick={() => setRefTab('typical')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderBottom: `2px solid ${refTab === 'typical' ? s.primary : 'transparent'}`,
                background: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: refTab === 'typical' ? s.primary : s.gray500,
              }}
            >
              典型病例
            </button>
            <button
              onClick={() => setRefTab('history')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderBottom: `2px solid ${refTab === 'history' ? s.primary : 'transparent'}`,
                background: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: refTab === 'history' ? s.primary : s.gray500,
              }}
            >
              历史图像
            </button>
          </div>

          {refTab === 'typical' && (
            <div style={{
              height: 140,
              background: s.gray50,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}>
              <Activity size={24} style={{ color: s.gray300 }} />
              <span style={{ fontSize: 11, color: s.gray400 }}>
                同部位典型病例参考图
              </span>
              <span style={{ fontSize: 10, color: s.gray300 }}>
                接入影像云后可查看
              </span>
            </div>
          )}

          {refTab === 'history' && (
            <div style={{
              height: 140,
              background: s.gray50,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}>
              <Clock size={24} style={{ color: s.gray300 }} />
              <span style={{ fontSize: 11, color: s.gray400 }}>
                该患者历史检查图像
              </span>
              <span style={{ fontSize: 10, color: s.gray300 }}>
                {patientHistoryReports.length > 0 ? `${patientHistoryReports.length} 条历史记录` : '暂无历史图像'}
              </span>
            </div>
          )}
        </Card>

        {/* 模板选择区 */}
        <Card
          title="快速模板"
          icon={<FileText size={14} />}
          extra={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateModal(true)}
            >
              全部
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TEMPLATE_CATEGORIES.filter(t => !selectedExam || t.modality === selectedExam.modality).slice(0, 8).map(tpl => {
              const Icon = tpl.icon
              return (
                <button
                  key={tpl.label}
                  onClick={() => {
                    const found = templates.find(t =>
                      t.modality === tpl.modality &&
                      (t.bodyPart === tpl.bodyPart || !t.bodyPart)
                    )
                    if (found) handleApplyTemplate(found)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: s.radius,
                    border: `1px solid ${s.gray200}`,
                    background: s.white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = tpl.color
                    ;(e.currentTarget as HTMLButtonElement).style.background = `${tpl.color}08`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = s.gray200
                    ;(e.currentTarget as HTMLButtonElement).style.background = s.white
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: s.radiusSm,
                    background: `${tpl.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={14} style={{ color: tpl.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.gray700 }}>{tpl.label}</div>
                    <div style={{ fontSize: 10, color: s.gray400 }}>{tpl.modality} · {tpl.bodyPart}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* 词库快捷 */}
        {showTermLib && (
          <Card
            title="报告词库"
            icon={<BookOpen size={14} />}
            extra={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTermLib(false)}
              >
                <X size={12} />
              </Button>
            }
          >
            <Input
              value={termSearch}
              onChange={setTermSearch}
              placeholder="搜索词条..."
              icon={<Search size={12} />}
              style={{ marginBottom: 10 }}
            />
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filteredTerms.map(term => (
                <div
                  key={term.id}
                  onClick={() => handleInsertPhrase(term.typicalFindings || term.fullTerm)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: s.radius,
                    marginBottom: 4,
                    cursor: 'pointer',
                    border: `1px solid ${s.gray200}`,
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
                    ;(e.currentTarget as HTMLDivElement).style.background = s.primaryBg
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
                    ;(e.currentTarget as HTMLDivElement).style.background = s.white
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{term.fullTerm}</div>
                  <div style={{ fontSize: 10, color: s.gray400, marginTop: 2 }}>{term.typicalDiagnosis || term.category}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  // ----------------------------------------
  // 渲染：模板选择模态框
  // ----------------------------------------
  const renderTemplateModal = () => {
    return (
      <Modal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="选择报告模板"
        width={700}
      >
        {/* 分类筛选 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶'].map(mod => (
              <button
                key={mod}
                onClick={() => setModalityFilter(mod === 'all' ? 'all' : mod)}
                style={{
                  padding: '6px 14px',
                  borderRadius: s.radius,
                  border: `1px solid ${modalityFilter === mod ? s.primaryBorder : s.gray200}`,
                  background: modalityFilter === mod ? s.primaryBg : s.white,
                  color: modalityFilter === mod ? s.primary : s.gray600,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {mod === 'all' ? '全部' : mod}
              </button>
            ))}
          </div>
        </div>

        {/* 模板列表 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          maxHeight: 400,
          overflowY: 'auto',
        }}>
          {templates
            .filter(t => modalityFilter === 'all' || t.modality === modalityFilter)
            .map(tpl => {
              const tplCategory = TEMPLATE_CATEGORIES.find(
                tc => tc.modality === tpl.modality && tc.bodyPart === tpl.bodyPart
              )
              const color = tplCategory?.color || s.gray500

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: s.radius,
                    border: `1px solid ${selectedTemplateId === tpl.id ? color : s.gray200}`,
                    background: selectedTemplateId === tpl.id ? `${color}08` : s.white,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (selectedTemplateId !== tpl.id) {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedTemplateId !== tpl.id) {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.primary }}>{tpl.name}</span>
                    <Badge bg={getModalityBg(tpl.modality)} color={getModalityColor(tpl.modality)}>
                      {tpl.modality}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 11, color: s.gray500 }}>
                    {tpl.bodyPart} · {tpl.category}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: s.gray400,
                    marginTop: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tpl.content?.slice(0, 60)}...
                  </div>
                </div>
              )
            })}
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // 渲染：打印预览模态框
  // ----------------------------------------
  const renderPrintPreview = () => {
    if (!selectedExam) return null

    const currentDoctor = doctors.find(d => d.id === reportDoctorId)

    return (
      <Modal
        open={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="打印预览"
        width={700}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
              关闭
            </Button>
            <Button variant="primary" icon={<Printer size={14} />} onClick={() => window.print()}>
              打印
            </Button>
          </>
        }
      >
        {/* 打印内容 */}
        <div style={{
          background: s.white,
          padding: 32,
          fontFamily: 'SimSun, "宋体", serif',
          fontSize: 14,
          lineHeight: 1.8,
          color: '#000',
        }}>
          {/* 报告标题 */}
          <div style={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            color: s.primary,
          }}>
            放射科检查报告
          </div>

          {/* 患者信息 */}
          <div style={{
            border: '1px solid #000',
            padding: 12,
            marginBottom: 16,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>姓名：</span>
                {selectedExam.patientName}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>性别：</span>
                {selectedExam.gender}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>年龄：</span>
                {selectedExam.age}岁
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>类型：</span>
                {selectedExam.patientType}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>检查项目：</span>
                {selectedExam.examItemName}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>检查日期：</span>
                {selectedExam.examDate}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 'bold' }}>临床诊断：</span>
              {selectedExam.clinicalDiagnosis || '-'}
            </div>
          </div>

          {/* 检查所见 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 15,
              marginBottom: 8,
              borderBottom: '1px solid #000',
              paddingBottom: 4,
            }}>
              检查所见：
            </div>
            <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
              {findings || '（未填写）'}
            </div>
          </div>

          {/* 诊断意见 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 15,
              marginBottom: 8,
              borderBottom: '1px solid #000',
              paddingBottom: 4,
            }}>
              诊断意见：
            </div>
            <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
              {diagnosis || '（未填写）'}
            </div>
          </div>

          {/* 印象 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 15,
              marginBottom: 8,
              borderBottom: '1px solid #000',
              paddingBottom: 4,
            }}>
              印象：
            </div>
            <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
              {impressions.filter(i => i.trim()).join('\n') || '（未填写）'}
            </div>
          </div>

          {/* 建议 */}
          {recommendations && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: 15,
                marginBottom: 8,
                borderBottom: '1px solid #000',
                paddingBottom: 4,
              }}>
                建议：
              </div>
              <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
                {recommendations}
              </div>
            </div>
          )}

          {/* 签名区 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingTop: 16,
            borderTop: '1px solid #ccc',
          }}>
            <div>
              <div>报告医生：{currentDoctor?.name || '-'}</div>
              <div style={{ marginTop: 8 }}>报告日期：{reportDateTime}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>审核医生：{auditorId ? doctors.find(d => d.id === auditorId)?.name : '-'}</div>
              <div style={{ marginTop: 8 }}>打印时间：{formatDateTime()}</div>
            </div>
          </div>

          {/* 危急值提示 */}
          {criticalFinding && (
            <div style={{
              marginTop: 20,
              padding: 12,
              background: '#fff0f0',
              border: '2px solid #dc2626',
              borderRadius: 4,
            }}>
              <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: 4 }}>
                ⚠️ 危急值通知
              </div>
              <div>{criticalDetails}</div>
            </div>
          )}
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // 渲染：图像查看器模态框
  // ----------------------------------------
  const renderImageViewer = () => {
    if (!showImageViewer || !selectedExam) return null

    return (
      <Modal
        open={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        title={`图像查看 - ${selectedExam.examItemName}`}
        width={900}
      >
        <div>
          {/* 工具栏 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            padding: '8px 12px',
            background: s.gray50,
            borderRadius: s.radius,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {WWWL_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleWwlChange(preset)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: s.radiusSm,
                    border: `1px solid ${currentWwlPreset.label === preset.label ? preset.color : s.gray200}`,
                    background: currentWwlPreset.label === preset.label ? `${preset.color}15` : s.white,
                    color: currentWwlPreset.label === preset.label ? preset.color : s.gray600,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: s.gray500 }}>
                WW: {windowWidth} | WL: {windowLevel}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw size={12} />}
                onClick={() => setZoomLevel(1)}
              >
                重置
              </Button>
            </div>
          </div>

          {/* 主图像 */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              width: '90%',
              height: '90%',
              background: `repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              )`,
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: s.radiusSm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ opacity: 0.7 }}>
                <ellipse cx="100" cy="75" rx="70" ry="60" fill="#4a4a6a" />
                <ellipse cx="100" cy="75" rx="50" ry="45" fill="#3a3a5a" />
                <ellipse cx="85" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="115" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="100" cy="85" rx="15" ry="10" fill="#5a5a7a" />
              </svg>

              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedExam.modality}
              </div>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedImageIndex + 1}/{imageCount}
              </div>
            </div>
          </div>

          {/* 序列选择 */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}>
            {imageCount > 0 ? (
              Array.from({ length: Math.min(imageCount, 16) }).map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: 64,
                    height: 48,
                    flexShrink: 0,
                    background: `linear-gradient(135deg, #2a2a4a, #3a3a6a)`,
                    borderRadius: s.radiusSm,
                    border: `2px solid ${selectedImageIndex === idx ? s.primary : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: s.fontMono,
                  }}
                >
                  {idx + 1}
                </div>
              ))
            ) : (
              <div style={{ color: s.gray400, fontSize: 12 }}>无图像数据</div>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  // ========================================
  // 主渲染
  // ========================================
  return (
    <div style={{
      minHeight: '100vh',
      background: s.gray50,
      padding: 20,
    }}>
      {/* 页面头部 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        maxWidth: 1600,
        margin: '0 auto 20px',
      }}>
        <div>
          <h1 style={{
            fontSize: 20,
            fontWeight: 800,
            color: s.primary,
            margin: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Stethoscope size={22} />
            报告书写
          </h1>
          <p style={{ fontSize: 12, color: s.gray500, margin: 0 }}>
            模板填充 · 词库辅助输入 · 危急值标注 · 电子签名
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="outline"
            size="md"
            icon={<Bell size={14} />}
          >
            待处理: {pendingExams.length}
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{
        display: 'flex',
        gap: 16,
        maxWidth: 1600,
        margin: '0 auto',
      }}>
        {/* 左侧面板 */}
        <div style={{
          width: leftPanelWidth,
          flexShrink: 0,
        }}>
          {/* 待报告检查列表 */}
          {(!selectedExamId || showExamList) && (
            <Card
              title={`待书写报告（${filteredPendingExams.length}）`}
              icon={<ClipboardList size={14} />}
              extra={
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* 模态筛选 */}
                  <select
                    value={modalityFilter}
                    onChange={e => setModalityFilter(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radiusSm,
                      fontSize: 11,
                      background: s.white,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">全部模态</option>
                    <option value="CT">CT</option>
                    <option value="MR">MR</option>
                    <option value="DR">DR</option>
                    <option value="DSA">DSA</option>
                  </select>
                </div>
              }
            >
              {/* 搜索框 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: s.gray50,
                borderRadius: s.radius,
                padding: '8px 12px',
                marginBottom: 14,
                border: `1px solid ${s.gray200}`,
              }}>
                <Search size={14} style={{ color: s.gray400 }} />
                <input
                  value={examSearch}
                  onChange={e => setExamSearch(e.target.value)}
                  placeholder="搜索患者姓名 / Accession / 检查项目..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    background: 'transparent',
                    width: '100%',
                    color: s.gray700,
                  }}
                />
                {examSearch && (
                  <button
                    onClick={() => setExamSearch('')}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: s.gray400,
                      display: 'flex',
                      padding: 2,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* 统计信息 */}
              <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 14,
              }}>
                <div style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: s.infoBg,
                  borderRadius: s.radius,
                  fontSize: 11,
                  color: s.info,
                }}>
                  <span style={{ fontWeight: 700 }}>{pendingExams.length}</span> 待报告
                </div>
                <div style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: s.dangerBg,
                  borderRadius: s.radius,
                  fontSize: 11,
                  color: s.danger,
                }}>
                  <span style={{ fontWeight: 700 }}>0</span> 危急值
                </div>
              </div>

              {/* 检查列表 */}
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {filteredPendingExams.length > 0 ? (
                  filteredPendingExams.map(exam => renderExamItem(exam))
                ) : (
                  <div style={{
                    padding: 40,
                    textAlign: 'center',
                    color: s.gray400,
                  }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>暂无待报告的检查</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>所有报告已处理完毕</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 报告表单 */}
          {selectedExamId && (
            <>
              {renderReportForm()}
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft size={12} />}
                onClick={() => {
                  setSelectedExamId('')
                  setShowExamList(true)
                }}
                style={{ marginTop: 12 }}
              >
                返回检查列表
              </Button>
            </>
          )}
        </div>

        {/* 右侧面板 */}
        <div style={{
          width: rightPanelWidth,
          flexShrink: 0,
        }}>
          {selectedExamId ? (
            renderRightPanel()
          ) : (
            <div style={{
              background: s.white,
              borderRadius: s.radiusLg,
              border: `1px solid ${s.gray200}`,
              padding: 40,
              textAlign: 'center',
            }}>
              <FileText size={48} style={{ color: s.gray200, margin: '0 auto 16px' }} />
              <p style={{ fontSize: 14, color: s.gray500, margin: 0 }}>
                选择左侧检查开始书写报告
              </p>
              <p style={{ fontSize: 12, color: s.gray300, marginTop: 8 }}>
                或从模板库选择已有模板
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 模态框 */}
      {renderTemplateModal()}
      {renderPrintPreview()}
      {renderImageViewer()}
    </div>
  )
}
